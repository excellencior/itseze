import { useState, useCallback, useRef, useEffect } from 'react';
import Latex from '../../components/Latex';
import { BarChart3D, ScatterPlot3D } from '../../components/three';
import { ARCHITECTURES, CONCEPTS } from '../../navigation';
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
  { type: 'three-scene', icon: '🧊', label: '3D Scene' },
  { type: 'prop-table', icon: '⊞', label: 'Prop Table' },
  { type: 'reference', icon: '📄', label: 'Reference' },
  { type: 'ai-disclosure', icon: '🤖', label: 'AI Note' },
];

/* ═══════════════════════════════════════════
 *  Section / Subsection hierarchy from navigation.js
 * ═══════════════════════════════════════════ */
function buildSectionTree() {
  // Build: Architecture (flat), Concepts (flat items + grouped children)
  const sections = [
    {
      key: 'architecture',
      label: 'Architectures',
      items: ARCHITECTURES.map(a => ({ name: a.name, route: a.route })),
      children: [],
    },
    {
      key: 'concept',
      label: 'Concepts',
      items: [],
      children: [],
    },
  ];

  const conceptSection = sections[1];
  CONCEPTS.forEach(item => {
    if (item.children) {
      conceptSection.children.push({
        key: item.name.toLowerCase().replace(/\s+/g, '-'),
        label: item.name,
        items: item.children.map(c => ({ name: c.name, route: c.route })),
      });
    } else {
      conceptSection.items.push({ name: item.name, route: item.route });
    }
  });

  return sections;
}

const SECTION_TREE = buildSectionTree();

let _idCounter = 0;
function uid() { return `b-${++_idCounter}-${Date.now()}`; }

/** Convert a route key like 'concept:reasoning-symbolic' → '/concepts/reasoning/symbolic' */
function routeKeyToPath(routeKey) {
  if (!routeKey) return null;
  if (!routeKey.startsWith('concept:')) return `/${routeKey}`;
  const rest = routeKey.replace('concept:', '');
  // subcategory patterns: reasoning-X, prompting-X
  const subMatch = rest.match(/^(reasoning|prompting)-(.+)$/);
  if (subMatch) return `/concepts/${subMatch[1]}/${subMatch[2]}`;
  return `/concepts/${rest}`;
}

const THREE_SCENE_TYPES = [
  { value: 'bar-chart', label: 'Bar Chart 3D' },
  { value: 'scatter-plot', label: 'Scatter Plot 3D' },
];

const DEFAULT_THREE_DATA = {
  'bar-chart': JSON.stringify([
    { label: 'A', value: 0.8, color: '#6366f1' },
    { label: 'B', value: 0.6, color: '#3b82f6' },
    { label: 'C', value: 0.9, color: '#10b981' },
  ], null, 2),
  'scatter-plot': JSON.stringify({
    points: [
      { label: 'king', position: [1.2, 1.5, 0], color: '#6366f1' },
      { label: 'queen', position: [1.0, 1.3, 0.5], color: '#a855f7' },
      { label: 'man', position: [-0.5, 0.2, 0], color: '#3b82f6' },
      { label: 'woman', position: [-0.7, 0.0, 0.5], color: '#ec4899' },
    ],
    connections: [[0, 1], [2, 3]],
  }, null, 2),
};

function createBlock(type) {
  const base = { type, id: uid() };
  switch (type) {
    case 'section':        return { ...base, title: '' };
    case 'paragraph':      return { ...base, content: '' };
    case 'callout':        return { ...base, calloutType: 'key', content: '' };
    case 'math-box':       return { ...base, expression: '' };
    case 'code-block':     return { ...base, label: '', content: '' };
    case 'three-scene':    return { ...base, sceneType: 'bar-chart', data: DEFAULT_THREE_DATA['bar-chart'], height: 280, hint: 'Drag to rotate · Scroll to zoom' };
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
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px', color: '#111827' }}>{title}</h2>
      {children}
    </div>
  );
}

