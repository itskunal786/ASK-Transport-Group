import { useState, type FormEvent } from 'react';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { changePassword, deactivateAccount } from '../../api/accountApi';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Deactivate Modal State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(res.message || 'Password changed successfully. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change password.');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeactivateAccount(e: FormEvent) {
    e.preventDefault();
    setDeactivateError('');

    if (!deactivatePassword) {
      setDeactivateError('Please enter your password to confirm account deactivation.');
      return;
    }

    try {
      setDeactivating(true);
      await deactivateAccount({ password: deactivatePassword });
      alert('Your account has been deactivated. You will now be redirected to the login page.');
      await logout();
      window.location.href = '/login';
    } catch (err) {
      setDeactivateError(err instanceof Error ? err.message : 'Failed to deactivate account.');
    } finally {
      setDeactivating(false);
    }
  }

  return (
    <CustomerLayout>
      <div className="profile-page">
        {/* HERO */}
        <div className="profile-hero">
          <span className="profile-eyebrow">Account Settings</span>
          <h1>My Profile &amp; Security</h1>
          <p>
            Manage your personal profile, credentials, and account authentication settings for ASK Transport.
          </p>
        </div>

        <div className="profile-grid">
          {/* USER INFO CARD */}
          <div className="profile-card">
            <div className="profile-card-head">
              <div className="profile-card-icon">👤</div>
              <div>
                <h2>Account Profile</h2>
                <p>Personal identification and contact details</p>
              </div>
            </div>

            <div className="user-identity-box">
              <div className="user-identity-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-identity-details">
                <h3>{user?.name || 'Customer'}</h3>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <span className="profile-info-label">Account Name</span>
                <span className="profile-info-value">{user?.name || '—'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Registered Email</span>
                <span className="profile-info-value">{user?.email || '—'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">{user?.role || 'Customer'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email Verification</span>
                <span className="verified-badge">✓ Verified</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Account Status</span>
                <span className="verified-badge">● Active</span>
              </div>
            </div>
          </div>

          {/* CHANGE PASSWORD CARD */}
          <div className="profile-card">
            <div className="profile-card-head">
              <div className="profile-card-icon">🔒</div>
              <div>
                <h2>Change Password</h2>
                <p>Update your password to keep your account secure</p>
              </div>
            </div>

            {passwordSuccess && (
              <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#047857', marginBottom: '16px', fontSize: '13px' }}>
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', marginBottom: '16px', fontSize: '13px' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                />
              </div>

              <button
                type="submit"
                className="profile-submit-btn"
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* DANGER ZONE: DEACTIVATE ACCOUNT */}
        <div style={{ marginTop: '28px' }}>
          <div className="profile-card danger">
            <div className="profile-card-head">
              <div className="profile-card-icon">⚠️</div>
              <div>
                <h2 style={{ color: '#b91c1c' }}>Deactivate Account</h2>
                <p>Permanently suspend access to your account and bookings</p>
              </div>
            </div>

            <div className="danger-action-box">
              <p>
                Deactivating your account will immediately revoke all active sessions and disable portal logins. Active bookings will remain archived for compliance.
              </p>
              <button
                type="button"
                className="deactivate-btn"
                onClick={() => {
                  setDeactivateError('');
                  setDeactivatePassword('');
                  setShowDeactivateModal(true);
                }}
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>

        {/* DEACTIVATE CONFIRMATION MODAL */}
        {showDeactivateModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 10px', color: '#b91c1c', fontSize: '18px' }}>
                Confirm Account Deactivation
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
                Please confirm by typing your current password. Once deactivated, you will be logged out immediately.
              </p>

              {deactivateError && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: '8px', color: '#b91c1c', marginBottom: '16px', fontSize: '13px' }}>
                  {deactivateError}
                </div>
              )}

              <form onSubmit={handleDeactivateAccount}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deactivatePassword}
                    onChange={e => setDeactivatePassword(e.target.value)}
                    disabled={deactivating}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="support-secondary-btn"
                    onClick={() => setShowDeactivateModal(false)}
                    disabled={deactivating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    disabled={deactivating}
                  >
                    {deactivating ? 'Deactivating...' : 'Confirm Deactivation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
