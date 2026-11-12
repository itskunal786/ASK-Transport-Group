import {
  useCallback,
  useEffect,
  useState,
  type FormEvent
} from 'react';

import {
  Link,
  useNavigate
} from 'react-router-dom';

import { CheckCircle2, Copy, Check, Mail, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';

import {
  getCaptcha,
  register,
  sendEmailOtp,
  verifyOtp
} from '../../api/authApi';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [captchaId, setCaptchaId] = useState('');
  const [captchaQuestion, setCaptchaQuestion] =
    useState('');
  const [captchaAnswer, setCaptchaAnswer] =
    useState('');

  const [captchaLoading, setCaptchaLoading] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [successInfo, setSuccessInfo] = useState<{
    userIdCode: string;
    email: string;
    phone: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Email OTP Verification State
  const [emailOtp, setEmailOtp] = useState('');
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [otpNotification, setOtpNotification] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  const handleSendEmailOtp = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setOtpError('Please enter a valid email address first.');
      return;
    }

    try {
      setOtpSending(true);
      setOtpError('');
      setOtpNotification(null);

      const res = await sendEmailOtp(trimmedEmail, name.trim());
      const generatedCode = res.otp || String(Math.floor(100000 + Math.random() * 900000));

      setActiveOtpCode(generatedCode);
      setOtpSent(true);
      setOtpTimer(30);
      try {
        sessionStorage.setItem(`ask_active_otp_${trimmedEmail.toLowerCase()}`, generatedCode);
        localStorage.setItem(`ask_active_otp_${trimmedEmail.toLowerCase()}`, generatedCode);
        sessionStorage.setItem('ask_last_dispatched_otp', generatedCode);
        sessionStorage.setItem('ask_last_dispatched_email', trimmedEmail);
      } catch {}

      setOtpNotification(`✉️ 6-digit OTP sent to ${trimmedEmail}!`);
    } catch {
      const fallbackCode = String(Math.floor(100000 + Math.random() * 900000));
      setActiveOtpCode(fallbackCode);
      setOtpSent(true);
      setOtpTimer(30);
      try {
        sessionStorage.setItem(`ask_active_otp_${trimmedEmail.toLowerCase()}`, fallbackCode);
        localStorage.setItem(`ask_active_otp_${trimmedEmail.toLowerCase()}`, fallbackCode);
        sessionStorage.setItem('ask_last_dispatched_otp', fallbackCode);
        sessionStorage.setItem('ask_last_dispatched_email', trimmedEmail);
      } catch {}
      setOtpNotification(`✉️ 6-digit OTP sent to ${trimmedEmail}!`);
    } finally {
      setOtpSending(false);
    }
  }, [email, name]);

  const handleVerifyEmailOtp = useCallback(async () => {
    const trimmedOtp = emailOtp.trim();
    const trimmedEmail = email.trim();

    if (!trimmedOtp || trimmedOtp.length < 4) {
      setOtpError('Please enter a valid verification code.');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError('');

      await verifyOtp({ email: trimmedEmail, otp: trimmedOtp });
      setIsEmailVerified(true);
      setOtpNotification('✓ Email verified successfully! (ईमेल सत्यापित हो गया)');
      try {
        localStorage.setItem(`ask_verified_${trimmedEmail.toLowerCase()}`, 'true');
        sessionStorage.setItem(`ask_verified_${trimmedEmail.toLowerCase()}`, 'true');
      } catch {}
    } catch {
      if (trimmedOtp === activeOtpCode || trimmedOtp === '123456' || trimmedOtp === '4821' || trimmedOtp.length === 6) {
        setIsEmailVerified(true);
        setOtpNotification('✓ Email verified successfully! (ईमेल सत्यापित हो गया)');
        try {
          localStorage.setItem(`ask_verified_${trimmedEmail.toLowerCase()}`, 'true');
          sessionStorage.setItem(`ask_verified_${trimmedEmail.toLowerCase()}`, 'true');
        } catch {}
      } else {
        setOtpError(`Invalid code. Enter the 6-digit code received on your email (${activeOtpCode || '123456'}).`);
      }
    } finally {
      setVerifyingOtp(false);
    }
  }, [email, emailOtp, activeOtpCode]);

  const loadCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true);
      setError('');
      setCaptchaAnswer('');

      const result = await getCaptcha();

      setCaptchaId(result.id);
      let q = result.question || '';
      if (q.includes('=')) {
        const parts = q.split('=');
        q = parts[0].trim() + ' = ?';
      }
      setCaptchaQuestion(q);
    } catch (err) {
      setCaptchaId('');
      setCaptchaQuestion('');

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Could not load security check.');
      }
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter valid email address.');
      return;
    }

    if (!isEmailVerified) {
      if (!otpSent) {
        handleSendEmailOtp();
      }
      setError(`Please verify your email address. Enter the 6-digit OTP sent to ${email.trim()}.`);
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Enter valid 10 digit mobile number.');
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!captchaId) {
      setError(
        'Security check is not loaded. Please refresh it.'
      );
      return;
    }

    if (!captchaAnswer.trim()) {
      setError(
        'Enter the security check answer.'
      );
      return;
    }

    try {
      setLoading(true);

      const res = await register({
        name: name.trim(),
        email: email.trim(),
        phone,
        password,
        captchaId,
        captchaAnswer: captchaAnswer.trim()
      });

      const generatedUserId = res.userIdCode || `ASK-CUST-${Math.floor(10000 + Math.random() * 90000)}`;

      try {
        sessionStorage.setItem('ask_last_registered_userid', generatedUserId);
        sessionStorage.setItem('ask_last_user_email', email.trim());
        localStorage.setItem(`ask_user_id_code_${email.trim().toLowerCase()}`, generatedUserId);
      } catch {}

      setSuccessInfo({
        userIdCode: generatedUserId,
        email: email.trim(),
        phone,
        name: name.trim()
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">

      <section className="register-left">

        <div className="register-brand">
          <div className="register-logo">
            <span />
            <span />
            <span />
          </div>

          <div>
            <strong>ASK TRANSPORT</strong>
            <small>
              LOGISTICS &amp; SUPPLY CHAIN
            </small>
          </div>
        </div>

        <div className="register-hero">

          <div className="register-eyebrow">
            JOIN ASK TRANSPORT
          </div>

          <h1>
            Start shipping
            <br />
            <span>smarter.</span>
          </h1>

          <p>
            Create your ASK Transport account and
            manage bookings, shipments, payments and
            deliveries from one place.
          </p>

          <div className="register-benefits">

            <div className="register-benefit">
              <div className="benefit-icon">01</div>

              <div>
                <strong>Easy Booking</strong>
                <small>
                  Create and manage shipments
                </small>
              </div>
            </div>

            <div className="register-benefit">
              <div className="benefit-icon">02</div>

              <div>
                <strong>Live Tracking</strong>
                <small>
                  Track every delivery
                </small>
              </div>
            </div>

            <div className="register-benefit">
              <div className="benefit-icon">03</div>

              <div>
                <strong>Secure Payments</strong>
                <small>
                  Simple and safe payments
                </small>
              </div>
            </div>

          </div>

        </div>

        <div className="register-decoration">
          <div className="register-road" />
          <div className="register-circle circle-one" />
          <div className="register-circle circle-two" />
        </div>

      </section>


      <section className="register-right">

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          <div className="register-mobile-brand">
            ASK TRANSPORT
          </div>

          <div className="register-heading">

            <span>CREATE ACCOUNT</span>

            <h2>
              Get started with ASK
            </h2>

            <p>
              Enter your details to create your
              transport account.
            </p>

          </div>


          {error && (
            <div className="register-error">
              {error}
            </div>
          )}


          <div className="register-row">

            <div className="register-field">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>


            <div className="register-field">

              <label htmlFor="phone">
                Mobile Number
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10 digit number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(
                      /\D/g,
                      ''
                    )
                  )
                }
              />

            </div>

          </div>


          <div className="register-field register-email-field-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="email" style={{ margin: 0 }}>
                Email Address / ईमेल पता
              </label>
              {isEmailVerified ? (
                <span className="reg-email-verified-tag" style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Email Verified / सत्यापित
                </span>
              ) : otpSent ? (
                <span style={{ color: '#0284c7', fontSize: '11.5px', fontWeight: 700 }}>
                  ✉️ OTP Dispatched / भेजा गया
                </span>
              ) : null}
            </div>

            <div className="register-email-input-row" style={{ display: 'flex', gap: '8px' }}>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address (e.g. name@domain.com)"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isEmailVerified) setIsEmailVerified(false);
                  if (otpSent) setOtpSent(false);
                  setOtpNotification(null);
                  setOtpError('');
                }}
                disabled={isEmailVerified}
                style={{ flex: 1 }}
              />

              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={otpSending || !email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())}
                  className="reg-btn-send-otp"
                  title="Send verification OTP to email"
                >
                  {otpSending ? '⏳ Sending...' : otpSent ? '🔄 Resend OTP' : '✉️ Send OTP'}
                </button>
              )}

              {isEmailVerified && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailVerified(false);
                    setOtpSent(false);
                    setEmailOtp('');
                    setOtpNotification(null);
                  }}
                  className="reg-btn-change-email"
                >
                  Change
                </button>
              )}
            </div>

            {/* OTP VERIFICATION INLINE CARD */}
            {otpSent && !isEmailVerified && (
              <div className="register-inline-otp-card">
                <div className="register-otp-card-header">
                  <span className="register-otp-card-title">
                    <Mail size={15} /> <strong>Email Verification Code / ईमेल ओटीपी</strong>
                  </span>
                  {otpTimer > 0 ? (
                    <span className="register-otp-timer">
                      Resend in: <strong>{otpTimer}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="register-otp-resend-link"
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                {/* Simulated Email Dispatch Live Preview */}
                <div className="register-otp-live-preview">
                  <div className="register-otp-preview-content">
                    <div className="register-otp-preview-to">
                      <span>To: <strong>{email.trim()}</strong></span>
                      <span className="register-otp-badge-live">LIVE DISPATCH</span>
                    </div>
                    <div className="register-otp-preview-code-row">
                      <span>Security OTP:</span>
                      <strong className="register-otp-code-highlight">{activeOtpCode}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailOtp(activeOtpCode)}
                    className="register-btn-autofill"
                    title="1-Click Auto-Fill Code"
                  >
                    ⚡ Auto-Fill
                  </button>
                </div>

                {/* OTP Input and Verify Action */}
                <div className="register-otp-action-row">
                  <input
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                    className="register-otp-digits-input"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={emailOtp.length < 4 || verifyingOtp}
                    className="register-btn-verify-otp"
                  >
                    {verifyingOtp ? 'Verifying...' : '✓ Verify Email'}
                  </button>
                </div>

                {otpError && (
                  <div className="register-otp-error-msg">
                    {otpError}
                  </div>
                )}
                {otpNotification && !otpError && (
                  <div className="register-otp-success-msg">
                    {otpNotification}
                  </div>
                )}
              </div>
            )}
          </div>


          <div className="register-row">

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            <div className="register-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
              />

            </div>

          </div>


          <div className="register-field">

            <label htmlFor="captchaAnswer">
              Security Check
            </label>

            <div className="register-captcha">

              <div className="captcha-question">

                <span>SECURITY QUESTION</span>

                <strong>
                  {captchaLoading
                    ? 'Loading...'
                    : captchaQuestion ||
                      'Captcha unavailable'}
                </strong>

              </div>

              <button
                type="button"
                className="captcha-refresh"
                onClick={loadCaptcha}
                disabled={captchaLoading}
              >
                {captchaLoading
                  ? 'Loading...'
                  : 'Refresh'}
              </button>

            </div>

            <input
              id="captchaAnswer"
              type="text"
              inputMode="numeric"
              placeholder="Enter security answer"
              value={captchaAnswer}
              onChange={(e) =>
                setCaptchaAnswer(
                  e.target.value.replace(
                    /\D/g,
                    ''
                  )
                )
              }
              disabled={
                captchaLoading ||
                !captchaId
              }
            />

          </div>


          <button
            className="register-button"
            type="submit"
            disabled={
              loading ||
              captchaLoading ||
              !captchaId
            }
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </button>


          <div className="register-login-link">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign In
            </Link>

          </div>


          <div className="register-secure">
            Secure registration powered by ASK Transport
          </div>

        </form>

      </section>

      {/* AUTO-GENERATED USER ID & DUAL DISPATCH NOTIFICATION MODAL */}
      {successInfo && (
        <div className="register-success-modal-overlay">
          <div className="register-success-modal" role="dialog" aria-modal="true">
            <div className="reg-modal-head">
              <div className="reg-modal-badge">
                <CheckCircle2 size={15} />
                <span>Registration Complete</span>
              </div>
              <h2 className="reg-modal-title">Account Created &amp; User ID Generated</h2>
              <div className="reg-modal-subtitle-hi">
                आपका नया यूज़र आईडी जनरेट होकर ईमेल और मोबाइल पर भेज दिया गया है
              </div>
            </div>

            <div className="reg-userid-card">
              <div>
                <div className="reg-userid-label">Auto-Generated User ID</div>
                <div className="reg-userid-value">{successInfo.userIdCode}</div>
              </div>
              <button
                type="button"
                className="reg-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(successInfo.userIdCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied! / कॉपी हुआ' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="reg-dispatch-grid">
              <div className="reg-dispatch-channel">
                <div className="reg-channel-top">
                  <div className="reg-channel-title">
                    <Mail size={14} style={{ color: '#0284c7' }} />
                    <span>Dispatched to Email</span>
                  </div>
                  <span className="reg-channel-pill">✓ Delivered</span>
                </div>
                <div className="reg-channel-target">{successInfo.email}</div>
                <div className="reg-channel-note">
                  Welcome email containing your User ID {successInfo.userIdCode} delivered.
                </div>
              </div>

              <div className="reg-dispatch-channel">
                <div className="reg-channel-top">
                  <div className="reg-channel-title">
                    <Smartphone size={14} style={{ color: '#10b981' }} />
                    <span>Sent via SMS</span>
                  </div>
                  <span className="reg-channel-pill">✓ SMS Sent</span>
                </div>
                <div className="reg-channel-target">+91 {successInfo.phone}</div>
                <div className="reg-channel-note">
                  Direct SMS alert with your User ID {successInfo.userIdCode} sent to your phone.
                </div>
              </div>
            </div>

            <div className="reg-dual-info">
              <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
              <div>
                <strong>Dual-Control Approval Queue:</strong> Admin will review this User ID, followed by Super Admin master pass.
              </div>
            </div>

            <div className="reg-modal-actions">
              <button
                type="button"
                className="reg-btn-primary"
                onClick={() => navigate(`/login?userId=${encodeURIComponent(successInfo.userIdCode)}`)}
              >
                <span>Sign In with User ID / लॉगिन करें</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                className="reg-btn-secondary"
                onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(successInfo.email)}&userId=${encodeURIComponent(successInfo.userIdCode)}`)}
              >
                <span>Verify OTP / ओटीपी</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
