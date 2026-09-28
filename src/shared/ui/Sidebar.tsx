import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ClockCircleOutlined,
  CreditCardOutlined,
  DownOutlined,
  FileTextOutlined,
  LockOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { Role } from '@/shared/api/types';
import { env } from '@/shared/config/env';
import agrobankMark from '@/assets/agrobank-mark.png';
import styles from './Sidebar.module.css';

interface NavLeaf {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  basePath: string;
  children: NavLeaf[];
}

type NavEntry = NavLeaf | NavGroup;

const OWN_STAGE_ROLES: Role[] = ['CREDIT_MANAGEMENT', 'LEGAL', 'UNDERWRITING'];
const CARD_ROLES: Role[] = ['ANTI_FRAUD', 'MANAGEMENT'];

const cardsGroup: NavGroup = {
  label: 'Kartalar',
  icon: <CreditCardOutlined />,
  basePath: '/cards',
  children: [
    { to: '/cards/blocked', label: 'Bloklangan kartalar', icon: <LockOutlined /> },
    { to: '/cards/active', label: 'Aktiv kartalar', icon: <CheckCircleOutlined /> },
  ],
};

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

function navItemsFor(role: Role): NavEntry[] {
  if (role === 'ADMIN') {
    return [{ to: '/users', label: 'Foydalanuvchilar', icon: <TeamOutlined /> }];
  }

  if (OWN_STAGE_ROLES.includes(role)) {
    return [
      { to: '/credits/mine', label: 'Mening bosqichim', icon: <ClockCircleOutlined /> },
      { to: '/credits', label: 'Barcha kreditlar', icon: <FileTextOutlined /> },
    ];
  }

  const items: NavEntry[] = [{ to: '/credits', label: 'Kreditlar', icon: <FileTextOutlined /> }];
  if (CARD_ROLES.includes(role)) {
    items.push(cardsGroup);
  }
  return items;
}

function NavGroupItem({ group }: { group: NavGroup }) {
  const { pathname } = useLocation();
  const inGroup = pathname === group.basePath || pathname.startsWith(`${group.basePath}/`);
  const [open, setOpen] = useState(inGroup);

  useEffect(() => {
    if (inGroup) setOpen(true);
  }, [inGroup]);

  return (
    <div>
      <button
        type="button"
        className={`${styles.navItem} ${styles.groupHeader} ${inGroup ? styles.groupHeaderActive : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {group.icon}
        <span className={styles.groupLabel}>{group.label}</span>
        <DownOutlined className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      {open && (
        <div className={styles.subNav}>
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end
              className={({ isActive }) =>
                `${styles.navItem} ${styles.subItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              {child.icon}
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const visibleItems = navItemsFor(role);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={agrobankMark} alt="Agrobank" className={styles.logoChip} />
        {env.appName}
      </div>
      <nav className={styles.nav}>
        {visibleItems.map((item) =>
          isGroup(item) ? (
            <NavGroupItem key={item.basePath} group={item} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
}
