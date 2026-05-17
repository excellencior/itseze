import React, { useState, useEffect, useRef, useCallback } from 'react';
import MainLayout from './components/Layout/MainLayout';
import GPT3Course from './pages/GPT3Course';
import ActivationFunctionsPage from './pages/concepts/ActivationFunctionsPage';
import AttentionPage from './pages/concepts/AttentionPage';
import EncoderPage from './pages/concepts/EncoderPage';
import SpeculativeDecodingPage from './pages/concepts/SpeculativeDecodingPage';

// ── Route mapping: internal key ↔ URL path ──
const ROUTE_MAP = {
  'gpt3': '/gpt3',
  'concept:activation-functions': '/concepts/activation-functions',
  'concept:attention': '/concepts/attention',
  'concept:encoder': '/concepts/encoder',
  'concept:speculative-decoding': '/concepts/speculative-decoding',
};

const PATH_TO_KEY = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([key, path]) => [path, key])
);

function getKeyFromURL() {
  const path = window.location.pathname;
  return PATH_TO_KEY[path] || 'gpt3';
}

function App() {
  const [selectedModel, setSelectedModel] = useState(() => {
    // URL takes priority, then sessionStorage fallback
    const fromURL = getKeyFromURL();
    if (window.location.pathname !== '/' && PATH_TO_KEY[window.location.pathname]) {
      return fromURL;
    }
    return sessionStorage.getItem('itseze-active-page') || 'gpt3';
  });

  const isInitialMount = useRef(true);

  // On page selection change, update URL and sessionStorage
  useEffect(() => {
    sessionStorage.setItem('itseze-active-page', selectedModel);

    const targetPath = ROUTE_MAP[selectedModel] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: selectedModel }, '', targetPath);
    }

    // On page change, clear the hash
    if (!isInitialMount.current) {
      window.history.replaceState(
        { page: selectedModel },
        '',
        targetPath
      );
    }
    isInitialMount.current = false;
  }, [selectedModel]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const key = getKeyFromURL();
      setSelectedModel(key);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ── Section hash tracking via Intersection Observer ──
  const observerRef = useRef(null);

  const setupHashTracking = useCallback(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Wait for DOM to settle
    setTimeout(() => {
      const sectionEls = Array.from(document.querySelectorAll('[data-section]'));

      if (sectionEls.length === 0) return;

      const visibleSections = new Map();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              visibleSections.set(entry.target.id, entry.intersectionRatio);
            } else {
              visibleSections.delete(entry.target.id);
            }
          });

          // Pick the first visible section (topmost)
          if (visibleSections.size > 0) {
            // Get sections in DOM order
            const ordered = sectionEls
              .filter(el => visibleSections.has(el.id))
              .map(el => el.id);

            if (ordered.length > 0) {
              const topSection = ordered[0];
              const currentHash = window.location.hash.slice(1);
              if (currentHash !== topSection) {
                window.history.replaceState(
                  null,
                  '',
                  `${window.location.pathname}#${topSection}`
                );
              }
            }
          }
        },
        { threshold: 0, rootMargin: '-10% 0px -80% 0px' }
      );

      sectionEls.forEach(el => observerRef.current.observe(el));
    }, 300);
  }, []);

  // Set up observer whenever page changes
  useEffect(() => {
    setupHashTracking();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [selectedModel, setupHashTracking]);

  // On initial load, scroll to hash if present
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }

    // Set initial URL if on root
    if (window.location.pathname === '/') {
      const targetPath = ROUTE_MAP[selectedModel] || '/';
      window.history.replaceState({ page: selectedModel }, '', targetPath);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderContent = () => {
    switch (selectedModel) {
      case 'gpt3':
        return <GPT3Course />;
      case 'concept:activation-functions':
        return <ActivationFunctionsPage />;
      case 'concept:attention':
        return <AttentionPage />;
      case 'concept:encoder':
        return <EncoderPage />;
      case 'concept:speculative-decoding':
        return <SpeculativeDecodingPage />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Under Construction</h2>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>This page is currently being built.</p>
          </div>
        );
    }
  };

  return (
    <MainLayout selectedModel={selectedModel} onSelectModel={setSelectedModel}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
