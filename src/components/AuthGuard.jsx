import { useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';

/**
 * AuthGuard — protects admin routes.
 *
 * • VITE_DEV_CONTEXT=true → skip auth, render children immediately (dev mode)
 * • Not authenticated → redirect to site root + toast
 * • Authenticated but not admin → redirect to site root + toast
 * • Admin → render children
 *
 * No admin email is ever exposed in the UI or error messages.
 */

const IS_DEV_CONTEXT = import.meta.env.VITE_DEV_CONTEXT === 'true';

export default function AuthGuard({ children }) {
  // Dev bypass — skip all auth checks in development
  if (IS_DEV_CONTEXT) return children;

  const { user, isAdmin, loading, signIn } = useAuth();
  const toastShown = useRef(false);

  useEffect(() => {
    if (loading) return;

    // Not logged in at all — prompt sign-in
    if (!user) return;

    // Logged in but not admin — redirect with toast
    if (!isAdmin && !toastShown.current) {
      toastShown.current = true;
      // Dispatch a custom event so the app can show a toast
      window.dispatchEvent(
        new CustomEvent('itseze-toast', {
          detail: { message: 'Unauthorized access. Redirecting…', type: 'error' },
        })
      );
      // Redirect after a short delay so the toast is visible
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, 1500);
    }
  }, [user, isAdmin, loading]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f0f11', color: '#71717a',
        fontSize: '14px', fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px', height: '32px', border: '3px solid #27272a',
            borderTopColor: '#0891B2', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Authenticating…
        </div>
      </div>
    );
  }

  // Not logged in — show sign-in prompt
  if (!user) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f0f11', color: '#e4e4e7',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          textAlign: 'center', maxWidth: '380px', padding: '40px',
          background: '#1c1c20', border: '1px solid #27272a',
          borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.3px' }}>
            Admin Access Required
          </h2>
          <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6, marginBottom: '24px' }}>
            Sign in with your authorized Google account to access the editor.
          </p>
          <button
            onClick={signIn}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 24px', background: '#0891B2', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer', transition: 'filter 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Logged in but not admin — show unauthorized (briefly, before redirect)
  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f0f11', color: '#e4e4e7',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        <div style={{
          textAlign: 'center', maxWidth: '380px', padding: '40px',
          background: '#1c1c20', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f87171' }}>
            Unauthorized
          </h2>
          <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6 }}>
            Your account does not have admin access. Redirecting…
          </p>
        </div>
      </div>
    );
  }

  // Admin — render protected content
  return children;
}
