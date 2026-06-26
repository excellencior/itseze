import React, { useState, useCallback, useRef, useEffect } from 'react';
import PageNav from './PageNav';
import SeekLadder from './SeekLadder';
import Logo from './Logo';
import BubbleNav from './BubbleNav';
import { getRouteHeaderInfo } from '../../navigation';
import { useSettings } from '../../SettingsContext';

export default function MainLayout({ selectedModel, onSelectModel, children, isAdminMode = false, onCreateNewPage }) {
  const { settings, resolvedTheme, updateSettings } = useSettings();
  const containerRef = useRef(null);
  const mainRef = useRef(null);
  const bubbleRef = useRef(null);

  const headerInfo = getRouteHeaderInfo(selectedModel);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Automatically hide hardcoded page category headers in existing page content using a MutationObserver
  useEffect(() => {
    if (!mainRef.current) return;

    const hideHeader = () => {
      const h1s = mainRef.current.querySelectorAll('h1');
      h1s.forEach(h1 => {
        const parent = h1.parentElement;
        if (!parent) return;
        const siblings = Array.from(parent.children);
        const idx = siblings.indexOf(h1);
        if (idx > 0) {
          for (let i = 0; i < idx; i++) {
            const sib = siblings[i];
            if (sib.tagName === 'DIV') {
              const text = sib.textContent.trim().toLowerCase();
              const style = window.getComputedStyle(sib);
              const isUpperCase = style.textTransform === 'uppercase' || sib.style.textTransform === 'uppercase';
              const isSmallFont = parseInt(style.fontSize, 10) <= 12;
              const isFlex = style.display === 'flex' || style.display === 'inline-flex';
              
              if (
                text === 'concept' ||
                text === 'prompting' ||
                text === 'reasoning' ||
                text === 'topic overview' ||
                text.includes('·') ||
                isUpperCase ||
                isSmallFont ||
                isFlex
              ) {
                sib.style.setProperty('display', 'none', 'important');
              }
            }
          }
        }
      });
    };

    // Run immediately
    hideHeader();

    // Observe changes inside the main element to catch late-rendered headers
    const observer = new MutationObserver(hideHeader);
    observer.observe(mainRef.current, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [selectedModel]);

  useEffect(() => {
    if (mainRef.current) {
      const savedScroll = sessionStorage.getItem(`scroll-pos-${selectedModel}`);
      if (savedScroll) {
        mainRef.current.scrollTop = parseInt(savedScroll, 10);
      } else {
        mainRef.current.scrollTop = 0;
      }
    }
  }, [selectedModel]);

  const handleScroll = (e) => {
    sessionStorage.setItem(`scroll-pos-${selectedModel}`, e.target.scrollTop);
  };

  /** Navigate to the default home page */
  const handleNavigateHome = useCallback(() => {
    onSelectModel?.('/');
  }, [onSelectModel]);

  /* ═══════════════════════════════════════════
   *  Global Keyboard Shortcuts
   * ═══════════════════════════════════════════ */
  useEffect(() => {
    const IS_MAC = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

    const handler = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;

      const mod = IS_MAC ? e.metaKey : e.ctrlKey;

      // Ctrl+K → toggle flock / restore dismissed
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (bubbleRef.current) {
          // If there are dismissed bubbles, restore them first
          const restored = bubbleRef.current.restoreDismissed();
          if (!restored) {
            bubbleRef.current.toggle();
          }
        }
        return;
      }

      // Ctrl+Shift+D → toggle theme
      if (mod && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        updateSettings({ theme: resolvedTheme === 'dark' ? 'light' : 'dark' });
        return;
      }

      // Home → scroll to top
      if (e.key === 'Home' && !mod && !e.shiftKey) {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // End → scroll to bottom
      if (e.key === 'End' && !mod && !e.shiftKey) {
        if (mainRef.current) mainRef.current.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' });
        return;
      }

      // J → next section
      if (e.key === 'j' && !mod && !e.shiftKey) {
        if (!mainRef.current) return;
        const sections = mainRef.current.querySelectorAll('[data-section]');
        const scrollTop = mainRef.current.scrollTop;
        for (const sec of sections) {
          if (sec.offsetTop > scrollTop + 40) {
            sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
        return;
      }

      // K → previous section (only when not in a modifier combo)
      if (e.key === 'k' && !mod && !e.shiftKey) {
        if (!mainRef.current) return;
        const sections = [...mainRef.current.querySelectorAll('[data-section]')];
        const scrollTop = mainRef.current.scrollTop;
        for (let i = sections.length - 1; i >= 0; i--) {
          if (sections[i].offsetTop < scrollTop - 10) {
            sections[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [resolvedTheme, updateSettings]);

  // Dynamic container background based on theme — uses CSS vars from settingsStore
  const contentBg = resolvedTheme === 'dark' ? '#161616' : '#FAFAF8';
  const outerBg = resolvedTheme === 'dark' ? '#0A0A0A' : '#D6D3CC';

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      padding: '12px',
      backgroundColor: outerBg,
      fontFamily: 'var(--font-main)',
      boxSizing: 'border-box',
      transition: 'background-color 0.3s ease',
    }}>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          backgroundColor: contentBg,
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: resolvedTheme === 'dark' ? '0 0 40px rgba(0,0,0,0.5)' : '0 0 40px rgba(0,0,0,0.15)',
          transition: 'background-color 0.3s ease',
        }}
      >
        <main 
          ref={mainRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '40px 4%' }}
        >
            {/* Logo — hidden on landing page */}
            {selectedModel !== '__home__' && <Logo onNavigateHome={handleNavigateHome} />}

            {/* Dynamic category / date header */}
            {headerInfo && (headerInfo.category || headerInfo.firstPublishedAt) && (
              <div style={
                (selectedModel && selectedModel.startsWith('__pub__'))
                  ? { maxWidth: '800px', margin: '0 auto', padding: '0 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
                  : { width: '80%', maxWidth: '1200px', margin: '0 auto', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
              }>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-light)',
                }}>
                  {headerInfo.subcategory 
                    ? `${headerInfo.category} · ${headerInfo.subcategory}`
                    : headerInfo.category
                  }
                </div>
                {headerInfo.firstPublishedAt && (
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--text-light)',
                    display: 'flex',
                    gap: '12px',
                    letterSpacing: '0.01em',
                  }}>
                    <span>Published {formatDate(headerInfo.firstPublishedAt)}</span>
                    {headerInfo.publishedAt && headerInfo.publishedAt !== headerInfo.firstPublishedAt && (
                      <span>· Updated {formatDate(headerInfo.publishedAt)}</span>
                    )}
                  </div>
                )}
              </div>
            )}
            {children}
            {/* PageNav — hidden on landing page */}
            {selectedModel !== '__home__' && (
              <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
                <PageNav currentRoute={selectedModel} onNavigate={onSelectModel} />
              </div>
            )}
            <SeekLadder scrollContainerRef={mainRef} />
        </main>
      </div>

      {/* Bubble navigation */}
      <BubbleNav
        ref={bubbleRef}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />
    </div>
  );
}
