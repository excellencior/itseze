import React, { useState, useRef, useEffect } from 'react';
import Latex from '../../components/Latex';
import FunctionPlot from '../../components/viz/FunctionPlot';
import InlinePanel from '../../components/viz/InlinePanel';
import LinearCollapseViz from '../../components/viz/LinearCollapseViz';

// ── Activation function definitions ──
const sigmoid = (x) => 1 / (1 + Math.exp(-x));
const sigmoidDeriv = (x) => { const s = sigmoid(x); return s * (1 - s); };
const tanh_ = (x) => Math.tanh(x);
const tanhDeriv = (x) => 1 - Math.tanh(x) ** 2;
const relu = (x) => Math.max(0, x);
const reluDeriv = (x) => (x > 0 ? 1 : 0);
const leakyRelu = (x, a = 0.01) => (x > 0 ? x : a * x);
const elu = (x, a = 1) => (x > 0 ? x : a * (Math.exp(x) - 1));
const gelu = (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
const geluDeriv = (x) => {
  const h = 0.001;
  return (gelu(x + h) - gelu(x - h)) / (2 * h);
};
const silu = (x) => x * sigmoid(x);
const siluDeriv = (x) => {
  const s = sigmoid(x);
  return s + x * s * (1 - s);
};

// ── Section component ──
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '48px' }}>
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

