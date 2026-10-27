import { useState, useRef, useEffect } from 'react';
import { useTheme, type Theme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
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

  function getButtonIcon() {
    if (theme === 'system') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    }
    if (resolvedTheme === 'dark') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }

  function handleSelect(mode: Theme) {
    setTheme(mode);
    setOpen(false);
  }

  return (
    <div className="theme-toggle-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={() => setOpen(prev => !prev)}
        title={`Theme: ${theme.toUpperCase()} (Click to change)`}
        aria-label="Theme mode selector"
      >
        {getButtonIcon()}
      </button>

      {open && (
        <div className="theme-dropdown-menu">
          <div className="theme-menu-header">Select Theme</div>

          <button
            type="button"
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleSelect('light')}
          >
            <span className="theme-opt-icon">☀️</span>
            <span className="theme-opt-label">Light Mode</span>
            {theme === 'light' && <span className="theme-check">✓</span>}
          </button>

          <button
            type="button"
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleSelect('dark')}
          >
            <span className="theme-opt-icon">🌙</span>
            <span className="theme-opt-label">Dark Mode</span>
            {theme === 'dark' && <span className="theme-check">✓</span>}
          </button>

          <button
            type="button"
            className={`theme-option ${theme === 'system' ? 'active' : ''}`}
            onClick={() => handleSelect('system')}
          >
            <span className="theme-opt-icon">💻</span>
            <span className="theme-opt-label">System Default</span>
            {theme === 'system' && <span className="theme-check">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
