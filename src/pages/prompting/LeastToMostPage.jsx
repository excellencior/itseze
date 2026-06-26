import { useState, useRef } from 'react';
import Latex from '../../components/Latex';
import Highlight from '../../components/Highlight';
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



/* ────────────────────────────────────────────────────────
   DecompositionTreeWidget — interactive step-through of
   Least-to-Most decomposition and sequential solving
   ──────────────────────────────────────────────────────── */
export function DecompositionTreeWidget() {
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const reset = () => setStep(0);

  const problem = 'jump around left twice after walk around left thrice';
  const sub1 = { label: 'Sub-problem 1', desc: 'walk around left thrice' };
  const sub2 = { label: 'Sub-problem 2', desc: 'jump around left twice' };
  const sol1 = 'TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK';
  const sol2 = 'TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP';

  const cardStyle = (active, solved, isFinal) => ({
    border: active ? '2px solid var(--accent)' : solved ? '2px solid #10B981' : '1.5px solid var(--border)',
    borderRadius: '8px',
    padding: '14px 16px',
    background: isFinal ? '#0891B210' : solved ? 'var(--surface-green)' : 'var(--node-bg)',
    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
    boxShadow: active ? '0 0 12px rgba(8,145,178,0.2)' : 'var(--shadow-sm)',
    position: 'relative',
  });

  const connectorLine = (visible) => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '4px 0',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        width: '2px',
        height: '28px',
        background: 'var(--border)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          lineHeight: 1,
        }}>▼</div>
      </div>
    </div>
  );

  const badge = (text, color) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      padding: '2px 8px',
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderRadius: '3px',
      background: color === 'accent' ? 'var(--accent)' : color === 'green' ? '#10B981' : '#6B7280',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
    }}>{text}</span>
  );

  const solutionBlock = (text) => (
    <div style={{
      background: '#1e1e24',
      color: '#e5c07b',
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: '10.5px',
      lineHeight: 1.5,
      borderRadius: '4px',
      marginTop: '8px',
      wordBreak: 'break-all',
      maxHeight: '60px',
      overflow: 'hidden',
    }}>{text}</div>
  );

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '2px' }}>Interactive</div>
        <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Decomposition Tree</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Step through how Least-to-Most decomposes a complex SCAN command into subproblems and solves them sequentially.</div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{
            width: '100%',
            height: '3px',
            borderRadius: '2px',
            background: i < step ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s ease',
          }} />
        ))}
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          {step}/{totalSteps}
        </span>
      </div>

      {/* ─── ORIGINAL PROBLEM ─── */}
      <div style={cardStyle(step === 0, step > 0, false)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          {badge('Original Problem', step === 0 ? 'accent' : step > 0 ? 'green' : 'gray')}
          {step > 0 && <span style={{ fontSize: '13px' }}>✓</span>}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.5,
        }}>"{problem}"</div>
      </div>

      {/* Connector: decompose */}
      {step >= 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '6px 0',
          animation: step === 1 ? 'fadeSlideIn 0.4s ease' : undefined,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 12px',
            background: 'var(--accent-20)',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
          }}>
            ↓ Decompose
          </div>
        </div>
      )}

      {/* ─── SUBPROBLEMS ROW ─── */}
      {step >= 1 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '12px',
          alignItems: 'start',
          animation: step === 1 ? 'fadeSlideIn 0.4s ease' : undefined,
        }}>
          {/* Sub-problem 1 */}
          <div style={cardStyle(step === 2, step > 2, false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              {badge(sub1.label, step === 2 ? 'accent' : step > 2 ? 'green' : 'gray')}
              {step > 2 && <span style={{ fontSize: '13px' }}>✓</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text)', lineHeight: 1.4 }}>
              "{sub1.desc}"
            </div>
            {step >= 2 && step !== 1 && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Simplest sub — solve first</div>
            )}
            {step > 2 && solutionBlock(sol1)}
          </div>

          {/* Arrow between */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: '30px',
            fontSize: '16px',
            color: step >= 3 ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.3s',
            fontFamily: 'var(--font-mono)',
          }}>→</div>

          {/* Sub-problem 2 */}
          <div style={cardStyle(step === 3, step > 3, false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              {badge(sub2.label, step === 3 ? 'accent' : step > 3 ? 'green' : 'gray')}
              {step > 3 && <span style={{ fontSize: '13px' }}>✓</span>}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text)', lineHeight: 1.4 }}>
              "{sub2.desc}"
            </div>
            {step >= 3 && (
              <div style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 600,
                background: 'var(--surface-blue)',
                color: '#1D4ED8',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
              }}>↰ Uses solution from Sub-1</div>
            )}
            {step > 3 && solutionBlock(sol2)}
          </div>
        </div>
      )}

      {/* ─── FINAL ANSWER ─── */}
      {step >= 4 && (
        <>
          {connectorLine(true)}
          <div style={{
            ...cardStyle(false, false, true),
            border: '2px solid var(--accent)',
            animation: 'fadeSlideIn 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {badge('Final Answer', 'accent')}
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Combined output</span>
            </div>
            <div style={{
              background: '#1e1e24',
              color: '#e5c07b',
              padding: '10px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: 1.6,
              borderRadius: '4px',
              wordBreak: 'break-all',
            }}>
              <span style={{ color: '#98C379' }}>{/* sol1 */}TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK … </span>
              <span style={{ color: '#61AFEF' }}>{/* sol2 */}TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP …</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <span style={{ color: '#98C379', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>■</span> walk around left thrice{' · '}
              <span style={{ color: '#61AFEF', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>■</span> jump around left twice
            </div>
          </div>
        </>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
        <button
          onClick={next}
          disabled={step >= totalSteps}
          style={{
            padding: '6px 20px',
            fontSize: '12px',
            fontWeight: 700,
            border: '1.5px solid var(--accent)',
            borderRadius: '4px',
            background: step >= totalSteps ? 'transparent' : 'var(--accent)',
            color: step >= totalSteps ? 'var(--text-muted)' : '#fff',
            cursor: step >= totalSteps ? 'default' : 'pointer',
            fontFamily: 'var(--font-main)',
            transition: 'all 0.15s',
            opacity: step >= totalSteps ? 0.4 : 1,
          }}
        >
          {step === 0 ? '▶ Start' : step >= totalSteps ? 'Done' : `Next — Step ${step + 1}`}
        </button>
        {step > 0 && (
          <button
            onClick={reset}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid var(--border)',
              borderRadius: '4px',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            ↺ Reset
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {step === 0 && 'Click Start to begin decomposition'}
          {step === 1 && 'Problem decomposed into subproblems'}
          {step === 2 && 'Solving the simplest subproblem first'}
          {step === 3 && 'Solving with context from Sub-1'}
          {step === 4 && 'All subproblem solutions combined'}
        </span>
      </div>

      {/* Step descriptions */}
      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        background: 'var(--accent-20)',
        borderRadius: '6px',
        fontSize: '12px',
        lineHeight: 1.6,
        color: 'var(--text)',
      }}>
        {step === 0 && '⓪ The original complex problem is presented. It requires composing two operations — something standard CoT struggles with when the test problem is harder than the exemplars.'}
        {step === 1 && '① Decompose: The model identifies two simpler subproblems, ordered from least to most complex. "walk around left thrice" is simpler because it has no dependency.'}
        {step === 2 && '② Solve Sub-1: The simplest subproblem is solved first. "walk around left" means TURN LEFT WALK repeated 4 times (a full circle), and "thrice" means 3 repetitions of that.'}
        {step === 3 && '③ Solve Sub-2: Now the harder subproblem is solved. Crucially, the solution to Sub-1 is appended to the context — the model can reference it. This is the key innovation of Least-to-Most.'}
        {step === 4 && '④ Combine: The final answer concatenates the solutions in order. The "after" operator means Sub-1\'s output comes first, then Sub-2\'s. Each subproblem was individually no harder than the exemplars.'}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function LeastToMostPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const btnRef = useRef(null);

  const handleToggle = () => {
    setPanelOpen(prev => {
      const next = !prev;
      if (next && btnRef.current) {
        setTimeout(() => {
          btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return next;
    });
  };

  const handleClose = () => {
    setPanelOpen(false);
    if (btnRef.current) {
      setTimeout(() => {
        btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          Least-to-Most Prompting
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          A two-stage prompting strategy that overcomes chain-of-thought's compositionality gap by first decomposing complex problems into simpler subproblems, then solving them sequentially, enabling generalization to problems harder than those in the prompt.
        </p>
      </div>

      {/* Section 1 */}
      <Section title="1. The Compositionality Gap">
        <P>
          <strong>Chain-of-thought (CoT) prompting</strong> represented a major advance in eliciting reasoning from large language models, yet it harbors a fundamental limitation: it fails to generalize from easy exemplars to harder test problems. If the few-shot demonstrations in a CoT prompt illustrate two-step reasoning chains, the model struggles, often catastrophically, when confronted with problems requiring five or more steps. This phenomenon is what Press et al. (2023) formally term the <strong>compositionality gap</strong>: the fraction of compositional problems a model answers incorrectly despite correctly answering all constituent sub-questions.
        </P>
        <P>
          The root cause is structural. In standard CoT, the model must produce the entire reasoning chain in a single forward pass, with no mechanism for breaking the problem into manageable pieces. The exemplars implicitly define a difficulty ceiling: the model learns to mimic the <em>depth</em> of reasoning shown in the prompt, not to exceed it. Zhou et al. (2023) identify this as the <strong>easy-to-hard generalization failure</strong> and demonstrate that it is not merely a marginal degradation but a near-total collapse in performance on benchmarks designed to test compositional generalization.
        </P>
        <Callout type="key">
          The compositionality gap is not about model capacity. It is about prompting architecture. The same model that fails with CoT can succeed with a decomposition-based approach, because the bottleneck is how reasoning is <em>structured</em>, not whether the model <em>possesses</em> the requisite knowledge.
        </Callout>
        <P>
          This insight motivates <strong>Least-to-Most Prompting (LTM)</strong>, introduced by Zhou et al. (2023) at ICLR 2023. Rather than asking the model to reason through a complex problem in one shot, LTM explicitly separates the act of <em>decomposing</em> a problem from the act of <em>solving</em> its parts. The result is a prompting strategy that enables large language models to solve problems substantially harder than anything shown in the few-shot exemplars, a capability that standard CoT fundamentally lacks.
        </P>
      </Section>

      {/* Section 2 */}
      <Section title="2. The Two-Stage Framework">
        <P>
          Least-to-Most Prompting operates in two distinct stages, each with its own prompt template and its own call to the language model. This separation is the core architectural innovation: by decoupling problem decomposition from problem solving, LTM ensures that the model can focus on one cognitive task at a time, and that the solutions to earlier subproblems are available as context when tackling later, harder ones.
        </P>

        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', marginTop: '24px' }}>Stage 1: Decomposition</h3>
        <P>
          In the <strong>decomposition stage</strong>, the model is prompted with a small number of exemplars showing how a complex problem can be broken down into a sequence of simpler subproblems. The prompt ends with the new (unseen) problem and asks the model to produce a similar decomposition{' '}
          <button
            ref={btnRef}
            onClick={handleToggle}
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
          </button>. Crucially, the exemplars demonstrate the <em>principle</em> of decomposition. They need not cover every possible problem type, because the model generalizes the decomposition strategy itself.
        </P>
        <InlinePanel open={panelOpen} onClose={handleClose} maxHeight="900px">
          <DecompositionTreeWidget />
        </InlinePanel>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            decomposition prompt
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Q: "walk opposite left thrice after run left twice"
To solve "walk opposite left thrice after run left twice",
I need to first solve: "run left twice", then solve:
"walk opposite left thrice".

Q: "look around right thrice and walk opposite left"
To solve "look around right thrice and walk opposite left",
I need to first solve: "look around right thrice", then solve:
"walk opposite left".

Q: "jump around left twice after walk around left thrice"
To solve this, I need to first solve:`}</pre>
        </div>

        <P>
          <Highlight>The model produces a list of subproblems ordered from simplest to most complex, hence the name <em>least-to-most</em>.</Highlight> This ordering is essential: it ensures that each subsequent subproblem can build on the solutions to all preceding ones.
        </P>

        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '10px', marginTop: '24px' }}>Stage 2: Sequential Solving</h3>
        <P>
          In the <strong>subproblem solving stage</strong>, the decomposed subproblems are solved one at a time, in order from simplest to most complex. The key mechanism is <em>context accumulation</em>. After each subproblem is solved, its question-answer pair is appended to the prompt context for the next subproblem. This means that when the model tackles the hardest subproblem (typically the original question itself), it has access to the solutions of all prerequisite subproblems as part of its input.
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            sequential solving prompt
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`[Few-shot exemplars for solving atomic subproblems]

Q: "walk around left thrice"
A: "TURN LEFT WALK" repeated 3 times →
   TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK ...

(Previous solution appended to context)

Q: "jump around left twice after walk around left thrice"
The output of "walk around left thrice" is
TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK ...
The output of "jump around left twice" is
TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP ...
So the output of "jump around left twice after
walk around left thrice" is
TURN LEFT WALK ... TURN LEFT JUMP ...`}</pre>
        </div>

        <Callout type="accent">
          The critical innovation: solving each subproblem is <em>facilitated</em> by the answers to previously solved subproblems. This is what enables easy-to-hard generalization. The model never needs to solve a problem more complex than the exemplars in a single step, because the hard problem has been reduced to a series of easy ones.
        </Callout>
      </Section>

      {/* Section 3 */}
      <Section title="3. The SCAN Breakthrough">
        <P>
          The most striking demonstration of Least-to-Most Prompting comes from the <strong>SCAN benchmark</strong>, a compositional generalization dataset introduced by Lake &amp; Baroni (2018). SCAN maps natural language commands (e.g., "jump around left twice after walk opposite right thrice") to action sequences (e.g., sequences of TURN, WALK, JUMP tokens). The benchmark is specifically designed to test whether models can compose familiar primitives into novel combinations, a capability often called <strong>systematic compositionality</strong>.
        </P>
        <P>
          SCAN's most challenging evaluation is the <strong>length split</strong>, where the training set contains only short action sequences and the test set contains long ones. This split is deliberately designed to test easy-to-hard generalization, making it a natural proving ground for Least-to-Most Prompting.
        </P>
        <P>
          The results are remarkable. Using <strong>code-davinci-002</strong> with only <strong>14 exemplars</strong>, Zhou et al. (2023) report the following:
        </P>
        <ul style={{ fontSize: '15px', lineHeight: 2, paddingLeft: '20px' }}>
          <li><strong>Least-to-Most Prompting:</strong> <Latex math="\geq" /> 99% accuracy on <em>all</em> SCAN splits, including the notoriously difficult length split</li>
          <li><strong>Standard Chain-of-Thought:</strong> approximately 16% accuracy on the length split</li>
          <li><strong>Neural-symbolic models</strong> trained on the full training set of 15,000+ examples were required to match the performance that LTM achieved with 14 exemplars</li>
        </ul>
        <Callout type="key">
          With only 14 exemplars and no gradient updates, Least-to-Most Prompting matched the performance of specialized neural-symbolic architectures trained on over 15,000 examples. This is arguably the clearest empirical evidence that decomposition-based prompting can unlock compositional generalization in large language models.
        </Callout>
        <P>
          The gap between LTM and CoT on SCAN, from 99% to approximately 16%, is not a marginal improvement. It represents a qualitative shift in capability. Standard CoT cannot bridge the compositionality gap because its reasoning is monolithic: the model must produce the entire output sequence in one chain. LTM, by contrast, reduces the problem to a sequence of subproblems, each of which is no harder than the exemplars. The <em>composition</em> of solutions is handled by the context accumulation mechanism, not by the model's ability to reason across long chains.
        </P>
      </Section>

      {/* Section 4 */}
      <Section title="4. Results on DROP and Math Reasoning">
        <P>
          Beyond SCAN, Zhou et al. (2023) evaluate Least-to-Most Prompting on the <strong>DROP benchmark</strong> (Discrete Reasoning Over Paragraphs), a reading comprehension dataset that requires numerical reasoning over text passages. DROP problems often involve multiple steps (counting entities, computing differences, or aggregating values) but many of these steps are individually straightforward. The challenge lies in their <em>composition</em>.
        </P>
        <P>
          On DROP, Least-to-Most Prompting <strong>significantly outperforms</strong> standard chain-of-thought. The improvement is particularly pronounced on questions where the required reasoning involves multiple subproblems that interact. For instance, finding two separate counts in a passage and then computing their difference. In these cases, CoT often conflates the subproblems or loses track of intermediate results, whereas LTM's explicit decomposition ensures that each quantity is computed in isolation before being combined.
        </P>
        <Callout type="info">
          Many DROP problems involve what the authors describe as "trivially decomposed" subproblems: subproblems that are individually easy but collectively confusing when addressed in a single reasoning chain. LTM excels precisely in this regime, because the decomposition step separates concerns that CoT conflates.
        </Callout>
        <P>
          The authors also evaluate on <strong>symbolic manipulation</strong> tasks and <strong>math word problems</strong> requiring compositional reasoning. Across these domains, the pattern is consistent: whenever the test problems are compositionally harder than the exemplars, LTM maintains strong performance while CoT degrades. The advantage is smallest when the test problems are of comparable difficulty to the exemplars. In such cases, CoT's single-chain approach is sufficient, and the overhead of decomposition provides little benefit.
        </P>
        <Callout type="warning">
          Least-to-Most Prompting is not universally superior to CoT. When problems are not compositional in nature, or when test difficulty does not exceed exemplar difficulty, the two-stage overhead of LTM may be unnecessary. The method's strength is specifically in easy-to-hard generalization across compositional problem structures.
        </Callout>
      </Section>

      {/* Section 5 */}
      <Section title="5. Comparison with Chain-of-Thought">
        <P>
          To understand when and why to choose Least-to-Most Prompting over Chain-of-Thought, it is useful to compare them along several dimensions. The two methods share the goal of eliciting multi-step reasoning from large language models, but they differ fundamentally in <em>how</em> that reasoning is structured.
        </P>
        <ul style={{ fontSize: '15px', lineHeight: 2.2, paddingLeft: '20px' }}>
          <li><strong>Reasoning structure:</strong> CoT produces a single, linear reasoning chain. LTM explicitly decomposes the problem into subproblems and solves them sequentially, with context accumulation between steps.</li>
          <li><strong>Compositional generalization:</strong> CoT fails when test problems are harder than the exemplars. LTM is specifically designed to handle this regime, where each subproblem is reduced to exemplar-level difficulty.</li>
          <li><strong>Prompt templates:</strong> CoT requires a single prompt template containing exemplars with reasoning chains. LTM requires <em>two</em> prompt templates, one for decomposition and one for solving, which increases design complexity.</li>
          <li><strong>API calls:</strong> CoT uses one LLM call per problem. LTM uses at minimum two calls (one for decomposition, one or more for solving), and potentially <Latex math="k+1" /> calls for a problem that decomposes into <Latex math="k" /> subproblems.</li>
          <li><strong>Context utilization:</strong> CoT does not reuse intermediate results across separate reasoning steps. LTM explicitly appends prior solutions to the context, enabling later subproblems to build on earlier answers.</li>
          <li><strong>Failure modes:</strong> CoT fails by producing incorrect or incomplete reasoning chains. LTM can fail at the decomposition stage (producing incorrect or incomplete subproblem lists) or at the solving stage (propagating errors from earlier subproblems).</li>
        </ul>
        <Callout type="accent">
          The choice between CoT and LTM reduces to a question of problem structure. For problems where the reasoning depth at test time is comparable to the exemplars, CoT is simpler and equally effective. For problems requiring compositional generalization, where the model must solve harder problems than it has seen, LTM is the principled choice.
        </Callout>
        <P>
          It is worth noting that LTM's two-stage design also offers a practical advantage: the decomposition and solving prompts can be designed and debugged independently. If the model produces correct decompositions but incorrect solutions (or vice versa), the practitioner can isolate and fix the problematic stage without redesigning the entire prompt.
        </P>
      </Section>

      {/* Section 6 */}
      <Section title="6. References &amp; Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2205.10625" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Least-to-Most Prompting Enables Complex Reasoning in Large Language Models
            </a> by Zhou, D., Schärli, N., Hou, L., Wei, J., Scales, N., Wang, X., Schuurmans, D., Cui, C., Bousquet, O., Le, Q., &amp; Chi, E., ICLR 2023. The foundational paper introducing the two-stage decomposition-then-solving framework with breakthrough results on SCAN, DROP, and compositional generalization benchmarks.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
            </a> by Wei, J., Wang, X., Schuurmans, D., et al., NeurIPS 2022. The seminal CoT paper that established few-shot reasoning chains as a prompting paradigm, and whose limitations on compositional generalization motivated Least-to-Most Prompting.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1711.00350" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Generalization without Systematicity: On the Compositional Skills of Sequence-to-Sequence Recurrent Networks
            </a> by Lake, B.M. &amp; Baroni, M., ICML 2018. Introduces the SCAN benchmark for compositional generalization, which became the flagship evaluation for Least-to-Most Prompting's easy-to-hard generalization capabilities.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2210.03350" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Measuring and Narrowing the Compositionality Gap in Language Models
            </a> by Press, O., Zhang, M., Min, S., et al., EMNLP Findings 2023. Formalizes the compositionality gap metric and demonstrates that decomposition-based prompting strategies systematically narrow this gap across model scales.
          </li>
        </ul>
      </Section>
    </div>
  );
}
