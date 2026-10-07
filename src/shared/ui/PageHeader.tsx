import type { ReactNode } from 'react';
import { Typography } from 'antd';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered next to the title (e.g. a status tag). */
  tags?: ReactNode;
  /** Buttons on the right; wrap below the title on narrow screens. */
  actions?: ReactNode;
  /** Element above the title, typically a "back" link. */
  back?: ReactNode;
}

export function PageHeader({ title, subtitle, tags, actions, back }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.heading}>
        {back && <div className={styles.back}>{back}</div>}
        <div className={styles.titleRow}>
          <Typography.Title level={4} className={styles.title}>
            {title}
          </Typography.Title>
          {tags}
        </div>
        {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
