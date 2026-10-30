import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

interface PublicNavbarProps {
  onSwitchHeroTab?: (tab: 'track' | 'quote') => void;
}

export default function PublicNavbar({ onSwitchHeroTab }: PublicNavbarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPortalMenu, setShowPortalMenu] = useState(false);

  function handleRateCalcClick() {
    if (location.pathname === '/' || location.pathname === '/landing') {
      if (onSwitchHeroTab) onSwitchHeroTab('quote');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/?tab=quote');
    }
  }

  function handleTrackClick() {
    if (location.pathname === '/' || location.pathname === '/landing') {
      if (onSwitchHeroTab) onSwitchHeroTab('track');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/?tab=track');
    }
  }

  function handleNetworkClick() {
    if (location.pathname === '/' || location.pathname === '/landing') {
      const el = document.getElementById('network');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/#network');
    }
  }

  return (
    <header className="landing-header">
      <div className="landing-nav-container">
        {/* BRAND LOGO */}
        <Link to="/" className="landing-brand">
          <div className="landing-brand-logo">
            <span />
            <span />
            <span />
          </div>
          <div className="landing-brand-titles">
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS &amp; SUPPLY CHAIN</small>
          </div>
        </Link>

        {/* UNIFIED NAV LINKS - 100% COMMON ANCHORS, ZERO BUTTON BOXES */}
        <nav className="landing-nav-links">
          <Link
            to="/services"
            className={`landing-nav-link ${location.pathname === '/services' ? 'active' : ''}`}
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
          >{t('Services', 'सेवाएं')}</Link>

          <a
            href="#calculator"
            className="landing-nav-link"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              handleRateCalcClick();
            }}
          >{t('Rate Calculator', 'भाड़ा कैलकुलेटर')}</a>

          <a
            href="#network"
            className="landing-nav-link"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              handleNetworkClick();
            }}
          >{t('Pan-India Network', 'अखिल भारतीय नेटवर्क')}</a>

          <a
            href="#tracking"
            className="landing-nav-link"
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              handleTrackClick();
            }}
          >{t('Track Consignment', 'कंसाइनमेंट ट्रैक करें')}</a>

          <Link
            to="/about"
            className={`landing-nav-link ${location.pathname === '/about' ? 'active' : ''}`}
            style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
          >{t('About Us', 'हमारे बारे में')}</Link>

          <Link
            to="/driver"
            target="_blank"
            className="landing-nav-link"
            style={{
              background: 'rgba(5, 150, 105, 0.12)',
              color: '#059669',
              fontWeight: 800,
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>📱</span> {t('Driver App', 'ड्राइवर ऐप')}
          </Link>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="landing-header-actions">
          <LanguageToggle />
          <ThemeToggle />

          {/* PORTAL LOGIN DROPDOWN */}
          <div className="portal-action-group" style={{ position: 'relative' }}>
            <button
              type="button"
              className="landing-btn-dashboard"
              onClick={() => setShowPortalMenu((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <span>{t('Portal Login', 'पोर्टल लॉगिन')}</span>
              <span style={{ fontSize: '0.72rem' }}>▾</span>
            </button>

            {showPortalMenu && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999,
                  }}
                  onClick={() => setShowPortalMenu(false)}
                />

                <div
                  className="portal-login-dropdown"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '310px',
                    background: 'var(--color-bg-card, #ffffff)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.22)',
                    padding: '16px',
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      paddingBottom: '10px',
                      borderBottom: '1px solid var(--color-border, #f1f5f9)',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#0284c7',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {t('CHOOSE PORTAL ACCESS', 'पोर्टल एक्सेस चुनें')}
                    </span>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary, #64748b)',
                      }}
                    >
                      {t('Select account type to enter login portal', 'लॉगिन करने के लिए खाता प्रकार चुनें')}
                    </p>
                  </div>

                  {/* Option 1: Customer Portal Login */}
                  <Link
                    to="/login"
                    onClick={() => setShowPortalMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      background: 'rgba(2, 132, 199, 0.05)',
                      border: '1px solid rgba(2, 132, 199, 0.18)',
                      marginBottom: '8px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', marginTop: '2px' }}>👤</div>
                    <div>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '0.88rem',
                          color: 'var(--color-text-primary, #0f172a)',
                        }}
                      >
                        {t('Customer / Business Login', 'ग्राहक / व्यवसाय लॉगिन')}
                      </strong>
                      <small
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-secondary, #64748b)',
                        }}
                      >
                        {t('Book shipments, Bilty LR & invoices', 'शिपमेंट बुकिंग, बिल्टी और बिल')}
                      </small>
                    </div>
                  </Link>

                  {/* Option: Mobile Driver Mode */}
                  <Link
                    to="/driver"
                    target="_blank"
                    onClick={() => setShowPortalMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      marginBottom: '8px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', marginTop: '2px' }}>📱</div>
                    <div>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '0.88rem',
                          color: '#059669',
                        }}
                      >
                        {t('Mobile Driver Mode ↗', 'मोबाइल चालक मोड ↗')}
                      </strong>
                      <small
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-secondary, #64748b)',
                        }}
                      >
                        {t('Hindi / English console, diesel slip & POD', 'हिंदी / अंग्रेजी कंसोल, डीजल पर्ची और पीओडी')}
                      </small>
                    </div>
                  </Link>

                  {/* Option 2: Admin & Super Admin Login */}
                  <Link
                    to="/login?portal=admin"
                    onClick={() => setShowPortalMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      background: 'rgba(245, 158, 11, 0.06)',
                      border: '1px solid rgba(245, 158, 11, 0.22)',
                      marginBottom: '8px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', marginTop: '2px' }}>🛡️</div>
                    <div>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '0.88rem',
                          color: 'var(--color-text-primary, #0f172a)',
                        }}
                      >
                        {t('Admin & Super Admin Login', 'एडमिन और सुपर एडमिन लॉगिन')}
                      </strong>
                      <small
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-secondary, #64748b)',
                        }}
                      >
                        {t('Fleet dispatch, audit trail & controls', 'फ्लीट डिस्पैच, ऑडिट लॉग और नियंत्रण')}
                      </small>
                    </div>
                  </Link>

                  {/* Option 3: Register */}
                  <Link
                    to="/register"
                    onClick={() => setShowPortalMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      color: '#0284c7',
                      textDecoration: 'none',
                      fontWeight: 700,
                      borderTop: '1px solid var(--color-border, #f1f5f9)',
                      marginTop: '4px',
                    }}
                  >
                    {t('+ Create New Client Account', '+ नया क्लाइंट खाता बनाएं')}
                  </Link>

                  {/* Active session section */}
                  {user && (
                    <div
                      style={{
                        borderTop: '1px solid var(--color-border, #f1f5f9)',
                        marginTop: '8px',
                        paddingTop: '8px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--color-text-secondary, #64748b)',
                          marginBottom: '6px',
                        }}
                      >
                        {t('Active session: ', 'सक्रिय सत्र: ')}<strong>{user.name}</strong> ({user.role})
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link
                          to={
                            user.role === 'Admin' || user.role === 'SuperAdmin'
                              ? '/admin'
                              : '/dashboard'
                          }
                          onClick={() => setShowPortalMenu(false)}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          {t('Open Dashboard →', 'डैशबोर्ड खोलें →')}
                        </Link>
                        <button
                          type="button"
                          onClick={async () => {
                            await logout();
                            setShowPortalMenu(false);
                            navigate('/login');
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Sign out of current account"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <Link to="/login" className="landing-btn-login">{t('Sign In', 'साइन इन')}</Link>
        </div>
      </div>
    </header>
  );
}
