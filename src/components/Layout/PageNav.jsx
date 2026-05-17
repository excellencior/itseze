import React from 'react';
import { getPageNeighbors } from '../../navigation';

/**
 * PageNav — Previous / Next navigation buttons at the bottom of a page.
 * Shows only applicable buttons (no prev on first page, no next on last).
 */
export default function PageNav({ currentRoute, onNavigate }) {
  const { prev, next } = getPageNeighbors(currentRoute);

  if (!prev && !next) return null;

  return (
    <div style={{
      display: 'flex',
      justifyContent: prev && next ? 'space-between' : next ? 'flex-end' : 'flex-start',
      gap: '16px',
      marginTop: '48px',
      paddingTop: '32px',
      borderTop: '1px solid var(--border)',
    }}>
      {prev && (
        <button
          onClick={() => onNavigate(prev.route)}
          style={{
            flex: '0 1 auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            border: '1px solid var(--border)',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-light)',
          }}>
            ←
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '-0.3px',
          }}>
            {prev.name}
          </span>
        </button>
      )}

      {next && (
        <button
          onClick={() => onNavigate(next.route)}
          style={{
            flex: '0 1 auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            border: '1px solid var(--border)',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'right',
            fontFamily: 'inherit',
            marginLeft: 'auto',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '-0.3px',
          }}>
            {next.name}
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-light)',
          }}>
            →
          </span>
        </button>
      )}
    </div>
  );
}
