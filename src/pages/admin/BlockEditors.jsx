import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

/* ═══════════════════════════════════════════
 *  Rich Text Area with Formatting Toolbar
 * ═══════════════════════════════════════════ */
const FORMAT_BUTTONS = [
  { label: 'B', title: 'Bold', before: '<strong>', after: '</strong>', style: { fontWeight: 800 } },
  { label: 'I', title: 'Italic', before: '<em>', after: '</em>', style: { fontStyle: 'italic' } },
  { label: 'U', title: 'Underline', before: '<u>', after: '</u>', style: { textDecoration: 'underline' } },
  { label: 'H', title: 'Highlight', before: '<Highlight>', after: '</Highlight>', style: { background: 'rgba(8,145,178,0.25)', borderBottom: '2px solid #0891B2', padding: '0 2px' } },
];

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
    requestAnimationFrame(() => {
      ta.focus();
      const newCursor = start + before.length + selected.length + after.length;
      ta.setSelectionRange(newCursor, newCursor);
    });
  };

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
 *  Individual Block Editors
 * ═══════════════════════════════════════════ */
export function SectionEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Section Title</div>
      <input type="text" value={block.title} onChange={e => onChange({ ...block, title: e.target.value })} placeholder="e.g. 1. The Core Idea" />
    </div>
  );
}

export function ParagraphEditor({ block, onChange }) {
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

  if (expanded) {
    const canvasEl = document.querySelector('.editor-canvas');
    const modalContent = (
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
    return canvasEl ? createPortal(modalContent, canvasEl) : modalContent;
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

export function CalloutEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Type</div>
      <select className="callout-type-select" value={block.calloutType} onChange={e => onChange({ ...block, calloutType: e.target.value })}>
        <option value="key">Key Insight</option>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="accent">Accent</option>
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

export function MathBoxEditor({ block, onChange }) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    const canvasEl = document.querySelector('.editor-canvas');
    const modalContent = (
      <div className="block-fullscreen">
        <div className="block-fullscreen-header">
          <span className="block-fullscreen-title">∑ LaTeX Editor</span>
          <button className="block-fullscreen-close" onClick={() => setExpanded(false)} title="Close fullscreen">✕ Close</button>
        </div>
        <div className="block-fullscreen-body">
          <textarea
            className="block-fullscreen-textarea"
            value={block.expression}
            onChange={e => onChange({ ...block, expression: e.target.value })}
            placeholder={"\\begin{equation}\n  \\text{your expression here}\n\\end{equation}"}
            autoFocus
          />
        </div>
      </div>
    );
    return canvasEl ? createPortal(modalContent, canvasEl) : modalContent;
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

export function CodeBlockEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Label (optional)</div>
      <input type="text" value={block.label} onChange={e => onChange({ ...block, label: e.target.value })} placeholder="e.g. prompt example" />
      <div className="field-label">Content</div>
      <textarea className="math-input" value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} placeholder="Code or prompt content..." rows={6} />
    </div>
  );
}

export function PropTableEditor({ block, onChange }) {
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

export function ReferenceEditor({ block, onChange }) {
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

export function AIDisclosureEditor({ block, onChange }) {
  return (
    <div className="block-card-body">
      <div className="field-label">Disclosure Text</div>
      <textarea value={block.content} onChange={e => onChange({ ...block, content: e.target.value })} rows={3} />
    </div>
  );
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

export function ThreeSceneEditor({ block, onChange }) {
  const [dataError, setDataError] = useState(null);

  const handleDataChange = (raw) => {
    onChange({ ...block, data: raw });
    try {
      JSON.parse(raw);
      setDataError(null);
    } catch (e) {
      setDataError(e.message);
    }
  };

  const handleSceneTypeChange = (newType) => {
    onChange({
      ...block,
      sceneType: newType,
      data: DEFAULT_THREE_DATA[newType] || '[]',
    });
    setDataError(null);
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
        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Invalid JSON: {dataError}</div>
      )}
    </div>
  );
}

/** Map of block type → editor component */
export const BLOCK_EDITORS = {
  'section':       SectionEditor,
  'paragraph':     ParagraphEditor,
  'callout':       CalloutEditor,
  'math-box':      MathBoxEditor,
  'code-block':    CodeBlockEditor,
  'three-scene':   ThreeSceneEditor,
  'prop-table':    PropTableEditor,
  'reference':     ReferenceEditor,
  'ai-disclosure': AIDisclosureEditor,
};
