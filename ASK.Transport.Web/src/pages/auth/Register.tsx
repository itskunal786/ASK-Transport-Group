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

import {
  getCaptcha,
  register
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

  const loadCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true);
      setError('');
      setCaptchaAnswer('');

      const result = await getCaptcha();

      setCaptchaId(result.id);
      setCaptchaQuestion(result.question);
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

      await register({
        name: name.trim(),
        email: email.trim(),
        phone,
        password,
        captchaId,
        captchaAnswer: captchaAnswer.trim()
      });

      navigate(
        '/verify-otp?email=' +
          encodeURIComponent(email.trim())
      );
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


          <div className="register-field">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

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

    </main>
  );
}
