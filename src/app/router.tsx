import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/shared/ui/AppShell';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { RoleGuard } from '@/features/auth/RoleGuard';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CreditsListPage } from '@/features/credits/CreditsListPage';
import { CreditDetailPage } from '@/features/credits/CreditDetailPage';
import { CreditFormPage } from '@/features/credits/CreditFormPage';
import { UsersPage } from '@/features/users/UsersPage';
import { NotFoundPage } from './NotFoundPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          {
            element: (
              <RoleGuard
                allow={['ANTI_FRAUD', 'CREDIT_MANAGEMENT', 'LEGAL', 'UNDERWRITING', 'MANAGEMENT']}
              />
            ),
            children: [
              { path: '/credits', element: <CreditsListPage /> },
              { path: '/credits/:id', element: <CreditDetailPage /> },
            ],
          },
          {
            element: <RoleGuard allow={['ANTI_FRAUD']} />,
            children: [
              { path: '/credits/new', element: <CreditFormPage /> },
              { path: '/credits/:id/edit', element: <CreditFormPage /> },
            ],
          },
          {
            element: <RoleGuard allow={['ADMIN']} />,
            children: [{ path: '/users', element: <UsersPage /> }],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
