import React, { useState, useRef, useEffect } from 'react';
import Latex from '../../components/Latex';
import HoverCard from '../../components/HoverCard';

// ── Shared page components ──
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/^\d+\.\s*/, '')
    .trim()
    .replace(/\s+/g, '-');
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
    <div style={{
      background: c.bg, borderLeft: `4px solid ${c.border}`,
      padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',
      fontSize: '14px', lineHeight: 1.6, color: '#333',
    }}>
      <span style={{ marginRight: '8px' }}>{c.icon}</span>{children}
    </div>
  );
}

function PropTable({ rows }) {
  return (
    <table style={{
      width: '100%', borderCollapse: 'collapse', marginBottom: '16px',
      fontSize: '13px', border: '1px solid var(--border)',
    }}>
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

// ── Attention Heatmap ──
function AttentionHeatmap({ tokens, weights }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginTop: '16px', marginBottom: '20px', overflowX: 'auto' }}>
      {/* Matrix */}
      <div style={{ display: 'inline-block', flexShrink: 0 }}>
        {/* Column headers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <div style={{ width: '72px' }} />
          {tokens.map((t, j) => (
            <div key={j} style={{
              width: '44px', textAlign: 'center', fontSize: '11px', fontWeight: 600,
              fontFamily: '"Fira Code", monospace', color: 'var(--text-muted)',
              transform: 'rotate(-35deg)', transformOrigin: 'bottom left',
              height: '30px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}>{t}</div>
          ))}
        </div>
        {/* Rows */}
        {tokens.map((rowToken, i) => (
          <div key={i} className="attn-row" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <div className="attn-lbl" style={{
              width: '72px', fontSize: '12px', fontWeight: 600, textAlign: 'right',
              paddingRight: '10px', fontFamily: '"Fira Code", monospace',
            }}>{rowToken}</div>
            {tokens.map((_, j) => {
              const w = weights[i][j];
              const alpha = Math.min(1, w * 1.2);
              const isHovered = hoveredCell && hoveredCell[0] === i && hoveredCell[1] === j;
              return (
                <div
                  key={j}
                  className="attn-cell"
                  onMouseEnter={() => setHoveredCell([i, j])}
                  onMouseLeave={() => setHoveredCell(null)}
                  style={{
                    width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, cursor: 'pointer',
                    border: isHovered ? '2px solid var(--accent)' : '1px solid var(--border)',
                    background: `rgba(8, 145, 178, ${alpha})`,
                    color: alpha > 0.5 ? '#fff' : 'var(--text-main)',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s, border 0.15s',
                    zIndex: isHovered ? 2 : 1,
                    boxShadow: isHovered ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {w.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hover info panel — fixed to the right */}
      <div style={{
        minWidth: '180px',
        padding: '14px 16px',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        background: '#FAFAFA',
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        alignSelf: 'center',
        transition: 'opacity 0.15s ease',
        opacity: hoveredCell ? 1 : 0.4,
      }}>
        {hoveredCell ? (
          <>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '8px' }}>
              Attention Weight
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong style={{ color: 'var(--text-main)' }}>{tokens[hoveredCell[0]]}</strong>
              <span style={{ margin: '0 4px' }}>→</span>
              <strong style={{ color: 'var(--text-main)' }}>{tokens[hoveredCell[1]]}</strong>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', fontFamily: '"Fira Code", monospace' }}>
              {weights[hoveredCell[0]][hoveredCell[1]].toFixed(4)}
            </div>
          </>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
            Hover over a cell to see the attention weight
          </div>
        )}
      </div>
    </div>
  );
}

// ── Math helpers ──
function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / sum);
}

// Seeded PRNG for reproducible "random" numbers
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function matMul(A, B) {
  const rows = A.length, cols = B[0].length, inner = B.length;
  const C = [];
  for (let i = 0; i < rows; i++) {
    C[i] = [];
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < inner; k++) sum += A[i][k] * B[k][j];
      C[i][j] = sum;
    }
  }
  return C;
}

function transpose(M) {
  return M[0].map((_, j) => M.map(row => row[j]));
}

// ── Compute all attention steps ──
function computeAttentionSteps(tokens, dk) {
  const n = tokens.length;
  const rng = seededRandom(42);
  const randMat = (r, c) => Array.from({ length: r }, () => Array.from({ length: c }, () => (rng() - 0.5) * 2));

  // Step 1: Embeddings (n × dk)
  const X = randMat(n, dk);
  // Weight matrices (dk × dk)
  const Wq = randMat(dk, dk);
  const Wk = randMat(dk, dk);
  const Wv = randMat(dk, dk);

  // Step 2: Projections
  const Q = matMul(X, Wq);
  const K = matMul(X, Wk);
  const V = matMul(X, Wv);

  // Step 3: Raw scores QK^T
  const KT = transpose(K);
  const rawScores = matMul(Q, KT);

  // Step 4: Scaled scores
  const scale = Math.sqrt(dk);
  const scaledScores = rawScores.map(row => row.map(v => v / scale));

  // Step 5: Softmax
  const attnWeights = scaledScores.map(row => softmax(row));

  return { X, Q, K, V, rawScores, scaledScores, attnWeights, scale };
}

// ── Mini matrix display ──
function MiniMatrix({ data, label, highlightRow, highlightCol, accentColor = 'var(--accent)' }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '6px' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'inline-block', fontFamily: '"Fira Code", monospace', fontSize: '11px' }}>
        {data.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
            {row.map((val, j) => {
              const hl = (highlightRow === i) || (highlightCol === j);
              return (
                <div key={j} style={{
                  width: '46px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: hl ? 'var(--accent-20)' : '#F9FAFB',
                  border: `1px solid ${hl ? accentColor : 'var(--border)'}`,
                  color: hl ? accentColor : 'var(--text-muted)',
                  fontWeight: hl ? 700 : 400,
                }}>
                  {val.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full walkthrough ──
function AttentionWalkthrough({ tokens }) {
  const dk = 4;
  const [steps] = useState(() => computeAttentionSteps(tokens, dk));
  const [activeStep, setActiveStep] = useState(0);

  const STEPS = [
    {
      title: 'Input Embeddings',
      desc: `Each token is represented as a ${dk}-dimensional vector. In real models this would be 768+ dimensions, but we use ${dk} to keep things visible.`,
      render: () => <MiniMatrix data={steps.X} label={`X ∈ ℝ⁶ˣ⁴ — one row per token`} />,
    },
    {
      title: 'Q, K, V Projections',
      desc: 'Multiply X by learned weight matrices W_Q, W_K, W_V to get Query, Key, and Value matrices.',
      render: () => (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <MiniMatrix data={steps.Q} label="Q = X · W_Q" accentColor="#3B82F6" />
          <MiniMatrix data={steps.K} label="K = X · W_K" accentColor="#10B981" />
          <MiniMatrix data={steps.V} label="V = X · W_V" accentColor="#8B5CF6" />
        </div>
      ),
    },
    {
      title: 'Raw Attention Scores',
      desc: 'Compute QKᵀ — the dot product between every query and every key. This is a 6×6 matrix where entry [i,j] measures how relevant token j is to token i.',
      render: () => <MiniMatrix data={steps.rawScores} label="S = QKᵀ ∈ ℝ⁶ˣ⁶" />,
    },
    {
      title: 'Scale + Softmax',
      desc: `Divide by √d_k = √${dk} = ${steps.scale.toFixed(2)} to prevent exploding gradients, then apply softmax so each row sums to 1.`,
      render: () => (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <MiniMatrix data={steps.scaledScores} label={`S / √${dk} — scaled scores`} />
          <MiniMatrix data={steps.attnWeights} label="softmax(S / √d_k) — attention weights" accentColor="var(--accent)" />
        </div>
      ),
    },
    {
      title: 'Final Attention Weights',
      desc: 'These are the weights used to blend the Value vectors. Each row is a probability distribution over the full sequence.',
      render: () => <AttentionHeatmap tokens={tokens} weights={steps.attnWeights} />,
    },
  ];

  return (
    <div style={{ marginTop: '20px', marginBottom: '24px' }}>
      {/* Step tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '0', borderBottom: '2px solid var(--border)' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: activeStep === i ? 700 : 500,
              color: activeStep === i ? 'var(--accent)' : 'var(--text-light)',
              background: 'none',
              border: 'none',
              borderBottom: activeStep === i ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: '-2px',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      {/* Active step content */}
      <div style={{ padding: '16px 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
          {STEPS[activeStep].desc}
        </div>
        {STEPS[activeStep].render()}
      </div>
    </div>
  );
}

function generateDemoWeights(tokens) {
  return computeAttentionSteps(tokens, 4).attnWeights;
}

// ── Main Page ──
export default function AttentionPage() {
  const demoTokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];

  return (
    <div style={{
      width: '80%',
      maxWidth: '1200px',
      margin: '0 auto',
      transition: 'width 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Concept
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Attention Mechanisms
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          The mechanism that lets a model dynamically focus on the most relevant parts of its input.
          Attention is the foundational building block of every modern transformer.
        </p>
      </div>

      {/* ── THE BOTTLENECK ── */}
      <Section title="The Bottleneck Problem">
        <P>
          Before attention existed, sequence-to-sequence models (like early machine translation systems) worked by
          reading an entire input sentence and compressing it into a single fixed-size vector. This vector, called the{' '}
          <HoverCard term="context vector">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Context Vector</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              A single hidden state vector (typically 256 to 1024 dimensions) that the encoder produces after processing
              the entire input. The decoder then had to reconstruct the <strong>entire output</strong> from just this one vector.
            </div>
          </HoverCard>, was the only thing the decoder had access to.
        </P>
        <P>
          Think about translating a 50 word paragraph. All the nuance, word order, and meaning of those 50 words
          had to be jammed into a single vector of a few hundred numbers. As sentences got longer,
          translation quality collapsed. This was the <strong>information bottleneck</strong>.
        </P>
        <Callout type="warning">
          <strong>The longer the input, the worse the bottleneck.</strong> Sutskever et al. (2014) showed that
          seq2seq models degraded sharply beyond ~20 tokens because the fixed-size vector simply could not
          encode enough information.
        </Callout>
        <P>
          <span style={{ background: 'var(--accent-20)', borderBottom: '2px solid var(--accent)', padding: '1px 4px' }}>
            Bahdanau, Cho &amp; Bengio (2014) solved this by letting the decoder look back at every encoder state, not just the final one.</span>{' '}
          Instead of one summary vector, the model learned to <em>attend</em> to different parts of the input at each decoding step.
          This was the birth of attention.
        </P>
      </Section>

      {/* ── QKV INTUITION ── */}
      <Section title="The Core Intuition: Query, Key, Value">
        <P>
          Every attention mechanism boils down to three ingredients: a <strong>Query</strong>, a set of <strong>Keys</strong>,
          and a set of <strong>Values</strong>. The analogy is a search engine.
        </P>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px', marginBottom: '20px',
        }}>
          {[
            { title: 'Query (Q)', desc: 'What am I looking for?', detail: 'The current token asking a question about context.', color: '#3B82F6' },
            { title: 'Key (K)', desc: 'What do I contain?', detail: 'Each token advertising what information it holds.', color: '#10B981' },
            { title: 'Value (V)', desc: 'Here\'s my content.', detail: 'The actual information retrieved when a key is matched.', color: '#8B5CF6' },
          ].map(({ title, desc, detail, color }, i) => (
            <div key={i} style={{
              padding: '16px', border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              background: 'white',
            }}>
              <div style={{ fontWeight: 800, marginBottom: '4px', fontSize: '14px', color }}>{title}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{desc}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{detail}</div>
            </div>
          ))}
        </div>
        <P>
          When the word "cat" is being processed, it sends out a query: <em>"Who in this sentence is relevant to me?"</em>{' '}
          Every other word responds with its key. The query is compared against all keys to produce a set of
          attention weights. These weights determine how much of each word's value gets mixed into the final
          representation of "cat".
        </P>
        <Callout type="key">
          <strong>The key insight:</strong> Q, K, and V are not hand-designed. They are <strong>learned linear projections</strong> of
          the input: <Latex math={"Q = XW_Q, \\quad K = XW_K, \\quad V = XW_V"} />. The network learns <em>what to ask</em>,{' '}
          <em>what to advertise</em>, and <em>what to return</em>.
        </Callout>
      </Section>

      {/* ── SCALED DOT-PRODUCT ── */}
      <Section title="Scaled Dot-Product Attention">
        <div className="math-box">
          <Latex math={"\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right) V"} block />
        </div>
        <PropTable rows={[
          ['Inputs', 'Q ∈ ℝⁿˣᵈ, K ∈ ℝⁿˣᵈ, V ∈ ℝⁿˣᵈ'],
          ['Output', 'Weighted combination of V, same shape as Q'],
          ['Complexity', 'O(n² · d) where n = sequence length'],
          ['Used in', 'Every transformer ever built'],
        ]} />
        <P>
          Let's walk through this step by step with concrete numbers. Say we have a 6-token sentence and d_k = 4.
        </P>

        {/* Step-by-step walkthrough */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', margin: '8px 0 20px 0' }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '14px',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, marginTop: '2px',
            }}>1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Compute similarity scores</div>
              <div className="math-box" style={{ margin: '0 0 6px 0', padding: '10px 14px' }}>
                <Latex math={"S = QK^\\top \\in \\mathbb{R}^{n \\times n}"} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Each entry S[i][j] is the dot product between query i and key j. Higher dot product = more relevant.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '14px',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, marginTop: '2px',
            }}>2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Scale to prevent exploding softmax</div>
              <div className="math-box" style={{ margin: '0 0 6px 0', padding: '10px 14px' }}>
                <Latex math={"S_{\\text{scaled}} = \\frac{S}{\\sqrt{d_k}}"} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Without scaling, large d_k causes dot products to grow in magnitude, pushing softmax into saturated regions
                where gradients vanish. Dividing by <Latex math={"\\sqrt{d_k}"} /> keeps the variance at ~1.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '14px',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, marginTop: '2px',
            }}>3</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Normalize with softmax</div>
              <div className="math-box" style={{ margin: '0 0 6px 0', padding: '10px 14px' }}>
                <Latex math={"\\alpha_{ij} = \\text{softmax}_j\\!\\left(\\frac{S_{ij}}{\\sqrt{d_k}}\\right) = \\frac{e^{S_{ij}/\\sqrt{d_k}}}{\\sum_k e^{S_{ik}/\\sqrt{d_k}}}"} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Each row sums to 1. Now α[i][j] is the <strong>attention weight</strong>: how much token i attends to token j.
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '14px',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, marginTop: '2px',
            }}>4</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Weighted sum of values</div>
              <div className="math-box" style={{ margin: '0 0 6px 0', padding: '10px 14px' }}>
                <Latex math={"\\text{output}_i = \\sum_j \\alpha_{ij} \\cdot V_j"} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Each token's output is a blend of all values, weighted by attention. Highly attended tokens contribute more.
              </div>
            </div>
          </div>
        </div>

        <P>
          Let's trace the full computation for "The cat sat on the mat". Click through each step below
          to see how raw embeddings become attention weights:
        </P>
        <AttentionWalkthrough tokens={demoTokens} />
        <P>
          Each row in the final matrix is a probability distribution. The model uses these weights to blend
          the Value vectors, producing a context-aware representation for each token.
        </P>
      </Section>

      {/* ── SELF VS CROSS ── */}
      <Section title="4. Self-Attention vs Cross-Attention">
        <P>
          <span style={{ background: 'var(--accent-20)', borderBottom: '2px solid var(--accent)', padding: '1px 4px' }}>
            Self-attention is what makes transformers transformers.</span>{' '}
          It is the mechanism where a sequence attends to <em>itself</em>. Every token in the input
          simultaneously queries every other token in the same sequence to build a context-aware representation.
        </P>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', marginBottom: '20px',
        }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '8px', color: '#3B82F6' }}>Self-Attention</div>
            <div className="math-box" style={{ margin: '0 0 8px 0', padding: '8px 12px' }}>
              <Latex math={"Q, K, V = XW_Q, \\; XW_K, \\; XW_V"} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Q, K, V all come from the <strong>same input X</strong>. Each token can attend to every other token in the
              same sequence, building rich contextual representations.
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
              Used in: GPT (decoder), BERT (encoder), ViT
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '8px', color: '#10B981' }}>Cross-Attention</div>
            <div className="math-box" style={{ margin: '0 0 8px 0', padding: '8px 12px' }}>
              <Latex math={"Q = XW_Q, \\quad K, V = YW_K, \\; YW_V"} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Q comes from one sequence (decoder), but K and V come from a <strong>different sequence</strong> (encoder output).
              This is how the decoder "reads" the encoder.
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
              Used in: original Transformer, T5, Whisper, Stable Diffusion
            </div>
          </div>
        </div>
        <P>
          In the original Transformer (Vaswani et al., 2017), both types appear. The encoder uses self-attention
          so each source token can see all other source tokens. The decoder uses <strong>causal self-attention</strong> (more on
          that below) plus cross-attention to read the encoder output. Modern decoder-only models like GPT
          use only causal self-attention and have no cross-attention at all.
        </P>
      </Section>

      {/* ── MULTI-HEAD ── */}
      <Section title="5. Multi-Head Attention">
        <div className="math-box">
          <Latex math={"\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\ldots, \\text{head}_h)\\, W^O"} block />
          <div style={{ marginTop: '8px' }}>
            <Latex math={"\\text{where head}_i = \\text{Attention}(QW_i^Q,\\; KW_i^K,\\; VW_i^V)"} />
          </div>
        </div>
        <PropTable rows={[
          ['Heads (h)', 'Typically 12 (base) or 16-96 (large models)'],
          ['Head dimension', 'd_k = d_model / h (e.g., 768/12 = 64)'],
          ['Parameters', 'h separate W_Q, W_K, W_V projections + one W_O'],
          ['GPT-3', '96 heads, d_k = 128, d_model = 12288'],
        ]} />
        <P>
          <span style={{ background: 'var(--accent-20)', borderBottom: '2px solid var(--accent)', padding: '1px 4px' }}>
            A single attention head can only learn one type of relationship.</span>{' '}
          Multi-head attention runs <strong>h parallel attention operations</strong>, each with its own learned projections.
          One head might learn syntactic relationships (subject-verb), another might learn positional proximity,
          and another might capture coreference (pronouns to their antecedents).
        </P>
        <Callout type="key">
          <strong>Why not just use a bigger single head?</strong> Multiple smaller heads are more expressive than one
          large head with the same total parameters. Each head operates in its own{' '}
          <HoverCard term="subspace">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Subspace Projection</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Each head projects Q, K, V into a <strong>lower-dimensional space</strong> (d_model/h dimensions).
              This forces each head to specialize, learning different aspects of the input relationships rather than
              redundantly learning the same patterns.
            </div>
          </HoverCard>, so they naturally learn complementary features.
        </Callout>
        <P>
          After all heads compute their attention, the results are concatenated and passed through a final
          linear projection <Latex math={"W^O"} /> to mix the information from different heads back together.
        </P>
      </Section>

      {/* ── CAUSAL MASKING ── */}
      <Section title="6. Causal (Masked) Attention">
        <P>
          In autoregressive models like GPT, the model generates tokens one at a time, left to right.
          During training, we process the entire sequence at once for efficiency, but the model must not
          be able to "cheat" by looking at future tokens. This is enforced with a <strong>causal mask</strong>.
        </P>
        <div className="math-box">
          <Latex math={"\\text{Mask}_{ij} = \\begin{cases} 0 & \\text{if } j \\leq i \\;\\text{(allowed)} \\\\ -\\infty & \\text{if } j > i \\;\\text{(blocked)} \\end{cases}"} block />
        </div>
        <P>
          The mask is added to the attention scores <em>before</em> softmax. Setting future positions to −∞
          makes their softmax output exactly 0, so no information leaks from the future.
        </P>
        {/* Triangular mask visual */}
        <div style={{ margin: '16px 0 20px 0', overflowX: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#333', marginBottom: '8px' }}>
            Causal mask for a 5-token sequence
          </div>
          <div style={{ display: 'inline-block', fontFamily: '"Fira Code", monospace', fontSize: '13px' }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[0,1,2,3,4].map(j => (
                  <div key={j} style={{
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px',
                    background: j <= i ? 'var(--accent-20)' : '#FEE2E2',
                    color: j <= i ? 'var(--accent)' : '#EF4444',
                    border: `1px solid ${j <= i ? 'var(--accent-50)' : '#FECACA'}`,
                  }}>
                    {j <= i ? '✓' : '−∞'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <Callout type="accent">
          <strong>BERT vs GPT:</strong> BERT uses <strong>bidirectional</strong> self-attention (no mask, every token sees
          everything). GPT uses <strong>causal</strong> self-attention (lower-triangular mask). This is why BERT excels at
          understanding tasks and GPT excels at generation.
        </Callout>
      </Section>

      {/* ── IN PRACTICE ── */}
      <Section title="7. Attention in Practice">
        <P>
          Attention appears in different configurations across the major architectures. The distinction comes down
          to which tokens can see which other tokens, and whether cross-attention is used.
        </P>
        <PropTable rows={[
          ['GPT (decoder-only)', 'Causal self-attention only. Each token sees past tokens + itself. No encoder.'],
          ['BERT (encoder-only)', 'Bidirectional self-attention. Every token sees every other token. No decoder.'],
          ['T5 / Original Transformer', 'Encoder: bidirectional self-attn. Decoder: causal self-attn + cross-attn to encoder.'],
          ['Vision Transformer (ViT)', 'Image split into patches → treated as tokens → bidirectional self-attention.'],
          ['Stable Diffusion', 'Cross-attention between image latents (Q) and text embeddings (K, V) from CLIP.'],
        ]} />
        <Callout type="info">
          <strong>A trend to notice:</strong> the field has largely moved toward <strong>decoder-only</strong> models
          (GPT, Llama, Claude, Gemini). The encoder-decoder architecture is now mostly used in specialized tasks
          like translation and speech recognition (Whisper).
        </Callout>
      </Section>

      {/* ── O(n²) ── */}
      <Section title="8. The O(n²) Problem">
        <P>
          The attention matrix has shape n × n, where n is the sequence length. This means attention is
          <strong> quadratic in both compute and memory</strong>. Double the sequence length, and you
          quadruple the cost. This is why context windows are expensive.
        </P>
        <div className="math-box">
          <Latex math={"\\text{Cost} = O(n^2 \\cdot d)"} block />
        </div>
        <P>
          For GPT-3 with a 2048-token context window, the attention matrix has 2048 × 2048 = ~4.2M entries
          <em> per head, per layer</em>. With 96 heads across 96 layers, that is a staggering amount of computation.
          Scaling to 128K or 1M token contexts requires fundamental algorithmic changes.
        </P>
        <Callout type="key">
          <strong>Solutions people have tried:</strong>{' '}
          <HoverCard term="Flash Attention">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Flash Attention</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              An IO-aware algorithm (Dao et al., 2022) that <strong>fuses</strong> the attention computation into a
              single GPU kernel, avoiding materializing the full n×n matrix in HBM. Gives 2-4× speedup with
              exact (not approximate) attention.
            </div>
          </HoverCard>{' '}
          fuses computation to avoid materializing the full matrix.{' '}
          <HoverCard term="Sparse attention">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Sparse Attention</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Instead of attending to all n tokens, each token only attends to a <strong>subset</strong> (local window +
              some global tokens). Reduces complexity to O(n√n) or O(n log n). Used in Longformer, BigBird.
            </div>
          </HoverCard>{' '}
          limits which tokens attend to each other. Sliding window attention (Mistral) restricts attention to a
          fixed local window.
        </Callout>
      </Section>

      {/* ── QUICK REF ── */}
      <Section title="Quick Reference">
        <table style={{
          width: '100%', borderCollapse: 'collapse', marginBottom: '16px',
          fontSize: '13px', border: '1px solid var(--border)',
        }}>
          <thead>
            <tr style={{ background: '#FAFAFA' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Concept</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Key Equation</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>One-Line Summary</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Scaled Dot-Product', 'softmax(QKᵀ/√d_k)V', 'Core attention: similarity → weights → blend values'],
              ['Self-Attention', 'Q,K,V from same X', 'Token attends to its own sequence'],
              ['Cross-Attention', 'Q from X, K/V from Y', 'Token attends to a different sequence'],
              ['Multi-Head', 'Concat(head₁…h)W_O', 'Parallel heads learn different relationships'],
              ['Causal Mask', 'mask future to −∞', 'Prevents seeing future tokens in generation'],
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
            <a href="https://www.youtube.com/watch?v=eMlx5fFNoYc" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Attention in transformers, visually explained
            </a> — 3Blue1Brown. The absolute best place to understand what attention is and visualize how it works intuitively.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Attention Is All You Need
            </a> — Vaswani et al., 2017. The paper that introduced the Transformer and scaled dot-product attention.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1409.0473" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Neural Machine Translation by Jointly Learning to Align and Translate
            </a> — Bahdanau, Cho & Bengio, 2014. The paper that introduced attention for seq2seq.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1409.3215" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sequence to Sequence Learning with Neural Networks
            </a> — Sutskever, Vinyals & Le, 2014. The encoder-decoder bottleneck that motivated attention.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2205.14135" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              FlashAttention: Fast and Memory-Efficient Exact Attention
            </a> — Dao et al., 2022. IO-aware attention algorithm.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2004.05150" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Longformer: The Long-Document Transformer
            </a> — Beltagy, Peters & Cohan, 2020. Sparse attention for long sequences.
          </li>
          <li>
            <a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              The Illustrated Transformer
            </a> — Jay Alammar's visual walkthrough. Excellent for building intuition.
          </li>
        </ul>
      </Section>

      {/* ── AI DISCLOSURE ── */}
      <div style={{
        marginTop: '32px',
        padding: '16px 20px',
        background: '#F8F8F8',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '13px',
        color: 'var(--text-light)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-muted)' }}>A note on this article:</strong> This post was written
        with the help of AI. All content has been reviewed, verified against the original papers, and
        checked to ensure it is accurate and up to date as of 2025.
      </div>
    </div>
  );
}
