import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createBubbles } from '@hyperplexed/bubbles';
import { useSettings } from '../../SettingsContext';
import SettingsContext from '../../SettingsContext';
import { fetchPublishedPages } from '../../lib/pages';
import PagesPanel from '../bubble/PagesPanel';
import SettingsPanel from '../bubble/SettingsPanel';
import ShortcutsPanel from '../bubble/ShortcutsPanel';

/* ═══════════════════════════════════════════
 *  BubbleNav — @hyperplexed/bubbles integration
 * ═══════════════════════════════════════════
 *
 * Uses React render callbacks for all panel content,
 * full 10-token theming, event subscriptions, and
 * dismiss/restore via Ctrl+K.
 */

/* ── SVG icon factories (library needs raw HTMLElements) ── */

function createSvgIcon(innerHTML, color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  if (color) svg.style.color = color;
  svg.innerHTML = innerHTML;
  return svg;
}

const ICON_PATHS = {
  pages:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
    '<polyline points="14 2 14 8 20 8"/>' +
    '<line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' +
    '<polyline points="10 9 9 9 8 9"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  shortcuts:
    '<rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>' +
    '<path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/>',
};

/* ── Build accent-aware color tokens for all 10 library slots ── */

function buildColorTokens(resolvedTheme, accent) {
  if (resolvedTheme === 'light') {
    return {
      bubbleSurface: accent,
      bubbleIcon: '#ffffff',
      bubbleShadow: `0 4px 12px ${accent}40`,
      focusRing: accent,
      panelSurface: '#ffffff',
      panelText: '#1c1c1e',
      panelShadow: `0 12px 32px rgba(0,0,0,0.18)`,
      dismissSurface: `${accent}14`,
      dismissBorder: `${accent}40`,
      dismissIcon: accent,
    };
  }
  return {
    bubbleSurface: accent,
    bubbleIcon: '#ffffff',
    bubbleShadow: `0 4px 12px ${accent}40`,
    focusRing: accent,
    panelSurface: '#1c1c1e',
    panelText: '#ffffff',
    panelShadow: `0 12px 32px rgba(0,0,0,0.5)`,
    dismissSurface: `${accent}18`,
    dismissBorder: `${accent}55`,
    dismissIcon: accent,
  };
}

/* ── The three bubble definitions ── */

const BUBBLE_DEFS = ['pages', 'settings', 'shortcuts'];

/**
 * BubbleNav — floating bubble navigation.
 *
 * Exposes toggle and restoreDismissed via forwardRef
 * so MainLayout can bind Ctrl+K to toggle/restore.
 */
