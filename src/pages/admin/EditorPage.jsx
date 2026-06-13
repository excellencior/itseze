import { useState, useCallback, useRef, useEffect } from 'react';
import Latex from '../../components/Latex';
import { exportToJSX, exportToJSON } from './exportPage';
import './editor.css';

/* ═══════════════════════════════════════════
 *  Block Type Definitions
 * ═══════════════════════════════════════════ */
const BLOCK_TYPES = [
  { type: 'section', icon: '§', label: 'Section' },
  { type: 'paragraph', icon: '¶', label: 'Paragraph' },
  { type: 'callout', icon: '💡', label: 'Callout' },
  { type: 'math-box', icon: '∑', label: 'Display Math' },
  { type: 'code-block', icon: '</>', label: 'Code Block' },
  { type: 'prop-table', icon: '⊞', label: 'Prop Table' },
  { type: 'reference', icon: '📄', label: 'Reference' },
  { type: 'ai-disclosure', icon: '🤖', label: 'AI Note' },
];

const CATEGORIES = [
  { value: 'concept', label: 'Concept' },
  { value: 'reasoning', label: 'Reasoning' },
  { value: 'prompting', label: 'Prompting' },
  { value: 'architecture', label: 'Architecture' },
];

const SUBCATEGORIES = {
  reasoning: ['Symbolic', 'Probabilistic', 'Neural', 'Neuro-Symbolic', 'Chain-of-Thought', 'RAG', 'Program Synthesis'],
  prompting: ['Zero-Shot', 'Few-Shot', 'CoT', 'Zero-CoT', 'Least-to-Most', 'Self-Consistency'],
};

let _idCounter = 0;
function uid() { return `b-${++_idCounter}-${Date.now()}`; }

function createBlock(type) {
  const base = { type, id: uid() };
  switch (type) {
    case 'section':        return { ...base, title: '' };
    case 'paragraph':      return { ...base, content: '' };
    case 'callout':        return { ...base, calloutType: 'key', content: '' };
    case 'math-box':       return { ...base, expression: '' };
    case 'code-block':     return { ...base, label: '', content: '' };
    case 'prop-table':     return { ...base, rows: [['', '']] };
    case 'reference':      return { ...base, title: '', url: '', authors: '', venue: '', year: '', description: '' };
    case 'ai-disclosure':  return { ...base, content: 'This post was written with the help of AI. All content has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date.' };
    default:               return base;
  }
}

/* ═══════════════════════════════════════════
 *  Preview Components (mirror real page)
 * ═══════════════════════════════════════════ */
function PreviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>{title}</h2>
      {children}
    </div>
  );
}

function PreviewP({ children }) {
  return <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#333', marginBottom: '16px' }}>{children}</p>;
}

function PreviewCallout({ type = 'info', children }) {
  const colors = {
    info:    { bg: '#EFF6FF', border: '#3B82F6', icon: 'ℹ️' },
    warning: { bg: '#FFF7ED', border: '#F59E0B', icon: '⚠️' },
    key:     { bg: '#F0FDF4', border: '#10B981', icon: '💡' },
    accent:  { bg: 'rgba(8,145,178,0.08)', border: '#0891B2', icon: '↩' },
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{
      background: c.bg, borderLeft: `4px solid ${c.border}`,
      padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',
      fontSize: '14px', lineHeight: 1.6, color: '#333',
    }}>
      <span style={{ marginRight: '8px' }}>{c.icon}</span>{children}
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  Block Editors
 * ═══════════════════════════════════════════ */
function SectionEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Section Title</div>
      <input type="text" value={block.title} onChange={e => onChange({ ...block, title: e.target.value })} placeholder="e.g. 1. The Core Idea" />
    </div>
  );
}

function ParagraphEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Content (supports inline HTML + {'<Latex math="..." />'})</div>
      <textarea value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} placeholder="Write paragraph text here..." rows={4} />
    </div>
  );
}

function CalloutEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Type</div>
      <select className="callout-type-select" value={block.calloutType} onChange={e => onChange({ ...block, calloutType: e.target.value })}>
        <option value="key">💡 Key Insight</option>
        <option value="info">ℹ️ Info</option>
        <option value="warning">⚠️ Warning</option>
        <option value="accent">↩ Accent</option>
      </select>
      <div className="field-label">Content</div>
      <textarea value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} placeholder="Callout content..." rows={3} />
    </div>
  );
}

function MathBoxEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">LaTeX Expression</div>
      <textarea className="math-input" value={block.expression} onChange={e => onChange({ ...block, expression: e.target.value })} placeholder="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right) V" rows={2} />
      {block.expression && (
        <div style={{ marginTop: '8px', padding: '10px 14px', background: '#1a1a22', borderRadius: '4px', textAlign: 'center' }}>
          <Latex math={block.expression} />
        </div>
      )}
    </div>
  );
}

function CodeBlockEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Label (optional)</div>
      <input type="text" value={block.label} onChange={e => onChange({ ...block, label: e.target.value })} placeholder="e.g. prompt example" />
      <div className="field-label">Content</div>
      <textarea className="math-input" value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} placeholder="Code or prompt content..." rows={6} />
    </div>
  );
}

function PropTableEditor({ block, onChange }) {
  const rows = block.rows || [['', '']];
  const updateRow = (idx, col, val) => {
    const next = rows.map((r, i) => i === idx ? (col === 0 ? [val, r[1]] : [r[0], val]) : r);
    onChange({ ...block, rows: next });
  };
  const addRow = () => onChange({ ...block, rows: [...rows, ['', '']] });
  const removeRow = (idx) => onChange({ ...block, rows: rows.filter((_, i) => i !== idx) });

  return (
    <div className="block-card-body">
      <div className="field-label">Property Rows</div>
      {rows.map((row, idx) => (
        <div className="field-row" key={idx}>
          <input type="text" value={row[0]} onChange={e => updateRow(idx, 0, e.target.value)} placeholder="Property" style={{ fontWeight: 700 }} />
          <input type="text" value={row[1]} onChange={e => updateRow(idx, 1, e.target.value)} placeholder="Value" />
          <button className="row-btn delete" onClick={() => removeRow(idx)} title="Remove row">×</button>
        </div>
      ))}
      <button className="add-row-btn" onClick={addRow}>+ Add row</button>
    </div>
  );
}

function ReferenceEditor({ block, onChange }) {
  const set = (field, val) => onChange({ ...block, [field]: val });
  return (
    <div className="block-card-body">
      <div className="field-label">Paper Title</div>
      <input type="text" value={block.title} onChange={e => set('title', e.target.value)} placeholder="Attention Is All You Need" />
      <div className="field-label">URL</div>
      <input type="text" value={block.url} onChange={e => set('url', e.target.value)} placeholder="https://arxiv.org/abs/..." />
      <div className="field-row" style={{ marginTop: '8px' }}>
        <div style={{ flex: 1 }}>
          <div className="field-label">Authors</div>
          <input type="text" value={block.authors} onChange={e => set('authors', e.target.value)} placeholder="Vaswani, A., et al." />
        </div>
        <div style={{ width: '120px' }}>
          <div className="field-label">Venue</div>
          <input type="text" value={block.venue} onChange={e => set('venue', e.target.value)} placeholder="NeurIPS" />
        </div>
        <div style={{ width: '70px' }}>
          <div className="field-label">Year</div>
          <input type="text" value={block.year} onChange={e => set('year', e.target.value)} placeholder="2017" />
        </div>
      </div>
      <div className="field-label">Description</div>
      <textarea value={block.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of the paper's contribution..." rows={2} />
    </div>
  );
}

function AIDisclosureEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Disclosure Text</div>
      <textarea value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} rows={3} />
    </div>
  );
}

