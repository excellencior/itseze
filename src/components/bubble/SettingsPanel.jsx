import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../SettingsContext';
import { ACCENT_SWATCHES } from '../../settingsStore';

/* ═══════════════════════════════════════════
 *  Redesigned SettingsPanel — matches the
 *  original @hyperplexed/bubbles Customize UI
 * ═══════════════════════════════════════════ */

/* ─── SettingGroup — label sits above the control ─── */
function SettingGroup({ label, pal, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '13px',
        fontWeight: '500',
        color: pal.label,
        marginBottom: '8px',
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

/* ─── SegmentedControl — pill-style like original ─── */
function SegmentedControl({ options, value, onChange, pal }) {
  return (
    <div style={{
      display: 'flex',
      borderRadius: '10px',
      background: pal.segBg,
      padding: '3px',
      gap: '2px',
    }}>
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '8px 0',
              border: 'none',
              borderRadius: '8px',
              background: isActive ? pal.segActive : 'transparent',
              color: isActive ? pal.segActiveText : pal.segText,
              fontSize: '13px',
              fontWeight: isActive ? '600' : '500',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.18s ease',
              boxShadow: isActive ? pal.segShadow : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Custom Range Slider — dual-tone track like original ─── */
function Slider({ min, max, step, value: propValue, unit, onChange, pal }) {
  const [localValue, setLocalValue] = useState(propValue);
  const latestRef = useRef(propValue);
  const trackRef = useRef(null);

  useEffect(() => {
    setLocalValue(propValue);
    latestRef.current = propValue;
  }, [propValue]);

  const handleInput = (e) => {
    const val = parseFloat(e.target.value);
    setLocalValue(val);
    latestRef.current = val;
  };

  const handleCommit = () => {
    onChange(latestRef.current);
  };

  const pct = ((localValue - min) / (max - min)) * 100;

  return (
    <div style={{ position: 'relative' }}>
      {/* Track background — dual tone */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: '6px',
        borderRadius: '3px',
        transform: 'translateY(-50%)',
        background: `linear-gradient(to right, ${pal.sliderFilled} ${pct}%, ${pal.sliderTrack} ${pct}%)`,
        pointerEvents: 'none',
      }} />
      <input
        ref={trackRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={handleInput}
        onPointerUp={handleCommit}
        onKeyUp={handleCommit}
        style={{
          width: '100%',
          height: '24px',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}
      />
      <style>{`
        .settings-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: ${pal.sliderThumb};
          border: 2px solid ${pal.sliderThumbBorder};
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        .settings-slider::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%; border: none;
          background: ${pal.sliderThumb};
          border: 2px solid ${pal.sliderThumbBorder};
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        .settings-slider::-webkit-slider-runnable-track {
          background: transparent; height: 6px;
        }
        .settings-slider::-moz-range-track {
          background: transparent; height: 6px;
        }
      `}</style>
    </div>
  );
}

/* ─── Accent Swatch ─── */
function SwatchButton({ swatch, isActive, pal, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      title={swatch.name}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        padding: 0,
        border: `2.5px solid ${isActive ? pal.swatchRing : 'transparent'}`,
        background: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: hovered && !isActive ? 'scale(1.12)' : 'scale(1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: swatch.hex,
        display: 'block',
        boxShadow: isActive ? `0 0 0 1px ${pal.swatchRing}` : 'none',
      }} />
    </button>
  );
}

/* ═══════════════════════════════════════════
 *  Theme-aware palettes
 * ═══════════════════════════════════════════ */
const PALETTES = {
  light: {
    bg: '#ffffff',
    text: '#1a1a1a',
    label: '#555555',
    subtitle: '#999999',
    resetBorder: '#e0e0e0',
    resetText: '#666',
    resetHoverBorder: '#bbb',
    resetHoverText: '#333',
    // Segmented
    segBg: '#f0f0f0',
    segActive: '#ffffff',
    segActiveText: '#1a1a1a',
    segText: '#888',
    segShadow: '0 1px 3px rgba(0,0,0,0.08)',
    // Slider
    sliderFilled: '#1a1a1a',
    sliderTrack: '#e0e0e0',
    sliderThumb: '#ffffff',
    sliderThumbBorder: '#d0d0d0',
    // Swatch
    swatchRing: '#1a1a1a',
  },
  dark: {
    bg: '#1c1c1e',
    text: '#f0f0f0',
    label: '#999',
    subtitle: '#666',
    resetBorder: '#444',
    resetText: '#999',
    resetHoverBorder: '#666',
    resetHoverText: '#eee',
    // Segmented
    segBg: '#2a2a2c',
    segActive: '#3a3a3c',
    segActiveText: '#f0f0f0',
    segText: '#777',
    segShadow: '0 1px 3px rgba(0,0,0,0.3)',
    // Slider
    sliderFilled: '#f0f0f0',
    sliderTrack: '#3a3a3c',
    sliderThumb: '#f0f0f0',
    sliderThumbBorder: '#888',
    // Swatch
    swatchRing: '#f0f0f0',
  },
};

/* ═══════════════════════════════════════════
 *  SettingsPanel
 * ═══════════════════════════════════════════ */
export default function SettingsPanel({ onConfigure }) {
  const { settings, resolvedTheme, updateSettings, resetSettings } = useSettings();
  const pal = PALETTES[resolvedTheme] || PALETTES.dark;
  const [resetHovered, setResetHovered] = useState(false);

  // Give all range inputs the custom class
  useEffect(() => {
    const inputs = document.querySelectorAll('.settings-panel-root input[type="range"]');
    inputs.forEach(el => el.classList.add('settings-slider'));
  });

  return (
    <div className="settings-panel-root" style={{
      padding: '24px 20px',
      fontFamily: 'var(--font-main)',
      color: pal.text,
      overflowY: 'auto',
      flex: 1,
      minHeight: 0,
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {/* Icon */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: pal.segBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
            stroke={pal.label} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>

        {/* Title */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: pal.text }}>
            Customize
          </div>
          <div style={{ fontSize: '12px', color: pal.subtitle, marginTop: '1px' }}>
            Changes apply live
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={() => resetSettings()}
          onMouseEnter={() => setResetHovered(true)}
          onMouseLeave={() => setResetHovered(false)}
          style={{
            padding: '5px 14px',
            border: `1px solid ${resetHovered ? pal.resetHoverBorder : pal.resetBorder}`,
            borderRadius: '8px',
            background: 'transparent',
            color: resetHovered ? pal.resetHoverText : pal.resetText,
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s ease',
          }}
        >
          Reset
        </button>
      </div>

      {/* ── Divider ── */}
      <hr style={{ border: 'none', borderTop: `1px solid ${pal.segBg}`, margin: '0 0 20px' }} />

      {/* ── Theme ── */}
      <SettingGroup label="Theme" pal={pal}>
        <SegmentedControl
          options={[
            { label: 'Auto', value: 'auto' },
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
          ]}
          value={settings.theme}
          onChange={(val) => updateSettings({ theme: val })}
          pal={pal}
        />
      </SettingGroup>

      {/* ── Accent ── */}
      <SettingGroup label="Accent" pal={pal}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {ACCENT_SWATCHES.map(swatch => (
            <SwatchButton
              key={swatch.hex}
              swatch={swatch}
              isActive={settings.accent === swatch.hex}
              pal={pal}
              onClick={() => {
                updateSettings({ accent: swatch.hex });
                onConfigure?.({}, { accent: swatch.hex });
              }}
            />
          ))}
        </div>
      </SettingGroup>

      {/* ── Dock Side ── */}
      <SettingGroup label="Initial dock side" pal={pal}>
        <SegmentedControl
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
          ]}
          value={settings.dockSide}
          onChange={(val) => {
            updateSettings({ dockSide: val });
            onConfigure?.({ side: val });
          }}
          pal={pal}
        />
      </SettingGroup>

      {/* ── Dock Vertical ── */}
      <SettingGroup label={<SliderLabel text="Dock vertical" value={`${Math.round(settings.dockVertical * 100)}%`} pal={pal} />} pal={{ label: 'transparent' }}>
        <Slider
          min={0} max={100} step={1}
          value={Math.round(settings.dockVertical * 100)}
          unit="%"
          pal={pal}
          onChange={(val) => {
            const v = val / 100;
            updateSettings({ dockVertical: v });
            onConfigure?.({ vertical: v });
          }}
        />
      </SettingGroup>

      {/* ── Panel Width ── */}
      <SettingGroup label={<SliderLabel text="Panel width" value={`${settings.panelWidth}px`} pal={pal} />} pal={{ label: 'transparent' }}>
        <Slider
          min={280} max={800} step={10}
          value={settings.panelWidth}
          unit="px"
          pal={pal}
          onChange={(val) => {
            updateSettings({ panelWidth: val });
            onConfigure?.({ panelWidth: val });
          }}
        />
      </SettingGroup>

      {/* ── Panel Max Height ── */}
      <SettingGroup label={<SliderLabel text="Panel max height" value={`${parseFloat(settings.panelMaxHeight)}%`} pal={pal} />} pal={{ label: 'transparent' }}>
        <Slider
          min={30} max={100} step={5}
          value={parseFloat(settings.panelMaxHeight)}
          unit="%"
          pal={pal}
          onChange={(val) => {
            const v = `${val}%`;
            updateSettings({ panelMaxHeight: v });
            onConfigure?.({ panelMaxHeight: v });
          }}
        />
      </SettingGroup>

      {/* ── Ricochet ── */}
      <SettingGroup label={<SliderLabel text="Ricochet" value={`${Math.round(settings.ricochet * 100)}%`} pal={pal} />} pal={{ label: 'transparent' }}>
        <Slider
          min={0} max={100} step={1}
          value={Math.round(settings.ricochet * 100)}
          unit="%"
          pal={pal}
          onChange={(val) => {
            const v = val / 100;
            updateSettings({ ricochet: v });
            onConfigure?.({ ricochet: v });
          }}
        />
      </SettingGroup>
    </div>
  );
}

/* ─── Slider label with value on the right ─── */
function SliderLabel({ text, value, pal }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      fontWeight: '500',
      color: pal.label,
    }}>
      <span>{text}</span>
      <span style={{ fontWeight: '600', color: pal.text, fontSize: '13px' }}>{value}</span>
    </div>
  );
}
