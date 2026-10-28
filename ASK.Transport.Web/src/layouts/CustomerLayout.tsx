import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUserApproved } from '../utils/accessControl';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Dashboard.css';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [approved, setApproved] = useState(() => isUserApproved(user));

  useEffect(() => {
    setApproved(isUserApproved(user));

    function handleAccessChange() {
      setApproved(isUserApproved(user));
    }

    window.addEventListener('ask_access_control_change', handleAccessChange);
    return () => {
      window.removeEventListener('ask_access_control_change', handleAccessChange);
    };
  }, [user]);

  function active(path: string) {
    return location.pathname === path ? 'active' : '';
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/login';
  }

  return (
    <div className="customer-dashboard">
      {/* SIDEBAR */}
      <aside className="customer-sidebar">
        {/* BRAND */}
        <Link to="/dashboard" className="dashboard-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="dashboard-logo">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS</small>
            <div className="sidebar-tagline">Move Together. Grow Further.</div>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="dashboard-nav">
          <Link className={active('/dashboard')} to="/dashboard">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Dashboard
          </Link>

          <Link className={active('/book')} to="/book">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            Book Shipment
          </Link>

          <Link className={active('/bookings')} to="/bookings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            My Bookings
          </Link>

          <Link className={active('/tracking')} to="/tracking">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            Track Shipment
          </Link>

          <Link className={active('/payments')} to="/payments">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Payments
            {!approved && <span className="sidebar-lock-badge" title="Admin Approval Required">🔒 Locked</span>}
          </Link>

          <Link className={active('/invoices')} to="/invoices">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Invoices
            {!approved && <span className="sidebar-lock-badge" title="Admin Approval Required">🔒 Locked</span>}
          </Link>

          <Link className={active('/documents')} to="/documents">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Documents
            {!approved && <span className="sidebar-lock-badge" title="Admin Approval Required">🔒 Locked</span>}
          </Link>

          <Link className={active('/notifications')} to="/notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notifications
            <span className="sidebar-badge-red">3</span>
          </Link>

          <Link className={active('/support')} to="/support">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            Support
          </Link>

          {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
            <Link className="sidebar-admin-link" to="/admin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              {user?.role === 'SuperAdmin' ? '👑 Super Admin Panel' : '⚡ Admin Panel'}
            </Link>
          )}
        </nav>

        {/* SIDEBAR BOTTOM (ALWAYS PINNED & VISIBLE) */}
        <div className="sidebar-bottom">
          <Link className={active('/profile')} to="/profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile &amp; Settings
          </Link>

          <button type="button" onClick={handleLogout} className="sidebar-logout-link" title="Click to Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>

          <div className="sidebar-compact-help">
            <span>24/7 Helpline: </span>
            <a href="tel:+919876543210">+91 98765 43210</a>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="dashboard-main">
        {/* TOP SEARCH & PROFILE BAR */}
        <header className="customer-topbar">
          <div className="topbar-search-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by tracking number, booking ID, or destination..."
            />
          </div>

          <div className="topbar-right">
            <ThemeToggle />

            {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
              <Link to="/admin" className="topbar-admin-badge" title="Go to Admin Command Center">
                Admin Center ↗
              </Link>
            )}
            <a href='/driver' target='_blank' rel='noreferrer' className='topbar-admin-badge' style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.3)' }} title='Open Mobile Driver App'>
              📱 Driver App ↗
            </a>

            <Link to="/notifications" className="topbar-icon-btn notification" title="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notif-red-dot">3</span>
            </Link>

            <Link to="/profile" className="topbar-user-profile" title="View Profile">
              <div className="topbar-user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'K'}
              </div>
              <div className="topbar-user-info">
                <strong>{user?.name || 'ASK User'}</strong>
                <small>{user?.role || 'Customer'}</small>
              </div>
            </Link>

            {/* DIRECT VISIBLE SIGN OUT BUTTON IN TOPBAR */}
            <button
              type="button"
              onClick={handleLogout}
              className="topbar-logout-btn"
              title="Sign Out of Your Account"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* RESTRICTED ACCOUNT CLEARANCE NOTICE FOR NEW UNAPPROVED USERS */}
        {!approved && (
          <div className="customer-access-ribbon">
            <div className="ribbon-content">
              <span className="ribbon-pill">🟡 Basic Shipper Access</span>
              <span>
                Naye accounts ke liye abhi sirf <strong>Book Shipment</strong> aur <strong>Track Shipment</strong> unlocked hain. Admin dwara account verification ke baad Payments, Invoices aur Documents activate ho jayenge.
              </span>
            </div>
            <Link to="/support" className="ribbon-action-btn">
              Request Approval →
            </Link>
          </div>
        )}

        {/* CONTENT */}
        <div className="customer-content-area">
          {children}
        </div>
      </main>
    </div>
  );
}
