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

  function handleSelectRole(role: 'customer' | 'admin') {
    setLoginRole(role);
    setError('');
    setEmail('');
    setPassword('');
    if (role === 'admin') {
      navigate('/login?portal=admin', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }

  function handleEmailChange(val: string) {
    setEmail(val);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Immediately clear sensitive password from component memory
      setPassword('');

      const isAdminOrSuper = user.role === 'Admin' || user.role === 'SuperAdmin';

      // 1. Strict Enforcement: Customer accounts CANNOT log into Admin Portal
      if (loginRole === 'admin' && !isAdminOrSuper) {
        await logout();
        setError(
          '⛔ Access Denied: This portal is strictly restricted to ASK Group Administrators & Super Admins. Customer accounts cannot log in here. Please switch to the "👤 Customer Login" tab to sign in.'
        );
        return;
      }

      // 2. Strict Enforcement: Administrator accounts CANNOT log into Customer Portal
      if (loginRole === 'customer' && isAdminOrSuper) {
        await logout();
        setError(
          '⛔ Access Restricted: Administrator and Super Admin accounts cannot log in through the Customer portal. Please click the "🛡️ Admin / Super Admin" tab above to sign in.'
        );
        return;
      }

      // 3. Authorized portal login
      if (isAdminOrSuper) {
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

          {/* Segmented Portal Switcher */}
          <div className="login-portal-segmented-bar">
            <button
              type="button"
              onClick={() => handleSelectRole('customer')}
              className={`login-portal-tab ${loginRole === 'customer' ? 'active' : ''}`}
            >
              <span className="portal-tab-icon">👤</span>
              <span className="portal-tab-text">Customer Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('admin')}
              className={`login-portal-tab admin ${loginRole === 'admin' ? 'active' : ''}`}
            >
              <span className="portal-tab-icon">🛡️</span>
              <span className="portal-tab-text">Staff & Admin</span>
            </button>
          </div>

          <div className="form-heading">
            <span className={`portal-badge-pill ${loginRole === 'admin' ? 'admin' : 'customer'}`}>
              {loginRole === 'admin' ? '🛡️ OPERATIONS COMMAND ACCESS' : '🚚 FREIGHT & CONSIGNMENT ACCESS'}
            </span>

            <h2>{loginRole === 'admin' ? 'Staff & Administrator Sign In' : 'Sign In to Your Account'}</h2>

            <p>
              {loginRole === 'admin'
                ? 'Authorized gateway for ASK Transport fleet operations, dispatch management, and executive control.'
                : 'Manage your enterprise bookings, live GPS tracking, GST bilties, and freight invoices.'}
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">
              Email Address or User ID
            </label>
            <div className="field-control">
              <span className="mail-icon"></span>
              <input
                id="email"
                name="ask_no_autofill_email"
                type="text"
                placeholder={loginRole === 'admin' ? 'ASK-MASTER-7001, ASK-OPS-5002, or admin email' : 'ASK-CUST-30003 or registered email'}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
            className={`signin-btn ${loginRole === 'admin' ? 'admin-btn' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (loginRole === 'admin' ? 'Sign In to Operations Deck →' : 'Sign In to Customer Portal →')}
          </button>

          {loginRole === 'customer' ? (
            <div className="create-account">
              <span>New to ASK Transport?</span>
              <Link to="/register">Create an account</Link>
            </div>
          ) : (
            <div className="admin-secure-notice">
              <span>🔒 Encrypted 256-bit Central Operations Gateway</span>
            </div>
          )}

        </form>

      </section>

    </div>
  );
}
