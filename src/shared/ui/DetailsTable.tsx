import type { ReactNode } from 'react';
import styles from './DetailsTable.module.css';

export interface DetailsItem {
  label: string;
  value: ReactNode;
  /** Makes the value stand out (amounts). */
  strong?: boolean;
  /** Long free text (comments, orders): the column stays narrow and the value wraps onto more lines. */
  wrap?: boolean;
}

interface DetailsTableProps {
  items: DetailsItem[];
  /** Accessible name of the table. */
  caption: string;
}

const EMPTY = '—';

function isEmpty(value: ReactNode): boolean {
  return value === null || value === undefined || value === '' || value === false;
}

/**
 * Spreadsheet-style record: one header row with the field names and, right under it, one row with
 * the values. When the fields do not fit the screen the table scrolls sideways inside its frame.
 */
export function DetailsTable({ items, caption }: DetailsTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {items.map((item) => (
              <th key={item.label} scope="col" className={item.wrap ? styles.wrapColumn : undefined}>
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {items.map((item) => {
              const className = [item.strong ? styles.strong : '', item.wrap ? styles.wrapColumn : '']
                .filter(Boolean)
                .join(' ');
              return (
                <td key={item.label} className={className || undefined}>
                  {isEmpty(item.value) ? <span className={styles.empty}>{EMPTY}</span> : item.value}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
