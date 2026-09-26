import { LogoutOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { Sidebar } from './Sidebar';
import { roleLabels } from './strings';
import styles from './AppShell.module.css';

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppShell({ children }: { children?: ReactNode }) {
  const { user, role, logout } = useAuth();
  if (!user || !role) return null;

  return (
    <div className={styles.shell}>
      <Sidebar role={role} />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.userArea}>
            <div className={styles.avatar}>{initials(user.fullName)}</div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user.fullName}</span>
              <span className={styles.userRole}>{roleLabels[role]}</span>
            </div>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={logout}
              title="Chiqish"
              aria-label="Chiqish"
            >
              <LogoutOutlined />
            </button>
          </div>
        </header>
        <main className={styles.content}>{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}