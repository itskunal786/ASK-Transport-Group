using ASK.Group.Api.Data;
using ASK.Group.Api.DTOs;
using ASK.Group.Api.Models;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AskTransportDbContext _db;
    private readonly JwtService _jwtService;
    private readonly EmailService _emailService;
    private readonly IWebHostEnvironment _environment;
    private readonly LoginSecurityService _loginSecurityService;
    private readonly AuditService _auditService;
    private readonly RefreshTokenService _refreshTokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        AskTransportDbContext db,
        JwtService jwtService,
        EmailService emailService,
        IWebHostEnvironment environment,
        LoginSecurityService loginSecurityService,
        AuditService auditService,
        RefreshTokenService refreshTokenService,
        IConfiguration configuration)
    {
        _db = db;
        _jwtService = jwtService;
        _emailService = emailService;
        _environment = environment;
        _loginSecurityService = loginSecurityService;
        _auditService = auditService;
        _refreshTokenService = refreshTokenService;
        _configuration = configuration;
    }

    // =========================================================
    // CAPTCHA
    // =========================================================

    [HttpGet("captcha")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCaptcha()
    {
        var now = DateTime.UtcNow;

        var expiredCaptchas =
            await _db.Captchas
                .Where(x => x.ExpiresAt < now)
                .ToListAsync();

        if (expiredCaptchas.Count > 0)
        {
            _db.Captchas.RemoveRange(
                expiredCaptchas);
        }

        var first =
            Random.Shared.Next(1, 10);

        var second =
            Random.Shared.Next(1, 10);

        var captchaId =
            Guid.NewGuid().ToString();

        var captcha =
            new CaptchaChallenge
            {
                Id = captchaId,
                Answer =
                    (first + second).ToString(),

                ExpiresAt =
                    DateTime.UtcNow
                        .AddMinutes(5)
            };

        _db.Captchas.Add(captcha);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = captchaId,

            question =
                $"{first} + {second} = ?",

            expiresInSeconds = 300
        });
    }

    // =========================================================
    // REGISTER
    // =========================================================

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var exists =
            await _db.Users
                .AnyAsync(x =>
                    x.Email == email);

        if (exists)
        {
            return BadRequest(new
            {
                message =
                    "Email already registered"
            });
        }

        var captcha =
            await _db.Captchas
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    request.CaptchaId);

        if (captcha == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid captcha"
            });
        }

        if (captcha.ExpiresAt <
            DateTime.UtcNow)
        {
            _db.Captchas.Remove(captcha);

            await _db.SaveChangesAsync();

            return BadRequest(new
            {
                message =
                    "Captcha expired"
            });
        }

        if (captcha.Answer !=
            request.CaptchaAnswer.Trim())
        {
            return BadRequest(new
            {
                message =
                    "Incorrect captcha"
            });
        }

        var user =
            new AppUser
            {
                Name =
                    request.Name.Trim(),

                Email =
                    email,

                Phone =
                    request.Phone.Trim(),

                PasswordHash =
                    BCrypt.Net.BCrypt
                        .HashPassword(
                            request.Password),

                Role =
                    UserRole.User,

                IsVerified =
                    false,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow
            };

        _db.Users.Add(user);

        _db.Captchas.Remove(captcha);

        /*
         * Important:
         * Save user first so SQL Server generates user.Id.
         */
        await _db.SaveChangesAsync();

        // Assign default Customer RBAC role.
        var customerRole =
            await _db.AppRoles
                .FirstOrDefaultAsync(x =>
                    x.Name ==
                        "Customer" &&
                    x.IsActive);

        if (customerRole != null)
        {
            var alreadyAssigned =
                await _db
                    .UserRoleAssignments
                    .AnyAsync(x =>
                        x.UserId ==
                            user.Id &&
                        x.RoleId ==
                            customerRole.Id);

            if (!alreadyAssigned)
            {
                _db.UserRoleAssignments.Add(
                    new UserRoleAssignment
                    {
                        UserId =
                            user.Id,

                        RoleId =
                            customerRole.Id,

                        CreatedAt =
                            DateTime.UtcNow
                    });

                await _db.SaveChangesAsync();
            }
        }

        var otp =
            CreateOtp(
                user.Id);

        _db.OtpCodes.Add(otp);

        await _db.SaveChangesAsync();

        await TrySendOtpEmail(
            user.Email,
            user.Name,
            otp.Code);

        await _auditService.LogAsync(
            "REGISTER",
            "New user registered",
            user.Id,
            user.Email);

        if (_environment.IsDevelopment())
        {
            return Ok(new
            {
                message =
                    "Registration successful. Verify OTP.",

                userId =
                    user.Id,

                email =
                    user.Email,

                otp =
                    otp.Code
            });
        }

        return Ok(new
        {
            message =
                "Registration successful. OTP sent.",

            userId =
                user.Id,

            email =
                user.Email
        });
    }

    // =========================================================
    // VERIFY OTP
    // =========================================================

    [HttpPost("verify-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> VerifyOtp(
        VerifyOtpRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Email == email);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (user.IsVerified)
        {
            return Ok(new
            {
                message =
                    "Account is already verified"
            });
        }

        var otp =
            await _db.OtpCodes
                .Where(x =>
                    x.UserId ==
                        user.Id &&
                    !x.Used)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .FirstOrDefaultAsync();

        if (otp == null)
        {
            return BadRequest(new
            {
                message =
                    "OTP not found"
            });
        }

        if (otp.ExpiresAt <
            DateTime.UtcNow)
        {
            otp.Used =
                true;

            await _db.SaveChangesAsync();

            return BadRequest(new
            {
                message =
                    "OTP expired"
            });
        }

        if (otp.Code !=
            request.Otp.Trim())
        {
            return BadRequest(new
            {
                message =
                    "Invalid OTP"
            });
        }

        otp.Used =
            true;

        user.IsVerified =
            true;

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "OTP_VERIFIED",
            "User account verified",
            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                "OTP verified successfully"
        });
    }

    // =========================================================
    // RESEND OTP
    // =========================================================

    [HttpPost("resend-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResendOtp(
        ResendOtpRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Email == email);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        if (user.IsVerified)
        {
            return BadRequest(new
            {
                message =
                    "Account is already verified"
            });
        }

        var oldOtps =
            await _db.OtpCodes
                .Where(x =>
                    x.UserId ==
                        user.Id &&
                    !x.Used)
                .ToListAsync();

        foreach (var oldOtp in oldOtps)
        {
            oldOtp.Used =
                true;
        }

        var otp =
            CreateOtp(
                user.Id);

        _db.OtpCodes.Add(otp);

        await _db.SaveChangesAsync();

        await TrySendOtpEmail(
            user.Email,
            user.Name,
            otp.Code);

        if (_environment.IsDevelopment())
        {
            return Ok(new
            {
                message =
                    "OTP generated successfully",

                otp =
                    otp.Code
            });
        }

        return Ok(new
        {
            message =
                "OTP sent successfully"
        });
    }

    // =========================================================
    // LOGIN
    // =========================================================

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(
        LoginRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var ipAddress =
            HttpContext.Connection
                .RemoteIpAddress?
                .ToString();

        var blocked =
            await _loginSecurityService
                .IsBlockedAsync(
                    email,
                    ipAddress);

        if (blocked)
        {
            return StatusCode(
                StatusCodes
                    .Status429TooManyRequests,
                new
                {
                    message =
                        "Too many failed login attempts. Try again later."
                });
        }

        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Email == email);

        if (user == null)
        {
            await _loginSecurityService
                .RecordAttemptAsync(
                    email,
                    ipAddress,
                    false);

            return Unauthorized(new
            {
                message =
                    "Invalid email or password"
            });
        }

        if (!user.IsActive)
        {
            await _loginSecurityService
                .RecordAttemptAsync(
                    email,
                    ipAddress,
                    false);

            return Unauthorized(new
            {
                message =
                    "Account is disabled"
            });
        }

        var validPassword =
            BCrypt.Net.BCrypt.Verify(
                request.Password,
                user.PasswordHash);

        if (!validPassword)
        {
            await _loginSecurityService
                .RecordAttemptAsync(
                    email,
                    ipAddress,
                    false);

            return Unauthorized(new
            {
                message =
                    "Invalid email or password"
            });
        }

        if (!user.IsVerified)
        {
            return Unauthorized(new
            {
                message =
                    "Please verify OTP first"
            });
        }

        await _loginSecurityService
            .RecordAttemptAsync(
                email,
                ipAddress,
                true);

        var accessToken =
            _jwtService
                .GenerateToken(user);

        var refreshToken =
            await _refreshTokenService
                .CreateAsync(
                    user.Id);

        await _auditService.LogAsync(
            "LOGIN_SUCCESS",
            "User logged in successfully",
            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                "Login successful",

            token =
                accessToken,

            refreshToken =
                refreshToken.Token,

            refreshTokenExpiresAt =
                refreshToken.ExpiresAt,

            user = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Phone,

                role =
                    user.Role.ToString(),

                user.IsVerified,
                user.IsActive
            }
        });
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Email == email);

        if (user == null)
        {
            return Ok(new
            {
                message =
                    "If the email exists, an OTP has been sent."
            });
        }

        var oldOtps =
            await _db.OtpCodes
                .Where(x =>
                    x.UserId ==
                        user.Id &&
                    !x.Used)
                .ToListAsync();

        foreach (var oldOtp in oldOtps)
        {
            oldOtp.Used =
                true;
        }

        var otp =
            CreateOtp(
                user.Id);

        _db.OtpCodes.Add(otp);

        await _db.SaveChangesAsync();

        await TrySendOtpEmail(
            user.Email,
            user.Name,
            otp.Code);

        await _auditService.LogAsync(
            "FORGOT_PASSWORD",
            "Password reset OTP requested",
            user.Id,
            user.Email);

        if (_environment.IsDevelopment())
        {
            return Ok(new
            {
                message =
                    "Password reset OTP generated",

                otp =
                    otp.Code
            });
        }

        return Ok(new
        {
            message =
                "If the email exists, an OTP has been sent."
        });
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Email == email);

        if (user == null)
        {
            return BadRequest(new
            {
                message =
                    "Invalid request"
            });
        }

        var otp =
            await _db.OtpCodes
                .Where(x =>
                    x.UserId ==
                        user.Id &&
                    !x.Used)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .FirstOrDefaultAsync();

        if (otp == null)
        {
            return BadRequest(new
            {
                message =
                    "OTP not found"
            });
        }

        if (otp.ExpiresAt <
            DateTime.UtcNow)
        {
            otp.Used =
                true;

            await _db.SaveChangesAsync();

            return BadRequest(new
            {
                message =
                    "OTP expired"
            });
        }

        if (otp.Code !=
            request.Otp.Trim())
        {
            return BadRequest(new
            {
                message =
                    "Invalid OTP"
            });
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt
                .HashPassword(
                    request.NewPassword);

        otp.Used =
            true;

        await _refreshTokenService
            .RevokeAllAsync(
                user.Id);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "PASSWORD_RESET",
            "Password reset successfully",
            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                "Password reset successfully"
        });
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordRequest request)
    {
        var userId =
            GetUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var user =
            await _db.Users
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    userId.Value);

        if (user == null)
        {
            return NotFound(new
            {
                message =
                    "User not found"
            });
        }

        var validPassword =
            BCrypt.Net.BCrypt.Verify(
                request.CurrentPassword,
                user.PasswordHash);

        if (!validPassword)
        {
            return BadRequest(new
            {
                message =
                    "Current password is incorrect"
            });
        }

        if (BCrypt.Net.BCrypt.Verify(
            request.NewPassword,
            user.PasswordHash))
        {
            return BadRequest(new
            {
                message =
                    "New password must be different from current password"
            });
        }

        user.PasswordHash =
            BCrypt.Net.BCrypt
                .HashPassword(
                    request.NewPassword);

        await _refreshTokenService
            .RevokeAllAsync(
                user.Id);

        await _db.SaveChangesAsync();

        await _auditService.LogAsync(
            "PASSWORD_CHANGED",
            "Password changed successfully",
            user.Id,
            user.Email);

        return Ok(new
        {
            message =
                "Password changed successfully. Please login again."
        });
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private OtpCode CreateOtp(
        int userId)
    {
        return new OtpCode
        {
            UserId =
                userId,

            Code =
                Random.Shared
                    .Next(
                        100000,
                        1000000)
                    .ToString(),

            ExpiresAt =
                DateTime.UtcNow
                    .AddMinutes(10),

            Used =
                false,

            CreatedAt =
                DateTime.UtcNow
        };
    }

    private async Task TrySendOtpEmail(
        string email,
        string name,
        string otp)
    {
        try
        {
            await _emailService.SendOtpEmailAsync(
                email,
                name,
                otp);
        }
        catch (Exception ex)
        {
            if (_environment.IsDevelopment())
            {
                Console.WriteLine(
                    $"OTP email could not be sent: {ex.Message}");

                Console.WriteLine(
                    $"Development OTP for {email}: {otp}");

                return;
            }

            throw;
        }
    }

    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
            value,
            out var userId))
        {
            return null;
        }

        return userId;
    }
}