const BLOCK_EDITORS = {
  'section':        SectionEditor,
  'paragraph':      ParagraphEditor,
  'callout':        CalloutEditor,
  'math-box':       MathBoxEditor,
  'code-block':     CodeBlockEditor,
  'prop-table':     PropTableEditor,
  'reference':      ReferenceEditor,
  'ai-disclosure':  AIDisclosureEditor,
};

/* ═══════════════════════════════════════════
 *  Block Card Wrapper
 * ═══════════════════════════════════════════ */
function BlockCard({ block, index, onChange, onDelete, onMoveUp, onMoveDown, onDragStart, onDragOver, onDrop, isDragging, isDragOver, isFirst, isLast }) {
  const Editor = BLOCK_EDITORS[block.type];
  const typeDef = BLOCK_TYPES.find(t => t.type === block.type);

  return (
    <div
      className={`block-card${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}`}
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={e => onDrop(e, index)}
    >
      <div className="block-card-header">
        <span className="drag-handle">⠿</span>
        <span className="block-type-badge">{typeDef?.icon} {typeDef?.label || block.type}</span>
        <div className="block-actions">
          <button className="block-action-btn" onClick={onMoveUp} disabled={isFirst} title="Move up">↑</button>
          <button className="block-action-btn" onClick={onMoveDown} disabled={isLast} title="Move down">↓</button>
          <button className="block-action-btn delete" onClick={onDelete} title="Delete block">✕</button>
        </div>
      </div>
      {Editor && <Editor block={block} onChange={onChange} />}
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  Live Preview Renderer
 * ═══════════════════════════════════════════ */
function LivePreview({ meta, blocks }) {
  const categoryLabel = meta.subcategory || (meta.category === 'concept' ? 'Concept' : meta.category === 'reasoning' ? 'Reasoning' : meta.category === 'prompting' ? 'Prompting' : 'Architecture');

  // Group blocks into sections for rendering
  const renderBlocks = [];
  let currentSectionChildren = null;

  blocks.forEach((block, idx) => {
    if (block.type === 'section') {
      if (currentSectionChildren !== null) {
        renderBlocks.push({ type: '_section_end' });
      }
      renderBlocks.push({ type: '_section_start', title: block.title || 'Untitled' });
      currentSectionChildren = [];
    } else {
      renderBlocks.push(block);
    }
  });
  if (currentSectionChildren !== null) {
    renderBlocks.push({ type: '_section_end' });
  }

  let sectionDepth = 0;
  const elements = [];
  let sectionKey = 0;
  let sectionChildren = [];

  const flushSection = (title) => {
    elements.push(
      <PreviewSection key={`sec-${sectionKey++}`} title={title}>
        {sectionChildren}
      </PreviewSection>
    );
    sectionChildren = [];
  };

  let currentTitle = '';
  blocks.forEach((block, idx) => {
    if (block.type === 'section') {
      if (sectionChildren.length > 0 || currentTitle) {
        flushSection(currentTitle);
      }
      currentTitle = block.title || 'Untitled';
      return;
    }

    const el = renderPreviewBlock(block, idx);
    if (el) {
      if (currentTitle) {
        sectionChildren.push(el);
      } else {
        elements.push(el);
      }
    }
  });
  if (sectionChildren.length > 0 || currentTitle) {
    flushSection(currentTitle);
  }

  return (
    <div style={{ width: '90%', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF', marginBottom: '8px' }}>
          {categoryLabel}
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px', color: '#111' }}>
          {meta.title || 'Page Title'}
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.6 }}>
          {meta.subtitle || 'Page subtitle goes here...'}
        </p>
      </div>
      {elements}
    </div>
  );
}

function renderPreviewBlock(block, idx) {
  switch (block.type) {
    case 'paragraph':
      return <PreviewP key={idx}>{block.content || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Empty paragraph</span>}</PreviewP>;

    case 'callout':
      return <PreviewCallout key={idx} type={block.calloutType}>{block.content || 'Empty callout'}</PreviewCallout>;

    case 'math-box':
      return block.expression ? (
        <div key={idx} style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0', background: '#f8f8f8', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
          <Latex math={block.expression} />
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

    case 'prop-table': {
      const rows = (block.rows || []).filter(([k, v]) => k || v);
      if (rows.length === 0) return null;
      return (
        <table key={idx} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid #e5e7eb' }}>
          <tbody>
            {rows.map(([k, v], i) => (
              <tr key={i}>
                <td style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid #e5e7eb', width: '40%', background: '#FAFAFA' }}>{k}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'reference':
      return (
        <div key={idx} style={{ padding: '8px 0', fontSize: '14px', color: '#6B7280', lineHeight: 1.8 }}>
          <a href={block.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#0891B2', fontWeight: 600, textDecoration: 'none' }}>
            {block.title || 'Paper Title'}
          </a>{' '}by {block.authors || '...'}, {block.venue || '...'} {block.year || ''}. {block.description || ''}
        </div>
      );

    case 'ai-disclosure':
      return (
        <div key={idx} style={{
          marginTop: '32px', padding: '16px 20px', background: '#F8F8F8',
          border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '13px',
          color: '#9CA3AF', lineHeight: 1.6,
        }}>
          <strong style={{ color: '#6B7280' }}>A note on this article:</strong> {block.content}
        </div>
      );

    default:
      return null;
  }
}

/* ═══════════════════════════════════════════
 *  Main Editor Page
 * ═══════════════════════════════════════════ */
export default function EditorPage() {
  const [meta, setMeta] = useState({
    title: '', subtitle: '', category: 'concept', subcategory: '', route: '', ready: false,
  });
  const [blocks, setBlocks] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const [toast, setToast] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const toastTimer = useRef(null);

  // Auto-generate route from category + title
  useEffect(() => {
    if (meta.title) {
      const slug = meta.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
      const prefix = meta.category === 'architecture' ? '' : 'concept:';
      const sub = meta.subcategory ? meta.subcategory.toLowerCase().replace(/\s+/g, '-') + '-' : '';
      setMeta(prev => ({ ...prev, route: `${prefix}${meta.category === 'concept' ? '' : meta.category + '-'}${sub}${slug}` }));
    }
  }, [meta.title, meta.category, meta.subcategory]);

  const flash = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Block CRUD ──
  const addBlock = (type) => {
    setBlocks(prev => [...prev, createBlock(type)]);
  };

  const updateBlock = useCallback((id, updated) => {
    setBlocks(prev => prev.map(b => b.id === id ? updated : b));
  }, []);

  const deleteBlock = useCallback((id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  }, []);

  const moveBlock = useCallback((from, to) => {
    setBlocks(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  // ── Drag & Drop ──
  const handleDragStart = (e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIdx(idx);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) {
      moveBlock(dragIdx, idx);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  };

  // ── Persistence ──
  const saveToStorage = () => {
    const key = meta.route || 'itseze-editor-draft';
    localStorage.setItem(`itseze-editor-${key}`, JSON.stringify({ meta, blocks }));
    flash('✓ Saved to localStorage');
  };

  const loadFromStorage = () => {
    const key = meta.route || 'itseze-editor-draft';
    const data = localStorage.getItem(`itseze-editor-${key}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setMeta(parsed.meta || meta);
        setBlocks(parsed.blocks || []);
        flash('✓ Loaded from localStorage');
      } catch { flash('✗ Failed to parse saved data'); }
    } else {
      flash('No saved data found');
    }
  };

  // ── Export ──
  const handleExportJSX = () => {
    const jsx = exportToJSX({ meta, blocks });
    navigator.clipboard.writeText(jsx).then(() => flash('✓ JSX copied to clipboard'));
  };

  const handleExportJSON = () => {
    const json = exportToJSON({ meta, blocks });
    navigator.clipboard.writeText(json).then(() => flash('✓ JSON copied to clipboard'));
  };

  // ── List saved drafts ──
  const [savedDrafts, setSavedDrafts] = useState([]);
  useEffect(() => {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('itseze-editor-')) {
        drafts.push(key.replace('itseze-editor-', ''));
      }
    }
    setSavedDrafts(drafts);
  }, [toast]); // refresh on save

  const loadDraft = (draftKey) => {
    const data = localStorage.getItem(`itseze-editor-${draftKey}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setMeta(parsed.meta || {});
        setBlocks(parsed.blocks || []);
        flash(`✓ Loaded: ${draftKey}`);
      } catch { flash('✗ Failed to parse'); }
    }
  };

  return (
    <div className="editor-root">
      {/* ── Toolbar ── */}
      <div className="editor-toolbar">
        <span className="logo">itseze editor</span>
        <div className="toolbar-separator" />

        <input className="title-input" type="text" value={meta.title} onChange={e => setMeta(prev => ({ ...prev, title: e.target.value }))} placeholder="Page title" />
        <input className="subtitle-input" type="text" value={meta.subtitle} onChange={e => setMeta(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Subtitle" />

        <select value={meta.category} onChange={e => setMeta(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        {SUBCATEGORIES[meta.category] && (
          <select value={meta.subcategory} onChange={e => setMeta(prev => ({ ...prev, subcategory: e.target.value }))}>
            <option value="">No subcategory</option>
            {SUBCATEGORIES[meta.category].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        <div className="toolbar-separator" />

        <button className="toolbar-btn" onClick={() => setShowPreview(p => !p)}>
          {showPreview ? '◨ Hide Preview' : '◧ Show Preview'}
        </button>
        <button className="toolbar-btn" onClick={saveToStorage}>💾 Save</button>
        <button className="toolbar-btn" onClick={loadFromStorage}>📂 Load</button>
        <button className="toolbar-btn" onClick={handleExportJSON}>{ } JSON</button>
        <button className="toolbar-btn primary" onClick={handleExportJSX}>⬇ Export JSX</button>
      </div>

      {/* ── Main Body ── */}
      <div className="editor-body">
        {/* ── Block Palette ── */}
        <div className="editor-palette">
          <div className="palette-label">Add Block</div>
          {BLOCK_TYPES.map(bt => (
            <button key={bt.type} className="palette-item" onClick={() => addBlock(bt.type)}>
              <span className="palette-icon">{bt.icon}</span>
              {bt.label}
            </button>
          ))}

          {savedDrafts.length > 0 && (
            <>
              <div className="palette-label" style={{ marginTop: '24px' }}>Saved Drafts</div>
              {savedDrafts.map(d => (
                <button key={d} className="palette-item" onClick={() => loadDraft(d)} style={{ fontSize: '11px' }}>
                  <span className="palette-icon">📄</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* ── Editor Canvas ── */}
        <div className="editor-canvas">
          {blocks.length === 0 ? (
            <div className="canvas-empty">
              <div className="empty-icon">📝</div>
              <p>Click a block type from the left palette to start building your page.</p>
            </div>
          ) : (
            blocks.map((block, idx) => (
              <BlockCard
                key={block.id}
                block={block}
                index={idx}
                onChange={updated => updateBlock(block.id, updated)}
                onDelete={() => deleteBlock(block.id)}
                onMoveUp={() => idx > 0 && moveBlock(idx, idx - 1)}
                onMoveDown={() => idx < blocks.length - 1 && moveBlock(idx, idx + 1)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragging={dragIdx === idx}
                isDragOver={dragOverIdx === idx}
                isFirst={idx === 0}
                isLast={idx === blocks.length - 1}
              />
            ))
          )}
        </div>

        {/* ── Live Preview ── */}
        {showPreview && (
          <div className="editor-preview">
            <div className="preview-label">Live Preview</div>
            <div className="preview-content">
              <LivePreview meta={meta} blocks={blocks} />
            </div>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && <div className="editor-toast">{toast}</div>}
    </div>
  );
}
