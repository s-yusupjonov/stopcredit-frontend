import { NavLink } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Role } from '@/shared/api/types';
import { env } from '@/shared/config/env';
import agrobankMark from '@/assets/agrobank-mark.png';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[] | 'all';
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Boshqaruv paneli',
    icon: <DashboardOutlined />,
    roles: 'all',
  },
  {
    to: '/credits',
    label: 'Kreditlar',
    icon: <FileTextOutlined />,
    roles: ['ANTI_FRAUD', 'CREDIT_MANAGEMENT', 'LEGAL', 'UNDERWRITING', 'MANAGEMENT'],
  },
  {
    to: '/users',
    label: 'Foydalanuvchilar',
    icon: <TeamOutlined />,
    roles: ['ADMIN'],
  },
];

export function Sidebar({ role }: { role: Role }) {
  const visibleItems = navItems.filter(
    (item) => item.roles === 'all' || item.roles.includes(role),
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={agrobankMark} alt="Agrobank" className={styles.logoChip} />
        {env.appName}
      </div>
      <nav className={styles.nav}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}