import {
  useEffect,
  useState
} from 'react';

import {
  Link
} from 'react-router-dom';

import {
  getClientBookings
} from '../../api/bookingApi';

import {
  useAuth
} from '../../context/AuthContext';

import type {
  ClientBooking
} from '../../types/booking';


export default function Dashboard() {
  const { user, logout } = useAuth();

  const [bookings, setBookings] =
    useState<ClientBooking[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {
    loadBookings();
  }, []);


  async function loadBookings() {
    try {
      setLoading(true);
      setError('');

      const response =
        await getClientBookings();

      setBookings(
        response.items ?? []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load bookings.'
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleLogout() {
    await logout();

    window.location.href = '/login';
  }


  const totalBookings =
    bookings.length;


  const inTransit =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
          'In Transit' ||
        booking.bookingStatus ===
          'Picked Up'
    ).length;


  const delivered =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        'Delivered'
    ).length;


  const pending =
    bookings.filter(
      (booking) =>
        booking.bookingStatus ===
        'Booked'
    ).length;


  const recentBookings =
    bookings.slice(0, 5);


  function formatDate(date: string) {
    return new Date(date)
      .toLocaleDateString('en-IN');
  }


  function statusClass(status: string) {
    return status
      .toLowerCase()
      .replaceAll(' ', '-');
  }


  return (
    <div className="customer-dashboard">

      {/* SIDEBAR */}

      <aside className="customer-sidebar">

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            <span />
            <span />
            <span />
          </div>

          <div>
            <strong>
              ASK TRANSPORT
            </strong>

            <small>
              LOGISTICS
            </small>
          </div>

        </div>


        <nav className="dashboard-nav">

          <Link
            className="active"
            to="/"
          >
            <span>01</span>
            Dashboard
          </Link>

          <Link to="/book">
            <span>02</span>
            Book Shipment
          </Link>

          <Link to="/bookings">
            <span>03</span>
            My Bookings
          </Link>

          <Link to="/tracking">
            <span>04</span>
            Track Shipment
          </Link>

          <Link to="/payments">
            <span>05</span>
            Payments
          </Link>

          <Link to="/invoices">
            <span>06</span>
            Invoices
          </Link>

          <Link to="/documents">
            <span>07</span>
            Documents
          </Link>

          <Link to="/support">
            <span>08</span>
            Support
          </Link>

        </nav>


        <div className="sidebar-bottom">

          <Link to="/profile">
            Profile
          </Link>

          <button
            type="button"
            onClick={handleLogout}
          >
            Sign Out
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>
            <span className="dashboard-label">
              CUSTOMER PORTAL
            </span>

            <h1>
              Welcome back,{' '}
              {user?.name || 'Customer'}
            </h1>

            <p>
              Here is an overview of your
              transport activity.
            </p>
          </div>


          <div className="dashboard-user">

            <div className="user-avatar">
              {user?.name
                ?.charAt(0)
                .toUpperCase() || 'U'}
            </div>

            <div>
              <strong>
                {user?.name}
              </strong>

              <small>
                {user?.email}
              </small>
            </div>

          </div>

        </header>


        {/* QUICK ACTION */}

        <section className="dashboard-actions">

          <div>

            <span>
              FAST & RELIABLE LOGISTICS
            </span>

            <h2>
              Ready to send your
              next shipment?
            </h2>

            <p>
              Book, manage and track your
              deliveries from one dashboard.
            </p>

          </div>


          <div className="action-buttons">

            <Link
              className="primary-action"
              to="/book"
            >
              Book Shipment
            </Link>

            <Link
              className="secondary-action"
              to="/tracking"
            >
              Track Shipment
            </Link>

          </div>

        </section>


        {/* STATS */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-top">
              <span>Total Bookings</span>
              <small>ALL</small>
            </div>

            <strong>
              {totalBookings}
            </strong>

            <p>
              Total shipments booked
            </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">
              <span>In Transit</span>
              <small>LIVE</small>
            </div>

            <strong>
              {inTransit}
            </strong>

            <p>
              Currently moving
            </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">
              <span>Delivered</span>
              <small>DONE</small>
            </div>

            <strong>
              {delivered}
            </strong>

            <p>
              Successfully delivered
            </p>

          </div>


          <div className="stat-card">

            <div className="stat-top">
              <span>Pending</span>
              <small>NEW</small>
            </div>

            <strong>
              {pending}
            </strong>

            <p>
              Awaiting processing
            </p>

          </div>

        </section>


        {/* CONTENT */}

        <section className="dashboard-content">

          {/* BOOKINGS */}

          <div className="recent-bookings">

            <div className="section-heading">

              <div>
                <span>
                  RECENT ACTIVITY
                </span>

                <h2>
                  Recent Bookings
                </h2>
              </div>

              <Link to="/bookings">
                View All
              </Link>

            </div>


            {loading && (
              <div className="dashboard-message">
                Loading bookings...
              </div>
            )}


            {error && (
              <div className="dashboard-error">
                {error}
              </div>
            )}


            {!loading &&
             !error &&
             recentBookings.length === 0 && (

              <div className="empty-bookings">

                <strong>
                  No bookings yet
                </strong>

                <p>
                  Your recent shipments
                  will appear here.
                </p>

                <Link to="/book">
                  Create First Booking
                </Link>

              </div>

            )}


            {!loading &&
             recentBookings.length > 0 && (

              <div className="booking-table-wrap">

                <table className="booking-table">

                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Amount</th>
                    </tr>
                  </thead>

                  <tbody>

                    {recentBookings.map(
                      (booking) => (

                      <tr key={booking.id}>

                        <td>
                          <strong>
                            {booking.bookingNumber}
                          </strong>
                        </td>

                        <td>
                          {formatDate(
                            booking.createdAt
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              'booking-status ' +
                              statusClass(
                                booking.bookingStatus
                              )
                            }
                          >
                            {booking.bookingStatus}
                          </span>
                        </td>

                        <td>
                          {booking.paymentStatus}
                        </td>

                        <td>
                          ₹
                          {booking.totalAmount
                            .toLocaleString(
                              'en-IN'
                            )}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* QUICK PANEL */}

          <aside className="dashboard-quick">

            <div className="section-heading">

              <div>
                <span>
                  SHORTCUTS
                </span>

                <h2>
                  Quick Actions
                </h2>
              </div>

            </div>


            <Link to="/book">
              <div className="quick-number">
                01
              </div>

              <div>
                <strong>
                  Book Shipment
                </strong>

                <small>
                  Create a new booking
                </small>
              </div>
            </Link>


            <Link to="/tracking">
              <div className="quick-number">
                02
              </div>

              <div>
                <strong>
                  Track Shipment
                </strong>

                <small>
                  Check shipment status
                </small>
              </div>
            </Link>


            <Link to="/invoices">
              <div className="quick-number">
                03
              </div>

              <div>
                <strong>
                  View Invoices
                </strong>

                <small>
                  Billing and invoices
                </small>
              </div>
            </Link>


            <Link to="/support">
              <div className="quick-number">
                04
              </div>

              <div>
                <strong>
                  Get Support
                </strong>

                <small>
                  Contact support team
                </small>
              </div>
            </Link>

          </aside>

        </section>

      </main>

    </div>
  );
}






