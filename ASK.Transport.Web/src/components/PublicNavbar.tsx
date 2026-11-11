import '../pages/public/LandingPage.css';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Truck, 
  Shield, 
  User, 
  UserPlus, 
  ChevronDown, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  Layers,
  Globe,
  Search,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);

  // Close portal dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (portalRef.current && !portalRef.current.contains(event.target as Node)) {
        setShowPortalMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowPortalMenu(false);
  }, [location.pathname]);

  function handleTrackClick() {
    setMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '/landing') {
      const el = document.getElementById('tracking');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/#tracking');
    }
  }

  function handleNetworkClick() {
    setMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '/landing') {
      const el = document.getElementById('network');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/#network');
    }
  }

  async function handleLogout() {
    await logout();
    setShowPortalMenu(false);
    navigate('/login');
  }

  return (
    <header className="landing-header">
      <div className="landing-nav-container">
        {/* BRAND IDENTITY LOGO */}
        <Link to="/" className="landing-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="landing-brand-badge">
            <Truck size={20} className="landing-brand-icon" strokeWidth={2.4} />
          </div>
          <div className="landing-brand-titles">
            <span className="landing-brand-name">ASK GROUP</span>
            <span className="landing-brand-sub">TRANSPORT &amp; LOGISTICS</span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="landing-nav-links">
          <Link
            to="/services"
            className={`landing-nav-link ${location.pathname === '/services' ? 'active' : ''}`}
          >
            <Layers size={16} className="landing-nav-icon" />
            <span>{t('Services', 'सेवाएं')}</span>
          </Link>

          <a
            href="#network"
            className="landing-nav-link"
            onClick={(e) => {
              e.preventDefault();
              handleNetworkClick();
            }}
          >
            <Globe size={16} className="landing-nav-icon" />
            <span>{t('Pan-India Network', 'अखिल भारतीय नेटवर्क')}</span>
          </a>

          <a
            href="#tracking"
            className="landing-nav-link"
            onClick={(e) => {
              e.preventDefault();
              handleTrackClick();
            }}
          >
            <Search size={16} className="landing-nav-icon" />
            <span>{t('Track Consignment', 'कंसाइनमेंट ट्रैक करें')}</span>
          </a>

          <Link
            to="/about"
            className={`landing-nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            <Building2 size={16} className="landing-nav-icon" />
            <span>{t('About Us', 'हमारे बारे में')}</span>
          </Link>
        </nav>

        {/* RIGHT ACTION CENTER */}
        <div className="landing-header-actions">
          <div className="landing-controls-cluster">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <div className="landing-nav-divider" />

          {user ? (
            /* LOGGED IN USER PILL */
            <div className="landing-user-cluster">
              <Link
                to={user.role === 'Admin' || user.role === 'SuperAdmin' ? '/admin' : '/dashboard'}
                className="landing-btn-dashboard-pill"
              >
                <LayoutDashboard size={15} />
                <span>{user.name ? user.name.split(' ')[0] : 'User'} ({t('Dashboard', 'डैशबोर्ड')})</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="landing-btn-logout-pill"
                title={t('Sign Out', 'साइन आउट')}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            /* GUEST AUTH ACTIONS */
            <div className="landing-guest-cluster">
              <Link to="/login" className="landing-btn-signin-link">
                {t('Sign In', 'साइन इन')}
              </Link>

              {/* UNIFIED CLIENT PORTAL DROPDOWN */}
              <div className="portal-action-group" ref={portalRef}>
                <button
                  type="button"
                  className="landing-btn-portal"
                  onClick={() => setShowPortalMenu(prev => !prev)}
                  aria-expanded={showPortalMenu}
                  aria-label="Secure Client Portals"
                >
                  <Shield size={15} />
                  <span>{t('Client Portal', 'क्लाइंट पोर्टल')}</span>
                  <ChevronDown size={14} className={`portal-chevron ${showPortalMenu ? 'rotated' : ''}`} />
                </button>

                {showPortalMenu && (
                  <div className="portal-login-dropdown">
                    <div className="portal-dropdown-header">
                      <span className="portal-dropdown-badge">
                        <Shield size={13} />
                        {t('SECURE ENTERPRISE HUBS', 'सुरक्षित एंटरप्राइज हब')}
                      </span>
                    </div>

                    <div className="portal-dropdown-list">
                      {/* Customer / Shipper */}
                      <Link
                        to="/login"
                        onClick={() => setShowPortalMenu(false)}
                        className="portal-dropdown-card"
                      >
                        <div className="portal-card-icon blue">
                          <User size={18} />
                        </div>
                        <div className="portal-card-body">
                          <strong>{t('Corporate Shipper / Client', 'कॉर्पोरेट शिपर / क्लाइंट')}</strong>
                          <small>{t('Book loads, manage Bilties & track consignments', 'लोड बुक करें, बिल्टी और कंसाइनमेंट ट्रैक करें')}</small>
                        </div>
                      </Link>

                      {/* Admin Portal */}
                      <Link
                        to="/login?portal=admin"
                        onClick={() => setShowPortalMenu(false)}
                        className="portal-dropdown-card"
                      >
                        <div className="portal-card-icon amber">
                          <Shield size={18} />
                        </div>
                        <div className="portal-card-body">
                          <strong>{t('Operations & Super Admin', 'ऑपरेशंस एवं सुपर एडमिन')}</strong>
                          <small>{t('Telematics, yard docks, P&L radar & governance', 'टेलीमैटिक्स, यार्ड डॉक्स, P&L रडार और गवर्नेंस')}</small>
                        </div>
                      </Link>
                    </div>

                    {/* Dropdown Footer: New Account */}
                    <div className="portal-dropdown-footer">
                      <Link
                        to="/register"
                        onClick={() => setShowPortalMenu(false)}
                        className="portal-register-btn"
                      >
                        <UserPlus size={14} />
                        <span>{t('+ Create Verified Shipper Account', '+ नया वेरिफाइड शिपर अकाउंट बनाएं')}</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            className="landing-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="landing-mobile-drawer">
          <div className="mobile-drawer-links">
            <Link
              to="/services"
              className={`mobile-drawer-link ${location.pathname === '/services' ? 'active' : ''}`}
            >
              <Layers size={18} />
              <span>{t('Services', 'सेवाएं')}</span>
            </Link>

            <a
              href="#network"
              className="mobile-drawer-link"
              onClick={(e) => {
                e.preventDefault();
                handleNetworkClick();
              }}
            >
              <Globe size={18} />
              <span>{t('Pan-India Network', 'अखिल भारतीय नेटवर्क')}</span>
            </a>

            <a
              href="#tracking"
              className="mobile-drawer-link"
              onClick={(e) => {
                e.preventDefault();
                handleTrackClick();
              }}
            >
              <Search size={18} />
              <span>{t('Track Consignment', 'कंसाइनमेंट ट्रैक करें')}</span>
            </a>

            <Link
              to="/about"
              className={`mobile-drawer-link ${location.pathname === '/about' ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>{t('About Us', 'हमारे बारे में')}</span>
            </Link>
          </div>

          <div className="mobile-drawer-actions">
            <div className="mobile-controls-row">
              <LanguageToggle />
              <ThemeToggle />
            </div>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <Link
                  to={user.role === 'Admin' || user.role === 'SuperAdmin' ? '/admin' : '/dashboard'}
                  className="mobile-btn-primary"
                >
                  <LayoutDashboard size={16} />
                  <span>{t('Go to Dashboard', 'डैशबोर्ड पर जाएं')}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mobile-btn-secondary"
                >
                  <LogOut size={15} />
                  <span>{t('Sign Out', 'साइन आउट')}</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <Link to="/login" className="mobile-btn-primary">
                  {t('Sign In to Account', 'अकाउंट में साइन इन करें')}
                </Link>
                <Link to="/register" className="mobile-btn-secondary">
                  <UserPlus size={15} />
                  <span>{t('Create New Shipper Account', 'नया शिपर अकाउंट बनाएं')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
