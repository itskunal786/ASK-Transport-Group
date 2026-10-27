import { useState, type FormEvent } from 'react';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { changePassword, deactivateAccount } from '../../api/accountApi';
import './Profile.css';

interface SavedAddress {
  id: string;
  tag: 'Warehouse' | 'Office' | 'Factory' | 'Home';
  title: string;
  contactPerson: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

const INITIAL_ADDRESSES: SavedAddress[] = [
  {
    id: 'ADDR-1',
    tag: 'Warehouse',
    title: 'Central Logistics Hub (Gurugram)',
    contactPerson: 'Rajesh Sharma',
    phone: '9876543210',
    addressLine: 'Plot 42, Sector 18, Electronic City',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122015'
  },
  {
    id: 'ADDR-2',
    tag: 'Office',
    title: 'Regional Terminal (Mumbai)',
    contactPerson: 'Amit Verma',
    phone: '9820011223',
    addressLine: 'Unit 12B, JNPT Port Logistics Park, Nhava Sheva',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400707'
  }
];

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

  // Address Book State
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    const saved = localStorage.getItem('ask_saved_addresses');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_ADDRESSES;
  });
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrTitle, setNewAddrTitle] = useState('');
  const [newAddrTag, setNewAddrTag] = useState<'Warehouse' | 'Office' | 'Factory' | 'Home'>('Warehouse');
  const [newAddrPerson, setNewAddrPerson] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrLine, setNewAddrLine] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

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
      setPasswordError((err as Error).message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeactivateAccount(e: FormEvent) {
    e.preventDefault();
    setDeactivateError('');

    if (!deactivatePassword) {
      setDeactivateError('Please enter your password to confirm deactivation.');
      return;
    }

    try {
      setDeactivating(true);
      await deactivateAccount({ password: deactivatePassword });
      logout();
      window.location.href = '/login';
    } catch (err) {
      setDeactivateError((err as Error).message || 'Failed to deactivate account.');
      setDeactivating(false);
    }
  }

  function handleSaveAddress(e: FormEvent) {
    e.preventDefault();
    if (!newAddrTitle.trim() || !newAddrLine.trim() || !newAddrPincode.trim()) return;

    const newAddr: SavedAddress = {
      id: `ADDR-${Date.now()}`,
      title: newAddrTitle.trim(),
      tag: newAddrTag,
      contactPerson: newAddrPerson.trim() || user?.name || 'Authorized Contact',
      phone: newAddrPhone.trim() || '9876543210',
      addressLine: newAddrLine.trim(),
      city: newAddrCity.trim(),
      state: newAddrState.trim(),
      pincode: newAddrPincode.trim()
    };

    const updated = [newAddr, ...addresses];
    setAddresses(updated);
    localStorage.setItem('ask_saved_addresses', JSON.stringify(updated));

    setShowAddAddressModal(false);
    setNewAddrTitle('');
    setNewAddrPerson('');
    setNewAddrPhone('');
    setNewAddrLine('');
    setNewAddrCity('');
    setNewAddrState('');
    setNewAddrPincode('');
  }

  function handleDeleteAddress(id: string) {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('ask_saved_addresses', JSON.stringify(updated));
  }

  return (
    <CustomerLayout>
      <div className="profile-page">
        {/* HEADER HERO */}
        <div className="profile-hero">
          <span className="profile-eyebrow">Enterprise Account</span>
          <h1>Profile &amp; Security Settings</h1>
          <p>Manage your account credentials, security preferences, and saved logistics hubs.</p>
        </div>

        {/* TOP PROFILE BANNER */}
        <div className="profile-banner">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-banner-info">
            <h2>{user?.name || 'Valued Shipper'}</h2>
            <div className="profile-meta-row">
              <span>{user?.email}</span>
              <span className="bullet-sep">•</span>
              <span className="role-tag">{user?.role || 'Customer'}</span>
              <span className="bullet-sep">•</span>
              <span className="status-indicator">Active Account</span>
            </div>
          </div>
        </div>

        {/* 2-COLUMN GRID */}
        <div className="profile-grid">
          {/* PERSONAL & ORG DETAILS */}
          <div className="profile-card">
            <div className="profile-card-head">
              <div className="profile-card-icon">🏢</div>
              <div>
                <h2>Personal &amp; Company Details</h2>
                <p>Verified information linked to your logistics account</p>
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
                  placeholder="Confirm new password"
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

        {/* 3. SAVED ADDRESS BOOK (NEW) */}
        <div style={{ marginTop: '28px' }}>
          <div className="profile-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div className="profile-card-head" style={{ marginBottom: 0 }}>
                <div className="profile-card-icon">📍</div>
                <div>
                  <h2>Saved Addresses &amp; Hubs</h2>
                  <p>Frequently used pickup and delivery locations for 1-click booking</p>
                </div>
              </div>

              <button
                type="button"
                className="profile-submit-btn"
                style={{ width: 'auto', padding: '9px 18px', marginTop: 0 }}
                onClick={() => setShowAddAddressModal(true)}
              >
                + Add Address
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  style={{
                    background: 'var(--color-bg-secondary, #f8fafc)',
                    border: '1px solid var(--color-border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '18px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: addr.tag === 'Warehouse' ? '#e0f2fe' : addr.tag === 'Office' ? '#dcfce7' : '#fef3c7',
                        color: addr.tag === 'Warehouse' ? '#0369a1' : addr.tag === 'Office' ? '#15803d' : '#b45309'
                      }}
                    >
                      {addr.tag}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                      title="Delete Address"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary, #0f172a)' }}>
                    {addr.title}
                  </h3>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--color-text-secondary, #64748b)', lineHeight: 1.4 }}>
                    {addr.addressLine}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>

                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary, #475569)', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                    Contact: <strong>{addr.contactPerson}</strong> ({addr.phone})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. DANGER ZONE: DEACTIVATE ACCOUNT */}
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

        {/* ADD ADDRESS MODAL */}
        {showAddAddressModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddAddressModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Add New Location</h2>
                  <p>Save a pickup or delivery facility</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddAddressModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveAddress}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Facility Name / Label *</label>
                    <input
                      type="text"
                      placeholder="e.g., Surat Textile Factory or Delhi Main Office"
                      value={newAddrTitle}
                      onChange={e => setNewAddrTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Location Type</label>
                    <select
                      value={newAddrTag}
                      onChange={e => setNewAddrTag(e.target.value as any)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px' }}
                    >
                      <option value="Warehouse">Warehouse</option>
                      <option value="Office">Office</option>
                      <option value="Factory">Factory</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="st-form-field">
                      <label>Contact Person</label>
                      <input
                        type="text"
                        placeholder="e.g., Manoj Kumar"
                        value={newAddrPerson}
                        onChange={e => setNewAddrPerson(e.target.value)}
                      />
                    </div>
                    <div className="st-form-field">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g., 9876543210"
                        value={newAddrPhone}
                        onChange={e => setNewAddrPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="st-form-field">
                    <label>Address Line *</label>
                    <input
                      type="text"
                      placeholder="e.g., Plot 108, Industrial GIDC Phase 2"
                      value={newAddrLine}
                      onChange={e => setNewAddrLine(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="st-form-field">
                      <label>City *</label>
                      <input
                        type="text"
                        placeholder="e.g., Surat"
                        value={newAddrCity}
                        onChange={e => setNewAddrCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="st-form-field">
                      <label>State *</label>
                      <input
                        type="text"
                        placeholder="e.g., Gujarat"
                        value={newAddrState}
                        onChange={e => setNewAddrState(e.target.value)}
                        required
                      />
                    </div>
                    <div className="st-form-field">
                      <label>PinCode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="395002"
                        value={newAddrPincode}
                        onChange={e => setNewAddrPincode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Facility
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
