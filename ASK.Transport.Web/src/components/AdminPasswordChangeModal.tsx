import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Check,
  X,
  Lock
} from 'lucide-react';
import { changeUserPassword } from '../api/adminApi';

export interface AdminPasswordChangeModalProps {
  targetUser: {
    id: number | string;
    name: string;
    email: string;
    role: string;
  };
  currentUserRole?: string;
  currentUserId?: number | string;
  currentUserEmail?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function AdminPasswordChangeModal({
  targetUser,
  currentUserRole,
  currentUserEmail,
  onClose,
  onSuccess
}: AdminPasswordChangeModalProps) {
  // Determine if SuperAdmin is resetting someone else's password
  const isSuperAdmin = currentUserRole === 'SuperAdmin';
  const isSelf = currentUserEmail?.toLowerCase() === targetUser.email.toLowerCase();
  const isSuperAdminOverride = isSuperAdmin && !isSelf;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^_+=-]/.test(newPassword);
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Quick generator for a strong enterprise password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$&!';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Ask${targetUser.role || 'Admin'}@2026#${randomPart}`;
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
    setError('');

    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSuperAdminOverride && !currentPassword.trim()) {
      setError('Please enter the current password.');
      return;
    }

    if (!hasMinLength) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (!isMatch) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await changeUserPassword({
        email: targetUser.email,
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        isSuperAdminOverride
      });

      onSuccess(res.message || `Password for ${targetUser.name} updated successfully!`);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="admin-password-modal-card"
        style={{
          background: 'var(--bg-card, #111a2e)',
          border: '1px solid var(--border-color, #1e2c47)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          color: 'var(--text-primary, #f8fafc)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color, #1e2c47)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, transparent 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                {isSelf ? 'Change Your Account Password' : `Update Password for ${targetUser.name}`}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Secure SHA-256 Cryptographic Credential Vault
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* TARGET USER PROFILE BANNER */}
        <div style={{ padding: '16px 24px 0' }}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: targetUser.role === 'SuperAdmin' ? '#d97706' : '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px'
                }}
              >
                {targetUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{targetUser.name}</div>
                <div style={{ fontSize: '12px', color: '#38bdf8' }}>{targetUser.email}</div>
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '20px',
                background:
                  targetUser.role === 'SuperAdmin'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(59, 130, 246, 0.15)',
                color: targetUser.role === 'SuperAdmin' ? '#fbbf24' : '#60a5fa',
                border:
                  targetUser.role === 'SuperAdmin'
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {targetUser.role === 'SuperAdmin' ? '👑 Super Admin' : '⚡ Admin Staff'}
            </span>
          </div>

          {isSuperAdminOverride && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '11.5px',
                color: '#fef08a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
              <span>
                <strong>SuperAdmin Master Override:</strong> You can set a new password directly without entering their existing password.
              </span>
            </div>
          )}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* CURRENT PASSWORD (ONLY IF NOT SUPERADMIN OVERRIDE) */}
          {!isSuperAdminOverride && (
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#cbd5e1',
                  marginBottom: '6px'
                }}
              >
                Current Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    background: '#090f1d',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* NEW PASSWORD + GENERATE BUTTON */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px'
              }}
            >
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#cbd5e1'
                }}
              >
                New Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Generate a high-strength password"
              >
                {copied ? <Check size={12} /> : <Wand2 size={12} />}
                {copied ? 'Copied to Clipboard!' : 'Generate Secure Password'}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: '#090f1d',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* PASSWORD STRENGTH CHECKS */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px',
                fontSize: '11px',
                color: '#64748b'
              }}
            >
              <span style={{ color: hasMinLength ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> 8+ Chars
              </span>
              <span style={{ color: hasNumber ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> 1+ Number
              </span>
              <span style={{ color: hasSpecial ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> 1+ Symbol
              </span>
            </div>
          </div>

          {/* CONFIRM NEW PASSWORD */}
          <div style={{ marginBottom: '22px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#cbd5e1',
                marginBottom: '6px'
              }}
            >
              Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 14px',
                  borderRadius: '8px',
                  border: isMatch ? '1px solid #10b981' : '1px solid #334155',
                  background: '#090f1d',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && (
              <div
                style={{
                  marginTop: '5px',
                  fontSize: '11px',
                  color: isMatch ? '#10b981' : '#ef4444',
                  fontWeight: 600
                }}
              >
                {isMatch ? '✓ Passwords match!' : '✕ Passwords do not match'}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color, #1e2c47)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newPassword || !isMatch || (!isSuperAdminOverride && !currentPassword)}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                background: loading ? '#2563eb' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading || !newPassword || !isMatch || (!isSuperAdminOverride && !currentPassword) ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? (
                <>
                  <span className="live-pulse-dot" style={{ background: '#ffffff' }}></span>
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
