import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Trasy tylko dla admina (panel CMS: dodawanie/edycja filmów).
// Działa jak PrivateRoute, ale dodatkowo sprawdza rolę użytkownika.
export default function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader">Ładowanie...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <Outlet /> : <Navigate to="/movies" replace />;
}
