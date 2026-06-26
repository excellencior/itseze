import { useState, useRef, useEffect, useCallback } from 'react';
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



/* ─── Example problems for the pipeline widget ─── */
const PROBLEMS = [
  {
    label: 'Cars in the parking lot (3 + 2)',
    question: 'If there are 3 cars in the parking lot and 2 more cars arrive, how many cars are in the parking lot?',
    reasoning: 'There are originally 3 cars. Then 2 more cars arrive. 3 + 2 = 5.',
    answer: '5',
  },
  {
    label: 'Blue golf balls (16 → 8 → 4)',
    question: 'A juggler can juggle 16 balls. Half of the balls are golf balls, and half of the golf balls are blue. How many blue golf balls are there?',
    reasoning: 'The juggler can juggle 16 balls. Half of the balls are golf balls, so there are 16 / 2 = 8 golf balls. Half of the golf balls are blue, so there are 8 / 2 = 4 blue golf balls.',
    answer: '4',
  },
];

/* ─── TwoStagePipelineWidget ─── */
export function TwoStagePipelineWidget() {
  const [problemIdx, setProblemIdx] = useState(0);
  const [stage, setStage] = useState(0);       // 0=idle, 1=running-s1, 2=s1-done, 3=running-s2, 4=s2-done
  const [typedReasoning, setTypedReasoning] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const timerRef = useRef(null);

  const prob = PROBLEMS[problemIdx];

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // typing effect for stage 1
  useEffect(() => {
    if (stage !== 1) return;
    let i = 0;
    setTypedReasoning('');
    timerRef.current = setInterval(() => {
      i++;
      setTypedReasoning(prob.reasoning.slice(0, i));
      if (i >= prob.reasoning.length) {
        clearTimer();
        setStage(2);
      }
    }, 22);
    return clearTimer;
  }, [stage, prob.reasoning, clearTimer]);

  // typing effect for stage 2
  useEffect(() => {
    if (stage !== 3) return;
    let i = 0;
    setTypedAnswer('');
    timerRef.current = setInterval(() => {
      i++;
      setTypedAnswer(prob.answer.slice(0, i));
      if (i >= prob.answer.length) {
        clearTimer();
        setStage(4);
      }
    }, 80);
    return clearTimer;
  }, [stage, prob.answer, clearTimer]);

  const reset = () => { clearTimer(); setStage(0); setTypedReasoning(''); setTypedAnswer(''); };

  const changeProblem = (e) => { reset(); setProblemIdx(Number(e.target.value)); };

  const stageCardStyle = (num) => {
    const active = (num === 1 && (stage === 1)) || (num === 2 && (stage === 3));
    const done = (num === 1 && stage >= 2) || (num === 2 && stage >= 4);
    return {
      flex: 1,
      minWidth: '200px',
      border: active ? '2px solid var(--accent)' : '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px 18px',
      background: done ? 'var(--accent-20)' : 'transparent',
      position: 'relative',
      transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
      boxShadow: active ? '0 0 18px rgba(8,145,178,0.25)' : 'var(--shadow-sm)',
      animation: active ? 'cot-pulse 1.8s ease-in-out infinite' : 'none',
    };
  };

  const badgeStyle = (num) => {
    const active = (num === 1 && stage >= 1) || (num === 2 && stage >= 3);
    return {
      width: '28px', height: '28px', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '13px', fontWeight: 800,
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? '#fff' : 'var(--text-muted)',
      border: active ? 'none' : '2px solid var(--border)',
      transition: 'all 0.3s',
    };
  };

  const codeBlockStyle = {
    background: '#1e1e24', color: '#e5c07b', padding: '14px 16px',
    fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.65,
    border: '1px solid #333', borderRadius: '4px', marginTop: '12px',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  };

  const btnBase = {
    padding: '7px 18px', fontSize: '12px', fontWeight: 700,
    border: '1px solid var(--accent)', borderRadius: '4px',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
  };

  return (
    <div>
      {/* Pulse keyframes */}
      <style>{`
        @keyframes cot-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(8,145,178,0.15); }
          50%      { box-shadow: 0 0 22px rgba(8,145,178,0.35); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '4px' }}>INTERACTIVE DEMO</div>
        <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Two-Stage Pipeline</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Walk through Zero-Shot-CoT's reasoning extraction and answer extraction stages step by step.</div>
      </div>

      {/* Problem selector */}
      <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Problem:</label>
        <select
          value={problemIdx}
          onChange={changeProblem}
          style={{
            padding: '5px 10px', fontSize: '12.5px', fontFamily: 'inherit',
            border: '1px solid var(--border)', borderRadius: '4px',
            background: 'transparent', color: 'inherit', cursor: 'pointer',
          }}
        >
          {PROBLEMS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
        </select>
      </div>

      {/* Question display */}
      <div style={{ ...codeBlockStyle, marginTop: 0, marginBottom: '20px', color: '#abb2bf' }}>
        <span style={{ color: '#c678dd', fontWeight: 700 }}>Q: </span>{prob.question}
      </div>

      {/* Pipeline cards */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', flexWrap: 'wrap', marginBottom: '16px' }}>
        {/* Stage 1 card */}
        <div style={stageCardStyle(1)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={badgeStyle(1)}>1</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>Reasoning Extraction</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Append trigger → generate chain</div>
            </div>
          </div>
          {stage >= 1 && (
            <div style={codeBlockStyle}>
              <span style={{ color: '#abb2bf' }}>{prob.question}</span>{'\n\n'}
              <span style={{ color: '#98c379', fontWeight: 700 }}>A: Let's think step by step.</span>
              {stage >= 1 && typedReasoning && (
                <>
                  {'\n'}
                  <span style={{ color: '#d19a66' }}>{typedReasoning}</span>
                  {stage === 1 && <span style={{ animation: 'cot-pulse 0.8s infinite', color: 'var(--accent)' }}>▊</span>}
                </>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', color: stage >= 2 ? 'var(--accent)' : 'var(--border)', transition: 'color 0.3s', flexShrink: 0, padding: '0 2px' }}>──▶</div>

        {/* Stage 2 card */}
        <div style={stageCardStyle(2)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={badgeStyle(2)}>2</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800 }}>Answer Extraction</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Append template → extract answer</div>
            </div>
          </div>
          {stage >= 3 && (
            <div style={codeBlockStyle}>
              <span style={{ color: '#abb2bf' }}>{prob.question}</span>{'\n\n'}
              <span style={{ color: '#98c379', fontWeight: 700 }}>A: Let's think step by step.</span>{'\n'}
              <span style={{ color: '#d19a66' }}>{prob.reasoning}</span>{'\n\n'}
              <span style={{ color: '#c678dd', fontWeight: 700 }}>Therefore, the answer (arabic numerals) is </span>
              {typedAnswer && (
                <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '14px' }}>{typedAnswer}</span>
              )}
              {stage === 3 && <span style={{ animation: 'cot-pulse 0.8s infinite', color: 'var(--accent)' }}>▊</span>}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
        <button
          onClick={() => { if (stage === 0) setStage(1); }}
          disabled={stage !== 0}
          style={{
            ...btnBase,
            background: stage === 0 ? 'var(--accent)' : 'transparent',
            color: stage === 0 ? '#fff' : 'var(--text-muted)',
            opacity: stage === 0 ? 1 : 0.45,
            cursor: stage === 0 ? 'pointer' : 'default',
          }}
        >
          ▶ Run Stage 1
        </button>
        <button
          onClick={() => { if (stage === 2) setStage(3); }}
          disabled={stage !== 2}
          style={{
            ...btnBase,
            background: stage === 2 ? 'var(--accent)' : 'transparent',
            color: stage === 2 ? '#fff' : 'var(--text-muted)',
            opacity: stage === 2 ? 1 : 0.45,
            cursor: stage === 2 ? 'pointer' : 'default',
          }}
        >
          ▶ Run Stage 2
        </button>
        <button
          onClick={reset}
          style={{ ...btnBase, background: 'transparent', color: 'var(--accent)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-20)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          ↺ Reset
        </button>
      </div>

      {/* Completion message */}
      {stage === 4 && (
        <div style={{
          marginTop: '16px', padding: '10px 14px', borderRadius: '6px',
          background: 'var(--accent-20)', border: '1px solid var(--accent)',
          fontSize: '13px', fontWeight: 600, color: 'var(--accent)',
          transition: 'all 0.4s',
        }}>
          ✓ Pipeline complete — the model extracted answer <strong style={{ fontSize: '15px' }}>{prob.answer}</strong> from its own reasoning chain.
        </div>
      )}
    </div>
  );
}

export default function ZeroCOTPage() {
  const [pipelinePanelOpen, setPipelinePanelOpen] = useState(false);
  const pipelineBtnRef = useRef(null);

  const handlePipelineToggle = () => {
    setPipelinePanelOpen(prev => {
      const next = !prev;
      if (next && pipelineBtnRef.current) {
        setTimeout(() => {
          pipelineBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return next;
    });
  };

  const handlePipelineClose = () => {
    setPipelinePanelOpen(false);
    if (pipelineBtnRef.current) {
      setTimeout(() => {
        pipelineBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          Zero-Shot Chain-of-Thought
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          The remarkable discovery that simply appending "Let's think step by step" to a prompt, without any hand crafted demonstrations, can unlock latent multi-step reasoning capabilities across diverse benchmark tasks.
        </p>
      </div>

      {/* Section 1 */}
      <Section title="1. The Discovery">
        <P>
          In a result that surprised much of the NLP community, <strong>Kojima et al. (2022)</strong> demonstrated that a single, task-agnostic phrase, <em>"Let's think step by step"</em>, appended to a question prompt is sufficient to elicit structured, multi-step reasoning from large language models. Published at NeurIPS 2022 under the title <em>Large Language Models are Zero-Shot Reasoners</em>, this work revealed that the reasoning capabilities unlocked by <strong>chain-of-thought (CoT) prompting</strong> do not strictly require hand-crafted exemplars. Instead, a generic textual trigger can serve as a lightweight substitute, achieving dramatic improvements over standard zero-shot baselines.
        </P>
        <P>
          The significance of this finding is twofold. First, it eliminates the exemplar engineering burden imposed by <strong>few-shot CoT</strong>, the technique introduced by Wei et al. (2022), which requires manually constructing question answer pairs complete with step-by-step reasoning traces for each new task. Second, and more fundamentally, it suggests that large-scale pre-training implicitly equips models with latent reasoning procedures that can be <em>activated</em> by appropriate prompting rather than taught through in-context demonstrations.
        </P>
        <Callout type="key">
          Zero-Shot-CoT uses the <strong>same single prompt template</strong> across all tasks, including arithmetic, symbolic, and logical reasoning, with no task-specific engineering whatsoever.
        </Callout>
        <P>
          The method was evaluated across a diverse suite of benchmarks spanning arithmetic reasoning (MultiArith, GSM8K, AQUA-RAT, SVAMP), symbolic reasoning (Last Letter Concatenation, Coin Flip), and commonsense/logical reasoning (Date Understanding, Tracking Shuffled Objects). Across all of these, the same trigger phrase produced substantial gains, establishing Zero-Shot-CoT as a universal, low-cost reasoning elicitation strategy.
        </P>
      </Section>

      {/* Section 2 */}
      <Section title="2. The Two-Stage Process">
        <P>
          Unlike standard prompting, which expects the model to produce a final answer in a single forward pass, <strong>Zero-Shot-CoT</strong> employs a deliberate <strong>two-stage prompting pipeline</strong>. This decomposition separates the generation of reasoning from the extraction of a concise answer, mirroring how a human might first work through a problem on scratch paper and then circle the final result.{' '}
          <button
            ref={pipelineBtnRef}
            onClick={handlePipelineToggle}
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

        <InlinePanel open={pipelinePanelOpen} onClose={handlePipelineClose} maxHeight="900px">
          <TwoStagePipelineWidget />
        </InlinePanel>

        <P>
          <strong>Stage 1: Reasoning Extraction.</strong> The original question is concatenated with the trigger phrase <em>"Let's think step by step."</em> The model is then allowed to generate freely, producing an extended reasoning chain. No format constraints are imposed; the model simply continues from the trigger in whatever structure it finds natural.
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            stage 1 — reasoning extraction
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Q: If there are 3 cars in the parking lot and 2 more cars arrive,
how many cars are in the parking lot?

A: Let's think step by step.`}</pre>
        </div>

        <P>
          The model then generates a reasoning trace such as: <em>"There are originally 3 cars. Then 2 more cars arrive. 3 + 2 = 5."</em> This reasoning chain is captured in full, including any intermediate calculations or logical deductions.
        </P>

        <P>
          <strong>Stage 2: Answer Extraction.</strong> The entire output from Stage 1, including the original question, the trigger phrase, and the generated reasoning, is then concatenated with a second template: <em>"Therefore, the answer (arabic numerals) is"</em>. This instructs the model to distill its reasoning into a clean, parseable final answer.
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            stage 2 — answer extraction
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Q: If there are 3 cars in the parking lot and 2 more cars arrive,
how many cars are in the parking lot?

A: Let's think step by step. There are originally 3 cars.
Then 2 more cars arrive. 3 + 2 = 5.

Therefore, the answer (arabic numerals) is 5`}</pre>
        </div>

        <Callout type="info">
          The two-stage design is critical. Without the answer extraction step, the model's reasoning chain may meander or fail to converge on a clearly stated final answer, making automated evaluation unreliable.
        </Callout>
      </Section>

      {/* Section 3 */}
      <Section title="3. Empirical Results">
        <P>
          The empirical gains reported by Kojima et al. (2022) are striking in both magnitude and consistency. Using <strong>InstructGPT</strong> (<em>text-davinci-002</em>, 175B parameters), Zero-Shot-CoT produces transformative improvements over standard zero-shot prompting:
        </P>
        <ul style={{ fontSize: '15px', lineHeight: 2, paddingLeft: '20px' }}>
          <li><strong>MultiArith:</strong> accuracy improved from <Latex math="17.7\%" /> to <Latex math="78.7\%" />, a <Latex math="4.4\times" /> gain.</li>
          <li><strong>GSM8K:</strong> accuracy improved from <Latex math="10.4\%" /> to <Latex math="40.7\%" />, nearly a <Latex math="4\times" /> gain on a notably challenging benchmark of grade-school math word problems.</li>
        </ul>
        <P>
          These results are not artifacts of a single model family. Similar magnitudes of improvement were observed with <strong>PaLM 540B</strong>, confirming that Zero-Shot-CoT is a model-general phenomenon rather than an idiosyncrasy of the InstructGPT training pipeline.
        </P>
        <Callout type="key">
          The same single prompt template, "Let's think step by step", drives improvements across <em>arithmetic</em> (MultiArith, GSM8K, AQUA-RAT, SVAMP), <em>symbolic reasoning</em> (Last Letter Concatenation, Coin Flip), and <em>logical reasoning</em> (Date Understanding, Tracking Shuffled Objects) without any modification.
        </Callout>
        <P>
          The universality of these gains is perhaps the most notable aspect of the results. Traditional prompting approaches require task-specific tuning: different exemplars, different formatting, different answer templates. Zero-Shot-CoT discards all of this in favor of a single, fixed trigger. That such a minimal intervention can produce gains spanning arithmetic computation, symbolic manipulation, and commonsense reasoning suggests that the underlying reasoning capability is already present in the model and merely needs an appropriate activation signal.
        </P>
        <Callout type="warning">
          While the relative improvements are dramatic, the absolute accuracy on harder benchmarks like GSM8K (40.7%) remains far below human performance. Zero-Shot-CoT is most effective on simpler multi-step problems; it still struggles with problems requiring long chains of dependent reasoning.
        </Callout>
      </Section>

      {/* Section 4 */}
      <Section title="4. Why Does It Work?">
        <P>
          The effectiveness of a short trigger phrase in eliciting multi-step reasoning invites a natural question: <em>what mechanism underlies this behavior?</em> While a complete mechanistic account remains an open research problem, several converging lines of evidence provide a coherent explanatory framework.
        </P>
        <P>
          <strong>Activation of latent reasoning traces.</strong> Large language models are trained on internet-scale corpora that include textbooks, tutorials, worked examples, and forum discussions where humans explain their reasoning step by step. The phrase "Let's think step by step", or close paraphrases, appears naturally in such explanatory contexts. When the model encounters this phrase at inference time, it is statistically biased toward continuing in the register of step-by-step explanation rather than the register of terse answer production.
        </P>
        <P>
          <strong>Shifting from System 1 to System 2 processing.</strong> Drawing on Kahneman's (2011) dual-process framework, standard zero-shot prompting can be understood as eliciting <em>System 1</em>-like responses: fast, associative, and often wrong on multi-step problems. The "Let's think step by step" trigger effectively shifts the model into a <em>System 2</em>-like mode: slower, more deliberate, and decomposed into sequential substeps. Each generated token in the reasoning chain conditions the subsequent generation, creating an implicit scratch-pad that extends the model's effective working memory.
        </P>
        <Callout type="accent">
          The reasoning chain serves as an <strong>external working memory</strong>. By writing intermediate results into the generated text, the model sidesteps the capacity limitations of its fixed-width hidden state, enabling multi-step computations that would otherwise exceed its single-pass capabilities.
        </Callout>
        <P>
          <strong>Autoregressive decomposition.</strong> From a technical perspective, chain-of-thought generation decomposes a difficult joint prediction <Latex math="P(\text{answer} \mid \text{question})" /> into a product of simpler conditional predictions:
        </P>
        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="P(s_1 \mid q) \cdot P(s_2 \mid q, s_1) \cdots P(a \mid q, s_1, \ldots, s_n)" />
        </div>
        <P>
          Here each <Latex math="s_i" /> is an intermediate reasoning step. This factorization allows each prediction to be relatively straightforward even when the overall problem is complex.
        </P>
      </Section>

      {/* Section 5 */}
      <Section title="5. Template Engineering and Alternatives">
        <P>
          A natural question raised by Zero-Shot-CoT is whether the specific phrasing <em>"Let's think step by step"</em> is uniquely effective, or whether any instruction to reason carefully would suffice. Kojima et al. (2022) systematically tested a range of alternative trigger phrases, and the results reveal a notable sensitivity to exact wording.
        </P>
        <P>
          Among the alternatives tested were:
        </P>
        <ul style={{ fontSize: '15px', lineHeight: 2, paddingLeft: '20px' }}>
          <li><em>"Let's think about this logically"</em></li>
          <li><em>"Let's solve this problem by splitting it into steps"</em></li>
          <li><em>"Let's be realistic and think step by step"</em></li>
          <li><em>"Let's think like a detective step by step"</em></li>
          <li><em>"Before answering, let's think carefully"</em></li>
        </ul>
        <P>
          Of these, <strong>"Let's think step by step"</strong> consistently emerged as the top-performing trigger across benchmarks. Other phrases produced improvements over the zero-shot baseline but fell short of the gains achieved by the optimal trigger. The phrase <em>"Let's solve this problem by splitting it into steps"</em> performed reasonably well, likely because it similarly invokes a decomposition strategy, but it did not match the brevity and directness of the winning formulation.
        </P>
        <Callout type="warning">
          The sensitivity to exact phrasing underscores that Zero-Shot-CoT is not simply "telling the model to think harder." The trigger phrase must align with patterns in the pre-training distribution that are associated with structured, step-by-step reasoning discourse.
        </Callout>
        <P>
          This observation has practical implications for prompt engineering. While Zero-Shot-CoT eliminates the need for exemplar construction, it introduces a different, albeit much lighter, form of template optimization. In practice, however, the original "Let's think step by step" trigger remains the de facto standard and generalizes well enough that further template search is rarely necessary.
        </P>
      </Section>

      {/* Section 6 */}
      <Section title="6. Comparison with Few-Shot CoT">
        <P>
          The relationship between <strong>Zero-Shot-CoT</strong> and <strong>Few-Shot-CoT</strong> (Wei et al., 2022) is best understood as a tradeoff between simplicity and peak performance. Few-Shot-CoT typically achieves higher absolute accuracy on most benchmarks, but at the cost of substantial human effort in constructing task-specific exemplars with detailed reasoning chains.
        </P>
        <ul style={{ fontSize: '15px', lineHeight: 2, paddingLeft: '20px' }}>
          <li><strong>Exemplar cost:</strong> Few-Shot-CoT requires manually crafting 4 to 8 question-reasoning-answer demonstrations per task. Zero-Shot-CoT requires none.</li>
          <li><strong>Task generality:</strong> Few-Shot-CoT exemplars are task-specific and may not transfer across domains. Zero-Shot-CoT uses a single universal template.</li>
          <li><strong>Peak performance:</strong> Few-Shot-CoT generally outperforms Zero-Shot-CoT, particularly on complex benchmarks where the exemplars can demonstrate specific problem-solving strategies.</li>
          <li><strong>Robustness:</strong> Few-Shot-CoT can be sensitive to the choice and ordering of exemplars, whereas Zero-Shot-CoT avoids this variability entirely.</li>
        </ul>
        <Callout type="key">
          Zero-Shot-CoT is most valuable in three scenarios: (1) when the task domain is unfamiliar and exemplar construction would require domain expertise, (2) when rapid prototyping across many tasks is needed, and (3) when establishing a baseline before investing in exemplar engineering.
        </Callout>
        <P>
          The existence of Zero-Shot-CoT also has theoretical significance. It demonstrates that the reasoning improvements from Few-Shot-CoT are not purely a function of in-context learning from the provided exemplars. Rather, a substantial portion of the reasoning capability is intrinsic to the model and can be accessed through appropriate prompting alone. The exemplars in Few-Shot-CoT may serve less as "training data" and more as additional formatting guidance that further constrains the model's generation toward well-structured reasoning.
        </P>
        <Callout type="accent">
          Zero-Shot-CoT proves that chain-of-thought reasoning is not <em>learned</em> from in-context exemplars. It is <em>latent</em> in the model and merely needs to be <em>elicited</em>.
        </Callout>
      </Section>

      {/* References */}
      <Section title="References &amp; Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2205.11916" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Large Language Models are Zero-Shot Reasoners
            </a>. Kojima, T., Gu, S.S., Reid, M., Matsuo, Y., &amp; Iwasawa, Y., NeurIPS 2022. The foundational paper introducing Zero-Shot-CoT and the "Let's think step by step" trigger phrase.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
            </a>. Wei, J., Wang, X., Schuurmans, D., et al., NeurIPS 2022. The original few-shot chain-of-thought paper that inspired the zero-shot variant.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Language Models are Few-Shot Learners
            </a>. Brown, T.B., Mann, B., Ryder, N., et al., NeurIPS 2020. The GPT-3 paper establishing in-context learning as a paradigm and providing the foundation for prompting-based approaches.
          </li>
        </ul>
      </Section>
    </div>
  );
}
