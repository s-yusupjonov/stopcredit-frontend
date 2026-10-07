import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useSessionSync } from './useSessionSync';

export function AuthGuard() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  useSessionSync();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
