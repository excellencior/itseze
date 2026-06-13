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

const PATHS = [
  { id: 1, chain: '16 \u2212 3 = 13, 13 \u2212 4 = 9, 9 \u00d7 2 = $18', answer: '$18', correct: true },
  { id: 2, chain: '16 \u2212 3 \u2212 4 = 9, 9 \u00d7 2 = $18', answer: '$18', correct: true },
  { id: 3, chain: '16 \u2212 7 = 9, 9 \u00d7 2 = $18', answer: '$18', correct: true },
  { id: 4, chain: '16 \u00d7 2 = 32, 32 \u2212 3 \u2212 4 = $25', answer: '$25', correct: false },
  { id: 5, chain: '16 \u2212 3 = 13, 13 \u2212 4 = 9, 9 \u00d7 2 = $18', answer: '$18', correct: true },
  { id: 6, chain: '16 eggs \u2212 breakfast(3) \u2212 muffins(4) = 9, revenue = 9 \u00d7 $2 = $18', answer: '$18', correct: true },
  { id: 7, chain: 'Total used: 3+4=7, remaining: 16\u22127=9, 9\u00d72= $18', answer: '$18', correct: true },
  { id: 8, chain: 'She eats 3, bakes 4, so 16\u22123=13, 13\u00d72= $26', answer: '$26', correct: false },
  { id: 9, chain: '16\u22123\u22124=9, 9\u00d72=$18', answer: '$18', correct: true },
  { id: 10, chain: 'Eggs: 16, used: 3+4=7, sold: 9, income: $18', answer: '$18', correct: true },
];

