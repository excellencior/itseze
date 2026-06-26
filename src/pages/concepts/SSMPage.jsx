import React, { useState, useEffect } from 'react';
import Latex from '../../components/Latex';
import HoverCard from '../../components/HoverCard';

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
  return <p>{children}</p>;
}
function Callout({ type = 'info', children }) {
  const colors = {
    info: { bg: 'rgba(59,130,246,0.08)', border: '#3B82F6', icon: 'ℹ️' },
    warning: { bg: 'rgba(245,158,11,0.08)', border: '#F59E0B', icon: '⚠️' },
    key: { bg: 'rgba(16,185,129,0.08)', border: '#10B981', icon: '💡' },
    accent: { bg: 'var(--accent-20)', border: 'var(--accent)', icon: '↩' },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, borderLeft: `4px solid ${c.border}`, padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0', fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)' }}>
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
            <td style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid var(--border)', width: '40%', background: 'var(--node-bg)' }}>{k}</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function CodeBlock({ children }) {
  return (
    <pre style={{ background: '#f6f6f6', border: '1px solid var(--border)', padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.6, marginBottom: '16px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
      {children}
    </pre>
  );
}
function CompTable({ headers, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--border)' }}>
      <thead>
        <tr style={{ background: 'var(--node-bg)' }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ══════════════════════════════════════════
   SSM Recurrence Walkthrough
   ══════════════════════════════════════════ */
export function SSMWalkthrough() {
  const [step, setStep] = useState(0);
  const tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  const stateVals = [
    [0.00, 0.00, 0.00, 0.00],
    [0.10, 0.05, 0.03, 0.08],
    [0.14, 0.13, 0.10, 0.09],
    [0.19, 0.16, 0.17, 0.12],
    [0.17, 0.15, 0.14, 0.18],
    [0.16, 0.14, 0.13, 0.16],
    [0.20, 0.18, 0.19, 0.17],
  ];

  return (
    <div style={{ border: '1px solid var(--border)', background: 'white', padding: '20px 24px', marginTop: '16px', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '12px' }}>
        Walkthrough — SSM Recurrence: Processing Tokens One by One
      </div>

      {/* Token display */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tokens.map((t, i) => (
          <span key={i} style={{
            display: 'inline-block', padding: '4px 10px',
            border: `1.5px solid ${i < step ? '#10B981' : i === step ? 'var(--accent)' : 'var(--border)'}`,
            background: i < step ? '#F0FDF4' : i === step ? 'var(--accent-20)' : '#FAFAFA',
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            fontWeight: i <= step ? 700 : 500,
            color: i < step ? '#166534' : i === step ? 'var(--accent)' : 'var(--text-light)',
          }}>{t}</span>
        ))}
      </div>

      {/* State vector */}
      <div style={{ padding: '12px 16px', background: 'var(--node-bg)', border: '1px solid var(--border)', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', marginBottom: '8px' }}>
          Hidden state h{step > 0 ? `₍${step}₎` : '₍₀₎'} = [{stateVals[step].map(v => v.toFixed(2)).join(', ')}]
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {stateVals[step].map((v, i) => (
            <div key={i} style={{
              flex: 1, height: '24px', background: `rgba(8, 145, 178, ${v * 3})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, color: v > 0.1 ? '#fff' : 'var(--text-light)',
              fontFamily: 'var(--font-mono)',
            }}>{v.toFixed(2)}</div>
          ))}
        </div>
      </div>

      {/* Equation */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
        {step === 0
          ? 'h₀ = [0, 0, 0, 0]  (initial state — no tokens processed yet)'
          : `h₍${step}₎ = Ā · h₍${step-1}₎ + B̄ · embed("${tokens[step-1]}")  →  [${stateVals[step].map(v => v.toFixed(2)).join(', ')}]`
        }
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
          style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 600, background: 'none', border: '1px solid var(--border)', color: step === 0 ? 'var(--text-light)' : 'var(--text-muted)', cursor: step === 0 ? 'default' : 'pointer', fontFamily: 'inherit', opacity: step === 0 ? 0.4 : 1 }}>
          ← Previous
        </button>
        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Step {step} of {tokens.length}</span>
        <button onClick={() => setStep(s => Math.min(tokens.length, s + 1))} disabled={step === tokens.length}
          style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 600, background: step === tokens.length ? 'none' : 'var(--accent)', border: step === tokens.length ? '1px solid var(--border)' : 'none', color: step === tokens.length ? 'var(--text-light)' : '#fff', cursor: step === tokens.length ? 'default' : 'pointer', fontFamily: 'inherit', opacity: step === tokens.length ? 0.4 : 1 }}>
          Next →
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Attention vs SSM Comparison Viz
   ══════════════════════════════════════════ */
export function AttnVsSSMViz() {
  const [mode, setMode] = useState('attention');
  const [animate, setAnimate] = useState(false);
  useEffect(() => { setAnimate(false); const t = setTimeout(() => setAnimate(true), 80); return () => clearTimeout(t); }, [mode]);

  const tab = (active) => ({
    padding: '6px 16px', fontSize: '12px', fontWeight: active ? 700 : 500,
    color: active ? 'var(--accent)' : 'var(--text-light)',
    background: 'none', border: 'none', cursor: 'pointer',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    fontFamily: 'inherit', marginBottom: '-2px', transition: 'color 0.15s, border-color 0.15s',
  });

  const N = 6;
  return (
    <div style={{ border: '1px solid var(--border)', background: 'white', padding: '20px 24px', marginTop: '16px', marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '12px' }}>
        Processing Strategy Comparison
      </div>
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '20px' }}>
        <button style={tab(mode === 'attention')} onClick={() => setMode('attention')}>Transformer (Attention)</button>
        <button style={tab(mode === 'ssm')} onClick={() => setMode('ssm')}>SSM (State Space)</button>
      </div>

      {mode === 'attention' ? (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>Every token attends to every other token — O(L²)</div>
          <div style={{ display: 'grid', gridTemplateColumns: `32px repeat(${N}, 1fr)`, gap: '2px', marginBottom: '14px' }}>
            <div />
            {Array.from({length: N}).map((_, i) => (
              <div key={i} style={{ fontSize: '10px', fontWeight: 700, textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>t{i+1}</div>
            ))}
            {Array.from({length: N}).map((_, r) => (
              <React.Fragment key={r}>
                <div style={{ fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>t{r+1}</div>
                {Array.from({length: N}).map((_, c) => (
                  <div key={c} style={{
                    height: '28px', background: '#3B82F6',
                    opacity: animate ? (0.3 + Math.random() * 0.7) : 0.1,
                    transition: `opacity 0.5s ease ${(r * N + c) * 0.02}s`,
                  }} />
                ))}
              </React.Fragment>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#991B1B', fontWeight: 600 }}>
            {N}×{N} = {N*N} attention scores computed. Doubles sequence → 4× the cost.
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>Each token updates a fixed size state — O(L)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
            {Array.from({length: N}).map((_, i) => (
              <React.Fragment key={i}>
                <div style={{
                  width: '48px', height: '32px', background: '#10B981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)',
                  opacity: animate ? 1 : 0.1, transition: `opacity 0.4s ease ${i * 0.1}s`,
                }}>t{i+1}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 300 }}>→</div>
              </React.Fragment>
            ))}
            <div style={{
              padding: '6px 12px', border: '2px solid #10B981', background: '#F0FDF4',
              fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
              opacity: animate ? 1 : 0.1, transition: 'opacity 0.5s ease 0.6s',
            }}>h (fixed size)</div>
          </div>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
            {N} state updates. Doubles sequence → 2× the cost. State size stays constant.
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════ */
export default function SSMPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto', transition: 'width 0.45s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>Concept</div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>State Space Models (SSMs)</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          From classical control theory to Mamba and beyond — how a 60 year old mathematical framework
          became the leading alternative to Transformers for efficient sequence modeling.
        </p>
      </div>

      {/* ══ 1. THE QUADRATIC WALL ══ */}
      <Section title="The Quadratic Wall">
        <P>
          Transformers revolutionized sequence modeling with the{' '}
          <HoverCard term="attention mechanism">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Attention Mechanism</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              The core operation of a Transformer. Each token computes a similarity score against every other
              token, producing a weighted sum of value vectors. This enables direct, content based access to
              any position in the sequence regardless of distance.
            </div>
          </HoverCard>
          . But attention has a fundamental computational limitation that becomes devastating at scale.
        </P>
        <P>
          The matrix multiplication <code>Q · Kᵀ</code> produces a score matrix of shape
          (sequence_length × sequence_length). Every token must compute a similarity score against
          every other token. The cost grows <strong>quadratically</strong> — doubling the sequence length
          quadruples the computation.
        </P>
        <CompTable
          headers={['Sequence Length', 'Score Matrix Size', 'Relative Cost']}
          rows={[
            ['512', '262,144', '1×'],
            ['2,048', '4,194,304', '16×'],
            ['8,192', '67,108,864', '256×'],
            ['32,768', '1,073,741,824', '4,096×'],
            ['131,072', '17,179,869,184', '65,536×'],
          ]}
        />
        <P>
          Beyond computation, there is a <strong>memory</strong> problem. During autoregressive generation,
          Transformers must store a{' '}
          <HoverCard term="KV Cache">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>KV Cache</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              The Key and Value matrices stored for every previously generated token, across every layer
              and every attention head. This cache allows the model to avoid recomputing attention for past
              tokens during generation, but grows linearly with sequence length and can consume tens of
              gigabytes of GPU memory.
            </div>
          </HoverCard>
          {' '}that grows linearly with sequence length. For a 7B parameter model at 128K context, the
          KV cache alone can exceed 32 GB — more than many GPUs can hold.
        </P>
        <Callout type="warning">
          <strong>The central question SSMs answer:</strong> What if we could process sequences in linear
          time with constant memory? Instead of computing pairwise relationships between all tokens (quadratic),
          maintain a <strong>fixed size hidden state</strong> that evolves with each new token. Cost per
          token: O(1). Total cost: O(L). Memory: constant.
        </Callout>

        <AttnVsSSMViz />
      </Section>

      {/* ══ 2. ORIGINS ══ */}
      <Section title="Origins: State Space Models in Control Theory">
        <P>
          State Space Models did not originate in machine learning. They are a cornerstone of{' '}
          <strong>control theory and signal processing</strong>, dating back to the work of Rudolf Kalman
          in the late 1950s. Understanding these classical roots is essential because modern deep learning
          SSMs directly inherit their mathematical structure.
        </P>
        <P>
          A State Space Model describes a <strong>dynamical system</strong> — any system whose behavior
          evolves over time. The key insight is to model it with two equations:
        </P>
        <div className="math-box">
          <Latex math={"\\dot{x}(t) = Ax(t) + Bu(t) \\quad \\text{(state equation)}"} block />
          <div style={{ marginTop: '8px' }} />
          <Latex math={"y(t) = Cx(t) + Du(t) \\quad \\text{(output equation)}"} block />
        </div>
        <PropTable rows={[
          [<Latex math="u(t)" />, 'Input signal — the external driving signal (e.g., a token embedding)'],
          [<Latex math="x(t)" />, 'Hidden state — a compressed summary of all past inputs (shape: N × 1)'],
          [<Latex math="y(t)" />, 'Output signal — computed from the current state'],
          [<Latex math="A" />, 'State matrix (N × N) — governs how the state evolves over time'],
          [<Latex math="B" />, 'Input matrix (N × 1) — controls how the input influences the state'],
          [<Latex math="C" />, 'Output matrix (1 × N) — controls how the state maps to the output'],
          [<Latex math="D" />, 'Feedthrough matrix — direct input to output (often zero)'],
        ]} />
        <P>
          <strong>The Physical Analogy: The Heated Room.</strong> Imagine controlling the temperature of a room.
          The input u(t) is heater power. The hidden state x(t) = [room_temp, wall_temp] captures the internal
          thermal dynamics. The output y(t) is the thermometer reading. Matrix A encodes the physics: heat flows
          from hot surfaces to cold ones, rooms lose heat outside. <strong>The state is a sufficient statistic
          for predicting the future</strong> — you do not need the entire history of heater settings, just
          the current state.
        </P>
        <P>
          The most celebrated application was the{' '}
          <HoverCard term="Kalman Filter">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Kalman Filter (1960)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              An optimal recursive estimator for linear dynamical systems with noise. Used in the Apollo
              program to navigate spacecraft to the Moon. It alternates between predicting the next state
              and correcting the prediction using observations. The deep learning SSM insight: maintain a
              compact, recursively updated state that summarizes all relevant history.
            </div>
          </HoverCard>
          {' '}(1960), which navigated Apollo spacecraft to the Moon using exactly this framework.
          The deep learning versions simply <strong>learn</strong> the matrices A, B, C, D from data
          instead of deriving them from physics.
        </P>
        <Callout type="info">
          <strong>Why were SSMs ignored in early deep learning?</strong> Three reasons: (1) nobody knew how to
          initialize the A matrix for long range memory, (2) the recurrent form is sequential and slow on GPUs,
          and (3) LSTMs were "good enough" for short sequences. It took HiPPO (solving #1) and S4 (solving #2)
          to change this.
        </Callout>
      </Section>

      {/* ══ 3. HiPPO ══ */}
      <Section title="The HiPPO Framework: Teaching SSMs to Remember (2020)">
        <P>
          The story of modern deep learning SSMs begins with a single paper:{' '}
          <strong>"HiPPO: Recurrent Memory with Optimal Polynomial Projections"</strong> by Albert Gu,
          Tri Dao, Stefano Ermon, Atri Rudra, and Christopher Ré (NeurIPS 2020). This paper solved the
          most fundamental problem: how should we initialize the state matrix A so that the hidden state
          actually remembers the input history?
        </P>
        <P>
          Consider a sequence model at time step t. It has seen inputs u₁, u₂, …, uₜ. The hidden state
          xₜ is a fixed size vector (say, N = 64 dimensions). How can 64 numbers faithfully represent a
          history of thousands of inputs? The answer: fit the <strong>best polynomial approximation</strong> to
          the input history. The N coefficients of this polynomial become the state vector.
        </P>
        <CodeBlock>{`Input history:  u₁, u₂, u₃, ..., u₁₀₀₀   (1000 values)

Compress to:    c₀, c₁, c₂, ..., c₆₃       (64 coefficients)
                representing:  f(t) ≈ c₀ + c₁t + c₂t² + ... + c₆₃t⁶³

The polynomial f(t) is the "best" approximation of the input history
in the least squares sense.`}</CodeBlock>
        <P>
          HiPPO formalized this using{' '}
          <HoverCard term="orthogonal polynomials">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Orthogonal Polynomials</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              A family of polynomials (Legendre, Laguerre, etc.) where each polynomial is "perpendicular"
              to all others under a specific inner product. This orthogonality means each coefficient captures
              independent information about the signal, leading to optimal compression with no redundancy.
            </div>
          </HoverCard>
          {' '}(Legendre, Laguerre) and showed that the coefficients can be maintained <strong>online</strong> —
          updated incrementally as each new input arrives — using a state space model with a specific,
          mathematically derived A matrix.
        </P>
        <CompTable
          headers={['Property', 'Random A Matrix', 'HiPPO A Matrix']}
          rows={[
            ['Memory of distant past', 'Decays exponentially', 'Preserved optimally'],
            ['Initialization quality', 'Requires extensive tuning', 'Mathematically optimal from the start'],
            ['Long range dependency', 'Fails beyond ~100 steps', 'Works for 10,000+ steps'],
            ['Theoretical guarantee', 'None', 'Optimal polynomial approximation of input history'],
          ]}
        />
        <Callout type="key">
          <strong>The Big Insight:</strong> HiPPO showed that long range memory in sequence models is
          fundamentally a <strong>function approximation problem</strong>. The hidden state should be thought
          of as the coefficients of an optimal polynomial approximation. This reframing — from "learned memory"
          to "optimal compression" — was the conceptual breakthrough that enabled everything that followed.
        </Callout>
      </Section>

      {/* ══ 4. DISCRETIZATION ══ */}
      <Section title="From Continuous to Discrete: Processing Digital Data">
        <P>
          The equations above describe a <strong>continuous time</strong> system. But computers process
          <strong> discrete</strong> sequences. We need to convert the continuous SSM into a discrete one
          using a <strong>step size</strong>{' '}
          <HoverCard term="Δ (Delta)">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Step Size Δ (Delta)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Controls the effective resolution at which the SSM samples the continuous dynamics.
              Small Δ = fine resolution (detailed processing). Large Δ = coarse resolution (fast skimming).
              In S4, Δ is a learned parameter. In Mamba, Δ becomes input dependent — different for every
              token — enabling selective behavior.
            </div>
          </HoverCard>
          {' '}that transforms continuous matrices into discrete ones.
        </P>
        <div className="math-box">
          <Latex math={"h_k = \\bar{A} \\cdot h_{k-1} + \\bar{B} \\cdot u_k \\quad \\text{(state update)}"} block />
          <div style={{ marginTop: '8px' }} />
          <Latex math={"y_k = C \\cdot h_k + D \\cdot u_k \\quad \\text{(output)}"} block />
        </div>
        <P>
          The discrete matrices <Latex math="\bar{A}" /> and <Latex math="\bar{B}" /> are computed from
          the continuous ones via discretization rules like <strong>Zero Order Hold (ZOH)</strong> — which
          assumes the input stays constant between samples — or the <strong>Bilinear Transform</strong>.
        </P>

        <SSMWalkthrough />

        <P>
          The most remarkable property of discretized SSMs is that the <strong>same model</strong> can be
          viewed through three completely different computational lenses:
        </P>
        <CompTable
          headers={['View', 'Cost', 'Parallelism', 'Best For']}
          rows={[
            ['Recurrence (RNN mode)', 'O(L)', 'Sequential', 'Inference — generate one token at a time'],
            ['Convolution (CNN mode)', 'O(L log L)', 'Fully parallel', 'Training — process whole sequences via FFT'],
            ['Matrix multiply', 'O(L)', 'Chunkwise parallel', 'Training with Tensor Core optimization (Mamba 2)'],
          ]}
        />
        <Callout type="key">
          <strong>The duality superpower:</strong> Train like a CNN (fast, parallel), deploy like an RNN
          (efficient, streaming). No other architecture family offers this flexibility.
        </Callout>
      </Section>

      {/* ══ 5. S4 ══ */}
      <Section title="S4: The First Practical Deep Learning SSM (2022)">
        <P>
          With HiPPO providing the initialization and discretization providing the computational framework,
          the stage was set for <strong>S4: Structured State Spaces for Sequence Modeling</strong> by Albert
          Gu, Karan Goel, and Christopher Ré (ICLR 2022). S4 was the first SSM to achieve genuinely
          competitive results with Transformers.
        </P>
        <P>
          The key computational challenge: computing the convolution kernel requires repeated matrix powers
          of Ā, which is expensive and numerically unstable for long sequences. S4 solved this by
          parameterizing A as{' '}
          <HoverCard term="NPLR">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Normal Plus Low Rank (NPLR)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              A decomposition of the state matrix A as the sum of a normal (diagonalizable) matrix and a
              low rank correction. This structure allows the convolution kernel to be computed efficiently
              using techniques from numerical linear algebra (Cauchy kernel, Woodbury identity), reducing
              the cost to O(N + L) from what would otherwise be intractable.
            </div>
          </HoverCard>
          , allowing the convolution kernel to be computed in O(N + L) time.
        </P>
        <P>
          S4 was evaluated on the <strong>Long Range Arena (LRA)</strong> benchmark. The results were striking:
        </P>
        <CompTable
          headers={['Task', 'Sequence Length', 'Transformer', 'S4']}
          rows={[
            ['ListOps', '2,048', '36.37%', '58.35%'],
            ['Text', '4,096', '64.27%', '76.02%'],
            ['Retrieval', '4,000', '57.46%', '87.09%'],
            ['Image', '1,024', '42.44%', '88.65%'],
            ['Pathfinder', '1,024', '71.40%', '94.20%'],
            ['Path X', '16,384', 'FAIL (random)', '96.35%'],
            ['Average', '', '53.66%', '86.09%'],
          ]}
        />
        <P>
          S4 sparked a wave of successors — S4D (diagonal simplification), DSS, GSS (gated), S5 (MIMO
          formulation), H3 (Hungry Hungry Hippos), and Hyena (long convolutions). But all shared one
          critical limitation: they were <strong>Linear Time Invariant (LTI)</strong>. Their parameters
          were fixed regardless of input content, meaning they could not selectively focus on specific
          tokens the way attention does.
        </P>
      </Section>

      {/* ══ 6. MAMBA ══ */}
      <Section title="Mamba: The Selection Breakthrough (2023)">
        <P>
          In December 2023, Albert Gu and Tri Dao released <strong>"Mamba: Linear Time Sequence Modeling
          with Selective State Spaces"</strong> — a paper that fundamentally changed the SSM landscape by
          solving the biggest remaining weakness: the inability to selectively process content.
        </P>
        <P>
          <strong>The LTI Problem:</strong> All prior SSMs processed every token with identical dynamics.
          The model could not decide to "pay more attention" to important tokens while skimming filler.
          Attention is <strong>content aware</strong> (what matters depends on what the tokens say); LTI
          SSMs are <strong>content blind</strong> (the dynamics are fixed regardless of content).
        </P>
        <P>
          <strong>Mamba's solution:</strong> make the SSM parameters <strong>depend on the input</strong>.
          Specifically, three of the four core parameters become input dependent:
        </P>
        <CompTable
          headers={['Parameter', 'Before Mamba (LTI)', 'Mamba (Selective)', 'Controls']}
          rows={[
            ['Δ (step size)', 'Fixed scalar', 'Input dependent (per token)', 'How much to update state vs. retain old state'],
            ['B (input matrix)', 'Fixed', 'Input dependent (per token)', 'How current input is written into state'],
            ['C (output matrix)', 'Fixed', 'Input dependent (per token)', 'How state is read to produce output'],
            ['A (state matrix)', 'Fixed (HiPPO)', 'Fixed (modulated by Δ)', 'Base dynamics of state evolution'],
          ]}
        />
        <P>
          The key insight is that <strong>Δ acts as a gate</strong>:
        </P>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px', color: '#166534' }}>Large Δ</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Ā ≈ 0 (forget old state), B̄ is large (write new input).<br />
              <strong>"This token is important — store it!"</strong>
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '6px', color: '#92400E' }}>Small Δ</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Ā ≈ 1 (keep old state), B̄ ≈ 0 (ignore new input).<br />
              <strong>"This token is filler — skip it."</strong>
            </div>
          </div>
        </div>
        <P>
          Making parameters input dependent broke the convolution view (the kernel changes at every step),
          so Mamba could not use FFT based training. Gu and Dao solved this with a{' '}
          <HoverCard term="parallel scan">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Parallel Scan Algorithm</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              The recurrence h_k = a_k · h_(k−1) + b_k is an associative operation. This means it can be
              computed using a parallel prefix sum (scan) with O(log L) depth instead of O(L) sequential
              steps. Mamba implements this entirely in GPU SRAM with kernel fusion and recomputation to
              minimize memory bandwidth bottlenecks.
            </div>
          </HoverCard>
          {' '}algorithm that runs in O(log L) depth on GPU, plus three critical optimizations: kernel
          fusion (all SSM ops in one GPU kernel), recomputation (trade compute for memory during
          backpropagation), and SRAM utilization (fast on chip memory instead of slow HBM).
        </P>
        <P>
          Mamba was the <strong>first SSM to match Transformers at scale</strong> across language,
          audio, and genomics — with 5× faster generation throughput, no KV cache, and linear scaling
          to million length sequences.
        </P>
        <Callout type="key">
          <strong>The Deep Insight:</strong> Mamba's selection mechanism is a continuous, learned
          generalization of a gate. LSTMs had discrete gates. Attention has soft gates (attention weights).
          Mamba has a <strong>resolution gate (Δ)</strong> that controls the granularity at which each
          token is processed. All three solve the same problem — deciding what to remember and what to
          forget — but Mamba does it within a linear time framework.
        </Callout>
      </Section>

      {/* ══ 7. MAMBA 2 ══ */}
      <Section title="Mamba 2 and State Space Duality (2024)">
        <P>
          In mid 2024, Gu and Dao revealed a deep mathematical connection: <strong>selective SSMs and a
          specific form of structured attention are mathematically equivalent</strong>. If you restrict the
          state matrix A to be a scalar times identity, the SSM output at position k is a weighted sum of
          all past inputs — identical to linear attention with an exponential decay mask.
        </P>
        <CompTable
          headers={['Concept', 'Attention', 'Selective SSM (via SSD)']}
          rows={[
            ['Weight computation', 'softmax(Q·Kᵀ/√d)', 'C_k · B_j · (product of decay factors)'],
            ['Value aggregation', 'Weighted sum of V', 'Weighted sum of u (inputs)'],
            ['Causal structure', 'Lower triangular mask', 'Exponential decay mask'],
            ['Complexity', 'O(L²)', 'O(L) via recurrence'],
          ]}
        />
        <P>
          The SSD framework enabled Mamba 2 to be <strong>2 to 8 times faster</strong> than Mamba 1 by
          reformulating the selective scan as structured matrix multiplications that run on highly optimized
          GPU Tensor Cores. Key changes: larger state dimension (64 to 256 vs. 16), multi head structure,
          and simplified parameterization.
        </P>
      </Section>

      {/* ══ 8. THE ACHILLES HEEL ══ */}
      <Section title="The Achilles Heel: Why Pure SSMs Struggle with Fine Grained Recall">
        <P>
          Despite Mamba's impressive results, researchers quickly identified a fundamental weakness. The
          core strength of SSMs — compressing all history into a <strong>fixed size state</strong> — is
          also their core weakness.
        </P>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white', borderLeft: '4px solid #3B82F6' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#1E40AF' }}>Transformer (Attention)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Like having a <strong>complete recording</strong> of every lecture. Want to recall what was
              said at minute 42? Just look it up. Exact, verbatim recall.<br />
              <strong>Cost:</strong> Storage proportional to everything recorded.
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#166534' }}>SSM (State Space)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Like taking <strong>handwritten notes</strong>. Great summary of key themes, but the exact
              wording? Lost. You have the gist, not the recording.<br />
              <strong>Cost:</strong> Notebook is always the same size.
            </div>
          </div>
        </div>
        <P>
          <strong>Three systematic failure modes</strong> have been identified in pure SSMs:
        </P>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', marginBottom: '16px' }}>
          {[
            { title: 'Associative Recall', desc: 'Retrieving a specific value associated with a specific key (e.g., "A→7, B→3, C→9 … Query: C→?"). Attention looks up directly; SSMs must extract from compressed state where individual associations get muddled.', color: '#EF4444' },
            { title: 'Verbatim Copying', desc: 'Reproducing exact sequences from the input. Attention directly attends to original tokens; SSMs must reconstruct from compressed state, often paraphrasing rather than reproducing verbatim.', color: '#F59E0B' },
            { title: 'Recency Bias', desc: 'SSMs tend to weight recent tokens more heavily than distant ones. Information at position 100 may be overwritten by position 9,900, even when the earlier information is the correct answer.', color: '#8B5CF6' },
          ].map(({ title, desc, color }, i) => (
            <div key={i} style={{ padding: '12px 16px', border: '1px solid var(--border)', background: 'white', borderLeft: `4px solid ${color}` }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Failure Mode {i+1}: {title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
        <Callout type="warning">
          <strong>The Fundamental Tension:</strong> There is a deep, arguably irreducible tension between
          <strong> compression efficiency</strong> (fixed size state, linear cost) and <strong>retrieval
          fidelity</strong> (exact recall of arbitrary past tokens). Transformers pay the quadratic cost to
          achieve perfect retrieval. SSMs pay linear cost but sacrifice retrieval precision. The question
          becomes: can we get the best of both?
        </Callout>
      </Section>

      {/* ══ 9. HYBRID ARCHITECTURES ══ */}
      <Section title="Hybrid Architectures: The Best of Both Worlds (2024 to 2026)">
        <P>
          The realization that SSMs and Transformers have <strong>complementary strengths</strong> led to
          a surge of hybrid architectures that combine both mechanisms. This is arguably the most
          important trend in sequence modeling as of 2026.
        </P>
        <CompTable
          headers={['Capability', 'Attention', 'SSM']}
          rows={[
            ['Global context summarization', 'Expensive (quadratic)', '★ Excellent (linear, compressed state)'],
            ['Fine grained token recall', '★ Excellent (direct lookup)', 'Weak (compression loss)'],
            ['Long range memory', 'Degrades with length (cost)', '★ Constant cost per token'],
            ['Associative reasoning', '★ Strong (key value lookup)', 'Weak (state interference)'],
            ['Streaming / real time', 'Difficult (growing KV cache)', '★ Natural (fixed state)'],
            ['Inference memory', 'O(L) KV cache', '★ O(1) constant state'],
          ]}
        />

        <P>
          <strong>Jamba (AI21 Labs, 2024)</strong> was one of the first production grade hybrids. It
          interleaves ~7 Mamba layers per 1 attention layer — roughly 87% efficient SSM compute with
          strategic attention "recall checkpoints." The result: Transformer level quality with drastically
          reduced KV cache size and 256K token context windows.
        </P>

        <P>
          <strong>Hymba (NVIDIA Research, ICLR 2025)</strong> takes a fundamentally different approach.
          Instead of stacking SSM and attention layers sequentially, it runs attention heads and SSM
          heads <strong>in parallel within the same layer</strong>.
        </P>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#F59E0B' }}>Sequential Stacking (Jamba)</div>
            <CodeBlock>{`Input → [SSM] → [SSM] → [SSM] → [Attn] → [SSM]
                                  ↑
                      Details may be compressed
                      away before attention sees them`}</CodeBlock>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#10B981' }}>Parallel Fusion (Hymba)</div>
            <CodeBlock>{`Input → ┌─ [Attention Heads] ─┐
        │                     │ → Fuse
        └─ [SSM Heads]  ──────┘

Every layer has BOTH capabilities.
No information lost between stages.`}</CodeBlock>
          </div>
        </div>

        <P>
          Within a single Hymba layer, the multi head computation is split: some heads run full softmax
          attention (fine grained recall), while other heads run selective SSM processing (global context
          sweep). Their outputs are concatenated and linearly projected. Every layer produces a
          representation that is both <strong>globally aware</strong> (from SSM heads) and{' '}
          <strong>locally precise</strong> (from attention heads).
        </P>

        <P>
          Hymba also introduces <strong>learnable meta tokens</strong> — a small set of special tokens
          (typically 8 to 128) prepended to every input. These are not part of the actual input; they are
          learned parameters that act as a "compressed knowledge cache," storing frequently needed
          information to reduce the attention burden.
        </P>

        <CompTable
          headers={['Metric', 'Hymba 1.5B', 'Llama 3.2 3B', 'Advantage']}
          rows={[
            ['Parameters', '1.5B', '3B', 'Hymba uses half the parameters'],
            ['Average Accuracy', 'Higher', 'Baseline', 'Better quality with fewer parameters'],
            ['KV Cache Size', 'Significantly smaller', 'Baseline', 'SSM heads need no KV cache'],
            ['Throughput', 'Higher', 'Baseline', 'Linear SSM heads are cheaper to compute'],
          ]}
        />

        <Callout type="key">
          <strong>Why Hymba matters:</strong> Rather than asking "SSM or Transformer?", it asks "how can
          these two mechanisms complement each other at the finest granularity?" The answer — parallel
          heads within the same layer — is both elegant and practical. It acknowledges that compression (SSM)
          and retrieval (attention) are fundamentally different cognitive operations, and a model benefits from
          having both available at every stage of processing.
        </Callout>

        <P><strong>Other notable hybrids:</strong></P>
        <CompTable
          headers={['Architecture', 'Organization', 'Year', 'Key Design']}
          rows={[
            ['Griffin', 'Google DeepMind', '2024', 'Local attention + linear recurrences. Powers RecurrentGemma.'],
            ['Zamba', 'Zyphra', '2024', 'SSM backbone with shared attention. Optimized for edge deployment.'],
            ['RWKV 6/7', 'RWKV Foundation', '2024–2025', 'RNN style with constant memory. Open source, community driven.'],
            ['Mamba 3', 'Gu, Dao et al.', '2026', 'Complex valued states and MIMO formulation.'],
          ]}
        />
      </Section>

      {/* ══ 10. QUICK REFERENCE ══ */}
      <Section title="Quick Reference">
        <div className="math-box" style={{ marginBottom: '20px' }}>
          <Latex math={"h_k = \\bar{A} \\cdot h_{k-1} + \\bar{B} \\cdot u_k \\quad \\text{(state update)}"} block />
          <div style={{ marginTop: '8px' }} />
          <Latex math={"y_k = C \\cdot h_k \\quad \\text{(output)}"} block />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--border)' }}>
          <thead>
            <tr style={{ background: 'var(--node-bg)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Concept</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Key Idea</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>One Line Summary</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Fixed size state', 'h ∈ ℝᴺ — same size regardless of sequence length', 'O(1) memory vs. O(L) KV cache'],
              ['HiPPO', 'Optimal polynomial compression of input history', 'How to initialize A for long range memory'],
              ['Three views', 'Recurrence (RNN) / Convolution (CNN) / Matrix multiply', 'Train parallel, deploy sequential'],
              ['Selectivity (Mamba)', 'Input dependent Δ, B, C', 'Content aware gating within linear time'],
              ['SSD (Mamba 2)', 'SSM = structured linear attention', 'Tensor Core optimization, 2 to 8× faster'],
              ['Compression tax', 'Fixed state loses fine grained details', 'Why pure SSMs fail at exact recall'],
              ['Hybrid heads (Hymba)', 'Parallel attention + SSM within each layer', 'Best of both: compression + retrieval'],
            ].map(([c, eq, s], i) => (
              <tr key={i}>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{c}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{eq}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{s}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ══ 11. REFERENCES ══ */}
      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2008.07669" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              HiPPO: Recurrent Memory with Optimal Polynomial Projections
            </a> — Gu, Dao, Ermon, Rudra, Ré, NeurIPS 2020. The memory initialization breakthrough.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2111.00396" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Efficiently Modeling Long Sequences with Structured State Spaces (S4)
            </a> — Gu, Goel, Ré, ICLR 2022. The first practical deep learning SSM.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2312.00752" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Mamba: Linear Time Sequence Modeling with Selective State Spaces
            </a> — Gu and Dao, 2023. The selection breakthrough that matched Transformers at scale.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2405.21060" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality (Mamba 2)
            </a> — Dao and Gu, ICML 2024. The SSM attention duality.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2403.19887" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Jamba: A Hybrid Transformer Mamba Language Model
            </a> — Lieber et al., AI21 Labs, 2024. The first production hybrid.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2411.13676" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Hymba: A Hybrid head Architecture for Small Language Models
            </a> — Dong et al., NVIDIA Research, ICLR 2025. Parallel fusion of attention and SSM heads.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2402.19427" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Griffin: Mixing Gated Linear Recurrences with Local Attention for Efficient Language Models
            </a> — De et al., Google DeepMind, 2024. Powers RecurrentGemma.
          </li>
        </ul>
      </Section>

      {/* ── AI DISCLOSURE ── */}
      <div style={{ marginTop: '32px', padding: '16px 20px', background: 'var(--node-bg)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-light)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-muted)' }}>A note on this article:</strong> This post was written
        with the help of AI. All content has been reviewed, verified against the original papers, and
        checked to ensure it is accurate and up to date as of 2026.
      </div>
    </div>
  );
}
