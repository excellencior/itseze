import { useEffect, useRef, useCallback, useState } from 'react';
import { createBubbles } from '@hyperplexed/bubbles';
import { useSettings } from '../../SettingsContext';
import { ACCENT_SWATCHES } from '../../settingsStore';
import { fetchPublishedPages } from '../../lib/pages';

/* ═══════════════════════════════════════════
 *  Theme-aware color palette for panel content
 * ═══════════════════════════════════════════ */
const PALETTES = {
  dark: {
    panelBg:        'transparent',
    text:           '#E8E8E8',
    textMuted:      '#B0B0B0',
    textDim:        '#777',
    headerText:     '#fff',
    activeBg:       '#1f1f1f',
    hoverBg:        '#1a1a1a',
    border:         '#333',
    borderFocus:    '#555',
    controlBg:      '#333',
    controlText:    '#fff',
    controlOff:     '#777',
    inputBg:        'transparent',
    sectionBg:      'transparent',
  },
  light: {
    panelBg:        'transparent',
    text:           '#1f2937',
    textMuted:      '#6b7280',
    textDim:        '#9ca3af',
    headerText:     '#111827',
    activeBg:       '#e5e7eb',
    hoverBg:        '#f3f4f6',
    border:         '#d1d5db',
    borderFocus:    '#9ca3af',
    controlBg:      '#e5e7eb',
    controlText:    '#111827',
    controlOff:     '#9ca3af',
    inputBg:        'transparent',
    sectionBg:      'transparent',
  },
};

/**
 * BubbleNav — floating bubble-based navigation using @hyperplexed/bubbles.
 * Two flocks: Pages (navigation) and Settings (customization).
 */
