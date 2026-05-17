import React, { useState, useRef, useEffect } from 'react';

/**
 * HoverCard — Wikipedia-style hover popup for inline terms.
 * Auto-positions above or below based on available viewport space.
 */
export default function HoverCard({ term, children }) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [pos, setPos] = useState('above');
  const showTimeout = useRef(null);
  const hideTimeout = useRef(null);
  const containerRef = useRef(null);

  const show = () => {
    clearTimeout(hideTimeout.current);
    showTimeout.current = setTimeout(() => {
      // Auto-detect position based on viewport space
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;
        setPos(spaceAbove > 280 ? 'above' : spaceBelow > 280 ? 'below' : spaceAbove > spaceBelow ? 'above' : 'below');
      }
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setReady(true));
      });
    }, 200);
  };

  const hide = () => {
    clearTimeout(showTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setReady(false);
      setTimeout(() => setVisible(false), 180);
    }, 150);
  };

  useEffect(() => {
    return () => {
      clearTimeout(showTimeout.current);
      clearTimeout(hideTimeout.current);
    };
  }, []);

  return (
    <span
      ref={containerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      style={{ position: 'relative', display: 'inline' }}
    >
      <span style={{
        fontWeight: 700,
        color: 'var(--accent)',
        cursor: 'help',
        borderBottom: '1px dashed var(--accent-50)',
        transition: 'color 0.2s',
      }}>
        {term}
      </span>

      {visible && (
        <span
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: 'absolute',
            left: '50%',
            ...(pos === 'above'
              ? { bottom: 'calc(100% + 10px)' }
              : { top: 'calc(100% + 10px)' }
            ),
            transform: `translateX(-50%) translateY(${ready
              ? '0px'
              : pos === 'above' ? '6px' : '-6px'
            })`,
            opacity: ready ? 1 : 0,
            transition: 'opacity 0.18s ease, transform 0.18s ease',
            zIndex: 1000,

            width: '300px',
            background: '#fff',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            padding: '14px 16px',
            borderRadius: '6px',
            pointerEvents: 'auto',

            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--text-main)',
            lineHeight: 1.6,
            textAlign: 'left',
          }}
        >
          {/* Arrow */}
          <span style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            background: '#fff',
            border: '1px solid var(--border)',
            ...(pos === 'above'
              ? { bottom: '-6px', borderTop: 'none', borderLeft: 'none' }
              : { top: '-6px', borderBottom: 'none', borderRight: 'none' }
            ),
          }} />
          {children}
        </span>
      )}
    </span>
  );
}
