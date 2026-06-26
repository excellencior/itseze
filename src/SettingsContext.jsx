import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getSettings,
  updateSettings as storeUpdate,
  resetSettings as storeReset,
  applyAccentToCSS,
  applyThemeToDOM,
  resolveTheme,
} from './settingsStore';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => getSettings());

  // Apply accent + theme on mount
  useEffect(() => {
    applyAccentToCSS(settings.accent);
    applyThemeToDOM(settings.theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for prefers-color-scheme changes when theme is 'auto'
  useEffect(() => {
    if (settings.theme !== 'auto') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeToDOM('auto');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [settings.theme]);

  const updateSettingsWrapped = useCallback((partial) => {
    const next = storeUpdate(partial);
    setSettings(next);

    // Side-effects
    if (partial.accent !== undefined) {
      applyAccentToCSS(next.accent);
    }
    if (partial.theme !== undefined) {
      applyThemeToDOM(next.theme);
    }

    return next;
  }, []);

  const resetSettingsWrapped = useCallback(() => {
    const defaults = storeReset();
    setSettings(defaults);
    applyAccentToCSS(defaults.accent);
    applyThemeToDOM(defaults.theme);
    return defaults;
  }, []);

  /** Get the currently resolved theme ('dark' or 'light') */
  const resolvedTheme = resolveTheme(settings.theme);

  return (
    <SettingsContext.Provider value={{
      settings,
      resolvedTheme,
      updateSettings: updateSettingsWrapped,
      resetSettings: resetSettingsWrapped,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