const BubbleNav = forwardRef(function BubbleNav({ selectedModel, onSelectModel }, ref) {
  const { settings, resolvedTheme, updateSettings, resetSettings } = useSettings();
  const managerRef = useRef(null);
  const [pages, setPages] = useState([]);
  const dismissedRef = useRef(new Set());
  const rootsRef = useRef({}); // { id: { root, host } }

  // Use refs for values that change frequently — avoids recreating
  // the render callbacks and causing the library to remount panels.
  const settingsRef = useRef({ settings, resolvedTheme, updateSettings, resetSettings });
  const pagesRef = useRef(pages);
  const selectedRef = useRef(selectedModel);
  const onSelectRef = useRef(onSelectModel);

  // Keep refs in sync
  settingsRef.current = { settings, resolvedTheme, updateSettings, resetSettings };
  pagesRef.current = pages;
  selectedRef.current = selectedModel;
  onSelectRef.current = onSelectModel;

  // Expose manager + restore to parent (MainLayout)
  useImperativeHandle(ref, () => ({
    toggle: () => {
      if (managerRef.current) {
        try { managerRef.current.toggle(); } catch { /* */ }
      }
    },
    restoreDismissed: () => {
      if (!managerRef.current || dismissedRef.current.size === 0) return false;
      for (const id of dismissedRef.current) {
        addBubble(id);
      }
      dismissedRef.current.clear();
      return true;
    },
    hasDismissed: () => dismissedRef.current.size > 0,
    state: () => managerRef.current?.state?.() ?? 'docked',
  }));

  // Fetch pages on mount
  useEffect(() => {
    fetchPublishedPages()
      .then(setPages)
      .catch(() => setPages([]));
  }, []);

  // ── Immediate configure (bypasses React render cycle for real-time feel) ──
  // partial: library config keys to override (e.g. { panelWidth: 500 })
  // settingsOverride: app settings to override for color computation (e.g. { accent: '#ff0000' })
  const handleConfigure = useCallback((partial, settingsOverride) => {
    if (!managerRef.current) return;
    const s = { ...settingsRef.current.settings, ...settingsOverride };
    const rt = settingsRef.current.resolvedTheme;
    try {
      managerRef.current.configure({
        theme: s.theme,
        colors: buildColorTokens(rt, s.accent),
        side: s.dockSide,
        vertical: s.dockVertical,
        panelWidth: s.panelWidth,
        panelMaxHeight: s.panelMaxHeight,
        ricochet: s.ricochet,
        ...partial,
      });
    } catch { /* */ }
  }, []); // Stable — reads from refs

  // ── Render a panel into a root (create or re-render) ──
  const renderPanel = useCallback((id, root) => {
    const { settings: s, resolvedTheme: rt, updateSettings: us, resetSettings: rs } = settingsRef.current;
    const ctxValue = { settings: s, resolvedTheme: rt, updateSettings: us, resetSettings: rs };

    const handleCollapse = () => {
      setTimeout(() => {
        if (managerRef.current?.state() === 'open') {
          try { managerRef.current.toggle(); } catch { /* */ }
        }
      }, 200);
    };

    const components = {
      pages: (
        <SettingsContext.Provider value={ctxValue}>
          <PagesPanel
            pages={pagesRef.current}
            selectedModel={selectedRef.current}
            onSelectModel={onSelectRef.current}
            onCollapse={handleCollapse}
          />
        </SettingsContext.Provider>
      ),
      settings: (
        <SettingsContext.Provider value={ctxValue}>
          <SettingsPanel onConfigure={handleConfigure} />
        </SettingsContext.Provider>
      ),
      shortcuts: (
        <SettingsContext.Provider value={ctxValue}>
          <ShortcutsPanel />
        </SettingsContext.Provider>
      ),
    };

    root.render(components[id]);
  }, []); // Stable — reads from refs

  // ── React render callback factory (stable, never changes) ──
  const makeContent = useCallback((id) => {
    return (host) => {
      // Style host to fill the panel surface's flex layout
      host.style.flex = '1';
      host.style.minHeight = '0';
      host.style.display = 'flex';
      host.style.flexDirection = 'column';
      host.style.overflow = 'hidden';

      const root = createRoot(host);
      rootsRef.current[id] = { root, host };
      renderPanel(id, root);

      return () => {
        root.unmount();
        delete rootsRef.current[id];
      };
    };
  }, [renderPanel]); // Stable

  // ── Add a single bubble to the manager ──
  const addBubble = useCallback((id) => {
    if (!managerRef.current) return;
    const labels = { pages: 'Pages', settings: 'Settings', shortcuts: 'Shortcuts' };
    const iconColor = '#ffffff'; // White on accent-colored bubble surface
    try {
      managerRef.current.add({
        id,
        label: labels[id],
        icon: createSvgIcon(ICON_PATHS[id], iconColor),
        content: makeContent(id),
        onDismiss: () => {
          dismissedRef.current.add(id);
        },
      });
    } catch { /* */ }
  }, [makeContent]); // Stable

  // ── Initialize the bubble manager ──
  useEffect(() => {
    if (settings.navMode !== 'bubble') {
      if (managerRef.current) {
        try { managerRef.current.destroy(); } catch { /* */ }
        managerRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (managerRef.current) {
        try { managerRef.current.destroy(); } catch { /* */ }
        managerRef.current = null;
      }

      const manager = createBubbles({
        theme: settings.theme,
        colors: buildColorTokens(resolvedTheme, settings.accent),
        side: settings.dockSide,
        vertical: settings.dockVertical,
        panelWidth: settings.panelWidth,
        panelMaxHeight: settings.panelMaxHeight,
        maxBubbles: 5,
        ricochet: settings.ricochet,
        initialState: 'docked',
      });

      managerRef.current = manager;

      // Subscribe to statechange for background dim
      manager.on('statechange', ({ state }) => {
        const overlay = document.getElementById('bubble-dim-overlay');
        if (overlay) {
          overlay.style.opacity = state === 'open' ? '1' : '0';
          overlay.style.pointerEvents = 'none';
        }
      });

      // Add all three bubbles
      BUBBLE_DEFS.forEach(id => addBubble(id));
      dismissedRef.current.clear();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (managerRef.current) {
        try { managerRef.current.destroy(); } catch { /* */ }
        managerRef.current = null;
      }
    };
  }, [settings.navMode]); // Only re-create on mode change

  // ── Live-configure when ANY setting changes ──
  // configure() resets omitted options to defaults,
  // so we always send the full set.
  useEffect(() => {
    if (!managerRef.current || settings.navMode !== 'bubble') return;
    try {
      managerRef.current.configure({
        theme: settings.theme,
        colors: buildColorTokens(resolvedTheme, settings.accent),
        side: settings.dockSide,
        vertical: settings.dockVertical,
        panelWidth: settings.panelWidth,
        panelMaxHeight: settings.panelMaxHeight,
        ricochet: settings.ricochet,
      });
    } catch { /* */ }
  }, [resolvedTheme, settings.accent, settings.theme, settings.dockSide,
      settings.dockVertical, settings.panelWidth, settings.panelMaxHeight,
      settings.ricochet, settings.navMode]);

  // ── Re-render all mounted panel roots when settings/pages/selection change ──
  // This is what makes the panels reactive: we push new context + props
  // into existing React roots without destroying/recreating them.
  useEffect(() => {
    if (settings.navMode !== 'bubble') return;
    for (const [id, entry] of Object.entries(rootsRef.current)) {
      if (entry?.root) renderPanel(id, entry.root);
    }
  }, [settings, resolvedTheme, pages, selectedModel, renderPanel]);

  // ── Render the dim overlay (purely visual) ──
  return (
    <div
      id="bubble-dim-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.15)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        zIndex: 999998,
      }}
    />
  );
});

export default BubbleNav;
