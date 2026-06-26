import { useState, useEffect, useCallback } from 'react';
import { fetchAllPages } from '../../lib/pages';

/* ═══════════════════════════════════════════
 *  Shared Styles
 * ═══════════════════════════════════════════ */
const tocHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '8px 12px', cursor: 'pointer', userSelect: 'none',
  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: '#71717a',
  borderBottom: '1px solid #27272a',
};

const tocItemStyle = (isActive) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '6px 12px 6px 24px', cursor: 'pointer', fontSize: '13px',
  fontWeight: isActive ? 700 : 500, color: isActive ? '#0891B2' : '#d4d4d8',
  background: isActive ? 'rgba(8,145,178,0.08)' : 'transparent',
  borderLeft: isActive ? '3px solid #0891B2' : '3px solid transparent',
  transition: 'all 0.12s ease',
});

const tocSubItemStyle = (isActive) => ({
  ...tocItemStyle(isActive),
  paddingLeft: '36px', fontSize: '12.5px',
});

const chipStyle = (type) => ({
  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
  padding: '2px 6px', borderRadius: '3px', flexShrink: 0,
  background: type === 'Draft' ? 'rgba(245,158,11,0.15)' : type === 'New' ? 'rgba(8,145,178,0.15)' : '#27272a',
  color: type === 'Draft' ? '#f59e0b' : type === 'New' ? '#0891B2' : '#71717a',
});

const addBtnStyle = {
  padding: '3px 8px', border: '1px solid #3f3f46', background: '#27272a',
  color: '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center',
  gap: '4px', transition: 'all 0.15s ease', fontSize: '11px', fontWeight: 600,
  borderRadius: '4px', letterSpacing: '0.02em',
};

const soonStyle = {
  fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', padding: '2px 6px', borderRadius: '3px',
  background: '#27272a', color: '#52525b',
};

const hoverBg = 'rgba(255,255,255,0.03)';

/* ═══════════════════════════════════════════
 *  Small UI Helpers
 * ═══════════════════════════════════════════ */
function Chevron({ open }) {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
      <path d="M6 4L10 8L6 12" />
    </svg>
  );
}

function PlusButton({ onClick, title }) {
  return (
    <button
      style={addBtnStyle}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0891B2'; e.currentTarget.style.color = '#0891B2'; e.currentTarget.style.background = 'rgba(8,145,178,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#3f3f46'; e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = '#27272a'; }}
      title={title}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      New
    </button>
  );
}

