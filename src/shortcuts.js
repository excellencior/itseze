import { resolveTheme, getSettings } from './settingsStore';

/* ═══════════════════════════════════════════
 *  Keyboard Shortcuts System
 * ═══════════════════════════════════════════
 *
 * Global keyboard shortcut handler for itseze.
 * Shortcuts are registered here and rendered in the bubble's
 * keyboard panel via buildShortcutsContent().
 */

/**
 * All available keyboard shortcuts.
 * Each entry: { keys, label, category, action }
 *
 * `keys` uses standard modifier names: Ctrl/Cmd, Shift, Alt
 * Platform-adaptive: Ctrl shows as ⌘ on Mac, Ctrl on others.
 */
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const MOD = IS_MAC ? '⌘' : 'Ctrl';

export const SHORTCUTS = [
  // Navigation
  { keys: [`${MOD}`, 'B'], label: 'Toggle bubble open/close', category: 'Navigation', id: 'toggle-bubble' },
  { keys: [`${MOD}`, 'K'], label: 'Search pages', category: 'Navigation', id: 'search-pages' },
  { keys: [`${MOD}`, '\\'], label: 'Toggle sidebar/bubble mode', category: 'Navigation', id: 'toggle-nav' },
  { keys: ['Esc'], label: 'Close panel / Deselect', category: 'Navigation', id: 'escape' },

  // Theme
  { keys: [`${MOD}`, 'Shift', 'D'], label: 'Toggle dark/light theme', category: 'Appearance', id: 'toggle-theme' },

  // Scrolling
  { keys: ['Home'], label: 'Scroll to top', category: 'Reading', id: 'scroll-top' },
  { keys: ['End'], label: 'Scroll to bottom', category: 'Reading', id: 'scroll-bottom' },
  { keys: ['J'], label: 'Next section', category: 'Reading', id: 'next-section' },
  { keys: ['K'], label: 'Previous section', category: 'Reading', id: 'prev-section' },

  // Quick actions
  { keys: ['?'], label: 'Show shortcuts', category: 'Quick Actions', id: 'show-shortcuts' },
];

/**
 * Install the global keydown listener.
 * Returns a cleanup function.
 *
 * @param {object} handlers — callbacks for each shortcut id
 */
export function installShortcuts(handlers) {
  const listener = (e) => {
    // Skip when user is typing in an input/textarea
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;

    const mod = IS_MAC ? e.metaKey : e.ctrlKey;
    const shift = e.shiftKey;
    const key = e.key;

    // Mod+B → toggle bubble
    if (mod && !shift && key.toLowerCase() === 'b') {
      e.preventDefault();
      handlers.toggleBubble?.();
      return;
    }

    // Mod+K → search pages
    if (mod && !shift && key.toLowerCase() === 'k') {
      e.preventDefault();
      handlers.searchPages?.();
      return;
    }

    // Mod+\ → toggle nav mode
    if (mod && !shift && key === '\\') {
      e.preventDefault();
      handlers.toggleNav?.();
      return;
    }

    // Escape → close panel
    if (key === 'Escape') {
      handlers.escape?.();
      return;
    }

    // Mod+Shift+D → toggle theme
    if (mod && shift && key.toLowerCase() === 'd') {
      e.preventDefault();
      handlers.toggleTheme?.();
      return;
    }

    // Home → scroll to top
    if (key === 'Home' && !mod && !shift) {
      handlers.scrollTop?.();
      return;
    }

    // End → scroll to bottom
    if (key === 'End' && !mod && !shift) {
      handlers.scrollBottom?.();
      return;
    }

    // J → next section
    if (key === 'j' && !mod && !shift) {
      handlers.nextSection?.();
      return;
    }

    // K → previous section
    if (key === 'k' && !mod && !shift) {
      handlers.prevSection?.();
      return;
    }

    // ? → show shortcuts
    if (key === '?' && !mod) {
      handlers.showShortcuts?.();
      return;
    }
  };

  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}
