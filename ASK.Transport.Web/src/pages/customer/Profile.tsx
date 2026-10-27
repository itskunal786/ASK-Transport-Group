import { useState, useEffect, type FormEvent } from 'react';
import CustomerLayout from '../../layouts/CustomerLayout';
import { useAuth } from '../../context/AuthContext';
import { changePassword, deactivateAccount, updateProfile } from '../../api/accountApi';
import { lookupPinCode } from '../../api/pinCodeApi';
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

interface BusinessProfile {
  companyName: string;
  gstin: string;
  panNumber: string;
  industryType: string;
  billingAddress: string;
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
  const { user, logout, updateUser } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'addresses' | 'security'>('profile');

  // Editable Profile State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Business Profile State
  const [business, setBusiness] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('ask_user_business');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      companyName: 'ASK Enterprise Logistics',
      gstin: '07AAAAA0000A1Z5',
      panNumber: 'AAAAA0000A',
      industryType: 'Supply Chain & Logistics',
      billingAddress: 'Sector 18, Gurugram, Haryana - 122015'
    };
  });
  const [bizLoading, setBizLoading] = useState(false);
  const [bizSuccess, setBizSuccess] = useState('');

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
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Handle Profile Update
  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('Account name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      setProfileError('Mobile phone number is required.');
      return;
    }

    try {
      setProfileLoading(true);
      const res = await updateProfile({
        name: name.trim(),
        phone: phone.trim()
      });

      updateUser({
        name: name.trim(),
        phone: phone.trim()
      });

      setProfileSuccess(res.message || 'Profile details updated successfully.');
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  }

  // Handle Business Details Update
  function handleSaveBusiness(e: FormEvent) {
    e.preventDefault();
    setBizLoading(true);
    setBizSuccess('');

    localStorage.setItem('ask_user_business', JSON.stringify(business));
    setTimeout(() => {
      setBizLoading(false);
      setBizSuccess('Business details and GSTIN updated successfully.');
    }, 400);
  }

  // Handle Pincode Auto-Resolution in Address Modal
  async function handlePincodeChange(val: string) {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setNewAddrPincode(clean);
    setPinError('');

    if (clean.length === 6) {
      try {
        setPinLoading(true);
        const data = await lookupPinCode(clean);
        if (data && data.city && data.state) {
          setNewAddrCity(data.city);
          setNewAddrState(data.state);
        }
      } catch (err: any) {
        setPinError(err?.message || 'Invalid Indian PIN code.');
      } finally {
        setPinLoading(false);
      }
    }
  }

  // Handle Save Address
  function handleSaveAddress(e: FormEvent) {
    e.preventDefault();
    if (!newAddrTitle.trim() || !newAddrLine.trim() || !newAddrPincode.trim()) {
      setPinError('Please fill in title, street address, and PIN code.');
      return;
    }

    const newAddr: SavedAddress = {
      id: `ADDR-${Date.now()}`,
      title: newAddrTitle.trim(),
      tag: newAddrTag,
      contactPerson: newAddrPerson.trim() || user?.name || 'Authorized Contact',
      phone: newAddrPhone.trim() || phone || '9876543210',
      addressLine: newAddrLine.trim(),
      city: newAddrCity.trim() || 'Logistics Zone',
      state: newAddrState.trim() || 'India',
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
    setPinError('');
  }

  function handleDeleteAddress(id: string) {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('ask_saved_addresses', JSON.stringify(updated));
  }

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
        newPassword
      });

      setPasswordSuccess(res.message || 'Password changed successfully. Please log in again.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2500);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to update password.');
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
    } catch (err: any) {
      setDeactivateError(err?.message || 'Failed to deactivate account.');
      setDeactivating(false);
    }
  }

  return (
    <CustomerLayout>
      <div className="profile-page">
        {/* HEADER HERO */}
        <div className="profile-hero">
          <span className="profile-eyebrow">User Control Center</span>
          <h1>User Account &amp; Profile Settings</h1>
          <p>View, manage, and update your personal details, business credentials, and logistics hubs.</p>
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
              <span>{user?.phone || 'No phone registered'}</span>
              <span className="bullet-sep">•</span>
              <span className="role-tag" style={{
                background: user?.role === 'SuperAdmin' ? '#fef3c7' : user?.role === 'Admin' ? '#ede9fe' : '#e0f2fe',
                color: user?.role === 'SuperAdmin' ? '#b45309' : user?.role === 'Admin' ? '#6d28d9' : '#0284c7'
              }}>
                {user?.role === 'SuperAdmin' ? '👑 Super Admin' : user?.role === 'Admin' ? '⚡ Administrator' : '👤 Customer / User'}
              </span>
              <span className="bullet-sep">•</span>
              <span className="status-indicator">Active Account</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="profile-tabs-bar" style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '24px',
          paddingBottom: '2px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'profile' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'profile' ? '3px solid #0284c7' : '3px solid transparent'
            }}
          >
            👤 Personal Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'business' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'business' ? '3px solid #0284c7' : '3px solid transparent'
            }}
          >
            🏢 Company &amp; GST Details
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'addresses' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'addresses' ? '3px solid #0284c7' : '3px solid transparent'
            }}
          >
            📍 Address Book ({addresses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'security' ? '#0284c7' : '#64748b',
              borderBottom: activeTab === 'security' ? '3px solid #0284c7' : '3px solid transparent'
            }}
          >
            🔒 Security &amp; Password
          </button>
        </div>

        {/* TAB 1: PERSONAL DETAILS (EDITABLE) */}
        {activeTab === 'profile' && (
          <div className="profile-grid">
            <div className="profile-card">
              <div className="profile-card-head">
                <div className="profile-card-icon">✏️</div>
                <div>
                  <h2>Update Personal Details</h2>
                  <p>Edit your full name and registered contact number</p>
                </div>
              </div>

              {profileSuccess && (
                <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#047857', marginBottom: '16px', fontSize: '13px' }}>
                  ✓ {profileSuccess}
                </div>
              )}

              {profileError && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c', marginBottom: '16px', fontSize: '13px' }}>
                  ⚠ {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address (Account Identifier)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Primary email is verified and cannot be changed directly for security.
                  </small>
                </div>

                <button
                  type="submit"
                  className="profile-btn-primary"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* ACCOUNT SUMMARY CARD */}
            <div className="profile-card">
              <div className="profile-card-head">
                <div className="profile-card-icon">📋</div>
                <div>
                  <h2>Account Credentials &amp; Status</h2>
                  <p>Real-time account metadata and verification state</p>
                </div>
              </div>

              <div className="profile-info-list">
                <div className="profile-info-item">
                  <span className="profile-info-label">User ID</span>
                  <span className="profile-info-value">#{user?.id || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Assigned Role</span>
                  <span className="profile-info-value" style={{ fontWeight: 700 }}>
                    {user?.role || 'User'}
                  </span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Email Verification</span>
                  <span className="verified-badge">✓ Verified</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Account Status</span>
                  <span className="verified-badge" style={{ background: '#edfdf4', color: '#10b981' }}>● Active</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Platform Access</span>
                  <span className="profile-info-value">Full Shipper Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BUSINESS DETAILS */}
        {activeTab === 'business' && (
          <div className="profile-grid">
            <div className="profile-card" style={{ gridColumn: 'span 2' }}>
              <div className="profile-card-head">
                <div className="profile-card-icon">🏛️</div>
                <div>
                  <h2>Corporate &amp; GST Details</h2>
                  <p>Business information used for automated freight invoices, e-Way bills, and tax credits</p>
                </div>
              </div>

              {bizSuccess && (
                <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#047857', marginBottom: '16px', fontSize: '13px' }}>
                  ✓ {bizSuccess}
                </div>
              )}

              <form onSubmit={handleSaveBusiness} className="profile-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>Registered Company / Trade Name</label>
                    <input
                      type="text"
                      value={business.companyName}
                      onChange={e => setBusiness({ ...business, companyName: e.target.value })}
                      placeholder="e.g. ASK Logistics Pvt Ltd"
                    />
                  </div>

                  <div className="form-group">
                    <label>GSTIN Number (15-digit)</label>
                    <input
                      type="text"
                      value={business.gstin}
                      onChange={e => setBusiness({ ...business, gstin: e.target.value.toUpperCase() })}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      maxLength={15}
                    />
                  </div>

                  <div className="form-group">
                    <label>Company PAN Card Number</label>
                    <input
                      type="text"
                      value={business.panNumber}
                      onChange={e => setBusiness({ ...business, panNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. AAAAA0000A"
                      maxLength={10}
                    />
                  </div>

                  <div className="form-group">
                    <label>Industry / Vertical</label>
                    <select
                      value={business.industryType}
                      onChange={e => setBusiness({ ...business, industryType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px'
                      }}
                    >
                      <option value="Supply Chain & Logistics">Supply Chain &amp; Logistics</option>
                      <option value="Manufacturing & Industrial">Manufacturing &amp; Industrial</option>
                      <option value="E-Commerce & Retail">E-Commerce &amp; Retail</option>
                      <option value="Pharmaceutical & Healthcare">Pharmaceutical &amp; Healthcare</option>
                      <option value="Automotive & Ancillary">Automotive &amp; Ancillary</option>
                      <option value="Textiles & Garments">Textiles &amp; Garments</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Registered Corporate Billing Address</label>
                    <input
                      type="text"
                      value={business.billingAddress}
                      onChange={e => setBusiness({ ...business, billingAddress: e.target.value })}
                      placeholder="Complete billing address for GST invoices"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="profile-btn-primary"
                  style={{ marginTop: '16px' }}
                  disabled={bizLoading}
                >
                  {bizLoading ? 'Saving...' : 'Save Business Information'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ADDRESS BOOK */}
        {activeTab === 'addresses' && (
          <div className="profile-card" style={{ width: '100%' }}>
            <div className="profile-card-head" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="profile-card-icon">📍</div>
                <div>
                  <h2>Saved Logistics Hubs &amp; Addresses</h2>
                  <p>Quickly select verified pickup and delivery hubs during booking</p>
                </div>
              </div>

              <button
                type="button"
                className="profile-btn-primary"
                onClick={() => setShowAddAddressModal(true)}
              >
                + Add Hub / Address
              </button>
            </div>

            <div className="addresses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {addresses.map(addr => (
                <div key={addr.id} className="address-card" style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#f8fafc',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        fontSize: '11px',
                        fontWeight: 700,
                        marginRight: '8px'
                      }}>
                        {addr.tag}
                      </span>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>{addr.title}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                      title="Delete Address"
                    >
                      Delete
                    </button>
                  </div>

                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#475569' }}>
                    {addr.addressLine}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#09284a', fontWeight: 600 }}>
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px' }}>
                    <span>👤 {addr.contactPerson}</span>
                    <span>📞 {addr.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="profile-grid">
            <div className="profile-card">
              <div className="profile-card-head">
                <div className="profile-card-icon">🔒</div>
                <div>
                  <h2>Change Password</h2>
                  <p>Update your password regularly to protect your account</p>
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
                  <label>Current Password *</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="profile-btn-primary"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* DANGER ZONE */}
            <div className="profile-card danger-card">
              <div className="profile-card-head">
                <div className="profile-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>⚠️</div>
                <div>
                  <h2>Account Danger Zone</h2>
                  <p>Deactivate account or revoke active sessions</p>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                Deactivating your account will instantly terminate all active login sessions and freeze ongoing bookings. You will need to contact ASK Support to reactivate.
              </p>

              <button
                type="button"
                className="profile-btn-danger"
                onClick={() => setShowDeactivateModal(true)}
                style={{ marginTop: '16px' }}
              >
                Deactivate My Account
              </button>
            </div>
          </div>
        )}

        {/* ADD ADDRESS MODAL */}
        {showAddAddressModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-head">
                <h3>Add New Logistics Hub / Address</h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowAddAddressModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="modal-form">
                <div className="form-group">
                  <label>Location Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Okhla Warehouse #3"
                    value={newAddrTitle}
                    onChange={e => setNewAddrTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location Tag</label>
                  <select
                    value={newAddrTag}
                    onChange={e => setNewAddrTag(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Warehouse">Warehouse</option>
                    <option value="Office">Office</option>
                    <option value="Factory">Factory</option>
                    <option value="Home">Home</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      placeholder="Manager Name"
                      value={newAddrPerson}
                      onChange={e => setNewAddrPerson(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={newAddrPhone}
                      onChange={e => setNewAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    placeholder="Building, Plot, Industrial Area"
                    value={newAddrLine}
                    onChange={e => setNewAddrLine(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      placeholder="6 Digits"
                      value={newAddrPincode}
                      onChange={e => handlePincodeChange(e.target.value)}
                      maxLength={6}
                      required
                    />
                    {pinLoading && <span style={{ fontSize: '11px', color: '#0284c7' }}>Verifying...</span>}
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddrCity}
                      onChange={e => setNewAddrCity(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddrState}
                      onChange={e => setNewAddrState(e.target.value)}
                    />
                  </div>
                </div>

                {pinError && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    ⚠ {pinError}
                  </div>
                )}

                <div className="modal-actions" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => setShowAddAddressModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DEACTIVATE CONFIRMATION MODAL */}
        {showDeactivateModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-head">
                <h3 style={{ color: '#dc2626' }}>Deactivate Account</h3>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowDeactivateModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDeactivateAccount} className="modal-form">
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Please confirm by typing your current password. Once deactivated, you will be logged out immediately.
                </p>

                {deactivateError && (
                  <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>
                    {deactivateError}
                  </div>
                )}

                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter password to confirm"
                    value={deactivatePassword}
                    onChange={e => setDeactivatePassword(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={() => setShowDeactivateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="profile-btn-danger"
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
