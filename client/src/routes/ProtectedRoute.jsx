import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageSpinner } from '../components/LoadingSkeleton.jsx';

export default function ProtectedRoute() {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <PageSpinner label="Checking your session" />;
  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const { user, booting, isAdmin } = useAuth();
  const location = useLocation();

  if (booting) return <PageSpinner label="Checking administrator access" />;
  if (!user) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
