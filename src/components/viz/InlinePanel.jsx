import React, { useEffect, useRef } from 'react';

/**
 * InlinePanel — An inline expandable panel for visualizations.
 * Expands directly in the page flow with a smooth accordion animation.
 */
export default function InlinePanel({ open, onClose, children, maxHeight = '600px' }) {
  const panelRef = useRef(null);

  return (
    <div ref={panelRef} style={{
      overflow: 'hidden',
      transition: 'max-height 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease, margin 0.45s ease',
      maxHeight: open ? maxHeight : '0px',
      opacity: open ? 1 : 0,
      marginTop: open ? '16px' : '0px',
      marginBottom: open ? '16px' : '0px',
      borderLeft: '2px solid var(--accent)',
      paddingLeft: '16px',
      position: 'relative',
    }}>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '24px',
            height: '24px',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '14px',
            padding: 0,
            borderRadius: '4px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          aria-label="Close"
        >
          ✕
        </button>
      )}
      {children}
    </div>
  );
}
