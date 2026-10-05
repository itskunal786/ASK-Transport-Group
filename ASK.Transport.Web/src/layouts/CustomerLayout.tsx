import type { ReactNode } from 'react';

import {
  Link,
  useLocation
} from 'react-router-dom';

import {
  useAuth
} from '../context/AuthContext';

import '../styles/Dashboard.css';


interface CustomerLayoutProps {
  children: ReactNode;
}


export default function CustomerLayout({
  children
}: CustomerLayoutProps) {

  const { user, logout } = useAuth();

  const location = useLocation();


  function active(path: string) {
    return location.pathname === path
      ? 'active'
      : '';
  }


  function getPageInfo() {

    switch (location.pathname) {

      case '/payments':
        return {
          title: 'Payments',
          description:
            'Manage your payments and transaction history.'
        };

      case '/invoices':
        return {
          title: 'Invoices',
          description:
            'View and download your shipment invoices.'
        };

      case '/book':
        return {
          title: 'Book Shipment',
          description:
            'Create and manage a new shipment booking.'
        };

      case '/bookings':
        return {
          title: 'My Bookings',
          description:
            'View and manage your shipment bookings.'
        };

      case '/tracking':
        return {
          title: 'Track Shipment',
          description:
            'Track the latest status of your shipment.'
        };

      case '/documents':
        return {
          title: 'Documents',
          description:
            'View and manage your shipment documents.'
        };

      case '/support':
        return {
          title: 'Support',
          description:
            'Get help with your shipments and account.'
        };

      case '/profile':
        return {
          title: 'Profile',
          description:
            'Manage your account information.'
        };

      default:
        return {
          title: 'Dashboard',
          description:
            'Manage your ASK Transport account.'
        };
    }
  }


  async function handleLogout() {
    await logout();

    window.location.href = '/login';
  }


  const page =
    getPageInfo();


  return (
    <div className="customer-dashboard">

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
            className={active('/')}
            to="/"
          >
            <span>01</span>
            Dashboard
          </Link>

          <Link
            className={active('/book')}
            to="/book"
          >
            <span>02</span>
            Book Shipment
          </Link>

          <Link
            className={active('/bookings')}
            to="/bookings"
          >
            <span>03</span>
            My Bookings
          </Link>

          <Link
            className={active('/tracking')}
            to="/tracking"
          >
            <span>04</span>
            Track Shipment
          </Link>

          <Link
            className={active('/payments')}
            to="/payments"
          >
            <span>05</span>
            Payments
          </Link>

          <Link
            className={active('/invoices')}
            to="/invoices"
          >
            <span>06</span>
            Invoices
          </Link>

          <Link
            className={active('/documents')}
            to="/documents"
          >
            <span>07</span>
            Documents
          </Link>

          <Link
            className={active('/support')}
            to="/support"
          >
            <span>08</span>
            Support
          </Link>

        </nav>


        <div className="sidebar-bottom">

          <Link
            className={active('/profile')}
            to="/profile"
          >
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


      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>

            <span className="dashboard-label">
              CUSTOMER PORTAL
            </span>

            <h1>
              {page.title}
            </h1>

            <p>
              {page.description}
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


        {children}

      </main>

    </div>
  );
}
