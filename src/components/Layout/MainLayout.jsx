import React, { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import PageNav from './PageNav';
import SeekLadder from './SeekLadder';

export default function MainLayout({ selectedModel, onSelectModel, children }) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return sessionStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const mainRef = useRef(null);

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
