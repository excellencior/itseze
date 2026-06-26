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



export function DebuggingLoopSimulator() {
  const [stage, setStage] = useState(0);

  const stages = [
    {
      title: '1. Goal Decomposition',
      desc: 'Task: Write a function that filters even numbers from a list.\n\nDecomposition:\n  1. Define function signature\n  2. Initialize empty result list\n  3. Iterate through input numbers\n  4. Apply modulo-2 parity check\n  5. Collect matching elements\n  6. Return filtered list',
      code: '',
      testResult: null
    },
    {
      title: '2. Code Synthesis (Draft 1 — Contains Bug)',
      desc: 'The model generates Python code based on the decomposition. However, it introduces a subtle logic error: the modulo check tests for odd numbers (n % 2 != 0) instead of even numbers (n % 2 == 0).',
      code: 'def filter_evens(nums):\n    res = []\n    for n in nums:\n        if n % 2 != 0:  # <--- BUG: != should be ==\n            res.append(n)\n    return res',
      testResult: null
    },
    {
      title: '3. Test Execution — Failure Detected',
      desc: 'Running the synthesized code against the test suite:\n  Input:    [1, 2, 3, 4, 5, 6]\n  Expected: [2, 4, 6]\n  Actual:   [1, 3, 5]',
      code: 'def filter_evens(nums):\n    res = []\n    for n in nums:\n        if n % 2 != 0:\n            res.append(n)\n    return res',
      testResult: { success: false, msg: 'FAIL: Expected [2, 4, 6], got [1, 3, 5]\nAssertionError: Modulo check selects odd numbers, not even.' }
    },
    {
      title: '4. Error Analysis & Self-Correction',
      desc: 'The test failure trace is fed back to the model. The model analyzes the error:\n\n"The assertion failed because n % 2 != 0 selects odd numbers. To select even numbers, the condition should be n % 2 == 0."\n\nThe model generates a corrected version.',
      code: 'def filter_evens(nums):\n    res = []\n    for n in nums:\n        if n % 2 == 0:  # <--- FIXED\n            res.append(n)\n    return res',
      testResult: null
    },
    {
      title: '5. Re-test — All Tests Pass',
      desc: 'Running the corrected code against the full test suite:\n  Test 1: [1,2,3,4,5,6] → [2,4,6] ✓\n  Test 2: [] → [] ✓\n  Test 3: [1,3,5] → [] ✓\n  Test 4: [2,4,6] → [2,4,6] ✓',
      code: 'def filter_evens(nums):\n    res = []\n    for n in nums:\n        if n % 2 == 0:\n            res.append(n)\n    return res',
      testResult: { success: true, msg: 'PASS: All 4 test cases passed successfully.' }
    }
  ];

  const handleNext = () => {
    if (stage < stages.length - 1) {
      setStage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (stage > 0) {
      setStage(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setStage(0);
  };

  const currentStageInfo = stages[stage];

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px', margin: '24px 0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Interactive coding agent loop
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.3px' }}>
        Program Synthesis & Self-Debugging Simulator
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Step through the synthesis loop to observe the full agent cycle: task decomposition → code generation → test execution → error analysis → self-correction → validation.
      </p>

      {/* Main visual panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Step description */}
        <div style={{ padding: '16px', background: '#FAF8F1', border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '8px', color: 'var(--accent)' }}>
            {currentStageInfo.title}
          </h4>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
            {currentStageInfo.desc}
          </div>

          {currentStageInfo.testResult && (
            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: currentStageInfo.testResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              borderLeft: `3px solid ${currentStageInfo.testResult.success ? '#10B981' : '#EF4444'}`,
              fontSize: '12.5px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: currentStageInfo.testResult.success ? '#10B981' : '#EF4444',
              whiteSpace: 'pre-line',
            }}>
              {currentStageInfo.testResult.msg}
            </div>
          )}
        </div>

        {/* Code Editor Preview */}
        <div style={{ background: '#1e1e24', color: '#fff', padding: '16px', position: 'relative', border: '1px solid #333' }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            filter_evens.py
          </div>
          {currentStageInfo.code ? (
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.5, color: '#e5c07b', paddingTop: '16px' }}>
              <code>{currentStageInfo.code}</code>
            </pre>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '12px', fontStyle: 'italic' }}>
              Awaiting code synthesis...
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {stages.map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: '3px',
              background: idx <= stage ? 'var(--accent)' : '#e0e0e0',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handlePrev}
          disabled={stage === 0}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'white',
            border: '1px solid var(--border)',
            cursor: stage === 0 ? 'not-allowed' : 'pointer',
            opacity: stage === 0 ? 0.5 : 1,
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={stage === stages.length - 1}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: stage === stages.length - 1 ? 'not-allowed' : 'pointer',
            opacity: stage === stages.length - 1 ? 0.5 : 1,
          }}
        >
          Next Stage →
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'white',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Reset Loop
        </button>
      </div>
    </div>
  );
}

