import React from 'react';

/**
 * Callout — Shared highlighted information block with icon and colored left border.
 * Uses theme-aware CSS variables for all colors.
 *
 * @param {'info' | 'warning' | 'key' | 'accent'} type
 */

const CALLOUT_STYLES = {
  info:    { bg: 'var(--surface-blue)',  border: 'var(--border-blue)',  icon: 'ℹ️' },
  warning: { bg: 'var(--surface-amber)', border: 'var(--border-amber)', icon: '⚠️' },
  key:     { bg: 'var(--surface-green)', border: 'var(--border-green)', icon: '💡' },
  accent:  { bg: 'var(--accent-08)',     border: 'var(--accent)',       icon: '↩' },
};

export default function Callout({ type = 'info', children }) {
  const style = CALLOUT_STYLES[type] || CALLOUT_STYLES.info;

  return (
    <div style={{
      background: style.bg,
      borderLeft: `4px solid ${style.border}`,
      padding: '14px 18px',
      borderRadius: '4px',
      margin: '16px 0',
      fontSize: '14.5px',
      lineHeight: 1.7,
      color: 'var(--text-muted)',
      display: 'flex',
      gap: '10px',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{style.icon}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
