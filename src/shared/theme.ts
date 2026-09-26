import type { ThemeConfig } from 'antd';

export const colors = {
  primary: '#00a73e',
  primarySoft: 'rgba(0, 167, 62, 0.08)',
  primaryHover: 'rgba(0, 167, 62, 0.85)',
  danger: '#e5484d',
  dangerSoft: 'rgba(229, 72, 77, 0.08)',
  warning: '#f5a623',
  warningSoft: 'rgba(245, 166, 35, 0.1)',
  success: '#00a73e',
  bg: '#f5f6f8',
  surface: '#ffffff',
  border: '#eaecef',
  text: '#1f2430',
  textMuted: '#6b7280',
} as const;

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorBgLayout: colors.bg,
    colorBorderSecondary: colors.border,
    colorText: colors.text,
    colorTextSecondary: colors.textMuted,
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Card: { borderRadiusLG: 12 },
    Table: { borderRadiusLG: 12 },
    Button: { borderRadius: 8 },
  },
};
