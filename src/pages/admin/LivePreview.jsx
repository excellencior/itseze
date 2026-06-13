import Latex from '../../components/Latex';
import { BarChart3D, ScatterPlot3D } from '../../components/three';
import { renderCustomElement } from './widgetsRegistry';

/* ═══════════════════════════════════════════
 *  Preview Primitives
 * ═══════════════════════════════════════════ */
function richContentToHtml(raw) {
  if (!raw) return '';
  let cleaned = raw.replace(
    /<Highlight>(.*?)<\/Highlight>/g,
    '<span style="background:rgba(8,145,178,0.2);border-bottom:2px solid #0891B2;padding:1px 4px">$1</span>'
  );
  cleaned = cleaned.replace(
    /<HoverCard\s+term=["']([^"']+)["'][^>]*>[\s\S]*?<\/HoverCard>/g,
    '<span class="hover-card-trigger" style="border-bottom: 1px dashed var(--accent); cursor: help;">$1</span>'
  );
  return cleaned;
}

function PreviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px', color: '#111827' }}>{title}</h2>
      {children}
    </div>
  );
}

function PreviewP({ children }) {
  if (typeof children === 'string') {
    return <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#374151', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: richContentToHtml(children) }} />;
  }
  return <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#374151', marginBottom: '16px' }}>{children}</p>;
}

