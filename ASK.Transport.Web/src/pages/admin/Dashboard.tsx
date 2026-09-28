import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '40px' }}>
      <h1>ASK Transport Admin</h1>

      <h2>Welcome, {user?.name}</h2>

      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}