import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../../SettingsContext';

function LadderItem({ id, label, isActive, isLadderHovered, onClick }) {
  const [isItemHovered, setIsItemHovered] = useState(false);

  return (
    <button
      onClick={() => onClick(id)}
      onMouseEnter={() => setIsItemHovered(true)}
      onMouseLeave={() => setIsItemHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '10px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: '5px 0',
        fontFamily: 'inherit',
        outline: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Label — slides in when ladder is hovered */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: isActive ? 700 : (isItemHovered ? 600 : 500),
          color: isActive
            ? 'var(--accent)'
            : isItemHovered
              ? 'var(--text-main, #333)'
              : 'var(--text-light)',
          letterSpacing: '0.01em',
          opacity: isLadderHovered ? 1 : 0,
          transform: isLadderHovered ? 'translateX(0)' : 'translateX(8px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease, color 0.15s, font-weight 0.15s',
          pointerEvents: isLadderHovered ? 'auto' : 'none',
          maxWidth: isLadderHovered ? '200px' : '0px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: isLadderHovered ? '2px 8px' : '0',
          borderRadius: '4px',
          background: isItemHovered && isLadderHovered
            ? 'var(--accent-20)'
            : isActive && isLadderHovered
              ? 'var(--accent-20)'
              : 'transparent',
        }}
      >
        {label}
      </span>

      {/* Tick mark — always visible, reacts to individual hover */}
      <span
        style={{
          display: 'block',
          width: isActive ? '20px' : isItemHovered ? '16px' : '10px',
          height: isActive ? '3px' : '2px',
          borderRadius: '2px',
          backgroundColor: isActive
            ? 'var(--accent)'
            : isItemHovered
              ? 'var(--text-muted, #888)'
              : 'var(--border)',
          transition: 'width 0.2s ease, height 0.15s ease, background-color 0.2s ease',
          flexShrink: 0,
        }}
      />
    </button>
  );
}

export default function SeekLadder({ scrollContainerRef }) {
  const { resolvedTheme } = useSettings();
  const [sections, setSections] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const observerRef = useRef(null);
  const rescanTimerRef = useRef(null);

  /* ── Discover [data-section] elements and observe them ── */
  const scan = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const container = scrollContainerRef?.current;
    if (!container) return;

    const els = Array.from(container.querySelectorAll('[data-section]'));
    if (els.length === 0) {
      setSections([]);
      return;
    }

    /* Build section list from the h2 inside each data-section div */
    const list = els.map(el => {
      const heading = el.querySelector('h2');
      const raw = heading ? heading.textContent : el.id;
      /* Strip leading numbering like "1. " or "2. " for cleaner labels */
      const label = raw.replace(/^\d+\.\s*/, '');
      return { id: el.id, label };
    });
    setSections(list);

    /* IntersectionObserver pinned to the scroll container */
    const visible = new Map();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (visible.size > 0) {
          /* Pick the topmost visible section */
          const sorted = [...visible.entries()].sort((a, b) => a[1] - b[1]);
          setActiveId(sorted[0][0]);
        }
      },
      {
        root: container,
        threshold: 0,
        rootMargin: '-5% 0px -80% 0px',
      }
    );

    els.forEach(el => observerRef.current.observe(el));
  }, [scrollContainerRef]);

  /* Re-scan whenever the DOM might change (route change, lazy content) */
  useEffect(() => {
    /* Initial scan after a short delay for DOM to settle */
    rescanTimerRef.current = setTimeout(scan, 350);

    /* Also watch for child-list mutations so dynamically rendered pages are picked up */
    const container = scrollContainerRef?.current;
    let mo;
    if (container) {
      mo = new MutationObserver(() => {
        clearTimeout(rescanTimerRef.current);
        rescanTimerRef.current = setTimeout(scan, 200);
      });
      mo.observe(container, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(rescanTimerRef.current);
      if (observerRef.current) observerRef.current.disconnect();
      if (mo) mo.disconnect();
    };
  }, [scan, scrollContainerRef]);

  /* ── Click handler ── */
  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Don't render if the page has no sections */
  if (sections.length === 0) return null;

  return (
    <div
      className="seek-ladder"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        right: '26px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0px',
        padding: '10px 6px 10px 14px',
        borderRadius: '6px',
        background: isHovered
          ? (resolvedTheme === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.85)')
          : 'transparent',
        backdropFilter: isHovered ? 'blur(8px)' : 'none',
        boxShadow: isHovered
          ? (resolvedTheme === 'dark' ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.08)')
          : 'none',
        transition: 'background 0.25s ease, box-shadow 0.25s ease, backdrop-filter 0.25s ease',
      }}
    >
      {sections.map(({ id, label }) => (
        <LadderItem
          key={id}
          id={id}
          label={label}
          isActive={id === activeId}
          isLadderHovered={isHovered}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}
