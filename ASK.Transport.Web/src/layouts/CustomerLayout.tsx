import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/Dashboard.css';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
          <div className="nav-group-label">MAIN OPERATIONS</div>

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

          <div className="nav-group-label" style={{ marginTop: '14px' }}>FINANCIALS &amp; VAULT</div>

          <Link className={active('/payments')} to="/payments">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Payments &amp; Wallet
          </Link>

          <Link className={active('/invoices')} to="/invoices">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            GST Invoices
          </Link>

          <Link className={active('/documents')} to="/documents">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Documents &amp; PODs
          </Link>

          <div className="nav-group-label" style={{ marginTop: '14px' }}>SUPPORT &amp; PREFERENCES</div>

          <Link className={active('/support')} to="/support">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Support &amp; Help
          </Link>

          <Link className={active('/profile')} to="/profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile &amp; Settings
          </Link>
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="customer-sidebar-footer">
          <Link to="/profile" className="customer-sidebar-user-card" title="Account Profile & Settings">
            <div className="customer-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="customer-user-meta">
              <span className="customer-user-name">{user?.name || 'ASK User'}</span>
              <span className="customer-user-role">Profile &amp; Settings ⚙️</span>
            </div>
          </Link>

          <button
            type="button"
            className="customer-sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign Out of session"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>

          <div className="customer-sidebar-helpline">
            <span className="helpline-icon">📞</span>
            <div className="helpline-meta">
              <span className="helpline-label">24/7 Toll-Free Support</span>
              <a href="tel:+919876543210" className="helpline-number">+91 98765 43210</a>
            </div>
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
              placeholder="Search by Bilty ASKB..., city, cargo or consignment..."
            />
            <span className="topbar-search-kbd">Ctrl + K</span>
          </div>

          <div className="topbar-right">
            <div className="topbar-fleet-live-pill" title="AIS-140 Highway GPS Network Online">
              <span className="pulse-beacon-dot" />
              <span>Fleet GPS Live</span>
            </div>

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
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="topbar-user-info">
                <strong>{user?.name || 'Sandeep Verma'}</strong>
                <small>{user?.role === 'SuperAdmin' ? 'Super Admin' : user?.role === 'Admin' ? 'Operations Admin' : 'Corporate Shipper'}</small>
              </div>
            </Link>

            {/* DIRECT VISIBLE SIGN OUT BUTTON IN TOPBAR */}
            <button
              type="button"
              onClick={handleLogout}
              className="topbar-logout-btn"
              title="Sign Out of Your Account"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </header>

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
