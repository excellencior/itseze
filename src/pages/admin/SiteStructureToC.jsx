import { useState } from 'react';
import { ARCHITECTURES, CONCEPTS, getPublishedNavItems, getDraftNavItems } from '../../navigation';

/* ═══════════════════════════════════════════
 *  Breadcrumb Helper — compute path from route
 * ═══════════════════════════════════════════ */
export function getBreadcrumb(route) {
  if (!route || typeof route !== 'string') return { crumbs: [], status: null };

  if (route.startsWith('__draft__')) {
    const key = route.replace('__draft__', '');
    let name = key.replace('itseze-draft-', '').replace(/-/g, ' ');
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data?.meta?.title) name = data.meta.title;
      const cat = data?.meta?.category || 'concept';
      const sub = data?.meta?.subcategory || '';
      const crumbs = [cat === 'architecture' ? 'Architecture' : 'Concepts'];
      if (sub) crumbs.push(sub);
      crumbs.push(name);
      return { crumbs, status: 'Draft' };
    } catch { /* */ }
    return { crumbs: ['Draft', name], status: 'Draft' };
  }

  if (route.startsWith('__pub__')) {
    const urlPath = route.replace('__pub__', '');
    try {
      const published = JSON.parse(localStorage.getItem('itseze-published') || '{}');
      const data = published[urlPath];
      if (data) {
        const name = data.meta?.title || 'Untitled';
        const cat = data.meta?.category || 'concept';
        const sub = data.meta?.subcategory || '';
        const crumbs = [cat === 'architecture' ? 'Architecture' : 'Concepts'];
        if (sub) crumbs.push(sub);
        crumbs.push(name);
        return { crumbs, status: 'Published' };
      }
    } catch { /* */ }
    return { crumbs: ['Published', urlPath], status: 'Published' };
  }

  const arch = ARCHITECTURES.find(a => a.route === route);
  if (arch) return { crumbs: ['Architecture', arch.name], status: arch.ready ? 'Static' : 'Coming Soon' };

  for (const c of CONCEPTS) {
    if (c.children) {
      const child = c.children.find(ch => ch.route === route);
      if (child) return { crumbs: ['Concepts', c.name, child.name], status: child.ready ? 'Static' : 'Coming Soon' };
    } else if (c.route === route) {
      return { crumbs: ['Concepts', c.name], status: c.ready ? 'Static' : 'Coming Soon' };
    }
  }

  return { crumbs: [route], status: 'Static' };
}

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

function isNew(dateStr) {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 14 * 24 * 60 * 60 * 1000;
}

/* ═══════════════════════════════════════════
 *  SiteStructureToC Component
 * ═══════════════════════════════════════════ */
