import {
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import LandingPage from '../pages/public/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOtp from '../pages/auth/VerifyOtp';
import PaymentPage from '../pages/customer/PaymentPage';
import Dashboard from '../pages/customer/Dashboard';
import BookShipment from '../pages/customer/BookShipment';
import MyBookings from '../pages/customer/MyBookings';
import Payments from '../pages/customer/Payments';
import Invoices from '../pages/customer/Invoices';
import TrackShipment from '../pages/customer/TrackShipment';
import AdminDashboard from '../pages/admin/Dashboard';

import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Documents from '../pages/customer/Documents';
import Support from '../pages/customer/Support';
import Profile from '../pages/customer/Profile';
import Notifications from '../pages/customer/Notifications';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* PUBLIC & MARKETING ROUTES */}
      <Route
        path="/"
        element={user ? <Dashboard /> : <LandingPage />}
      />

      <Route
        path="/landing"
        element={<LandingPage />}
      />

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
          path="/dashboard"
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
          element={<TrackShipment />}
        />

        <Route
          path="/payments"
          element={<Payments />}
        />

        <Route
          path="/invoices"
          element={<Invoices />}
        />

        <Route
          path="/documents"
          element={<Documents />}
        />

        <Route
          path="/support"
          element={<Support />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/profile"
          element={<Profile />}
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
