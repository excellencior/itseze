import React, { useState } from 'react';
import { ARCHITECTURES, CONCEPTS } from '../navigation';

/**
 * LandingPage — Editorial, typography-driven home page.
 *
 * Design: premium publication table-of-contents.
 * No particles, no typing animation, no stats ribbon.
 * Typography and whitespace do the work.
 */

/* ── Featured items — hand-picked best entry points ── */
const FEATURED = [
  {
    route: 'gpt3',
    category: 'Architecture',
    title: 'GPT-3 (175B)',
    description: 'A layer-by-layer walkthrough of the full transformer architecture — tokenization, attention, feed-forward, and output.',
  },
  {
    route: 'concept:speculative-decoding',
    category: 'Concept',
    title: 'Speculative Decoding',
    description: 'How a small draft model accelerates inference by letting the large model verify in parallel.',
  },
];

/* ── Collect ready items grouped by section ── */
function getSections() {
  const concepts = [];
  const reasoning = [];
  const prompting = [];

  CONCEPTS.forEach(item => {
    if (item.children) {
      const group = item.name === 'Reasoning' ? reasoning
                  : item.name === 'Prompting' ? prompting
                  : concepts;
      item.children.forEach(child => {
        if (child.ready) group.push(child);
      });
    } else if (item.ready) {
      concepts.push(item);
    }
  });

  return [
    { label: 'Concepts', items: concepts },
    { label: 'Reasoning', items: reasoning },
    { label: 'Prompting', items: prompting },
  ].filter(s => s.items.length > 0);
}

/* ── Featured Card ── */
function FeaturedCard({ item, onNavigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onNavigate(item.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: '240px',
        background: 'var(--node-bg)',
        border: `1px solid ${hovered ? 'var(--accent-50)' : 'var(--border)'}`,
        borderLeft: `3px solid ${hovered ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '6px',
        padding: '20px 22px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Category label */}
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-light)',
      }}>
        {item.category}
      </span>

      {/* Title */}
      <span style={{
        fontSize: '17px',
        fontWeight: 800,
        color: 'var(--text-main)',
        letterSpacing: '-0.3px',
        lineHeight: 1.2,
      }}>
        {item.title}
      </span>

      {/* Description */}
      <span style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        flex: 1,
      }}>
        {item.description}
      </span>

      {/* Arrow */}
      <span style={{
        alignSelf: 'flex-end',
        color: hovered ? 'var(--accent)' : 'var(--text-light)',
        transition: 'all 0.2s ease',
        display: 'flex',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.2s' }}>
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </button>
  );
}

/* ── Index Row ── */
function IndexRow({ item, onNavigate, isLast }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onNavigate(item.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px 4px',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        background: hovered ? 'var(--bg-subtle)' : 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s ease',
        borderRadius: 0,
      }}
    >
      <span style={{
        fontSize: '14px',
        fontWeight: 600,
        color: hovered ? 'var(--accent)' : 'var(--text-main)',
        letterSpacing: '-0.2px',
        transition: 'color 0.15s ease',
      }}>
        {item.name}
      </span>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{
          color: hovered ? 'var(--accent)' : 'var(--text-light)',
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          opacity: hovered ? 1 : 0.5,
          flexShrink: 0,
        }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}

/* ── Section Header ── */
function SectionHeader({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '36px',
      marginBottom: '4px',
    }}>
      {/* Accent dot */}
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: 'var(--accent)',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--text-light)',
      }}>
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  LandingPage
 * ═══════════════════════════════════════════ */
export default function LandingPage({ onNavigate }) {
  const sections = getSections();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <div style={{
      width: '80%',
      maxWidth: '720px',
      margin: '0 auto',
      paddingBottom: '80px',
    }}>
      {/* ── Hero ── */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: 'clamp(30px, 4vw, 40px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: 'var(--text-main)',
          lineHeight: 1.1,
          marginBottom: '16px',
        }}>
          It&apos;sEze
        </h1>
        <p style={{
          fontSize: 'clamp(15px, 2vw, 17px)',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          maxWidth: '480px',
          margin: 0,
        }}>
          Interactive explorations of how machines learn, reason, and generate.
        </p>
      </div>

      {/* ── Divider ── */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 32px' }} />

      {/* ── Featured ── */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--text-light)',
          display: 'block',
          marginBottom: '16px',
        }}>
          Featured
        </span>

        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {FEATURED.map(item => (
            <FeaturedCard key={item.route} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0' }} />

      {/* ── Topic Index ── */}
      {sections.map(section => (
        <div key={section.label}>
          <SectionHeader label={section.label} />
          <div>
            {section.items.map((item, i) => (
              <IndexRow
                key={item.route}
                item={item}
                onNavigate={onNavigate}
                isLast={i === section.items.length - 1}
              />
            ))}
          </div>
        </div>
      ))}

      {/* ── Keyboard hint ── */}
      <div style={{
        marginTop: '56px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        opacity: 0.6,
      }}>
        <kbd style={{
          display: 'inline-block',
          padding: '2px 6px',
          fontSize: '11px',
          fontFamily: 'inherit',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          background: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
        }}>
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd style={{
          display: 'inline-block',
          padding: '2px 6px',
          fontSize: '11px',
          fontFamily: 'inherit',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          background: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
        }}>
          K
        </kbd>
        <span>to navigate</span>
      </div>
    </div>
  );
}
