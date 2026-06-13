import { useState } from 'react';
import theme from '../../theme';
import { CONCEPTS, ARCHITECTURES, getPublishedNavItems, getDraftNavItems } from '../../navigation';

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
          ? theme.accent
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
            background: theme.accent,
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
        background: badgeColor === 'accent' ? 'rgba(8,145,178,0.15)' : SB.bgActive,
        color: badgeColor === 'accent' ? theme.accent : (badge === 'Draft' ? '#E59866' : SB.textMuted),
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
          color: hovered ? theme.accent : SB.textBright,
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
            stroke={hovered ? theme.accent : SB.textMuted}
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
          onMouseEnter={(e) => { e.currentTarget.style.color = theme.accent; }}
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
          color: isActive ? theme.accent : hovered ? SB.textBright : SB.text,
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
            stroke={isActive ? theme.accent : hovered ? SB.textBright : SB.textMuted}
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
          onMouseEnter={(e) => { e.currentTarget.style.color = theme.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = SB.textMuted; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      )}
    </div>
  );
}

export default function Sidebar({ selectedModel, onSelectModel, width = 280, collapsed = false, onToggleCollapse, isAdminMode = false, onCreateNewPage }) {
  const isConcept = selectedModel ? (selectedModel.startsWith('concept:') || selectedModel.startsWith('__pub__/concepts/') || selectedModel.startsWith('__draft__/itseze-draft-')) : false;
  
  const [lastSelectedModel, setLastSelectedModel] = useState(selectedModel);
  const [archOpen, setArchOpen] = useState(!isConcept);
  const [conceptsOpen, setConceptsOpen] = useState(isConcept);
  const [reasoningSubOpen, setReasoningSubOpen] = useState(() => {
    if (!selectedModel) return false;
    return CONCEPTS.some(
      c => c.children && c.children.some(child => selectedModel === child.route)
    ) || selectedModel.includes('/reasoning/') || selectedModel.includes('/prompting/') || selectedModel.includes('reasoning') || selectedModel.includes('prompting');
  });
  const [collapseBtnHovered, setCollapseBtnHovered] = useState(false);

  // Auto-expand the relevant section when the page changes
  if (selectedModel !== lastSelectedModel) {
    setLastSelectedModel(selectedModel);
    if (isConcept) {
      setConceptsOpen(true);
      const hasChildActive = selectedModel && CONCEPTS.some(
        c => c.children && c.children.some(child => selectedModel === child.route)
      );
      if (hasChildActive || (selectedModel && (selectedModel.includes('/reasoning/') || selectedModel.includes('/prompting/') || selectedModel.includes('reasoning') || selectedModel.includes('prompting')))) {
        setReasoningSubOpen(true);
      }
    } else {
      if (selectedModel) {
        setArchOpen(true);
      }
    }
  }

  const renderConceptsList = () => {
    const rendered = [];
    const publishedItems = getPublishedNavItems();
    const draftItems = isAdminMode ? getDraftNavItems() : [];

    CONCEPTS.forEach((c) => {
      if (c.children) {
        // Merge published pages that belong to this subcategory
        const subcatName = c.name; // e.g. 'Reasoning', 'Prompting'
        const pubChildren = publishedItems.filter(p => p.parentCategory === subcatName);
        const draftChildren = draftItems.filter(d => d.parentCategory === subcatName);

        const isAnyChildActive = c.children.some(child => selectedModel === child.route)
          || pubChildren.some(p => selectedModel === p.route)
          || draftChildren.some(d => selectedModel === d.route);
        
        rendered.push(
          <div key={`sub-${c.name}`}>
            <SubcategoryToggle
              label={c.name}
              isOpen={reasoningSubOpen}
              isActive={isAnyChildActive}
              onToggle={() => setReasoningSubOpen(!reasoningSubOpen)}
              isAdminMode={isAdminMode}
              onAddClick={() => onCreateNewPage?.('concept', c.name)}
            />

            <div style={{
              display: 'grid',
              gridTemplateRows: reasoningSubOpen ? '1fr' : '0fr',
              opacity: reasoningSubOpen ? 1 : 0,
              transition: 'grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
            }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ padding: '4px 0 6px 0' }}>
                  {c.children.map((child) => (
                    <NavItem
                      key={child.name}
                      label={child.name}
                      isActive={selectedModel === child.route}
                      isReady={child.ready}
                      onClick={() => onSelectModel(child.route)}
                      indent={20}
                      badge={!child.ready ? 'Soon' : null}
                    />
                  ))}
                  {pubChildren.map((pub) => (
                    <NavItem
                      key={pub.route}
                      label={pub.name}
                      isActive={selectedModel === pub.route}
                      isReady={true}
                      onClick={() => onSelectModel(pub.route)}
                      indent={20}
                      badge={isNew(pub.firstPublishedAt) ? 'New' : null}
                      badgeColor="accent"
                    />
                  ))}
                  {draftChildren.map((draft) => (
                    <NavItem
                      key={draft.route}
                      label={draft.name}
                      isActive={selectedModel === draft.route}
                      isReady={true}
                      onClick={() => onSelectModel(draft.route)}
                      indent={20}
                      badge="Draft"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Flat concept
        const pubEquivalent = publishedItems.find(p => !p.parentCategory && p.category === 'concept' && selectedModel === p.route);
        const draftEquivalent = draftItems.find(d => !d.parentCategory && d.category === 'concept' && selectedModel === d.route);
        
        rendered.push(
          <NavItem
            key={c.name}
            label={c.name}
            isActive={selectedModel === c.route || (pubEquivalent && pubEquivalent.name === c.name) || (draftEquivalent && draftEquivalent.name === c.name)}
            isReady={c.ready}
            onClick={() => onSelectModel(c.route)}
            badge={!c.ready ? 'Soon' : null}
          />
        );
      }
    });

    // Add flat published concepts (no subcategory) at the end
    const flatPubConcepts = publishedItems.filter(p => !p.parentCategory && p.category !== 'architecture');
    flatPubConcepts.forEach(pub => {
      // Avoid duplicate listing if it matches standard ready routes
      if (!CONCEPTS.some(c => c.route === pub.route)) {
        rendered.push(
          <NavItem
            key={pub.route}
            label={pub.name}
            isActive={selectedModel === pub.route}
            isReady={true}
            onClick={() => onSelectModel(pub.route)}
            badge={isNew(pub.firstPublishedAt) ? 'New' : null}
            badgeColor="accent"
          />
        );
      }
    });

    // Add flat draft concepts at the end
    const flatDraftConcepts = draftItems.filter(d => !d.parentCategory && d.category !== 'architecture');
    flatDraftConcepts.forEach(draft => {
      rendered.push(
        <NavItem
          key={draft.route}
          label={draft.name}
          isActive={selectedModel === draft.route}
          isReady={true}
          onClick={() => onSelectModel(draft.route)}
          badge="Draft"
        />
      );
    });

    return rendered;
  };

  const draftItems = isAdminMode ? getDraftNavItems() : [];
  const draftArchitectures = draftItems.filter(d => d.category === 'architecture');

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
      {/* ── Header ── */}
      <div style={{
        padding: '28px 22px 24px',
        borderBottom: `1px solid ${SB.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: SB.textBright,
            margin: 0,
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
          }}>It'sEze</h1>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            color: SB.textMuted,
            marginTop: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            whiteSpace: 'nowrap',
            margin: '8px 0 0 0',
          }}>Serve to simplify</p>
        </div>
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
              border: `1px solid ${collapseBtnHovered ? theme.accent : SB.border}`,
              background: collapseBtnHovered ? SB.bgHover : 'transparent',
              color: collapseBtnHovered ? theme.accent : SB.textMuted,
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
              {ARCHITECTURES.map((a) => (
                <NavItem
                  key={a.name}
                  label={a.name}
                  isActive={selectedModel === a.route}
                  isReady={a.ready}
                  onClick={() => onSelectModel(a.route)}
                  badge={!a.ready ? 'Soon' : null}
                />
              ))}
              {draftArchitectures.map((draft) => (
                <NavItem
                  key={draft.route}
                  label={draft.name}
                  isActive={selectedModel === draft.route}
                  isReady={true}
                  onClick={() => onSelectModel(draft.route)}
                  badge="Draft"
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
    </aside>
  );
}
