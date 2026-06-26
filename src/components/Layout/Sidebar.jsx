import { useState, useEffect } from 'react';
import { fetchPublishedPages } from '../../lib/pages';
import { useSettings } from '../../SettingsContext';

/* ── Color Palette ── */
const SB = {
  bg:          '#000000',
  bgHover:     '#1a1a1a',
  bgActive:    '#1f1f1f',
  border:      '#222',
  textBright:  '#EDEDED',
  text:        '#B0B0B0',
  textMuted:   '#777',
  textDim:     '#444',
};

/** Check if a published date is within the last 7 days */
function isNew(firstPublishedAt) {
  if (!firstPublishedAt) return false;
  const published = new Date(firstPublishedAt);
  const now = new Date();
  const diffDays = (now - published) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

/* ── Reusable nav item with boxy hover ── */
function NavItem({ label, isActive, isReady = true, onClick, indent = 0, badge, badgeColor }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => { if (isReady) onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: indent ? `calc(100% - ${indent}px)` : '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: indent ? '9px 12px' : '10px 14px',
        marginLeft: indent ? `${indent}px` : 0,
        border: 'none',
        borderRadius: '8px',
        background: isActive
          ? SB.bgActive
          : hovered && isReady
            ? SB.bgHover
            : 'transparent',
        color: isActive
          ? 'var(--accent)'
          : hovered && isReady
            ? SB.textBright
            : isReady
              ? SB.text
              : SB.textDim,
        fontSize: indent ? '13px' : '13.5px',
        fontWeight: isActive ? 650 : 500,
        cursor: isReady ? 'pointer' : 'not-allowed',
        transition: 'background 0.15s ease, color 0.15s ease',
        textAlign: 'left',
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
        marginBottom: '2px',
        position: 'relative',
        outline: 'none',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {isActive && (
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            flexShrink: 0,
          }} />
        )}
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
      </span>
      {badge && <span style={{
        fontSize: '9px',
        fontWeight: 700,
        background: badgeColor === 'accent' ? 'var(--accent-20)' : SB.bgActive,
        color: badgeColor === 'accent' ? 'var(--accent)' : (badge === 'Draft' ? '#E59866' : SB.textMuted),
        padding: '2px 7px',
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}>{badge}</span>}
    </button>
  );
}

/* ── Section header toggle ── */
function SectionToggle({ label, isOpen, onToggle, isAdminMode, onAddClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '8px',
        background: hovered ? SB.bgHover : 'transparent',
        marginBottom: '4px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          border: 'none',
          background: 'transparent',
          color: hovered ? 'var(--accent)' : SB.textBright,
          fontSize: '11.5px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'color 0.15s ease',
          textAlign: 'left',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        <span>{label}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0,
          }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke={hovered ? 'var(--accent)' : SB.textMuted}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'stroke 0.15s ease' }}
          />
        </svg>
      </button>
      {isAdminMode && onAddClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddClick();
          }}
          title={`Add new page under ${label}`}
          style={{
            padding: '10px 14px',
            border: 'none',
            background: 'transparent',
            color: SB.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = SB.textMuted; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      )}
    </div>
  );
}

/* ── Subcategory toggle (e.g. Reasoning) ── */
function SubcategoryToggle({ label, isOpen, isActive, onToggle, isAdminMode, onAddClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 'calc(100% - 8px)',
        marginLeft: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '8px',
        background: hovered ? SB.bgHover : 'transparent',
        marginBottom: '2px',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          border: 'none',
          background: 'transparent',
          color: isActive ? 'var(--accent)' : hovered ? SB.textBright : SB.text,
          fontSize: '13.5px',
          fontWeight: 650,
          cursor: 'pointer',
          transition: 'color 0.15s ease',
          textAlign: 'left',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      >
        <span>{label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke={isActive ? 'var(--accent)' : hovered ? SB.textBright : SB.textMuted}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'stroke 0.15s ease' }}
          />
        </svg>
      </button>
      {isAdminMode && onAddClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddClick();
          }}
          title={`Add new page under ${label}`}
          style={{
            padding: '9px 12px',
            border: 'none',
            background: 'transparent',
            color: SB.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = SB.textMuted; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      )}
    </div>
  );
}

