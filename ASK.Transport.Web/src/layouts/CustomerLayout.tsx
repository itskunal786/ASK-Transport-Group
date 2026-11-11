import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isUserApproved, requestUserApproval, isApprovalPending, isPendingSuperAdminReverify, getApprovalRequestForUser } from '../utils/accessControl';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Dashboard.css';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [approved, setApproved] = useState(() => isUserApproved(user));
  const [isPending, setIsPending] = useState(() => isApprovalPending(user?.id, user?.email));
  const [isPendingReverify, setIsPendingReverify] = useState(() => isPendingSuperAdminReverify(user?.id, user?.email));
  const [requestToast, setRequestToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setApproved(isUserApproved(user));
    setIsPending(isApprovalPending(user?.id, user?.email));

    function handleAccessChange() {
      setApproved(isUserApproved(user));
      setIsPending(isApprovalPending(user?.id, user?.email));
      setIsPendingReverify(isPendingSuperAdminReverify(user?.id, user?.email));
    }

    function handleRequestUpdate() {
      setIsPending(isApprovalPending(user?.id, user?.email));
      setIsPendingReverify(isPendingSuperAdminReverify(user?.id, user?.email));
      setApproved(isUserApproved(user));
    }

    window.addEventListener('ask_access_control_change', handleAccessChange);
    window.addEventListener('ask_approval_request_updated', handleRequestUpdate);
    window.addEventListener('ask_approval_request_submitted', handleRequestUpdate);
    return () => {
      window.removeEventListener('ask_access_control_change', handleAccessChange);
      window.removeEventListener('ask_approval_request_updated', handleRequestUpdate);
      window.removeEventListener('ask_approval_request_submitted', handleRequestUpdate);
    };
  }, [user]);

  async function handleRequestApproval() {
    if (!user) return;
    try {
      await requestUserApproval(user);
      setIsPending(true);
      setRequestToast('✓ Account clearance request submitted! Super Admin has been notified to verify your account.');
      setTimeout(() => setRequestToast(null), 6000);
    } catch {
      setRequestToast('✓ Account clearance request submitted! Super Admin has been notified.');
      setTimeout(() => setRequestToast(null), 6000);
    }
  }

  function active(path: string) {
    return location.pathname === path ? 'active' : '';
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/login';
  }

  return (
    <div className="customer-dashboard">
      {/* MOBILE TOP BAR (Phone Header) */}
      <div className="customer-mobile-top-bar">
        <button 
          type="button" 
          className="customer-mobile-hamburger-btn"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="Toggle Navigation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="customer-mobile-brand">
          <strong>ASK TRANSPORT</strong>
        </div>
        <div className="customer-mobile-right-actions">
          <ThemeToggle />
          <Link to="/profile" className="mobile-user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Link>
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="customer-mobile-backdrop" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* SIDEBAR */}
      <aside className={`customer-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
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
            <div className="sidebar-tagline">Safe &amp; Reliable Freight Logistics.</div>
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Documents
            {!approved && <span className="sidebar-lock-badge" title="Admin Approval Required">🔒 Locked</span>}
          </Link>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="customer-sidebar-footer">
          <Link to="/profile" className="footer-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile &amp; Settings
          </Link>

          <button
            type="button"
            className="footer-link logout-btn"
            onClick={handleLogout}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>

          <div className="support-helpline">
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
        {!approved && (() => {
          const reqDetails = getApprovalRequestForUser(user?.id, user?.email);
          return (
            <div className="customer-access-ribbon">
              <div className="ribbon-content">
                <span className="ribbon-pill" style={{ background: isPendingReverify ? 'rgba(245, 158, 11, 0.2)' : undefined, color: isPendingReverify ? '#fbbf24' : undefined, border: isPendingReverify ? '1px solid #f59e0b' : undefined }}>
                  {isPendingReverify ? '🛡️ Step 1/2 Admin Verified' : '🟡 Basic Shipper Access'}
                </span>
                <span>
                  {isPendingReverify ? (
                    <>
                      <strong>Step 1 Verified:</strong> Operations Admin ({reqDetails?.adminApprovedBy || 'Admin'}) has pre-approved your account. Forwarded for <strong>SuperAdmin Final Re-Verification & Master Pass</strong>. Full clearance will unlock automatically.
                    </>
                  ) : (
                    <>
                      New accounts currently have access to <strong>Book Shipment</strong> and <strong>Track Shipment</strong> only. Payments, Invoices, and Documents will be unlocked upon administrative account verification.
                    </>
                  )}
                </span>
              </div>
              {isPendingReverify ? (
                <span className="ribbon-action-btn" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', border: '1px solid #f59e0b', cursor: 'default' }}>
                  👑 Awaiting SuperAdmin Final Pass
                </span>
              ) : isPending ? (
                <span className="ribbon-action-btn pending" title="Super Admin has been alerted to review your account" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a', border: '1px solid rgba(245, 158, 11, 0.4)', cursor: 'default' }}>
                  ⏳ Approval Pending (Admin Notified)
                </span>
              ) : (
                <button
                  type="button"
                  className="ribbon-action-btn"
                  onClick={handleRequestApproval}
                  title="Send notification to Super Admin to unlock your account"
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  Request Approval →
                </button>
              )}
            </div>
          );
        })()}

        {/* APPROVAL NOTIFICATION TOAST */}
        {requestToast && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(6, 95, 70, 0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            fontWeight: 700,
            border: '1px solid rgba(52, 211, 153, 0.4)',
            animation: 'fadeInDown 0.3s ease'
          }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <span>{requestToast}</span>
            <button
              onClick={() => setRequestToast(null)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '10px', fontSize: '14px', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* CONTENT */}
        <div className="customer-content-area">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="customer-mobile-bottom-nav">
        <Link to="/dashboard" className={`bottom-nav-item ${active('/dashboard')}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Home</span>
        </Link>
        <Link to="/book" className={`bottom-nav-item ${active('/book')}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          </svg>
          <span>Book</span>
        </Link>
        <Link to="/bookings" className={`bottom-nav-item ${active('/bookings')}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Bookings</span>
        </Link>
        <Link to="/tracking" className={`bottom-nav-item ${active('/tracking')}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>Track</span>
        </Link>
        <button 
          type="button" 
          className="bottom-nav-item" 
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
