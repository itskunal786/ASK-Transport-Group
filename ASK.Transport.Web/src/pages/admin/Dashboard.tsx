import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import {
  getAdminOperationsSummary,
  type AdminOperationsSummary
} from '../../api/adminApi';
import './AdminDashboard.css';

interface BookingRow {
  bookingNo: string;
  customer: string;
  route: string;
  date: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
}

interface CustomerRow {
  name: string;
  email: string;
  mobile: string;
  status: 'Active' | 'Inactive';
}

const SAMPLE_BOOKINGS: BookingRow[] = [
  { bookingNo: 'ASKB00123', customer: 'Rajesh Kumar', route: 'Delhi → Mumbai', date: '21 Sep 2026', status: 'In Transit' },
  { bookingNo: 'ASKB00122', customer: 'Priya Singh', route: 'Bangalore → Chennai', date: '18 Sep 2026', status: 'Delivered' },
  { bookingNo: 'ASKB00121', customer: 'Amit Patel', route: 'Pune → Hyderabad', date: '15 Sep 2026', status: 'Pending' },
  { bookingNo: 'ASKB00120', customer: 'Neha Jain', route: 'Delhi → Jaipur', date: '12 Sep 2026', status: 'Cancelled' },
  { bookingNo: 'ASKB00119', customer: 'Suresh Reddy', route: 'Kolkata → Patna', date: '10 Sep 2026', status: 'In Transit' },
];