/**
 * Converts editor content strings containing HTML tags + <Highlight> into
 * safe HTML that can be rendered via dangerouslySetInnerHTML.
 * Replaces <Highlight>...</Highlight> with styled <span> matching the project component.
 */
function richContentToHtml(raw) {
  if (!raw) return '';
  // Convert <Highlight>...</Highlight> to styled spans
  return raw.replace(
    /<Highlight>(.*?)<\/Highlight>/g,
    '<span style="background:rgba(8,145,178,0.2);border-bottom:2px solid #0891B2;padding:1px 4px">$1</span>'
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
    info:    { bg: '#EFF6FF', border: '#3B82F6', icon: 'ℹ️' },
    warning: { bg: '#FFF7ED', border: '#F59E0B', icon: '⚠️' },
    key:     { bg: '#F0FDF4', border: '#10B981', icon: '💡' },
    accent:  { bg: 'rgba(8,145,178,0.08)', border: '#0891B2', icon: '↩' },
  };
  const c = colors[type] || colors.info;
  if (typeof children === 'string') {
    return (
      <div style={{
        background: c.bg, borderLeft: `4px solid ${c.border}`,
        padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',
        fontSize: '14px', lineHeight: 1.6, color: '#374151',
      }}>
        <span style={{ marginRight: '8px' }}>{c.icon}</span>
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
      <span style={{ marginRight: '8px' }}>{c.icon}</span>{children}
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  Rich Text Area with Formatting Toolbar
 * ═══════════════════════════════════════════ */
function RichTextArea({ value, onChange, placeholder, rows = 4 }) {
  const textareaRef = useRef(null);

  const wrapSelection = (before, after) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    const newValue =
      value.substring(0, start) +
      before + selected + after +
      value.substring(end);
    onChange(newValue);
    // Restore cursor after the wrapped text
    requestAnimationFrame(() => {
      ta.focus();
      const newCursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(newCursor, newCursor);
    });
  };

  const FORMAT_BUTTONS = [
    { label: 'B', title: 'Bold', before: '<strong>', after: '</strong>', style: { fontWeight: 800 } },
    { label: 'I', title: 'Italic', before: '<em>', after: '</em>', style: { fontStyle: 'italic' } },
    { label: 'U', title: 'Underline', before: '<u>', after: '</u>', style: { textDecoration: 'underline' } },
    { label: 'H', title: 'Highlight', before: '<Highlight>', after: '</Highlight>', style: { background: 'rgba(8,145,178,0.25)', borderBottom: '2px solid #0891B2', padding: '0 2px' } },
  ];

  return (
    <div>
      <div className="rich-toolbar">
        {FORMAT_BUTTONS.map(btn => (
          <button
            key={btn.label}
            type="button"
            className="rich-toolbar-btn"
            title={btn.title}
            onClick={() => wrapSelection(btn.before, btn.after)}
            style={btn.style}
          >
            {btn.label}
          </button>
        ))}
        <span className="rich-toolbar-hint">Select text, then click to wrap</span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
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
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef(null);

  const wrapSelection = (before, after) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = block.content.substring(start, end);
    const newValue =
      block.content.substring(0, start) +
      before + selected + after +
      block.content.substring(end);
    onChange({ ...block, content: newValue });
    requestAnimationFrame(() => {
      ta.focus();
      const newCursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(newCursor, newCursor);
    });
  };

  const FORMAT_BUTTONS = [
    { label: 'B', title: 'Bold', before: '<strong>', after: '</strong>', style: { fontWeight: 800 } },
    { label: 'I', title: 'Italic', before: '<em>', after: '</em>', style: { fontStyle: 'italic' } },
    { label: 'U', title: 'Underline', before: '<u>', after: '</u>', style: { textDecoration: 'underline' } },
    { label: 'H', title: 'Highlight', before: '<Highlight>', after: '</Highlight>', style: { background: 'rgba(8,145,178,0.25)', borderBottom: '2px solid #0891B2', padding: '0 2px' } },
  ];

  if (expanded) {
    return (
      <div className="block-fullscreen">
        <div className="block-fullscreen-header">
          <span className="block-fullscreen-title">¶ Paragraph Editor</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="rich-toolbar" style={{ marginBottom: 0 }}>
              {FORMAT_BUTTONS.map(btn => (
                <button
                  key={btn.label}
                  type="button"
                  className="rich-toolbar-btn"
                  title={btn.title}
                  onClick={() => wrapSelection(btn.before, btn.after)}
                  style={btn.style}
                >{btn.label}</button>
              ))}
            </div>
            <button className="block-fullscreen-close" onClick={() => setExpanded(false)}>✕ Close</button>
          </div>
        </div>
        <div className="block-fullscreen-body">
          <textarea
            ref={textareaRef}
            className="block-fullscreen-textarea prose-input"
            value={block.content}
            onChange={e => onChange({ ...block, content: e.target.value })}
            placeholder="Write your paragraph content here..."
            autoFocus
          />
        </div>
      </div>
    );
  }

  return (
    <div className="block-card-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="field-label" style={{ margin: 0 }}>Content</div>
        <button
          className="block-action-btn"
          onClick={() => setExpanded(true)}
          title="Expand to fullscreen editor"
          style={{ fontSize: '10px', width: 'auto', height: 'auto', padding: '2px 8px', fontWeight: 700 }}
        >⛶ Expand</button>
      </div>
      <RichTextArea
        value={block.content}
        onChange={content => onChange({ ...block, content })}
        placeholder="Write paragraph text here..."
        rows={4}
      />
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
      <RichTextArea
        value={block.content}
        onChange={content => onChange({ ...block, content })}
        placeholder="Callout content..."
        rows={3}
      />
    </div>
  );
}

function MathBoxEditor({ block, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = moveEvent.clientX - containerRect.left;
      const percentage = (offsetX / containerRect.width) * 100;
      setLeftWidth(Math.min(80, Math.max(20, percentage)));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  if (expanded) {
    return (
      <div className="block-fullscreen">
        <div className="block-fullscreen-header">
          <span className="block-fullscreen-title">∑ LaTeX Editor</span>
          <button className="block-fullscreen-close" onClick={() => setExpanded(false)} title="Close fullscreen">✕ Close</button>
        </div>
        <div className="block-fullscreen-body" ref={containerRef}>
          <div style={{ width: `${leftWidth}%`, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <textarea
              className="block-fullscreen-textarea"
              value={block.expression}
              onChange={e => onChange({ ...block, expression: e.target.value })}
              placeholder={"\\begin{equation}\n  \\text{your expression here}\n\\end{equation}"}
              autoFocus
            />
          </div>
          <div 
            className="block-fullscreen-splitter" 
            onMouseDown={handleMouseDown}
          />
          <div className="block-fullscreen-preview" style={{ flex: 1, width: `${100 - leftWidth}%` }}>
            <div className="block-fullscreen-preview-label">Live Preview</div>
            <div className="block-fullscreen-preview-content">
              {block.expression ? (
                <Latex math={block.expression} block />
              ) : (
                <span style={{ color: '#52525b', fontStyle: 'italic', fontSize: '13px' }}>Preview appears here...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block-card-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="field-label" style={{ margin: 0 }}>LaTeX Expression</div>
        <button
          className="block-action-btn"
          onClick={() => setExpanded(true)}
          title="Expand to fullscreen editor"
          style={{ fontSize: '10px', width: 'auto', height: 'auto', padding: '2px 8px', fontWeight: 700 }}
        >⛶ Expand</button>
      </div>
      <textarea className="math-input" value={block.expression} onChange={e => onChange({ ...block, expression: e.target.value })} placeholder="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right) V" rows={2} style={{ marginTop: '4px' }} />
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

function ThreeSceneEditor({ block, onChange }) {
  const [dataError, setDataError] = useState(null);
  const [parsedData, setParsedData] = useState(() => {
    try { return JSON.parse(block.data); } catch { return null; }
  });

  const handleDataChange = (raw) => {
    onChange({ ...block, data: raw });
    try {
      const parsed = JSON.parse(raw);
      setParsedData(parsed);
      setDataError(null);
    } catch (e) {
      setDataError(e.message);
      setParsedData(null);
    }
  };

  const handleSceneTypeChange = (newType) => {
    onChange({
      ...block,
      sceneType: newType,
      data: DEFAULT_THREE_DATA[newType] || '[]',
    });
    try { setParsedData(JSON.parse(DEFAULT_THREE_DATA[newType])); setDataError(null); } catch { /* */ }
  };

  return (
    <div className="block-card-body">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1 }}>
          <div className="field-label">Scene Type</div>
          <select
            className="callout-type-select"
            value={block.sceneType}
            onChange={e => handleSceneTypeChange(e.target.value)}
            style={{ width: '100%' }}
          >
            {THREE_SCENE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div style={{ width: '80px' }}>
          <div className="field-label">Height</div>
          <input type="text" value={block.height} onChange={e => onChange({ ...block, height: parseInt(e.target.value) || 280 })} />
        </div>
      </div>
      <div className="field-label">Hint Text</div>
      <input type="text" value={block.hint || ''} onChange={e => onChange({ ...block, hint: e.target.value })} placeholder="Drag to rotate · Scroll to zoom" />
      <div className="field-label">Data (JSON)</div>
      <textarea
        className="math-input"
        value={block.data}
        onChange={e => handleDataChange(e.target.value)}
        rows={6}
        style={dataError ? { borderColor: '#ef4444' } : {}}
      />
      {dataError && (
        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>⚠ {dataError}</div>
      )}

      {/* Live 3D preview inside the editor card */}
      {parsedData && (
        <div style={{ marginTop: '10px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #27272a' }}>
          {block.sceneType === 'bar-chart' && Array.isArray(parsedData) && (
            <BarChart3D data={parsedData} height={Math.min(block.height || 280, 220)} hint={block.hint} />
          )}
          {block.sceneType === 'scatter-plot' && parsedData.points && (
            <ScatterPlot3D
              points={parsedData.points}
              connections={parsedData.connections}
              height={Math.min(block.height || 280, 220)}
              hint={block.hint}
            />
          )}
        </div>
      )}
    </div>
  );
}

const BLOCK_EDITORS = {
  'section':        SectionEditor,
  'paragraph':      ParagraphEditor,
  'callout':        CalloutEditor,
  'math-box':       MathBoxEditor,
  'code-block':     CodeBlockEditor,
  'three-scene':    ThreeSceneEditor,
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
      data-block-id={block.id}
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
function LivePreview({ meta, blocks, onScrollToBlock }) {
  const categoryLabel = meta.subcategory || (meta.category === 'concept' ? 'Concept' : meta.category === 'reasoning' ? 'Reasoning' : meta.category === 'prompting' ? 'Prompting' : 'Architecture');

  // Wrap a preview element with a double-click handler that scrolls to the editor block
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

  // Separate references and ai-disclosure from content blocks
  const contentBlocks = blocks.filter(b => b.type !== 'reference' && b.type !== 'ai-disclosure');
  const refBlocks = blocks.filter(b => b.type === 'reference');
  const disclosureBlock = blocks.find(b => b.type === 'ai-disclosure');

  // Group content blocks into sections
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
      {/* Header */}
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

      {/* Content sections */}
      {elements}

      {/* References section */}
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

      {/* AI Disclosure */}
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

    case 'reference':
      return null;  // handled by LivePreview grouping

    case 'ai-disclosure':
      return null;  // handled by LivePreview footer

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

  const [canvasWidth, setCanvasWidth] = useState(50); // percentage
  const mainBodyRef = useRef(null);

  const handleCanvasResize = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      if (!mainBodyRef.current) return;
      const rect = mainBodyRef.current.getBoundingClientRect();
      const paletteEl = mainBodyRef.current.querySelector('.editor-palette');
      const paletteWidth = paletteEl ? paletteEl.getBoundingClientRect().width : 180;
      
      const totalSplitWidth = rect.width - paletteWidth;
      if (totalSplitWidth <= 0) return;

      const relativeX = moveEvent.clientX - rect.left - paletteWidth;
      const percentage = (relativeX / totalSplitWidth) * 100;
      setCanvasWidth(Math.min(80, Math.max(20, percentage)));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

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
  const saveDraft = () => {
    const slug = meta.title
      ? meta.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')
      : 'untitled';
    const key = `itseze-draft-${slug}`;
    const payload = {
      meta,
      blocks,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
    flash('✓ Draft saved');
  };

  // ── Publish ──
  const publishPage = () => {
    if (!meta.title) { flash('✗ Add a title before publishing'); return; }
    if (blocks.length === 0) { flash('✗ Add some content before publishing'); return; }

    const urlPath = routeKeyToPath(meta.route);
    if (!urlPath) { flash('✗ Cannot determine URL path'); return; }

    // Load existing published pages
    let published = {};
    try { published = JSON.parse(localStorage.getItem('itseze-published') || '{}'); } catch { /* */ }

    const existing = published[urlPath];
    const now = new Date().toISOString();

    published[urlPath] = {
      meta: { ...meta, ready: true },
      blocks,
      firstPublishedAt: existing?.firstPublishedAt || now,
      publishedAt: now,
    };

    localStorage.setItem('itseze-published', JSON.stringify(published));
    flash(`✓ Published at ${urlPath}`);
  };

  const [savedDrafts, setSavedDrafts] = useState([]);
  useEffect(() => {
    const drafts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('itseze-draft-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          drafts.push({
            key,
            title: data.meta?.title || key.replace('itseze-draft-', ''),
            savedAt: data.savedAt,
          });
        } catch {
          drafts.push({ key, title: key.replace('itseze-draft-', ''), savedAt: '' });
        }
      }
    }
    drafts.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
    setSavedDrafts(drafts);
  }, [toast]); // refresh on save

  const loadDraft = (draftKey) => {
    const data = localStorage.getItem(draftKey);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setMeta(parsed.meta || {});
        setBlocks(parsed.blocks || []);
        flash(`✓ Loaded draft`);
      } catch { flash('✗ Failed to parse'); }
    }
  };

  const deleteDraft = (draftKey) => {
    localStorage.removeItem(draftKey);
    flash('✓ Draft deleted');
  };

  return (
    <div className="editor-root">
      {/* ── Toolbar ── */}
      <div className="editor-toolbar">
        <span className="logo">itseze editor</span>
        <div className="toolbar-separator" />

        <input className="title-input" type="text" value={meta.title} onChange={e => setMeta(prev => ({ ...prev, title: e.target.value }))} placeholder="Page title" />
        <input className="subtitle-input" type="text" value={meta.subtitle} onChange={e => setMeta(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Subtitle" />

        <div className="toolbar-separator" />

        <button className="toolbar-btn" onClick={() => setShowPreview(p => !p)}>
          {showPreview ? '◨ Hide Preview' : '◧ Show Preview'}
        </button>
        <button className="toolbar-btn" onClick={saveDraft}>💾 Save Draft</button>
        <button className="toolbar-btn primary" onClick={publishPage}>▲ Publish</button>
      </div>

      {/* ── Main Body ── */}
      <div className="editor-body" ref={mainBodyRef}>
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
        <div 
          className="editor-canvas"
          style={showPreview ? { width: `${canvasWidth}%`, flex: 'none' } : { flex: 1 }}
        >
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

        {/* ── Splitter ── */}
        {showPreview && (
          <div 
            className="main-editor-splitter"
            onMouseDown={handleCanvasResize}
          />
        )}

        {/* ── Live Preview ── */}
        {showPreview && (
          <div 
            className="editor-preview"
            style={{ width: `${100 - canvasWidth}%`, flex: 'none' }}
          >
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
