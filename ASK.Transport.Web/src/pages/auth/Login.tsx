import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const [loginRole, setLoginRole] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('portal=admin')) {
      return 'admin';
    }
    return 'customer';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('expired=1')) {
      return 'Your session has expired. Please sign in again to continue.';
    }
    return '';
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Strict role-portal enforcement
      if (loginRole === 'customer') {
        if (user.role === 'Admin' || user.role === 'SuperAdmin') {
          await logout();
          setError(
            '⚠️ Yeh Customer Portal hai. Admin ya Super Admin accounts yahan login nahi kar sakte. Kripya upar "Admin / Super Admin" tab select karke login karein.'
          );
          return;
        }
        navigate('/dashboard');
      } else {
        // loginRole === 'admin'
        if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
          await logout();
          setError(
            '⛔ Access Denied: Yeh Administrative Portal hai. Customer / Shipper accounts yahan se login nahi kar sakte. Kripya upar "Customer Login" tab select karein.'
          );
          return;
        }
        navigate('/admin');
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

          {/* Role Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setLoginRole('customer');
                setError('');
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: loginRole === 'customer' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: loginRole === 'customer' ? 'rgba(2, 132, 199, 0.1)' : '#ffffff',
                color: loginRole === 'customer' ? '#0284c7' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              👤 Customer Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('admin');
                setError('');
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: loginRole === 'admin' ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                background: loginRole === 'admin' ? 'rgba(245, 158, 11, 0.12)' : '#ffffff',
                color: loginRole === 'admin' ? '#b45309' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🛡️ Admin / Super Admin
            </button>
          </div>

          <div className="form-heading">

            <span>{loginRole === 'admin' ? 'ADMIN & SUPER ADMIN PORTAL' : 'CUSTOMER PORTAL'}</span>

            <h2>{loginRole === 'admin' ? 'Staff & Administrator Sign In' : 'Sign in to your account'}</h2>

            <p>
              {loginRole === 'admin'
                ? 'Enter administrator credentials to access central operations deck. (Customer accounts cannot login here).'
                : 'Enter your registered customer email and password. (Admin & Super Admin accounts cannot login here).'}
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
                placeholder={loginRole === 'admin' ? 'admin@asktransport.com' : 'you@company.com'}
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
