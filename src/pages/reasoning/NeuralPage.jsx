import { useState } from 'react';
import Latex from '../../components/Latex';

function Section({ title, children }) {
  return (
    <div id={title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')} data-section style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
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


function AttentionFlowWidget() {
  const [inputText, setInputText] = useState('The cat sat on the mat');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [layer, setLayer] = useState(2);

  const tokens = inputText.split(' ').filter(t => t.length > 0);

  const getAttentionWeights = (idx, currentLayer, numTokens) => {
    const weights = new Array(numTokens).fill(0);
    if (numTokens <= 0) return weights;

    if (currentLayer === 1) {
      // Local syntactic layer (focuses on adjacent tokens)
      for (let i = 0; i < numTokens; i++) {
        if (i === idx) weights[i] = 0.4;
        else if (Math.abs(i - idx) === 1) weights[i] = 0.25;
        else weights[i] = 0.1 / Math.max(1, numTokens - 2);
      }
    } else if (currentLayer === 2) {
      // Coreference / Relational layer
      const lowerTokens = tokens.map(t => t.toLowerCase());
      const word = lowerTokens[idx] || '';

      // Content words attend to each other
      const contentWords = ['cat', 'sat', 'mat', 'reasoning', 'implicit', 'llms', 'neural', 'logic'];
      const contentIndices = lowerTokens.map((t, i) => contentWords.includes(t) ? i : -1).filter(i => i !== -1);

      if (contentIndices.includes(idx) && contentIndices.length > 1) {
        const otherContent = contentIndices.filter(i => i !== idx);
        weights[idx] = 0.3;
        otherContent.forEach(ci => { weights[ci] = 0.5 / otherContent.length; });
        const remainder = 0.2 / Math.max(1, numTokens - contentIndices.length);
        for (let i = 0; i < numTokens; i++) {
          if (!contentIndices.includes(i)) weights[i] = remainder;
        }
      } else {
        // Function words attend mostly to neighbors
        weights[idx] = 0.35;
        if (idx > 0) weights[idx - 1] = 0.25;
        if (idx < numTokens - 1) weights[idx + 1] = 0.25;
        const rem = 0.15 / Math.max(1, numTokens - 3);
        for (let i = 0; i < numTokens; i++) {
          if (weights[i] === 0) weights[i] = rem;
        }
      }
    } else {
      // Semantic representation (broad context mixing)
      const lowerTokens = tokens.map(t => t.toLowerCase());
      const stopWords = ['the', 'a', 'an', 'on', 'in', 'is', 'it', 'of', 'to', 'and', 'or', 'at'];
      const contentIndices = lowerTokens.map((t, i) => !stopWords.includes(t) ? i : -1).filter(i => i !== -1);

      if (contentIndices.length > 0) {
        contentIndices.forEach(ci => {
          weights[ci] = 0.7 / contentIndices.length;
        });
        const remainder = 0.3 / Math.max(1, numTokens - contentIndices.length);
        for (let i = 0; i < numTokens; i++) {
          if (!contentIndices.includes(i)) weights[i] = remainder;
        }
      } else {
        weights.fill(1 / numTokens);
      }
    }

    return weights;
  };

  const weights = getAttentionWeights(selectedTokenIndex, layer, tokens.length);

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px', margin: '24px 0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Interactive attention grid
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.3px' }}>
        Neural Attention Flow Simulator
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Type any sentence below. Click a token to select it as the <strong>query</strong>, then switch between layer depths to observe how attention routing evolves from local syntax to global semantics. Line thickness and percentage labels indicate attention weight strength.
      </p>

      {/* Input text */}
      <input
        type="text"
        value={inputText}
        onChange={(e) => {
          setInputText(e.target.value);
          setSelectedTokenIndex(0);
        }}
        placeholder="Type a sentence..."
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          border: '1.5px solid var(--border)',
          fontWeight: 600,
          outline: 'none',
          marginBottom: '16px',
        }}
      />

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700 }}>Attention Depth</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { val: 1, label: 'Layer 1: Syntax' },
              { val: 2, label: 'Layer 2: Relational' },
              { val: 3, label: 'Layer 3: Semantic' }
            ].map(l => (
              <button
                key={l.val}
                onClick={() => setLayer(l.val)}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '11px',
                  background: layer === l.val ? 'var(--accent-20)' : '#f6f6f6',
                  border: `1px solid ${layer === l.val ? 'var(--accent)' : 'var(--border)'}`,
                  color: layer === l.val ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {l.val}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {layer === 1 && 'Layer 1: Primarily focuses on adjacent words to extract local syntactic dependencies (bigram and trigram patterns).'}
          {layer === 2 && 'Layer 2: Resolves semantic relationships between content words, connecting subjects to verbs and objects across longer distances.'}
          {layer === 3 && 'Layer 3: Projects broad semantic context by strongly attending to all content words while suppressing function words (the, on, a).'}
        </div>
      </div>

      {/* Token Flow Map */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        background: '#FAF8F1',
        border: '1px solid var(--border)',
        position: 'relative'
      }}>
        {/* Source Tokens */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '80px', zIndex: 5, flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px' }}>
          {tokens.map((tok, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedTokenIndex(idx)}
              style={{
                padding: '6px 12px',
                background: selectedTokenIndex === idx ? 'var(--accent)' : '#fff',
                color: selectedTokenIndex === idx ? '#fff' : '#000',
                border: '1px solid var(--border)',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                fontFamily: '"Fira Code", monospace',
                boxShadow: selectedTokenIndex === idx ? '0 4px 10px rgba(8,145,178,0.2)' : 'none',
              }}
            >
              {tok}
            </div>
          ))}
        </div>

        {/* SVG connection lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {tokens.map((tok, idx) => {
            const opacity = weights[idx] || 0;
            return (
              <line
                key={idx}
                x1="50%"
                y1="40"
                x2={`${15 + (idx / (tokens.length - 1 || 1)) * 70}%`}
                y2="148"
                stroke="var(--accent)"
                strokeWidth={opacity * 8 + 0.5}
                opacity={opacity}
                style={{ transition: 'all 0.3s ease' }}
              />
            );
          })}
        </svg>

        {/* Target (Mixer) Tokens */}
        <div style={{ display: 'flex', gap: '12px', zIndex: 5, flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px' }}>
          {tokens.map((tok, idx) => {
            const weightVal = weights[idx] || 0;
            return (
              <div
                key={idx}
                style={{
                  padding: '6px 12px',
                  background: '#fff',
                  border: '1.5px solid var(--border)',
                  borderColor: weightVal > 0.25 ? 'var(--accent)' : 'var(--border)',
                  fontWeight: 600,
                  fontSize: '12.5px',
                  fontFamily: '"Fira Code", monospace',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span>{tok}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '4px' }}>
                  {(weightVal * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function NeuralPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Paradigm
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Neural (Connectionist) Reasoning
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          Implicit patterns, soft weights, and distributed activations. Connectionist networks reason by routing activations through billions of learned parameters, extracting concepts from statistical associations rather than formal rules — and in doing so, they achieve feats that symbolic systems never could.
        </p>
      </div>

      <Section title="1. From Neurons to Networks">
        <P>
          The connectionist tradition began with a bold question: can computation emerge from the interaction of simple processing units, the way thought emerges from neurons in the brain? In 1943, Warren McCulloch and Walter Pitts published a landmark paper showing that networks of idealized neurons could compute any logical function, establishing the theoretical foundation for neural computation.
        </P>
        <P>
          Frank Rosenblatt's <strong>Perceptron</strong> (1958) was the first implemented neural network that could learn from data — adjusting its weights to classify inputs correctly. But the field stalled for decades after Minsky and Papert (1969) proved that single-layer perceptrons could not learn the XOR function, demonstrating fundamental limitations of shallow architectures.
        </P>
        <P>
          The breakthrough came in 1986 when Rumelhart, Hinton, and Williams demonstrated that <strong>backpropagation</strong> — propagating error gradients backward through multi-layer networks — could train deep architectures effectively. This simple algorithm is still the engine behind every modern neural network, from image classifiers to trillion-parameter language models.
        </P>

        <Callout type="key">
          The key insight of connectionism is that intelligence need not be programmed explicitly through rules. Instead, it can <em>emerge</em> from the statistical structure of data, captured in the weights of a network trained through gradient descent.
        </Callout>
      </Section>

      <Section title="2. The Transformer Revolution">
        <P>
          The modern era of neural reasoning was inaugurated by Vaswani et al. (2017) with the <strong>Transformer architecture</strong>. By replacing sequential recurrence with parallel <strong>self-attention</strong>, Transformers enabled models to relate any token to any other token in constant depth, regardless of their distance in the sequence. The core operation computes:
        </P>

        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right) V" />
        </div>

        <P>
          Each token produces a <strong>query</strong> (what am I looking for?), a <strong>key</strong> (what do I advertise?), and a <strong>value</strong> (what information do I carry?). The dot product between queries and keys determines how much each token attends to every other, and the result is a weighted sum of values. This mechanism allows the model to dynamically route information based on content, not position.
        </P>

        <P>
          Critically, Transformers stack dozens of these attention layers, and each layer progressively builds more abstract representations. Early layers detect syntactic patterns (word order, grammar), middle layers resolve coreferences (who does "it" refer to?), and later layers encode high-level semantic relationships.
        </P>
      </Section>

      <Section title="3. FFNs as Implicit Memory Banks">
        <P>
          While attention gets the headlines, a growing body of <strong>mechanistic interpretability</strong> research reveals that the feed-forward networks (FFNs) within each Transformer layer play an equally crucial role. Geva et al. (2021) demonstrated that FFN layers function as <strong>key-value memories</strong>: the first weight matrix acts as a pattern detector (key), recognizing specific input features, and the second matrix projects factual information (value) back into the residual stream.
        </P>

        <div className="math-box" style={{ padding: '12px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="\text{FFN}(x) = W_2 \cdot \sigma(W_1 \cdot x + b_1) + b_2" />
        </div>

        <P>
          The implication is profound: when a language model "knows" that the Eiffel Tower is in Paris, that knowledge is not stored in a lookup table — it is distributed across the activation patterns of specific neurons in specific FFN layers. Meng et al. (2022) showed that you can surgically <strong>edit</strong> individual facts in a model by performing rank-one updates to these FFN weight matrices, a technique called <strong>ROME</strong> (Rank-One Model Editing).
        </P>

        <Callout type="info">
          This means neural networks don't "reason" the way humans think about reasoning — they retrieve and compose stored associations through continuous-valued computations. Understanding <em>where</em> and <em>how</em> knowledge is encoded is the central goal of mechanistic interpretability.
        </Callout>
      </Section>

      <Section title="4. Interactive Attention Routing">
        <P>
          See this routing in action using the Attention Flow visualizer below. Type any sentence, click a token to select it as the query, and switch between layer depths. Notice how:
        </P>

        <ul style={{ fontSize: '15px', color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '16px', lineHeight: 1.8 }}>
          <li><strong>Layer 1 (Syntax)</strong>: Attention concentrates on immediately adjacent tokens — capturing local bigram and trigram patterns.</li>
          <li><strong>Layer 2 (Relational)</strong>: Content words begin attending to each other across distances, linking subjects to verbs and objects.</li>
          <li><strong>Layer 3 (Semantic)</strong>: Attention strongly favors all content words while largely ignoring function words (the, on, a), creating a global semantic summary.</li>
        </ul>

        <AttentionFlowWidget />
      </Section>

      <Section title="5. Emergent Reasoning Abilities">
        <P>
          Perhaps the most remarkable aspect of neural reasoning is <strong>emergence</strong>: capabilities that appear abruptly as models scale, without being explicitly trained. Wei et al. (2022) documented that abilities like multi-step arithmetic, analogical reasoning, and code generation appear suddenly once models cross certain parameter thresholds — they are absent in smaller models and present in larger ones, with a sharp transition rather than a gradual improvement.
        </P>
        <P>
          This raises a fundamental question: do large language models genuinely <em>reason</em>, or do they merely pattern-match on an astronomically large scale? The answer likely lies somewhere in between. As Elhage et al. (2021) showed through circuit analysis at Anthropic, Transformers develop structured internal algorithms — identifiable circuits that implement specific reasoning steps — but these circuits operate through continuous-valued activations rather than discrete symbolic rules.
        </P>
      </Section>

      <Section title="6. Limitations of Pure Connectionism">
        <P>
          Despite their versatility, pure neural models suffer from serious reasoning flaws that remain active areas of research:
        </P>
        <ul style={{ fontSize: '15px', color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '16px', lineHeight: 1.8 }}>
          <li><strong>Hallucinations</strong>: Neural nets construct answers probabilistically and cannot distinguish verified facts from plausible-sounding falsehoods. The model will generate confident, fluent text even when the underlying claim is entirely fabricated.</li>
          <li><strong>Opacity</strong>: Despite progress in mechanistic interpretability, inspecting activations or weights does not yield a clean logical proof. We can identify <em>what</em> circuits activate, but explaining <em>why</em> they compose a particular answer remains extremely difficult.</li>
          <li><strong>Compositional generalization failure</strong>: Neural models struggle with systematic compositional reasoning — tasks requiring the application of learned rules in novel combinations. A model that learns "A is left of B" and "B is left of C" may fail to infer "A is left of C" if it never saw that exact combination during training.</li>
          <li><strong>Sensitivity to surface form</strong>: Rephrasing a math problem or changing variable names can dramatically alter a model's accuracy, suggesting it may rely on surface correlations rather than deep structural understanding.</li>
        </ul>

        <Callout type="accent">
          These limitations have driven AI research toward hybridization — combining connectionist flexibility with symbolic precision to create <strong>neuro-symbolic reasoning</strong> systems that can learn from noisy data <em>and</em> guarantee logical correctness.
        </Callout>
      </Section>

      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://doi.org/10.1007/BF02478259" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              A Logical Calculus of the Ideas Immanent in Nervous Activity
            </a> — McCulloch, W.S. & Pitts, W., 1943. Foundational paper proving that networks of idealized neurons can compute any logical function.
          </li>
          <li>
            <a href="https://doi.org/10.1037/h0042519" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain
            </a> — Rosenblatt, F., 1958. Introduced the first trainable neural network model capable of learning from data.
          </li>
          <li>
            <a href="https://doi.org/10.1038/323533a0" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Learning Representations by Back-Propagating Errors
            </a> — Rumelhart, D.E., Hinton, G.E., & Williams, R.J., 1986. Demonstrated backpropagation for training multi-layer neural networks.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Attention Is All You Need
            </a> — Vaswani, A., et al., 2017. Introduced the Transformer architecture with self-attention replacing recurrence.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2012.14913" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Transformer Feed-Forward Layers Are Key-Value Memories
            </a> — Geva, M., et al., 2021. Showed that FFN layers act as key-value memory stores for factual knowledge.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2202.05262" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Locating and Editing Factual Associations in GPT
            </a> — Meng, K., et al., 2022. Introduced ROME for surgically editing factual knowledge in language models.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2206.07682" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Emergent Abilities of Large Language Models
            </a> — Wei, J., et al., 2022. Documented abilities that appear abruptly as language models scale past certain thresholds.
          </li>
          <li>
            <a href="https://transformer-circuits.pub/2021/framework/index.html" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              A Mathematical Framework for Transformer Circuits
            </a> — Elhage, N., et al., 2021. Anthropic's mechanistic interpretability framework for understanding Transformer internals.
          </li>
        </ul>
      </Section>
    </div>
  );
}
