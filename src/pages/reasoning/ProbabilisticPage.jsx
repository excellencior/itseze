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


function BayesianNetwork() {
  const [priorCloudy, setPriorCloudy] = useState(0.5);

  // Evidence states: null (unobserved), true, false
  const [evidence, setEvidence] = useState({
    cloudy: null,
    rain: null,
    sprinkler: null,
    wetGrass: null,
  });

  // Calculate joint distribution & marginals
  // Conditional Probability Tables (CPTs)
  const getJointProb = (c, r, s, w, priorC) => {
    // P(C)
    const pC = c ? priorC : (1 - priorC);

    // P(R | C)
    let pR_givenC;
    if (c) {
      pR_givenC = r ? 0.8 : 0.2;
    } else {
      pR_givenC = r ? 0.2 : 0.8;
    }

    // P(S | C)
    let pS_givenC;
    if (c) {
      pS_givenC = s ? 0.1 : 0.9;
    } else {
      pS_givenC = s ? 0.5 : 0.5;
    }

    // P(W | R, S)
    let pW_givenRS;
    if (r && s) {
      pW_givenRS = w ? 0.99 : 0.01;
    } else if (r && !s) {
      pW_givenRS = w ? 0.90 : 0.10;
    } else if (!r && s) {
      pW_givenRS = w ? 0.90 : 0.10;
    } else {
      pW_givenRS = w ? 0.01 : 0.99;
    }

    return pC * pR_givenC * pS_givenC * pW_givenRS;
  };

  const computeMarginals = () => {
    // Generate all 16 joint states
    const states = [];
    const booleanValues = [true, false];

    let totalWeight = 0;

    booleanValues.forEach(c => {
      booleanValues.forEach(r => {
        booleanValues.forEach(s => {
          booleanValues.forEach(w => {
            const prob = getJointProb(c, r, s, w, priorCloudy);

            // Filter states based on current evidence
            let matchesEvidence = true;
            if (evidence.cloudy !== null && evidence.cloudy !== c) matchesEvidence = false;
            if (evidence.rain !== null && evidence.rain !== r) matchesEvidence = false;
            if (evidence.sprinkler !== null && evidence.sprinkler !== s) matchesEvidence = false;
            if (evidence.wetGrass !== null && evidence.wetGrass !== w) matchesEvidence = false;

            if (matchesEvidence) {
              states.push({ c, r, s, w, prob });
              totalWeight += prob;
            }
          });
        });
      });
    });

    // Compute conditional probabilities
    let probC = 0;
    let probR = 0;
    let probS = 0;
    let probW = 0;

    states.forEach(state => {
      // normalized probability
      const normProb = totalWeight > 0 ? state.prob / totalWeight : 0;
      if (state.c) probC += normProb;
      if (state.r) probR += normProb;
      if (state.s) probS += normProb;
      if (state.w) probW += normProb;
    });

    return {
      cloudy: evidence.cloudy !== null ? (evidence.cloudy ? 1 : 0) : probC,
      rain: evidence.rain !== null ? (evidence.rain ? 1 : 0) : probR,
      sprinkler: evidence.sprinkler !== null ? (evidence.sprinkler ? 1 : 0) : probS,
      wetGrass: evidence.wetGrass !== null ? (evidence.wetGrass ? 1 : 0) : probW,
      isValid: totalWeight > 0
    };
  };

  const marginals = computeMarginals();

  const toggleEvidence = (node) => {
    setEvidence(prev => {
      const current = prev[node];
      let next;
      if (current === null) next = true;
      else if (current === true) next = false;
      else next = null;

      return { ...prev, [node]: next };
    });
  };

  const resetEvidence = () => {
    setEvidence({
      cloudy: null,
      rain: null,
      sprinkler: null,
      wetGrass: null,
    });
  };

  const renderNode = (id, label, prob, x, y) => {
    const isObserved = evidence[id] !== null;
    const obsVal = evidence[id];

    return (
      <div
        onClick={() => toggleEvidence(id)}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: '150px',
          background: '#fff',
          border: `1.5px solid ${isObserved ? 'var(--accent)' : 'var(--border)'}`,
          padding: '12px',
          boxShadow: isObserved ? '0 0 10px rgba(8, 145, 178, 0.2)' : 'var(--shadow-sm)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s',
          zIndex: 10,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = isObserved ? 'var(--accent)' : 'var(--border)'; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 800 }}>{label}</span>
          {isObserved && (
            <span style={{
              fontSize: '9px',
              background: 'var(--accent)',
              color: '#fff',
              padding: '1px 4px',
              fontWeight: 700
            }}>
              {obsVal ? 'TRUE' : 'FALSE'}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
          <div style={{
            background: isObserved ? 'var(--accent)' : '#3B82F6',
            width: `${prob * 100}%`,
            height: '100%',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>P(True)</span>
          <span style={{ fontWeight: 700 }}>{(prob * 100).toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '24px', margin: '24px 0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Interactive belief update
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.3px' }}>
        Bayesian Network Belief Updater
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Adjust the prior probability of Cloudy using the slider, or click any node to cycle its evidence state: <strong>Unobserved ➔ True ➔ False</strong>. Notice how observing "Wet Grass = True" increases the posterior probability of both Rain and Sprinkler — and how subsequently fixing Sprinkler = True <em>decreases</em> Rain's probability through explaining away.
      </p>

      {/* Prior Slider */}
      <div style={{ marginBottom: '24px', maxWidth: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
          <span>Prior P(Cloudy)</span>
          <span>{(priorCloudy * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="0.99"
          step="0.01"
          value={priorCloudy}
          onChange={(e) => setPriorCloudy(parseFloat(e.target.value))}
        />
      </div>

      {/* Graph Visualizer Container */}
      <div style={{
        position: 'relative',
        height: '320px',
        border: '1px solid var(--border)',
        background: '#FAF8F1',
        overflow: 'hidden',
        marginBottom: '16px',
      }}>
        {/* Draw connections */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
            </marker>
          </defs>
          {/* Cloudy -> Rain */}
          <path d="M 275 80 L 175 140" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* Cloudy -> Sprinkler */}
          <path d="M 325 80 L 425 140" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* Rain -> Wet Grass */}
          <path d="M 175 195 L 275 255" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrow)" />
          {/* Sprinkler -> Wet Grass */}
          <path d="M 425 195 L 325 255" stroke="#888" strokeWidth="1.5" markerEnd="url(#arrow)" />
        </svg>

        {/* Nodes */}
        {renderNode('cloudy', 'Cloudy', marginals.cloudy, 225, 20)}
        {renderNode('rain', 'Rain', marginals.rain, 100, 140)}
        {renderNode('sprinkler', 'Sprinkler', marginals.sprinkler, 350, 140)}
        {renderNode('wetGrass', 'Wet Grass', marginals.wetGrass, 225, 250)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={resetEvidence}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'white',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          Reset Evidence
        </button>

        {!marginals.isValid && (
          <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>
            Impossible combination of evidence selected!
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProbabilisticPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Reasoning
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Probabilistic Reasoning
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          The real world is filled with uncertainty. Probabilistic reasoning uses probability theory to draw conclusions from incomplete and noisy observations, allowing AI systems to make optimal decisions under uncertainty — the regime where symbolic logic breaks down.
        </p>
      </div>

      <Section title="1. From Certainty to Uncertainty">
        <P>
          In the early decades of AI, researchers quickly discovered that binary logic (True or False) is far too brittle for real-world applications. A medical diagnosis system cannot be 100% sure a patient has a disease based on a single symptom. A self-driving car cannot know with certainty whether that dark shape ahead is a pedestrian or a shadow. The world demands reasoning under <em>degrees of belief</em>.
        </P>
        <P>
          The mathematical foundation for this was laid over 250 years ago. <strong>Thomas Bayes</strong>, an English Presbyterian minister, developed a theorem for updating beliefs in light of new evidence. His work was published posthumously in 1763, edited and presented to the Royal Society by Richard Price. The theorem provides a principled mechanism for computing how probable a hypothesis is, given observed data:
        </P>

        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="P(H | E) = \frac{P(E | H) \cdot P(H)}{P(E)}" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 0' }}>
          <div style={{ background: '#FAFAFA', border: '1px solid var(--border)', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>PRIOR → POSTERIOR</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              <Latex math="P(H)" /> is your <strong>prior belief</strong> before seeing evidence. <Latex math="P(H|E)" /> is your <strong>posterior belief</strong> after observing evidence <Latex math="E" />. Bayes' theorem tells you exactly how to update.
            </p>
          </div>
          <div style={{ background: '#FAFAFA', border: '1px solid var(--border)', padding: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>LIKELIHOOD</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              <Latex math="P(E|H)" /> is the <strong>likelihood</strong> — how probable the evidence is, assuming the hypothesis is true. This is what allows the data to "speak" and shift your beliefs.
            </p>
          </div>
        </div>
      </Section>

      <Section title="2. Bayesian Networks">
        <P>
          The leap from Bayes' theorem to practical AI reasoning came through <strong>Judea Pearl</strong>'s invention of Bayesian networks in the 1980s. A Bayesian network is a <strong>Directed Acyclic Graph (DAG)</strong> where nodes represent random variables and edges represent direct causal or conditional dependencies. Each node carries a <strong>Conditional Probability Table (CPT)</strong> specifying how its probability depends on its parent nodes.
        </P>
        <P>
          Pearl's framework solved a critical computational problem: in a world with <Latex math="n" /> binary variables, the full joint probability table has <Latex math="2^n" /> entries — exponentially intractable. By exploiting the <strong>conditional independence</strong> encoded in the graph structure, Bayesian networks decompose this monolithic table into a product of small, local CPTs, making exact inference feasible for many practical networks.
        </P>

        <Callout type="key">
          Pearl received the ACM Turing Award in 2011 for his foundational contributions to AI through the development of Bayesian networks and causal reasoning. His work transformed AI from a field that avoided probability to one that embraces it as the language of rational belief.
        </Callout>
      </Section>

      <Section title="3. Explaining Away and d-Separation">
        <P>
          One of the most powerful and counterintuitive phenomena in Bayesian networks is <strong>explaining away</strong>. Consider our interactive network below: if you observe that the grass is wet, both Rain and Sprinkler become more likely (they both explain the wet grass). But if you then <em>also</em> observe that the Sprinkler is on, Rain's probability <em>decreases</em> — because the sprinkler already explains the wet grass, so rain is no longer needed as an explanation.
        </P>
        <P>
          This reasoning pattern is formalized through Pearl's concept of <strong>d-separation</strong>, which provides a purely graphical criterion for determining whether two variables are conditionally independent given a set of observed variables. D-separation lets you read off independence relationships directly from the network's structure without doing any numerical computation.
        </P>

        <Callout type="info">
          Try it in the widget below: set Wet Grass = True and observe how both Rain and Sprinkler increase. Then set Sprinkler = True and watch Rain's probability drop. This is explaining away in action.
        </Callout>
      </Section>

      <Section title="4. Interactive Bayesian Network">
        <P>
          Our interactive model implements the classic "Wet Grass" Bayesian network — a textbook example from Russell and Norvig's <em>Artificial Intelligence: A Modern Approach</em>. The network has four nodes with the following causal structure: Cloudy conditions influence both Rain and Sprinkler usage, and both Rain and Sprinkler can make the Grass wet.
        </P>
        <P>
          Click any node to cycle through evidence states (<strong>Unobserved → True → False</strong>). Adjust the prior probability of Cloudy using the slider to see how changing your assumptions propagates through the entire network.
        </P>

        <BayesianNetwork />
      </Section>

      <Section title="5. Beyond Static Networks">
        <P>
          The Bayesian framework extends far beyond static belief networks. Several key extensions have shaped modern AI:
        </P>

        <ul >
          <li>
            <strong>Hidden Markov Models (HMMs)</strong>: Introduced by Baum and Petrie (1966), HMMs model sequential data where the system transitions between hidden states over time. They powered speech recognition for decades and remain central to computational biology (gene finding, protein structure).
          </li>
          <li>
            <strong>Kalman Filters</strong>: Developed by Rudolf Kálmán (1960), these provide optimal state estimation for linear dynamical systems under Gaussian noise. They are the backbone of navigation systems, tracking algorithms, and were critical for the Apollo program's guidance computer.
          </li>
          <li>
            <strong>Probabilistic Programming</strong>: Modern languages like <strong>Stan</strong>, Church, and Pyro allow programmers to write generative models as code and automatically perform Bayesian inference. This democratizes probabilistic reasoning — you describe the world, and the compiler figures out the math.
          </li>
        </ul>
      </Section>

      <Section title="6. Significance in Modern AI">
        <P>
          While modern Large Language Models operate primarily via neural weight activations, probabilistic concepts are woven into their very foundations:
        </P>

        <ul >
          <li><strong>Autoregressive generation</strong>: LLMs output tokens by sampling from a conditional probability distribution <Latex math="P(x_t | x_{<t})" />. Every token prediction is fundamentally Bayesian — the model uses all prior context to compute its posterior belief over the next token.</li>
          <li><strong>Temperature and sampling</strong>: The temperature parameter in LLM inference directly controls the entropy of the output distribution — a probabilistic concept. Low temperature sharpens the distribution (more deterministic), high temperature flattens it (more creative).</li>
          <li><strong>Beam search</strong>: When generating text, beam search maintains multiple hypothesis paths weighted by their cumulative log-probabilities — a direct application of probabilistic reasoning to sequence decoding.</li>
          <li><strong>Uncertainty quantification</strong>: Active research areas like conformal prediction and Bayesian deep learning aim to give neural networks calibrated confidence estimates, bridging the gap between connectionist and probabilistic paradigms.</li>
        </ul>

        <Callout type="accent">
          Probabilistic reasoning provides the mathematical language for expressing <em>how much</em> you should believe something, given what you have observed. Symbolic logic tells you <em>what</em> follows from <em>what</em>; probability theory tells you <em>how strongly</em>.
        </Callout>
      </Section>

      {/* ── References ── */}
      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://doi.org/10.1098/rstl.1763.0053" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              An Essay towards Solving a Problem in the Doctrine of Chances
            </a> — Bayes, T., 1763. The foundational paper on inverse probability, published posthumously and communicated by Richard Price.
          </li>
          <li>
            <a href="https://doi.org/10.1016/C2009-0-27609-4" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Probabilistic Reasoning in Intelligent Systems: Networks of Plausible Inference
            </a> — Pearl, J., 1988. The seminal book introducing Bayesian networks and message-passing algorithms for probabilistic inference.
          </li>
          <li>
            <a href="https://amturing.acm.org/award_winners/pearl_2658896.cfm" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              ACM A.M. Turing Award: Judea Pearl
            </a> — ACM, 2011. Turing Award citation for contributions to AI through probabilistic and causal reasoning.
          </li>
          <li>
            <a href="https://aima.cs.berkeley.edu/" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Artificial Intelligence: A Modern Approach (4th ed.)
            </a> — Russell, S. & Norvig, P., 2020. The standard AI textbook covering probabilistic reasoning, Bayesian networks, and decision-making under uncertainty.
          </li>
          <li>
            <a href="https://doi.org/10.1214/aoms/1177699147" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Statistical Inference for Probabilistic Functions of Finite State Markov Chains
            </a> — Baum, L.E. & Petrie, T., 1966. Foundational paper on Hidden Markov Models and statistical inference for sequential data.
          </li>
          <li>
            <a href="https://doi.org/10.1115/1.3662552" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              A New Approach to Linear Filtering and Prediction Problems
            </a> — Kálmán, R.E., 1960. Introduced the Kalman filter for optimal state estimation in linear dynamical systems.
          </li>
          <li>
            <a href="https://doi.org/10.18637/jss.v076.i01" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Stan: A Probabilistic Programming Language
            </a> — Carpenter, B., Gelman, A., Hoffman, M.D., et al., 2017. Describes the Stan platform for Bayesian statistical modeling and inference.
          </li>
        </ul>
      </Section>
    </div>
  );
}
