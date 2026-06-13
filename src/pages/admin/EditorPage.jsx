import { useState, useCallback, useRef, useEffect } from 'react';
import './editor.css';

// Admin modules
import { parseJSX } from './parseJSX';
import { RAW_PAGES } from './rawPages';

// Extracted components
import BlockCard, { BLOCK_TYPES } from './BlockCard';
import LivePreview from './LivePreview';
import SiteStructureToC, { getBreadcrumb } from './SiteStructureToC';

/* ═══════════════════════════════════════════
 *  Block Factory
 * ═══════════════════════════════════════════ */
let _idCounter = 0;
function uid() { return `b-${++_idCounter}-${Date.now()}`; }

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

/** Convert a route key like 'concept:reasoning-symbolic' → '/concepts/reasoning/symbolic' */
function routeKeyToPath(routeKey) {
  if (!routeKey) return null;
  if (!routeKey.startsWith('concept:')) return `/${routeKey}`;
  const rest = routeKey.replace('concept:', '');
  const subMatch = rest.match(/^(reasoning|prompting)-(.+)$/);
  if (subMatch) return `/concepts/${subMatch[1]}/${subMatch[2]}`;
  return `/concepts/${rest}`;
}

/* ═══════════════════════════════════════════
 *  Status Chip Colors
 * ═══════════════════════════════════════════ */
