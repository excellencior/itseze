/**
 * ═══════════════════════════════════════════
 *  It'sEze — Central Theme Configuration
 * ═══════════════════════════════════════════
 * 
 * Single source of truth for all visual tokens (light-mode defaults).
 * Change values here to update the entire app.
 * 
 * Usage in JS:  import { theme } from '@/theme'
 * Usage in CSS: var(--accent), var(--bg), etc.
 *               (injected automatically via ThemeProvider)
 */

const theme = {

  // ── Tint / Interaction Color ──
  // #0891B2 — teal/cyan, WCAG AA on both black (~4.6:1) and white (~4.6:1)
  accent: '#0891B2',
  accentHex: '#0891B2',
  accent50: 'rgba(8, 145, 178, 0.5)',
  accent20: 'rgba(8, 145, 178, 0.2)',
  accent70: 'rgba(8, 145, 178, 0.7)',

  // ── Backgrounds (warm matte) ──
  bg: '#E8E5E0',
  bgDark: '#D6D3CC',
  bgCard: '#FFFFFF',
  bgSubtle: '#F5F3EE',

  // ── Borders (warm) ──
  border: '#D6D3CC',
  borderFocus: '#ADA99F',

  // ── Text ──
  textMain: '#1A1A1A',
  textMuted: '#5C5C5C',
  textLight: '#9C9C9C',

  // ── Shadows ──
  shadowSm: '0 2px 8px rgba(0,0,0,0.03)',
  shadowMd: '0 8px 20px rgba(0,0,0,0.05)',
  shadowHover: '0 12px 32px rgba(0,0,0,0.07)',
  shadowOuter: '0 0 40px rgba(0,0,0,0.25)',

  // ── Radii ──
  radius: '0px',
  radiusSm: '0px',
  radiusContainer: '12px',

  // ── Scrollbar ──
  scrollbarThumb: 'rgba(8, 145, 178, 0.5)',
  scrollbarThumbHover: 'rgba(8, 145, 178, 0.7)',
  scrollbarTrack: 'transparent',

  // ── Layout ──
  outerPadding: '12px',

  // ── Typography ──
  // Change these values to update fonts/sizes across the entire app.
  fontMain: '"Iosevka Charon", sans-serif',
  fontMono: '"Iosevka Charon", monospace',
  fontSize: '17px',
};

/**
 * Generates a CSS custom properties string from the theme.
 * Called once at app init to inject into :root.
 */
function toCSSVariables(t) {
  return {
    '--accent': t.accent,
    '--accent-hex': t.accentHex,
    '--accent-text': t.accent,
    '--accent-50': t.accent50,
    '--accent-20': t.accent20,
    '--accent-70': t.accent70,
    '--bg': t.bg,
    '--bg-dark': t.bgDark,
    '--node-bg': t.bgCard,
    '--bg-subtle': t.bgSubtle,
    '--border': t.border,
    '--border-focus': t.borderFocus,
    '--text-main': t.textMain,
    '--text-muted': t.textMuted,
    '--text-light': t.textLight,
    '--shadow-sm': t.shadowSm,
    '--shadow-md': t.shadowMd,
    '--shadow-hover': t.shadowHover,
    '--radius': t.radius,
    '--radius-sm': t.radiusSm,
    '--font-main': t.fontMain,
    '--font-mono': t.fontMono,
    '--font-size': t.fontSize,
  };
}

export { theme, toCSSVariables };
export default theme;