function TocItem({ isActive, onClick, style, children }) {
  return (
    <div
      style={style}
      onClick={onClick}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  SiteStructureToC Component (Supabase-driven)
 * ═══════════════════════════════════════════ */
export default function SiteStructureToC({ selectedPageId, onSelectPage, onCreateNewPage }) {
  const [archOpen, setArchOpen] = useState(true);
  const [conceptsOpen, setConceptsOpen] = useState(true);
  const [subcatOpen, setSubcatOpen] = useState({});

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPages();
      setPages(data);
    } catch (err) {
      console.error('Failed to load pages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const toggleSubcat = (name) => setSubcatOpen(prev => ({ ...prev, [name]: !prev[name] }));

  // ── Organize pages by category/subcategory ──
  const architecturePages = pages
    .filter(p => (p.current_version?.meta?.category || '') === 'architecture')
    .sort((a, b) => (a.current_version?.meta?.title || '').localeCompare(b.current_version?.meta?.title || ''));

  const conceptPages = pages
    .filter(p => {
      const cat = p.current_version?.meta?.category || 'concept';
      return cat === 'concept' || cat === 'concepts';
    })
    .sort((a, b) => (a.current_version?.meta?.title || '').localeCompare(b.current_version?.meta?.title || ''));

  // Group concept pages by subcategory
  const subcategories = {};
  const flatConcepts = [];

  conceptPages.forEach(page => {
    const sub = page.current_version?.meta?.subcategory || '';
    if (sub) {
      if (!subcategories[sub]) subcategories[sub] = [];
      subcategories[sub].push(page);
    } else {
      flatConcepts.push(page);
    }
  });

  // Sort subcategory names alphabetically
  const subcatNames = Object.keys(subcategories).sort();

  const renderStatusChip = (status) => {
    if (status === 'draft') return <span style={chipStyle('Draft')}>Draft</span>;
    if (status === 'coming_soon') return <span style={soonStyle}>Soon</span>;
    return null;
  };

  const renderPageItem = (page, useSubStyle = false) => {
    const isActive = selectedPageId === page.id;
    const isSoon = page.status === 'coming_soon';
    const title = page.current_version?.meta?.title || page.route || 'Untitled';
    const style = useSubStyle ? tocSubItemStyle(isActive) : tocItemStyle(isActive);

    return (
      <TocItem
        key={page.id}
        isActive={isActive}
        onClick={() => !isSoon && onSelectPage(page.id)}
        style={{ ...style, cursor: isSoon ? 'default' : 'pointer' }}
      >
        <span style={{ opacity: isSoon ? 0.4 : 1 }}>{title}</span>
        {renderStatusChip(page.status)}
      </TocItem>
    );
  };

  // ── Loading / Error states ──
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#18181b', color: '#71717a', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '24px', height: '24px', border: '3px solid #27272a',
          borderTopColor: '#0891B2', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', marginBottom: '12px',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '12px' }}>Loading pages…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#18181b', color: '#71717a', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <p style={{ fontSize: '13px', color: '#f87171', marginBottom: '12px' }}>Failed to load pages</p>
        <button
          onClick={loadPages}
          style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 600, background: '#27272a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: '6px', cursor: 'pointer' }}
        >Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#18181b', color: '#d4d4d8' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #27272a' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#e4e4e7', letterSpacing: '-0.3px' }}>Site Structure</div>
        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '4px' }}>
          {pages.length} page{pages.length !== 1 ? 's' : ''} · Click to select
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px' }}>
        {/* Architecture */}
        <div style={tocHeaderStyle} onClick={() => setArchOpen(!archOpen)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Chevron open={archOpen} /> Architecture
          </span>
          <PlusButton onClick={(e) => { e.stopPropagation(); onCreateNewPage?.('architecture', ''); }} title="Add new architecture page" />
        </div>
        {archOpen && (
          <div>
            {architecturePages.length === 0 && (
              <div style={{ padding: '12px 24px', fontSize: '12px', color: '#52525b', fontStyle: 'italic' }}>No architecture pages yet</div>
            )}
            {architecturePages.map(page => renderPageItem(page))}
          </div>
        )}

        {/* Concepts */}
        <div style={{ ...tocHeaderStyle, marginTop: '4px' }} onClick={() => setConceptsOpen(!conceptsOpen)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Chevron open={conceptsOpen} /> Concepts
          </span>
          <PlusButton onClick={(e) => { e.stopPropagation(); onCreateNewPage?.('concept', ''); }} title="Add new concept page" />
        </div>
        {conceptsOpen && (
          <div>
            {/* Subcategory groups */}
            {subcatNames.map(subcatName => {
              const isOpen = subcatOpen[subcatName] !== false;
              const subcatPages = subcategories[subcatName];

              return (
                <div key={`sub-${subcatName}`}>
                  <div
                    style={{ ...tocItemStyle(false), cursor: 'pointer', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#a1a1aa' }}
                    onClick={() => toggleSubcat(subcatName)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Chevron open={isOpen} /> {subcatName}
                    </span>
                    <PlusButton onClick={(e) => { e.stopPropagation(); onCreateNewPage?.('concept', subcatName); }} title={`Add new page under ${subcatName}`} />
                  </div>
                  {isOpen && (
                    <div>
                      {subcatPages.map(page => renderPageItem(page, true))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Flat concept pages (no subcategory) */}
            {flatConcepts.map(page => renderPageItem(page))}

            {flatConcepts.length === 0 && subcatNames.length === 0 && (
              <div style={{ padding: '12px 24px', fontSize: '12px', color: '#52525b', fontStyle: 'italic' }}>No concept pages yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
