import { useState, type FormEvent } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams
} from 'react-router-dom';

import {
  resendOtp,
  verifyOtp
} from '../../api/authApi';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') ?? '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!email) {
      setError('Email address is missing.');
      return;
    }

    if (otp.length < 4) {
      setError(
        'Please enter a valid verification code.'
      );
      return;
    }

    try {
      setLoading(true);

      await verifyOtp({
        email,
        otp
      });

      navigate('/login');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'OTP verification failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setError('Email address is missing.');
      return;
    }

    setError('');
    setMessage('');

    try {
      setResending(true);

      const response = await resendOtp(email);

      setMessage(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not resend verification code.'
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="verify-page">

      <section className="verify-left">

        <div className="verify-brand">

          <div className="verify-logo">
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


        <div className="verify-hero">

          <div className="verify-eyebrow">
            SECURE VERIFICATION
          </div>

          <h1>
            One step
            <br />
            <span>to go.</span>
          </h1>

          <p>
            Verify your email address to activate your
            ASK Transport account and start managing
            your shipments.
          </p>


          <div className="verify-points">

            <div>
              <span>01</span>

              <p>
                <strong>Secure Account</strong>
                Your account stays protected.
              </p>
            </div>

            <div>
              <span>02</span>

              <p>
                <strong>Email Verification</strong>
                Confirm your registered email.
              </p>
            </div>

            <div>
              <span>03</span>

              <p>
                <strong>Start Shipping</strong>
                Access your transport dashboard.
              </p>
            </div>

          </div>

        </div>

        <div className="verify-background-circle" />

      </section>


      <section className="verify-right">

        <div className="verify-card">

          <div className="verify-mobile-brand">
            ASK TRANSPORT
          </div>


          <div className="verify-icon">
            <span>@</span>
          </div>


          <div className="verify-heading">

            <span>EMAIL VERIFICATION</span>

            <h2>
              Verify your email
            </h2>

            <p>
              We sent a verification code to
            </p>

            <strong className="verify-email">
              {email || 'Email address not available'}
            </strong>

          </div>


          <div className="verify-info">
            Enter the verification code below to
            activate your ASK Transport account.
          </div>


          {error && (
            <div className="verify-error">
              {error}
            </div>
          )}


          {message && (
            <div className="verify-success">
              {message}
            </div>
          )}


          <form onSubmit={handleSubmit}>

            <div className="verify-field">

              <label htmlFor="otp">
                Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(
                      /\D/g,
                      ''
                    )
                  )
                }
                required
              />

            </div>


            <button
              type="submit"
              className="verify-button"
              disabled={loading}
            >
              {loading
                ? 'Verifying...'
                : 'Verify & Continue'}
            </button>

          </form>


          <div className="verify-resend">

            <span>
              Didn't receive the code?
            </span>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
            >
              {resending
                ? 'Sending...'
                : 'Resend Code'}
            </button>

          </div>


          <div className="verify-divider" />


          <Link
            className="verify-back"
            to="/login"
          >
            Back to Sign In
          </Link>


          <div className="verify-secure">
            Secure verification powered by ASK Transport
          </div>

        </div>

      </section>

    </main>
  );
}
