import React, { useState } from 'react';
import Latex from '../../components/Latex';
import Highlight from '../../components/Highlight';
import LinkedLatex from '../../components/LinkedLatex';
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
    <div style={{
      background: c.bg, borderLeft: `4px solid ${c.border}`,
      padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',
      fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)',
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
            <td style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid var(--border)', width: '40%', background: 'var(--node-bg)' }}>{k}</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Encoder Block Diagram ──
export function EncoderBlockDiagram({ onActiveChange }) {
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [lockedLayer, setLockedLayer] = useState(null);

  const layers = [
    {
      id: 'input',
      label: 'Input Embeddings',
      color: '#6366F1',
      detail: <>The embedding layer solves a fundamental representation problem: neural networks operate on continuous vectors, not discrete symbols. A learned lookup table of size <Latex math="|V| \times d" /> maps each token ID to a dense vector in <Latex math="\mathbb{R}^d" />. But a lookup table alone is orderless, so a positional signal must be injected. The original Transformer uses fixed sinusoidal functions at different frequencies; BERT instead learns position embeddings as trainable parameters. Both achieve the same goal: <span className="math-box" style={{ display: 'inline-block', padding: '4px 10px', margin: '4px 0' }}><Latex math="x_i = e_{\text{token}_i} + \text{PE}(i)" /></span> Without positional encoding, the encoder would be a permutation invariant function, unable to distinguish "the cat sat on the mat" from any reordering of those same words. Section 3 below traces a concrete token through this step.</>,
    },
    {
      id: 'mhsa',
      label: 'Multi-Head Self-Attention',
      color: '#3B82F6',
      detail: <>Self attention is the mechanism that gives the Transformer its representational power. Formally, each token's embedding is projected into three separate spaces to produce a Query, a Key, and a Value vector. The attention score between any two tokens is the dot product of one token's Query with the other's Key, scaled by <Latex math="\sqrt{d_k}" /> to prevent the softmax from saturating in high dimensions: <span className="math-box" style={{ display: 'inline-block', padding: '4px 10px', margin: '4px 0' }}><Latex math="\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V" /></span> The "multi head" design is crucial: rather than computing a single attention function over the full <Latex math="d" /> dimensional space, the model runs <Latex math="h" /> independent attention heads in parallel, each operating on a <Latex math="d/h" /> dimensional subspace. This allows different heads to specialize. Empirical probing studies have shown that individual heads learn to track distinct linguistic phenomena: subject verb agreement, coreference chains, syntactic distance, and more. Their outputs are concatenated and linearly projected back to <Latex math="d" /> dimensions.</>,
    },
    {
      id: 'addnorm1',
      label: 'Add & LayerNorm',
      color: '#8B5CF6',
      detail: <>This wrapper addresses a fundamental challenge of deep network optimization. The residual connection (He et al., 2015) ensures the block computes a refinement rather than a replacement: <span className="math-box" style={{ display: 'inline-block', padding: '4px 10px', margin: '4px 0' }}><Latex math="\text{Output} = x + \text{SubLayer}(x)" /></span> During backpropagation, gradients can flow directly through the addition, bypassing the sub layer entirely. This creates an unobstructed gradient path from the loss function back to the earliest layers, which is what makes it possible to train stacks of 12, 24, or even 48 blocks. Layer Normalization (Ba et al., 2016) then rescales the vector to have zero mean and unit variance across the feature dimension, preventing the internal activation distributions from drifting as depth increases. The combination of these two techniques is arguably more important to the Transformer's success than the attention mechanism itself.</>,
    },
    {
      id: 'ffn',
      label: 'Feed-Forward Network',
      color: '#10B981',
      detail: <>If self attention is the "communication" phase (tokens exchange information with each other), the FFN is the "computation" phase (each token processes what it has gathered, in isolation). Architecturally, it is a two layer perceptron with an expansion factor: <span className="math-box" style={{ display: 'inline-block', padding: '4px 10px', margin: '4px 0' }}><Latex math="\text{FFN}(x) = W_2 \cdot \sigma(W_1 x + b_1) + b_2" /></span> where <Latex math="\sigma" /> is typically GELU (Hendrycks and Gimpel, 2016). The first projection expands the representation from <Latex math="d" /> to <Latex math="4d" />, and the second compresses it back. This bottleneck design creates a high dimensional intermediate space where nonlinear feature interactions can occur. Recent interpretability research (Geva et al., 2021) reveals that FFN layers function as implicit key value memories: the rows of <Latex math="W_1" /> act as pattern detectors for specific input features, and the corresponding columns of <Latex math="W_2" /> store the associated output updates. This is where the model encodes factual knowledge acquired during pre training.</>,
    },
    {
      id: 'addnorm2',
      label: 'Add & LayerNorm',
      color: '#8B5CF6',
      detail: <>This second Add &amp; Norm wrapper completes the encoder block by applying the same residual + normalization pattern after the FFN: <span className="math-box" style={{ display: 'inline-block', padding: '4px 10px', margin: '4px 0' }}><Latex math="\text{Output}_2 = \text{LayerNorm}(\text{Output}_1 + \text{FFN}(\text{Output}_1))" /></span> The most important property of the complete block is that its output has exactly the same shape as its input: a tensor of <Latex math="n \times d" />. This is a deliberate design choice. Because the interface is preserved, blocks can be composed by simple stacking, with each block receiving the previous block's output as its input. No adapters, no dimension changes, no special wiring. This uniform interface is what lets a single block definition scale from the 6 layer original Transformer to the 48 layer models used today.</>,
    },
  ];

  // The visible layer: locked takes priority, then hovered
  const visibleId = lockedLayer || hoveredLayer;
  const visibleLayer = visibleId ? layers.find(l => l.id === visibleId) : null;

  // Notify parent of active layer changes
  React.useEffect(() => {
    onActiveChange?.(visibleId);
  }, [visibleId, onActiveChange]);

  const handleClick = (id) => {
    setLockedLayer(prev => prev === id ? null : id);
  };

  return (
    <div style={{ margin: '24px 0', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
      {/* Block diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0', flexShrink: 0, minWidth: '260px' }}>
        {layers.map((layer, i) => {
          const isActive = visibleId === layer.id;
          const isLocked = lockedLayer === layer.id;
          return (
            <React.Fragment key={layer.id}>
              <div
                onMouseEnter={() => setHoveredLayer(layer.id)}
                onMouseLeave={() => setHoveredLayer(null)}
                onClick={() => handleClick(layer.id)}
                style={{
                  width: '260px',
                  padding: '12px 16px',
                  background: isActive ? 'var(--accent-20)' : '#FAFAFA',
                  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isActive ? 'var(--accent)' : 'var(--text-main)',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  position: 'relative',
                  boxShadow: isLocked ? '0 0 0 1px var(--accent)' : 'none',
                }}
              >
                {layer.label}
                {isLocked && (
                  <img src="/images/pin.png" alt="pinned" style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    width: '14px', height: '14px', opacity: 0.6,
                  }} />
                )}
              </div>
              {i < layers.length - 1 && (
                <div style={{ color: 'var(--text-light)', fontSize: '18px', lineHeight: 1, margin: '4px 0' }}>↓</div>
              )}
            </React.Fragment>
          );
        })}
        <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          × N layers
        </div>
      </div>

      {/* Detail panel */}
      <div style={{
        flex: 1,
        padding: '16px 20px',
        border: `1px solid ${lockedLayer && visibleLayer ? 'var(--accent)' : 'var(--border)'}`,
        background: 'var(--node-bg)',
        fontSize: '13px',
        color: 'var(--text-muted)',
        lineHeight: 1.7,
        alignSelf: 'center',
        transition: 'opacity 0.15s, border-color 0.15s',
        opacity: visibleLayer ? 1 : 0.4,
        minHeight: '80px',
        position: 'relative',
      }}>
        {lockedLayer && visibleLayer && (
          <img src="/images/pin.png" alt="pinned" style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '14px', height: '14px', opacity: 0.45,
          }} />
        )}
        {visibleLayer ? (
          <>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '8px' }}>
              {visibleLayer.label}
            </div>
            <div>{visibleLayer.detail}</div>
          </>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
            Hover to preview, click to pin
          </div>
        )}
      </div>
    </div>
  );
}

