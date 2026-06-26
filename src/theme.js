/**
 * ═══════════════════════════════════════════
 *  It'sEze — Central Theme Configuration
 * ═══════════════════════════════════════════
 * 
 * Single source of truth for all visual tokens.
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

  // ── Backgrounds ──
  bg: '#FDFBF4',
  bgDark: '#111',
  bgCard: '#FFFFFF',
  bgSubtle: '#FAF8F1',

  // ── Borders ──
  border: '#D4D4D4',
  borderFocus: '#A0A0A0',

  // ── Text ──
  textMain: '#000000',
  textMuted: '#545454',
  textLight: '#A0A0A0',


  // ── Shadows ──
  shadowSm: '0 2px 8px rgba(0,0,0,0.04)',
  shadowMd: '0 8px 20px rgba(0,0,0,0.06)',
  shadowHover: '0 12px 32px rgba(0,0,0,0.08)',
  shadowOuter: '0 0 40px rgba(0,0,0,0.4)',

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
