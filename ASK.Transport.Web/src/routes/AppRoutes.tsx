import {
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOtp from '../pages/auth/VerifyOtp';
import PaymentPage from '../pages/customer/PaymentPage';
import Dashboard from '../pages/customer/Dashboard';
import BookShipment from '../pages/customer/BookShipment';
import MyBookings from '../pages/customer/MyBookings';
import AdminDashboard from '../pages/admin/Dashboard';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

function ComingSoon({
  title
}: {
  title: string;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f7fb',
        padding: '50px'
      }}
    >
      <a
        href="/"
        style={{
          textDecoration: 'none',
          color: '#0b72e7',
          fontWeight: 600
        }}
      >
        ← Back to Dashboard
      </a>

      <div
        style={{
          maxWidth: '700px',
          margin: '80px auto',
          padding: '50px',
          background: '#ffffff',
          borderRadius: '18px',
          boxShadow:
            '0 10px 35px rgba(0, 40, 80, 0.08)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px',
            borderRadius: '15px',
            background: '#eaf4ff',
            color: '#0b72e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px'
          }}
        >
          A
        </div>

        <h1
          style={{
            color: '#09284a',
            marginBottom: '10px'
          }}
        >
          {title}
        </h1>

        <p
          style={{
            color: '#718198'
          }}
        >
          ASK Transport {title} module
          will be connected next.
        </p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />


      {/* CUSTOMER PROTECTED ROUTES */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/book"
          element={<BookShipment />}
        />

        <Route
          path="/bookings"
          element={<MyBookings />}
        />

        <Route
          path="/payment"
          element={<PaymentPage />}
        />

        <Route
          path="/tracking"
          element={
            <ComingSoon title="Track Shipment" />
          }
        />

        <Route
          path="/payments"
          element={
            <ComingSoon title="Payments" />
          }
        />

        <Route
          path="/invoices"
          element={
            <ComingSoon title="Invoices" />
          }
        />

        <Route
          path="/documents"
          element={
            <ComingSoon title="Documents" />
          }
        />

        <Route
          path="/support"
          element={
            <ComingSoon title="Support" />
          }
        />

        <Route
          path="/profile"
          element={
            <ComingSoon title="Profile" />
          }
        />

      </Route>


      {/* ADMIN ROUTES */}

      <Route element={<AdminRoute />}>

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Route>


      {/* UNKNOWN ROUTE */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}



