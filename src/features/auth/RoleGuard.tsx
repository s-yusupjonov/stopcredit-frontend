import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import type { Role } from '@/shared/api/types';
import { feedback } from '@/shared/ui/feedback';
import { useAuth } from './useAuth';

export function RoleGuard({ allow }: { allow: Role[] }) {
  const { role } = useAuth();
  const allowed = !!role && allow.includes(role);

  useEffect(() => {
    if (!allowed) {
      feedback.message.warning('Sizda ushbu sahifaga kirish huquqi yo\'q');
    }
  }, [allowed]);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
