import { useState } from 'react';
import Latex from '../../components/Latex';
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



// Simple expression parser and evaluator for A, B variables
function evaluateExpression(expr, a, b) {
  try {
    // Standardize terms
    let safeExpr = expr
      .toUpperCase()
      .replace(/\bA\b/g, a ? 'true' : 'false')
      .replace(/\bB\b/g, b ? 'true' : 'false')
      .replace(/\bAND\b/g, '&&')
      .replace(/\bOR\b/g, '||')
      .replace(/\bNOT\b/g, '!')
      .replace(/\bIMPLIES\b/g, '<=') // Custom representation for implication: P IMPLIES Q is !P || Q
      .replace(/\bXOR\b/g, '^');

    // Handle implication specifically: P <= Q in JS is !P || Q (if we rewrite it)
    if (expr.toUpperCase().includes('IMPLIES')) {
      const parts = expr.split(/\bIMPLIES\b/i);
      if (parts.length === 2) {
        const leftVal = evaluateExpression(parts[0].trim(), a, b);
        const rightVal = evaluateExpression(parts[1].trim(), a, b);
        return !leftVal || rightVal;
      }
    }

    // Evaluate
    // Safe because we sanitize variables to 'true'/'false' and allow only specific operators
    const sanitized = safeExpr.replace(/[^truefals&|!^() ]/g, '');
    return Function(`return (${sanitized})`)();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function PropositionalEvaluator() {
  const [valA, setValA] = useState(true);
  const [valB, setValB] = useState(false);
  const [expression, setExpression] = useState('A AND (NOT B)');

  const presets = [
    { label: 'De Morgan\'s Law', expr: 'NOT (A OR B)' },
    { label: 'Modus Ponens Premise', expr: 'A AND (A IMPLIES B)' },
    { label: 'Exclusive OR (XOR)', expr: 'A XOR B' },
    { label: 'Implication Link', expr: '(NOT A) OR B' },
    { label: 'Contradiction', expr: 'A AND (NOT A)' },
    { label: 'Tautology', expr: 'A OR (NOT A)' },
  ];

  const handleSelectPreset = (p) => {
    setExpression(p);
  };

  const rows = [
    { a: true, b: true },
    { a: true, b: false },
    { a: false, b: true },
    { a: false, b: false }
  ].map(r => {
    const res = evaluateExpression(expression, r.a, r.b);
    return { ...r, result: res };
  });

  const currentResult = evaluateExpression(expression, valA, valB);

  // Determine if the expression is a tautology or contradiction
  const allTrue = rows.every(r => r.result === true);
  const allFalse = rows.every(r => r.result === false);

  return (
    <div style={{ background: 'var(--node-bg)', border: '1px solid var(--border)', padding: '24px', margin: '24px 0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Interactive Logic Checker
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.3px' }}>
        Propositional Logic Evaluator
      </h3>

      {/* Preset Selectors */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {presets.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectPreset(p.expr)}
            style={{
              padding: '6px 10px',
              fontSize: '11.5px',
              background: expression === p.expr ? 'var(--accent-20)' : 'var(--bg-subtle)',
              border: `1px solid ${expression === p.expr ? 'var(--accent)' : 'var(--border)'}`,
              color: expression === p.expr ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Formula Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Logic Expression (Operators: AND, OR, NOT, IMPLIES, XOR)</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            border: '1.5px solid var(--border)',
            fontWeight: 600,
            outline: 'none',
            fontFamily: 'var(--font-mono)',
          }}
        />
      </div>

      {/* Variable Evaluator controls */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', background: 'var(--node-bg)', padding: '12px 16px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="checkboxA"
            checked={valA}
            onChange={(e) => setValA(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <label htmlFor="checkboxA" style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Set Variable A = {valA ? 'TRUE' : 'FALSE'}</label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="checkboxB"
            checked={valB}
            onChange={(e) => setValB(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <label htmlFor="checkboxB" style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Set Variable B = {valB ? 'TRUE' : 'FALSE'}</label>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 700 }}>
          Expression Evaluates To: {' '}
          <span style={{
            color: currentResult === null ? 'var(--text-light)' : (currentResult ? '#10B981' : '#EF4444'),
            background: currentResult === null ? '#f1f1f1' : (currentResult ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'),
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {currentResult === null ? 'ERROR' : currentResult.toString().toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tautology / Contradiction indicator */}
      {(allTrue || allFalse) && (
        <div style={{
          padding: '8px 14px',
          marginBottom: '16px',
          fontSize: '12px',
          fontWeight: 700,
          background: allTrue ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          borderLeft: `3px solid ${allTrue ? '#10B981' : '#EF4444'}`,
          color: allTrue ? '#10B981' : '#EF4444',
        }}>
          {allTrue ? '✓ This expression is a TAUTOLOGY — true under every possible valuation.' : '✗ This expression is a CONTRADICTION — false under every possible valuation.'}
        </div>
      )}

      {/* Truth Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'var(--node-bg)', borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>A</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>B</th>
            <th style={{ padding: '10px', textAlign: 'left', fontWeight: 700 }}>Expression ({expression})</th>
            <th style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isCurrentState = row.a === valA && row.b === valB;
            return (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: isCurrentState ? 'var(--accent-20)' : 'transparent',
                  fontWeight: isCurrentState ? 700 : 'normal',
                  transition: 'background 0.2s',
                }}
              >
                <td style={{ padding: '10px', textAlign: 'center', color: row.a ? '#10B981' : '#EF4444' }}>{row.a ? 'T' : 'F'}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: row.b ? '#10B981' : '#EF4444' }}>{row.b ? 'T' : 'F'}</td>
                <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{expression}</td>
                <td style={{
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: row.result === null ? '#aaa' : (row.result ? '#10B981' : '#EF4444')
                }}>
                  {row.result === null ? 'ERR' : (row.result ? 'T' : 'F')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SymbolicPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Reasoning
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Symbolic (Logical) Reasoning
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          The oldest and most rigorously grounded paradigm in artificial intelligence. Symbolic reasoning translates facts and premises into formal mathematical structures, then applies rules of inference to compute exact, sound, and fully explainable conclusions.
        </p>
      </div>

      <Section title="1. Historical Foundations">
        <P>
          The story of symbolic AI begins in the summer of 1956 at the Dartmouth Workshop, where John McCarthy, Marvin Minsky, Allen Newell, and Herbert Simon coined the term <strong>Artificial Intelligence</strong> and set the field's founding agenda. McCarthy went on to create <strong>LISP</strong> (1958), one of the earliest programming languages built explicitly for symbolic computation — manipulating lists, trees, and logical expressions rather than numerical data.
        </P>
        <P>
          Newell and Simon formalized the core thesis of symbolic AI in their <strong>Physical Symbol System Hypothesis</strong> (1976): a physical symbol system — one that can create, copy, modify, and destroy symbolic expressions — has the necessary and sufficient means for general intelligent action. In other words, they argued that all intelligence, human or artificial, can be reduced to the manipulation of symbols according to rules.
        </P>

        <Callout type="key">
          The Physical Symbol System Hypothesis was the intellectual foundation for decades of AI research. It implies that if you can write enough rules and encode enough knowledge in symbols, you can build a thinking machine — no neural networks required.
        </Callout>
      </Section>

      <Section title="2. Propositional and First-Order Logic">
        <P>
          Symbolic reasoning systems are built on two major branches of mathematical logic. <strong>Propositional logic</strong> deals with statements that are either true or false, connected by operators like AND (<Latex math="\land" />), OR (<Latex math="\lor" />), NOT (<Latex math="\lnot" />), and IMPLIES (<Latex math="\rightarrow" />).
        </P>
        <P>
          <strong>First-order logic (FOL)</strong> extends propositional logic with <em>quantifiers</em> and <em>predicates</em>, allowing statements about classes of objects. For example, <Latex math="\forall x\, (\text{Human}(x) \rightarrow \text{Mortal}(x))" /> reads: "For all <Latex math="x" />, if <Latex math="x" /> is human, then <Latex math="x" /> is mortal." This representational power made FOL the backbone of knowledge-based systems throughout the 1970s and 80s.
        </P>

        <P>
          Two classical rules of inference remain central to all symbolic reasoning:
        </P>

        {/* Inference Rules */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0' }}>
          <div style={{ background: 'var(--node-bg)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Modus Ponens
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Latex math="\frac{P, \quad P \rightarrow Q}{Q}" />
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
              If <Latex math="P" /> is true, and <Latex math="P" /> implies <Latex math="Q" />, then <Latex math="Q" /> must be true. The most fundamental deductive step.
            </p>
          </div>
          <div style={{ background: 'var(--node-bg)', border: '1px solid var(--border)', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Modus Tollens
            </div>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <Latex math="\frac{\lnot Q, \quad P \rightarrow Q}{\lnot P}" />
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
              If <Latex math="Q" /> is false, and <Latex math="P" /> implies <Latex math="Q" />, then <Latex math="P" /> must be false. Reasoning by contradiction.
            </p>
          </div>
        </div>

        <P>
          J. Alan Robinson's <strong>Resolution Principle</strong> (1965) unified these inference patterns into a single, mechanizable rule, proving that any valid logical consequence can be derived through repeated resolution steps. This result made automated theorem proving practical and directly inspired the creation of logic programming languages.
        </P>
      </Section>

      <Section title="3. Expert Systems and Knowledge Engineering">
        <P>
          The 1970s and 80s saw symbolic AI's greatest commercial success: <strong>expert systems</strong>. These programs encoded domain knowledge as massive collections of if-then rules and used inference engines to diagnose diseases, configure hardware, or analyze chemical compounds.
        </P>
        <P>
          <strong>DENDRAL</strong> (Buchanan & Feigenbaum, 1969) was among the first — it analyzed mass spectrometry data to infer the molecular structure of unknown organic compounds. <strong>MYCIN</strong> (Shortliffe, 1976) diagnosed bacterial infections and recommended antibiotics, achieving diagnostic accuracy comparable to human experts in controlled evaluations.
        </P>
        <P>
          Meanwhile, <strong>Prolog</strong> — created by Alain Colmerauer and Philippe Roussel in 1972 — brought logic programming to life. In Prolog, a programmer declares facts and rules, and the language's built-in inference engine automatically searches for solutions using depth-first backtracking. A simple knowledge base might look like:
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
            prolog
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`parent(tom, bob).
parent(tom, liz).
parent(bob, ann).

grandparent(X, Z) :- parent(X, Y), parent(Y, Z).

% Query: ?- grandparent(tom, ann).
% Result: true`}</pre>
        </div>

        <Callout type="info">
          The knowledge engineering bottleneck became apparent: building expert systems required human experts to sit with knowledge engineers for months, painstakingly encoding every rule. This approach did not scale to open-ended domains like general conversation or visual perception.
        </Callout>
      </Section>

      <Section title="4. Interactive Truth Tables">
        <P>
          A <strong>truth table</strong> is a tabular breakdown showing every possible valuation of propositional variables alongside the resulting evaluation of a complex statement. Truth tables are the simplest and most direct method for verifying whether a formula is a <em>tautology</em> (always true), a <em>contradiction</em> (always false), or <em>contingent</em> (true under some valuations, false under others).
        </P>
        <P>
          Use the interactive evaluator below to test your own logic formulas. Toggle the variables <Latex math="A" /> and <Latex math="B" /> to watch the truth table highlight the active row in real time. Try the preset "Tautology" and "Contradiction" examples to see the automatic detection feature.
        </P>

        <PropositionalEvaluator />

        <Callout type="key">
          Notice that <Latex math="A \lor \lnot A" /> (the Law of Excluded Middle) is always true regardless of <Latex math="A" />'s value, while <Latex math="A \land \lnot A" /> is always false. These two extremes are fundamental to classical logic — they define the boundary between valid reasoning and logical impossibility.
        </Callout>
      </Section>

      <Section title="5. The Limitations of Symbolic Systems">
        <P>
          Despite decades of success in structured domains, symbolic reasoning faces deep, well-documented limitations that ultimately drove the field toward statistical and neural approaches:
        </P>

        <ul >
          <li><strong>Brittleness</strong>: A single missing rule, a slightly misspelled predicate, or an unanticipated edge case can cause the entire reasoning chain to fail silently or produce incorrect results. Symbolic systems have no graceful degradation.</li>
          <li><strong>The Frame Problem</strong>: Formulated by McCarthy and Hayes (1969), this asks: how do you formally specify <em>what does not change</em> when an action occurs? In a world with millions of properties, writing explicit frame axioms for every action becomes combinatorially intractable.</li>
          <li><strong>The Qualification Problem</strong>: Closely related, this asks: how do you enumerate every precondition that must hold for an action to succeed? In the real world, the list is essentially infinite — a robot cannot pour water if the cup has a hole, if gravity is reversed, if the water is frozen, etc.</li>
          <li><strong>No Handling of Noise</strong>: Symbolic logic operates in a binary True/False universe. It does not naturally handle the uncertainty, ambiguity, and noise present in real-world sensory data like audio waveforms, image pixels, or natural language text.</li>
          <li><strong>The Knowledge Acquisition Bottleneck</strong>: All knowledge must be manually encoded by human experts. There is no mechanism for learning from data — every fact and rule must be explicitly programmed.</li>
        </ul>

        <Callout type="warning">
          These limitations motivated two major alternative paradigms: <strong>probabilistic reasoning</strong> (to handle uncertainty mathematically) and <strong>connectionist neural networks</strong> (to learn patterns directly from noisy, unstructured data). Yet symbolic methods have not disappeared — they are experiencing a renaissance through <strong>neuro-symbolic</strong> hybrid systems that combine the best of both worlds.
        </Callout>
      </Section>

      <Section title="6. Legacy and Modern Revival">
        <P>
          The symbolic tradition's emphasis on <em>explainability</em>, <em>compositionality</em>, and <em>formal guarantees</em> remains deeply relevant today. Modern AI safety research often calls for exactly the properties that symbolic systems provide: the ability to audit reasoning chains, verify logical consistency, and guarantee that certain constraints are never violated.
        </P>
        <P>
          SAT solvers (satisfiability solvers) and SMT solvers (Satisfiability Modulo Theories) — direct descendants of Robinson's resolution principle — are now among the most powerful tools in hardware verification, compiler optimization, and automated planning. They solve Boolean constraint problems with billions of variables in seconds, powering everything from CPU design validation to airline scheduling.
        </P>
        <P>
          As we will explore in later sections, the frontier of AI reasoning is increasingly <strong>neuro-symbolic</strong>: using neural networks to parse and understand messy real-world inputs, then compiling those understandings into formal symbolic representations that can be executed, verified, and explained with mathematical certainty.
        </P>
      </Section>

      {/* ── References ── */}
      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://en.wikipedia.org/wiki/Dartmouth_workshop" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence
            </a> — McCarthy, Minsky, Rochester & Shannon, 1956. The founding document of AI as a field.
          </li>
          <li>
            <a href="https://doi.org/10.1145/367177.367199" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I
            </a> — McCarthy, 1960. Introduces LISP and symbolic computation foundations.
          </li>
          <li>
            <a href="https://doi.org/10.1145/360018.360022" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Computer Science as Empirical Inquiry: Symbols and Search
            </a> — Newell & Simon, 1976. Presents the Physical Symbol System Hypothesis.
          </li>
          <li>
            <a href="https://doi.org/10.1145/321250.321253" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              A Machine-Oriented Logic Based on the Resolution Principle
            </a> — Robinson, 1965. Unifies inference into a single mechanizable resolution rule.
          </li>
          <li>
            <a href="https://doi.org/10.1016/0004-3702(78)90010-2" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              DENDRAL and Meta-DENDRAL: Their Applications Dimension
            </a> — Buchanan & Feigenbaum, 1978. Pioneering expert system for chemical structure inference.
          </li>
          <li>
            <a href="https://doi.org/10.1016/B978-0-444-00179-5.X5001-X" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Computer-Based Medical Consultations: MYCIN
            </a> — Shortliffe, 1976. Landmark rule-based expert system for medical diagnosis.
          </li>
          <li>
            <a href="https://doi.org/10.1145/154766.155362" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              The Birth of Prolog
            </a> — Colmerauer & Roussel, 1993. History of the creation of the Prolog logic programming language.
          </li>
          <li>
            <a href="http://www-formal.stanford.edu/jmc/mcchay69.pdf" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Some Philosophical Problems from the Standpoint of Artificial Intelligence
            </a> — McCarthy & Hayes, 1969. Introduces the Frame Problem and foundational AI philosophy.
          </li>
        </ul>
      </Section>
    </div>
  );
}
