import { Navigate, Outlet } from 'react-router-dom';
import { message } from 'antd';
import { useEffect } from 'react';
import type { Role } from '@/shared/api/types';
import { useAuth } from './useAuth';

export function RoleGuard({ allow }: { allow: Role[] }) {
  const { role } = useAuth();
  const allowed = !!role && allow.includes(role);

  useEffect(() => {
    if (!allowed) {
      message.warning('Sizda ushbu sahifaga kirish huquqi yo\'q');
    }
  }, [allowed]);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
