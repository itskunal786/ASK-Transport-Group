import { useState, useRef, useEffect } from 'react';
import { useLanguage, type Language } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="language-toggle-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setOpen(prev => !prev)}
        title={`Language: ${language === 'en' ? 'English' : 'हिंदी'} (Click to change)`}
        aria-label="Language selector"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          fontWeight: 600,
          fontSize: '13px'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span style={{ letterSpacing: '0.5px' }}>{language === 'en' ? 'EN' : 'HI'}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.6 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="theme-dropdown-menu"
          style={{
            minWidth: '170px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: '6px',
            zIndex: 100
          }}
        >
          <div className="theme-menu-header" style={{ padding: '6px 10px', fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Language / भाषा
          </div>

          <button
            type="button"
            className={`theme-option ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleSelect('en')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: language === 'en' ? '#f1f5f9' : 'transparent',
              fontWeight: language === 'en' ? 700 : 500,
              color: language === 'en' ? '#0284c7' : 'inherit',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🇬🇧</span>
              <span>English (Default)</span>
            </div>
            {language === 'en' && <span style={{ color: '#0284c7', fontSize: '12px' }}>✓</span>}
          </button>

          <button
            type="button"
            className={`theme-option ${language === 'hi' ? 'active' : ''}`}
            onClick={() => handleSelect('hi')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: language === 'hi' ? '#f1f5f9' : 'transparent',
              fontWeight: language === 'hi' ? 700 : 500,
              color: language === 'hi' ? '#0284c7' : 'inherit',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🇮🇳</span>
              <span>हिंदी (Hindi)</span>
            </div>
            {language === 'hi' && <span style={{ color: '#0284c7', fontSize: '12px' }}>✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
