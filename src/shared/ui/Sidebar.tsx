import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
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
  /** Extra paths that belong to this item (detail/edit pages), so it stays highlighted there. */
  matches?: (pathname: string) => boolean;
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

// /credits/123 and /credits/new are part of the credits section, /credits/mine is its own item
const isCreditsSection = (pathname: string) =>
  pathname.startsWith('/credits/') && !pathname.startsWith('/credits/mine');

function navItemsFor(role: Role): NavEntry[] {
  if (role === 'ADMIN') {
    return [{ to: '/users', label: 'Foydalanuvchilar', icon: <TeamOutlined /> }];
  }

  if (OWN_STAGE_ROLES.includes(role)) {
    return [
      { to: '/credits/mine', label: 'Mening bosqichim', icon: <ClockCircleOutlined /> },
      {
        to: '/credits',
        label: 'Barcha kreditlar',
        icon: <FileTextOutlined />,
        matches: isCreditsSection,
      },
    ];
  }

  const items: NavEntry[] = [
    { to: '/credits', label: 'Kreditlar', icon: <FileTextOutlined />, matches: isCreditsSection },
  ];
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
        title={group.label}
      >
        {group.icon}
        <span className={`${styles.label} ${styles.groupLabel}`}>{group.label}</span>
        <DownOutlined className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>
      {open && (
        <div className={styles.subNav}>
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              end
              title={child.label}
              className={({ isActive }) =>
                `${styles.navItem} ${styles.subItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              {child.icon}
              <span className={styles.label}>{child.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const visibleItems = navItemsFor(role);
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logo} aria-label={`${env.appName} — bosh sahifa`}>
        <img src={agrobankMark} alt="" className={styles.logoChip} />
        <span className={styles.label}>{env.appName}</span>
      </Link>
      <nav className={styles.nav} aria-label="Asosiy menyu">
        {visibleItems.map((item) =>
          isGroup(item) ? (
            <NavGroupItem key={item.basePath} group={item} />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end
              title={item.label}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive || item.matches?.(pathname) ? styles.navItemActive : ''}`
              }
            >
              {item.icon}
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </aside>
  );
}
