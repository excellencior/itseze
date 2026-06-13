import { useState } from 'react';

// Reusable components
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p>{children}</p>;
}

export default function PromptingHubPage({ onNavigate }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const nodes = [
    { id: 'zero-shot', name: 'Zero-Shot', x: 120, y: 150, route: 'concept:prompting-zero-shot', desc: 'Task completion through instructions alone, without any demonstrations. The simplest baseline for evaluating LLM capabilities.' },
    { id: 'few-shot', name: 'Few-Shot ICL', x: 120, y: 320, route: 'concept:prompting-few-shot', desc: 'In-context learning via k input-output demonstrations, leveraging the model\'s ability to learn patterns at inference time without weight updates.' },
    { id: 'cot', name: 'Chain-of-Thought', x: 400, y: 150, route: 'concept:prompting-cot', desc: 'Few-shot prompting with step-by-step reasoning exemplars that decompose complex problems into intermediate steps.' },
    { id: 'zero-cot', name: 'Zero-Shot CoT', x: 400, y: 320, route: 'concept:prompting-zero-cot', desc: 'Eliciting reasoning chains without demonstrations using a simple trigger phrase: "Let\'s think step by step."' },
    { id: 'ltm', name: 'Least-to-Most', x: 650, y: 150, route: 'concept:prompting-ltm', desc: 'Decomposing complex problems into simpler subproblems and solving them sequentially, enabling easy-to-hard generalization.' },
    { id: 'sc', name: 'Self-Consistency', x: 650, y: 320, route: 'concept:prompting-sc', desc: 'Sampling multiple diverse reasoning paths and selecting the most consistent answer via majority voting.' },
  ];

  const connections = [
    { from: 'zero-shot', to: 'few-shot' },
    { from: 'zero-shot', to: 'zero-cot' },
    { from: 'few-shot', to: 'cot' },
    { from: 'cot', to: 'zero-cot' },
    { from: 'cot', to: 'sc' },
    { from: 'cot', to: 'ltm' },
  ];

  const activeNodeInfo = hoveredNode ? nodes.find(n => n.id === hoveredNode) : null;

  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Topic Overview
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', lineHeight: 1.1 }}>
          The Landscape of Prompting Strategies
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          Prompting strategies have transformed how we interact with large language models, evolving from simple zero-shot instructions to sophisticated multi-step reasoning frameworks. Explore the lineage of techniques, from basic demonstrations through chain-of-thought decomposition to self-consistency ensembles, that unlock increasingly powerful capabilities without modifying a single model weight.
        </p>
      </div>

      {/* SVG Interactive Map */}
      <Section title="Interactive Strategy Map">
        <P>
          Hover over the nodes below to see how these strategies connect, and click any node to read the detailed subblog.
        </P>

        <div style={{
          position: 'relative',
          background: '#0a0a0c',
          borderRadius: '12px',
          border: '1px solid #222',
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8), 0 10px 30px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          marginBottom: '32px',
          aspectRatio: '8/5',
        }}>
          {/* Grid Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#222 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.4,
          }} />

          {/* SVG Elements */}
          <svg style={{ width: '100%', height: '100%', zIndex: 1, position: 'relative' }} viewBox="0 0 800 500">
            {/* Glow Filter */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting lines */}
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to;

              // Generate nice Bezier curves
              const dx = toNode.x - fromNode.x;
              const cx1 = fromNode.x + dx * 0.4;
              const cy1 = fromNode.y;
              const cx2 = fromNode.x + dx * 0.6;
              const cy2 = toNode.y;

              return (
                <path
                  key={idx}
                  d={`M ${fromNode.x} ${fromNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toNode.x} ${toNode.y}`}
                  fill="none"
                  stroke={isHighlighted ? 'var(--accent)' : '#2e2e36'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={isHighlighted ? 'none' : '4 4'}
                  style={{
                    transition: 'all 0.3s ease',
                    filter: isHighlighted ? 'url(#glow)' : 'none',
                    opacity: hoveredNode && !isHighlighted ? 0.2 : 0.8,
                  }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isHovered = hoveredNode === node.id;
              const isActive = isHovered;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNavigate(node.route)}
                >
                  {/* Outer ring */}
                  <circle
                    r={isActive ? 22 : 14}
                    fill="none"
                    stroke={isActive ? 'var(--accent)' : '#333'}
                    strokeWidth={1.5}
                    style={{ transition: 'all 0.25s cubic-bezier(0.2, 1, 0.2, 1)' }}
                  />

                  {/* Node fill */}
                  <circle
                    r={isActive ? 16 : 8}
                    fill={isActive ? 'var(--accent)' : '#121216'}
                    stroke={isActive ? 'var(--accent)' : '#555'}
                    strokeWidth={2}
                    style={{ transition: 'all 0.25s cubic-bezier(0.2, 1, 0.2, 1)' }}
                  />

                  {/* Text label */}
                  <text
                    y={isActive ? -32 : -22}
                    textAnchor="middle"
                    fill={isActive ? '#fff' : '#888'}
                    fontSize={isActive ? '13px' : '11px'}
                    fontWeight={isActive ? 800 : 600}
                    style={{
                      transition: 'all 0.25s ease',
                      fontFamily: 'var(--font-main)',
                      letterSpacing: '-0.3px',
                      pointerEvents: 'none',
                    }}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Details Overlay (Glassmorphism card) */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            background: 'rgba(15, 15, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#fff',
            borderRadius: '8px',
            opacity: activeNodeInfo ? 1 : 0.8,
            transition: 'all 0.3s ease',
            pointerEvents: activeNodeInfo ? 'auto' : 'none',
          }}>
            <div style={{ flex: 1, marginRight: '16px' }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: 800,
                color: activeNodeInfo ? 'var(--accent)' : '#fff',
                marginBottom: '4px',
                letterSpacing: '-0.3px',
              }}>
                {activeNodeInfo ? activeNodeInfo.name : 'Select a strategy above'}
              </h3>
              <p style={{
                fontSize: '12.5px',
                color: activeNodeInfo ? '#ccc' : '#888',
                lineHeight: 1.4,
              }}>
                {activeNodeInfo ? activeNodeInfo.desc : 'Hover or tap on any strategy node in the network to inspect its connections and summary.'}
              </p>
            </div>
            {activeNodeInfo && (
              <button
                onClick={() => onNavigate(activeNodeInfo.route)}
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
                  transition: 'transform 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Read Blog →
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Grid of Subblogs */}
      <Section title="Featured Subblogs">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
          marginTop: '16px',
        }}>
          {nodes.map((node) => (
            <div
              key={node.id}
              onClick={() => onNavigate(node.route)}
              style={{
                background: '#fff',
                border: '1px solid var(--border)',
                padding: '24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = 'var(--accent-50)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px'
              }}>
                Strategy
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 800,
                color: '#000',
                marginBottom: '10px',
                letterSpacing: '-0.5px'
              }}>
                {node.name}
              </h3>
              <p style={{
                fontSize: '13.5px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                marginBottom: '20px',
                flex: 1,
              }}>
                {node.desc}
              </p>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                Explore Interactive Blog <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
