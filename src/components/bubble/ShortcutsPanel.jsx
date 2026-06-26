import { useSettings } from '../../SettingsContext';

/* ═══════════════════════════════════════════
 *  Theme-aware color palette
 * ═══════════════════════════════════════════ */
const PALETTES = {
  dark: {
    text: '#E8E8E8', textMuted: '#B0B0B0', textDim: '#777', headerText: '#fff',
    activeBg: '#1f1f1f', hoverBg: '#1a1a1a', border: '#333', borderFocus: '#555',
    controlBg: '#333', controlText: '#fff', controlOff: '#777',
  },
  light: {
    text: '#1f2937', textMuted: '#6b7280', textDim: '#9ca3af', headerText: '#111827',
    activeBg: '#e5e7eb', hoverBg: '#f3f4f6', border: '#d1d5db', borderFocus: '#9ca3af',
    controlBg: '#e5e7eb', controlText: '#111827', controlOff: '#9ca3af',
  },
};

/* ═══════════════════════════════════════════
 *  Shortcut data — matches the library's demo
 * ═══════════════════════════════════════════ */
const SHORTCUT_DATA = [
  {
    category: 'ANYWHERE',
    shortcuts: [
      { label: 'Focus the bubbles', keys: ['Tab'] },
      { label: 'Toggle the flock', keys: ['Ctrl', 'K'] },
    ],
  },
  {
    category: 'DOCKED STACK',
    shortcuts: [
      { label: 'Expand the stack', keys: ['Enter'] },
      { label: 'Send to the other edge', keys: ['←', '→'] },
      { label: 'Scoot the stack', keys: ['↑', '↓'] },
      { label: 'Scoot all the way', keys: ['Ctrl', '↑'] },
    ],
  },
  {
    category: 'OPEN ROW',
    shortcuts: [
      { label: 'Move between bubbles', keys: ['←', '→'] },
      { label: 'Open, or collapse the active one', keys: ['Enter'] },
      { label: 'Dismiss the bubble', keys: ['Del'] },
      { label: 'Collapse the row', keys: ['Esc'] },
    ],
  },
];

/* ─── Kbd element ─── */
function Kbd({ children, pal }) {
  return (
    <kbd style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '24px',
      height: '24px',
      padding: '0 6px',
      background: pal.controlBg,
      border: `1px solid ${pal.border}`,
      borderRadius: '5px',
      fontSize: '11px',
      fontWeight: '600',
      fontFamily: 'var(--font-mono, monospace)',
      color: pal.text,
      boxShadow: `0 1px 0 ${pal.border}`,
      lineHeight: 1,
    }}>
      {children}
    </kbd>
  );
}

/* ─── Shortcut Row ─── */
function ShortcutRow({ label, keys, pal, isLast }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: isLast ? 'none' : `1px solid ${pal.border}22`,
    }}>
      <span style={{
        fontSize: '13px',
        color: pal.textMuted,
        fontWeight: '500',
      }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {keys.map((k, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            {i > 0 && (
              <span style={{
                fontSize: '10px',
                color: pal.textDim,
                fontWeight: '600',
              }}>
                +
              </span>
            )}
            <Kbd pal={pal}>{k}</Kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  ShortcutsPanel
 * ═══════════════════════════════════════════ */
export default function ShortcutsPanel() {
  const { resolvedTheme } = useSettings();
  const pal = PALETTES[resolvedTheme] || PALETTES.dark;

  const containerStyle = {
    padding: '20px 16px',
    fontFamily: 'var(--font-main)',
    color: pal.text,
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  };

  return (
    <div style={containerStyle}>
      {/* Title */}
      <div style={{
        fontSize: '15px',
        fontWeight: '700',
        marginBottom: '4px',
        color: pal.text,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        Shortcuts
      </div>

      {/* Subtitle */}
      <div style={{
        fontSize: '11px',
        color: pal.textDim,
        marginBottom: '20px',
      }}>
        Everything works without a mouse
      </div>

      {/* Shortcut categories */}
      {SHORTCUT_DATA.map((cat, catIdx) => (
        <div key={cat.category}>
          {/* Category label */}
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: pal.textDim,
            marginBottom: '8px',
            marginTop: catIdx > 0 ? '4px' : '0',
          }}>
            {cat.category}
          </div>

          {/* Shortcut rows */}
          {cat.shortcuts.map((shortcut, i) => (
            <ShortcutRow
              key={shortcut.label}
              label={shortcut.label}
              keys={shortcut.keys}
              pal={pal}
              isLast={i === cat.shortcuts.length - 1}
            />
          ))}

          {/* Spacer between categories */}
          {catIdx < SHORTCUT_DATA.length - 1 && (
            <div style={{ height: '12px' }} />
          )}
        </div>
      ))}
    </div>
  );
}