/* ── Helper: organize Supabase pages into architecture + grouped concepts ── */
function organizePages(pages) {
  const architecturePages = [];
  const conceptGroups = {};   // { subcategory: [pages] }
  const flatConcepts = [];    // concepts without a subcategory

  for (const page of pages) {
    const meta = page.current_version?.meta;
    if (!meta) continue;

    const category = (meta.category || '').toLowerCase();
    const isReady = page.status === 'published';

    const item = {
      id: page.id,
      title: meta.title || 'Untitled',
      urlPath: page.url_path,
      route: page.route,
      isReady,
      createdAt: page.current_version?.created_at,
      subcategory: meta.subcategory || null,
    };

    if (category === 'architecture') {
      architecturePages.push(item);
    } else if (category === 'concept' || category === 'concepts') {
      if (item.subcategory) {
        if (!conceptGroups[item.subcategory]) {
          conceptGroups[item.subcategory] = [];
        }
        conceptGroups[item.subcategory].push(item);
      } else {
        flatConcepts.push(item);
      }
    }
  }

  // Sort each group alphabetically by title
  const sortByTitle = (a, b) => a.title.localeCompare(b.title);
  architecturePages.sort(sortByTitle);
  flatConcepts.sort(sortByTitle);

  // Sort subcategory names and their items
  const sortedSubcategories = Object.keys(conceptGroups).sort();
  for (const key of sortedSubcategories) {
    conceptGroups[key].sort(sortByTitle);
  }

  return { architecturePages, conceptGroups, sortedSubcategories, flatConcepts };
}

