import React, { useState } from 'react';
import theme from '../../theme';
import { CONCEPTS, ARCHITECTURES } from '../../navigation';

const sidebarStyles = {
  aside: (width) => ({
    width: `${width}px`,
    minWidth: '200px',
    maxWidth: '500px',
    backgroundColor: '#000',
    borderRight: '1px solid #222',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    color: '#fff',
    borderRadius: '12px 0 0 12px',
    overflow: 'hidden',
    position: 'relative',
  }),
  header: {
    padding: '32px 28px 24px',
    borderBottom: '1px solid #222',
  },
  logo: {
    fontSize: '1.75rem',
    fontWeight: 900,
    letterSpacing: '-0.04em',
    color: '#fff',
    margin: 0,
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#666',
    marginTop: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
  },
  nav: {
    flex: 1,
    padding: '24px 20px',
    overflowY: 'auto',
  },
  sectionButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'background 0.2s',
    textAlign: 'left',
    fontFamily: 'inherit',
  },
  chevron: {
    fontSize: '10px',
    color: '#555',
    transition: 'transform 0.25s ease',
  },
  listContainer: {
    display: 'grid',
    transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
  },
  list: {
    listStyle: 'none',
    margin: '8px 0 0 0',
    padding: '0 0 0 8px',
    borderLeft: '2px solid #222',
    marginLeft: '12px',
  },
  modelButton: (isActive) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    background: isActive ? '#1a1a1a' : 'transparent',
    color: isActive ? '#fff' : '#555',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    marginBottom: '2px',
  }),
  disabledButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: '#333',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'not-allowed',
    textAlign: 'left',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    marginBottom: '2px',
  },
  badge: {
    fontSize: '9px',
    fontWeight: 700,
    background: '#1a1a1a',
    color: '#555',
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: theme.accent,
    flexShrink: 0,
  },
  conceptItem: {
    padding: '7px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#555',
    fontFamily: 'inherit',
    letterSpacing: '-0.01em',
    lineHeight: 1.4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  footer: {
    padding: '20px 28px',
    borderTop: '1px solid #222',
    fontSize: '10px',
    color: '#333',
    textAlign: 'center',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
};



export default function Sidebar({ selectedModel, onSelectModel, width = 280 }) {
  const isConcept = selectedModel.startsWith('concept:');
  const [archOpen, setArchOpen] = useState(!isConcept);
  const [conceptsOpen, setConceptsOpen] = useState(isConcept);
  const [hovered, setHovered] = useState(null);

  // Auto-expand the relevant section when the page changes
  React.useEffect(() => {
    if (selectedModel.startsWith('concept:')) {
      setConceptsOpen(true);
    } else {
      setArchOpen(true);
    }
  }, [selectedModel]);

  return (
    <aside style={sidebarStyles.aside(width)}>
      {/* ── Header ── */}
      <div style={sidebarStyles.header}>
        <h1 style={sidebarStyles.logo}>It'sEze</h1>
        <p style={sidebarStyles.subtitle}>Serve to simplify</p>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav" style={sidebarStyles.nav}>
        {/* Section Toggle */}
        <button
          onClick={() => setArchOpen(!archOpen)}
          style={{
            ...sidebarStyles.sectionButton,
            background: hovered === 'arch' ? '#111' : 'transparent',
            color: hovered === 'arch' ? theme.accent : '#fff',
          }}
          onMouseEnter={() => setHovered('arch')}
          onMouseLeave={() => setHovered(null)}
        >
          <span>Architecture</span>
          <span style={{
            ...sidebarStyles.chevron,
            transform: archOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}>▼</span>
        </button>

        {/* Model List */}
        <div style={{
          ...sidebarStyles.listContainer,
          gridTemplateRows: archOpen ? '1fr' : '0fr',
          opacity: archOpen ? 1 : 0,
        }}>
          <div style={{ overflow: 'hidden' }}>
            <ul style={sidebarStyles.list}>
              {ARCHITECTURES.map((a) => (
                <li
                  key={a.name}
                  style={{
                    ...sidebarStyles.conceptItem,
                    position: 'relative',
                    cursor: a.ready ? 'pointer' : 'not-allowed',
                    color: selectedModel === a.route ? theme.accent : (a.ready ? '#ccc' : '#555'),
                    transition: 'color 0.2s',
                  }}
                  onClick={(e) => { if (a.ready) { const span = e.currentTarget.querySelector('span'); if (span) span.style.outline = 'none'; onSelectModel(a.route); } }}
                  onMouseEnter={(e) => { if (a.ready && selectedModel !== a.route) { const span = e.currentTarget.querySelector('span'); if (span) { span.style.outline = '1px solid var(--accent)'; span.style.borderRadius = '4px'; span.style.outlineOffset = '2px'; } } }}
                  onMouseLeave={(e) => { const span = e.currentTarget.querySelector('span'); if (span) { span.style.outline = 'none'; } }}
                >
                  {selectedModel === a.route && <span style={{
                    ...sidebarStyles.activeDot,
                    position: 'absolute',
                    left: '-9px',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }} />}
                  <span style={{ display: 'inline' }}>{a.name}</span>
                  {!a.ready && <span style={sidebarStyles.badge}>Soon</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Concepts Section ── */}
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => setConceptsOpen(!conceptsOpen)}
            style={{
              ...sidebarStyles.sectionButton,
              background: hovered === 'concepts' ? '#111' : 'transparent',
              color: hovered === 'concepts' ? theme.accent : '#fff',
            }}
            onMouseEnter={() => setHovered('concepts')}
            onMouseLeave={() => setHovered(null)}
          >
            <span>Concepts</span>
            <span style={{
              ...sidebarStyles.chevron,
              transform: conceptsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>▼</span>
          </button>

          <div style={{
            ...sidebarStyles.listContainer,
            gridTemplateRows: conceptsOpen ? '1fr' : '0fr',
            opacity: conceptsOpen ? 1 : 0,
          }}>
            <div style={{ overflow: 'hidden' }}>
              <ul style={sidebarStyles.list}>
              {CONCEPTS.map((c) => (
                <li
                  key={c.name}
                  style={{
                    ...sidebarStyles.conceptItem,
                    position: 'relative',
                    cursor: c.ready ? 'pointer' : 'not-allowed',
                    color: selectedModel === c.route ? theme.accent : (c.ready ? '#ccc' : '#555'),
                    transition: 'color 0.2s',
                  }}
                  onClick={(e) => { if (c.ready) { const span = e.currentTarget.querySelector('span'); if (span) span.style.outline = 'none'; onSelectModel(c.route); } }}
                  onMouseEnter={(e) => { if (c.ready && selectedModel !== c.route) { const span = e.currentTarget.querySelector('span'); if (span) { span.style.outline = '1px solid var(--accent)'; span.style.borderRadius = '4px'; span.style.outlineOffset = '2px'; } } }}
                  onMouseLeave={(e) => { const span = e.currentTarget.querySelector('span'); if (span) { span.style.outline = 'none'; } }}
                >
                  {selectedModel === c.route && <span style={{
                    ...sidebarStyles.activeDot,
                    position: 'absolute',
                    left: '-9px',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }} />}
                  <span style={{ display: 'inline' }}>{c.name}</span>
                  {!c.ready && <span style={sidebarStyles.badge}>Soon</span>}
                </li>
              ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div style={sidebarStyles.footer}>
        Uber Aesthetic
      </div>
    </aside>
  );
}
