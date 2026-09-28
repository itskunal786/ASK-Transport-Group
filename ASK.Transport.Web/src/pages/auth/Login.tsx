import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transport-login">

      <section className="transport-hero">

        <div className="transport-brand">
          <div className="brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div>
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS & SUPPLY CHAIN</small>
          </div>
        </div>

        <div className="hero-content">

          <div className="hero-tag">
            SMARTER LOGISTICS. STRONGER BUSINESS.
          </div>

          <h1>
            Move your
            <br />
            business
            <br />
            <span>forward.</span>
          </h1>

          <p>
            Book shipments, track deliveries, manage invoices
            and stay connected with your logistics operations.
          </p>

          <div className="hero-services">

            <div className="service">
              <div className="service-icon">
                <span className="box-icon"></span>
              </div>

              <div>
                <strong>Book</strong>
                <small>Shipments</small>
              </div>
            </div>

            <div className="service">
              <div className="service-icon">
                <span className="track-icon"></span>
              </div>

              <div>
                <strong>Track</strong>
                <small>Deliveries</small>
              </div>
            </div>

            <div className="service">
              <div className="service-icon">
                <span className="invoice-icon"></span>
              </div>

              <div>
                <strong>Manage</strong>
                <small>Invoices</small>
              </div>
            </div>

          </div>

        </div>

        <div className="network-map">
          <i></i><i></i><i></i><i></i><i></i>
          <i></i><i></i><i></i><i></i><i></i>
          <i></i><i></i><i></i><i></i><i></i>
          <i></i><i></i><i></i><i></i><i></i>
        </div>

        <div className="truck-scene">

          <div className="truck-road">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="css-truck">

            <div className="truck-body">
              <div className="truck-brand">
                ASK
                <small>TRANSPORT</small>
              </div>
            </div>

            <div className="truck-front">
              <div className="truck-window"></div>
            </div>

            <div className="truck-wheel wheel-left"></div>
            <div className="truck-wheel wheel-right"></div>

          </div>

        </div>

      </section>


      <section className="login-panel">

        <form
          className="transport-form"
          onSubmit={handleSubmit}
        >

          <div className="mobile-logo">
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS & SUPPLY CHAIN</small>
          </div>

          <div className="form-heading">

            <span>WELCOME BACK</span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your registered email and password
              to continue.
            </p>

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-field">

            <label htmlFor="email">
              Email Address
            </label>

            <div className="field-control">

              <span className="mail-icon"></span>

              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

          </div>


          <div className="login-field">

            <div className="password-row">

              <label htmlFor="password">
                Password
              </label>

              <Link to="/forgot-password">
                Forgot Password?
              </Link>

            </div>

            <div className="field-control">

              <span className="lock-icon"></span>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

            </div>

          </div>


          <button
            className="signin-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>


          <div className="create-account">
            <span>New to ASK Transport?</span>

            <Link to="/register">
              Create an account
            </Link>
          </div>


          <div className="secure-login">
            <span className="secure-dot"></span>
            Secure login powered by ASK Transport
          </div>

        </form>

      </section>

    </div>
  );
}
