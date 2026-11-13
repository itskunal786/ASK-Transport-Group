import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

export default function ProtectedRoute() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin and Super Admin should not access Customer portal
  if (user.role === 'Admin' || user.role === 'SuperAdmin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <ErrorBoundary fallbackTitle="Customer Portal Error">
      <Outlet />
    </ErrorBoundary>
  );
}