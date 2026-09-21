using ASK.Group.Api.DTOs;
using ASK.Group.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ASK.Group.Api.Controllers;

[ApiController]
[Route("api/client/addresses")]
[Authorize]
public sealed class ClientAddressController : ControllerBase
{
    private readonly ClientAddressService _addressService;

    public ClientAddressController(
        ClientAddressService addressService)
    {
        _addressService = addressService;
    }


    [HttpGet]
    public async Task<IActionResult> GetMyAddresses(
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _addressService.GetMyAddressesAsync(
                userId.Value,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Addresses loaded successfully.",
            data
        });
    }


    [HttpGet("{addressId:int}")]
    public async Task<IActionResult> GetAddress(
        int addressId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _addressService.GetAddressAsync(
                userId.Value,
                addressId,
                cancellationToken);


        if (data == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Address loaded successfully.",
            data
        });
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] SaveClientAddressRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _addressService.CreateAsync(
                userId.Value,
                request,
                cancellationToken);


        return Ok(new
        {
            success = true,
            message = "Address added successfully.",
            data
        });
    }


    [HttpPut("{addressId:int}")]
    public async Task<IActionResult> Update(
        int addressId,
        [FromBody] SaveClientAddressRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var data =
            await _addressService.UpdateAsync(
                userId.Value,
                addressId,
                request,
                cancellationToken);


        if (data == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Address updated successfully.",
            data
        });
    }


    [HttpPut("{addressId:int}/default")]
    public async Task<IActionResult> SetDefault(
        int addressId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var success =
            await _addressService.SetDefaultAsync(
                userId.Value,
                addressId,
                cancellationToken);


        if (!success)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Default address updated successfully."
        });
    }


    [HttpDelete("{addressId:int}")]
    public async Task<IActionResult> Delete(
        int addressId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        if (userId == null)
        {
            return InvalidUser();
        }


        var success =
            await _addressService.DeleteAsync(
                userId.Value,
                addressId,
                cancellationToken);


        if (!success)
        {
            return NotFound(new
            {
                success = false,
                message = "Address not found."
            });
        }


        return Ok(new
        {
            success = true,
            message = "Address deleted successfully."
        });
    }


    private int? GetUserId()
    {
        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(value, out var userId)
            ? userId
            : null;
    }


    private IActionResult InvalidUser()
    {
        return Unauthorized(new
        {
            success = false,
            message = "Invalid user."
        });
    }
}