// ── Main Page ──
export default function ActivationFunctionsPage() {
  const [compareSet, setCompareSet] = useState('modern');

  const comparisons = {
    modern: [
      { fn: gelu, label: 'GELU', color: '#0891B2' },
      { fn: silu, label: 'SiLU/Swish', color: '#8B5CF6' },
      { fn: relu, label: 'ReLU', color: '#EF4444', dash: [6, 4] },
    ],
    classic: [
      { fn: sigmoid, label: 'Sigmoid', color: '#F59E0B' },
      { fn: tanh_, label: 'Tanh', color: '#3B82F6' },
      { fn: relu, label: 'ReLU', color: '#EF4444' },
    ],
    all: [
      { fn: sigmoid, label: 'Sigmoid', color: '#F59E0B' },
      { fn: tanh_, label: 'Tanh', color: '#3B82F6' },
      { fn: relu, label: 'ReLU', color: '#EF4444' },
      { fn: gelu, label: 'GELU', color: '#0891B2' },
      { fn: silu, label: 'SiLU', color: '#8B5CF6' },
    ],
  };

  const [collapsePanel, setCollapsePanel] = useState(() => {
    // Lazily initialize from sessionStorage so it persists across refreshes
    return sessionStorage.getItem('activation-viz-panel-open') === 'true';
  });
  const btnRef = useRef(null);

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('activation-viz-panel-open', collapsePanel);
  }, [collapsePanel]);

  const handleTogglePanel = () => {
    setCollapsePanel(prev => {
      const nextState = !prev;
      // If we are opening the panel, wait for the accordion to start then scroll to it
      if (nextState && btnRef.current) {
        setTimeout(() => {
          btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return nextState;
    });
  };

  const handleClosePanel = () => {
    setCollapsePanel(false);
    if (btnRef.current) {
      setTimeout(() => {
        btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

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
          Activation Functions
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          These are the nonlinear transformations that give neural networks the power to learn complex patterns.
          Without them, any network, no matter how deep, collapses into a single linear function.
        </p>
      </div>

      {/* ── WHY ── */}
      <Section title="Why Do We Need Activation Functions?">
        <P>
          Consider stacking linear layers without any activation:
        </P>
        <div className="math-box">
          <Latex math={"f(x) = W_3(W_2(W_1 x + b_1) + b_2) + b_3 = W'x + b'"} block />
        </div>
        <P>
          No matter how many layers you stack, the result is always a single matrix multiply.{' '}
          <button
            ref={btnRef}
            onClick={handleTogglePanel}
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
          </button>{' '}
          A 96 layer GPT-3 would be mathematically identical to a 1 layer network.
          Activation functions <strong>break this linearity</strong>, allowing the network to learn
          curved decision boundaries and complex, hierarchical features.
        </P>
        <InlinePanel open={collapsePanel} onClose={handleClosePanel}>
          <LinearCollapseViz />
        </InlinePanel>
        <Callout type="key">
          Activation functions are placed <strong>between linear transformations</strong> in every MLP block:
          Linear → <strong>Activation</strong> → Linear. They are the source of all nonlinear power.
        </Callout>
      </Section>

      {/* ── SIGMOID ── */}
      <Section title="1. Sigmoid (Logistic)">
        <div className="math-box">
          <Latex math={"\\sigma(x) = \\frac{1}{1 + e^{-x}}"} block />
        </div>
        <PropTable rows={[
          ['Output range', '(0, 1)'],
          ['Zero-centered?', '❌ No, outputs are always positive'],
          ['Max gradient', '0.25 (at x = 0)'],
          ['Saturates?', '✅ Yes, gradient → 0 for |x| > 5'],
        ]} />
        <FunctionPlot
          functions={[
            { fn: sigmoid, label: 'σ(x)', color: '#F59E0B' },
            { fn: sigmoidDeriv, label: "σ'(x)", color: '#F59E0B', dash: [6, 4] },
          ]}
          xRange={[-8, 8]} yRange={[-0.5, 1.5]} height={240}
          title="Sigmoid and its derivative"
        />
        <P>
          The sigmoid squashes any real-valued input into the (0, 1) range. Crucially, it isn't just an arbitrary bounding function—it is the mathematical inverse of the logit function. If a network outputs the log-odds (logits) of a binary event, passing them through a sigmoid rigorously converts them into a true probability.
        </P>
        <P>
          However, as a hidden layer activation, it has a fatal flaw. Take a look at its derivative (the dashed line). It peaks at just <strong>0.25</strong> and rapidly drops to zero on both sides. In a deep network, gradients get multiplied through every layer via the chain rule, and each one is capped at a quarter. This causes the infamous <strong>vanishing gradient problem</strong>.
        </P>
        <Callout type="warning">
          <strong>Vanishing gradients:</strong> After 10 layers of sigmoid, the gradient is at most
          0.25¹⁰ ≈ 0.000001. The early layers essentially stop learning entirely.
        </Callout>
        <P>
          <strong>Where it's still used:</strong> Binary classification output layers, and gates in LSTMs and GRUs
          where the 0 to 1 range is deliberately needed as a "gate".
        </P>
      </Section>

      {/* ── TANH ── */}
      <Section title="2. Tanh (Hyperbolic Tangent)">
        <div className="math-box">
          <Latex math={"\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}} = 2\\sigma(2x) - 1"} block />
        </div>
        <PropTable rows={[
          ['Output range', '(-1, 1)'],
          ['Zero-centered?', '✅ Yes'],
          ['Max gradient', '1.0 (at x = 0)'],
          ['Saturates?', '✅ Yes, gradient → 0 at extremes'],
        ]} />
        <FunctionPlot
          functions={[
            { fn: tanh_, label: 'tanh(x)', color: '#3B82F6' },
            { fn: tanhDeriv, label: "tanh'(x)", color: '#3B82F6', dash: [6, 4] },
          ]}
          xRange={[-6, 6]} yRange={[-1.5, 1.5]} height={240}
          title="Tanh and its derivative"
        />
        <P>
          Think of tanh as a rescaled sigmoid. It's centered around zero and has stronger gradients,
          peaking at 1.0 instead of 0.25. That means gradients flow about 4× better through each layer.
          The catch is that it still saturates at the extremes, so deep networks will still run into
          vanishing gradients, just not as quickly.
        </P>
        <P>
          <strong>Where it's used:</strong> LSTM cell states, some RNN architectures, and normalization outputs.
        </P>
      </Section>

      {/* ── RELU ── */}
      <Section title="3. ReLU (Rectified Linear Unit)">
        <div className="math-box">
          <Latex math={"\\text{ReLU}(x) = \\max(0, x)"} block />
        </div>
        <PropTable rows={[
          ['Output range', '[0, ∞)'],
          ['Gradient for x > 0', '1 (constant, never vanishes!)'],
          ['Gradient for x < 0', '0 (completely dead)'],
          ['Computational cost', 'Extremely cheap, just a comparison'],
        ]} />
        <FunctionPlot
          functions={[
            { fn: relu, label: 'ReLU(x)', color: '#EF4444' },
            { fn: reluDeriv, label: "ReLU'(x)", color: '#EF4444', dash: [6, 4] },
          ]}
          xRange={[-6, 6]} yRange={[-1, 4]} height={240}
          title="ReLU and its derivative"
        />
        <P>
          ReLU was the breakthrough that enabled deep learning. For positive inputs, the gradient is always
          exactly 1, so it never vanishes no matter how deep the network goes. It's also incredibly cheap to
          compute since it's just a max operation. This simplicity is what enabled training networks like
          AlexNet, VGG, and ResNet that were previously impossible with sigmoid or tanh.
        </P>
        <Callout type="warning">
          <strong>Dying ReLU problem:</strong> If a neuron's weights shift so that its input is always negative,
          the gradient becomes permanently zero. That neuron is "dead" and can never recover. In practice,
          up to 20 to 40% of neurons can die during training.
        </Callout>
        <P>
          <strong>Example:</strong> Say a neuron computes <code>ReLU(w·x + b)</code>. If a large gradient
          update pushes <code>w</code> negative and <code>b</code> very negative, then for every training example
          <code>w·x + b &lt; 0</code>, so the output is always 0, the gradient is always 0, and it's stuck forever.
        </P>
      </Section>

      {/* ── LEAKY RELU ── */}
      <Section title="4. Leaky ReLU & Variants">
        <div className="math-box">
          <Latex math={"\\text{LeakyReLU}(x) = \\begin{cases} x & \\text{if } x > 0 \\\\ \\alpha x & \\text{if } x \\leq 0 \\end{cases} \\quad (\\alpha = 0.01)"} block />
        </div>
        <FunctionPlot
          functions={[
            { fn: relu, label: 'ReLU', color: '#EF4444', dash: [6, 4] },
            { fn: leakyRelu, label: 'Leaky ReLU', color: '#10B981' },
            { fn: elu, label: 'ELU', color: '#8B5CF6' },
          ]}
          xRange={[-6, 6]} yRange={[-2, 4]} height={240}
          title="ReLU vs Leaky ReLU vs ELU"
        />
        <P>
          Leaky ReLU fixes the dying neuron problem by giving a small slope (α = 0.01) to negative inputs.
          The gradient is never zero — dead neurons can always recover.
          <strong> PReLU</strong> (Parametric ReLU) makes α a learnable parameter.
          <strong> ELU</strong> uses an exponential curve for negative values, making it smooth at zero
          and pushing mean activations closer to zero.
        </P>
      </Section>

      {/* ── GELU ── */}
      <Section title="5. GELU (Gaussian Error Linear Unit) ⭐">
        <div className="math-box">
          <Latex math={"\\text{GELU}(x) = x \\cdot \\Phi(x) \\approx 0.5x\\left(1 + \\tanh\\left[\\sqrt{\\frac{2}{\\pi}}\\left(x + 0.044715x^3\\right)\\right]\\right)"} block />
        </div>
        <PropTable rows={[
          ['Output range', '≈ (-0.17, ∞)'],
          ['Smooth?', '✅ Everywhere differentiable'],
          ['Key insight', 'Probabilistically gates values instead of hard-thresholding'],
          ['Used in', 'GPT-2, GPT-3, BERT, ViT, most transformers'],
        ]} />
        <FunctionPlot
          functions={[
            { fn: gelu, label: 'GELU', color: '#0891B2' },
            { fn: geluDeriv, label: "GELU'", color: '#0891B2', dash: [6, 4] },
            { fn: relu, label: 'ReLU', color: '#EF4444', dash: [4, 4] },
          ]}
          xRange={[-5, 5]} yRange={[-1, 4]} height={260}
          title="GELU vs ReLU, notice the smooth transition near zero"
        />
        <P>
          GELU is the default activation in modern transformers. Instead of the hard cutoff that ReLU uses
          at zero, GELU essentially asks: <em>"How likely is this input to be positive?"</em> and scales
          the value by that probability. So small negative values still get a small negative output rather
          than being zeroed out completely. It creates a smooth, probabilistic gate.
        </P>
        <Callout type="key">
          <strong>Why smooth matters:</strong> Because the curve is smooth, the gradient transitions
          gradually instead of jumping from 0 to 1. This gives the optimizer much more nuanced information
          about the loss landscape, which leads to better convergence during training.
        </Callout>
        <P>
          If you look at the plot, notice how GELU dips slightly below zero around x ≈ −0.5. This
          non monotonic behavior acts as a built in regularizer, similar to dropout.
        </P>
      </Section>

      {/* ── SILU / SWISH ── */}
      <Section title="6. SiLU / Swish">
        <div className="math-box">
          <Latex math={"\\text{SiLU}(x) = x \\cdot \\sigma(x) = \\frac{x}{1 + e^{-x}}"} block />
        </div>
        <FunctionPlot
          functions={[
            { fn: silu, label: 'SiLU/Swish', color: '#8B5CF6' },
            { fn: siluDeriv, label: "SiLU'", color: '#8B5CF6', dash: [6, 4] },
            { fn: gelu, label: 'GELU', color: '#0891B2', dash: [4, 4] },
          ]}
          xRange={[-5, 5]} yRange={[-1, 4]} height={260}
          title="SiLU/Swish vs GELU, remarkably similar shapes"
        />
        <P>
          This one has an interesting origin story. Google Brain discovered it through <strong>automated search</strong>
          (NAS) over the space of possible activation functions. What it does is multiply the input by its own
          sigmoid, which is a form of <em>self gating</em>. Essentially, the input decides how much of itself
          to let through.
        </P>
        <P>
          SiLU and GELU are nearly identical in shape, but SiLU dips a bit deeper below zero (about −0.28
          compared to −0.17 for GELU). Both consistently outperform ReLU in benchmarks across vision and
          language tasks.
        </P>
      </Section>

      {/* ── SWIGLU ── */}
      <Section title="7. SwiGLU (Gated Linear Units) ⭐">
        <div className="math-box">
          <Latex math={"\\text{SwiGLU}(x) = \\text{SiLU}(xW_1) \\otimes (xW_2)"} block />
        </div>
        <Callout type="key">
          <strong>Current state of the art.</strong> Used in LLaMA 2/3, PaLM, Gemini, Mistral, and Mixtral.
          SwiGLU is the dominant activation in modern large language models.
        </Callout>
        <P>
          Instead of applying a single nonlinearity, GLU variants project the input <strong>twice</strong>. One
          path becomes the "content" and the other becomes a "gate". The gate (processed through SiLU) controls
          how much content passes through using element wise multiplication (⊗).
        </P>
        <P>
          This is more expressive than a single activation because the network actually learns <em>what information
          to keep</em> at each position. The trade off is that it requires an extra weight matrix (W₂),
          which increases the parameter count by roughly 33% in the MLP block.
        </P>
        <div className="math-box" style={{ fontSize: '13px' }}>
          <div style={{ marginBottom: '8px' }}><strong>Variants:</strong></div>
          <div style={{ marginBottom: '4px' }}><Latex math={"\\text{GLU: } \\sigma(xW_1) \\otimes (xW_2)"} /> the original, using a sigmoid gate</div>
          <div style={{ marginBottom: '4px' }}><Latex math={"\\text{GeGLU: } \\text{GELU}(xW_1) \\otimes (xW_2)"} /> used in some T5 variants</div>
          <div><Latex math={"\\text{SwiGLU: } \\text{SiLU}(xW_1) \\otimes (xW_2)"} /> the current state of the art</div>
        </div>
      </Section>

      {/* ── INTERACTIVE COMPARISON ── */}
      <Section title="Interactive Comparison">
        <P>
          Overlay multiple activation functions to see how they relate. Hover over the plot to compare
          exact values at any input.
        </P>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { key: 'classic', label: 'Classic (Sigmoid, Tanh, ReLU)' },
            { key: 'modern', label: 'Modern (ReLU, GELU, SiLU)' },
            { key: 'all', label: 'All Functions' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCompareSet(key)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                border: `1.5px solid ${compareSet === key ? 'var(--accent)' : 'var(--border)'}`,
                background: compareSet === key ? 'var(--accent-20)' : 'white',
                color: compareSet === key ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <FunctionPlot
          functions={comparisons[compareSet]}
          xRange={[-6, 6]} yRange={[-2, 4]} height={300}
        />
      </Section>

      {/* ── EVOLUTION TIMELINE ── */}
      <Section title="The Evolution">
        <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border)' }}>
          {[
            { year: '1960s', name: 'Sigmoid', note: 'Inspired by biological neurons. First practical activation.', color: '#F59E0B' },
            { year: '1990s', name: 'Tanh', note: 'Zero-centered, 4× stronger gradients. Standard for RNNs.', color: '#3B82F6' },
            { year: '2010', name: 'ReLU', note: 'Enabled deep learning revolution. AlexNet (2012) breakthrough.', color: '#EF4444' },
            { year: '2015', name: 'Leaky/PReLU', note: 'Fixed dying neurons. Small but meaningful improvement.', color: '#10B981' },
            { year: '2016', name: 'GELU', note: 'Smooth probabilistic gating. Became transformer default.', color: '#0891B2' },
            { year: '2017', name: 'Swish/SiLU', note: 'Discovered by AutoML. Self-gating mechanism.', color: '#8B5CF6' },
            { year: '2020', name: 'SwiGLU', note: 'Current SOTA. Powers LLaMA, PaLM, Gemini, Mistral.', color: '#EC4899' },
          ].map(({ year, name, note, color }, i) => (
            <div key={i} style={{ marginBottom: '24px', position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '-29px', top: '4px',
                width: '10px', height: '10px', borderRadius: '50%',
                background: color, border: '2px solid white',
              }} />
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', marginBottom: '2px' }}>{year}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color, marginBottom: '4px' }}>{name}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{note}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SUMMARY TABLE ── */}
      <Section title="Quick Reference">
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse', fontSize: '13px',
            border: '1px solid var(--border)',
          }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Function', 'Range', 'Smooth', 'Zero-centered', 'Era'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontWeight: 700, borderBottom: '2px solid var(--border)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Sigmoid', '(0, 1)', '✅', '❌', 'Legacy'],
                ['Tanh', '(-1, 1)', '✅', '✅', 'Legacy'],
                ['ReLU', '[0, ∞)', '❌', '❌', 'CNNs'],
                ['Leaky ReLU', '(-∞, ∞)', '❌', '~Yes', 'CNNs'],
                ['GELU', '(-0.17, ∞)', '✅', '~Yes', 'Transformers'],
                ['SiLU/Swish', '(-0.28, ∞)', '✅', '~Yes', 'LLMs'],
                ['SwiGLU', 'varies', '✅', '~Yes', 'SOTA'],
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: '8px 12px', fontWeight: j === 0 ? 700 : 400 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── REFERENCES ── */}
      <Section title="References & Further Reading">
        <P>
          The original papers and some of the best resources for going deeper into activation functions.
        </P>
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/1606.08415" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Gaussian Error Linear Units (GELUs)
            </a> — Dan Hendrycks & Kevin Gimpel, 2016. The original GELU paper.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1710.05941" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Searching for Activation Functions
            </a> — Ramachandran, Zoph & Le, 2017. The paper that discovered Swish/SiLU via NAS.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2002.05202" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              GLU Variants Improve Transformer
            </a> — Noam Shazeer, 2020. Introduced SwiGLU and benchmarked GLU variants.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1502.01852" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Delving Deep into Rectifiers (PReLU)
            </a> — He et al., 2015. Parametric ReLU and the Kaiming initialization.
          </li>
          <li>
            <a href="https://cs231n.github.io/neural-networks-1/#actfun" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Stanford CS231n: Activation Functions
            </a> — Excellent visual walkthrough from Andrej Karpathy's Stanford course.
          </li>
          <li>
            <a href="https://pytorch.org/docs/stable/nn.html#non-linear-activations-weighted-sum-nonlinearity" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              PyTorch: Non-linear Activations
            </a> — Official PyTorch docs with implementation details and API.
          </li>
          <li>
            <a href="https://www.deeplearningbook.org/contents/mlp.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Deep Learning Book, Ch. 6: MLPs
            </a> — Goodfellow, Bengio & Courville. Foundational textbook chapter on hidden units.
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
