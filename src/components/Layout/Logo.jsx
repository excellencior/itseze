import { useState } from 'react';

/**
 * Standalone top-left logo for the content area.
 * Always visible regardless of navigation mode.
 * Click navigates to the home/default page.
 */
export default function Logo({ onNavigateHome }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onNavigateHome?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onNavigateHome?.(); }}
      aria-label="It'sEze — navigate to home"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        cursor: 'pointer',
        userSelect: 'none',
        marginBottom: '32px',
        transition: 'opacity 0.2s ease',
        opacity: hovered ? 0.8 : 1,
        outline: 'none',
      }}
    >
      <span
        style={{
          fontSize: '1.3rem',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: 'var(--text-main)',
          lineHeight: 1.1,
          borderBottom: '2px solid var(--accent-20)',
          paddingBottom: '3px',
          display: 'inline-block',
          transition: 'border-color 0.2s ease, color 0.2s ease',
          borderColor: hovered ? 'var(--accent)' : 'var(--accent-20)',
        }}
      >
        It&apos;sEze
      </span>
      <span
        style={{
          fontSize: '9px',
          fontWeight: 700,
          color: 'var(--text-light)',
          marginTop: '5px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
        }}
      >
        Serve to simplify
      </span>
    </div>
  );
}