export default function SiteStructureToC({ selectedRoute, onSelectRoute, onCreateNewPage }) {
  const [archOpen, setArchOpen] = useState(true);
  const [conceptsOpen, setConceptsOpen] = useState(true);
  const [subcatOpen, setSubcatOpen] = useState({});

  const publishedItems = getPublishedNavItems();
  const draftItems = getDraftNavItems();

  const toggleSubcat = (name) => setSubcatOpen(prev => ({ ...prev, [name]: !prev[name] }));

  const renderConceptsList = () => {
    const items = [];

    CONCEPTS.forEach(c => {
      if (c.children) {
        const subcatName = c.name;
        const isOpen = subcatOpen[subcatName] !== false;
        const pubChildren = publishedItems.filter(p => p.parentCategory === subcatName);
        const draftChildren = draftItems.filter(d => d.parentCategory === subcatName);

        items.push(
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
                {c.children.map(child => (
                  <TocItem key={child.route} isActive={selectedRoute === child.route} onClick={() => child.ready && onSelectRoute(child.route)} style={tocSubItemStyle(selectedRoute === child.route)}>
                    <span style={{ opacity: child.ready ? 1 : 0.4 }}>{child.name}</span>
                    {!child.ready && <span style={soonStyle}>Soon</span>}
                  </TocItem>
                ))}
                {pubChildren.map(pub => (
                  <TocItem key={pub.route} isActive={selectedRoute === pub.route} onClick={() => onSelectRoute(pub.route)} style={tocSubItemStyle(selectedRoute === pub.route)}>
                    <span>{pub.name}</span>
                    {isNew(pub.firstPublishedAt) && <span style={chipStyle('New')}>New</span>}
                  </TocItem>
                ))}
                {draftChildren.map(draft => (
                  <TocItem key={draft.route} isActive={selectedRoute === draft.route} onClick={() => onSelectRoute(draft.route)} style={tocSubItemStyle(selectedRoute === draft.route)}>
                    <span>{draft.name}</span>
                    <span style={chipStyle('Draft')}>Draft</span>
                  </TocItem>
                ))}
              </div>
            )}
          </div>
        );
      } else {
        items.push(
          <TocItem key={c.route} isActive={selectedRoute === c.route} onClick={() => c.ready && onSelectRoute(c.route)} style={tocItemStyle(selectedRoute === c.route)}>
            <span style={{ opacity: c.ready ? 1 : 0.4 }}>{c.name}</span>
            {!c.ready && <span style={soonStyle}>Soon</span>}
          </TocItem>
        );
      }
    });

    publishedItems.filter(p => !p.parentCategory && p.category !== 'architecture').forEach(pub => {
      if (!CONCEPTS.some(c => c.route === pub.route)) {
        items.push(
          <TocItem key={pub.route} isActive={selectedRoute === pub.route} onClick={() => onSelectRoute(pub.route)} style={tocItemStyle(selectedRoute === pub.route)}>
            <span>{pub.name}</span>
            {isNew(pub.firstPublishedAt) && <span style={chipStyle('New')}>New</span>}
          </TocItem>
        );
      }
    });

    draftItems.filter(d => !d.parentCategory && d.category !== 'architecture').forEach(draft => {
      items.push(
        <TocItem key={draft.route} isActive={selectedRoute === draft.route} onClick={() => onSelectRoute(draft.route)} style={tocItemStyle(selectedRoute === draft.route)}>
          <span>{draft.name}</span>
          <span style={chipStyle('Draft')}>Draft</span>
        </TocItem>
      );
    });

    return items;
  };

  const draftArchitectures = draftItems.filter(d => d.category === 'architecture');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#18181b', color: '#d4d4d8' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #27272a' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#e4e4e7', letterSpacing: '-0.3px' }}>Site Structure</div>
        <div style={{ fontSize: '11px', color: '#71717a', marginTop: '4px' }}>Click a page to select it for editing</div>
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
            {ARCHITECTURES.map(a => (
              <TocItem key={a.route} isActive={selectedRoute === a.route} onClick={() => a.ready && onSelectRoute(a.route)} style={tocItemStyle(selectedRoute === a.route)}>
                <span style={{ opacity: a.ready ? 1 : 0.4 }}>{a.name}</span>
                {!a.ready && <span style={soonStyle}>Soon</span>}
              </TocItem>
            ))}
            {draftArchitectures.map(draft => (
              <TocItem key={draft.route} isActive={selectedRoute === draft.route} onClick={() => onSelectRoute(draft.route)} style={tocItemStyle(selectedRoute === draft.route)}>
                <span>{draft.name}</span>
                <span style={chipStyle('Draft')}>Draft</span>
              </TocItem>
            ))}
          </div>
        )}

        {/* Concepts */}
        <div style={{ ...tocHeaderStyle, marginTop: '4px' }} onClick={() => setConceptsOpen(!conceptsOpen)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Chevron open={conceptsOpen} /> Concepts
          </span>
          <PlusButton onClick={(e) => { e.stopPropagation(); onCreateNewPage?.('concept', ''); }} title="Add new concept page" />
        </div>
        {conceptsOpen && <div>{renderConceptsList()}</div>}
      </div>
    </div>
  );
}
