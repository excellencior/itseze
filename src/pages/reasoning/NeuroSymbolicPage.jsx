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



const mockDatabase = [
  { id: 1, title: 'DeepProbLog: Neural Probabilistic Logic', field: 'Neuro-Symbolic', year: 2018, rating: 9.2 },
  { id: 2, title: 'Attention Is All You Need', field: 'Neural', year: 2017, rating: 9.8 },
  { id: 3, title: 'Propositional Resolution Systems', field: 'Symbolic', year: 2005, rating: 7.5 },
  { id: 4, title: 'Tree of Thoughts: Deliberate Solving', field: 'Neural', year: 2023, rating: 9.0 },
  { id: 5, title: 'ROME: Rank-One Model Editing', field: 'Neural', year: 2022, rating: 8.7 },
  { id: 6, title: 'Deductive Logic Databases', field: 'Symbolic', year: 1998, rating: 8.0 },
  { id: 7, title: 'Neural Theorem Proving with HyperTree', field: 'Neuro-Symbolic', year: 2022, rating: 9.1 },
  { id: 8, title: 'Program-Aided Language Models', field: 'Neuro-Symbolic', year: 2023, rating: 8.9 },
];

function TextToSqlCompiler() {
  const queries = [
    { label: 'Find papers published after 2018', sql: 'SELECT * FROM papers WHERE year > 2018', filter: (p) => p.year > 2018 },
    { label: 'Get high-rated Neural papers (rating >= 9.0)', sql: "SELECT * FROM papers WHERE field = 'Neural' AND rating >= 9.0", filter: (p) => p.field === 'Neural' && p.rating >= 9.0 },
    { label: 'List all Neuro-Symbolic papers', sql: "SELECT * FROM papers WHERE field = 'Neuro-Symbolic'", filter: (p) => p.field === 'Neuro-Symbolic' },
    { label: 'Select all papers published before 2010', sql: 'SELECT * FROM papers WHERE year < 2010', filter: (p) => p.year < 2010 },
    { label: 'Papers rated above 9.0 from any field', sql: 'SELECT * FROM papers WHERE rating > 9.0', filter: (p) => p.rating > 9.0 },
  ];

  const [activeQueryIndex, setActiveQueryIndex] = useState(0);

  const selectedQuery = queries[activeQueryIndex];
  const matchedPapers = mockDatabase.filter(selectedQuery.filter);

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px', margin: '24px 0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Interactive hybrid compiler
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.3px' }}>
        Text-to-SQL Compiler & Database Executor
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Select a natural language question. The simulator shows how a neural parser (Phase 1) converts natural language into structured SQL, which is then executed deterministically on the database (Phase 2). Notice the division of labor: the neural model handles <em>semantic interpretation</em>, while the SQL engine guarantees <em>mathematical correctness</em>.
      </p>

      {/* Query Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Natural Language Query Input</label>
        <select
          value={activeQueryIndex}
          onChange={(e) => setActiveQueryIndex(parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '13.5px',
            border: '1.5px solid var(--border)',
            fontWeight: 600,
            outline: 'none',
          }}
        >
          {queries.map((q, idx) => (
            <option key={idx} value={idx}>{q.label}</option>
          ))}
        </select>
      </div>

      {/* Compiler visual */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Neural block */}
        <div style={{ padding: '16px', border: '1.5px dashed #3B82F6', background: 'rgba(59, 130, 246, 0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', marginBottom: '6px' }}>
            🧠 Phase 1: Neural Interpretation
          </div>
          <div style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '8px', color: 'var(--text-muted)' }}>
            &ldquo;{queries[activeQueryIndex].label}&rdquo;
          </div>
          <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>
            A neural seq-to-seq model parses the natural language intent, identifies entities (field names, operators, values), and compiles them into a structured SQL abstract syntax tree.
          </div>
        </div>

        {/* Symbolic block */}
        <div style={{ padding: '16px', border: '1.5px solid var(--accent)', background: 'var(--accent-20)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>
            ⚙️ Phase 2: Symbolic Execution
          </div>
          <div style={{ fontFamily: '"Fira Code", monospace', fontSize: '12px', fontWeight: 700, color: '#000', marginBottom: '8px' }}>
            {selectedQuery.sql}
          </div>
          <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.4 }}>
            The compiled SQL query runs deterministically on the database engine. Arithmetic comparisons, logical filters, and joins are applied with 100% mathematical precision.
          </div>
        </div>
      </div>

      {/* Database Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
        <thead>
          <tr style={{ background: '#FAFAFA', borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '8px', textAlign: 'center' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Paper Title</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Field</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Year</th>
            <th style={{ padding: '8px', textAlign: 'center' }}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {mockDatabase.map((paper) => {
            const isMatched = matchedPapers.some(p => p.id === paper.id);
            return (
              <tr
                key={paper.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: isMatched ? 'rgba(8, 145, 178, 0.12)' : 'transparent',
                  fontWeight: isMatched ? 700 : 'normal',
                  transition: 'background 0.2s',
                }}
              >
                <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-light)' }}>{paper.id}</td>
                <td style={{ padding: '8px', color: isMatched ? '#000' : 'var(--text-muted)' }}>{paper.title}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{paper.field}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{paper.year}</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{paper.rating.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
        {matchedPapers.length} of {mockDatabase.length} rows matched · Highlighted rows satisfy the WHERE clause
      </div>
    </div>
  );
}

export default function NeuroSymbolicPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Paradigm
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Neuro-Symbolic Reasoning
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          The hybrid frontier of AI: combining the perceptual power of neural networks with the logical rigor of symbolic engines. By translating neural outputs into executable symbolic representations, hybrid systems reason with mathematical precision while retaining the ability to learn from raw, unstructured data.
        </p>
      </div>

      <Section title="1. Two Systems of Thought">
        <P>
          In cognitive psychology, Daniel Kahneman's framework distinguishes between <strong>System 1</strong> (fast, automatic, intuitive) and <strong>System 2</strong> (slow, deliberate, logical) thinking. Modern AI mirrors this distinction remarkably well: neural networks embody System 1 — they process inputs quickly and intuitively through learned pattern matching — while classical symbolic logic embodies System 2 — slow, methodical, and provably correct.
        </P>
        <P>
          The fundamental insight of neuro-symbolic AI is that these two systems are <em>complementary, not competing</em>. Rather than trying to force a single neural network to do everything (including precise arithmetic, logical deduction, and formal verification), neuro-symbolic architectures use the neural component to <strong>perceive and interpret</strong>, and the symbolic component to <strong>reason and verify</strong>.
        </P>

        <Callout type="key">
          This division of labor maps directly to what each system does best. Neural networks excel at handling ambiguity, noise, and unstructured inputs (images, speech, natural language). Symbolic engines excel at precision, compositionality, and guarantees. Together, they cover each other's weaknesses.
        </Callout>
      </Section>

      <Section title="2. A Taxonomy of Integration">
        <P>
          Kautz (2022) proposed a taxonomy of neuro-symbolic integration strategies, ranging from loose coupling to deep fusion:
        </P>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0' }}>
          <div style={{ background: '#FAFAFA', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>Type 1: Sequential Pipeline</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Neural model produces structured output (e.g., SQL, code, logical form), which is then executed by a symbolic engine. <strong>Example</strong>: Text-to-SQL systems, LLM code generation.
            </p>
          </div>
          <div style={{ background: '#FAFAFA', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>Type 2: Symbolic Loss</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Symbolic constraints are incorporated into the neural network's loss function during training, ensuring the model learns to satisfy logical rules. <strong>Example</strong>: DeepProbLog, Logic Tensor Networks.
            </p>
          </div>
          <div style={{ background: '#FAFAFA', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>Type 3: Neural Theorem Proving</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Neural networks guide the search process of a symbolic theorem prover, selecting which proof steps to try next. <strong>Example</strong>: AlphaProof, HyperTree Proof Search.
            </p>
          </div>
          <div style={{ background: '#FAFAFA', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>Type 4: Neural Architecture with Symbolic Structure</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              The neural architecture itself is designed to mirror symbolic reasoning patterns (e.g., graph neural networks over knowledge graphs). <strong>Example</strong>: Neural Module Networks.
            </p>
          </div>
        </div>
      </Section>

      <Section title="3. DeepProbLog: Differentiable Logic Programming">
        <P>
          A landmark in neuro-symbolic research is <strong>DeepProbLog</strong>, introduced by Robin Manhaeve et al. at NeurIPS 2018. DeepProbLog extends the ProbLog probabilistic logic programming language by allowing <strong>neural predicates</strong> — logical predicates whose truth values are predicted by neural networks rather than looked up in a database.
        </P>
        <P>
          Consider a task to add two handwritten digits. A purely neural approach would need to learn addition from pixel patterns — requiring enormous training data and still failing on unseen digit combinations. DeepProbLog separates concerns: a neural network classifies each digit image into a probability distribution over 0–9, and a logic program performs the addition:
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: '"Fira Code", monospace', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            problog
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`nn(digit_classifier, [Image], Digit) :: digit(Image, Digit).

addition(Img1, Img2, Sum) :-
    digit(Img1, D1),
    digit(Img2, D2),
    Sum is D1 + D2.`}</pre>
        </div>

        <P>
          The crucial innovation: because ProbLog's inference is differentiable with respect to the neural network's output probabilities, <strong>gradients flow end-to-end</strong> from the logical loss (did we get the sum right?) back through the digit classifier. The neural network learns to classify digits correctly <em>without ever seeing digit labels</em> — only addition labels!
        </P>

        <Callout type="info">
          This is sometimes called <strong>indirect supervision</strong>: the symbolic program provides the learning signal that teaches the neural network, eliminating the need for expensive manual annotation.
        </Callout>
      </Section>

      <Section title="4. Tool-Augmented Language Models">
        <P>
          The most commercially impactful form of neuro-symbolic AI today is <strong>tool-augmented LLMs</strong>. Instead of asking a language model to perform arithmetic, database queries, or code execution internally (where it is unreliable), the model is trained to emit structured <strong>tool calls</strong> that delegate computation to external symbolic systems.
        </P>
        <P>
          Schick et al. (2023) formalized this in <strong>Toolformer</strong>, showing that language models can learn <em>when</em> and <em>how</em> to call external APIs (calculators, search engines, translators) by inserting API calls into their text generation. Gao et al. (2023) introduced <strong>PAL (Program-Aided Language Models)</strong>, where the LLM generates Python code to solve math problems, then executes the code in a sandboxed interpreter.
        </P>

        <Callout type="key">
          PAL demonstrated that simply asking an LLM to <em>write code</em> that solves a math problem — rather than solving it directly — improved accuracy dramatically. The neural model handles language understanding; Python handles the math.
        </Callout>
      </Section>

      <Section title="5. Interactive Database Compiler">
        <P>
          The Text-to-SQL pattern is one of the most mature examples of neuro-symbolic reasoning in production systems. Large language models translate natural language questions into formal SQL statements, which are then executed by standard database engines with guaranteed correctness.
        </P>
        <P>
          Try the interactive demo below: select a question and observe how the neural interpretation phase produces a structured SQL query, which the symbolic execution phase applies deterministically to the database table.
        </P>

        <TextToSqlCompiler />
      </Section>

      <Section title="6. Key Advantages and Open Challenges">
        <P>
          Neuro-symbolic systems offer compelling advantages over either pure neural or pure symbolic approaches:
        </P>

        <ul style={{ fontSize: '15px', color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '16px', lineHeight: 1.8 }}>
          <li><strong>Out-of-distribution generalization</strong>: Once compiled into symbolic form, a query or program runs correctly on inputs of any size, bypassing the scaling limits of neural computation.</li>
          <li><strong>Full explainability</strong>: The compiled program (SQL, Python, logical proof) is explicit and inspectable, making error auditing straightforward.</li>
          <li><strong>Parameter efficiency</strong>: Because heavy reasoning is offloaded to symbolic engines, the neural component can remain smaller and requires less training data.</li>
          <li><strong>Formal verification</strong>: Symbolic outputs can be checked against formal specifications — a critical requirement for safety-critical applications in medicine, law, and finance.</li>
        </ul>

        <Callout type="warning">
          The key open challenge is <strong>compilation reliability</strong>: if the neural model generates incorrect symbolic output (wrong SQL, buggy code, invalid logical form), the symbolic engine will execute it faithfully — <em>producing a precisely wrong answer</em>. Ensuring the neural-to-symbolic translation is robust remains an active research frontier.
        </Callout>
      </Section>

      {/* ── References ── */}
      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Thinking, Fast and Slow
            </a> — Daniel Kahneman, 2011. Foundational framework on dual-process theory (System 1 vs System 2) that motivates the neuro-symbolic paradigm.
          </li>
          <li>
            <a href="https://doi.org/10.1002/aaai.12036" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              The Third AI Summer
            </a> — Henry Kautz, 2022. AAAI Robert S. Engelmore Memorial Lecture proposing a taxonomy of neuro-symbolic integration strategies.
          </li>
          <li>
            <a href="https://arxiv.org/abs/1805.10872" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              DeepProbLog: Neural Probabilistic Logic Programming
            </a> — Robin Manhaeve et al., 2018. Integrates neural predicates into probabilistic logic programs with end-to-end differentiable inference.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2302.04761" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Toolformer: Language Models Can Teach Themselves to Use Tools
            </a> — Timo Schick et al., 2023. Demonstrates self-supervised learning of API tool usage within language model text generation.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2211.10435" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              PAL: Program-Aided Language Models
            </a> — Luyu Gao et al., 2023. Offloads mathematical reasoning to generated Python code executed in a sandboxed interpreter.
          </li>
        </ul>
      </Section>
    </div>
  );
}
