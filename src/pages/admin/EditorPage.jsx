import { useState, useCallback, useRef, useEffect } from 'react';
import './editor.css';

// Extracted components
import BlockCard, { BLOCK_TYPES } from './BlockCard';
import LivePreview from './LivePreview';
import SiteStructureToC from './SiteStructureToC';
import VersionHistory from './VersionHistory';

// Supabase data layer
import * as pagesApi from '../../lib/pages';

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
    case 'video-embed':    return { ...base, url: '', aspectRatio: '16:9' };
    case 'divider':        return { ...base, style: 'solid' };
    case 'blockquote':     return { ...base, content: '', attribution: '' };
    case 'list':           return { ...base, listType: 'unordered', items: [''] };
    case 'heading':        return { ...base, level: 2, text: '' };
    case 'tabs':           return { ...base, tabs: [{ label: 'Tab 1', content: '' }] };
    case 'comp-table':     return { ...base, headers: ['Column 1', 'Column 2'], rows: [['', '']] };
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
  'draft':       { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  'published':   { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  'coming_soon': { bg: '#27272a', color: '#52525b' },
};

const STATUS_LABELS = {
  'draft': 'Draft',
  'published': 'Published',
  'coming_soon': 'Coming Soon',
};

/* ═══════════════════════════════════════════
 *  Sync Indicator
 * ═══════════════════════════════════════════ */
function SyncIndicator({ status }) {
  const styles = {
    idle:   { bg: 'transparent', color: '#52525b', text: '' },
    saving: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', text: 'Saving…' },
    saved:  { bg: 'rgba(16,185,129,0.15)', color: '#10b981', text: 'Saved ✓' },
    error:  { bg: 'rgba(239,68,68,0.15)', color: '#f87171', text: 'Save failed' },
  };
  const s = styles[status] || styles.idle;
  if (!s.text) return null;

  return (
    <span style={{
      fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '4px',
      background: s.bg, color: s.color, transition: 'all 0.2s ease',
      display: 'inline-flex', alignItems: 'center', gap: '4px',
    }}>
      {status === 'saving' && (
        <span style={{
          width: '8px', height: '8px', border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite', display: 'inline-block',
        }} />
      )}
      {s.text}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

/* ═══════════════════════════════════════════
 *  Breadcrumb Helper
 * ═══════════════════════════════════════════ */
function getBreadcrumb(pageData) {
  if (!pageData) return { crumbs: [], status: null };

  const meta = pageData.current_version?.meta || {};
  const status = pageData.status;
  const title = meta.title || 'Untitled';
  const cat = meta.category || 'concept';
  const sub = meta.subcategory || '';

  const crumbs = [cat === 'architecture' ? 'Architecture' : 'Concepts'];
  if (sub) crumbs.push(sub);
  crumbs.push(title);

  return { crumbs, status };
}

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

  // Supabase page tracking
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedPageData, setSelectedPageData] = useState(null);
  const [currentVersionId, setCurrentVersionId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sync state
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | saving | saved | error
  const syncTimer = useRef(null);

  // Right pane tab
  const [rightPaneTab, setRightPaneTab] = useState('preview'); // 'preview' | 'history'

  // Dirty tracking: snapshot of last-saved state
  const lastSavedRef = useRef(null);
  const [pendingNavAction, setPendingNavAction] = useState(null);

  // ToC refresh trigger
  const [tocRefreshKey, setTocRefreshKey] = useState(0);

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

  // ── Select Page (from ToC) ──
  const handleSelectPage = useCallback(async (pageId) => {
    if (!pageId) {
      setSelectedPageId(null);
      setSelectedPageData(null);
      setIsEditing(false);
      setMeta({ title: '', subtitle: '', category: 'concept', subcategory: '', route: '', ready: false });
      setBlocks([]);
      lastSavedRef.current = null;
      setCurrentVersionId(null);
      return;
    }

    try {
      const page = await pagesApi.fetchPageById(pageId);
      setSelectedPageId(pageId);
      setSelectedPageData(page);
      setCurrentVersionId(page.current_version_id);

      if (page.current_version) {
        const m = page.current_version.meta || {};
        const b = page.current_version.blocks || [];
        setMeta(m);
        setBlocks(b);
        lastSavedRef.current = JSON.stringify({ meta: m, blocks: b });
      } else {
        setMeta({ title: '', subtitle: '', category: 'concept', subcategory: '', route: '', ready: false });
        setBlocks([]);
        lastSavedRef.current = null;
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Failed to load page:', err);
      flash('Failed to load page');
    }
  }, [flash]);

  // ── Enter edit mode ──
  const enterEditMode = useCallback(() => {
    if (!selectedPageId) return;
    setIsEditing(true);
    setRightPaneTab('preview');
    // Snapshot current state for dirty tracking
    lastSavedRef.current = JSON.stringify({ meta, blocks });
  }, [selectedPageId, meta, blocks]);

  // ── Leave edit mode ──
  const leaveEditMode = useCallback(() => {
    setIsEditing(false);
    setRightPaneTab('preview');
    lastSavedRef.current = null;
    setSyncStatus('idle');
  }, []);

  const tryLeaveEdit = useCallback((action) => {
    if (!isEditing) { action(); return; }
    if (isDirty) {
      setPendingNavAction(() => action);
    } else {
      leaveEditMode();
      action();
    }
  }, [isEditing, isDirty, leaveEditMode]);

  const handleConfirmLeave = useCallback((shouldSave) => {
    if (shouldSave) {
      saveDraft();
    }
    const action = pendingNavAction;
    setPendingNavAction(null);
    leaveEditMode();
    if (action) action();
  }, [pendingNavAction, leaveEditMode]);

  // ── Breadcrumb click ──
  const handleBreadcrumbClick = useCallback((crumbIndex) => {
    const bc = getBreadcrumb(selectedPageData);
    if (crumbIndex >= bc.crumbs.length - 1) return;
    tryLeaveEdit(() => {
      setSelectedPageId(null);
      setSelectedPageData(null);
      setCurrentVersionId(null);
      setMeta({ title: '', subtitle: '', category: 'concept', subcategory: '', route: '', ready: false });
      setBlocks([]);
    });
  }, [selectedPageData, tryLeaveEdit]);

  // ── New Page ──
  const onCreateNewPage = useCallback(async (category, subcategory) => {
    const defaultMeta = {
      title: 'New Page',
      subtitle: 'Write your page subtitle here...',
      category,
      subcategory,
      route: '',
      ready: true,
    };
    const defaultBlocks = [
      { id: 'parsed-1-' + Date.now(), type: 'section', title: '1. Introduction' },
      { id: 'parsed-2-' + Date.now(), type: 'paragraph', content: 'Start writing your content here...' },
    ];

    // Generate a temporary route and url_path
    const tempSlug = `new-page-${Date.now()}`;
    const route = category === 'architecture'
      ? tempSlug
      : `concept:${subcategory ? subcategory.toLowerCase().replace(/\s+/g, '-') + '-' : ''}${tempSlug}`;
    const urlPath = routeKeyToPath(route);

    try {
      const { page } = await pagesApi.createPage({
        route,
        urlPath,
        status: 'draft',
        meta: defaultMeta,
        blocks: defaultBlocks,
      });
      setTocRefreshKey(k => k + 1);
      await handleSelectPage(page.id);
      setIsEditing(true);
      flash('Created new page');
    } catch (err) {
      console.error('Failed to create page:', err);
      flash('Failed to create page');
    }
  }, [flash, handleSelectPage]);

  // ── Auto-generate route slug ──
  useEffect(() => {
    if (isEditing && meta.title) {
      const slug = meta.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
      const prefix = meta.category === 'architecture' ? '' : 'concept:';
      const sub = meta.subcategory ? meta.subcategory.toLowerCase().replace(/\s+/g, '-') + '-' : '';
      const catPart = meta.category === 'concept' ? '' : meta.category + '-';
      setMeta(prev => ({ ...prev, route: `${prefix}${catPart}${sub}${slug}` }));
    }
  }, [meta.title, meta.category, meta.subcategory, isEditing]);

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

  // ── Save Draft (Supabase) ──
  const saveDraft = useCallback(async () => {
    if (!selectedPageId) return;
    setSyncStatus('saving');
    try {
      const version = await pagesApi.saveDraft(selectedPageId, meta, blocks);
      setCurrentVersionId(version.id);
      lastSavedRef.current = JSON.stringify({ meta, blocks });
      setSyncStatus('saved');
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => setSyncStatus('idle'), 2500);
      flash('Draft saved');

      // Refresh page data for breadcrumb
      const updatedPage = await pagesApi.fetchPageById(selectedPageId);
      setSelectedPageData(updatedPage);
      setTocRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to save draft:', err);
      setSyncStatus('error');
      flash('Failed to save draft');
    }
  }, [selectedPageId, meta, blocks, flash]);

  // ── Publish (Supabase) ──
  const handlePublish = useCallback(async () => {
    if (!selectedPageId) return;
    if (!meta.title) { flash('Add a title before publishing'); return; }
    if (blocks.length === 0) { flash('Add some content before publishing'); return; }

    setSyncStatus('saving');
    try {
      // Update the page's route and url_path if they changed
      const urlPath = routeKeyToPath(meta.route);
      if (!urlPath) { flash('Cannot determine URL path'); setSyncStatus('idle'); return; }

      const version = await pagesApi.publishPage(selectedPageId, meta, blocks);
      setCurrentVersionId(version.id);
      lastSavedRef.current = JSON.stringify({ meta, blocks });
      setSyncStatus('saved');
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => setSyncStatus('idle'), 2500);
      flash(`Published at ${urlPath}`);

      // Refresh page data
      const updatedPage = await pagesApi.fetchPageById(selectedPageId);
      setSelectedPageData(updatedPage);
      setTocRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to publish:', err);
      setSyncStatus('error');
      flash('Failed to publish');
    }
  }, [selectedPageId, meta, blocks, flash]);

  // ── Version restore handler ──
  const handleVersionRestore = useCallback(async (restoredVersion) => {
    if (restoredVersion) {
      setMeta(restoredVersion.meta || {});
      setBlocks(restoredVersion.blocks || []);
      setCurrentVersionId(restoredVersion.id);
      lastSavedRef.current = JSON.stringify({
        meta: restoredVersion.meta || {},
        blocks: restoredVersion.blocks || [],
      });
      // Refresh page data
      const updatedPage = await pagesApi.fetchPageById(selectedPageId);
      setSelectedPageData(updatedPage);
      setTocRefreshKey(k => k + 1);
      flash('Version restored');
    }
  }, [selectedPageId, flash]);

  // ── Breadcrumb data ──
  const breadcrumb = getBreadcrumb(selectedPageData);

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

        <SyncIndicator status={syncStatus} />

        <button className="toolbar-btn" onClick={saveDraft} disabled={!isEditing} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>
          Save Draft
        </button>
        <button className="toolbar-btn primary" onClick={handlePublish} disabled={!isEditing} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          Publish
        </button>
      </div>

      {/* ── Main Body ── */}
      <div className="editor-body" ref={mainBodyRef} style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
        {/* ── Left Edit Pane ── */}
        <div className="editor-left-pane" style={{ width: `${canvasWidth}%`, minWidth: '300px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* ── Breadcrumb Bar ── */}
          {selectedPageId && breadcrumb.crumbs.length > 0 && (
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
                    background: (STATUS_CHIP_COLORS[breadcrumb.status] || STATUS_CHIP_COLORS['draft']).bg,
                    color: (STATUS_CHIP_COLORS[breadcrumb.status] || STATUS_CHIP_COLORS['draft']).color,
                  }}>{STATUS_LABELS[breadcrumb.status] || breadcrumb.status}</span>
                )}
              </div>
              {!isEditing && breadcrumb.status !== 'coming_soon' && (
                <button
                  onClick={enterEditMode}
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
                Select a page from the site structure on the right to view it, or click
                <strong style={{ color: '#a1a1aa' }}> "Edit Page" </strong>
                to start editing. Use the <strong style={{ color: '#a1a1aa' }}> + </strong> buttons to create new pages.
              </p>
            </div>
          )}
        </div>

        {/* ── Splitter ── */}
        <div className="main-editor-splitter" onMouseDown={handleCanvasResize} style={{ width: '6px', cursor: 'col-resize', background: '#27272a', flexShrink: 0 }} />

        {/* ── Right Pane ── */}
        <div className="editor-right-pane" style={{ width: `${100 - canvasWidth}%`, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {isEditing ? (
            <>
              {/* Tab switcher */}
              <div style={{
                display: 'flex', borderBottom: '1px solid #27272a', background: '#1c1c20', flexShrink: 0,
              }}>
                <button
                  onClick={() => setRightPaneTab('preview')}
                  style={{
                    flex: 1, padding: '10px 16px', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: rightPaneTab === 'preview' ? '#0891B2' : '#71717a',
                    borderBottom: rightPaneTab === 'preview' ? '2px solid #0891B2' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Preview
                </button>
                <button
                  onClick={() => setRightPaneTab('history')}
                  style={{
                    flex: 1, padding: '10px 16px', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: rightPaneTab === 'history' ? '#0891B2' : '#71717a',
                    borderBottom: rightPaneTab === 'history' ? '2px solid #0891B2' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  History
                </button>
              </div>

              {/* Tab content */}
              {rightPaneTab === 'preview' ? (
                <div style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: '32px 0' }}>
                  <LivePreview meta={meta} blocks={blocks} />
                </div>
              ) : (
                <VersionHistory
                  pageId={selectedPageId}
                  currentVersionId={currentVersionId}
                  onRestore={handleVersionRestore}
                  onClose={() => setRightPaneTab('preview')}
                />
              )}
            </>
          ) : (
            <SiteStructureToC
              key={tocRefreshKey}
              selectedPageId={selectedPageId}
              onSelectPage={handleSelectPage}
              onCreateNewPage={onCreateNewPage}
            />
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e4e4e7', marginBottom: '8px' }}>Unsaved Changes</h3>
            <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.6, marginBottom: '24px' }}>
              You have unsaved changes to <strong style={{ color: '#e4e4e7' }}>{meta.title || 'this page'}</strong>. Save before leaving?
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
              <button
                onClick={() => handleConfirmLeave(true)}
                style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 600, border: '1px solid #10b981', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; }}
              >Save & Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="editor-toast">{toast}</div>}
    </div>
  );
}
