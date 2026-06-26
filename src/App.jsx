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
import MigratePage from './pages/admin/MigratePage';

// Auth
import { AuthProvider } from './lib/auth';
import AuthGuard from './components/AuthGuard';

// Settings
import { SettingsProvider } from './SettingsContext';

// Supabase data layer
import { fetchPageByUrlPath } from './lib/pages';

// ── Static route mapping (kept as fallback until migration completes) ──
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

// ── Static route key → component map ──
const STATIC_PAGES = {
  'gpt3': GPT3Course,
  'concept:activation-functions': ActivationFunctionsPage,
  'concept:attention': AttentionPage,
  'concept:encoder': EncoderPage,
  'concept:speculative-decoding': SpeculativeDecodingPage,
  'concept:ssm': SSMPage,
  'concept:reasoning-symbolic': SymbolicPage,
  'concept:reasoning-probabilistic': ProbabilisticPage,
  'concept:reasoning-neural': NeuralPage,
  'concept:reasoning-neuro-symbolic': NeuroSymbolicPage,
  'concept:reasoning-chain-of-thought': ChainOfThoughtPage,
  'concept:reasoning-rag': RagPage,
  'concept:reasoning-program-synthesis': ProgramSynthesisPage,
  'concept:prompting-zero-shot': ZeroShotPage,
  'concept:prompting-few-shot': FewShotPage,
  'concept:prompting-cot': COTPage,
  'concept:prompting-zero-cot': ZeroCOTPage,
  'concept:prompting-ltm': LeastToMostPage,
  'concept:prompting-sc': SelfConsistencyPage,
};

function getKeyFromURL() {
  const path = window.location.pathname;
  if (path === '/admin/editor') return '__editor__';
  if (PATH_TO_KEY[path]) return PATH_TO_KEY[path];
  // Any other path is treated as a potential Supabase page url_path
  return `__supabase__${path}`;
}

function App() {
  const [selectedModel, setSelectedModel] = useState(() => {
    const fromURL = getKeyFromURL();
    if (fromURL === '__editor__' || fromURL.startsWith('__supabase__')) return fromURL;
    if (window.location.pathname !== '/' && PATH_TO_KEY[window.location.pathname]) {
      return fromURL;
    }
    return sessionStorage.getItem('itseze-active-page') || 'gpt3';
  });

  // For Supabase-backed pages
  const [supabasePageData, setSupabasePageData] = useState(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);

  const isInitialMount = useRef(true);

  // Handle model selection: can be a static route key or a url_path
  const handleSelectModel = useCallback((modelOrPath) => {
    // If it's a url_path (starts with /), check if it maps to a static route first
    if (modelOrPath && modelOrPath.startsWith('/')) {
      const staticKey = PATH_TO_KEY[modelOrPath];
      if (staticKey) {
        setSelectedModel(staticKey);
      } else {
        // Treat as a Supabase page path
        setSelectedModel(`__supabase__${modelOrPath}`);
        window.history.pushState({}, '', modelOrPath);
      }
    } else {
      setSelectedModel(modelOrPath);
    }
  }, []);

  // On page selection change, update URL and sessionStorage
  useEffect(() => {
    if (!selectedModel || selectedModel === '__editor__' || selectedModel.startsWith('__supabase__')) return;

    sessionStorage.setItem('itseze-active-page', selectedModel);

    const targetPath = ROUTE_MAP[selectedModel] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ page: selectedModel }, '', targetPath);
    }

    if (!isInitialMount.current) {
      window.history.replaceState(
        { page: selectedModel },
        '',
        targetPath
      );
    }
    isInitialMount.current = false;
  }, [selectedModel]);

  // Fetch Supabase page data when a __supabase__ route is selected
  useEffect(() => {
    if (!selectedModel || !selectedModel.startsWith('__supabase__')) {
      setSupabasePageData(null);
      return;
    }

    const urlPath = selectedModel.replace('__supabase__', '');
    setSupabaseLoading(true);

    fetchPageByUrlPath(urlPath)
      .then(data => {
        setSupabasePageData(data);
        setSupabaseLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch Supabase page:', err);
        setSupabasePageData(null);
        setSupabaseLoading(false);
      });
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

  // Listen for toast events from AuthGuard
  useEffect(() => {
    const handleToast = (e) => {
      // Could integrate with a global toast system
      console.warn('Auth toast:', e.detail?.message);
    };
    window.addEventListener('itseze-toast', handleToast);
    return () => window.removeEventListener('itseze-toast', handleToast);
  }, []);

  // ── Section hash tracking via Intersection Observer ──
  const observerRef = useRef(null);

  const setupHashTracking = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

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

          if (visibleSections.size > 0) {
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

    if (window.location.pathname === '/') {
      const targetPath = ROUTE_MAP[selectedModel] || '/';
      window.history.replaceState({ page: selectedModel }, '', targetPath);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderContent = () => {
    // Check static pages first
    const StaticComponent = STATIC_PAGES[selectedModel];
    if (StaticComponent) return <StaticComponent />;

    // Check for Supabase-backed pages
    if (selectedModel && selectedModel.startsWith('__supabase__')) {
      if (supabaseLoading) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '32px', height: '32px', border: '3px solid var(--border)',
                borderTopColor: 'var(--accent)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontSize: '14px' }}>Loading page…</p>
            </div>
          </div>
        );
      }

      if (supabasePageData) {
        const pageData = {
          meta: supabasePageData.current_version?.meta || {},
          blocks: supabasePageData.current_version?.blocks || [],
          firstPublishedAt: supabasePageData.created_at,
          publishedAt: supabasePageData.updated_at,
        };
        return <PublishedPage pageData={pageData} />;
      }
    }

    // Fallback
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Under Construction</h2>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>This page is currently being built.</p>
      </div>
    );
  };

  // Migration page renders outside MainLayout, wrapped in AuthGuard
  if (selectedModel === '__migrate__' || window.location.pathname === '/admin/migrate') {
    return (
      <SettingsProvider>
        <AuthProvider>
          <AuthGuard>
            <MigratePage />
          </AuthGuard>
        </AuthProvider>
      </SettingsProvider>
    );
  }

  // Editor page renders outside MainLayout, wrapped in AuthGuard
  if (selectedModel === '__editor__' || window.location.pathname === '/admin/editor') {
    return (
      <SettingsProvider>
        <AuthProvider>
          <AuthGuard>
            <EditorPage />
          </AuthGuard>
        </AuthProvider>
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <AuthProvider>
        <MainLayout selectedModel={selectedModel} onSelectModel={handleSelectModel}>
          {renderContent()}
        </MainLayout>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
