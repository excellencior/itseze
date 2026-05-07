import React, { useState } from 'react';
import theme from '../../theme';

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
    overflow: 'hidden',
    transition: 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
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

const CONCEPTS = [
  { name: 'Activation Functions', route: 'concept:activation-functions', ready: true },
  { name: 'Attention (Self / Cross)', route: 'concept:attention', ready: false },
  { name: 'Batch Normalization', route: 'concept:batch-norm', ready: false },
  { name: 'Convolution Layers', route: 'concept:convolution', ready: false },
  { name: 'Dropout', route: 'concept:dropout', ready: false },
  { name: 'Embedding (Token + Positional)', route: 'concept:embedding', ready: false },
  { name: 'Feed-Forward Network (MLP)', route: 'concept:mlp', ready: false },
  { name: 'KV Cache', route: 'concept:kv-cache', ready: false },
  { name: 'Layer Normalization / RMSNorm', route: 'concept:layer-norm', ready: false },
  { name: 'Loss Functions', route: 'concept:loss-functions', ready: false },
  { name: 'Mixture of Experts (MoE)', route: 'concept:moe', ready: false },
  { name: 'Multi-Head Attention', route: 'concept:multi-head-attention', ready: false },
  { name: 'Residual Connections', route: 'concept:residual', ready: false },
  { name: 'Rotary Position Embedding (RoPE)', route: 'concept:rope', ready: false },
  { name: 'Softmax', route: 'concept:softmax', ready: false },
  { name: 'Tokenization (BPE / SentencePiece)', route: 'concept:tokenization', ready: false },
  { name: 'Transformer Block', route: 'concept:transformer', ready: false },
];

export default function Sidebar({ selectedModel, onSelectModel, width = 280 }) {
  const [archOpen, setArchOpen] = useState(true);
  const [conceptsOpen, setConceptsOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

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
          maxHeight: archOpen ? '300px' : '0px',
          opacity: archOpen ? 1 : 0,
        }}>
          <ul style={sidebarStyles.list}>
            <li>
              <button
                onClick={() => onSelectModel('gpt3')}
                style={{
                  ...sidebarStyles.modelButton(selectedModel === 'gpt3'),
                  ...(hovered === 'gpt3' && selectedModel !== 'gpt3' ? { background: theme.sidebarHoverBg, color: theme.accent } : {}),
                }}
                onMouseEnter={() => setHovered('gpt3')}
                onMouseLeave={() => setHovered(null)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {selectedModel === 'gpt3' && <span style={sidebarStyles.activeDot} />}
                  GPT-3 (175B)
                </span>
              </button>
            </li>
            <li>
              <button disabled style={sidebarStyles.disabledButton}>
                <span>Llama 3</span>
                <span style={sidebarStyles.badge}>Soon</span>
              </button>
            </li>
            <li>
              <button disabled style={sidebarStyles.disabledButton}>
                <span>Claude 3</span>
                <span style={sidebarStyles.badge}>Soon</span>
              </button>
            </li>
          </ul>
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
            maxHeight: conceptsOpen ? '600px' : '0px',
            opacity: conceptsOpen ? 1 : 0,
          }}>
            <ul style={sidebarStyles.list}>
              {CONCEPTS.map((c) => (
                <li
                  key={c.name}
                  style={{
                    ...sidebarStyles.conceptItem,
                    cursor: c.ready ? 'pointer' : 'not-allowed',
                    color: selectedModel === c.route ? theme.accent : (c.ready ? '#ccc' : '#555'),
                    transition: 'color 0.2s',
                  }}
                  onClick={() => c.ready && onSelectModel(c.route)}
                  onMouseEnter={(e) => { if (c.ready) e.currentTarget.style.color = theme.accent; }}
                  onMouseLeave={(e) => { if (c.ready && selectedModel !== c.route) e.currentTarget.style.color = '#ccc'; }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedModel === c.route && <span style={sidebarStyles.activeDot} />}
                    {c.name}
                  </span>
                  {!c.ready && <span style={sidebarStyles.badge}>Soon</span>}
                </li>
              ))}
            </ul>
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
