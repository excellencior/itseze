import { useState, useRef } from 'react';
import Latex from '../../components/Latex';
import InlinePanel from '../../components/viz/InlinePanel';

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

// ── CoT Trace Stepper Widget ──
export function CoTTraceStepperWidget() {
  const [activeTab, setActiveTab] = useState('standard');
  const [revealedSteps, setRevealedSteps] = useState(0);

  const cotSteps = [
    { text: 'Roger started with 5 balls.', label: 'Identify given' },
    { text: '2 cans × 3 balls = 6 balls.', label: 'Compute purchase' },
    { text: '5 + 6 = 11.', label: 'Add totals' },
    { text: 'The answer is 11.', label: 'Final answer' },
  ];

  const handleNext = () => {
    if (revealedSteps < cotSteps.length) setRevealedSteps(prev => prev + 1);
  };
  const handleReset = () => setRevealedSteps(0);

  const progress = cotSteps.length > 0 ? revealedSteps / cotSteps.length : 0;

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '4px' }}>
          Interactive
        </div>
        <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>
          Chain-of-Thought Trace Stepper
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Compare how standard prompting gives a direct answer vs. how CoT reveals reasoning step by step.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0px', marginBottom: '16px' }}>
        {[
          { key: 'standard', label: 'Standard' },
          { key: 'cot', label: 'Chain-of-Thought' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); if (key === 'standard') handleReset(); }}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 700,
              border: `1.5px solid ${activeTab === key ? 'var(--accent)' : 'var(--border)'}`,
              borderRight: key === 'standard' ? 'none' : undefined,
              borderRadius: key === 'standard' ? '4px 0 0 4px' : '0 4px 4px 0',
              background: activeTab === key ? 'var(--accent)' : 'transparent',
              color: activeTab === key ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Question block (shared) */}
      <div style={{
        background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', marginBottom: '0',
        fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.7,
        border: '1px solid #333', borderBottom: 'none', borderRadius: '6px 6px 0 0',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
          {activeTab === 'standard' ? 'standard prompting' : 'chain-of-thought'}
        </div>
        <div style={{ color: '#888', marginBottom: '2px' }}>Q:</div>
        <div style={{ paddingLeft: '20px' }}>
          Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?
        </div>
      </div>

      {/* Answer block */}
      <div style={{
        background: '#1e1e24', padding: '16px 20px', paddingTop: '12px',
        fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.7,
        border: '1px solid #333', borderTop: '1px dashed #333', borderRadius: '0 0 6px 6px',
        minHeight: '80px',
      }}>
        <div style={{ color: '#888', marginBottom: '6px' }}>A:</div>

        {activeTab === 'standard' ? (
          <div style={{ paddingLeft: '20px' }}>
            <span style={{ color: '#e5c07b' }}>The answer is 11.</span>
            <span style={{
              display: 'inline-block', marginLeft: '12px',
              fontSize: '10px', fontWeight: 700, color: '#ef4444',
              background: 'rgba(239, 68, 68, 0.12)', padding: '2px 8px', borderRadius: '3px',
            }}>
              ← direct answer, no reasoning shown
            </span>
          </div>
        ) : (
          <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cotSteps.map((step, i) => {
              const isRevealed = i < revealedSteps;
              const isCurrent = i === revealedSteps - 1;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    opacity: isRevealed ? 1 : 0.15,
                    transform: isRevealed ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                    filter: isRevealed ? 'none' : 'blur(1px)',
                  }}
                >
                  {/* Step badge */}
                  <div style={{
                    minWidth: '22px', height: '22px', borderRadius: '11px',
                    background: isCurrent ? 'var(--accent)' : isRevealed ? 'rgba(8, 145, 178, 0.25)' : '#333',
                    color: isCurrent ? '#fff' : isRevealed ? 'var(--accent)' : '#555',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700,
                    transition: 'all 0.3s',
                    marginTop: '1px',
                    border: isCurrent ? '2px solid var(--accent)' : '2px solid transparent',
                    boxShadow: isCurrent ? '0 0 8px rgba(8, 145, 178, 0.4)' : 'none',
                  }}>
                    {i === cotSteps.length - 1 ? '✓' : i + 1}
                  </div>
                  {/* Step content */}
                  <div style={{ flex: 1 }}>
                    <span style={{
                      color: isCurrent ? '#e5c07b' : isRevealed ? '#b0b0b0' : '#555',
                      transition: 'color 0.3s',
                    }}>
                      {step.text}
                    </span>
                    {isRevealed && (
                      <span style={{
                        display: 'inline-block', marginLeft: '10px',
                        fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: isCurrent ? 'var(--accent)' : '#666',
                        background: isCurrent ? 'rgba(8, 145, 178, 0.12)' : 'transparent',
                        padding: '1px 6px', borderRadius: '3px',
                        transition: 'all 0.3s',
                      }}>
                        ← {step.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress + Controls (CoT only) */}
      {activeTab === 'cot' && (
        <div style={{ marginTop: '14px' }}>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', minWidth: '60px' }}>
              {revealedSteps}/{cotSteps.length} steps
            </div>
            <div style={{
              flex: 1, height: '4px', background: 'var(--border)', borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress * 100}%`,
                height: '100%',
                background: revealedSteps === cotSteps.length
                  ? 'linear-gradient(90deg, var(--accent), #10B981)'
                  : 'var(--accent)',
                borderRadius: '2px',
                transition: 'width 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              }} />
            </div>
          </div>
          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleNext}
              disabled={revealedSteps >= cotSteps.length}
              style={{
                padding: '7px 18px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                borderRadius: '4px',
                background: revealedSteps >= cotSteps.length ? '#e0e0e0' : 'var(--accent)',
                color: revealedSteps >= cotSteps.length ? '#999' : '#fff',
                cursor: revealedSteps >= cotSteps.length ? 'default' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {revealedSteps >= cotSteps.length ? 'All steps revealed ✓' : `Next Step →`}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid var(--border)',
                borderRadius: '4px',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              ↺ Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function COTPage() {
  const [cotPanel, setCotPanel] = useState(false);
  const cotBtnRef = useRef(null);

  const handleToggleCotPanel = () => {
    setCotPanel(prev => {
      const next = !prev;
      if (next && cotBtnRef.current) {
        setTimeout(() => {
          cotBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return next;
    });
  };

  const handleCloseCotPanel = () => {
    setCotPanel(false);
    if (cotBtnRef.current) {
      setTimeout(() => {
        cotBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          Chain-of-Thought Prompting
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          The breakthrough insight that providing step-by-step reasoning exemplars in the prompt dramatically improves performance on complex arithmetic, commonsense, and symbolic reasoning tasks, unlocking emergent reasoning abilities in sufficiently large language models.
        </p>
      </div>

      {/* 1. The Key Insight */}
      <Section title="1. The Key Insight">
        <P>
          Standard <strong>few-shot prompting</strong>, as introduced by Brown et al. (2020), demonstrates a task to the model by providing a handful of input output pairs in the prompt. For many tasks (sentiment classification, translation, simple factual recall) this is sufficient. But on problems requiring <em>multi-step reasoning</em>, the model confronts a fundamental bottleneck: it must collapse an arbitrarily complex reasoning process into a single forward pass that directly maps input to output.
        </P>
        <P>
          <strong>Chain-of-thought (CoT) prompting</strong>, introduced by Wei et al. (2022), resolves this bottleneck with a deceptively simple modification: instead of providing exemplars as <Latex math="(x, y)" /> pairs, provide them as <Latex math="(x, c, y)" /> triples, where <Latex math="c" /> is a sequence of intermediate reasoning steps, a <em>chain of thought</em>, connecting the input <Latex math="x" /> to the answer <Latex math="y" />.
        </P>
        <P>
          This is not merely a cosmetic change to the prompt format. By eliciting the model to generate intermediate tokens before producing the final answer, CoT expands the model's effective computational capacity. Each generated token functions as a unit of <strong>external working memory</strong>: the model can decompose a complex problem into subproblems, solve each subproblem in sequence, carry intermediate results forward through the generated text, and finally compose them into the answer. The chain of thought transforms the model from a single-step pattern matcher into a sequential reasoner.
        </P>
        <Callout type="key">
          Chain-of-thought prompting turns the model's own generated tokens into a scratchpad for multi-step computation, overcoming the fixed-depth reasoning constraint of a single transformer forward pass.
        </Callout>
      </Section>

      {/* 2. Formal Definition and Prompt Structure */}
      <Section title="2. Formal Definition and Prompt Structure">
        <P>
          Formally, a <strong>chain-of-thought prompt</strong> consists of a set of <Latex math="k" /> exemplars, each structured as a triple <Latex math="(x_i, c_i, y_i)" />, where:
        </P>
        <ul>
          <li><Latex math="x_i" /> is the input (e.g., a math word problem or a commonsense question),</li>
          <li><Latex math="c_i" /> is the chain of thought, a natural-language sequence of intermediate reasoning steps, and</li>
          <li><Latex math="y_i" /> is the final answer.</li>
        </ul>
        <P>
          At inference time, the model is presented with these <Latex math="k" /> exemplars followed by a new input <Latex math="x_{k+1}" />. The model generates <Latex math="c_{k+1}" /> (its own chain of thought) autoregressively, then produces the final answer <Latex math="y_{k+1}" />. Wei et al. (2022) used <Latex math="k = 8" /> exemplars across their experiments, hand-crafted by the authors to include simple but representative reasoning chains.
        </P>
        <P>
          The following example illustrates the structure using a GSM8K-style arithmetic word problem:
        </P>

        {/* Standard prompting example */}
        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            standard prompting
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?
A: The answer is 11.`}</pre>
        </div>

        {/* CoT prompting example */}
        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            chain-of-thought prompting
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?
A: Roger started with 5 balls. 2 cans of 3 tennis balls each is 2 × 3 = 6 tennis balls. 5 + 6 = 11. The answer is 11.`}</pre>
        </div>

        <Callout type="info">
          The chain of thought is written in natural language. No special formatting, no structured templates. The model learns the <em>pattern</em> of showing its work from the exemplars and applies it to new problems. This simplicity is a key advantage: CoT requires no fine-tuning, no architectural changes, and no specialized training data.{' '}
          <button
            ref={cotBtnRef}
            onClick={handleToggleCotPanel}
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
        </Callout>
        <InlinePanel open={cotPanel} onClose={handleCloseCotPanel}>
          <CoTTraceStepperWidget />
        </InlinePanel>
      </Section>

      {/* 3. Empirical Results */}
      <Section title="3. Empirical Results">
        <P>
          Wei et al. (2022) evaluated chain-of-thought prompting across three families of large language models (<strong>LaMDA</strong>, <strong>GPT-3</strong>, and <strong>PaLM</strong>) on a comprehensive suite of benchmarks spanning arithmetic reasoning, commonsense reasoning, and symbolic reasoning. The results established CoT as a major advance in prompting methodology.
        </P>

        <P>
          <strong>Arithmetic reasoning.</strong> The flagship result came on the <strong>GSM8K</strong> benchmark, a dataset of grade-school math word problems requiring multi-step arithmetic. PaLM 540B with 8 chain-of-thought exemplars achieved <strong>58% accuracy</strong>, surpassing the prior state-of-the-art set by a fine-tuned GPT-3 model with a learned verifier at 55% (Cobbe et al., 2021). This was a striking result: a simple prompting technique, requiring <em>zero gradient updates</em>, outperformed a system that demanded both fine-tuning and a separately trained verification module. Across additional arithmetic benchmarks (SVAMP, AQuA, ASDiv, MAWPS, SingleEq, AddSub, and MultiArith) CoT prompting consistently improved over standard few-shot prompting. On <strong>AQuA</strong> and <strong>ASDiv</strong>, PaLM 540B with CoT came within 2% of the supervised state-of-the-art.
        </P>

        <P>
          <strong>Commonsense reasoning.</strong> On <strong>CommonsenseQA</strong> and <strong>StrategyQA</strong>, CoT prompting likewise demonstrated substantial improvements. These tasks require implicit world knowledge and multi-hop inference, precisely the kind of reasoning that benefits from explicit intermediate steps.
        </P>

        <P>
          <strong>Symbolic reasoning.</strong> Wei et al. (2022) further tested CoT on symbolic reasoning tasks (e.g., last letter concatenation, coin flip) from the BIG-bench benchmark suite. CoT enabled strong generalization, including to longer sequences than those seen in the exemplars, demonstrating that the technique facilitates systematic compositional reasoning rather than mere pattern matching.
        </P>

        <Callout type="key">
          PaLM 540B + 8 CoT exemplars achieved 58% on GSM8K, surpassing the fine-tuned GPT-3 + verifier baseline (55%), using zero gradient updates. With Wang et al.'s (2023) self-consistency decoding, accuracy further climbed to 74%.
        </Callout>

        <P>
          Subsequent work by Wang et al. (2023) introduced <strong>self-consistency</strong>, a decoding strategy that samples multiple chains of thought and takes a majority vote over the final answers. Applied to the same PaLM 540B + CoT setup, self-consistency pushed GSM8K accuracy to <strong>74%</strong>, demonstrating that the reasoning chains contain genuine signal that can be aggregated for more reliable answers. It is worth noting that the PaLM 540B arithmetic results in the original paper used an external calculator for final computation, ensuring that errors in the chain of thought did not propagate through simple arithmetic mistakes.
        </P>
      </Section>

      {/* 4. Emergent Scaling Properties */}
      <Section title="4. Emergent Scaling Properties">
        <P>
          Perhaps the most theoretically significant finding of Wei et al. (2022) is that chain-of-thought reasoning is an <strong>emergent ability</strong>, a capability that appears abruptly at sufficient model scale and is essentially absent in smaller models. This places CoT squarely within the broader phenomenon of emergence in large language models, as systematically catalogued by Wei et al. (2022b) in their survey of emergent abilities.
        </P>
        <P>
          The scaling behavior is stark. In models with fewer than approximately <strong>100 billion parameters</strong>, chain-of-thought prompting not only fails to help; it actively <em>hurts</em> performance. Smaller models, when prompted to produce intermediate reasoning steps, generate <strong>incoherent chains</strong>: logically disconnected statements, incorrect intermediate computations, and hallucinated reasoning that leads to worse final answers than standard prompting provides. The chains are syntactically plausible but semantically broken.
        </P>
        <P>
          At the <Latex math="\sim" />100B parameter threshold, a phase transition occurs. The generated chains become coherent, logically structured, and, critically, <em>useful</em> for arriving at correct answers. The performance gains are dramatic and discontinuous, not the result of gradual improvement.
        </P>

        <Callout type="warning">
          In models below ~100B parameters, CoT prompting produces incoherent reasoning chains and <em>degrades</em> performance relative to standard prompting. Do not assume CoT will help with smaller models; it will likely hurt.
        </Callout>

        <P>
          This creates a distinctive signature in scaling curves. On reasoning-intensive tasks like GSM8K, <strong>standard prompting</strong> exhibits essentially <em>flat scaling curves</em>: increasing model size from 10B to 500B parameters yields negligible accuracy improvements. The task difficulty exceeds what any single forward pass can resolve, regardless of model capacity. <strong>CoT prompting</strong>, by contrast, enables <em>upward-sloping scaling curves</em> once the emergence threshold is crossed. Each increment in model size translates to meaningful accuracy gains, because the larger model produces higher-quality intermediate reasoning.
        </P>

        <Callout type="accent">
          Chain-of-thought prompting is one of the strongest documented examples of emergence in LLMs. It reveals that scale unlocks not just more knowledge, but qualitatively new reasoning <em>strategies</em> that smaller models cannot execute.
        </Callout>
      </Section>

      {/* 5. Limitations and Faithfulness */}
      <Section title="5. Limitations and Faithfulness">
        <P>
          Despite its empirical success, chain-of-thought prompting carries important limitations that temper its theoretical significance and constrain its practical reliability.
        </P>

        <P>
          <strong>Faithfulness of reasoning chains.</strong> The most fundamental concern is whether the generated chain of thought actually reflects the model's internal computation. The chain is produced autoregressively, one token at a time, and there is no guarantee that the natural-language "reasoning" corresponds to the latent representations driving the model's predictions. The chain may function as a <strong>post-hoc rationalization</strong>: a plausible sounding narrative that the model generates <em>after</em> (or alongside) arriving at an answer through entirely different internal mechanisms. This distinction between <em>expressed reasoning</em> and <em>actual reasoning</em> remains an open problem in interpretability research.
        </P>

        <P>
          <strong>Error compounding.</strong> Because each step in the chain conditions on all previous steps, an error early in the reasoning process can cascade through subsequent steps. A single incorrect arithmetic operation, a misidentified entity, or a flawed logical inference can corrupt the entire downstream chain. This is especially problematic for long chains involving many intermediate steps, where the probability of at least one error grows with chain length.
        </P>

        <P>
          <strong>Prompt sensitivity.</strong> The quality of CoT reasoning is sensitive to the specific exemplars chosen. Different exemplar sets, even ones that are individually correct and well-written, can produce substantially different accuracy on the same benchmark. Wei et al. (2022) used hand-crafted exemplars, and the optimal exemplar design remains more art than science. The choice of exemplar ordering, the complexity of the reasoning demonstrated, and even superficial formatting decisions can all influence performance.
        </P>

        <ul>
          <li><strong>Scale dependence:</strong> CoT is only effective in models with ~100B+ parameters, limiting its accessibility.</li>
          <li><strong>Verification gap:</strong> There is no built-in mechanism to verify intermediate steps; the model cannot self-correct mid-chain.</li>
          <li><strong>Task specificity:</strong> CoT provides the largest gains on tasks requiring sequential reasoning; on tasks solvable by pattern matching or retrieval, the overhead of generating a chain provides little benefit.</li>
          <li><strong>Computational cost:</strong> Generating intermediate reasoning tokens increases inference latency and cost proportionally to the length of the chain.</li>
        </ul>

        <Callout type="info">
          Subsequent techniques, including self-consistency (Wang et al., 2023), verification-guided search, and process reward models, address some of these limitations by adding external validation layers on top of the chain-of-thought paradigm.
        </Callout>
      </Section>

      {/* 6. References & Further Reading */}
      <Section title="6. References &amp; Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
            </a>. Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q., &amp; Zhou, D., NeurIPS 2022. The foundational paper introducing chain-of-thought prompting and demonstrating its effectiveness across arithmetic, commonsense, and symbolic reasoning benchmarks.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2110.14168" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Training Verifiers to Solve Math Word Problems
            </a>. Cobbe, K., Kosaraju, V., Bavarian, M., et al., 2021. Introduced the GSM8K benchmark and a fine-tuned GPT-3 + verifier approach that CoT prompting subsequently surpassed without any fine-tuning.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2203.11171" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Self-Consistency Improves Chain of Thought Reasoning in Language Models
            </a>. Wang, X., Wei, J., Schuurmans, D., et al., ICLR 2023. Proposed self-consistency decoding, sampling multiple reasoning paths and taking a majority vote, boosting PaLM 540B + CoT on GSM8K from 58% to 74%.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2206.07682" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Emergent Abilities of Large Language Models
            </a>. Wei, J., Tay, Y., Bommasani, R., et al., TMLR 2022. A comprehensive survey of emergent abilities in LLMs, providing the theoretical framework for understanding why CoT reasoning appears only at sufficient scale.
          </li>
        </ul>
      </Section>
    </div>
  );
}
