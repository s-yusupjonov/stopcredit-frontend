import type { CSSProperties } from 'react';
import { DatabaseOutlined, TeamOutlined } from '@ant-design/icons';
import { colors } from '@/shared/theme';

export type UserAuthSource = 'LOCAL' | 'AD';

interface SourceToggleProps {
  value: UserAuthSource;
  onChange: (value: UserAuthSource) => void;
  disabled?: boolean;
}

const OPTIONS: { value: UserAuthSource; label: string; icon: JSX.Element }[] = [
  { value: 'LOCAL', label: 'Yangi (DB)', icon: <DatabaseOutlined /> },
  { value: 'AD', label: 'AD dan', icon: <TeamOutlined /> },
];

export function SourceToggle({ value, onChange, disabled }: SourceToggleProps) {
  const activeIndex = OPTIONS.findIndex((o) => o.value === value);

  const trackStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 3,
    gap: 3,
    opacity: disabled ? 0.6 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const thumbStyle: CSSProperties = {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    width: `calc(${100 / OPTIONS.length}% - 3px)`,
    borderRadius: 8,
    background: colors.primary,
    boxShadow: '0 2px 6px rgba(0, 167, 62, 0.35)',
    transform: `translateX(${activeIndex * 100}%)`,
    transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div role="radiogroup" aria-label="Foydalanuvchi manbasi" style={trackStyle}>
      <div style={thumbStyle} />
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        const optionStyle: CSSProperties = {
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '7px 12px',
          border: 'none',
          background: 'transparent',
          borderRadius: 8,
          cursor: disabled ? 'default' : 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: isActive ? '#fff' : colors.textMuted,
          transition: 'color 220ms ease',
        };
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            disabled={disabled}
            style={optionStyle}
            onClick={() => !disabled && onChange(option.value)}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}