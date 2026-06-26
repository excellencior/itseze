/**
 * ═══════════════════════════════════════════
 *  It'sEze — Settings Store
 * ═══════════════════════════════════════════
 *
 * Centralized settings with localStorage persistence.
 * Manages nav mode, theme, accent, bubble config.
 */

const STORAGE_KEY = 'itseze-settings';

const DEFAULTS = {
  navMode: 'bubble',          // 'bubble' | 'sidebar'
  theme: 'auto',              // 'auto' | 'dark' | 'light'
  accent: '#0891B2',          // hex color
  dockSide: 'left',           // 'left' | 'right'
  dockVertical: 0.5,          // 0–1
  panelWidth: 480,            // px
  panelMaxHeight: '80%',      // string
  ricochet: 0.4,              // 0–1
};

/** Curated accent color swatches */
export const ACCENT_SWATCHES = [
  { hex: '#0891B2', name: 'Teal' },
  { hex: '#2563EB', name: 'Blue' },
  { hex: '#7C3AED', name: 'Purple' },
  { hex: '#DB2777', name: 'Pink' },
  { hex: '#E11D48', name: 'Rose' },
  { hex: '#EA580C', name: 'Orange' },
  { hex: '#16A34A', name: 'Green' },
  { hex: '#0D9488', name: 'Emerald' },
  { hex: '#525252', name: 'Gray' },
  { hex: '#000000', name: 'Black' },
];

/** Read settings from localStorage, filling missing keys with defaults */
export function getSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...DEFAULTS, ...stored };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Merge partial updates into stored settings */
export function updateSettings(partial) {
  const current = getSettings();
  const next = { ...current, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Reset all settings to defaults */
export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULTS };
}

/** Convert a hex color to rgba */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Apply accent color to CSS custom properties on :root */
export function applyAccentToCSS(hex) {
  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-hex', hex);
  root.style.setProperty('--accent-50', hexToRgba(hex, 0.5));
  root.style.setProperty('--accent-20', hexToRgba(hex, 0.2));
  root.style.setProperty('--accent-70', hexToRgba(hex, 0.7));
}

/**
 * Resolve the effective theme ('dark' or 'light') from the stored value,
 * taking 'auto' into account by checking prefers-color-scheme.
 */
export function resolveTheme(themeValue) {
  if (themeValue === 'dark' || themeValue === 'light') return themeValue;
  // 'auto' → follow system
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/** Apply the theme (dark/light) to the document */
export function applyThemeToDOM(themeValue) {
  const resolved = resolveTheme(themeValue);
  document.documentElement.setAttribute('data-theme', resolved);
}

export { DEFAULTS };
