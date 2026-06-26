import { useState, useCallback, useMemo } from 'react';
import { useSettings } from '../../SettingsContext';

/* ── "New" page detection (published within last 7 days) ── */
function isNew(createdAt) {
  if (!createdAt) return false;
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}

/* ═══════════════════════════════════════════
 *  Theme-aware color palette
 * ═══════════════════════════════════════════ */
const PALETTES = {
  dark: {
    text: '#E8E8E8', textMuted: '#B0B0B0', textDim: '#777', headerText: '#fff',
    activeBg: '#1f1f1f', hoverBg: '#1a1a1a', border: '#333', borderFocus: '#555',
    controlBg: '#333', controlText: '#fff', controlOff: '#777',
    separator: '#2a2a2a',
  },
  light: {
    text: '#1f2937', textMuted: '#6b7280', textDim: '#9ca3af', headerText: '#111827',
    activeBg: '#e5e7eb', hoverBg: '#f3f4f6', border: '#d1d5db', borderFocus: '#9ca3af',
    controlBg: '#e5e7eb', controlText: '#111827', controlOff: '#9ca3af',
    separator: '#e5e7eb',
  },
};

/* ─── Page Button ─── */
function PageButton({ item, isActive, accent, pal, fontSize = '13px', gap = '8px', dotSize = '5px', onClick }) {
  const [hovered, setHovered] = useState(false);
  const isReady = item.isReady;

  const style = {
    width: '100%',
    padding: '7px 12px',
    border: 'none',
    borderRadius: '6px',
    background: isActive ? pal.activeBg : (hovered && isReady ? pal.hoverBg : 'transparent'),
    color: isActive ? accent : (hovered && isReady ? pal.text : pal.textMuted),
    fontSize,
    fontWeight: isActive ? '650' : '500',
    cursor: isReady ? 'pointer' : 'default',
    textAlign: 'left',
    fontFamily: 'inherit',
    transition: 'background 0.15s ease, color 0.15s ease, opacity 0.15s ease',
    marginBottom: '1px',
    display: 'flex',
    alignItems: 'center',
    gap,
    opacity: isReady ? 1 : 0.45,
  };

  const dotStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: '50%',
    background: accent,
    flexShrink: 0,
  };

  const textStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  };

  return (
    <button
      style={style}
      onMouseEnter={() => isReady && !isActive && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isReady ? onClick : undefined}
      title={isReady ? item.title : 'Coming soon'}
    >
      {isActive && <span style={dotStyle} />}
      <span style={textStyle}>{item.title}</span>
      {!isReady && (
        <span style={{
          fontSize: '9px',
          fontWeight: '700',
          padding: '2px 6px',
          borderRadius: '3px',
          background: '#E59866',
          color: '#fff',
          flexShrink: 0,
          letterSpacing: '0.03em',
        }}>
          SOON
        </span>
      )}
      {isReady && item.isNewPage && (
        <span style={{
          fontSize: '9px',
          fontWeight: '700',
          padding: '2px 6px',
          borderRadius: '3px',
          background: accent,
          color: '#fff',
          flexShrink: 0,
          letterSpacing: '0.03em',
        }}>
          NEW
        </span>
      )}
    </button>
  );
}

/* ─── Collapsible Section Header ─── */
function SectionHeader({ label, count, isOpen, onToggle, pal, isSubcategory = false, isActive = false, accent }) {
  const [hovered, setHovered] = useState(false);

  const style = isSubcategory
    ? {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 10px',
        border: 'none',
        borderRadius: '6px',
        background: hovered ? pal.hoverBg : 'transparent',
        color: isActive ? (accent || pal.text) : (hovered ? pal.text : pal.textMuted),
        fontSize: '12.5px',
        fontWeight: '650',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s ease, color 0.15s ease',
      }
    : {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 10px',
        border: 'none',
        borderRadius: '6px',
        background: hovered ? pal.hoverBg : 'transparent',
        color: pal.headerText,
        fontSize: '10.5px',
        fontWeight: '700',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background 0.15s ease',
      };

  const chevronStyle = {
    fontSize: isSubcategory ? '11px' : '12px',
    transition: 'transform 0.2s ease',
    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
    marginLeft: 'auto',
  };

  const countStyle = {
    fontSize: '10px',
    fontWeight: '600',
    color: pal.textDim,
    background: pal.border,
    borderRadius: '8px',
    padding: '0 6px',
    lineHeight: '16px',
  };

  return (
    <button
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onToggle}
    >
      {label}
      {count !== undefined && <span style={countStyle}>{count}</span>}
      <span style={chevronStyle}>▾</span>
    </button>
  );
}

