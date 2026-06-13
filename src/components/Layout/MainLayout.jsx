import React, { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import PageNav from './PageNav';
import SeekLadder from './SeekLadder';
import { getRouteHeaderInfo } from '../../navigation';

export default function MainLayout({ selectedModel, onSelectModel, children }) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return sessionStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const mainRef = useRef(null);

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

  // Automatically hide hardcoded page category headers in existing page content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mainRef.current) return;
      
      const h1 = mainRef.current.querySelector('h1');
      if (!h1) return;

      const headerContainer = h1.parentElement;
      if (!headerContainer) return;

      const siblings = Array.from(headerContainer.children);
      const h1Index = siblings.indexOf(h1);
      if (h1Index > 0) {
        for (let i = 0; i < h1Index; i++) {
          const sib = siblings[i];
          if (sib.tagName === 'DIV') {
            const style = window.getComputedStyle(sib);
            const isUpperCase = style.textTransform === 'uppercase';
            const isSmallFont = parseInt(style.fontSize, 10) <= 12;
            const isFlex = style.display === 'flex' || style.display === 'inline-flex';
            
            const lowerText = sib.textContent.trim().toLowerCase();
            const isCategoryText = lowerText === 'concept' || 
                                   lowerText === 'prompting' || 
                                   lowerText === 'reasoning' || 
                                   lowerText === 'topic overview' ||
                                   lowerText.includes('·');

            if (isUpperCase || isSmallFont || isFlex || isCategoryText) {
              sib.style.display = 'none';
            }
          }
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedModel]);

  /* ── Persist collapsed state ── */
  useEffect(() => {
    sessionStorage.setItem('sidebar-collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

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

  const handleMouseDown = useCallback((e) => {
    if (sidebarCollapsed) return;
    e.preventDefault();
    setIsResizing(true);
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      setSidebarWidth(Math.min(500, Math.max(200, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const toggleCollapse = () => setSidebarCollapsed(prev => !prev);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      padding: '12px',
      backgroundColor: '#111',
      fontFamily: 'var(--font-main)',
      boxSizing: 'border-box',
    }}>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          backgroundColor: '#F6F6F6',
          overflow: 'hidden',
          borderRadius: '12px',
          boxShadow: '0 0 40px rgba(0,0,0,0.4)',
        }}
      >
        <Sidebar
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
          width={sidebarWidth}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Resize handle — only when sidebar is expanded */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              width: '5px',
              cursor: 'col-resize',
              background: 'transparent',
              flexShrink: 0,
              zIndex: 20,
            }}
          />
        )}
        
        <main 
          ref={mainRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '40px 4%' }}
        >
            {/* Toggle button when sidebar is collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={toggleCollapse}
                aria-label="Open sidebar"
                style={{
                  position: 'fixed',
                  left: '24px',
                  top: '24px',
                  zIndex: 100,
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#555',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0891B2';
                  e.currentTarget.style.color = '#0891B2';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(8,145,178,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E0E0E0';
                  e.currentTarget.style.color = '#555';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                ☰
              </button>
            )}
            {/* Dynamic category / date header */}
            {headerInfo && (headerInfo.category || headerInfo.firstPublishedAt) && (
              <div style={
                selectedModel.startsWith('__pub__') 
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
            <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
              <PageNav currentRoute={selectedModel} onNavigate={onSelectModel} />
            </div>
            <SeekLadder scrollContainerRef={mainRef} />
        </main>
      </div>
    </div>
  );
}
