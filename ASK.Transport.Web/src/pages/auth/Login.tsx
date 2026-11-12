import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginRole, setLoginRole] = useState<'customer' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('portal=admin')) {
      return 'admin';
    }
    return 'customer';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const uid = params.get('userId') || params.get('prefill') || '';
      if (uid) return uid;
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (search.includes('reason=inactivity')) {
        return '🔒 Session Expired: You were automatically signed out due to 15 minutes of inactivity. Please sign in again to resume.';
      }
      if (search.includes('reason=closed') || search.includes('reason=relogin')) {
        return '🔒 Session Ended: Browser tab/window was closed. Please sign in to access your portal.';
      }
      if (search.includes('expired=1')) {
        return 'Your session has expired. Please sign in again to continue.';
      }
    }
    return '';
  });
  const [loading, setLoading] = useState(false);

  const lastKnownEmail = typeof window !== 'undefined' ? sessionStorage.getItem('ask_last_user_email') : null;
  const lastKnownUserId = typeof window !== 'undefined' ? sessionStorage.getItem('ask_last_registered_userid') : null;

  // Clear inputs on mount if no prefill provided
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (!params.get('userId') && !params.get('prefill')) {
        setEmail('');
      }
    }
    setPassword('');
  });

  function handleEmailChange(val: string) {
    setEmail(val);
    const trimmed = val.trim().toLowerCase();
    if (loginRole === 'customer') {
      if (
        trimmed === 'superadmin@askgroup.com' ||
        trimmed === 'admin@askgroup.com' ||
        trimmed.startsWith('superadmin@') ||
        trimmed.startsWith('admin@') ||
        trimmed.startsWith('ask-sup') ||
        trimmed.startsWith('ask-adm')
      ) {
        setLoginRole('admin');
        navigate('/login?portal=admin', { replace: true });
        setError('');
      }
    } else if (loginRole === 'admin') {
      if (
        trimmed === 'user@askgroup.com' ||
        trimmed.startsWith('user@') ||
        trimmed.startsWith('customer@') ||
        trimmed.startsWith('ask-cust')
      ) {
        setLoginRole('customer');
        navigate('/login', { replace: true });
        setError('');
      }
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Immediately clear sensitive password from component memory
      setPassword('');

      // Smart role-based portal routing:
      if (user.role === 'Admin' || user.role === 'SuperAdmin') {
        localStorage.setItem('ask_admin_active_tab', 'dashboard');
        navigate('/admin?tab=dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Purge password on failed attempt
      setPassword('');
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please verify your credentials.'
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
          method="post"
          action="#"
          autoComplete="off"
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

          {/* QUICK RE-LOGIN CHIPS FOR USER ID & EMAIL */}
          {(!email) && (lastKnownUserId || lastKnownEmail) && (
            <div style={{ marginBottom: '14px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              {lastKnownUserId && (
                <button
                  type="button"
                  onClick={() => handleEmailChange(lastKnownUserId)}
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid #10b981',
                    color: '#059669',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '5px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Click to sign in with your auto-generated User ID"
                >
                  <span>🆔 User ID:</span>
                  <strong>{lastKnownUserId}</strong>
                </button>
              )}
              {lastKnownEmail && (
                <button
                  type="button"
                  onClick={() => handleEmailChange(lastKnownEmail)}
                  style={{
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px dashed #0284c7',
                    color: '#0284c7',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📧 Email:</span>
                  <strong>{lastKnownEmail}</strong>
                </button>
              )}
            </div>
          )}

          <div className="login-field">

            <label htmlFor="email">
              Email Address or User ID / ईमेल या यूज़र आईडी
            </label>

            <div className="field-control">

              <span className="mail-icon"></span>

              <input
                id="email"
                name="ask_no_autofill_email"
                type="text"
                placeholder={loginRole === 'admin' ? 'admin@askgroup.com or ASK-ADM-XXXXX' : 'Enter email or User ID (e.g. ASK-CUST-XXXXX)'}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={() => handleEmailChange(email)}
                autoComplete="off"
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

            <div className="field-control" style={{ position: 'relative' }}>

              <span className="lock-icon"></span>

              <input
                id="password"
                name="ask_no_autofill_pwd"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
                style={{ paddingRight: '42px' }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: '#94a3b8',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>

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

        </form>

      </section>

    </div>
  );
}