/* ─── Collapsible List Wrapper ─── */
function CollapsibleList({ isOpen, children }) {
  const wrapperStyle = {
    display: 'grid',
    gridTemplateRows: isOpen ? '1fr' : '0fr',
    opacity: isOpen ? 1 : 0,
    transition: 'grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
  };

  const innerStyle = {
    overflow: 'hidden',
    padding: isOpen ? '2px 0' : '0',
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
}

/* ─── Subcategory Group ─── */
function SubcategoryGroup({ label, items, selectedModel, accent, pal, onPageClick }) {
  const hasActive = items.some(i => selectedModel === i.urlPath);
  const [isOpen, setIsOpen] = useState(hasActive);

  return (
    <div style={{ marginLeft: '8px', marginBottom: '4px' }}>
      <SectionHeader
        label={label}
        count={items.length}
        isOpen={isOpen}
        onToggle={() => setIsOpen(o => !o)}
        pal={pal}
        isSubcategory
        isActive={hasActive}
        accent={accent}
      />
      <CollapsibleList isOpen={isOpen}>
        {items.map(item => (
          <PageButton
            key={item.id}
            item={item}
            isActive={selectedModel === item.urlPath}
            accent={accent}
            pal={pal}
            fontSize="12.5px"
            gap="7px"
            dotSize="4px"
            onClick={() => onPageClick(item)}
          />
        ))}
      </CollapsibleList>
    </div>
  );
}

/* ─── Section Separator ─── */
function Separator({ pal }) {
  return (
    <hr style={{
      border: 'none',
      borderTop: `1px solid ${pal.separator}`,
      margin: '8px 10px',
    }} />
  );
}

/* ═══════════════════════════════════════════
 *  PagesPanel
 * ═══════════════════════════════════════════ */
export default function PagesPanel({ pages, selectedModel, onSelectModel, onCollapse }) {
  const { settings, resolvedTheme } = useSettings();
  const pal = PALETTES[resolvedTheme] || PALETTES.dark;
  const accent = settings.accent;

  const [archOpen, setArchOpen] = useState(true);
  const [conceptsOpen, setConceptsOpen] = useState(true);

  // Organize pages into architecture + concepts (with subcategories)
  // Sort by meta.order (falling back to title) to match navigation order
  const { architecturePages, conceptGroups, flatConcepts, totalCount } = useMemo(() => {
    const arch = [];
    const groups = {};
    const flat = [];

    for (const page of pages) {
      const meta = page.current_version?.meta;
      if (!meta) continue;
      const category = (meta.category || '').toLowerCase();
      const item = {
        id: page.id,
        title: meta.title || 'Untitled',
        urlPath: page.url_path,
        isReady: page.status === 'published',
        subcategory: meta.subcategory || null,
        order: meta.order ?? 999,
        isNewPage: isNew(page.current_version?.created_at),
      };
      if (category === 'architecture') {
        arch.push(item);
      } else if (category === 'concept' || category === 'concepts') {
        if (item.subcategory) {
          if (!groups[item.subcategory]) groups[item.subcategory] = [];
          groups[item.subcategory].push(item);
        } else {
          flat.push(item);
        }
      }
    }

    const sortByOrder = (a, b) => a.order - b.order || a.title.localeCompare(b.title);
    arch.sort(sortByOrder);
    flat.sort(sortByOrder);
    Object.values(groups).forEach(g => g.sort(sortByOrder));

    const total = arch.length + flat.length + Object.values(groups).reduce((s, g) => s + g.length, 0);

    return { architecturePages: arch, conceptGroups: groups, flatConcepts: flat, totalCount: total };
  }, [pages]);

  const handlePageClick = useCallback((item) => {
    if (item.isReady && onSelectModel) {
      onSelectModel(item.urlPath);
      setTimeout(() => {
        if (onCollapse) onCollapse();
      }, 200);
    }
  }, [onSelectModel, onCollapse]);

  const containerStyle = {
    padding: '16px',
    fontFamily: 'var(--font-main)',
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  };

  const sortedSubcategories = Object.keys(conceptGroups).sort();
  const hasConcepts = sortedSubcategories.length > 0 || flatConcepts.length > 0;
  const conceptCount = flatConcepts.length + Object.values(conceptGroups).reduce((s, g) => s + g.length, 0);

  return (
    <div style={containerStyle}>
      {/* ── Panel Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '14px',
        padding: '0 2px',
      }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
          stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span style={{
          fontSize: '15px',
          fontWeight: '700',
          color: pal.headerText,
        }}>
          Pages
        </span>
        <span style={{
          fontSize: '10px',
          fontWeight: '600',
          color: accent,
          background: `${accent}18`,
          borderRadius: '8px',
          padding: '1px 7px',
          lineHeight: '16px',
        }}>
          {totalCount}
        </span>
      </div>

      {/* ── Empty State ── */}
      {totalCount === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          color: pal.textDim,
          fontSize: '12px',
        }}>
          No pages available
        </div>
      )}

      {/* ── Architecture Section ── */}
      {architecturePages.length > 0 && (
        <div style={{ marginBottom: '4px' }}>
          <SectionHeader
            label="Architecture"
            count={architecturePages.length}
            isOpen={archOpen}
            onToggle={() => setArchOpen(o => !o)}
            pal={pal}
          />
          <CollapsibleList isOpen={archOpen}>
            {architecturePages.map(item => (
              <PageButton
                key={item.id}
                item={item}
                isActive={selectedModel === item.urlPath}
                accent={accent}
                pal={pal}
                onClick={() => handlePageClick(item)}
              />
            ))}
          </CollapsibleList>
        </div>
      )}

      {/* ── Separator ── */}
      {architecturePages.length > 0 && hasConcepts && <Separator pal={pal} />}

      {/* ── Concepts Section ── */}
      {hasConcepts && (
        <div style={{ marginBottom: '4px' }}>
          <SectionHeader
            label="Concepts"
            count={conceptCount}
            isOpen={conceptsOpen}
            onToggle={() => setConceptsOpen(o => !o)}
            pal={pal}
          />
          <CollapsibleList isOpen={conceptsOpen}>
            {/* Subcategories */}
            {sortedSubcategories.map(subcat => (
              <SubcategoryGroup
                key={subcat}
                label={subcat}
                items={conceptGroups[subcat]}
                selectedModel={selectedModel}
                accent={accent}
                pal={pal}
                onPageClick={handlePageClick}
              />
            ))}
            {/* Flat concepts (no subcategory) */}
            {flatConcepts.map(item => (
              <PageButton
                key={item.id}
                item={item}
                isActive={selectedModel === item.urlPath}
                accent={accent}
                pal={pal}
                onClick={() => handlePageClick(item)}
              />
            ))}
          </CollapsibleList>
        </div>
      )}
    </div>
  );
}
