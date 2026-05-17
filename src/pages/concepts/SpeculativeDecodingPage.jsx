import React, { useState, useEffect, useRef } from 'react';
import Latex from '../../components/Latex';
import HoverCard from '../../components/HoverCard';
import InlinePanel from '../../components/viz/InlinePanel';

function slugify(t) {
  return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/^\d+\.\s*/, '').trim().replace(/\s+/g, '-');
}
function Section({ title, children }) {
  const id = slugify(title);
  return (
    <div id={id} data-section style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>{title}</h2>
      {children}
    </div>
  );
}
function P({ children }) {
  return <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.7 }}>{children}</p>;
}
function Callout({ type = 'info', children }) {
  const colors = {
    info: { bg: '#EFF6FF', border: '#3B82F6', icon: 'ℹ️' },
    warning: { bg: '#FFF7ED', border: '#F59E0B', icon: '⚠️' },
    key: { bg: '#F0FDF4', border: '#10B981', icon: '💡' },
    accent: { bg: 'var(--accent-20)', border: 'var(--accent)', icon: '↩' },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, borderLeft: `4px solid ${c.border}`, padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0', fontSize: '14px', lineHeight: 1.6, color: '#333' }}>
      <span style={{ marginRight: '8px' }}>{c.icon}</span>{children}
    </div>
  );
}
function PropTable({ rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--border)' }}>
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i}>
            <td style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid var(--border)', width: '40%', background: '#FAFAFA' }}>{k}</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Step-by-step Walkthrough ──
const CONTEXT = ['I', 'want'];
const DRAFTED = ['to', 'eat', 'pizza', 'tonight'];
const VERIFY_TABLES = [
  { after: '"I want"', draft: 'to', top: [['to', 92], ['a', 4], ['some', 2]], accepted: true },
  { after: '"I want to"', draft: 'eat', top: [['eat', 88], ['go', 5], ['see', 3]], accepted: true },
  { after: '"I want to eat"', draft: 'pizza', top: [['dinner', 40], ['food', 30], ['pizza', 5]], accepted: false },
];

function TokenChip({ text, color = 'var(--text-main)', bg = '#FAFAFA', border = 'var(--border)', bold, mono }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px',
      border: `1.5px solid ${border}`, background: bg,
      fontFamily: mono ? '"Fira Code", monospace' : 'inherit',
      fontSize: '13px', fontWeight: bold ? 700 : 500, color,
      marginRight: '4px', marginBottom: '4px',
    }}>{text}</span>
  );
}