export default function ProgramSynthesisPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Reasoning
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Program Synthesis
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          Generating structured, executable code as a form of precise reasoning. Instead of solving problems through natural language — which is inherently ambiguous — AI systems write programs, execute them, and use concrete feedback to iteratively self-correct.
        </p>
      </div>

      <Section title="1. Why Code Beats Natural Language for Reasoning">
        <P>
          Natural language is expressive but fundamentally ambiguous. When a language model "reasons" in English, it produces tokens that <em>look</em> like logical steps but lack any formal verification mechanism. There is no compiler checking each step, no type system catching category errors, no test suite validating the final answer.
        </P>
        <P>
          <strong>Program synthesis</strong> changes the paradigm entirely: instead of asking the model to <em>solve</em> the problem directly, we ask it to <em>write a program</em> that solves the problem. Code serves as a formal, deterministic sandbox with crucial properties:
        </P>

        <ul >
          <li><strong>Precise semantics</strong>: Every line of code has an unambiguous meaning, unlike natural language where the same sentence can be interpreted multiple ways.</li>
          <li><strong>Executable verification</strong>: Code can be compiled and run against test inputs, producing concrete pass/fail signals rather than subjective quality judgments.</li>
          <li><strong>Structured feedback</strong>: When code fails, the error trace (syntax errors, type mismatches, assertion failures, stack traces) tells the model <em>exactly</em> what went wrong and where.</li>
        </ul>

        <Callout type="key">
          This introduces a <strong>closed feedback loop</strong>: write code → execute → read error trace → fix → re-execute. Unlike natural language reasoning, where errors silently propagate, code execution provides immediate, unambiguous feedback.
        </Callout>
      </Section>

      <Section title="2. From Codex to Competitive Programming">
        <P>
          The era of neural program synthesis began with <strong>Codex</strong> (Chen et al., 2021), a GPT model fine-tuned on publicly available code from GitHub. Codex powered GitHub Copilot and demonstrated that large language models could generate functional code from natural language descriptions, solving 28.8% of problems on the HumanEval benchmark.
        </P>
        <P>
          The field advanced rapidly. <strong>AlphaCode</strong> (Li et al., 2022, published in <em>Science</em>) tackled <em>competitive programming</em> — problems requiring algorithmic thinking, mathematical reasoning, and careful implementation. AlphaCode's approach was distinctive:
        </P>

        <ol >
          <li><strong>Massive sampling</strong>: Generate millions of candidate programs for each problem.</li>
          <li><strong>Execution-based filtering</strong>: Run every candidate against sample inputs, discarding programs that produce wrong outputs.</li>
          <li><strong>Behavioral clustering</strong>: Cluster surviving programs by their output patterns, then select one representative from each cluster — ensuring diversity.</li>
        </ol>

        <P>
          AlphaCode achieved an estimated ranking within the top 54% of competitive programmers on Codeforces, demonstrating that brute-force sampling combined with execution feedback can solve problems requiring genuine algorithmic creativity.
        </P>
      </Section>

      <Section title="3. Program-of-Thought and PAL">
        <P>
          Two influential papers formalized the use of code generation specifically as a <em>reasoning strategy</em>, separate from general-purpose coding:
        </P>
        <P>
          <strong>Program of Thoughts (PoT)</strong> (Chen et al., 2023) prompts the LLM to generate Python code that implements the reasoning steps, then executes the code to produce the final answer. For math problems, the LLM writes expressions like <code style={{ background: '#f0f0f0', padding: '1px 4px', fontSize: '13px' }}>result = (5 * 3) + (2 * 7)</code> rather than trying to compute "5 × 3 = 15, then 2 × 7 = 14, then 15 + 14 = 29" in natural language.
        </P>
        <P>
          <strong>PAL (Program-Aided Language Models)</strong> (Gao et al., 2023) takes a similar approach, demonstrating that offloading computation to a Python interpreter dramatically improves accuracy on math, symbolic, and algorithmic reasoning benchmarks. The key insight: the LLM handles <em>understanding the problem</em>, and Python handles <em>computing the answer</em>.
        </P>

        <Callout type="info">
          PoT and PAL show that even a moderate-sized LLM can outperform much larger models on math tasks — simply by generating code instead of reasoning in natural language. The code acts as a <strong>cognitive prosthesis</strong> that compensates for the model's weak numerical computation.
        </Callout>
      </Section>

      <Section title="4. Interactive Self-Debugging Loop">
        <P>
          Explore the synthesis-and-debug cycle in action below. Watch how the agent decomposes a goal into subtasks, generates code, encounters a test failure, analyzes the error traceback, and compiles a corrected version — all within a single automated loop.
        </P>

        <DebuggingLoopSimulator />
      </Section>

      <Section title="5. The Agentic Paradigm">
        <P>
          Program synthesis is the engine of modern <strong>autonomous coding agents</strong> — systems that can independently write, test, debug, and deploy software. The paradigm has evolved from simple code completion to full agentic loops:
        </P>

        <ul >
          <li><strong>Test-driven synthesis</strong>: The agent writes unit tests <em>first</em> based on the specification, then iterates on the source code until all tests pass. This inverts the traditional development workflow, making tests the specification and code the implementation.</li>
          <li><strong>Tool use</strong>: The model uses compilers, linters, type checkers, terminals, and even web browsers to check its work, shifting from passive prediction to active software engineering.</li>
          <li><strong>Multi-file reasoning</strong>: Advanced agents (SWE-bench, Devin) navigate entire codebases, understanding dependency graphs, reading documentation, and making coordinated changes across multiple files.</li>
          <li><strong>Iterative repair</strong>: When code triggers a runtime exception, the full traceback — including the call stack, variable values, and error message — is fed back to the model as context, enabling precise self-repair.</li>
        </ul>

        <Callout type="accent">
          The progression from code generation → code execution → self-debugging → agentic autonomy represents the most concrete realization of AI reasoning: systems that don't just predict what code <em>might look like</em>, but actively <strong>build, test, and verify</strong> working software.
        </Callout>
      </Section>

      <Section title="6. Open Challenges">
        <P>
          Despite rapid progress, several challenges remain:
        </P>

        <ul >
          <li><strong>Specification ambiguity</strong>: Natural language specifications are inherently incomplete. The model must infer edge cases, handle implicit constraints, and ask for clarification when the task is underspecified.</li>
          <li><strong>Security</strong>: Executing model-generated code in production environments creates significant security risks (code injection, resource exhaustion, data exfiltration). Sandboxing and formal verification are essential safeguards.</li>
          <li><strong>Algorithmic creativity</strong>: While LLMs can implement known algorithms, inventing genuinely novel algorithms — the kind that would earn a research publication — remains largely beyond current capabilities.</li>
        </ul>
      </Section>

      {/* ── References ── */}
      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2107.03374" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Evaluating Large Language Models Trained on Code
            </a> — Chen, M., Tworek, J., Jun, H., et al., 2021. Introduces Codex and the HumanEval benchmark for measuring functional code generation.
          </li>
          <li>
            <a href="https://doi.org/10.1126/science.abq1158" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Competition-Level Code Generation with AlphaCode
            </a> — Li, Y., Choi, D., Chung, J., et al., 2022. Massive-scale sampling and execution-based filtering for competitive programming.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2211.12588" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Program of Thoughts Prompting
            </a> — Chen, W., Ma, X., Wang, X., & Cohen, W.W., 2023. Disentangles computation from reasoning by generating executable Python programs.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2211.10435" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              PAL: Program-Aided Language Models
            </a> — Gao, L., Madaan, A., Zhou, S., et al., 2023. Offloads computation to a Python interpreter, boosting math and symbolic reasoning accuracy.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2310.06770" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              SWE-bench: Can Language Models Resolve Real-World GitHub Issues?
            </a> — Jimenez, C.E., Yang, J., Wettig, A., et al., 2024. Benchmark for evaluating autonomous coding agents on real GitHub issues.
          </li>
        </ul>
      </Section>
    </div>
  );
}