const STATUS_CHIP_COLORS = {
  'Draft':       { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  'Published':   { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  'Static':      { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  'Coming Soon': { bg: '#27272a', color: '#52525b' },
};

/* ═══════════════════════════════════════════
 *  Main Editor Page Component
 * ═══════════════════════════════════════════ */
export default function EditorPage() {
  const [meta, setMeta] = useState({
    title: '', subtitle: '', category: 'concept', subcategory: '', route: '', ready: false,
  });
  const [blocks, setBlocks] = useState([]);
  const [toast, setToast] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const toastTimer = useRef(null);

  const [canvasWidth, setCanvasWidth] = useState(55);
  const mainBodyRef = useRef(null);

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [draftKey, setDraftKey] = useState(null);

  // Dirty tracking: snapshot of last-saved state
  const lastSavedRef = useRef(null);
  const [pendingNavAction, setPendingNavAction] = useState(null); // modal state

  const isEditing = !!draftKey;

  const isDirty = (() => {
    if (!isEditing || !lastSavedRef.current) return false;
    return JSON.stringify({ meta, blocks }) !== lastSavedRef.current;
  })();

  // ── Toast ──
  const flash = useCallback((msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Resizer ──
  const handleCanvasResize = (e) => {
    e.preventDefault();
    const handleMouseMove = (moveEvent) => {
      if (!mainBodyRef.current) return;
      const rect = mainBodyRef.current.getBoundingClientRect();
      const totalWidth = rect.width;
      if (totalWidth <= 0) return;
      setCanvasWidth(Math.min(80, Math.max(20, (moveEvent.clientX - rect.left) / totalWidth * 100)));
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

  // ── Route Selection ──
  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    if (route && route.startsWith('__draft__')) {
      const key = route.replace('__draft__', '');
      setDraftKey(key);
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setMeta(parsed.meta || {});
          setBlocks(parsed.blocks || []);
          // Snapshot for dirty tracking
          lastSavedRef.current = JSON.stringify({ meta: parsed.meta || {}, blocks: parsed.blocks || [] });
        } catch {
          flash('Failed to parse draft data');
        }
      }
    } else {
      setDraftKey(null);
      setMeta({ title: '', subtitle: '', category: 'concept', subcategory: '', route: '', ready: false });
      setBlocks([]);
      lastSavedRef.current = null;
    }
  };

  // ── Leave edit mode (with save guard) ──
  const leaveEditMode = () => {
    setDraftKey(null);
    setSelectedRoute(null);
    setMeta({ title: '', subtitle: '', category: 'concept', subcategory: '', route: '', ready: false });
    setBlocks([]);
    lastSavedRef.current = null;
  };

  const tryLeaveEdit = (action) => {
    if (!isEditing) { action(); return; }
    if (isDirty) {
      setPendingNavAction(() => action);
    } else {
      leaveEditMode();
      action();
    }
  };

  const handleConfirmLeave = (shouldSave) => {
    if (shouldSave) {
      saveDraft();
    } else if (draftKey) {
      // Discard: delete the draft from localStorage entirely
      localStorage.removeItem(draftKey);
    }
    const action = pendingNavAction;
    setPendingNavAction(null);
    leaveEditMode();
    if (action) action();
  };

  // ── Breadcrumb click (parent crumb navigates back) ──
  const handleBreadcrumbClick = (crumbIndex) => {
    // Only parent crumbs are clickable (not the last one)
    if (crumbIndex >= breadcrumb.crumbs.length - 1) return;
    tryLeaveEdit(() => { /* back to ToC home */ });
  };

  // ── Clone page into draft ──
  const handleEditActivePage = () => {
    if (!selectedRoute) return;

    if (selectedRoute.startsWith('__pub__')) {
      const urlPath = selectedRoute.replace('__pub__', '');
      let published = {};
      try { published = JSON.parse(localStorage.getItem('itseze-published') || '{}'); } catch { /* */ }
      const pageData = published[urlPath];
      if (pageData) {
        const slug = pageData.meta.title
          ? pageData.meta.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')
          : 'untitled';
        const key = `itseze-draft-${slug}`;
        localStorage.setItem(key, JSON.stringify({ meta: pageData.meta, blocks: pageData.blocks, savedAt: new Date().toISOString() }));
        handleSelectRoute(`__draft__${key}`);
        flash('Loaded published page into draft editor');
      }
    } else {
      const rawText = RAW_PAGES[selectedRoute];
      if (rawText) {
        const { meta: parsedMeta, blocks: parsedBlocks } = parseJSX(rawText, selectedRoute);
        const slug = parsedMeta.title
          ? parsedMeta.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')
          : selectedRoute.replace(/:/g, '-');
        const key = `itseze-draft-${slug}`;
        localStorage.setItem(key, JSON.stringify({ meta: parsedMeta, blocks: parsedBlocks, savedAt: new Date().toISOString() }));
        handleSelectRoute(`__draft__${key}`);
        flash('Parsed static page content into draft editor');
      } else {
        flash('Source code not found for this page');
      }
    }
  };

  // ── New Page ──
  const onCreateNewPage = (category, subcategory) => {
    const defaultMeta = { title: 'New Page', subtitle: 'Write your page subtitle here...', category, subcategory, route: '', ready: true };
    const defaultBlocks = [
      { id: 'parsed-1-' + Date.now(), type: 'section', title: '1. Introduction' },
      { id: 'parsed-2-' + Date.now(), type: 'paragraph', content: 'Start writing your content here...' },
    ];
    const newKey = `itseze-draft-new-page-${Date.now()}`;
    localStorage.setItem(newKey, JSON.stringify({ meta: defaultMeta, blocks: defaultBlocks, savedAt: new Date().toISOString() }));
    handleSelectRoute(`__draft__${newKey}`);
    flash('Created new blank page draft');
  };

  // ── Auto-generate route slug ──
  useEffect(() => {
    if (draftKey && meta.title) {
      const slug = meta.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
      const prefix = meta.category === 'architecture' ? '' : 'concept:';
      const sub = meta.subcategory ? meta.subcategory.toLowerCase().replace(/\s+/g, '-') + '-' : '';
      setMeta(prev => ({ ...prev, route: `${prefix}${meta.category === 'concept' ? '' : meta.category + '-'}${sub}${slug}` }));
    }
  }, [meta.title, meta.category, meta.subcategory, draftKey]);

  // ── Block CRUD ──
  const addBlock = (type) => setBlocks(prev => [...prev, createBlock(type)]);
  const updateBlock = useCallback((id, updated) => setBlocks(prev => prev.map(b => b.id === id ? updated : b)), []);
  const deleteBlock = useCallback((id) => setBlocks(prev => prev.filter(b => b.id !== id)), []);
  const moveBlock = useCallback((from, to) => {
    setBlocks(prev => { const next = [...prev]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
  }, []);

  // ── Drag & Drop ──
  const handleDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, idx) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIdx(idx); };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) moveBlock(dragIdx, idx);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  // ── Persistence ──
  const saveDraft = () => {
    if (!draftKey) return;
    const payload = { meta, blocks, savedAt: new Date().toISOString() };
    localStorage.setItem(draftKey, JSON.stringify(payload));
    lastSavedRef.current = JSON.stringify({ meta, blocks });
    flash('Draft saved');
  };

  // ── Publish ──
  const publishPage = () => {
    if (!meta.title) { flash('Add a title before publishing'); return; }
    if (blocks.length === 0) { flash('Add some content before publishing'); return; }
    const urlPath = routeKeyToPath(meta.route);
    if (!urlPath) { flash('Cannot determine URL path'); return; }

    let published = {};
    try { published = JSON.parse(localStorage.getItem('itseze-published') || '{}'); } catch { /* */ }
    const existing = published[urlPath];
    const now = new Date().toISOString();
    published[urlPath] = { meta: { ...meta, ready: true }, blocks, firstPublishedAt: existing?.firstPublishedAt || now, publishedAt: now };
    localStorage.setItem('itseze-published', JSON.stringify(published));
    saveDraft();
    flash(`Published at ${urlPath}`);
  };

  // ── Breadcrumb ──
  const breadcrumb = getBreadcrumb(selectedRoute);

  /* ═══════════════════════════════════════════
   *  Render
   * ═══════════════════════════════════════════ */
  return (
    <div className="editor-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* ── Toolbar (always visible, disabled when not editing) ── */}
      <div className="editor-toolbar" style={{ opacity: isEditing ? 1 : 0.5 }}>
        <span className="logo">itseze editor</span>
        <div className="toolbar-separator" />

        <input className="title-input" type="text" value={meta.title} onChange={e => setMeta(prev => ({ ...prev, title: e.target.value }))} placeholder="Page title" disabled={!isEditing} />
        <input className="subtitle-input" type="text" value={meta.subtitle} onChange={e => setMeta(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Subtitle" disabled={!isEditing} />

        <div className="toolbar-separator" />

        <button className="toolbar-btn" onClick={saveDraft} disabled={!isEditing} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
          Save Draft
        </button>
        <button className="toolbar-btn primary" onClick={publishPage} disabled={!isEditing} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          Publish
        </button>
      </div>

      {/* ── Main Body ── */}
      <div className="editor-body" ref={mainBodyRef} style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
        {/* ── Left Edit Pane ── */}
        <div className="editor-left-pane" style={{ width: `${canvasWidth}%`, minWidth: '300px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* ── Breadcrumb Bar ── */}
          {selectedRoute && breadcrumb.crumbs.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #27272a', background: '#1c1c20', flexShrink: 0, gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', minWidth: 0 }}>
                {breadcrumb.crumbs.map((crumb, i) => {
                  const isLast = i === breadcrumb.crumbs.length - 1;
                  const isClickable = !isLast;
                  return (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {i > 0 && <span style={{ color: '#3f3f46', fontSize: '11px' }}>›</span>}
                      <span
                        onClick={isClickable ? () => handleBreadcrumbClick(i) : undefined}
                        style={{
                          fontSize: '12px', fontWeight: isLast ? 700 : 500,
                          color: isLast ? '#e4e4e7' : '#71717a',
                          cursor: isClickable ? 'pointer' : 'default',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={isClickable ? (e) => { e.currentTarget.style.color = '#0891B2'; } : undefined}
                        onMouseLeave={isClickable ? (e) => { e.currentTarget.style.color = '#71717a'; } : undefined}
                      >{crumb}</span>
                    </span>
                  );
                })}
                {breadcrumb.status && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    padding: '2px 8px', borderRadius: '3px', marginLeft: '8px',
                    background: (STATUS_CHIP_COLORS[breadcrumb.status] || STATUS_CHIP_COLORS['Static']).bg,
                    color: (STATUS_CHIP_COLORS[breadcrumb.status] || STATUS_CHIP_COLORS['Static']).color,
                  }}>{breadcrumb.status}</span>
                )}
              </div>
              {!isEditing && breadcrumb.status !== 'Coming Soon' && (
                <button
                  onClick={handleEditActivePage}
                  style={{ background: '#0891B2', color: '#fff', border: 'none', padding: '5px 14px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'filter 0.15s ease', flexShrink: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                >
                  Edit Page
                </button>
              )}
            </div>
          )}

          {/* ── Editor content ── */}
          {isEditing ? (
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Block Palette */}
              <div className="editor-palette">
                <div className="palette-label">Add Block</div>
                {BLOCK_TYPES.map(bt => (
                  <button key={bt.type} className="palette-item" onClick={() => addBlock(bt.type)}>
                    <span className="palette-icon">{bt.icon}</span>
                    {bt.label}
                  </button>
                ))}
              </div>

              {/* Editor Canvas */}
              <div className="editor-canvas" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {blocks.length === 0 ? (
                  <div className="canvas-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: '8px' }}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
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
            </div>
          ) : (
            /* Welcome note when not editing */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 32px', color: '#71717a' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25, marginBottom: '20px' }}>
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <path d="M12 18v-6M9 15l3 3 3-3"/>
              </svg>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#a1a1aa', marginBottom: '10px', letterSpacing: '-0.3px' }}>
                itseze admin panel
              </h3>
              <p style={{ fontSize: '13px', color: '#71717a', maxWidth: '400px', lineHeight: 1.6 }}>
                Select a page from the site structure on the right to view its path, or click
                <strong style={{ color: '#a1a1aa' }}> "Edit Page" </strong>
                to clone it into a draft. Use the <strong style={{ color: '#a1a1aa' }}> + </strong> buttons to create new pages.
              </p>
            </div>
          )}
        </div>

        {/* ── Splitter ── */}
        <div className="main-editor-splitter" onMouseDown={handleCanvasResize} style={{ width: '6px', cursor: 'col-resize', background: '#27272a', flexShrink: 0 }} />

        {/* ── Right Pane: LivePreview when editing, ToC when browsing ── */}
        <div className="editor-right-pane" style={{ width: `${100 - canvasWidth}%`, height: '100%', overflow: 'hidden' }}>
          {isEditing ? (
            <div style={{ height: '100%', overflowY: 'auto', background: '#fff', padding: '32px 0' }}>
              <LivePreview meta={meta} blocks={blocks} />
            </div>
          ) : (
            <SiteStructureToC selectedRoute={selectedRoute} onSelectRoute={handleSelectRoute} onCreateNewPage={onCreateNewPage} />
          )}
        </div>
      </div>

      {/* ── Unsaved Changes Modal ── */}
      {pendingNavAction && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#1c1c20', border: '1px solid #27272a', borderRadius: '12px',
            padding: '28px 32px', maxWidth: '400px', width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e4e4e7', marginBottom: '8px' }}>Discard Changes?</h3>
            <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '24px' }}>
              This will revert <strong style={{ color: '#e4e4e7' }}>{meta.title || 'this page'}</strong> to the latest published version and discard all your drafted edits.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setPendingNavAction(null); }}
                style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, border: '1px solid #3f3f46', background: '#27272a', color: '#a1a1aa', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#52525b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; }}
              >Cancel</button>
              <button
                onClick={() => handleConfirmLeave(false)}
                style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
              >Discard</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="editor-toast">{toast}</div>}
    </div>
  );
}