// ── Token Journey Walkthrough ──
export function TokenJourney() {
  const [step, setStep] = useState(0);

  const STEPS = [
    {
      title: 'Raw Token',
      desc: 'The word "bank" enters the encoder as a static embedding — a fixed vector looked up from a vocabulary table. At this point it has no context. It could mean a river bank, a financial bank, or even a verb.',
      math: 'e_{\\text{bank}} \\in \\mathbb{R}^{d}',
      label: 'Static embedding',
    },
    {
      title: '+ Position',
      desc: 'A positional encoding is added so the model knows this token is at position 5 (not position 1). Without this, the encoder would be a bag-of-words model — it would treat "dog bites man" identically to "man bites dog".',
      math: 'x = e_{\\text{bank}} + \\text{PE}(5)',
      label: 'Position-aware embedding',
    },
    {
      title: 'Self-Attention',
      desc: 'Now "bank" gets to look at every other token in the sentence. It attends heavily to "river" and "flooded", which tells the model this is a geographical bank, not a financial one. The output is a new vector that encodes this contextual meaning.',
      math: 'z = \\sum_j \\alpha_j \\cdot V_j \\quad \\text{(weighted by attention)}',
      label: 'Context-mixed representation',
    },
    {
      title: 'Residual + Norm',
      desc: 'The original input x is added back to the attention output (residual connection), then normalized. This ensures the model never loses the original signal, no matter how many layers deep we go.',
      math: 'h_1 = \\text{LayerNorm}(x + z)',
      label: 'Stabilized output',
    },
    {
      title: 'Feed-Forward',
      desc: 'A 2-layer MLP processes this token independently. Think of attention as "gathering context from neighbors" and FFN as "thinking about what I just learned". The FFN expands to 4× the dimension, applies a nonlinearity, then projects back down.',
      math: '\\text{FFN}(h) = W_2 \\cdot \\text{GELU}(W_1 h + b_1) + b_2',
      label: 'Feature refinement',
    },
    {
      title: 'Output',
      desc: 'After the second residual + LayerNorm, we have a fully contextual representation of "bank" — one that encodes it means a river bank in this specific sentence. This output can be fed into the next encoder block for further refinement.',
      math: 'h_2 = \\text{LayerNorm}(h_1 + \\text{FFN}(h_1))',
      label: 'Context-aware embedding',
    },
  ];

  return (
    <div style={{ marginTop: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '0', marginBottom: '0', borderBottom: '2px solid var(--border)' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              padding: '8px 14px', fontSize: '12px',
              fontWeight: step === i ? 700 : 500,
              color: step === i ? 'var(--accent)' : 'var(--text-light)',
              background: 'none', border: 'none',
              borderBottom: step === i ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: '-2px',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 0' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '8px' }}>
          {STEPS[step].label}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.7 }}>
          {STEPS[step].desc}
        </div>
        <div className="math-box" style={{ padding: '10px 14px' }}>
          <Latex math={STEPS[step].math} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
export default function EncoderPage() {
  const [activeBlockId, setActiveBlockId] = useState(null);

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
          Encoder (Transformer)
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          The bidirectional half of the original Transformer. An encoder reads an entire sequence at once
          and transforms each token from a static, context-free embedding into a rich, context-aware
          representation — the foundation of every understanding task in modern NLP.
        </p>
      </div>

      {/* ── 1. THE CONTEXT PROBLEM ── */}
      <Section title="1. The Context Problem">
        <P>
          In early NLP, words were mapped to static vectors using algorithms like Word2Vec or GloVe. The word
          <strong> "bank"</strong> always had the exact same mathematical representation, regardless of whether it appeared
          in "I sat by the river <strong>bank</strong>" or "I deposited money in the <strong>bank</strong>".
        </P>
        <P>
          This is fundamentally broken because language is deeply contextual. A word's meaning is almost entirely
          determined by its surrounding context — what linguists call{' '}
          <HoverCard term="distributional semantics">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Distributional Semantics</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              The idea that <strong>"a word is characterized by the company it keeps"</strong> (J.R. Firth, 1957).
              Words appearing in similar contexts tend to have similar meanings. This is the theoretical
              foundation behind all embedding methods, from Word2Vec to BERT.
            </div>
          </HoverCard>.
        </P>

        {/* Static vs Contextual side-by-side */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0',
        }}>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#EF4444' }}>Static Embedding (Word2Vec)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '8px' }}>
              <div style={{ marginBottom: '4px' }}>"river <strong>bank</strong>" → bank = [0.23, −0.41, ...]</div>
              <div>"money <strong>bank</strong>" → bank = [0.23, −0.41, ...]</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Same vector regardless of context. The model <strong>cannot</strong> distinguish the two meanings.
            </div>
          </div>
          <div style={{ padding: '16px', border: '1px solid var(--border)', background: 'white' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', color: '#10B981' }}>Contextual Embedding (Encoder)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '8px' }}>
              <div style={{ marginBottom: '4px' }}>"river <strong>bank</strong>" → bank = [0.87, 0.12, ...]</div>
              <div>"money <strong>bank</strong>" → bank = [−0.15, 0.93, ...]</div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Different vectors because the encoder has <strong>mixed in context</strong> from surrounding words.
            </div>
          </div>
        </div>

        <Callout type="key">
          The goal of an <strong>Encoder</strong> is to take a sequence of static, context-free word embeddings and
          transform them into a sequence of dynamic, context-aware embeddings where each token's vector
          reflects its meaning <em>in this specific sentence</em>.
        </Callout>
      </Section>

      {/* ── 2. THE ARCHITECTURE ── */}
      <Section title="2. The Encoder Block">
        <P>
          The Transformer architecture introduced in <em>Attention Is All You Need</em> (Vaswani et al., 2017)
          defines a standard encoder block. A full encoder model like BERT stacks many identical copies of this
          block (typically 12 to 24). Each block has two sub-layers, both wrapped in{' '}
          <HoverCard term="residual connections">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Residual (Skip) Connection</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
              Instead of passing input <Latex math="x" /> through a function to get <Latex math="F(x)" />, we
              output <Latex math="x + F(x)" />. This provides a "highway" for gradients to flow backwards during
              training, preventing the vanishing gradient problem in deep networks.
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '11px', fontStyle: 'italic' }}>
              Introduced by He et al., 2015 (ResNet)
            </div>
          </HoverCard>{' '}
          and{' '}
          <HoverCard term="Layer Normalization">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Layer Normalization</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Normalizes the vector across its feature dimension to have mean 0 and variance 1, stabilizing
              training. Unlike Batch Norm, it operates independently per token, making it suitable for
              variable-length sequences.
            </div>
          </HoverCard>.
        </P>

        <EncoderBlockDiagram onActiveChange={setActiveBlockId} />

        <div className="math-box" style={{ margin: '16px 0', padding: '10px 14px' }}>
          <LinkedLatex
            math="\text{Output}_1 = \text{LayerNorm}(x + \text{MultiHeadSelfAttn}(x))"
            active={activeBlockId === 'addnorm1'}
            block
          />
          <div style={{ height: '4px' }} />
          <LinkedLatex
            math="\text{Output}_2 = \text{LayerNorm}(\text{Output}_1 + \text{FFN}(\text{Output}_1))"
            active={activeBlockId === 'addnorm2'}
            block
          />
        </div>

        <Callout type="info">
          <strong>Pre-Norm vs Post-Norm:</strong> The original Transformer applies LayerNorm <em>after</em> the
          residual addition (Post-Norm). Most modern models apply it <em>before</em> the sub-layer (Pre-Norm),
          which makes training more stable for very deep networks. The equations above show the original Post-Norm variant.
        </Callout>
      </Section>

      {/* ── 3. A TOKEN'S JOURNEY ── */}
      <Section title="3. A Token's Journey Through One Block">
        <P>
          Let's trace the word <strong>"bank"</strong> through a single encoder block in the sentence
          "The river bank was flooded". Click each step to see exactly how it transforms:
        </P>
        <TokenJourney />
        <P>
          The critical insight is that the <strong>input and output have the same shape</strong>. Every token
          goes in as a d-dimensional vector and comes out as a d-dimensional vector. This is what makes encoder
          blocks stackable — the output of block N becomes the input of block N+1, with each pass refining
          the contextual representation further.
        </P>
      </Section>

      {/* ── 4. BIDIRECTIONAL VS CAUSAL ── */}
      <Section title="4. Bidirectional vs Causal Attention">
        <P>
          <Highlight>
            The defining feature of an encoder is that its attention is bidirectional.</Highlight>{' '}
          Every token can attend to every other token in the sequence — past, present, and future. This is
          in sharp contrast to decoder-style causal attention, where each token can only see tokens that
          came before it.
        </P>

        {/* Mask comparison visual */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', margin: '20px 0',
        }}>
          {/* Bidirectional */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#3B82F6' }}>
              Encoder: Bidirectional (no mask)
            </div>
            <div style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                  {[0, 1, 2, 3, 4].map(j => (
                    <div key={j} style={{
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '11px',
                      background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}>✓</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Every token sees everything</div>
          </div>

          {/* Causal */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#EF4444' }}>
              Decoder: Causal (masked)
            </div>
            <div style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
                  {[0, 1, 2, 3, 4].map(j => (
                    <div key={j} style={{
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '11px',
                      background: j <= i ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
                      color: j <= i ? '#EF4444' : '#FECACA',
                      border: `1px solid ${j <= i ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'}`,
                    }}>{j <= i ? '✓' : '✕'}</div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Each token only sees the past</div>
          </div>
        </div>

        <P>
          This is why encoders excel at <strong>understanding</strong> tasks. When classifying sentiment, answering
          questions, or extracting entities, you want the model to see the full picture. The word "not" at the
          end of a sentence completely changes the meaning of every word before it — a causal model would miss this
          until it reaches that token.
        </P>
        <Callout type="accent">
          <strong>The trade-off:</strong> Bidirectional attention makes encoders great at understanding but
          unsuitable for text generation. You can't generate token-by-token if every token needs to see tokens
          that haven't been generated yet. This is why generation tasks use decoders.
        </Callout>
      </Section>

      {/* ── 5. STACKING ── */}
      <Section title="5. Stacking: Depth Equals Understanding">
        <P>
          A single encoder block gives each token a basic sense of its neighbors. But language has
          layers of meaning — syntax, semantics, pragmatics, world knowledge — that can't be captured in one pass.
          By stacking identical blocks, each layer builds upon the representations of the previous one,
          extracting progressively more abstract features.
        </P>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0', margin: '20px 0',
          position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border)',
        }}>
          {[
            { layers: 'Layers 1–4', name: 'Surface Features', note: 'Part-of-speech, basic word relationships, local syntax. Similar to what a traditional parser captures.', color: '#3B82F6' },
            { layers: 'Layers 5–8', name: 'Syntactic Structure', note: 'Subject-verb agreement, dependency parsing, clause boundaries. The model "understands" grammar.', color: '#8B5CF6' },
            { layers: 'Layers 9–12', name: 'Semantic Meaning', note: 'Word sense disambiguation, coreference resolution, entity relationships. "bank" finally resolves to its correct meaning.', color: '#10B981' },
          ].map(({ layers, name, note, color }, i) => (
            <div key={i} style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '-29px', top: '4px',
                width: '10px', height: '10px', borderRadius: '50%',
                background: color, border: '2px solid white',
              }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', marginBottom: '2px' }}>{layers}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color, marginBottom: '4px' }}>{name}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{note}</div>
            </div>
          ))}
        </div>
        <Callout type="info">
          <strong>Probing studies</strong> (Hewitt & Manning, 2019; Tenney et al., 2019) have confirmed this
          layered hierarchy empirically. You can train simple classifiers on the intermediate representations
          of each layer to test what information is encoded at each depth.
        </Callout>
      </Section>

      {/* ── 6. ENCODER VS DECODER ── */}
      <Section title="6. Encoder vs Decoder — When to Use What">
        <P>
          The original Transformer had both an encoder and a decoder. Modern architectures tend to specialize.
          The choice of architecture depends entirely on whether you need to <strong>understand</strong> input
          or <strong>generate</strong> output.
        </P>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', margin: '20px 0',
        }}>
          {[
            {
              title: 'Encoder-Only',
              model: 'BERT, RoBERTa, DeBERTa',
              attn: 'Bidirectional self-attention',
              tasks: 'Classification, NER, QA, embeddings',
              color: '#3B82F6',
              strength: 'Sees full context in both directions. Optimal for understanding.',
            },
            {
              title: 'Decoder-Only',
              model: 'GPT, LLaMA, Claude, Gemini',
              attn: 'Causal self-attention',
              tasks: 'Text generation, chat, code, reasoning',
              color: '#10B981',
              strength: 'Generates token by token. Scales to massive sizes.',
            },
            {
              title: 'Encoder-Decoder',
              model: 'T5, BART, Whisper',
              attn: 'Bidirectional + causal + cross',
              tasks: 'Translation, summarization, ASR',
              color: '#8B5CF6',
              strength: 'Encoder understands input; decoder generates output conditioned on it.',
            },
          ].map(({ title, model, attn, tasks, color, strength }, i) => (
            <div key={i} style={{
              padding: '16px', border: '1px solid var(--border)', background: 'white',
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color }}>{title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{strength}</div>
              <div style={{ fontSize: '11px', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: 'auto' }}>
                <div><strong>Models:</strong> {model}</div>
                <div><strong>Attention:</strong> {attn}</div>
                <div><strong>Tasks:</strong> {tasks}</div>
              </div>
            </div>
          ))}
        </div>
        <Callout type="accent">
          <strong>Industry trend:</strong> The field has largely converged on decoder-only models for general-purpose
          AI. But encoder-only models remain <strong>dominant</strong> for search, retrieval, classification, and
          embedding — any task where you need a fixed-size representation of text.
        </Callout>
      </Section>

      {/* ── 7. REAL-WORLD MODELS ── */}
      <Section title="7. Encoder Models in the Wild">
        <P>
          All major encoder models share the same fundamental block architecture described above.
          They differ in training objectives, data scale, and architectural tweaks.
        </P>
        <PropTable rows={[
          ['BERT (2018)', '12 layers, 768d, 12 heads, 110M params. Trained with Masked Language Modeling (MLM). The model that started the encoder era.'],
          ['RoBERTa (2019)', 'Same architecture as BERT, but trained with 10× more data, no NSP objective, and dynamic masking. Consistently outperforms BERT.'],
          ['ALBERT (2019)', 'Parameter-efficient: shares weights across layers and factorizes the embedding matrix. 18× fewer params than BERT-large with competitive performance.'],
          ['DeBERTa (2020)', 'Disentangles content and position into separate attention streams. Adds an enhanced mask decoder. SOTA on many NLU benchmarks.'],
          ['ViT (2020)', 'Applies the encoder to vision: splits images into 16×16 patches, treats them as tokens, and runs standard Transformer encoding. Proved that attention scales beyond NLP.'],
        ]} />
        <Callout type="key">
          <strong>The encoder's secret weapon:</strong>{' '}
          <HoverCard term="Masked Language Modeling (MLM)">
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>Masked Language Modeling</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
              During pre-training, 15% of input tokens are randomly replaced with a <strong>[MASK]</strong> token.
              The model must predict the original word using only the surrounding context. This forces the encoder
              to build deep bidirectional representations of every token.
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '11px', fontStyle: 'italic' }}>
              Introduced by Devlin et al. (BERT, 2018)
            </div>
          </HoverCard>{' '}
          is the pre-training objective that makes bidirectional encoding possible. Unlike autoregressive
          training (predict the next word), MLM forces the encoder to use <em>both</em> left and right context,
          producing richer representations.
        </Callout>
      </Section>

      {/* ── QUICK REFERENCE ── */}
      <Section title="Quick Reference">
        <table style={{
          width: '100%', borderCollapse: 'collapse', marginBottom: '16px',
          fontSize: '13px', border: '1px solid var(--border)',
        }}>
          <thead>
            <tr style={{ background: 'var(--node-bg)' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Property</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Encoder</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid var(--border)' }}>Decoder</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Attention direction', 'Bidirectional (full)', 'Causal (lower-triangular mask)'],
              ['Sees future tokens?', '✅ Yes', '❌ No'],
              ['Can generate text?', '❌ Not directly', '✅ Yes, autoregressively'],
              ['Typical pre-training', 'MLM (fill in blanks)', 'Next-token prediction'],
              ['Output shape', 'Same as input (n × d)', 'Same as input (n × d)'],
              ['Sub-layers per block', 'Self-Attention + FFN', 'Self-Attention + (Cross-Attn) + FFN'],
              ['Best for', 'Understanding, retrieval, classification', 'Generation, conversation, reasoning'],
            ].map(([prop, enc, dec], i) => (
              <tr key={i}>
                <td style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{prop}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{enc}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{dec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── REFERENCES ── */}
      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Attention Is All You Need
            </a> — Vaswani et al., 2017. The paper that introduced the Transformer encoder-decoder architecture.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1810.04805" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              BERT: Pre-training of Deep Bidirectional Transformers
            </a> — Devlin et al., 2018. Showed that encoder-only models with MLM dominate NLU tasks.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1907.11692" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              RoBERTa: A Robustly Optimized BERT
            </a> — Liu et al., 2019. Better training recipe for BERT-style encoders.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2006.03654" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              DeBERTa: Decoding-enhanced BERT with Disentangled Attention
            </a> — He et al., 2020. Disentangled position and content attention.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2010.11929" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              An Image Is Worth 16x16 Words (ViT)
            </a> — Dosovitskiy et al., 2020. Proved the encoder architecture works for vision.
          </li>
          <li>
            <a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              The Illustrated Transformer
            </a> — Jay Alammar's visual walkthrough. The best resource for building intuition.
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=eMlx5fFNoYc" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Attention in transformers, visually explained
            </a> — 3Blue1Brown. Outstanding visual explanation of how attention works inside the encoder.
          </li>
        </ul>
      </Section>

      {/* ── AI DISCLOSURE ── */}
      <div style={{
        marginTop: '32px',
        padding: '16px 20px',
        background: 'var(--node-bg)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '13px',
        color: 'var(--text-light)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-muted)' }}>A note on this article:</strong> This post was written
        with the help of AI. Interactive elements (click-to-pin block diagram with linked equation highlighting,
        tabbed token walkthrough, attention mask comparisons) were designed to aid understanding. All content
        has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date as of 2026.
      </div>
    </div>
  );
}
