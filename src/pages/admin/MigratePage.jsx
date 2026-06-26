import { useState, useCallback } from 'react';
import { createPage, publishPage, fetchAllPages } from '../../lib/pages';
import { useAuth } from '../../lib/auth';

/**
 * MigratePage — Admin utility to seed Supabase with page data.
 *
 * Imports batch data files and runs createPage() + publishPage() for each.
 * Idempotent: skips pages whose route already exists in the database.
 * Requires Supabase authentication (RLS) — sign in with Google first.
 */

// Lazy-load batch data
const BATCHES = {
  1: { label: 'Batch 1 — Prompting (6 pages)', loader: () => import('../../migration/batch1/index.js') },
  5: { label: 'Batch 5 — Coming Soon (16 pages)', loader: () => import('../../migration/batch5-coming-soon.js') },
};

export default function MigratePage() {
  const { user, signIn, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState(new Set());

  const log = useCallback((msg, type = 'info') => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  }, []);

  const toggleBatch = (batchNum) => {
    setSelectedBatches(prev => {
      const next = new Set(prev);
      if (next.has(batchNum)) next.delete(batchNum);
      else next.add(batchNum);
      return next;
    });
  };

  const runMigration = useCallback(async () => {
    if (selectedBatches.size === 0) {
      log('No batches selected.', 'warn');
      return;
    }

    setRunning(true);
    setLogs([]);

    try {
      // Fetch existing pages to check for duplicates
      log('Fetching existing pages…');
      const existing = await fetchAllPages();
      const existingRoutes = new Set(existing.map(p => p.route));
      log(`Found ${existing.length} existing pages.`);

      const sortedBatches = [...selectedBatches].sort((a, b) => a - b);

      for (const batchNum of sortedBatches) {
        const batch = BATCHES[batchNum];
        log(`\n━━━ ${batch.label} ━━━`, 'header');

        let pages;
        try {
          const mod = await batch.loader();
          pages = mod.pages;
        } catch (err) {
          log(`Failed to load batch ${batchNum}: ${err.message}`, 'error');
          continue;
        }

        if (!pages || pages.length === 0) {
          log('No pages found in this batch.', 'warn');
          continue;
        }

        for (const pageData of pages) {
          const { route, urlPath, status, meta, blocks } = pageData;

          // Skip if already exists
          if (existingRoutes.has(route)) {
            log(`SKIP: "${meta.title}" (${route}) — already exists`, 'skip');
            continue;
          }

          try {
            // Create the page
            const { page } = await createPage({
              route,
              urlPath,
              status: status === 'published' ? 'draft' : status,
              meta,
              blocks,
            });

            // If it should be published, publish it
            if (status === 'published') {
              await publishPage(page.id, meta, blocks);
              log(`✓ Published: "${meta.title}" (${route})`, 'success');
            } else {
              log(`✓ Created: "${meta.title}" (${route}) [${status}]`, 'success');
            }

            existingRoutes.add(route);
          } catch (err) {
            log(`✗ Failed: "${meta.title}" (${route}) — ${err.message}`, 'error');
          }
        }
      }

      log('\n━━━ Migration complete ━━━', 'header');
    } catch (err) {
      log(`Fatal error: ${err.message}`, 'error');
    } finally {
      setRunning(false);
    }
  }, [selectedBatches, log]);

  const logColors = {
    info: '#AAAAAA',
    success: '#4ADE80',
    error: '#F87171',
    warn: '#FBBF24',
    skip: '#71717a',
    header: '#0891B2',
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 24px',
      fontFamily: 'var(--font-main)',
      color: 'var(--text-main)',
    }}>
      <h1 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Database Migration
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
        Seed Supabase with page data from static JSX files. This is idempotent — pages that already exist will be skipped.
      </p>

      {/* Auth status */}
      <div style={{
        padding: '12px 16px',
        border: `1px solid ${user ? '#166534' : '#92400e'}`,
        borderRadius: '8px',
        background: user ? 'rgba(22,101,52,0.1)' : 'rgba(146,64,14,0.1)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: user ? '#4ADE80' : '#FBBF24' }}>
            {authLoading ? '⏳ Checking auth…' : user ? `✓ Signed in as ${user.email}` : '⚠ Not authenticated — RLS will block writes'}
          </span>
        </div>
        {!user && !authLoading && (
          <button
            onClick={signIn}
            style={{
              padding: '6px 16px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Sign in with Google
          </button>
        )}
      </div>

      {/* Batch selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Select Batches
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(BATCHES).map(([num, batch]) => (
            <label
              key={num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedBatches.has(Number(num)) ? 'var(--accent-20)' : 'var(--node-bg)',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={selectedBatches.has(Number(num))}
                onChange={() => toggleBatch(Number(num))}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{batch.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={runMigration}
        disabled={running || selectedBatches.size === 0}
        style={{
          padding: '10px 28px',
          background: running ? '#555' : 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: running ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          marginBottom: '24px',
        }}
      >
        {running ? 'Running…' : 'Run Migration'}
      </button>

      {/* Log output */}
      {logs.length > 0 && (
        <div style={{
          background: '#0f0f11',
          border: '1px solid #27272a',
          borderRadius: '8px',
          padding: '16px',
          maxHeight: '500px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: 1.8,
        }}>
          {logs.map((entry, i) => (
            <div key={i} style={{ color: logColors[entry.type] || '#AAAAAA' }}>
              <span style={{ color: '#555', marginRight: '8px' }}>{entry.time}</span>
              {entry.msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
