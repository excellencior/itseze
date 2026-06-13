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
  return <p>{children}</p>;
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


/* ── Static node card used in the tree diagram ── */
function TreeNode({ label, desc, status, style: overrides }) {
  const palette = {
    success: { border: '#10B981', bg: '#F0FDF4', color: '#059669', icon: '✓' },
    failure: { border: '#EF4444', bg: '#FEF2F2', color: '#DC2626', icon: '✗' },
    backtrack: { border: '#F59E0B', bg: '#FFFBEB', color: '#D97706', icon: '↩' },
    root: { border: 'var(--accent)', bg: 'var(--accent-20)', color: 'var(--accent)', icon: '◉' },
    neutral: { border: 'var(--border)', bg: '#fff', color: '#555', icon: '→' },
  };
  const p = palette[status] || palette.neutral;

  return (
    <div style={{
      border: `1.5px ${status === 'backtrack' ? 'dashed' : 'solid'} ${p.border}`,
      background: p.bg,
      padding: '10px 14px',
      fontSize: '12.5px',
      lineHeight: 1.5,
      width: '100%',
      ...overrides,
    }}>
      <div style={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', color: p.color, marginBottom: '3px' }}>
        {p.icon} {label}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{desc}</div>
    </div>
  );
}

function ThoughtTreeDiagram() {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px', margin: '24px 0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Search trace diagram
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.3px' }}>
        Tree-of-Thoughts Search & Backtracking
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        The diagram below shows the complete deliberative search tree for a simple word problem. The model generates intermediate reasoning steps, detects an arithmetic error in Branch A via self-verification, prunes that path, backtracks, and explores the correct alternative in Branch B.
      </p>

      {/* ── Tree layout ── */}
      <div style={{ position: 'relative', background: '#FAF8F1', border: '1px solid var(--border)', padding: '28px 24px 24px' }}>

        {/* ── SVG connector lines ── */}
        <svg viewBox="0 0 1000 420" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
            </marker>
            <marker id="arrowRed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
            </marker>
            <marker id="arrowAmber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
            </marker>
          </defs>

          {/* Root → Step 1 */}
          <line x1="500" y1="58" x2="500" y2="82" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
          {/* Step 1 → Step 2 */}
          <line x1="500" y1="132" x2="500" y2="156" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />

          {/* Step 2 → Branch A (left fork) */}
          <path d="M 500 206 Q 500 230 300 240" fill="none" stroke="#EF4444" strokeWidth="1.5" markerEnd="url(#arrowRed)" />
          {/* Step 2 → Branch B (right fork) */}
          <path d="M 500 206 Q 500 230 700 240" fill="none" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />

          {/* Branch A → Pruned (strikethrough) */}
          <line x1="300" y1="306" x2="300" y2="328" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="260" y1="320" x2="340" y2="320" stroke="#EF4444" strokeWidth="2" />

          {/* Backtrack arrow from Branch A back up to Step 2 */}
          <path d="M 220 280 Q 100 240 400 200" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 4" markerEnd="url(#arrowAmber)" />

          {/* Branch B → Answer */}
          <line x1="700" y1="306" x2="700" y2="336" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
        </svg>

        {/* ── Node layer ── */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Root node */}
          <div style={{ width: '70%', maxWidth: '520px', marginBottom: '24px' }}>
            <TreeNode
              status="root"
              label="Problem Input"
              desc="A bag has 3 apples. Mary adds 4 oranges. John takes away 2 fruits. How many fruits remain?"
            />
          </div>

          {/* Step 1 */}
          <div style={{ width: '60%', maxWidth: '440px', marginBottom: '24px' }}>
            <TreeNode
              status="success"
              label="Step 1 — Parse initial state"
              desc="Apples = 3. Total fruits = 3."
            />
          </div>

          {/* Step 2 */}
          <div style={{ width: '60%', maxWidth: '440px', marginBottom: '28px' }}>
            <TreeNode
              status="success"
              label="Step 2 — Parse addition"
              desc="Mary adds 4 oranges → 3 + 4 = 7. Total = 7."
            />
          </div>

          {/* ── Fork: Branch A (left) & Branch B (right) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', marginBottom: '10px' }}>

            {/* Branch A — Error */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <TreeNode
                status="failure"
                label="Branch A — Subtraction (Error)"
                desc="7 − 2 = 6. Self-check: 7 − 2 ≠ 6. ✗ Fails verification."
              />
              <TreeNode
                status="backtrack"
                label="Pruned — Backtrack to Step 2"
                desc="Invalid branch discarded. Search returns to total = 7 and explores Branch B."
              />
            </div>

            {/* Branch B — Correct */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <TreeNode
                status="success"
                label="Branch B — Subtraction (Correct)"
                desc="7 − 2 = 5. Self-check: 7 − 2 = 5. ✓ Passes verification."
              />
              <TreeNode
                status="root"
                label="Final Answer"
                desc="All steps verified. The bag contains 5 fruits."
              />
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
            <span><span style={{ color: '#10B981' }}>━━</span> Verified path</span>
            <span><span style={{ color: '#EF4444' }}>━━</span> Failed branch</span>
            <span><span style={{ color: '#F59E0B' }}>╌╌</span> Backtrack</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChainOfThoughtPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Reasoning
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Chain-of-Thought Reasoning
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          Teaching language models to think step-by-step. Chain-of-thought prompting transforms a single-pass token predictor into a deliberative reasoning engine, unlocking systematic deduction, error detection, and backtracking search.
        </p>
      </div>

      <Section title="1. The Problem with Direct Answering">
        <P>
          Large language models generate text one token at a time, left to right. For simple factual questions ("What is the capital of France?"), predicting the answer directly works well — the answer is a single cached association. But for complex multi-step problems — arithmetic, logical puzzles, multi-hop reasoning — predicting the final answer in a single forward pass is fundamentally limited.
        </P>
        <P>
          Consider the question: "If a train travels at 60 mph for 2.5 hours, then stops for 30 minutes, then travels at 80 mph for 1 hour, what is the total distance?" A model trying to output just the answer must perform multiple multiplications and an addition <em>implicitly</em> within its hidden activations — a task that exceeds what fixed-depth Transformer circuits can reliably compute.
        </P>

        <Callout type="key">
          The core insight: <strong>generating intermediate reasoning tokens</strong> is not just cosmetic — it fundamentally increases the model's computational capacity. Each intermediate token acts as an external memory register, allowing the model to decompose complex computations into sequences of simpler steps.
        </Callout>
      </Section>

      <Section title="2. Chain-of-Thought Prompting">
        <P>
          Jason Wei et al. (2022) introduced <strong>Chain-of-Thought (CoT) prompting</strong> at NeurIPS, demonstrating that a simple modification to the prompt — including step-by-step reasoning examples, or even just appending "Let's think step by step" — could dramatically improve performance on reasoning benchmarks.
        </P>
        <P>
          The technique works by providing few-shot examples where the answer includes explicit intermediate steps. The model learns to mimic this format, generating its own intermediate reasoning before arriving at the final answer. On the GSM8K math benchmark, CoT improved accuracy from 17.9% to 58.1% for the PaLM 540B model — a 3× improvement from a prompting change alone.
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            prompt example
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Q: Roger has 5 tennis balls. He buys 2 cans of
3 tennis balls each. How many does he have now?

A: Roger starts with 5 balls. He buys 2 cans,
each with 3 balls, so 2 × 3 = 6 new balls.
Total = 5 + 6 = 11. The answer is 11.`}</pre>
        </div>

        <P>
          Kojima et al. (2022) further showed that even <strong>zero-shot CoT</strong> — simply appending "Let's think step by step" without any examples — significantly improves reasoning, suggesting that LLMs already contain latent step-by-step reasoning capabilities that just need to be elicited.
        </P>
      </Section>

      <Section title="3. Tree of Thoughts">
        <P>
          Standard CoT is <em>linear</em>: the model generates one reasoning path and commits to it. If it makes a mistake in Step 2, that error propagates irreversibly through all subsequent steps. Shunyu Yao et al. (2023) addressed this with <strong>Tree of Thoughts (ToT)</strong>, which generalizes CoT from a single chain to a search tree.
        </P>
        <P>
          In ToT, the model generates multiple candidate "thoughts" at each step, evaluates them using a self-critique mechanism (asking "Is this step correct? Does it make progress toward the goal?"), and uses standard search algorithms — Breadth-First Search (BFS) or Depth-First Search (DFS) — to explore promising branches, prune dead ends, and backtrack when a contradiction is detected.
        </P>

        <Callout type="info">
          ToT transforms the language model from a passive text generator into an active search agent — one that can explore, evaluate, and backtrack, much like a human solving a puzzle on a whiteboard.
        </Callout>
      </Section>

      <Section title="4. Thought Tree Diagram">
        <P>
          The tree below illustrates deliberative reasoning in action. Notice the critical moment where the model's self-verification check detects an arithmetic error, prunes the incorrect branch, backtracks to the last stable state, and explores a correct alternative path.
        </P>

        <ThoughtTreeDiagram />
      </Section>

      <Section title="5. Inference-Time Compute Scaling">
        <P>
          Chain-of-thought and tree search represent a fundamental shift in how AI systems allocate computational resources. Traditional scaling laws (Kaplan et al., 2020) focused on <em>training-time</em> compute: more parameters and more data yield better models. CoT introduces <strong>inference-time compute scaling</strong>: spending more tokens (and time) during generation to think more carefully about hard problems.
        </P>
        <P>
          This connects to the cognitive science concept of <strong>System 2 thinking</strong> — conscious, slow, and effortful reasoning. In AI terms, this is achieved by:
        </P>

        <ul >
          <li><strong>Search over tokens</strong>: The model generates more intermediate tokens, trading speed for accuracy on hard problems.</li>
          <li><strong>Self-verification</strong>: The model critiques its own intermediate steps before committing, catching errors early.</li>
          <li><strong>Backtracking and retry</strong>: Rather than a single forward pass, the model can explore multiple reasoning paths and select the best one.</li>
          <li><strong>Reinforcement learning from reasoning traces</strong>: Models like OpenAI's o1 are trained with RL to optimize their internal chain of thought, learning <em>when</em> to think longer, when to backtrack, and when to verify assumptions.</li>
        </ul>

        <Callout type="accent">
          The implication is profound: with inference-time scaling, a smaller model that thinks carefully can outperform a larger model that answers impulsively. Quality of reasoning can substitute for quantity of parameters.
        </Callout>
      </Section>

      <Section title="6. Limitations and Faithfulness">
        <P>
          Despite the impressive gains, CoT reasoning has important limitations:
        </P>

        <ul >
          <li><strong>Faithfulness concerns</strong>: The generated chain of thought may not reflect the model's actual internal computation. Turpin et al. (2023) showed that models can produce correct-looking reasoning chains that are actually post-hoc rationalizations rather than genuine step-by-step derivations.</li>
          <li><strong>Error compounding</strong>: Even with self-verification, errors in early steps can cascade in subtle ways. A wrong intermediate value may not trigger an obvious contradiction, leading to a plausible-looking but incorrect final answer.</li>
          <li><strong>Prompt sensitivity</strong>: CoT performance depends heavily on prompt formatting, example selection, and instruction phrasing. Small changes to the prompt can cause large swings in accuracy.</li>
        </ul>
      </Section>

      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
            </a> — Wei, J., Wang, X., Schuurmans, D., et al., 2022. The foundational paper introducing few-shot chain-of-thought prompting at NeurIPS.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2205.11916" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Large Language Models are Zero-Shot Reasoners
            </a> — Kojima, T., Gu, S.S., Reid, M., Matsuo, Y., &amp; Iwasawa, Y., 2022. Shows that appending "Let's think step by step" enables zero-shot CoT reasoning.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2305.10601" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Tree of Thoughts: Deliberate Problem Solving with Large Language Models
            </a> — Yao, S., Yu, D., Zhao, J., et al., 2023. Generalizes CoT to tree search with self-evaluation and backtracking.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2001.08361" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Scaling Laws for Neural Language Models
            </a> — Kaplan, J., McCandlish, S., Henighan, T., et al., 2020. Empirical study of how model performance scales with parameters, data, and compute.
          </li>
          <li>
            <a href="https://openai.com/index/learning-to-reason-with-llms/" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Learning to Reason with LLMs
            </a> — OpenAI, 2024. Blog post describing the o1 model series trained with RL to produce extended reasoning chains.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2305.04388" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Language Models Don't Always Say What They Think
            </a> — Turpin, M., Michael, J., Perez, E., &amp; Bowman, S.R., 2023. Demonstrates unfaithful explanations in chain-of-thought prompting.
          </li>
        </ul>
      </Section>
    </div>
  );
}