export default function BubbleNav({ selectedModel, onSelectModel }) {
  const { settings, resolvedTheme, updateSettings, resetSettings } = useSettings();
  const managerRef = useRef(null);
  const pagesContentRef = useRef(null);
  const settingsContentRef = useRef(null);
  const [pages, setPages] = useState([]);
  const mountedRef = useRef(false);

  const pal = PALETTES[resolvedTheme] || PALETTES.dark;

  // Fetch pages on mount
  useEffect(() => {
    fetchPublishedPages()
      .then(setPages)
      .catch(() => setPages([]));
  }, []);

  // ── Build Pages panel DOM ──
  const buildPagesContent = useCallback(() => {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 16px;
      font-family: var(--font-main);
      overflow-y: auto;
      max-height: 100%;
    `;

    // Organize pages into groups
    const architecturePages = [];
    const conceptGroups = {};
    const flatConcepts = [];

    for (const page of pages) {
      const meta = page.current_version?.meta;
      if (!meta) continue;
      const category = (meta.category || '').toLowerCase();
      const item = {
        id: page.id,
        title: meta.title || 'Untitled',
        urlPath: page.url_path,
        isReady: page.status === 'published',
        subcategory: meta.subcategory || null,
      };
      if (category === 'architecture') {
        architecturePages.push(item);
      } else if (category === 'concept' || category === 'concepts') {
        if (item.subcategory) {
          if (!conceptGroups[item.subcategory]) conceptGroups[item.subcategory] = [];
          conceptGroups[item.subcategory].push(item);
        } else {
          flatConcepts.push(item);
        }
      }
    }

    const sortByTitle = (a, b) => a.title.localeCompare(b.title);
    architecturePages.sort(sortByTitle);
    flatConcepts.sort(sortByTitle);
    Object.values(conceptGroups).forEach(g => g.sort(sortByTitle));

    // ── Helper: create a page button ──
    const createPageBtn = (item, fontSize = '13px', gap = '8px', dotSize = '5px') => {
      const btn = document.createElement('button');
      const isActive = selectedModel === item.urlPath;
      btn.style.cssText = `
        width: 100%; padding: 7px 12px; border: none; border-radius: 6px;
        background: ${isActive ? pal.activeBg : 'transparent'};
        color: ${isActive ? settings.accent : pal.textMuted};
        font-size: ${fontSize}; font-weight: ${isActive ? '650' : '500'};
        cursor: pointer; text-align: left; font-family: inherit;
        transition: background 0.15s ease, color 0.15s ease;
        margin-bottom: 1px; display: flex; align-items: center; gap: ${gap};
      `;
      if (isActive) {
        const dot = document.createElement('span');
        dot.style.cssText = `
          width: ${dotSize}; height: ${dotSize}; border-radius: 50%;
          background: ${settings.accent}; flex-shrink: 0;
        `;
        btn.appendChild(dot);
      }
      const text = document.createElement('span');
      text.textContent = item.title;
      text.style.cssText = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      btn.appendChild(text);

      if (!isActive) {
        btn.addEventListener('mouseenter', () => { btn.style.background = pal.hoverBg; btn.style.color = pal.text; });
        btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = pal.textMuted; });
      }

      btn.addEventListener('click', () => {
        if (item.isReady && onSelectModel) {
          onSelectModel(item.urlPath);
          setTimeout(() => {
            if (managerRef.current) {
              try { managerRef.current.configure({ initialState: 'docked' }); } catch { /* */ }
            }
          }, 300);
        }
      });
      return btn;
    };

    // ── Helper: create a section ──
    const createSection = (label, items, isOpen = true) => {
      const section = document.createElement('div');
      section.style.cssText = 'margin-bottom: 8px;';

      const header = document.createElement('button');
      header.style.cssText = `
        width: 100%; display: flex; align-items: center; justify-content: space-between;
        padding: 8px 10px; border: none; border-radius: 6px;
        background: transparent; color: ${pal.headerText}; font-size: 10.5px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
        font-family: inherit; transition: background 0.15s ease;
      `;
      header.textContent = label;
      header.addEventListener('mouseenter', () => { header.style.background = pal.hoverBg; });
      header.addEventListener('mouseleave', () => { header.style.background = 'transparent'; });

      const chevron = document.createElement('span');
      chevron.textContent = '▾';
      chevron.style.cssText = `
        font-size: 12px; transition: transform 0.2s ease;
        transform: ${isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
      `;
      header.appendChild(chevron);

      const list = document.createElement('div');
      list.style.cssText = `
        overflow: hidden; padding: 2px 0;
        max-height: ${isOpen ? '2000px' : '0'};
        opacity: ${isOpen ? '1' : '0'};
        transition: max-height 0.3s ease, opacity 0.25s ease;
      `;

      header.addEventListener('click', () => {
        const nowOpen = list.style.maxHeight === '0px';
        list.style.maxHeight = nowOpen ? '2000px' : '0';
        list.style.opacity = nowOpen ? '1' : '0';
        chevron.style.transform = nowOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
      });

      items.forEach(item => {
        list.appendChild(createPageBtn(item));
      });

      section.appendChild(header);
      section.appendChild(list);
      return section;
    };

    // ── Helper: create subcategory ──
    const createSubcategory = (label, items) => {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'margin-left: 8px; margin-bottom: 4px;';

      const header = document.createElement('button');
      header.style.cssText = `
        width: 100%; display: flex; align-items: center; justify-content: space-between;
        padding: 6px 10px; border: none; border-radius: 6px;
        background: transparent; color: ${pal.textMuted}; font-size: 12.5px; font-weight: 650;
        cursor: pointer; font-family: inherit; transition: background 0.15s ease, color 0.15s ease;
      `;
      header.textContent = label;
      header.addEventListener('mouseenter', () => { header.style.background = pal.hoverBg; header.style.color = pal.text; });
      header.addEventListener('mouseleave', () => { header.style.background = 'transparent'; header.style.color = pal.textMuted; });

      const chevron = document.createElement('span');
      chevron.textContent = '▾';
      chevron.style.cssText = 'font-size: 11px; transition: transform 0.2s ease;';
      header.appendChild(chevron);

      const list = document.createElement('div');
      list.style.cssText = 'overflow: hidden; max-height: 0; opacity: 0; transition: max-height 0.3s ease, opacity 0.25s ease;';

      // Auto-expand if any child is active
      const hasActive = items.some(i => selectedModel === i.urlPath);
      if (hasActive) {
        list.style.maxHeight = '2000px';
        list.style.opacity = '1';
      }

      header.addEventListener('click', () => {
        const nowOpen = list.style.maxHeight === '0px' || list.style.maxHeight === '0';
        list.style.maxHeight = nowOpen ? '2000px' : '0';
        list.style.opacity = nowOpen ? '1' : '0';
        chevron.style.transform = nowOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
      });

      items.forEach(item => {
        list.appendChild(createPageBtn(item, '12.5px', '7px', '4px'));
      });

      wrapper.appendChild(header);
      wrapper.appendChild(list);
      return wrapper;
    };

    // Build sections
    if (architecturePages.length > 0) {
      container.appendChild(createSection('Architecture', architecturePages, true));
    }

    // Concepts with subcategories
    const conceptsSection = document.createElement('div');
    conceptsSection.style.cssText = 'margin-bottom: 8px;';

    const conceptsHeader = document.createElement('button');
    conceptsHeader.style.cssText = `
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border: none; border-radius: 6px;
      background: transparent; color: ${pal.headerText}; font-size: 10.5px; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
      font-family: inherit; transition: background 0.15s ease;
    `;
    conceptsHeader.textContent = 'Concepts';
    conceptsHeader.addEventListener('mouseenter', () => { conceptsHeader.style.background = pal.hoverBg; });
    conceptsHeader.addEventListener('mouseleave', () => { conceptsHeader.style.background = 'transparent'; });

    const conceptsChevron = document.createElement('span');
    conceptsChevron.textContent = '▾';
    conceptsChevron.style.cssText = 'font-size: 12px; transition: transform 0.2s ease;';
    conceptsHeader.appendChild(conceptsChevron);

    const conceptsList = document.createElement('div');
    conceptsList.style.cssText = 'overflow: hidden; max-height: 2000px; opacity: 1; transition: max-height 0.3s ease, opacity 0.25s ease;';

    conceptsHeader.addEventListener('click', () => {
      const nowOpen = conceptsList.style.maxHeight === '0px' || conceptsList.style.maxHeight === '0';
      conceptsList.style.maxHeight = nowOpen ? '2000px' : '0';
      conceptsList.style.opacity = nowOpen ? '1' : '0';
      conceptsChevron.style.transform = nowOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
    });

    // Subcategories
    Object.keys(conceptGroups).sort().forEach(subcat => {
      conceptsList.appendChild(createSubcategory(subcat, conceptGroups[subcat]));
    });

    // Flat concepts
    flatConcepts.forEach(item => {
      conceptsList.appendChild(createPageBtn(item));
    });

    conceptsSection.appendChild(conceptsHeader);
    conceptsSection.appendChild(conceptsList);

    if (Object.keys(conceptGroups).length > 0 || flatConcepts.length > 0) {
      container.appendChild(conceptsSection);
    }

    return container;
  }, [pages, selectedModel, settings.accent, onSelectModel, pal]);

  // ── Build Settings panel DOM ──
  const buildSettingsContent = useCallback(() => {
    const container = document.createElement('div');
    container.style.cssText = `
      padding: 20px 16px;
      font-family: var(--font-main);
      color: ${pal.text};
      overflow-y: auto;
      max-height: 100%;
    `;

    // Title
    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;';
    const titleLeft = document.createElement('div');
    const title = document.createElement('div');
    title.style.cssText = `font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: ${pal.text};`;
    title.textContent = '⚙ Customize';
    const subtitle = document.createElement('div');
    subtitle.style.cssText = `font-size: 11px; color: ${pal.textDim}; margin-top: 2px;`;
    subtitle.textContent = 'Changes apply live';
    titleLeft.appendChild(title);
    titleLeft.appendChild(subtitle);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.cssText = `
      padding: 4px 12px; border: 1px solid ${pal.border}; border-radius: 6px;
      background: transparent; color: ${pal.textDim}; font-size: 11px; font-weight: 600;
      cursor: pointer; font-family: inherit; transition: all 0.15s ease;
    `;
    resetBtn.addEventListener('mouseenter', () => { resetBtn.style.borderColor = pal.borderFocus; resetBtn.style.color = pal.text; });
    resetBtn.addEventListener('mouseleave', () => { resetBtn.style.borderColor = pal.border; resetBtn.style.color = pal.textDim; });
    resetBtn.addEventListener('click', () => {
      resetSettings();
      rebuildSettingsPanel();
    });

    titleRow.appendChild(titleLeft);
    titleRow.appendChild(resetBtn);
    container.appendChild(titleRow);

    // ── Helper: Create setting group ──
    const createGroup = (label) => {
      const group = document.createElement('div');
      group.style.cssText = 'margin-bottom: 16px;';
      const lbl = document.createElement('div');
      lbl.style.cssText = `font-size: 11px; font-weight: 600; color: ${pal.textDim}; margin-bottom: 6px;`;
      lbl.textContent = label;
      group.appendChild(lbl);
      return group;
    };

    // ── Helper: Create segmented control ──
    const createSegmented = (options, currentValue, onChange) => {
      const row = document.createElement('div');
      row.style.cssText = `
        display: flex; border: 1px solid ${pal.border}; border-radius: 8px; overflow: hidden;
      `;
      options.forEach(opt => {
        const btn = document.createElement('button');
        const isActive = opt.value === currentValue;
        btn.style.cssText = `
          flex: 1; padding: 7px 0; border: none;
          background: ${isActive ? pal.controlBg : 'transparent'};
          color: ${isActive ? pal.controlText : pal.controlOff};
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.15s ease;
        `;
        btn.textContent = opt.label;
        btn.addEventListener('click', () => {
          onChange(opt.value);
          // Update button states
          row.querySelectorAll('button').forEach(b => {
            b.style.background = 'transparent';
            b.style.color = pal.controlOff;
          });
          btn.style.background = pal.controlBg;
          btn.style.color = pal.controlText;
        });
        row.appendChild(btn);
      });
      return row;
    };

    // ── Helper: Create slider ──
    const createSlider = (min, max, step, currentValue, unit, onChange) => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; gap: 10px;';
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = typeof currentValue === 'string' ? parseFloat(currentValue) : currentValue;
      slider.style.cssText = `flex: 1; accent-color: ${settings.accent}; cursor: pointer;`;
      const valueLabel = document.createElement('span');
      valueLabel.style.cssText = `font-size: 12px; font-weight: 600; color: ${pal.textMuted}; min-width: 50px; text-align: right;`;
      valueLabel.textContent = `${slider.value}${unit}`;
      slider.addEventListener('input', () => {
        valueLabel.textContent = `${slider.value}${unit}`;
        onChange(parseFloat(slider.value));
      });
      row.appendChild(slider);
      row.appendChild(valueLabel);
      return row;
    };

    // 1. Navigation Mode
    const navGroup = createGroup('Navigation');
    navGroup.appendChild(createSegmented(
      [{ label: 'Sidebar', value: 'sidebar' }, { label: 'Bubble', value: 'bubble' }],
      settings.navMode,
      (val) => updateSettings({ navMode: val })
    ));
    container.appendChild(navGroup);

    // 2. Theme
    const themeGroup = createGroup('Theme');
    themeGroup.appendChild(createSegmented(
      [{ label: 'Auto', value: 'auto' }, { label: 'Dark', value: 'dark' }, { label: 'Light', value: 'light' }],
      settings.theme,
      (val) => updateSettings({ theme: val })
    ));
    container.appendChild(themeGroup);

    // 3. Accent colors
    const accentGroup = createGroup('Accent');
    const swatchRow = document.createElement('div');
    swatchRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: 8px;';
    ACCENT_SWATCHES.forEach(swatch => {
      const btn = document.createElement('button');
      const isActive = settings.accent === swatch.hex;
      btn.style.cssText = `
        width: 28px; height: 28px; border-radius: 50%;
        background: ${swatch.hex};
        border: 2px solid ${isActive ? (resolvedTheme === 'dark' ? '#fff' : '#111') : 'transparent'};
        cursor: pointer; transition: all 0.15s ease;
        box-shadow: ${isActive ? '0 0 0 2px ' + swatch.hex : 'none'};
      `;
      btn.title = swatch.name;
      btn.addEventListener('mouseenter', () => { if (!isActive) btn.style.transform = 'scale(1.15)'; });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });
      btn.addEventListener('click', () => {
        updateSettings({ accent: swatch.hex });
        const ring = resolvedTheme === 'dark' ? '#fff' : '#111';
        swatchRow.querySelectorAll('button').forEach(b => {
          b.style.border = '2px solid transparent';
          b.style.boxShadow = 'none';
        });
        btn.style.border = `2px solid ${ring}`;
        btn.style.boxShadow = `0 0 0 2px ${swatch.hex}`;
        container.querySelectorAll('input[type=range]').forEach(s => {
          s.style.accentColor = swatch.hex;
        });
      });
      swatchRow.appendChild(btn);
    });
    accentGroup.appendChild(swatchRow);
    container.appendChild(accentGroup);

    // 4. Initial dock side
    const sideGroup = createGroup('Initial dock side');
    sideGroup.appendChild(createSegmented(
      [{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }],
      settings.dockSide,
      (val) => {
        updateSettings({ dockSide: val });
        if (managerRef.current) {
          try { managerRef.current.configure({ side: val }); } catch { /* */ }
        }
      }
    ));
    container.appendChild(sideGroup);

    // 5. Dock vertical
    const vertGroup = createGroup('Dock vertical');
    vertGroup.appendChild(createSlider(0, 100, 1, Math.round(settings.dockVertical * 100), '%', (val) => {
      const v = val / 100;
      updateSettings({ dockVertical: v });
      if (managerRef.current) {
        try { managerRef.current.configure({ vertical: v }); } catch { /* */ }
      }
    }));
    container.appendChild(vertGroup);

    // 6. Panel width
    const widthGroup = createGroup('Panel width');
    widthGroup.appendChild(createSlider(280, 800, 10, settings.panelWidth, 'px', (val) => {
      updateSettings({ panelWidth: val });
      if (managerRef.current) {
        try { managerRef.current.configure({ panelWidth: val }); } catch { /* */ }
      }
    }));
    container.appendChild(widthGroup);

    // 7. Panel max height
    const heightGroup = createGroup('Panel max height');
    heightGroup.appendChild(createSlider(30, 100, 5, parseFloat(settings.panelMaxHeight), '%', (val) => {
      const v = `${val}%`;
      updateSettings({ panelMaxHeight: v });
      if (managerRef.current) {
        try { managerRef.current.configure({ panelMaxHeight: v }); } catch { /* */ }
      }
    }));
    container.appendChild(heightGroup);

    // 8. Ricochet
    const ricochetGroup = createGroup('Ricochet');
    ricochetGroup.appendChild(createSlider(0, 100, 1, Math.round(settings.ricochet * 100), '%', (val) => {
      const v = val / 100;
      updateSettings({ ricochet: v });
      if (managerRef.current) {
        try { managerRef.current.configure({ ricochet: v }); } catch { /* */ }
      }
    }));
    container.appendChild(ricochetGroup);

    return container;
  }, [settings, resolvedTheme, updateSettings, resetSettings, pal]);

  const rebuildSettingsPanel = useCallback(() => {
    if (!managerRef.current) return;
    const newContent = buildSettingsContent();
    settingsContentRef.current = newContent;
    managerRef.current.add({
      id: 'settings',
      label: 'Settings',
      icon: createSettingsIcon(),
      content: newContent,
    });
  }, [buildSettingsContent]);

  // ── Create SVG icons ──
  function createPagesIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>';
    return svg;
  }

  function createSettingsIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.innerHTML = '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>';
    return svg;
  }

  // ── Initialize / reinitialize the bubble manager ──
  useEffect(() => {
    if (settings.navMode !== 'bubble') {
      // Destroy manager when not in bubble mode
      if (managerRef.current) {
        try { managerRef.current.destroy(); } catch { /* */ }
        managerRef.current = null;
      }
      return;
    }

    // Small delay to avoid init during first render
    const timer = setTimeout(() => {
      if (managerRef.current) {
        try { managerRef.current.destroy(); } catch { /* */ }
        managerRef.current = null;
      }

      const manager = createBubbles({
        theme: resolvedTheme === 'light' ? 'light' : 'dark',
        colors: {
          bubbleSurface: resolvedTheme === 'light' ? '#ffffff' : '#000000',
          bubbleIcon: settings.accent,
        },
        side: settings.dockSide,
        vertical: settings.dockVertical,
        panelWidth: settings.panelWidth,
        panelMaxHeight: settings.panelMaxHeight,
        maxBubbles: 5,
        ricochet: settings.ricochet,
        initialState: 'docked',
      });

      managerRef.current = manager;

      // Add Pages bubble
      const pagesContent = buildPagesContent();
      pagesContentRef.current = pagesContent;
      manager.add({
        id: 'pages',
        label: 'Pages',
        icon: createPagesIcon(),
        content: pagesContent,
      });

      // Add Settings bubble
      const settingsContent = buildSettingsContent();
      settingsContentRef.current = settingsContent;
      manager.add({
        id: 'settings',
        label: 'Settings',
        icon: createSettingsIcon(),
        content: settingsContent,
      });

      mountedRef.current = true;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (managerRef.current) {
        try { managerRef.current.destroy(); } catch { /* */ }
        managerRef.current = null;
      }
    };
  }, [settings.navMode]); // Only re-create on mode change

  // ── Update bubble theme when resolvedTheme or accent changes ──
  useEffect(() => {
    if (!managerRef.current || settings.navMode !== 'bubble') return;

    // Update the library's own surfaces (panel bg, bubble fill, etc.)
    try {
      managerRef.current.configure({
        theme: resolvedTheme === 'light' ? 'light' : 'dark',
        colors: {
          bubbleSurface: resolvedTheme === 'light' ? '#ffffff' : '#000000',
          bubbleIcon: settings.accent,
        },
      });
    } catch { /* */ }

    // Rebuild panel content with updated palette colors
    const newPages = buildPagesContent();
    pagesContentRef.current = newPages;
    try {
      managerRef.current.add({
        id: 'pages',
        label: 'Pages',
        icon: createPagesIcon(),
        content: newPages,
      });
    } catch { /* */ }

    const newSettings = buildSettingsContent();
    settingsContentRef.current = newSettings;
    try {
      managerRef.current.add({
        id: 'settings',
        label: 'Settings',
        icon: createSettingsIcon(),
        content: newSettings,
      });
    } catch { /* */ }
  }, [resolvedTheme, settings.accent, buildPagesContent, buildSettingsContent]);

  // Update pages content when pages or selectedModel changes
  useEffect(() => {
    if (!managerRef.current || settings.navMode !== 'bubble') return;
    const newContent = buildPagesContent();
    pagesContentRef.current = newContent;
    try {
      managerRef.current.add({
        id: 'pages',
        label: 'Pages',
        icon: createPagesIcon(),
        content: newContent,
      });
    } catch { /* */ }
  }, [pages, selectedModel, buildPagesContent]);

  // This component renders nothing — the bubbles library manages its own DOM
  return null;
}