function MiniTable({ rows, draftToken, accepted }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid var(--border)' }}>
      <thead><tr style={{ background: '#FAFAFA' }}>
        <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Token</th>
        <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Probability</th>
        <th style={{ padding: '6px 10px', borderBottom: '2px solid var(--border)' }}></th>
      </tr></thead>
      <tbody>
        {rows.map(([tok, prob], i) => {
          const isDraft = tok === draftToken;
          return (
            <tr key={i} style={{ background: isDraft ? (accepted ? '#F0FDF4' : '#FEF2F2') : 'white' }}>
              <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', fontFamily: '"Fira Code", monospace', fontWeight: isDraft ? 700 : 400 }}>{tok}</td>
              <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', fontFamily: '"Fira Code", monospace' }}>{prob}%</td>
              <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '11px' }}>
                {isDraft && (accepted ? <span style={{ color: '#10B981' }}>← draft ✓</span> : <span style={{ color: '#EF4444' }}>← draft ✗</span>)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SpecDecodingWalkthrough() {
  const [step, setStep] = useState(0);
  const STEPS = [
    { title: 'The analogy' },
    { title: 'Drafter guesses' },
    { title: 'Big model: one pass' },
    { title: 'Checking each position' },
    { title: 'Rejection → result' },
  ];

  return (
    <div style={{ border: '1px solid var(--border)', background: 'white', padding: '20px 24px', marginTop: '16px', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '12px' }}>
        Walkthrough — One Iteration of Speculative Decoding
      </div>

      {/* Step tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border)', marginBottom: '0' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              padding: '8px 12px', fontSize: '11px',
              fontWeight: step === i ? 700 : 500,
              color: step === i ? 'var(--accent)' : 'var(--text-light)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: step === i ? '2px solid var(--accent)' : '2px solid transparent',
              fontFamily: 'inherit', marginBottom: '-2px',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 0 4px 0' }}>
        {step === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <p style={{ marginBottom: '12px' }}>Think of it as a <strong>junior writer</strong> and a <strong>senior editor</strong>.</p>
            <p style={{ marginBottom: '12px' }}>The junior drafts a few sentences quickly. The senior editor reads ahead and, at each word, asks:</p>
            <div style={{ padding: '14px 18px', background: '#FAFAFA', border: '1px solid var(--border)', fontFamily: '"Fira Code", monospace', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
              "Would I myself likely write this next word?"
            </div>
            <p style={{ marginBottom: '6px' }}>If <strong>yes</strong> → keep it, move on.</p>
            <p style={{ marginBottom: '6px' }}>If <strong>no</strong> → stop there, rewrite from that point onward.</p>
            <p>The editor <strong>never blindly trusts</strong> the junior. Every word is checked against the editor's own judgement.</p>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.7 }}>Current context:</div>
            <div style={{ padding: '10px 16px', background: '#FAFAFA', border: '1px solid var(--border)', marginBottom: '14px' }}>
              {CONTEXT.map((t, i) => <TokenChip key={i} text={t} mono bold bg="#F0FDF4" border="#10B981" color="#166534" />)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.7 }}>Small drafter predicts 4 tokens:</div>
            <div style={{ padding: '10px 16px', background: '#EFF6FF', border: '1px solid #3B82F6', marginBottom: '14px' }}>
              {DRAFTED.map((t, i) => <TokenChip key={i} text={t} mono bold border="#3B82F6" bg="#EFF6FF" color="#1E40AF" />)}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.7 }}>So the full sequence becomes:</div>
            <div style={{ padding: '10px 16px', background: '#FAFAFA', border: '1px solid var(--border)' }}>
              {[...CONTEXT, ...DRAFTED].map((t, i) => (
                <TokenChip key={i} text={t} mono bold bg={i < 2 ? '#F0FDF4' : '#EFF6FF'} border={i < 2 ? '#10B981' : '#3B82F6'} color={i < 2 ? '#166534' : '#1E40AF'} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.7 }}>
              The big model runs <strong>one forward pass</strong> on the whole sequence. Because transformers
              process positions in parallel, it computes logits for all positions <strong>simultaneously</strong>:
            </div>
            <div style={{ border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '14px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: '#FAFAFA' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Position</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Predicting next word after…</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Draft token</th>
                </tr></thead>
                <tbody>
                  {VERIFY_TABLES.map((v, i) => (
                    <tr key={i}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-light)' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: '"Fira Code", monospace' }}>{v.after}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: '"Fira Code", monospace', fontWeight: 700 }}>{v.draft}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              All computed at the <strong>same time</strong> — just like when you paste a prompt into ChatGPT. The model reads every token simultaneously, not word by word.
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.7 }}>
              At each position, the big model asks: <em>"Would I also choose this token?"</em>
            </div>
            {VERIFY_TABLES.map((v, i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>After {v.after} — big model predicts:</div>
                <MiniTable rows={v.top} draftToken={v.draft} accepted={v.accepted} />
                <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px', color: v.accepted ? '#10B981' : '#EF4444' }}>
                  {v.accepted
                    ? `"${v.draft}" has ${v.top.find(r => r[0] === v.draft)[1]}% — big model agrees. ✓ Accepted.`
                    : `"${v.draft}" only has ${v.top.find(r => r[0] === v.draft)[1]}% — big model would have said "${v.top[0][0]}" (${v.top[0][1]}%). ✗ Rejected.`
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.7 }}>
              Accepted tokens become finalized. Everything from the rejection onward is discarded:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div style={{ padding: '12px 14px', border: '1px solid #10B981', background: '#F0FDF4', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#166534' }}>✓ Finalized</div>
                <div style={{ fontFamily: '"Fira Code", monospace', fontWeight: 600 }}>I want <strong>to eat</strong></div>
              </div>
              <div style={{ padding: '12px 14px', border: '1px solid #EF4444', background: '#FEF2F2', fontSize: '12px' }}>
                <div style={{ fontWeight: 700, marginBottom: '6px', color: '#991B1B' }}>✗ Discarded</div>
                <div style={{ fontFamily: '"Fira Code", monospace', fontWeight: 600, textDecoration: 'line-through', color: 'var(--text-light)' }}>pizza tonight</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.7 }}>
              Then the big model generates the next token itself (e.g., "dinner"), and drafting resumes from there.
            </div>
            <Callout type="key">
              <strong>2 tokens accepted + 1 generated by the big model = 3 new tokens from a single big-model forward pass.</strong> Without
              speculative decoding, that would have taken 3 separate passes. That's the speedup.
            </Callout>
          </div>
        )}
      </div>

      {/* Step navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: '5px 14px', fontSize: '12px', fontWeight: 600,
            background: 'none', border: '1px solid var(--border)',
            color: step === 0 ? 'var(--text-light)' : 'var(--text-muted)',
            cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'inherit',
            opacity: step === 0 ? 0.4 : 1,
          }}
        >← Previous</button>
        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Step {step + 1} of {STEPS.length}</span>
        <button
          onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          style={{
            padding: '5px 14px', fontSize: '12px', fontWeight: 600,
            background: step === STEPS.length - 1 ? 'none' : 'var(--accent)',
            border: step === STEPS.length - 1 ? '1px solid var(--border)' : 'none',
            color: step === STEPS.length - 1 ? 'var(--text-light)' : '#fff',
            cursor: step === STEPS.length - 1 ? 'default' : 'pointer', fontFamily: 'inherit',
            opacity: step === STEPS.length - 1 ? 0.4 : 1,
          }}
        >Next →</button>
      </div>
    </div>
  );
}

// ── Parallelization Visualization ──
// Bar component for Gantt rows
function GanttBar({ label, segments, totalWidth, animDelay, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
      <div style={{
        minWidth: '42px', fontSize: '11px', fontWeight: 700,
        fontFamily: '"Fira Code", monospace', color: 'var(--text-muted)', textAlign: 'right',
      }}>{label}</div>
      <div style={{ flex: 1, display: 'flex', height: '28px', position: 'relative' }}>
        {segments.map((seg, j) => (
          <div key={j} style={{
            width: `${(seg.w / totalWidth) * 100}%`,
            background: seg.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 700, color: '#fff',
            letterSpacing: '0.02em',
            opacity: active ? 1 : 0.2,
            transition: `opacity 0.5s ease ${animDelay + j * 0.1}s`,
            borderRight: j < segments.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
          }}>
            {seg.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Matrix shape diagram
function MatrixShape({ rows, cols, color, label, animate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '1px', width: `${Math.max(cols * 10, 20)}px`,
        opacity: animate ? 1 : 0.25,
        transform: animate ? 'scale(1)' : 'scale(0.92)',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
      }}>
        {Array.from({ length: rows * cols }).map((_, i) => (
          <div key={i} style={{
            width: '100%', paddingBottom: '100%',
            background: color, borderRadius: '1px',
          }} />
        ))}
      </div>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)',
        fontFamily: '"Fira Code", monospace', whiteSpace: 'nowrap',
      }}>{label}</div>
    </div>
  );
}

function ParallelViz() {
  const [mode, setMode] = useState('sequential'); // 'sequential' | 'parallel'
  const [animate, setAnimate] = useState(false);

  // Trigger animation on mode change
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(t);
  }, [mode]);

  const LOAD_COST = 38; // ms — weight loading dominates
  const COMPUTE_1 = 2;  // ms — compute for 1 token
  const COMPUTE_K = 4;  // ms — compute for 5 tokens (barely more)
  const K = 5;

  const seqTotal = K * (LOAD_COST + COMPUTE_1); // 5 × 40 = 200ms
  const parTotal = LOAD_COST + COMPUTE_K;        // 42ms

  const tabStyle = (active) => ({
    padding: '6px 16px', fontSize: '12px', fontWeight: active ? 700 : 500,
    color: active ? 'var(--accent)' : 'var(--text-light)',
    background: 'none', border: 'none', cursor: 'pointer',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    fontFamily: 'inherit', marginBottom: '-2px',
    transition: 'color 0.15s, border-color 0.15s',
  });

  return (
    <div style={{ border: '1px solid var(--border)', background: 'white', padding: '20px 24px', marginTop: '16px', marginBottom: '20px' }}>
      {/* Header */}
      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '12px' }}>
        Why Parallel Verification Works
      </div>

      {/* Tab toggle */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '20px' }}>
        <button style={tabStyle(mode === 'sequential')} onClick={() => setMode('sequential')}>
          Sequential Decode (Standard)
        </button>
        <button style={tabStyle(mode === 'parallel')} onClick={() => setMode('parallel')}>
          Parallel Verify (Speculative)
        </button>
      </div>

      {/* ── SECTION 1: Gantt Timeline ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
          {mode === 'sequential' ? 'Timeline: 5 tokens → 5 forward passes' : 'Timeline: 5 tokens → 1 forward pass'}
        </div>

        {mode === 'sequential' ? (
          // Sequential: 5 rows, each with LOAD + COMPUTE
          <div>
            {Array.from({ length: K }).map((_, i) => (
              <GanttBar
                key={i}
                label={`t${i + 1}`}
                active={animate}
                animDelay={i * 0.12}
                totalWidth={LOAD_COST + COMPUTE_1}
                segments={[
                  { w: LOAD_COST, color: '#EF4444', label: 'LOAD WEIGHTS' },
                  { w: COMPUTE_1, color: '#3B82F6', label: '' },
                ]}
              />
            ))}
            {/* Total bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
              <div style={{ minWidth: '42px', fontSize: '11px', fontWeight: 700, fontFamily: '"Fira Code", monospace', color: 'var(--text-main)', textAlign: 'right' }}>total</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444', fontFamily: '"Fira Code", monospace' }}>
                {seqTotal}ms <span style={{ fontWeight: 500, color: 'var(--text-light)', fontSize: '11px' }}>({K} × {LOAD_COST + COMPUTE_1}ms)</span>
              </div>
            </div>
          </div>
        ) : (
          // Parallel: 1 row, wider compute
          <div>
            <GanttBar
              label="all"
              active={animate}
              animDelay={0}
              totalWidth={LOAD_COST + COMPUTE_K}
              segments={[
                { w: LOAD_COST, color: '#F59E0B', label: 'LOAD WEIGHTS (once)' },
                { w: COMPUTE_K, color: '#10B981', label: `×${K}` },
              ]}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
              <div style={{ minWidth: '42px', fontSize: '11px', fontWeight: 700, fontFamily: '"Fira Code", monospace', color: 'var(--text-main)', textAlign: 'right' }}>total</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', fontFamily: '"Fira Code", monospace' }}>
                {parTotal}ms <span style={{ fontWeight: 500, color: 'var(--text-light)', fontSize: '11px' }}>(1 × load + 1 × compute)</span>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ width: '10px', height: '10px', background: mode === 'sequential' ? '#EF4444' : '#F59E0B', borderRadius: '2px' }} />
            Load weights from{' '}
            <HoverCard term="HBM">
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>High Bandwidth Memory (HBM)</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                The GPU's main memory (e.g., 80 GB on an A100). Model weights live here because they are too
                large for the on-chip SRAM cache. Each forward pass must <strong>stream all weights</strong> from
                HBM through the compute cores. HBM bandwidth (~2–3 TB/s) is the primary bottleneck during
                single-token decoding — the compute units finish faster than memory can feed them.
              </div>
            </HoverCard>{' '}
            (~{LOAD_COST}ms)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ width: '10px', height: '10px', background: mode === 'sequential' ? '#3B82F6' : '#10B981', borderRadius: '2px' }} />
            Compute ({mode === 'sequential' ? `~${COMPUTE_1}ms` : `~${COMPUTE_K}ms for ${K} tokens`})
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Matrix Shape Comparison ── */}
      <div style={{ padding: '16px', background: '#FAFAFA', border: '1px solid var(--border)', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '14px' }}>
          {mode === 'sequential' ? 'Each step: Matrix × Vector → Vector (repeated 5×)' : 'One step: Matrix × Matrix → Matrix (done once)'}
        </div>

        {mode === 'sequential' ? (
          // Sequential: W × x = y, shown 5 times
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            {Array.from({ length: K }).map((_, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: animate ? 1 : 0.15,
                transition: `opacity 0.4s ease ${i * 0.1}s`,
              }}>
                <MatrixShape rows={6} cols={6} color="#EF4444" label="W" animate={animate} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)' }}>×</span>
                <MatrixShape rows={6} cols={1} color="#3B82F6" label={`x${i+1}`} animate={animate} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-light)' }}>=</span>
                <MatrixShape rows={6} cols={1} color="#8B5CF6" label={`y${i+1}`} animate={animate} />
                {i < K - 1 && <div style={{ width: '1px', height: '40px', background: 'var(--border)', marginLeft: '8px' }} />}
              </div>
            ))}
          </div>
        ) : (
          // Parallel: W × [x1...x5] = [y1...y5]
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
            <MatrixShape rows={6} cols={6} color="#F59E0B" label={`W (load once)`} animate={animate} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-light)' }}>×</span>
            <MatrixShape rows={6} cols={5} color="#10B981" label={`[x₁ x₂ x₃ x₄ x₅]`} animate={animate} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-light)' }}>=</span>
            <MatrixShape rows={6} cols={5} color="#8B5CF6" label={`[y₁ y₂ y₃ y₄ y₅]`} animate={animate} />
          </div>
        )}
      </div>

      {/* ── SECTION 3: Key insight callout ── */}
      <div style={{
        padding: '12px 16px', fontSize: '13px', lineHeight: 1.6,
        background: mode === 'parallel' ? '#F0FDF4' : '#FEF2F2',
        border: `1px solid ${mode === 'parallel' ? '#10B981' : '#EF4444'}`,
        borderRadius: '4px',
        color: mode === 'parallel' ? '#166534' : '#991B1B',
        transition: 'all 0.3s',
      }}>
        {mode === 'sequential' ? (
          <>
            <strong>The bottleneck is loading weights, not computing.</strong> Each of the 5 forward passes loads the
            same ~140 GB of model weights from HBM. The actual matrix-vector multiply takes only ~{COMPUTE_1}ms —
            the other ~{LOAD_COST}ms is pure memory transfer. You pay the loading cost 5 times for 5 tokens.
          </>
        ) : (
          <>
            <strong>Load once, compute everything.</strong> The same ~140 GB of weights is loaded once.
            The GPU multiplies those weights against all 5 token vectors simultaneously — a matrix-matrix multiply
            instead of a matrix-vector multiply. Total compute grows from ~{COMPUTE_1}ms to ~{COMPUTE_K}ms,
            but you skip 4 redundant weight loads. <strong>Speedup: {(seqTotal / parTotal).toFixed(1)}×</strong>.
          </>
        )}
      </div>
    </div>
  );
}
export default function SpeculativeDecodingPage() {
  const [walkthroughOpen, setWalkthroughOpen] = useState(() => {
    return sessionStorage.getItem('spec-walkthrough-open') === 'true';
  });
  const walkthroughBtnRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('spec-walkthrough-open', walkthroughOpen);
  }, [walkthroughOpen]);

  const handleToggleWalkthrough = () => {
    setWalkthroughOpen(prev => {
      const next = !prev;
      if (next && walkthroughBtnRef.current) {
        setTimeout(() => {
          walkthroughBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return next;
    });
  };

  const handleCloseWalkthrough = () => {
    setWalkthroughOpen(false);
    if (walkthroughBtnRef.current) {
      setTimeout(() => {
        walkthroughBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto', transition: 'width 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>Concept</div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>Speculative Decoding</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          How to make large language models generate faster without changing a single weight —
          by guessing ahead with a small model and verifying in parallel with the big one.
        </p>
      </div>

      {/* ── THE WALL ── */}
      <Section title="The Latency Wall">
        <P>
          Large language models generate text one token at a time. Each token requires a full forward pass through
          the entire network — every layer, every attention head, every parameter. For GPT-3, that is 175 billion
          parameters consulted to produce a single word. For Llama 3 405B, it is 405 billion. The arithmetic is
          sobering: if your model takes 40ms per forward pass, generating a 500-token response takes 20 full seconds
          of serial computation.
        </P>
        <P>
          The cruel irony is that during generation (as opposed to the initial prompt processing), the GPU is
          <strong> dramatically underutilized</strong>. The model processes just one token at a time, so the
          computation is <em>memory-bandwidth bound</em>, not compute-bound. The expensive tensor cores sit idle
          while the system waits for weights to be loaded from memory. You are paying for a supercomputer and
          using it as a calculator.
        </P>
        <Callout type="warning">
          <strong>The core problem:</strong> Autoregressive decoding is inherently sequential. Token <em>n</em> depends
          on token <em>n−1</em>, which depends on <em>n−2</em>, and so on. You cannot parallelize generation the way you
          parallelize prompt processing. Or can you?
        </Callout>
        <P>
          This is where{' '}
          <HoverCard term="speculative decoding">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Speculative Decoding</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              A technique introduced independently by Leviathan et al. (2023) and Chen et al. (2023) that uses a
              small <strong>draft model</strong> to propose multiple tokens, which the large <strong>target model</strong>{' '}
              then verifies in a single forward pass. It produces <em>exactly</em> the same output distribution as
              the target model alone.
            </div>
          </HoverCard>{' '}
          enters the picture. The key insight is deceptively elegant: <em>verifying a guess is cheaper than making one from scratch</em>.
        </P>
      </Section>

      {/* ── THE INSIGHT ── */}
      <Section title="The Core Insight">
        <P>
          Imagine you are editing a colleague's draft essay. Reading through a paragraph and confirming "yes, this is
          exactly what I would have written" is far faster than composing that paragraph yourself from a blank page.
          Speculative decoding exploits precisely this asymmetry.
        </P>
        <P>
          A small, fast <strong>draft model</strong> (say, 1B parameters) proposes a sequence of <em>K</em> tokens
          speculatively — it <em>guesses</em> what the large target model would have generated. Then the large
          target model processes all <em>K</em> draft tokens <strong>in a single forward pass</strong> (just like
          processing a prompt), verifying each one against its own distribution. If the draft tokens match, you've
          just generated <em>K</em> tokens for the cost of one large-model forward pass.{' '}
          <button
            ref={walkthroughBtnRef}
            onClick={handleToggleWalkthrough}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid var(--accent)',
              background: 'transparent',
              color: 'var(--accent)',
              cursor: 'pointer',
              borderRadius: '3px',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              verticalAlign: 'middle',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-20)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            ◧ visualize
          </button>
        </P>
        <InlinePanel open={walkthroughOpen} onClose={handleCloseWalkthrough} maxHeight="800px">
          <SpecDecodingWalkthrough />
        </InlinePanel>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '8px', color: '#EF4444' }}>Without Speculative Decoding</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Generate 5 tokens → <strong>5 serial forward passes</strong> through the 70B model.<br/>
              Each pass: ~40ms. Total: ~200ms.
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '8px', color: '#10B981' }}>With Speculative Decoding</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Draft model proposes 5 tokens → <strong>1 forward pass</strong> through 70B to verify all 5.<br/>
              Draft: ~5ms. Verify: ~42ms. Total: ~47ms. <strong>~4× faster.</strong>
            </div>
          </div>
        </div>
        <Callout type="key">
          <strong>The beautiful guarantee:</strong> Speculative decoding is <strong>lossless</strong>. The output
          distribution is mathematically identical to running the target model alone. No approximation, no quality
          loss, no changed behavior. It is pure speed, free of charge.
        </Callout>
      </Section>

      {/* ── THE ALGORITHM ── */}
      <Section title="The Algorithm, Step by Step">
        <P>
          The algorithm operates in a loop. Each iteration has two phases: <strong>drafting</strong> (the small model
          guesses) and <strong>verification</strong> (the large model checks). Let us trace through one iteration.
        </P>

        <PropTable rows={[
          ['Draft model (Mq)', 'A small, fast model (e.g., 1B params). Generates K candidate tokens autoregressively.'],
          ['Target model (Mp)', 'The large model whose distribution we want to sample from (e.g., 70B params).'],
          ['K (speculation length)', 'Number of tokens the draft model proposes per iteration. Typically 4–8.'],
          ['Acceptance rate (α)', 'Fraction of draft tokens accepted. Higher α = more speedup.'],
        ]} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', margin: '8px 0 20px 0' }}>
          {[
            { n: 1, title: 'Draft K tokens', desc: 'Run the draft model autoregressively for K steps, producing tokens x₁, x₂, …, xₖ. Store the draft probabilities q(xₜ) at each step.' },
            { n: 2, title: 'Verify in parallel', desc: 'Feed all K draft tokens into the target model in a single forward pass. This gives us the target probabilities p(xₜ) for each position — essentially, what the big model would have chosen.' },
            { n: 3, title: 'Accept or reject each token', desc: 'For each draft token xₜ, accept it with probability min(1, p(xₜ)/q(xₜ)). If p(xₜ) ≥ q(xₜ), the target agrees at least as much as the draft, so accept unconditionally. Otherwise, accept proportionally.' },
            { n: 4, title: 'On first rejection, resample', desc: 'At the first rejected position, sample a corrected token from an adjusted distribution: norm(max(0, p(x) − q(x))). This ensures the final distribution is exactly p(x).' },
            { n: 5, title: 'Repeat', desc: 'Advance the context by all accepted tokens (+ the one resampled token), and start a new draft-verify iteration.' },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ minWidth: '28px', height: '28px', borderRadius: '14px', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>{n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="math-box">
          <Latex math={"\\text{accept } x_t \\text{ with probability } \\min\\!\\left(1,\\; \\frac{p(x_t)}{q(x_t)}\\right)"} block />
        </div>
        <P>
          This acceptance criterion is the heart of the algorithm. It is a form of{' '}
          <HoverCard term="rejection sampling">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Rejection Sampling</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              A classical technique in statistics for sampling from a target distribution <em>p</em> using a proposal
              distribution <em>q</em>. You draw from <em>q</em> and accept with probability <em>p(x)/q(x)</em>,
              scaled by a constant. The accepted samples are exactly distributed according to <em>p</em>.
            </div>
          </HoverCard>{' '}
          adapted for autoregressive sequences. The crucial property: regardless of how bad the draft model is,
          <strong> the output distribution is always exactly that of the target model</strong>. A bad draft model
          simply means more rejections and less speedup — but never wrong outputs.
        </P>
      </Section>

      {/* ── WHY LOSSLESS ── */}
      <Section title="Why It's Truly Lossless">
        <P>
          This is the question everyone asks: <em>if the draft model is small and makes wrong guesses, how can the
          final output be identical to the target model?</em> The answer is that verification is not a passive
          check — it is an <strong>active correction mechanism</strong>. The draft model proposes, and the target
          model disposes. Every wrong guess is caught and replaced with a sample from the correct distribution.
          The draft model never gets the final say.
        </P>
        <P>
          The trick lies in the rejection sampling step. When the draft proposes token <em>x</em> with probability
          <Latex math={"q(x)"} /> and the target assigns it probability <Latex math={"p(x)"} />, three things can happen:
        </P>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', marginBottom: '16px' }}>
          <div style={{ padding: '12px 16px', border: '1px solid var(--border)', background: 'white', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Case 1: Target agrees more — <Latex math={"p(x) \\geq q(x)"} /></div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The target would have been <em>even more likely</em> to pick this token than the draft was.
              Accept unconditionally. The ratio <Latex math={"p(x)/q(x) \\geq 1"} />, so <Latex math={"\\min(1, p/q) = 1"} />.
            </div>
          </div>
          <div style={{ padding: '12px 16px', border: '1px solid var(--border)', background: 'white', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Case 2: Target agrees less — <Latex math={"p(x) < q(x)"} /></div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The draft was <em>overconfident</em> about this token. Accept with probability <Latex math={"p(x)/q(x) < 1"} />.
              For example, if the draft says 0.80 and the target says 0.40, accept with probability 0.50.
              This downweights tokens the draft liked too much.
            </div>
          </div>
          <div style={{ padding: '12px 16px', border: '1px solid var(--border)', background: 'white', borderLeft: '4px solid #EF4444' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Case 3: Rejected — resample from the residual</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              When rejected, don't just pick the target's top token — sample from the <strong>adjusted
              distribution</strong> <Latex math={"p'(x) = \\text{norm}(\\max(0,\\; p(x) - q(x)))"} />. This distribution
              precisely compensates for the probability mass already "used up" by the accepted tokens, ensuring
              the overall sample follows <Latex math={"p(x)"} /> exactly.
            </div>
          </div>
        </div>
        <Callout type="key">
          <strong>The mathematical guarantee:</strong> For every token in the vocabulary, the probability of it
          being the final output equals <em>exactly</em> <Latex math={"p(x)"} />. The draft model affects
          only <strong>how many tokens get accepted per iteration</strong> (speed), never <strong>which tokens
          appear in the output</strong> (quality). A perfect draft means more speed. A terrible draft means no
          speed gain — but the output is <em>still</em> sampled from <Latex math={"p(x)"} />.
        </Callout>
        <P>
          Think of it this way: the verification step is a filter that only lets through tokens the target model
          would have produced. The draft model is merely a <em>proposal engine</em> — it suggests candidates to
          accelerate the search, but the target model has absolute veto power. The output is the target model's
          output, generated faster.
        </P>
      </Section>

      {/* ── WHY IT WORKS ── */}
      <Section title="Why Verification Is Cheap">
        <P>
          The reason this works is a fundamental asymmetry in transformer inference. During <strong>prefill</strong>{' '}
          (processing a prompt), the model sees all tokens at once and processes them in parallel through its
          attention layers. The GPU's tensor cores are fully utilized because the batch of tokens creates large
          matrix multiplications. During <strong>decoding</strong>, the model processes one token at a time —
          the matrix multiplications collapse to matrix-vector products, and the GPU is starved for work.
        </P>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#3B82F6' }}>Prefill (Compute-Bound)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Many tokens processed at once. Large matrix × matrix multiplications. GPU tensor cores fully saturated.
              Processing 5 tokens takes barely longer than processing 1.
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#F59E0B' }}>Decode (Memory-Bound)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              One token at a time. Matrix × vector multiplications. GPU waits for weight loading from HBM.
              Processing 1 token wastes most of the available compute.
            </div>
          </div>
        </div>

        <ParallelViz />

        <P>
          Speculative decoding converts decode-time work into prefill-time work. By feeding <em>K</em> draft tokens
          into the target model simultaneously, you turn <em>K</em> sequential matrix-vector operations into
          one matrix-matrix operation. The wall-clock time barely increases, but you get <em>K</em> tokens
          verified instead of 1 generated.
        </P>
        <Callout type="info">
          <strong>The arithmetic intensity argument:</strong> A single decode step for a 70B model requires
          loading ~140GB of weights from HBM to compute a single output logit vector. Those same 140GB of weights,
          once loaded, could just as easily multiply against 5 or 10 input vectors. The weights are the bottleneck,
          not the computation.
        </Callout>
      </Section>

      {/* ── ACCEPTANCE RATE ── */}
      <Section title="The Acceptance Rate and Expected Speedup">
        <P>
          The speedup from speculative decoding depends almost entirely on the{' '}
          <strong>acceptance rate α</strong> — the probability that the target model agrees with each draft token.
          If the draft model perfectly matches the target, α = 1 and every draft token is accepted, yielding
          maximum speedup. If the draft model is terrible, α ≈ 0 and you waste time drafting tokens that
          are immediately rejected.
        </P>
        <div className="math-box">
          <Latex math={"\\text{Expected tokens per iteration} = \\frac{1 - \\alpha^{K+1}}{1 - \\alpha}"} block />
        </div>
        <PropTable rows={[
          ['α = 0.9, K = 5', '~4.1 tokens per iteration (great — nearly all accepted)'],
          ['α = 0.7, K = 5', '~2.7 tokens per iteration (decent speedup)'],
          ['α = 0.5, K = 5', '~1.9 tokens per iteration (marginal benefit)'],
          ['α = 0.3, K = 5', '~1.4 tokens per iteration (barely worth it)'],
        ]} />
        <P>
          The effective wall-clock speedup also depends on the cost ratio between the draft and target models.
          If the draft model is 1/40th the size, its forward passes are nearly free. But if you use a draft model
          that is 1/3 the size of the target, the overhead of drafting becomes significant and eats into the gains.
        </P>
        <div className="math-box">
          <Latex math={"\\text{Speedup} \\approx \\frac{\\text{Expected accepted tokens}}{1 + K \\cdot c}"} block />
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            where <em>c</em> = cost ratio (draft forward pass / target forward pass)
          </div>
        </div>
        <Callout type="key">
          <strong>Rule of thumb:</strong> Speculative decoding is most effective when (1) the draft model is
          very small relative to the target, and (2) the draft model's distribution closely matches the target's.
          These two goals are in tension — a bigger draft model matches better but costs more.
        </Callout>
      </Section>

      {/* ── DRAFT MODEL CHOICES ── */}
      <Section title="Draft Model Strategies">
        <P>
          The choice of draft model is the single most important design decision in speculative decoding. Several
          strategies have emerged, each with distinct trade-offs.
        </P>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', marginBottom: '20px' }}>
          {[
            { title: 'Independent Small Model', desc: 'Use a separately trained smaller model from the same family (e.g., Llama 3 8B drafting for Llama 3 70B). Simple and effective, but requires maintaining two models in memory.', color: '#3B82F6' },
            { title: 'Self-Drafting (Layer Skipping)', desc: 'Use a subset of the target model\'s own layers as the draft model (e.g., exit early after layer 8 of 80). No additional memory cost, but typically lower acceptance rates.', color: '#10B981' },
            { title: 'Medusa Heads (Cai et al., 2024)', desc: 'Attach multiple lightweight prediction heads to the target model. Each head predicts a different future token position. No separate draft model needed — the heads are tiny MLPs trained on top of the target model\'s hidden states.', color: '#8B5CF6' },
            { title: 'EAGLE (Li et al., 2024)', desc: 'Trains a lightweight autoregressive head on top of the target model\'s hidden states to draft tokens. Achieves higher acceptance rates than Medusa by modeling token dependencies in the draft.', color: '#F59E0B' },
            { title: 'Prompt Lookup Decoding', desc: 'No draft model at all. Instead, look for n-gram matches in the prompt itself to predict continuations. Works remarkably well for tasks like summarization or code editing where the output overlaps with the input.', color: '#EF4444' },
          ].map(({ title, desc, color }, i) => (
            <div key={i} style={{ padding: '16px', border: '1px solid var(--border)', background: 'white', borderLeft: `4px solid ${color}` }}>
              <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TREE-BASED ── */}
      <Section title="Tree-Based Speculative Decoding">
        <P>
          Standard speculative decoding proposes a single linear chain of <em>K</em> tokens. But what if the
          draft model is uncertain at some position? A single wrong guess at position 2 means positions 3, 4, 5
          are all wasted. <strong>Tree-based speculation</strong> solves this by proposing multiple alternative
          continuations, forming a tree of candidates.
        </P>
        <P>
          At each draft position, instead of committing to one token, the draft model proposes the top-<em>b</em>{' '}
          most likely tokens, branching the speculation into a tree. The target model then verifies all branches
          in parallel using{' '}
          <HoverCard term="tree attention">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Tree Attention</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              A modified attention mask that respects the tree structure of the draft. Each node in the tree can only
              attend to its ancestors, not its siblings. This is implemented by constructing a custom causal mask
              that follows the tree topology.
            </div>
          </HoverCard>{' '}
          — a specially constructed attention mask that encodes the tree structure. The longest accepted path
          through the tree becomes the accepted output.
        </P>
        <Callout type="info">
          <strong>SpecInfer (Miao et al., 2024)</strong> showed that tree-based speculation can improve acceptance
          length by 1.5–2× compared to linear speculation, at the cost of verifying more candidate tokens per
          iteration. The sweet spot depends on how uncertain the draft model is at each position.
        </Callout>
      </Section>

      {/* ── WHEN IT SHINES / STRUGGLES ── */}
      <Section title="When It Shines and When It Struggles">
        <P>
          Speculative decoding is not uniformly beneficial. Its effectiveness varies dramatically across tasks,
          and understanding when it helps — and when it doesn't — is critical for practical deployment.
        </P>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#10B981' }}>High Speedup Scenarios</div>
            <ul style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '16px' }}>
              <li><strong>Predictable text:</strong> boilerplate code, formulaic writing, translations</li>
              <li><strong>Continuation tasks:</strong> where output resembles input (summarization, editing)</li>
              <li><strong>Low temperature:</strong> greedy or near-greedy sampling (higher acceptance rate)</li>
              <li><strong>Large target model:</strong> the bigger the target, the more decode time is wasted</li>
            </ul>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#EF4444' }}>Low Speedup Scenarios</div>
            <ul style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '16px' }}>
              <li><strong>Creative writing:</strong> high entropy, many equally valid continuations</li>
              <li><strong>High temperature:</strong> random sampling reduces agreement between models</li>
              <li><strong>Domain mismatch:</strong> draft model trained on different data than target</li>
              <li><strong>Small target model:</strong> less room for decode-time inefficiency to exploit</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ── PRODUCTION ── */}
      <Section title="Speculative Decoding in Production">
        <P>
          As of 2025, speculative decoding has moved from a research curiosity to a production staple. Major
          inference frameworks and API providers have adopted it as a default optimization.
        </P>
        <PropTable rows={[
          ['vLLM', 'Supports speculative decoding with configurable draft models and speculation length.'],
          ['TensorRT-LLM (NVIDIA)', 'Built-in support for draft-model and Medusa-style speculation.'],
          ['Hugging Face TGI', 'Integrated speculative decoding for served models.'],
          ['Google (Gemini)', 'Uses speculative decoding internally for inference serving.'],
          ['Anthropic (Claude)', 'Confirmed use of speculative decoding techniques for faster inference.'],
          ['Together AI', 'Offers speculative decoding as a configurable option in their API.'],
        ]} />
        <Callout type="accent">
          <strong>The industry consensus:</strong> speculative decoding is now considered a <strong>standard
          optimization</strong> for LLM serving, alongside KV caching, continuous batching, and quantization.
          It is one of the few techniques that offers genuine speedup with zero quality loss.
        </Callout>
      </Section>

      {/* ── QUICK REF ── */}
      <Section title="Quick Reference">
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--border)' }}>
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Concept</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Key Idea</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>One-Line Summary</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Draft-Verify Loop', 'Small model guesses, big model checks', 'Convert sequential decode into parallel verify'],
              ['Rejection Sampling', 'min(1, p(x)/q(x))', 'Accept draft if target agrees at least as much'],
              ['Acceptance Rate (α)', 'P(target accepts draft)', 'Higher α = more tokens per iteration = more speedup'],
              ['Tree Speculation', 'Branch at uncertain positions', 'Multiple candidates verified in one pass via tree attention'],
              ['Medusa / EAGLE', 'Lightweight heads on target', 'No separate draft model — heads predict future tokens'],
              ['Lossless Guarantee', 'Output ≡ target distribution', 'Rejection sampling ensures exact equivalence'],
            ].map(([c, eq, s], i) => (
              <tr key={i}>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{c}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: '"Fira Code", monospace', fontSize: '12px' }}>{eq}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── REFERENCES ── */}
      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2211.17192" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Fast Inference from Transformers via Speculative Decoding
            </a> — Leviathan, Kalman & Matias, 2023. The foundational paper that introduced speculative decoding with the rejection sampling guarantee.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2302.01318" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Accelerating Large Language Model Decoding with Speculative Sampling
            </a> — Chen, Borgeaud, Irving et al. (DeepMind), 2023. Independent concurrent work establishing the same framework.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2401.10774" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads
            </a> — Cai et al., 2024. Draft-free speculation using parallel prediction heads.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2401.15077" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty
            </a> — Li et al., 2024. Autoregressive draft heads achieving state-of-the-art acceptance rates.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2305.09781" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              SpecInfer: Accelerating LLM Serving with Tree-based Speculative Inference
            </a> — Miao et al., 2024. Tree-structured speculation with verified parallel decoding.
          </li>
          <li>
            <a href="https://research.google/blog/looking-back-at-speculative-decoding/" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Looking Back at Speculative Decoding
            </a> — Google Research Blog. An accessible overview from the original authors.
          </li>
        </ul>
      </Section>

      {/* ── AI DISCLOSURE ── */}
      <div style={{ marginTop: '32px', padding: '16px 20px', background: '#F8F8F8', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-muted)' }}>A note on this article:</strong> This post was written
        with the help of AI. All content has been reviewed, verified against the original papers, and
        checked to ensure it is accurate and up to date as of 2025.
      </div>
    </div>
  );
}