export default function Sidebar({ selectedModel, onSelectModel, width = 280, collapsed = false, onToggleCollapse, isAdminMode = false, onCreateNewPage }) {
  /* ── Supabase data ── */
  const [pages, setPages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedPages()
      .then((data) => { if (!cancelled) setPages(data); })
      .catch(() => { if (!cancelled) setPages([]); });
    return () => { cancelled = true; };
  }, []);

  const { architecturePages, conceptGroups, sortedSubcategories, flatConcepts } = organizePages(pages);

  /* ── Determine if current selection is a concept ── */
  const isConcept = selectedModel
    ? (selectedModel.startsWith('/concepts/') || selectedModel.startsWith('concept:'))
    : false;

  const [lastSelectedModel, setLastSelectedModel] = useState(selectedModel);
  const [archOpen, setArchOpen] = useState(!isConcept);
  const [conceptsOpen, setConceptsOpen] = useState(isConcept);
  const [subcatOpenState, setSubcatOpenState] = useState(() => {
    // Auto-open the subcategory that contains the selected page
    const openMap = {};
    if (selectedModel) {
      for (const [subcat, items] of Object.entries(conceptGroups)) {
        if (items.some(item => selectedModel === item.urlPath)) {
          openMap[subcat] = true;
        }
      }
    }
    return openMap;
  });
  const [collapseBtnHovered, setCollapseBtnHovered] = useState(false);

  // Auto-expand the relevant section when the page changes
  if (selectedModel !== lastSelectedModel) {
    setLastSelectedModel(selectedModel);
    if (isConcept) {
      setConceptsOpen(true);
      // Auto-open matching subcategory
      for (const [subcat, items] of Object.entries(conceptGroups)) {
        if (items.some(item => selectedModel === item.urlPath)) {
          setSubcatOpenState(prev => ({ ...prev, [subcat]: true }));
        }
      }
    } else {
      if (selectedModel) {
        setArchOpen(true);
      }
    }
  }

  const toggleSubcat = (subcat) => {
    setSubcatOpenState(prev => ({ ...prev, [subcat]: !prev[subcat] }));
  };

  const renderConceptsList = () => {
    const rendered = [];

    // Render grouped subcategories
    for (const subcat of sortedSubcategories) {
      const items = conceptGroups[subcat];
      const isSubOpen = !!subcatOpenState[subcat];
      const isAnyChildActive = items.some(item => selectedModel === item.urlPath);

      rendered.push(
        <div key={`sub-${subcat}`}>
          <SubcategoryToggle
            label={subcat}
            isOpen={isSubOpen}
            isActive={isAnyChildActive}
            onToggle={() => toggleSubcat(subcat)}
            isAdminMode={isAdminMode}
            onAddClick={() => onCreateNewPage?.('concept', subcat)}
          />

          <div style={{
            display: 'grid',
            gridTemplateRows: isSubOpen ? '1fr' : '0fr',
            opacity: isSubOpen ? 1 : 0,
            transition: 'grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '4px 0 6px 0' }}>
                {items.map((item) => (
                  <NavItem
                    key={item.id}
                    label={item.title}
                    isActive={selectedModel === item.urlPath}
                    isReady={item.isReady}
                    onClick={() => onSelectModel(item.urlPath)}
                    indent={20}
                    badge={
                      !item.isReady
                        ? 'Soon'
                        : isNew(item.createdAt)
                          ? 'New'
                          : null
                    }
                    badgeColor={item.isReady && isNew(item.createdAt) ? 'accent' : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Render flat (ungrouped) concepts
    for (const item of flatConcepts) {
      rendered.push(
        <NavItem
          key={item.id}
          label={item.title}
          isActive={selectedModel === item.urlPath}
          isReady={item.isReady}
          onClick={() => onSelectModel(item.urlPath)}
          badge={
            !item.isReady
              ? 'Soon'
              : isNew(item.createdAt)
                ? 'New'
                : null
          }
          badgeColor={item.isReady && isNew(item.createdAt) ? 'accent' : undefined}
        />
      );
    }

    return rendered;
  };

  return (
    <aside style={{
      width: collapsed ? '0px' : `${width}px`,
      minWidth: collapsed ? '0px' : '200px',
      maxWidth: collapsed ? '0px' : '500px',
      backgroundColor: SB.bg,
      borderRight: collapsed ? 'none' : `1px solid ${SB.border}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      color: SB.textBright,
      borderRadius: '12px 0 0 12px',
      overflow: 'hidden',
      position: 'relative',
      transition: 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1), min-width 0.3s cubic-bezier(0.22, 1, 0.36, 1), max-width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      {/* ── Header with Logo ── */}
      <div style={{
        padding: '20px 22px',
        borderBottom: `1px solid ${SB.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        {/* Logo */}
        <div
          onClick={() => onSelectModel?.('gpt3')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'opacity 0.2s ease',
            minWidth: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: SB.textBright,
            lineHeight: 1.1,
            borderBottom: '2px solid var(--accent-20)',
            paddingBottom: '3px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
          }}>
            It&apos;sEze
          </span>
          <span style={{
            fontSize: '8px',
            fontWeight: 700,
            color: SB.textMuted,
            marginTop: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            whiteSpace: 'nowrap',
          }}>
            Serve to simplify
          </span>
        </div>

        {/* Collapse button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            onMouseEnter={() => setCollapseBtnHovered(true)}
            onMouseLeave={() => setCollapseBtnHovered(false)}
            aria-label="Collapse sidebar"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              border: `1px solid ${collapseBtnHovered ? 'var(--accent)' : SB.border}`,
              background: collapseBtnHovered ? SB.bgHover : 'transparent',
              color: collapseBtnHovered ? 'var(--accent)' : SB.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              outline: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav" style={{
        flex: 1,
        padding: '20px 14px',
        overflowY: 'auto',
      }}>
        {/* Architecture */}
        <SectionToggle
          label="Architecture"
          isOpen={archOpen}
          onToggle={() => setArchOpen(!archOpen)}
          isAdminMode={isAdminMode}
          onAddClick={() => onCreateNewPage?.('architecture', '')}
        />

        <div style={{
          display: 'grid',
          gridTemplateRows: archOpen ? '1fr' : '0fr',
          opacity: archOpen ? 1 : 0,
          transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ padding: '4px 0 12px 0' }}>
              {architecturePages.map((item) => (
                <NavItem
                  key={item.id}
                  label={item.title}
                  isActive={selectedModel === item.urlPath}
                  isReady={item.isReady}
                  onClick={() => onSelectModel(item.urlPath)}
                  badge={
                    !item.isReady
                      ? 'Soon'
                      : isNew(item.createdAt)
                        ? 'New'
                        : null
                  }
                  badgeColor={item.isReady && isNew(item.createdAt) ? 'accent' : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Concepts */}
        <div style={{ marginTop: '6px' }}>
          <SectionToggle
            label="Concepts"
            isOpen={conceptsOpen}
            onToggle={() => setConceptsOpen(!conceptsOpen)}
            isAdminMode={isAdminMode}
            onAddClick={() => onCreateNewPage?.('concept', '')}
          />

          <div style={{
            display: 'grid',
            gridTemplateRows: conceptsOpen ? '1fr' : '0fr',
            opacity: conceptsOpen ? 1 : 0,
            transition: 'grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '4px 0 12px 0' }}>
                {renderConceptsList()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Switch to Bubble button ── */}
      <div style={{
        padding: '12px 14px',
        borderTop: `1px solid ${SB.border}`,
      }}>
        <SwitchToBubbleButton />
      </div>
    </aside>
  );
}

function SwitchToBubbleButton() {
  const { updateSettings } = useSettings();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => updateSettings({ navMode: 'bubble' })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Switch to bubble navigation (Ctrl+\\)"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '9px 14px',
        border: `1px solid ${hovered ? 'var(--accent)' : SB.border}`,
        borderRadius: '8px',
        background: hovered ? 'rgba(8,145,178,0.06)' : 'transparent',
        color: hovered ? 'var(--accent)' : SB.textMuted,
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
        letterSpacing: '0.01em',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      Switch to Bubble
      <span style={{
        fontSize: '10px',
        opacity: 0.5,
        fontWeight: 500,
      }}>Ctrl+\</span>
    </button>
  );
}
