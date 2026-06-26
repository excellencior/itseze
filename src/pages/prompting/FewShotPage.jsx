import { useState, useRef } from 'react';
import Latex from '../../components/Latex';
import InlinePanel from '../../components/viz/InlinePanel';
import Callout from '../../components/Callout';

function Section({ title, children }) {
  return (
    <div id={title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')} data-section style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p>{children}</p>;
}



/* ── Demonstration Builder Widget ── */
const DEMOS = [
  { input: 'I love this movie!', output: 'Positive' },
  { input: 'Terrible waste of time.', output: 'Negative' },
  { input: 'It was okay, nothing special.', output: 'Neutral' },
  { input: 'Best purchase I ever made!', output: 'Positive' },
  { input: 'The product broke after one day.', output: 'Negative' },
  { input: 'Average quality for the price.', output: 'Neutral' },
  { input: 'Absolutely stunning performance!', output: 'Positive' },
  { input: 'Would not recommend to anyone.', output: 'Negative' },
];
const TEST_INPUT = 'The camera quality exceeded my expectations but the battery drains fast.';
const K_OPTIONS = [0, 1, 2, 4, 8];

function estimateTokens(text) {
  return Math.ceil(text.length / 3.8);
}

export function DemonstrationBuilderWidget() {
  const [k, setK] = useState(0);
  const maxCtx = 4096;

  const systemPrompt = 'Classify the sentiment of the following text as Positive, Negative, or Neutral.';
  const demoLines = DEMOS.slice(0, k).map((d, i) =>
    `Example ${i + 1}:\nInput: ${d.input}\nOutput: ${d.output}`
  );
  const testLine = `Input: ${TEST_INPUT}\nOutput:`;
  const fullPrompt = [systemPrompt, ...demoLines, testLine].join('\n\n');
  const tokenCount = estimateTokens(fullPrompt);
  const tokenPct = Math.min((tokenCount / maxCtx) * 100, 100);

  const labelColors = { Positive: '#10B981', Negative: '#EF4444', Neutral: '#F59E0B' };

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '4px' }}>Interactive</div>
        <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Demonstration Builder</div>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Select the number of demonstrations <em>k</em> and watch the few-shot prompt assemble in real time.</div>
      </div>

      {/* k selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '4px' }}>k =</span>
        {K_OPTIONS.map(v => (
          <button
            key={v}
            onClick={() => setK(v)}
            style={{
              padding: '4px 14px',
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              border: `1px solid ${v === k ? 'var(--accent)' : 'var(--border)'}`,
              background: v === k ? 'var(--accent)' : 'transparent',
              color: v === k ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: 'all 0.2s',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Token bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Token usage</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{tokenCount} / {maxCtx}</span>
        </div>
        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${tokenPct}%`,
            background: tokenPct > 75 ? '#EF4444' : tokenPct > 40 ? '#F59E0B' : 'var(--accent)',
            borderRadius: '3px',
            transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1), background 0.3s',
          }} />
        </div>
      </div>

      {/* Demonstration cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {k === 0 && (
          <div style={{
            padding: '14px 16px',
            background: '#1e1e24',
            border: '1px dashed #444',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#888',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>
            Zero-shot — no demonstrations provided. The model relies solely on the task instruction.
          </div>
        )}
        {DEMOS.slice(0, k).map((d, i) => (
          <div
            key={`demo-${i}-${k}`}
            style={{
              padding: '10px 14px',
              background: '#1e1e24',
              border: '1px solid #333',
              borderRadius: '6px',
              animation: 'demoFadeIn 0.4s cubic-bezier(0.22,1,0.36,1) both',
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>Example {i + 1}</span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '3px',
                background: `${labelColors[d.output]}22`,
                color: labelColors[d.output],
                letterSpacing: '0.04em',
              }}>{d.output}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
              <span style={{ color: '#e5c07b' }}>{d.input}</span>
              <span style={{ color: '#555', fontSize: '14px' }}>→</span>
              <span style={{ color: labelColors[d.output], fontWeight: 600 }}>{d.output}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Test input */}
      <div style={{
        padding: '10px 14px',
        background: '#1e1e24',
        border: '2px solid var(--accent)',
        borderRadius: '6px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>Test Input</span>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', color: '#888' }}>awaiting prediction</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
          <span style={{ color: '#e5c07b' }}>{TEST_INPUT}</span>
          <span style={{ color: '#555', fontSize: '14px' }}>→</span>
          <span style={{ color: '#888', fontWeight: 600, animation: 'demoBlink 1.2s step-end infinite' }}>?</span>
        </div>
      </div>

      {/* Full prompt preview */}
      <details style={{ marginBottom: '4px' }}>
        <summary style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', userSelect: 'none' }}>
          View assembled prompt
        </summary>
        <div style={{
          background: '#1e1e24',
          color: '#e5c07b',
          padding: '14px 16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11.5px',
          lineHeight: 1.65,
          border: '1px solid #333',
          borderRadius: '4px',
          maxHeight: '220px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {fullPrompt}
        </div>
      </details>

      {/* Keyframe styles */}
      <style>{`
        @keyframes demoFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes demoBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function FewShotPage() {
  const [demoPanelOpen, setDemoPanelOpen] = useState(false);
  const demoBtnRef = useRef(null);

  const handleDemoToggle = () => {
    setDemoPanelOpen(prev => {
      const next = !prev;
      if (next && demoBtnRef.current) {
        setTimeout(() => {
          demoBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return next;
    });
  };

  const handleDemoClose = () => {
    setDemoPanelOpen(false);
    if (demoBtnRef.current) {
      setTimeout(() => {
        demoBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Prompting
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Few-Shot In-Context Learning
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          The paradigm-defining discovery of GPT-3: large language models can learn new tasks at inference time simply by conditioning on a handful of input-output demonstrations, without any gradient updates to model parameters.
        </p>
      </div>

      {/* Section 1 */}
      <Section title="1. The In-Context Learning Paradigm">
        <P>
          <strong>In-context learning</strong> (ICL) refers to a model's ability to perform a new task at inference time by conditioning on a small set of <Latex math="k" /> input-output demonstrations, called <strong>few-shot examples</strong>, prepended to the prompt. Crucially, ICL involves <em>no gradient updates</em> to the model's parameters. The entire "learning" occurs through the forward pass: the model reads the demonstrations, infers the latent task structure, and generates an appropriate completion for the test query. This stands in sharp contrast to the traditional <strong>fine-tuning</strong> paradigm, which requires collecting a task-specific labeled dataset, computing gradients via backpropagation, and updating some or all of the model's weights through iterative optimization.
        </P>
        <P>
          Formally, given a pre-trained language model <Latex math="p_\theta" />, a set of demonstrations <Latex math="D = \{(x_1, y_1), (x_2, y_2), \ldots, (x_k, y_k)\}" />, and a test input <Latex math="x_{\text{test}}" />, few-shot ICL computes the prediction as follows.
        </P>
        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="y_{\text{test}} = \arg\max_y \, p_\theta(y \mid D, x_{\text{test}})" />
        </div>
        <P>
          The parameters <Latex math="\theta" /> remain frozen throughout; the demonstrations <Latex math="D" /> serve purely as a textual conditioning signal.
        </P>
        <Callout type="key">
          The defining property of in-context learning is that the model's weights are never updated. All task adaptation happens through the input text itself. The demonstrations act as a soft specification of the desired input-output mapping.
        </Callout>
        <P>
          Brown et al. (2020) systematically defined three evaluation settings for GPT-3: <strong>zero-shot</strong> (a natural language task description only, with no examples), <strong>one-shot</strong> (a single demonstration), and <strong>few-shot</strong> (typically 10 to 100 demonstrations, limited only by the model's context window). The following prompt illustrates a typical few-shot translation setup:
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            prompt example
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Translate English to French:

English: The weather is beautiful today.
French: Le temps est magnifique aujourd'hui.

English: Where is the nearest library?
French: Où est la bibliothèque la plus proche ?

English: I would like a cup of coffee, please.
French: Je voudrais une tasse de café, s'il vous plaît.

English: How much does this cost?
French:`}</pre>
        </div>

        <P>
          In this example, three English-French pairs serve as demonstrations. The model observes the pattern: each English sentence is followed by its French translation. It then applies this mapping to the final, unanswered query. No translation-specific training data, loss function, or optimizer is involved.
        </P>
      </Section>

      {/* Section 2 */}
      <Section title="2. Emergence at Scale">
        <P>
          The central empirical finding of Brown et al. (2020) was that few-shot in-context learning is an <strong>emergent capability</strong> that appears, and dramatically improves, with model scale. The authors trained GPT-3, a 175 billion parameter autoregressive Transformer, which was at the time 10× larger than any previous non-sparse language model. The architecture employed a standard Transformer design with alternating dense and locally banded sparse attention patterns across its 96 layers.
        </P>
        <P>
          Across a comprehensive suite of NLP benchmarks, spanning translation, question answering, cloze tasks, word unscrambling, and 3-digit arithmetic, the authors observed a consistent pattern: <em>the performance gap between zero-shot and few-shot evaluation widens as model size increases</em>. Smaller models (e.g., GPT-3 Small at 125M parameters) showed only modest improvements when provided with demonstrations. By contrast, GPT-3 175B exhibited substantial gains, often achieving results competitive with state-of-the-art fine-tuned models on the same benchmarks.
        </P>
        <Callout type="info">
          GPT-3 was trained on a filtered version of Common Crawl, WebText2, Books1, Books2, and English-language Wikipedia, totaling approximately 570 GB of text after filtering. The diversity of this pre-training corpus is believed to be a key factor enabling broad generalization across tasks.
        </Callout>
        <P>
          This scale-dependent emergence had profound implications. It suggested that in-context learning is not merely a surface-level pattern-matching heuristic but rather a capability that becomes qualitatively more powerful as the model's representational capacity grows. The 175B model could, for instance, perform 2-digit addition with high accuracy in the few-shot setting, a task that requires implicit algorithmic reasoning rather than lexical pattern matching. On SuperGLUE, GPT-3 few-shot approached the performance of fine-tuned BERT-Large, despite never updating a single parameter on task-specific data.
        </P>
        <Callout type="accent">
          The scaling behavior of ICL fundamentally challenged the prevailing fine-tuning paradigm: if a sufficiently large model can match fine-tuned performance by simply reading a few examples, the economic and engineering calculus of NLP deployment shifts entirely.
        </Callout>
      </Section>

      {/* Section 3 */}
      <Section title="3. Mechanics of In-Context Learning">
        <P>
          A central open question in the field is <em>how</em> in-context learning works mechanistically. How can a model "learn" a task from demonstrations without any weight updates? Several theoretical frameworks have been proposed, each offering a partial but illuminating perspective.
        </P>
        <P>
          <strong>ICL as implicit Bayesian inference.</strong> Xie et al. (2022) provided a formal analysis showing that in-context learning can be understood as implicit Bayesian inference over a latent concept variable. Under their framework, the pre-training distribution is modeled as a mixture of latent "concepts" (analogous to tasks or domains). When demonstrations are provided, the model implicitly performs posterior inference, using the examples to narrow down which concept generated the data, and then generates completions consistent with the inferred concept. Formally, if <Latex math="\theta" /> represents the latent concept, the model computes something akin to the following expression, where <Latex math="p(\theta \mid D)" /> is the posterior over concepts given the demonstrations.{' '}
          <button
            ref={demoBtnRef}
            onClick={handleDemoToggle}
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
        <InlinePanel open={demoPanelOpen} onClose={handleDemoClose} maxHeight="900px">
          <DemonstrationBuilderWidget />
        </InlinePanel>
        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="p(y \mid x_{\text{test}}, D) = \sum_\theta p(y \mid x_{\text{test}}, \theta) \, p(\theta \mid D)" />
        </div>
        <P>
          <strong>ICL as implicit meta-learning.</strong> A complementary perspective frames pre-training itself as a form of meta-learning. During pre-training, the model is exposed to a vast distribution of implicit "tasks" embedded in natural text: summarization within news articles, translation within multilingual documents, question-answering within educational texts. The Transformer architecture, with its attention mechanism, learns a general-purpose algorithm for extracting task specifications from context and applying them to new inputs. In this view, ICL is not a surprising emergent behavior but rather the <em>intended</em> output of a meta-learning process that spans the entire pre-training phase.
        </P>
        <P>
          <strong>The role of the pre-training distribution.</strong> Min et al. (2022) conducted a surprising experiment that further illuminated ICL mechanics: they found that, by <em>randomly replacing the labels</em> in few-shot demonstrations, (e.g., assigning incorrect sentiment labels to reviews) had only a modest effect on performance. This suggested that ICL relies heavily on the <em>format</em> and <em>input distribution</em> of the demonstrations rather than the specific input-label mappings. The demonstrations appear to serve primarily as a signal about the task format, label space, and input distribution. This is information the model uses to activate the appropriate pre-trained capabilities.
        </P>
        <Callout type="key">
          These findings suggest that in-context learning is not a single mechanism but a composite phenomenon: the demonstrations simultaneously specify the task format, constrain the output space, activate relevant pre-trained knowledge, and, in larger models, provide genuine input-output mapping information.
        </Callout>
      </Section>

      {/* Section 4 */}
      <Section title="4. Sensitivity and Failure Modes">
        <P>
          Despite its remarkable capabilities, few-shot in-context learning exhibits well-documented <strong>brittleness</strong> that practitioners must carefully navigate. The same model, given the same set of demonstrations in different configurations, can produce wildly divergent results.
        </P>
        <P>
          <strong>Example ordering sensitivity.</strong> Lu et al. (2022) demonstrated that the <em>permutation</em> of few-shot examples alone can cause accuracy to swing from near-chance to near-state-of-the-art on the same task. On the SST-2 sentiment classification benchmark, simply reordering the same set of demonstrations produced accuracy ranging from approximately 54% (near random) to 93% (near SOTA). This extreme sensitivity to ordering is not predicted by any simple theory of ICL and remains an active area of investigation.
        </P>
        <Callout type="warning">
          Reporting few-shot results from a single example ordering is methodologically inadequate. Robust evaluation requires averaging over multiple permutations or using principled ordering strategies such as the entropy-based methods proposed by Lu et al. (2022).
        </Callout>
        <P>
          Several systematic biases have been identified in few-shot ICL:
        </P>
        <ul style={{ fontSize: '15px', lineHeight: 2, paddingLeft: '20px', marginBottom: '16px' }}>
          <li><strong>Majority label bias:</strong> Models disproportionately predict whichever label appears most frequently in the demonstrations, regardless of the test input's true label.</li>
          <li><strong>Recency bias:</strong> Labels appearing toward the end of the demonstration sequence exert a stronger influence on the model's prediction than those appearing earlier, reflecting the autoregressive attention pattern.</li>
          <li><strong>Label space bias:</strong> The model may exhibit strong prior preferences for certain tokens in the label space (e.g., preferring "positive" over "negative"), independent of the demonstrations provided.</li>
          <li><strong>Format sensitivity:</strong> The choice between natural language templates (e.g., "This review is positive") versus structured formats (e.g., "Input: ... Label: positive") can significantly affect performance, and the optimal format varies by task and model.</li>
        </ul>
        <P>
          These failure modes collectively suggest that few-shot ICL, while powerful, is not a reliable drop-in replacement for fine-tuning in high-stakes applications without careful calibration and prompt engineering. Techniques such as contextual calibration, which adjusts predictions by the model's prior bias estimated from content-free inputs, have been proposed to mitigate some of these issues, though none fully resolves the underlying fragility.
        </P>
      </Section>

      {/* Section 5 */}
      <Section title="5. Legacy and Impact">
        <P>
          Few-shot in-context learning, as demonstrated by GPT-3, represents one of the most consequential discoveries in modern NLP. It fundamentally reshaped how practitioners interact with language models, inaugurating what is now called the <strong>prompting paradigm</strong>: the idea that task-specific behavior can be elicited through carefully designed textual inputs rather than through model retraining.
        </P>
        <P>
          The impact of this discovery cascaded through the field in several directions:
        </P>
        <ul style={{ fontSize: '15px', lineHeight: 2, paddingLeft: '20px', marginBottom: '16px' }}>
          <li><strong>Chain-of-thought prompting:</strong> Wei et al. (2022) extended the few-shot paradigm by including explicit reasoning steps within each demonstration. Rather than providing only input-output pairs, chain-of-thought demonstrations include intermediate reasoning traces, enabling models to solve complex multi-step problems that are intractable under standard few-shot ICL.</li>
          <li><strong>Instruction tuning:</strong> The success of ICL motivated research into training models to follow arbitrary instructions, blending the flexibility of prompting with the reliability of fine-tuning. This led to systems like InstructGPT and FLAN.</li>
          <li><strong>Prompt engineering as a discipline:</strong> ICL spawned an entirely new field concerned with optimizing prompts, including automatic prompt search, prompt tuning (soft prompts), and the study of what makes certain demonstrations more effective than others.</li>
          <li><strong>Democratization of NLP:</strong> By eliminating the need for task-specific training data and GPU-intensive fine-tuning, ICL made sophisticated NLP capabilities accessible to users without machine learning expertise, a shift that catalyzed the rapid adoption of large language models across industries.</li>
        </ul>
        <Callout type="accent">
          Few-shot ICL did not merely introduce a new technique; it redefined the interface between humans and language models. The prompt became the program, and natural language became the programming language of AI systems.
        </Callout>
        <P>
          Today, virtually every major prompting strategy, from chain of thought to tree of thought to retrieval-augmented generation, traces its conceptual lineage to the few-shot in-context learning paradigm established by Brown et al. (2020). The discovery that large Transformers can learn from examples provided at inference time remains one of the foundational insights of the current era of artificial intelligence.
        </P>
      </Section>

      {/* References */}
      <Section title="References &amp; Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Language Models are Few-Shot Learners
            </a> by Brown, T.B., Mann, B., Ryder, N., et al., NeurIPS 2020. The foundational GPT-3 paper establishing few-shot in-context learning as a viable paradigm across diverse NLP tasks.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2111.02080" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              An Explanation of In-context Learning as Implicit Bayesian Inference
            </a> by Xie, S.M., Raghunathan, A., Liang, P., &amp; Ma, T., ICLR 2022. A theoretical framework modeling ICL as posterior inference over latent concepts in the pre-training distribution.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2104.08786" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Fantastically Ordered Prompts and Where to Find Them
            </a> by Lu, Y., Bartolo, M., Moore, A., Riedel, S., &amp; Stenetorp, P., ACL 2022. Demonstrates that few-shot prompt ordering can cause accuracy swings from near-chance to near-SOTA and proposes entropy-based ordering strategies.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2202.12837" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?
            </a> by Min, S., Lyu, X., Holtzman, A., et al., EMNLP 2022. Reveals that ground-truth labels in demonstrations matter less than expected, suggesting ICL relies heavily on format and input distribution cues.
          </li>
        </ul>
      </Section>
    </div>
  );
}
