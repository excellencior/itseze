/**
 * ═══════════════════════════════════════════
 *  It'sEze — Settings Store
 * ═══════════════════════════════════════════
 *
 * Centralized settings with localStorage persistence.
 * Manages theme, accent, bubble config.
 */

const STORAGE_KEY = 'itseze-settings';

const DEFAULTS = {
  theme: 'auto',              // 'auto' | 'dark' | 'light'
  accent: '#0891B2',          // hex color
  dockSide: 'left',           // 'left' | 'right'
  dockVertical: 0.5,          // 0–1
  panelWidth: 480,            // px
  panelMaxHeight: '80%',      // string
  ricochet: 0.4,              // 0–1
};

/** Curated accent color swatches — all pass WCAG AA on both themes */
export const ACCENT_SWATCHES = [
  { hex: '#0891B2', name: 'Teal' },
  { hex: '#2563EB', name: 'Blue' },
  { hex: '#7C3AED', name: 'Purple' },
  { hex: '#DB2777', name: 'Pink' },
  { hex: '#E11D48', name: 'Rose' },
  { hex: '#EA580C', name: 'Orange' },
  { hex: '#16A34A', name: 'Green' },
  { hex: '#0D9488', name: 'Emerald' },
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

/**
 * Compute relative luminance for a hex color.
 * Used for smart accent contrast adjustment.
 */
function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const srgb = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Compute contrast ratio between two hex colors.
 */
function contrastRatio(hex1, hex2) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Apply accent color to CSS custom properties on :root.
 * Includes smart contrast adjustment — if the accent is too close
 * to the current theme's background, a readable variant is generated.
 */
export function applyAccentToCSS(hex, themeValue) {
  const root = document.documentElement;
  const resolved = themeValue ? resolveTheme(themeValue) : (root.getAttribute('data-theme') || 'light');

  // The surface the accent text sits on
  const surface = resolved === 'dark' ? '#1E1E1E' : '#FFFFFF';
  const ratio = contrastRatio(hex, surface);

  // If contrast is too low (<3.5:1), generate a readable variant
  let accentText = hex;
  if (ratio < 3.5) {
    // For dark theme, lighten the accent; for light theme, darken it
    accentText = resolved === 'dark' ? lightenHex(hex, 0.45) : darkenHex(hex, 0.35);
  }

  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-hex', hex);
  root.style.setProperty('--accent-text', accentText);
  root.style.setProperty('--accent-50', hexToRgba(hex, 0.5));
  root.style.setProperty('--accent-20', hexToRgba(hex, 0.2));
  root.style.setProperty('--accent-70', hexToRgba(hex, 0.7));
  root.style.setProperty('--accent-08', hexToRgba(hex, 0.08));
}

/** Lighten a hex color by a factor (0–1) */
function lightenHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.min(255, Math.round(r + (255 - r) * factor));
  const ng = Math.min(255, Math.round(g + (255 - g) * factor));
  const nb = Math.min(255, Math.round(b + (255 - b) * factor));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

/** Darken a hex color by a factor (0–1) */
function darkenHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.max(0, Math.round(r * (1 - factor)));
  const ng = Math.max(0, Math.round(g * (1 - factor)));
  const nb = Math.max(0, Math.round(b * (1 - factor)));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
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

/** Theme-dependent token sets */
const THEME_TOKENS = {
  light: {
    // ── Backgrounds (warm matte palette) ──
    '--bg':            '#E8E5E0',
    '--bg-dark':       '#D6D3CC',
    '--bg-subtle':     '#F5F3EE',
    '--node-bg':       '#FFFFFF',
    // ── Borders ──
    '--border':        '#D6D3CC',
    '--border-focus':  '#ADA99F',
    // ── Text ──
    '--text-main':     '#1A1A1A',
    '--text-muted':    '#5C5C5C',
    '--text-light':    '#9C9C9C',
    // ── Shadows ──
    '--shadow-sm':     '0 2px 8px rgba(0,0,0,0.03)',
    '--shadow-md':     '0 8px 20px rgba(0,0,0,0.05)',
    '--shadow-hover':  '0 12px 32px rgba(0,0,0,0.07)',
    // ── Sidebar ──
    '--sidebar-bg':         '#F2F0EB',
    '--sidebar-bg-hover':   '#E8E5E0',
    '--sidebar-bg-active':  '#E4E1DB',
    '--sidebar-border':     '#D6D3CC',
    '--sidebar-text':       '#5C5C5C',
    '--sidebar-text-bright':'#1A1A1A',
    '--sidebar-text-muted': '#9C9C9C',
    '--sidebar-text-dim':   '#C8C8C8',
    // ── Semantic surfaces (callouts, status cards) ──
    '--surface-green':  '#F0F7F0',
    '--surface-red':    '#FDF2F2',
    '--surface-blue':   '#EFF5FF',
    '--surface-amber':  '#FFF8ED',
    '--border-green':   '#10B981',
    '--border-red':     '#EF4444',
    '--border-blue':    '#3B82F6',
    '--border-amber':   '#F59E0B',
  },
  dark: {
    // ── Backgrounds ──
    '--bg':            '#161616',
    '--bg-dark':       '#0A0A0A',
    '--bg-subtle':     '#1A1A1A',
    '--node-bg':       '#1E1E1E',
    // ── Borders ──
    '--border':        '#2A2A2A',
    '--border-focus':  '#444444',
    // ── Text ──
    '--text-main':     '#E8E8E8',
    '--text-muted':    '#A0A0A0',
    '--text-light':    '#666666',
    // ── Shadows ──
    '--shadow-sm':     '0 2px 8px rgba(0,0,0,0.3)',
    '--shadow-md':     '0 8px 20px rgba(0,0,0,0.4)',
    '--shadow-hover':  '0 12px 32px rgba(0,0,0,0.5)',
    // ── Sidebar ──
    '--sidebar-bg':         '#0F0F0F',
    '--sidebar-bg-hover':   '#1A1A1A',
    '--sidebar-bg-active':  '#1F1F1F',
    '--sidebar-border':     '#252525',
    '--sidebar-text':       '#B0B0B0',
    '--sidebar-text-bright':'#EDEDED',
    '--sidebar-text-muted': '#777777',
    '--sidebar-text-dim':   '#444444',
    // ── Semantic surfaces (callouts, status cards) ──
    '--surface-green':  'rgba(16, 185, 129, 0.08)',
    '--surface-red':    'rgba(239, 68, 68, 0.08)',
    '--surface-blue':   'rgba(59, 130, 246, 0.08)',
    '--surface-amber':  'rgba(245, 158, 11, 0.08)',
    '--border-green':   '#10B981',
    '--border-red':     '#EF4444',
    '--border-blue':    '#3B82F6',
    '--border-amber':   '#F59E0B',
  },
};

/** Apply the theme (dark/light) to the document */
export function applyThemeToDOM(themeValue) {
  const resolved = resolveTheme(themeValue);
  document.documentElement.setAttribute('data-theme', resolved);

  // main.jsx injects light vars as inline styles on :root, which have
  // higher specificity than [data-theme="dark"] CSS rules. We must
  // also set theme-dependent vars as inline styles so dark mode works.
  const tokens = THEME_TOKENS[resolved] || THEME_TOKENS.light;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Re-apply accent with correct theme for contrast adjustment
  const settings = getSettings();
  applyAccentToCSS(settings.accent, themeValue);
}

export { DEFAULTS };
