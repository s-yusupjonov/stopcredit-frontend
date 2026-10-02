import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

/**
 * '/' has no dedicated view — it exists only to send each role to the
 * page that's actually useful for them.
 */
export function DashboardPage() {
  const { role } = useAuth();

  if (role === 'ADMIN') {
    return <Navigate to="/users" replace />;
  }

  if (role === 'CREDIT_MANAGEMENT' || role === 'LEGAL' || role === 'UNDERWRITING') {
    return <Navigate to="/credits/mine" replace />;
  }

  return <Navigate to="/credits" replace />;
}
