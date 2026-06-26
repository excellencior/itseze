import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchVersionHistory, fetchVersion, deleteVersion, restoreVersion } from '../../lib/pages';

/* ═══════════════════════════════════════════
 *  Relative Time Helper
 * ═══════════════════════════════════════════ */
function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  if (diffHr < 48) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  }) + ', ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

/* ═══════════════════════════════════════════
 *  Style Constants
 * ═══════════════════════════════════════════ */
const COLORS = {
  bg: '#18181b',
  bgCard: '#1c1c20',
  border: '#27272a',
  borderHover: '#3f3f46',
  text: '#d4d4d8',
  textMuted: '#71717a',
  textBright: '#e4e4e7',
  accent: '#0891B2',
  accentDim: 'rgba(8,145,178,0.12)',
};

const BADGE_STYLES = {
  publish: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Published' },
  draft_save: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Draft' },
};

/* ═══════════════════════════════════════════
 *  VersionHistory Component
 * ═══════════════════════════════════════════ */
export default function VersionHistory({ pageId, currentVersionId, onRestore, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(null); // versionId being previewed
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [flashMsg, setFlashMsg] = useState(null);
  const flashTimer = useRef(null);

  const flash = useCallback((msg) => {
    setFlashMsg(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashMsg(null), 2200);
  }, []);

  // ── Fetch version history ──
  const loadVersions = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVersionHistory(pageId);
      setVersions(data);
    } catch (err) {
      setError(err.message || 'Failed to load version history');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // ── Preview a version ──
  const handlePreview = useCallback(async (versionId) => {
    setPreviewLoading(versionId);
    try {
      const data = await fetchVersion(versionId);
      setPreviewData(data);
    } catch (err) {
      flash('Preview failed: ' + (err.message || 'Unknown error'));
    } finally {
      setPreviewLoading(null);
    }
  }, [flash]);

  // ── Restore a version ──
  const handleRestore = useCallback(async (versionId) => {
    setRestoringId(versionId);
    try {
      const newVersion = await restoreVersion(pageId, versionId);
      flash('Restored!');
      if (onRestore) onRestore(newVersion);
      await loadVersions();
    } catch (err) {
      flash('Restore failed: ' + (err.message || 'Unknown error'));
    } finally {
      setRestoringId(null);
    }
  }, [pageId, onRestore, flash, loadVersions]);

  // ── Delete a version ──
  const handleDelete = useCallback(async (versionId) => {
    setDeletingId(versionId);
    try {
      await deleteVersion(versionId);
      flash('Version deleted');
      await loadVersions();
    } catch (err) {
      flash('Delete failed: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  }, [flash, loadVersions]);

  /* ═══════════════════════════════════════════
   *  Render
   * ═══════════════════════════════════════════ */
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: COLORS.bg, color: COLORS.text, fontFamily: 'inherit',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: `1px solid ${COLORS.border}`,
        background: COLORS.bgCard, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 700, color: COLORS.textBright, letterSpacing: '-0.2px' }}>
            Version History
          </span>
          {!loading && !error && (
            <span style={{
              fontSize: '10px', fontWeight: 600, color: COLORS.textMuted,
              background: COLORS.border, padding: '1px 7px', borderRadius: '10px',
            }}>
              {versions.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: COLORS.textMuted,
            cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px 4px',
            borderRadius: '4px', transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.textBright; e.currentTarget.style.background = COLORS.border; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textMuted; e.currentTarget.style.background = 'none'; }}
          title="Close version history"
        >
          ✕
        </button>
      </div>

      {/* ── Flash Toast ── */}
      {flashMsg && (
        <div style={{
          padding: '6px 14px', fontSize: '11px', fontWeight: 600,
          background: COLORS.accentDim, color: COLORS.accent,
          borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          {flashMsg}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', gap: '12px' }}>
            <div style={{
              width: '24px', height: '24px', border: `2px solid ${COLORS.border}`,
              borderTopColor: COLORS.accent, borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <span style={{ fontSize: '11px', color: COLORS.textMuted }}>Loading versions…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, marginBottom: '10px' }}>
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px' }}>{error}</p>
            <button
              onClick={loadVersions}
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171', fontSize: '11px', fontWeight: 600, padding: '5px 14px',
                borderRadius: '5px', cursor: 'pointer', transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && versions.length === 0 && (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: COLORS.textMuted }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '10px' }}>
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p style={{ fontSize: '12px' }}>No versions found.</p>
          </div>
        )}

        {/* Version list */}
        {!loading && !error && versions.map((v) => {
          const isCurrent = v.id === currentVersionId;
          const badge = BADGE_STYLES[v.version_type] || BADGE_STYLES.draft_save;
          const title = v.meta?.title || 'Untitled';
          const truncatedTitle = title.length > 32 ? title.slice(0, 30) + '…' : title;

          return (
            <div
              key={v.id}
              style={{
                margin: '0 8px 4px 8px', padding: '10px 12px',
                background: isCurrent ? COLORS.accentDim : 'transparent',
                border: `1px solid ${isCurrent ? 'rgba(8,145,178,0.3)' : 'transparent'}`,
                borderRadius: '6px', transition: 'all 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.background = 'rgba(39,39,42,0.5)';
                  e.currentTarget.style.borderColor = COLORS.borderHover;
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrent) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              {/* Top row: badge + time */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '2px 7px', borderRadius: '3px',
                    background: badge.bg, color: badge.color,
                  }}>
                    {badge.label}
                  </span>
                  {isCurrent && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '3px',
                      fontSize: '9px', fontWeight: 700, color: COLORS.accent,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      <span style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: COLORS.accent, display: 'inline-block',
                      }} />
                      Current
                    </span>
                  )}
                </div>
                <span
                  style={{ fontSize: '10px', color: COLORS.textMuted }}
                  title={new Date(v.created_at).toISOString()}
                >
                  {timeAgo(v.created_at)}
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontSize: '12px', fontWeight: 500, color: isCurrent ? COLORS.textBright : COLORS.text,
                marginBottom: '8px', lineHeight: 1.3,
              }} title={title}>
                {truncatedTitle}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <ActionButton
                  label={previewLoading === v.id ? '…' : 'Preview'}
                  onClick={() => handlePreview(v.id)}
                  disabled={previewLoading === v.id}
                />
                <ActionButton
                  label={restoringId === v.id ? '…' : 'Restore'}
                  onClick={() => handleRestore(v.id)}
                  disabled={restoringId === v.id}
                  accent
                />
                <ActionButton
                  label={deletingId === v.id ? '…' : 'Delete'}
                  onClick={() => handleDelete(v.id)}
                  disabled={isCurrent || deletingId === v.id}
                  danger
                  title={isCurrent ? 'Cannot delete the current live version' : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Preview Modal ── */}
      {previewData && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          }}
          onClick={() => setPreviewData(null)}
        >
          <div
            style={{
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
              borderRadius: '10px', padding: '0', maxWidth: '640px', width: '92%',
              maxHeight: '80vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: COLORS.textBright }}>
                  {previewData.meta?.title || 'Untitled'}
                </div>
                <div style={{ fontSize: '10px', color: COLORS.textMuted, marginTop: '2px' }}>
                  {(BADGE_STYLES[previewData.version_type] || BADGE_STYLES.draft_save).label} · {timeAgo(previewData.created_at)}
                </div>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                style={{
                  background: COLORS.border, border: 'none', color: COLORS.textMuted,
                  cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: '4px 8px',
                  borderRadius: '4px', transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.textBright; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textMuted; }}
              >
                ✕
              </button>
            </div>

            {/* Modal body — JSON preview */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
              {/* Meta section */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.textMuted, marginBottom: '6px' }}>
                  Meta
                </div>
                <pre style={{
                  fontSize: '11px', color: COLORS.text, background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`, borderRadius: '6px',
                  padding: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  lineHeight: 1.5, fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
                }}>
                  {JSON.stringify(previewData.meta, null, 2)}
                </pre>
              </div>

              {/* Blocks section */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: COLORS.textMuted, marginBottom: '6px' }}>
                  Blocks ({previewData.blocks?.length || 0})
                </div>
                <pre style={{
                  fontSize: '11px', color: COLORS.text, background: COLORS.bg,
                  border: `1px solid ${COLORS.border}`, borderRadius: '6px',
                  padding: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  lineHeight: 1.5, maxHeight: '400px', overflowY: 'auto',
                  fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
                }}>
                  {JSON.stringify(previewData.blocks, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe styles (injected once) */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  ActionButton — small inline action button
 * ═══════════════════════════════════════════ */
function ActionButton({ label, onClick, disabled, accent, danger, title }) {
  const baseColor = danger ? '#f87171' : accent ? COLORS.accent : COLORS.textMuted;
  const baseBg = danger ? 'rgba(239,68,68,0.08)' : accent ? COLORS.accentDim : 'rgba(39,39,42,0.4)';
  const hoverBg = danger ? 'rgba(239,68,68,0.18)' : accent ? 'rgba(8,145,178,0.22)' : 'rgba(39,39,42,0.7)';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        fontSize: '10px', fontWeight: 600, padding: '3px 10px',
        borderRadius: '4px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: baseBg, color: disabled ? '#52525b' : baseColor,
        opacity: disabled ? 0.5 : 1, transition: 'all 0.15s ease',
        lineHeight: 1.4,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.background = baseBg; }}
    >
      {label}
    </button>
  );
}
