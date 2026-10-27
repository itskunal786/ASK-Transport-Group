import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../../layouts/CustomerLayout';
import { getClientBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import type { ClientBooking } from '../../types/booking';
import '../../styles/DashboardHome.css';

interface DisplayShipment {
  bookingNumber: string;
  from: string;
  to: string;
  status: 'In Transit' | 'Delivered' | 'Pending' | 'Cancelled';
  date: string;
  actionText: string;
  actionLink: string;
  actionType: 'primary' | 'outline';
}

const DEFAULT_RECENT_SHIPMENTS: DisplayShipment[] = [
  {
    bookingNumber: 'ASKB00123',
    from: 'Delhi',
    to: 'Mumbai',
    status: 'In Transit',
    date: '21 Sep 2026',
    actionText: 'Track',
    actionLink: '/tracking',
    actionType: 'outline'
  },
  {
    bookingNumber: 'ASKB00122',
    from: 'Bangalore',
    to: 'Chennai',
    status: 'Delivered',
    date: '18 Sep 2026',
    actionText: 'View',
    actionLink: '/bookings',
    actionType: 'outline'
  },
  {
    bookingNumber: 'ASKB00121',
    from: 'Pune',
    to: 'Hyderabad',
    status: 'Pending',
    date: '15 Sep 2026',
    actionText: 'Pay Now',
    actionLink: '/payments',
    actionType: 'primary'
  },
  {
    bookingNumber: 'ASKB00120',
    from: 'Delhi',
    to: 'Jaipur',
    status: 'Cancelled',
    date: '12 Sep 2026',
    actionText: 'View',
    actionLink: '/bookings',
    actionType: 'outline'
  },
  {
    bookingNumber: 'ASKB00119',
    from: 'Kolkata',
    to: 'Patna',
    status: 'In Transit',
    date: '10 Sep 2026',
    actionText: 'Track',
    actionLink: '/tracking',
    actionType: 'outline'
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ClientBooking[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const response = await getClientBookings();
      if (response?.items && response.items.length > 0) {
        setBookings(response.items);
      }
    } catch {
      // Keep defaults from overview
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  const totalBookingsCount = bookings.length > 0 ? bookings.length : 12;
  const inTransitCount = bookings.length > 0
    ? bookings.filter(b => b.bookingStatus === 'In Transit' || b.bookingStatus === 'Picked Up').length
    : 8;
  const deliveredCount = bookings.length > 0
    ? bookings.filter(b => b.bookingStatus === 'Delivered').length
    : 3;
  const pendingCount = bookings.length > 0
    ? bookings.filter(b => b.bookingStatus === 'Booked' || b.bookingStatus === 'Pending').length
    : 1;

  return (
    <CustomerLayout>
      <div className="db-home-screen">
        {/* 1. GREETING BANNER */}
        <div className="db-greeting-banner">
          <div className="db-greeting-titles">
            <h1>
              {getGreeting()}, {user?.name || 'Kunal'}! 👋
            </h1>
            <p>Here's what's happening with your shipments today.</p>
          </div>

          <div className="db-greeting-quote">
            “Reliable Transport. Real Progress.”
            <small>— ASK Transport</small>
          </div>
        </div>

        {/* 2. STATS CARDS (4 Cards matching Image 1) */}
        <section className="db-stats-grid">
          {/* TOTAL BOOKINGS */}
          <div className="db-stat-box">
            <div className="db-stat-header">
              <div className="db-stat-avatar bookings">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="db-stat-numbers">
                <strong>{totalBookingsCount}</strong>
                <span>Total Bookings</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag green">+20% from last month</span>
              <svg className="db-sparkline" viewBox="0 0 50 15" fill="none">
                <path d="M0 10 Q12 12, 25 6 T50 2" stroke="#0b72e7" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>

          {/* IN TRANSIT */}
          <div className="db-stat-box">
            <div className="db-stat-header">
              <div className="db-stat-avatar in-transit">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div className="db-stat-numbers">
                <strong>{inTransitCount}</strong>
                <span>In Transit</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag green">+2 new today</span>
            </div>
          </div>

          {/* DELIVERED */}
          <div className="db-stat-box">
            <div className="db-stat-header">
              <div className="db-stat-avatar delivered">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="db-stat-numbers">
                <strong>{deliveredCount}</strong>
                <span>Delivered</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag green">+12% from last month</span>
            </div>
          </div>

          {/* PENDING */}
          <div className="db-stat-box">
            <div className="db-stat-header">
              <div className="db-stat-avatar pending">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="db-stat-numbers">
                <strong>{pendingCount}</strong>
                <span>Pending</span>
              </div>
            </div>
            <div className="db-stat-footer">
              <span className="db-delta-tag amber">Action required</span>
            </div>
          </div>
        </section>

        {/* 3. MAIN DASHBOARD CONTENT SPLIT */}
        <div className="db-main-split">
          {/* LEFT: RECENT SHIPMENTS + LIVE TRACKING */}
          <div className="db-left-section">
            {/* RECENT SHIPMENTS TABLE */}
            <div className="db-section-card">
              <div className="db-card-head">
                <h2>Recent Shipments</h2>
                <Link to="/bookings" className="db-link-btn">
                  View All
                </Link>
              </div>

              <div className="db-table-scroll">
                <table className="db-shipments-table">
                  <thead>
                    <tr>
                      <th>Booking No.</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_RECENT_SHIPMENTS.map((s, idx) => {
                      const statusClass = s.status.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <tr key={idx}>
                          <td className="db-bk-id">{s.bookingNumber}</td>
                          <td>{s.from}</td>
                          <td>{s.to}</td>
                          <td>
                            <span className={`db-status-pill ${statusClass}`}>
                              {s.status}
                            </span>
                          </td>
                          <td style={{ color: '#64748b' }}>{s.date}</td>
                          <td>
                            <Link
                              to={s.actionLink}
                              className={`db-btn-action ${s.actionType}`}
                            >
                              {s.actionText}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LIVE TRACKING MAP CARD */}
            <div className="db-section-card">
              <div className="db-card-head">
                <h2>Live Tracking</h2>
                <Link to="/tracking" className="db-link-btn">
                  View Map
                </Link>
              </div>

              <div className="db-tracking-map-box">
                <div className="db-map-route">
                  {/* ORIGIN */}
                  <div className="db-route-point">
                    <div className="db-pin-dot delhi" />
                    <span className="db-point-name">Delhi</span>
                  </div>

                  {/* ROUTE LINE WITH TRUCK PROGRESS */}
                  <div className="db-route-line-wrap">
                    <div className="db-route-line-progress" />
                    <div className="db-truck-marker">
                      🚚 On the way · ETA: 22 Sep, 10:30 AM
                    </div>
                  </div>

                  {/* DESTINATION */}
                  <div className="db-route-point">
                    <div className="db-pin-dot mumbai" />
                    <span className="db-point-name">Mumbai</span>
                  </div>
                </div>

                <div className="db-map-footer">
                  <span>📍 Active GPS Telemetry: NH-48 Express Corridor</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>● Speed: 62 km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: QUICK ACTIONS + PROMO CARD */}
          <div className="db-right-section">
            {/* QUICK ACTIONS */}
            <div className="db-quick-actions-card">
              <h3>Quick Actions</h3>

              <div className="db-qa-list">
                <Link to="/book" className="db-qa-item">
                  <div className="db-qa-icon book">📦</div>
                  <div className="db-qa-texts">
                    <strong>Book a Shipment</strong>
                    <span>Create a new shipment request</span>
                  </div>
                </Link>

                <Link to="/tracking" className="db-qa-item">
                  <div className="db-qa-icon track">🎯</div>
                  <div className="db-qa-texts">
                    <strong>Track Shipment</strong>
                    <span>Real-time cargo tracking</span>
                  </div>
                </Link>

                <Link to="/payments" className="db-qa-item">
                  <div className="db-qa-icon pay">💳</div>
                  <div className="db-qa-texts">
                    <strong>Make a Payment</strong>
                    <span>Pay securely via Razorpay</span>
                  </div>
                </Link>

                <Link to="/invoices" className="db-qa-item">
                  <div className="db-qa-icon invoice">📄</div>
                  <div className="db-qa-texts">
                    <strong>Download Invoice</strong>
                    <span>Access GST shipment invoices</span>
                  </div>
                </Link>

                <Link to="/documents" className="db-qa-item">
                  <div className="db-qa-icon doc">📁</div>
                  <div className="db-qa-texts">
                    <strong>Upload Document</strong>
                    <span>Submit required booking PODs</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* PROMOTIONAL CARD ("Delivering India A Stronger Tomorrow") */}
            <div className="db-promo-card">
              <h4 className="db-promo-title">
                Delivering India A Stronger Tomorrow
              </h4>
              <p className="db-promo-sub">
                Safe. Reliable. On Time. Across 28+ States
              </p>

              <Link to="/book" className="db-promo-btn">
                Book Now →
              </Link>

              <div className="db-promo-metrics">
                <div className="db-promo-metric-item">
                  <span>🚚</span>
                  <span><strong>500K+</strong> Shipments Delivered</span>
                </div>
                <div className="db-promo-metric-item">
                  <span>📍</span>
                  <span><strong>28+</strong> States Covered</span>
                </div>
                <div className="db-promo-metric-item">
                  <span>⏱️</span>
                  <span><strong>99.2%</strong> On-Time Delivery</span>
                </div>
                <div className="db-promo-metric-item">
                  <span>🎧</span>
                  <span><strong>24/7</strong> Customer Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
