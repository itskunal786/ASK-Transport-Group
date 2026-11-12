import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, LogIn, ArrowRight, RefreshCw } from 'lucide-react';
import './InactivityReLoginModal.css';

export interface LockedUserData {
  email: string;
  fullName: string;
  role: string;
}

interface InactivityReLoginModalProps {
  lockedUser: LockedUserData;
  onUnlock: (password: string) => Promise<void>;
  onSwitchAccount: () => void;
}

export default function InactivityReLoginModal({
  lockedUser,
  onUnlock,
  onSwitchAccount
}: InactivityReLoginModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Automatically focus password input on modal mount
    const timer = setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password to unlock.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onUnlock(password);
      setPassword('');
    } catch (err: unknown) {
      setPassword('');
      const msg = err instanceof Error ? err.message : 'Invalid password. Please check and try again.';
      setError(msg);
      passwordInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="inactivity-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="inactivity-title">
      <div className="inactivity-modal-container">
        
        {/* TOP STATUS GLOW / BADGE */}
        <div className="inactivity-header">
          <div className="inactivity-badge-pill">
            <span className="inactivity-pulse-dot" />
            <ShieldAlert size={14} className="inactivity-shield-icon" />
            <span>SESSION LOCKED • INACTIVITY DETECTOR</span>
          </div>

          <h2 id="inactivity-title" className="inactivity-title">
            Session Expired due to Inactivity
          </h2>

          <p className="inactivity-explanation">
            No activity was detected on the portal for 15 minutes. To protect sensitive logistics and financial data, your active session was suspended. Re-enter your password to unlock and resume instantly without losing your work.
          </p>
        </div>

        {/* LOCKED USER CARD */}
        <div className="inactivity-user-card">
          <div className="inactivity-user-avatar">
            {getInitials(lockedUser.fullName, lockedUser.email)}
          </div>
          <div className="inactivity-user-details">
            <div className="inactivity-user-name">
              {lockedUser.fullName || 'User'}
            </div>
            <div className="inactivity-user-email">
              {lockedUser.email}
            </div>
          </div>
          <span className={`inactivity-role-pill role-${lockedUser.role?.toLowerCase() || 'staff'}`}>
            {lockedUser.role || 'Staff'}
          </span>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="inactivity-error-banner" role="alert">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* UNLOCK FORM */}
        <form onSubmit={handleUnlockSubmit} className="inactivity-form" autoComplete="off">
          <div className="inactivity-field-wrap">
            <label htmlFor="inactivity-password" className="inactivity-label">
              <Lock size={13} />
              <span>Password to Re-Authenticate</span>
            </label>

            <div className="inactivity-input-box">
              <input
                ref={passwordInputRef}
                id="inactivity-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your account password"
                disabled={loading}
                required
                className="inactivity-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="inactivity-eye-btn"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inactivity-unlock-btn"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="inactivity-spinner" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Quick Re-Login & Resume</span>
              </>
            )}
          </button>
        </form>

        {/* FOOTER ACTIONS */}
        <div className="inactivity-footer">
          <button
            type="button"
            onClick={onSwitchAccount}
            className="inactivity-switch-btn"
            disabled={loading}
          >
            <span>Sign in with a different account</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