function SampleAndVoteWidget() {
  const [revealed, setRevealed] = useState([]);
  const [justAdded, setJustAdded] = useState(null);

  const handleSampleOne = () => {
    if (revealed.length >= PATHS.length) return;
    const next = PATHS[revealed.length];
    setJustAdded(next.id);
    setRevealed(prev => [...prev, next]);
    setTimeout(() => setJustAdded(null), 500);
  };

  const handleSampleAll = () => {
    setRevealed([...PATHS]);
    setJustAdded(null);
  };

  const handleReset = () => {
    setRevealed([]);
    setJustAdded(null);
  };

  const tally = {};
  revealed.forEach(p => { tally[p.answer] = (tally[p.answer] || 0) + 1; });
  const tallyEntries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const maxVotes = PATHS.length;
  const allDone = revealed.length === PATHS.length;
  const winner = tallyEntries.length > 0 ? tallyEntries[0][0] : null;

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '6px 14px', fontSize: '12px', fontWeight: 700,
    border: '1px solid var(--accent)', background: 'transparent',
    color: 'var(--accent)', cursor: 'pointer', borderRadius: '4px',
    fontFamily: 'var(--font-main)', transition: 'all 0.15s',
  };

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: '4px' }}>Interactive Demo</div>
        <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Sample &amp; Vote</div>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Click “Sample Path” to generate reasoning chains one at a time, then watch the majority vote converge.</div>
      </div>

      <div style={{ background: '#1e1e24', color: '#e5c07b', padding: '14px 18px', marginBottom: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.6, border: '1px solid #333', borderRadius: '4px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '6px', right: '10px', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>problem</div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Janet's ducks lay 16 eggs per day. She eats three for breakfast\nevery morning and bakes muffins for her friends with four every day.\nShe sells the remaining at the farmers' market for $2 each.\nHow much does she earn every day?`}</pre>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button onClick={handleSampleOne} disabled={allDone} style={{ ...btnBase, opacity: allDone ? 0.4 : 1, cursor: allDone ? 'default' : 'pointer' }} onMouseEnter={(e) => { if (!allDone) e.currentTarget.style.background = 'var(--accent-20)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
          ▶ Sample Path {revealed.length < PATHS.length ? `(${revealed.length + 1}/${PATHS.length})` : ''}
        </button>
        <button onClick={handleSampleAll} disabled={allDone} style={{ ...btnBase, opacity: allDone ? 0.4 : 1, cursor: allDone ? 'default' : 'pointer' }} onMouseEnter={(e) => { if (!allDone) e.currentTarget.style.background = 'var(--accent-20)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
          ⏩ Sample All
        </button>
        <button onClick={handleReset} style={{ ...btnBase, borderColor: 'var(--border)', color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-20)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
          ↺ Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px', marginBottom: '18px', minHeight: '60px' }}>
        {revealed.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', border: '1px dashed var(--border)', borderRadius: '4px' }}>
            Click “Sample Path” to begin generating reasoning chains…
          </div>
        )}
        {revealed.map(p => (
          <div key={p.id} style={{ padding: '10px 12px', background: justAdded === p.id ? 'var(--accent-20)' : 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderLeftWidth: '3px', borderLeftColor: p.correct ? '#10B981' : '#F59E0B', borderRadius: '4px', transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)', animation: justAdded === p.id ? 'scFadeIn 0.4s ease' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Path {p.id}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: p.correct ? '#10B981' : '#F59E0B' }}>{p.correct ? '✓' : '✗'}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.5, marginBottom: '6px' }}>{p.chain}</div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: p.correct ? '#10B981' : '#F59E0B' }}>→ {p.answer}</div>
          </div>
        ))}
      </div>

      {revealed.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '10px' }}>Vote Tally ({revealed.length} path{revealed.length !== 1 ? 's' : ''} sampled)</div>
          {tallyEntries.map(([answer, count]) => {
            const isWinner = allDone && answer === winner;
            const barWidth = `${(count / maxVotes) * 100}%`;
            return (
              <div key={answer} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, minWidth: '36px', textAlign: 'right', color: isWinner ? 'var(--accent)' : 'var(--text-muted)' }}>{answer}</span>
                <div style={{ flex: 1, height: '22px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', width: barWidth, background: isWinner ? 'var(--accent)' : 'rgba(255,255,255,0.1)', borderRadius: '3px', transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isWinner ? '#fff' : 'var(--text-muted)' }}>{count} vote{count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {allDone && (
        <div style={{ padding: '14px 18px', borderRadius: '6px', background: 'var(--accent-20)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', gap: '10px', animation: 'scFadeIn 0.5s ease' }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '2px' }}>Majority Vote Answer</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent)' }}>{winner} <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>({tally[winner]} of {PATHS.length} paths agree)</span></div>
          </div>
        </div>
      )}

      <style>{`@keyframes scFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

export default function SelfConsistencyPage() {
  const [scPanelOpen, setScPanelOpen] = useState(false);
  const scBtnRef = useRef(null);

  const handleScToggle = () => {
    setScPanelOpen(prev => {
      const next = !prev;
      if (next && scBtnRef.current) {
        setTimeout(() => {
          scBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return next;
    });
  };

  const handleScClose = () => {
    setScPanelOpen(false);
    if (scBtnRef.current) {
      setTimeout(() => {
        scBtnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          Self-Consistency
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          A decoding strategy that replaces greedy chain-of-thought generation with diverse sampling and majority voting, leveraging the intuition that correct reasoning paths converge on the same answer while incorrect paths scatter across many wrong answers.
        </p>
      </div>

      {/* 1. The Problem with Greedy Decoding */}
      <Section title="1. The Problem with Greedy Decoding">
        <P>
          Standard <strong>chain-of-thought (CoT) prompting</strong>, as introduced by Wei et al. (2022), dramatically improves
          the reasoning capabilities of large language models by eliciting intermediate reasoning steps before a final answer.
          However, conventional CoT relies on <strong>greedy decoding</strong>: the model generates a single reasoning chain
          by deterministically selecting the highest-probability token at every step. This one-shot, left-to-right generation
          process is inherently fragile. A single misstep in any intermediate reasoning step propagates forward and
          derails the entire conclusion.
        </P>
        <P>
          Consider a multi-step arithmetic problem. Under greedy decoding, the model produces exactly one chain of
          reasoning. If it miscalculates in step two of a five-step derivation, the remaining three steps build upon a
          faulty premise, and the final answer is almost certainly wrong. There is no mechanism for error correction,
          backtracking, or exploration of alternative reasoning strategies. The model is locked into a single trajectory
          through the space of possible derivations.
        </P>
        <Callout type="warning">
          Greedy decoding is a <em>mode-seeking</em> strategy: it finds the single most likely sequence, not the most likely
          <em>answer</em>. These are fundamentally different objectives. Many distinct reasoning chains can lead to the same
          correct answer, and the most probable individual chain is not always the one that reaches it.
        </Callout>
        <P>
          This limitation is not merely theoretical. On benchmarks such as GSM8K (grade-school math), greedy CoT
          decoding with strong models still leaves substantial room for improvement, not because the model lacks
          the knowledge to solve the problem, but because the decoding strategy fails to exploit the full distribution
          of valid reasoning paths the model has learned. Wang et al. (2023) recognized this gap and proposed a
          remarkably simple yet powerful remedy: <strong>self-consistency</strong>.
        </P>
      </Section>

      {/* 2. The Self-Consistency Principle */}
      <Section title="2. The Self-Consistency Principle">
        <P>
          <strong>Self-consistency</strong> (SC), introduced by Wang et al. (2023), replaces greedy decoding with a
          sample-and-marginalize procedure. Instead of generating a single chain of thought, the model samples
          multiple diverse reasoning paths using stochastic decoding (i.e., temperature <Latex math="T > 0" />), then
          aggregates the final answers via <strong>majority vote</strong>. The core insight is deceptively simple. If the
          model "knows" how to solve a problem, many different sampled reasoning chains should converge on the same
          correct answer.
        </P>
        <P>
          The formal procedure consists of three stages:
        </P>
        <ul>
          <li>
            <strong>Step 1: Prompt with CoT exemplars.</strong> Construct a prompt containing the same few-shot
            chain-of-thought demonstrations used in standard CoT prompting. The exemplars define the format:
            question → reasoning steps → answer.
          </li>
          <li>
            <strong>Step 2: Sample <Latex math="N" /> diverse completions.</strong> Rather than decoding greedily, sample <Latex math="N" /> independent
            completions from the language model using temperature sampling. Each completion produces its own
            reasoning chain and arrives at a (possibly different) final answer.
          </li>
          <li>
            <strong>Step 3: Majority vote.</strong> Extract the final answer from each of the <Latex math="N" /> sampled chains, then
            return the answer that appears most frequently. Ties can be broken arbitrarily.
          </li>
        </ul>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            self-consistency procedure
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`# Standard CoT (greedy):
prompt + question → [single chain] → answer

# Self-Consistency:
prompt + question → sample chain₁ → answer₁
prompt + question → sample chain₂ → answer₂
prompt + question → sample chain₃ → answer₃
  ...
prompt + question → sample chainₙ → answerₙ

final_answer = majority_vote(answer₁, answer₂, ..., answerₙ)`}</pre>
        </div>

        <Callout type="key">
          Self-consistency requires <em>no</em> additional training, fine-tuning, or human annotation. It is purely a
          decoding-time strategy, a drop-in replacement for greedy decoding that works with any model capable of
          chain-of-thought reasoning.
        </Callout>
        <P>
          Mathematically, self-consistency can be understood as an approximation to <strong>marginalization</strong> over
          reasoning paths. Let <Latex math="r" /> denote a reasoning path and <Latex math="a" /> a final answer. Greedy
          decoding selects the single most likely (chain, answer) pair:
        </P>
        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="\arg\max_{r,a} P(r, a \mid \text{prompt})" />
        </div>
        <P>
          Self-consistency instead approximates the answer with the highest total probability mass across <em>all</em> reasoning paths:
        </P>
        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="\arg\max_a \sum_r P(r, a \mid \text{prompt})" />
        </div>
        <P>
          This is a fundamentally more robust objective. Self-consistency operationalizes this by sampling diverse chains and letting the answers vote.{' '}
          <button
            ref={scBtnRef}
            onClick={handleScToggle}
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
        <InlinePanel open={scPanelOpen} onClose={handleScClose} maxHeight="1200px">
          <SampleAndVoteWidget />
        </InlinePanel>
      </Section>

      {/* 3. Why Diversity Helps */}
      <Section title="3. Why Diversity Helps">
        <P>
          The effectiveness of self-consistency rests on a powerful statistical regularity: <strong>correct reasoning paths
          converge, while incorrect ones scatter</strong>. When a language model samples multiple chains of thought for a
          reasoning problem it can solve, the correct chains, despite following different intermediate steps, different
          variable names, or different algebraic rearrangements, tend to arrive at the same numerical or categorical
          answer. Incorrect chains, by contrast, fail in idiosyncratic ways and produce a dispersed distribution over
          many different wrong answers.
        </P>
        <P>
          Consider a concrete example. Suppose we sample 40 reasoning paths for a grade-school math problem. If 32
          of them produce the answer <Latex math="42" />, while the remaining 8 produce answers like <Latex math="38" />, <Latex math="45" />, <Latex math="41" />, <Latex math="50" />, <Latex math="39" />, <Latex math="36" />, <Latex math="44" />,
          and <Latex math="47" />, then the majority vote overwhelmingly selects <Latex math="42" />, which is almost certainly
          correct. The errors are <em>uncorrelated</em>: each wrong chain fails for a different reason and arrives at a
          different wrong destination.
        </P>
        <Callout type="accent">
          This convergence-divergence asymmetry is the engine of self-consistency. It is analogous to the <em>wisdom
          of crowds</em> effect: independent estimators with uncorrelated errors average out to the truth, even when
          individual estimates are noisy.
        </Callout>
        <P>
          The analogy to <strong>ensemble methods</strong> in classical machine learning is instructive. In bagging (bootstrap
          aggregation), multiple models trained on different subsets of data produce diverse predictions; averaging
          them reduces variance without increasing bias. In self-consistency, the "diversity" comes not from different
          training sets but from <strong>temperature sampling</strong>. The stochasticity of the decoding process explores
          different regions of the model's learned distribution over reasoning chains. The variance reduction mechanism
          is the same: independent errors cancel under aggregation.
        </P>
        <P>
          Crucially, the diversity must be <em>genuine</em>. If all sampled chains were near-identical (as they would be
          with temperature close to zero), majority voting would offer no advantage over greedy decoding. Temperature
          sampling at <Latex math="T \approx 0.5\text{–}0.7" /> provides the sweet spot: enough randomness to explore
          diverse reasoning strategies, but not so much that the chains become incoherent.
        </P>
      </Section>

      {/* 4. Empirical Results */}
      <Section title="4. Empirical Results">
        <P>
          Wang et al. (2023) evaluated self-consistency across a wide range of reasoning benchmarks, consistently
          demonstrating substantial gains over greedy chain-of-thought decoding. The absolute improvements over
          standard CoT are striking:
        </P>
        <ul>
          <li><strong>GSM8K</strong> (grade-school math): <strong>+17.9%</strong> accuracy improvement</li>
          <li><strong>SVAMP</strong> (math word problems): <strong>+11.0%</strong></li>
          <li><strong>AQuA</strong> (algebraic word problems): <strong>+12.2%</strong></li>
          <li><strong>StrategyQA</strong> (multi-hop commonsense): <strong>+6.4%</strong></li>
          <li><strong>ARC-challenge</strong> (science reasoning): <strong>+3.9%</strong></li>
        </ul>
        <Callout type="key">
          The largest gains (+17.9% on GSM8K) appear on tasks requiring multi-step mathematical reasoning, precisely
          the setting where greedy decoding is most vulnerable to error propagation. Commonsense and science reasoning
          tasks, which often require fewer steps, still benefit but to a lesser degree.
        </Callout>
        <P>
          A critical feature of these results is their <strong>consistency across model architectures</strong>. Wang et al. (2023)
          tested self-consistency on four distinct model families (<strong>PaLM</strong>, <strong>LaMDA</strong>, <strong>GPT-3</strong>,
          and <strong>UL2</strong>) and found improvements across all of them. This rules out the possibility that
          self-consistency exploits architecture-specific idiosyncrasies; it is a genuinely model-agnostic decoding
          strategy.
        </P>
        <P>
          The gains are also notable for what they do <em>not</em> require. Unlike approaches based on learned verifiers
          (Cobbe et al., 2021) or step-aware verification (Li et al., 2023), self-consistency uses no auxiliary models,
          no reward signals, and no additional training data. The entire improvement comes from a change in how the
          model's existing knowledge is decoded, making it one of the most cost-effective interventions available for
          improving reasoning performance.
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            results summary
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Benchmark       | Greedy CoT | + Self-Consistency | Δ
────────────────┼────────────┼────────────────────┼────────
GSM8K           |    base    |       +17.9%       | ▲▲▲▲▲
SVAMP           |    base    |       +11.0%       | ▲▲▲▲
AQuA            |    base    |       +12.2%       | ▲▲▲▲
StrategyQA      |    base    |        +6.4%       | ▲▲▲
ARC-challenge   |    base    |        +3.9%       | ▲▲

Models tested: PaLM, LaMDA, GPT-3, UL2
Additional training required: None`}</pre>
        </div>
      </Section>

      {/* 5. Computational Tradeoffs */}
      <Section title="5. Computational Tradeoffs">
        <P>
          The primary cost of self-consistency is computational: it requires <Latex math="N" /> forward passes through the
          language model instead of one. If each greedy CoT inference costs <Latex math="C" /> compute units,
          self-consistency costs approximately <Latex math="N \times C" />. This linear scaling is straightforward but
          nontrivial. At <Latex math="N = 40" />, inference cost increases by a factor of 40.
        </P>
        <P>
          In practice, typical values of <Latex math="N" /> range from <strong>5 to 40</strong> sampled paths. The
          accuracy-cost tradeoff follows a characteristic curve of <strong>diminishing returns</strong>: the largest gains
          come from the first few samples (going from <Latex math="N = 1" /> to <Latex math="N = 5" /> is dramatic), while
          moving from <Latex math="N = 20" /> to <Latex math="N = 40" /> yields only marginal additional improvement.
          This is consistent with the statistical intuition: the variance of a majority vote estimator decreases
          as <Latex math="O(1/N)" />, so each additional sample contributes less.
        </P>
        <Callout type="info">
          For resource-constrained deployments, even <Latex math="N = 5" /> self-consistency samples can capture a
          substantial fraction of the maximum possible gain, making it a practical choice even when budgets are tight.
        </Callout>
        <P>
          Several strategies can mitigate the computational overhead:
        </P>
        <ul>
          <li>
            <strong>Batch parallelism.</strong> All <Latex math="N" /> samples are independent and can be generated in parallel
            on hardware with sufficient memory, converting latency cost into throughput cost.
          </li>
          <li>
            <strong>Adaptive sampling.</strong> One can implement early stopping: if the first <Latex math="k" /> samples already
            show overwhelming agreement, skip the remaining <Latex math="N - k" /> samples.
          </li>
          <li>
            <strong>Hybrid strategies.</strong> Use self-consistency selectively for difficult problems (identified by low
            model confidence under greedy decoding) and fall back to greedy decoding for easy ones.
          </li>
        </ul>
        <Callout type="warning">
          Compared to verifier-based approaches such as best-of-<Latex math="N" /> with a trained reward model (Cobbe et al.,
          2021), self-consistency has comparable inference cost but avoids the upfront expense of training a separate
          verifier. The tradeoff is that a well-trained verifier can outperform majority voting when verification is
          easier than generation, but training such a verifier requires labeled reasoning traces.
        </Callout>
      </Section>

      {/* 6. Connection to Ensemble Methods */}
      <Section title="6. Connection to Ensemble Methods">
        <P>
          Self-consistency can be formally situated within the broader framework of <strong>ensemble methods</strong> in
          statistical learning theory. Classical ensemble techniques, such as bagging, boosting, and random forests, achieve
          superior predictive performance by aggregating the outputs of multiple diverse base learners. The
          theoretical foundation, dating to Breiman (1996), is that aggregation reduces variance when the component
          predictions exhibit sufficient diversity.
        </P>
        <P>
          In standard ensembles, diversity comes from variation in <em>model parameters</em>: each base learner is trained
          on a different bootstrap sample (bagging), given different feature subsets (random forests), or sequentially
          corrected (boosting). In self-consistency, diversity comes from variation in <em>reasoning paths</em>:
          the stochasticity of temperature sampling explores different trajectories through the model's
          internal computation. The underlying model parameters are identical across all samples; only the
          decoded output varies.
        </P>
        <Callout type="key">
          Self-consistency is an ensemble over <em>reasoning paths</em>, not over <em>model parameters</em>. This is a
          crucial distinction: it means SC can be applied to any single model without the expense of training
          multiple models, while still achieving the variance-reduction benefits of ensembling.
        </Callout>
        <P>
          The connection to the <strong>bias-variance decomposition</strong> is illuminating. Greedy decoding can be
          viewed as a high-variance estimator. Small perturbations in the sampling process (even a single different
          token choice early in the chain) can lead to dramatically different final answers. Self-consistency reduces
          this variance through averaging, at no cost to bias, assuming the model's distribution already places
          the highest total probability mass on the correct answer. The result is a strictly better estimator
          under the same model.
        </P>
        <P>
          This perspective also clarifies when self-consistency will <em>fail</em>. If the model is systematically
          biased (if most reasoning paths lead to the same <em>wrong</em> answer), then majority voting will
          confidently return that wrong answer. Self-consistency reduces variance but cannot correct bias. For
          bias correction, one needs either better models, better prompts, or auxiliary verification mechanisms
          such as the step-aware verifiers explored by Li et al. (2023).
        </P>
      </Section>

      {/* References */}
      <Section title="References &amp; Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2203.11171" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Self-Consistency Improves Chain of Thought Reasoning in Language Models
            </a> by Wang, X., Wei, J., Schuurmans, D., Le, Q., Chi, E., Narang, S., Chowdhery, A., &amp; Zhou, D., ICLR 2023. The foundational paper introducing self-consistency as a decoding strategy for chain-of-thought reasoning.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2201.11903" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Chain-of-Thought Prompting Elicits Reasoning in Large Language Models
            </a> by Wei, J., Wang, X., Schuurmans, D., et al., NeurIPS 2022. The original CoT prompting paper that self-consistency builds upon.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2110.14168" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Training Verifiers to Solve Math Word Problems
            </a> by Cobbe, K., Kosaraju, V., Bavarian, M., et al., 2021. Introduces the verifier-based approach to improving math reasoning, an alternative to self-consistency's majority voting.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2206.02336" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Making Language Models Better Reasoners with Step-Aware Verifier
            </a> by Li, Y., Lin, Z., Zhang, S., et al., ACL 2023. Extends verification to step-level granularity, complementing the self-consistency paradigm.
          </li>
        </ul>
      </Section>
    </div>
  );
}
