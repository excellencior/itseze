import React, { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import PageNav from './PageNav';

export default function MainLayout({ selectedModel, onSelectModel, children }) {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);
  const mainRef = useRef(null);

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
    e.preventDefault();
    setIsResizing(true);
  }, []);

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

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      padding: '12px',
      backgroundColor: '#111',
      fontFamily: '"Google Sans", "Roboto", sans-serif',
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
        <Sidebar selectedModel={selectedModel} onSelectModel={onSelectModel} width={sidebarWidth} />

        {/* Resize handle */}
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
        
        <main 
          ref={mainRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '40px 4%' }}
        >
            {children}
            <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
              <PageNav currentRoute={selectedModel} onNavigate={onSelectModel} />
            </div>
        </main>
      </div>
    </div>
  );
}