const SAMPLE_CUSTOMERS: CustomerRow[] = [
  { name: 'Rajesh Kumar', email: 'rajesh@example.com', mobile: '9876543210', status: 'Active' },
  { name: 'Priya Singh', email: 'priya@example.com', mobile: '9876543211', status: 'Active' },
  { name: 'Amit Patel', email: 'amit@example.com', mobile: '9876543212', status: 'Inactive' },
  { name: 'Neha Jain', email: 'neha@example.com', mobile: '9876543213', status: 'Active' },
  { name: 'Suresh Reddy', email: 'suresh@example.com', mobile: '9876543214', status: 'Active' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Active view in Admin Panel: 'dashboard' | 'bookings' | 'customers'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'customers'>('dashboard');

  // Dashboard API data
  const [summary, setSummary] = useState<AdminOperationsSummary | null>(null);
  const [activeMonthHover, setActiveMonthHover] = useState<number | null>(7); // Aug default

  // Bookings filter
  const [bookingFilterStatus, setBookingFilterStatus] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [customerList, setCustomerList] = useState<CustomerRow[]>(SAMPLE_CUSTOMERS);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const sumRes = await getAdminOperationsSummary();
      setSummary(sumRes);
    } catch {
      // Use sample data from Image 1 overview if fresh database
    }
  }

  function handleExportCsv() {
    const headers = ['Booking No,Customer,Route,Date,Status'];
    const rows = SAMPLE_BOOKINGS.map(b => `${b.bookingNo},${b.customer},"${b.route}",${b.date},${b.status}`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ASK_Transport_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustName.trim() || !newCustEmail.trim()) return;

    const newCust: CustomerRow = {
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      mobile: newCustPhone.trim() || '9876543210',
      status: 'Active'
    };

    setCustomerList(prev => [newCust, ...prev]);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
  }

  // Monthly trends data for Bookings Trend chart
  const monthlyTrends = [
    { month: 'Jan', count: 42 },
    { month: 'Feb', count: 58 },
    { month: 'Mar', count: 65 },
    { month: 'Apr', count: 72 },
    { month: 'May', count: 80 },
    { month: 'Jun', count: 88 },
    { month: 'Jul', count: 92 },
    { month: 'Aug', count: 98 },
    { month: 'Sep', count: 85 }
  ];

  const filteredBookings = SAMPLE_BOOKINGS.filter(b => {
    if (bookingFilterStatus !== 'All' && b.status !== bookingFilterStatus) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.bookingNo.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.route.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredCustomers = customerList.filter(c => {
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.mobile.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="admin-layout-container">
      {/* 1. DARK ADMIN SIDEBAR (Image 1) */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">A</div>
          <div className="admin-brand-text">
            <strong>ASK TRANSPORT</strong>
            <small>LOGISTICS &amp; SUPPLY CHAIN</small>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Dashboard
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Bookings
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Customers
          </button>

          <button type="button" className="admin-nav-item" onClick={() => setActiveTab('dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
            </svg>
            Shipments
          </button>

          <button type="button" className="admin-nav-item" onClick={() => setActiveTab('dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            </svg>
            Drivers
          </button>

          <button type="button" className="admin-nav-item" onClick={() => setActiveTab('dashboard')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Vehicles
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-switch-link">
            ← Switch to Customer Portal
          </Link>

          <button type="button" onClick={logout} className="admin-logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <main className="admin-main-viewport">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-top-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search by booking, shipment or driver..." />
          </div>

          <div className="admin-top-profile">
            <ThemeToggle />
            <div className="admin-profile-pill">
              <div className="admin-user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="admin-user-names">
                <strong>{user?.name || 'Super Admin'}</strong>
                <small>{user?.role || 'Administrator'}</small>
              </div>
            </div>
          </div>
        </header>

        {/* VIEW 1: ADMIN DASHBOARD (Image 1 Bottom-Left) */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="admin-screen-head">
              <div>
                <h1>Admin Dashboard</h1>
                <p>Complete overview of your transport operations</p>
              </div>
              <div className="admin-timestamp-text">
                21 Sep 2026 · Last updated: 10:15 PM
              </div>
            </div>

            {/* 4 KPI STAT CARDS */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon bookings">📦</div>
                  <div className="admin-box-content">
                    <strong>{summary?.totalBookings ?? 245}</strong>
                    <span>Total Bookings</span>
                  </div>
                </div>
                <div className="admin-box-delta green">+12% from last month</div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon transit">🚚</div>
                  <div className="admin-box-content">
                    <strong>{summary?.inTransitShipments ?? 120}</strong>
                    <span>In Transit</span>
                  </div>
                </div>
                <div className="admin-box-delta green">+8% from last month</div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon delivered">✓</div>
                  <div className="admin-box-content">
                    <strong>{summary?.deliveredShipments ?? 98}</strong>
                    <span>Delivered</span>
                  </div>
                </div>
                <div className="admin-box-delta green">+15% from last month</div>
              </div>

              <div className="admin-metric-box">
                <div className="admin-box-top">
                  <div className="admin-box-icon pending">⏱️</div>
                  <div className="admin-box-content">
                    <strong>{summary?.pendingBookings ?? 27}</strong>
                    <span>Pending</span>
                  </div>
                </div>
                <div className="admin-box-delta red">-5% from last month</div>
              </div>
            </div>

            {/* 2 CHARTS ROW (Image 1) */}
            <div className="admin-charts-row">
              {/* BOOKINGS TREND BAR CHART */}
              <div className="admin-chart-card">
                <div className="admin-chart-head">
                  <h3>Bookings Trend</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Monthly Volume</span>
                </div>

                <div className="admin-bar-chart-container">
                  {monthlyTrends.map((item, idx) => {
                    const isHovered = activeMonthHover === idx;
                    const heightPercent = Math.min(100, Math.round((item.count / 100) * 100));

                    return (
                      <div
                        key={idx}
                        className="admin-bar-col"
                        onMouseEnter={() => setActiveMonthHover(idx)}
                      >
                        {isHovered && (
                          <div className="admin-bar-tooltip">
                            {item.count} bookings · {item.month} 2026
                          </div>
                        )}
                        <div
                          className={`admin-bar-fill ${isHovered ? 'active' : ''}`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="admin-bar-label">{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SHIPMENT STATUS DONUT CHART */}
              <div className="admin-chart-card">
                <div className="admin-chart-head">
                  <h3>Shipment Status</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>245 Active</span>
                </div>

                <div className="admin-donut-wrapper">
                  <div className="admin-donut-svg-wrap">
                    <svg viewBox="0 0 36 36" width="100%" height="100%">
                      {/* Background Circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="3.8"
                      />
                      {/* Delivered 40% (Green) */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeDasharray="40, 100"
                        strokeDashoffset="25"
                      />
                      {/* In Transit 35% (Blue) */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#0b72e7"
                        strokeWidth="4"
                        strokeDasharray="35, 100"
                        strokeDashoffset="-15"
                      />
                      {/* Pending 15% (Yellow) */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeDasharray="15, 100"
                        strokeDashoffset="-50"
                      />
                      {/* Cancelled 10% (Red) */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="4"
                        strokeDasharray="10, 100"
                        strokeDashoffset="-65"
                      />
                    </svg>

                    <div className="admin-donut-center">
                      <strong>245</strong>
                      <small>Total Units</small>
                    </div>
                  </div>

                  <div className="admin-donut-legend">
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot delivered" />
                      <span>Delivered</span>
                      <strong className="admin-legend-val">40%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot transit" />
                      <span>In Transit</span>
                      <strong className="admin-legend-val">35%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot pending" />
                      <span>Pending</span>
                      <strong className="admin-legend-val">15%</strong>
                    </div>
                    <div className="admin-legend-item">
                      <div className="admin-legend-dot cancelled" />
                      <span>Cancelled</span>
                      <strong className="admin-legend-val">10%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: MANAGE BOOKINGS (Image 1 Bottom-Middle) */}
        {activeTab === 'bookings' && (
          <div>
            <div className="admin-screen-head">
              <div>
                <h1>Manage Bookings</h1>
                <p>Real-time booking dispatch and order management</p>
              </div>
            </div>

            {/* STATUS TABS */}
            <div className="admin-tab-nav">
              {['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`admin-tab-btn ${bookingFilterStatus === st ? 'active' : ''}`}
                  onClick={() => setBookingFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* FILTER BAR */}
            <div className="admin-filter-bar">
              <div className="admin-search-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by booking, customer or route..."
                  value={bookingSearch}
                  onChange={e => setBookingSearch(e.target.value)}
                />
              </div>

              <button type="button" className="admin-export-btn" onClick={handleExportCsv}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            </div>

            {/* DATA TABLE */}
            <div className="admin-card-table">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Booking No.</th>
                    <th>Customer</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b, i) => {
                    const statusClass = b.status.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0b72e7' }}>
                          {b.bookingNo}
                        </td>
                        <td style={{ fontWeight: 600 }}>{b.customer}</td>
                        <td>{b.route}</td>
                        <td style={{ color: '#64748b' }}>{b.date}</td>
                        <td>
                          <span className={`db-status-pill ${statusClass}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-btn-view"
                            onClick={() => alert(`Booking Details:\nID: ${b.bookingNo}\nCustomer: ${b.customer}\nRoute: ${b.route}\nStatus: ${b.status}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="admin-pagination-row">
                <span className="admin-page-pill">‹</span>
                <span className="admin-page-pill active">1</span>
                <span className="admin-page-pill">2</span>
                <span className="admin-page-pill">3</span>
                <span className="admin-page-pill">4</span>
                <span className="admin-page-pill">5</span>
                <span className="admin-page-pill">›</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: CUSTOMERS (Image 1 Bottom-Right) */}
        {activeTab === 'customers' && (
          <div>
            <div className="admin-screen-head">
              <div>
                <h1>Customers</h1>
                <p>Manage customer profiles, contact info and account access</p>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="admin-filter-bar">
              <div className="admin-search-input-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email or mobile..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="admin-primary-action-btn"
                onClick={() => setShowAddCustomerModal(true)}
              >
                + Add Customer
              </button>
            </div>

            {/* DATA TABLE */}
            <div className="admin-card-table">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ color: '#0b72e7' }}>{c.email}</td>
                      <td style={{ color: '#64748b' }}>{c.mobile}</td>
                      <td>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: c.status === 'Active' ? '#edfdf4' : '#fee2e2',
                            color: c.status === 'Active' ? '#10b981' : '#dc2626'
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-view"
                          onClick={() => alert(`Customer Profile:\nName: ${c.name}\nEmail: ${c.email}\nPhone: ${c.mobile}\nStatus: ${c.status}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="admin-pagination-row">
                <span className="admin-page-pill">‹</span>
                <span className="admin-page-pill active">1</span>
                <span className="admin-page-pill">2</span>
                <span className="admin-page-pill">3</span>
                <span className="admin-page-pill">4</span>
                <span className="admin-page-pill">5</span>
                <span className="admin-page-pill">›</span>
              </div>
            </div>
          </div>
        )}

        {/* ADD CUSTOMER MODAL */}
        {showAddCustomerModal && (
          <div className="st-modal-overlay" onClick={() => setShowAddCustomerModal(false)}>
            <div className="st-drawer-box" onClick={e => e.stopPropagation()}>
              <div className="st-drawer-head">
                <div>
                  <h2>Add New Customer</h2>
                  <p>Register a verified client account</p>
                </div>
                <button
                  type="button"
                  className="st-drawer-close"
                  onClick={() => setShowAddCustomerModal(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddCustomer}>
                <div className="st-drawer-body">
                  <div className="st-form-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Vikram Singhania"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g., vikram@company.com"
                      value={newCustEmail}
                      onChange={e => setNewCustEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="st-form-field">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g., 9876543210"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="st-drawer-actions">
                  <button
                    type="button"
                    className="st-btn-cancel"
                    onClick={() => setShowAddCustomerModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="st-btn-submit">
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