function PreviewCallout({ type = 'info', children }) {
  const colors = {
    info:    { bg: '#EFF6FF', border: '#3B82F6', icon: 'i' },
    warning: { bg: '#FFF7ED', border: '#F59E0B', icon: '!' },
    key:     { bg: '#F0FDF4', border: '#10B981', icon: '*' },
    accent:  { bg: 'rgba(8,145,178,0.08)', border: '#0891B2', icon: '>' },
  };
  const c = colors[type] || colors.info;
  if (typeof children === 'string') {
    return (
      <div style={{
        background: c.bg, borderLeft: `4px solid ${c.border}`,
        padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',
        fontSize: '14px', lineHeight: 1.6, color: '#374151',
      }}>
        <span style={{ marginRight: '8px', fontWeight: 700 }}>{c.icon}</span>
        <span dangerouslySetInnerHTML={{ __html: richContentToHtml(children) }} />
      </div>
    );
  }
  return (
    <div style={{
      background: c.bg, borderLeft: `4px solid ${c.border}`,
      padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',
      fontSize: '14px', lineHeight: 1.6, color: '#374151',
    }}>
      <span style={{ marginRight: '8px', fontWeight: 700 }}>{c.icon}</span>{children}
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  Block Preview Renderer
 * ═══════════════════════════════════════════ */
function renderPreviewBlock(block, idx) {
  switch (block.type) {
    case 'paragraph':
      return <PreviewP key={idx}>{block.content || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Empty paragraph</span>}</PreviewP>;

    case 'callout':
      return <PreviewCallout key={idx} type={block.calloutType}>{block.content || 'Empty callout'}</PreviewCallout>;

    case 'math-box':
      return block.expression ? (
        <div key={idx} style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0', background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: '4px', color: '#111' }}>
          <Latex math={block.expression} block />
        </div>
      ) : null;

    case 'code-block':
      return (
        <div key={idx} style={{
          background: '#1e1e24', padding: '16px 18px',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.65,
          color: '#e5c07b', borderRadius: '6px', border: '1px solid #333',
          overflowX: 'auto', position: 'relative', margin: '16px 0',
        }}>
          {block.label && (
            <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0891B2', opacity: 0.7 }}>
              {block.label}
            </div>
          )}
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{block.content || '...'}</pre>
        </div>
      );

    case 'three-scene': {
      let parsedData = null;
      try { parsedData = JSON.parse(block.data); } catch { /* */ }
      if (!parsedData) return null;
      return (
        <div key={idx} style={{ margin: '16px 0' }}>
          {block.sceneType === 'bar-chart' && Array.isArray(parsedData) && (
            <BarChart3D data={parsedData} height={block.height || 280} hint={block.hint} />
          )}
          {block.sceneType === 'scatter-plot' && parsedData.points && (
            <ScatterPlot3D
              points={parsedData.points}
              connections={parsedData.connections}
              height={block.height || 280}
              hint={block.hint}
            />
          )}
        </div>
      );
    }

    case 'prop-table': {
      const rows = (block.rows || []).filter(([k, v]) => k || v);
      if (rows.length === 0) return null;
      return (
        <table key={idx} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid #e5e7eb', color: '#374151' }}>
          <tbody>
            {rows.map(([k, v], i) => (
              <tr key={i}>
                <td style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', width: '40%', background: '#F9FAFB', color: '#1f2937' }}>{k}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'custom-element':
      return renderCustomElement(block, idx);

    case 'reference':
    case 'ai-disclosure':
      return null;

    default:
      return null;
  }
}

/* ═══════════════════════════════════════════
 *  LivePreview Component
 * ═══════════════════════════════════════════ */
export default function LivePreview({ meta, blocks, onScrollToBlock }) {
  const categoryLabel = meta.subcategory || (meta.category === 'concept' ? 'Concept' : meta.category === 'reasoning' ? 'Reasoning' : meta.category === 'prompting' ? 'Prompting' : 'Architecture');

  const wrapBlock = (blockId, element) => {
    if (!element) return null;
    return (
      <div
        key={blockId}
        className="preview-block-wrapper"
        onDoubleClick={() => onScrollToBlock?.(blockId)}
        title="Double-click to jump to editor"
      >
        {element}
      </div>
    );
  };

  const contentBlocks = blocks.filter(b => b.type !== 'reference' && b.type !== 'ai-disclosure');
  const refBlocks = blocks.filter(b => b.type === 'reference');
  const disclosureBlock = blocks.find(b => b.type === 'ai-disclosure');

  const elements = [];
  let sectionKey = 0;
  let sectionChildren = [];
  let currentTitle = '';

  const flushSection = (title) => {
    if (title || sectionChildren.length > 0) {
      elements.push(
        <PreviewSection key={`sec-${sectionKey++}`} title={title}>
          {sectionChildren}
        </PreviewSection>
      );
      sectionChildren = [];
    }
  };

  contentBlocks.forEach((block, idx) => {
    if (block.type === 'section') {
      if (sectionChildren.length > 0 || currentTitle) {
        flushSection(currentTitle);
      }
      currentTitle = block.title || 'Untitled';
      return;
    }

    const el = renderPreviewBlock(block, idx);
    if (el) {
      const wrapped = wrapBlock(block.id, el);
      if (currentTitle) {
        sectionChildren.push(wrapped);
      } else {
        elements.push(wrapped);
      }
    }
  });
  if (sectionChildren.length > 0 || currentTitle) {
    flushSection(currentTitle);
  }

  return (
    <div style={{ width: '90%', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '8px' }}>
          {categoryLabel}
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px', color: '#111827' }}>
          {meta.title || 'Page Title'}
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6 }}>
          {meta.subtitle || 'Page subtitle goes here...'}
        </p>
      </div>

      {elements}

      {refBlocks.length > 0 && (
        <PreviewSection title="References & Further Reading">
          <ul style={{ fontSize: '14px', lineHeight: 2, color: '#4b5563', paddingLeft: '20px', listStyle: 'disc' }}>
            {refBlocks.map((ref, i) => (
              <li key={`ref-${i}`} style={{ marginBottom: '4px' }}>
                <a
                  href={ref.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0891B2', fontWeight: 600, textDecoration: 'none' }}
                >
                  {ref.title || 'Paper Title'}
                </a>
                {' '}by {ref.authors || '...'}, {ref.venue || '...'} {ref.year || ''}.{' '}
                {ref.description || ''}
              </li>
            ))}
          </ul>
        </PreviewSection>
      )}

      {disclosureBlock && (
        <div style={{
          marginTop: '32px', padding: '16px 20px', background: '#F8F8F8',
          border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '13px',
          color: '#6B7280', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#4b5563' }}>A note on this article:</strong> {disclosureBlock.content}
        </div>
      )}
    </div>
  );
}
