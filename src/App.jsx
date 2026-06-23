import { useState, useEffect, useRef, useCallback } from 'react';
import MainLayout from './components/Layout/MainLayout';
import GPT3Course from './pages/GPT3Course';
import ActivationFunctionsPage from './pages/concepts/ActivationFunctionsPage';
import AttentionPage from './pages/concepts/AttentionPage';
import EncoderPage from './pages/concepts/EncoderPage';
import SpeculativeDecodingPage from './pages/concepts/SpeculativeDecodingPage';
import SSMPage from './pages/concepts/SSMPage';

// Reasoning Pages
import SymbolicPage from './pages/reasoning/SymbolicPage';
import ProbabilisticPage from './pages/reasoning/ProbabilisticPage';
import NeuralPage from './pages/reasoning/NeuralPage';
import NeuroSymbolicPage from './pages/reasoning/NeuroSymbolicPage';
import ChainOfThoughtPage from './pages/reasoning/ChainOfThoughtPage';
import RagPage from './pages/reasoning/RagPage';
import ProgramSynthesisPage from './pages/reasoning/ProgramSynthesisPage';

// Prompting Pages
import ZeroShotPage from './pages/prompting/ZeroShotPage';
import FewShotPage from './pages/prompting/FewShotPage';
import COTPage from './pages/prompting/COTPage';
import ZeroCOTPage from './pages/prompting/ZeroCOTPage';
import LeastToMostPage from './pages/prompting/LeastToMostPage';
import SelfConsistencyPage from './pages/prompting/SelfConsistencyPage';

// Admin
import EditorPage from './pages/admin/EditorPage';
import PublishedPage from './pages/admin/PublishedPage';

// ── Route mapping: internal key ↔ URL path ──
const ROUTE_MAP = {
  'gpt3': '/gpt3',
  'concept:activation-functions': '/concepts/activation-functions',
  'concept:attention': '/concepts/attention',
  'concept:encoder': '/concepts/encoder',
  'concept:speculative-decoding': '/concepts/speculative-decoding',
  'concept:ssm': '/concepts/ssm',
  'concept:reasoning-symbolic': '/concepts/reasoning/symbolic',
  'concept:reasoning-probabilistic': '/concepts/reasoning/probabilistic',
  'concept:reasoning-neural': '/concepts/reasoning/neural',
  'concept:reasoning-neuro-symbolic': '/concepts/reasoning/neuro-symbolic',
  'concept:reasoning-chain-of-thought': '/concepts/reasoning/chain-of-thought',
  'concept:reasoning-rag': '/concepts/reasoning/rag',
  'concept:reasoning-program-synthesis': '/concepts/reasoning/program-synthesis',
  'concept:prompting-zero-shot': '/concepts/prompting/zero-shot',
  'concept:prompting-few-shot': '/concepts/prompting/few-shot',
  'concept:prompting-cot': '/concepts/prompting/cot',
  'concept:prompting-zero-cot': '/concepts/prompting/zero-cot',
  'concept:prompting-ltm': '/concepts/prompting/least-to-most',
  'concept:prompting-sc': '/concepts/prompting/self-consistency',
};

const PATH_TO_KEY = Object.fromEntries(
  Object.entries(ROUTE_MAP).map(([key, path]) => [path, key])
);

function getPublishedPages() {
  try { return JSON.parse(localStorage.getItem('itseze-published') || '{}'); } catch { return {}; }
}

function getKeyFromURL() {
  const path = window.location.pathname;
  if (path === '/admin/editor') return '__editor__';
  if (PATH_TO_KEY[path]) return PATH_TO_KEY[path];
  // Check if it's a published page
  const published = getPublishedPages();
  if (published[path]) return `__pub__${path}`;
  return 'gpt3';
}

function App() {
  const [selectedModel, setSelectedModel] = useState(() => {
    // URL takes priority, then sessionStorage fallback
    const fromURL = getKeyFromURL();
    if (fromURL === '__editor__' || fromURL.startsWith('__pub__')) return fromURL;
    if (window.location.pathname !== '/' && PATH_TO_KEY[window.location.pathname]) {
      return fromURL;
    }
    return sessionStorage.getItem('itseze-active-page') || 'gpt3';
  });

  const isInitialMount = useRef(true);

  // On page selection change, update URL and sessionStorage
  useEffect(() => {
    // Don't touch URL when on the editor page or a published page
    if (!selectedModel || selectedModel === '__editor__' || selectedModel.startsWith('__pub__')) return;

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
      case 'concept:ssm':
        return <SSMPage />;
      case 'concept:reasoning-symbolic':
        return <SymbolicPage />;
      case 'concept:reasoning-probabilistic':
        return <ProbabilisticPage />;
      case 'concept:reasoning-neural':
        return <NeuralPage />;
      case 'concept:reasoning-neuro-symbolic':
        return <NeuroSymbolicPage />;
      case 'concept:reasoning-chain-of-thought':
        return <ChainOfThoughtPage />;
      case 'concept:reasoning-rag':
        return <RagPage />;
      case 'concept:reasoning-program-synthesis':
        return <ProgramSynthesisPage />;
      case 'concept:prompting-zero-shot':
        return <ZeroShotPage />;
      case 'concept:prompting-few-shot':
        return <FewShotPage />;
      case 'concept:prompting-cot':
        return <COTPage />;
      case 'concept:prompting-zero-cot':
        return <ZeroCOTPage />;
      case 'concept:prompting-ltm':
        return <LeastToMostPage />;
      case 'concept:prompting-sc':
        return <SelfConsistencyPage />;
      default: {
        // Check for dynamically published pages
        if (selectedModel && selectedModel.startsWith('__pub__')) {
          const pubPath = selectedModel.replace('__pub__', '');
          const published = getPublishedPages();
          const pageData = published[pubPath];
          if (pageData) return <PublishedPage pageData={pageData} />;
        }
        return (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Under Construction</h2>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>This page is currently being built.</p>
          </div>
        );
      }
    }
  };

  // Editor page renders outside MainLayout
  if (selectedModel === '__editor__' || window.location.pathname === '/admin/editor') {
    return <EditorPage />;
  }

  return (
    <MainLayout selectedModel={selectedModel} onSelectModel={setSelectedModel}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
