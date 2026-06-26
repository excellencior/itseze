export const pageData = {
  route: 'concept:reasoning-probabilistic',
  urlPath: '/concepts/reasoning/probabilistic',
  status: 'published',
  meta: {
    title: 'Probabilistic Reasoning',
    subtitle: 'The real world is filled with uncertainty. Probabilistic reasoning uses probability theory to draw conclusions from incomplete and noisy observations, allowing AI systems to make optimal decisions under uncertainty — the regime where symbolic logic breaks down.',
    category: 'concept',
    subcategory: 'Reasoning',
    ready: true
  },
  blocks: [
    // ── Section 1 ──
    { type: 'section', id: 'sec-1', title: '1. From Certainty to Uncertainty' },

    {
      type: 'paragraph',
      id: 'p-1',
      content: 'In the early decades of AI, researchers quickly discovered that binary logic (True or False) is far too brittle for real-world applications. A medical diagnosis system cannot be 100% sure a patient has a disease based on a single symptom. A self-driving car cannot know with certainty whether that dark shape ahead is a pedestrian or a shadow. The world demands reasoning under <em>degrees of belief</em>.'
    },

    {
      type: 'paragraph',
      id: 'p-2',
      content: 'The mathematical foundation for this was laid over 250 years ago. <strong>Thomas Bayes</strong>, an English Presbyterian minister, developed a theorem for updating beliefs in light of new evidence. His work was published posthumously in 1763, edited and presented to the Royal Society by Richard Price. The theorem provides a principled mechanism for computing how probable a hypothesis is, given observed data:'
    },

    {
      type: 'math-box',
      id: 'm-1',
      expression: 'P(H | E) = \\frac{P(E | H) \\cdot P(H)}{P(E)}'
    },

    {
      type: 'prop-table',
      id: 'pt-1',
      rows: [
        ['PRIOR → POSTERIOR', '<Latex>P(H)</Latex> is your <strong>prior belief</strong> before seeing evidence. <Latex>P(H|E)</Latex> is your <strong>posterior belief</strong> after observing evidence <Latex>E</Latex>. Bayes\' theorem tells you exactly how to update.'],
        ['LIKELIHOOD', '<Latex>P(E|H)</Latex> is the <strong>likelihood</strong> — how probable the evidence is, assuming the hypothesis is true. This is what allows the data to "speak" and shift your beliefs.']
      ]
    },

    // ── Section 2 ──
    { type: 'section', id: 'sec-2', title: '2. Bayesian Networks' },

    {
      type: 'paragraph',
      id: 'p-3',
      content: 'The leap from Bayes\' theorem to practical AI reasoning came through <strong>Judea Pearl</strong>\'s invention of Bayesian networks in the 1980s. A Bayesian network is a <strong>Directed Acyclic Graph (DAG)</strong> where nodes represent random variables and edges represent direct causal or conditional dependencies. Each node carries a <strong>Conditional Probability Table (CPT)</strong> specifying how its probability depends on its parent nodes.'
    },

    {
      type: 'paragraph',
      id: 'p-4',
      content: 'Pearl\'s framework solved a critical computational problem: in a world with <Latex>n</Latex> binary variables, the full joint probability table has <Latex>2^n</Latex> entries — exponentially intractable. By exploiting the <strong>conditional independence</strong> encoded in the graph structure, Bayesian networks decompose this monolithic table into a product of small, local CPTs, making exact inference feasible for many practical networks.'
    },

    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content: 'Pearl received the ACM Turing Award in 2011 for his foundational contributions to AI through the development of Bayesian networks and causal reasoning. His work transformed AI from a field that avoided probability to one that embraces it as the language of rational belief.'
    },

    // ── Section 3 ──
    { type: 'section', id: 'sec-3', title: '3. Explaining Away and d-Separation' },

    {
      type: 'paragraph',
      id: 'p-5',
      content: 'One of the most powerful and counterintuitive phenomena in Bayesian networks is <strong>explaining away</strong>. Consider our interactive network below: if you observe that the grass is wet, both Rain and Sprinkler become more likely (they both explain the wet grass). But if you then <em>also</em> observe that the Sprinkler is on, Rain\'s probability <em>decreases</em> — because the sprinkler already explains the wet grass, so rain is no longer needed as an explanation.'
    },

    {
      type: 'paragraph',
      id: 'p-6',
      content: 'This reasoning pattern is formalized through Pearl\'s concept of <strong>d-separation</strong>, which provides a purely graphical criterion for determining whether two variables are conditionally independent given a set of observed variables. D-separation lets you read off independence relationships directly from the network\'s structure without doing any numerical computation.'
    },

    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content: 'Try it in the widget below: set Wet Grass = True and observe how both Rain and Sprinkler increase. Then set Sprinkler = True and watch Rain\'s probability drop. This is explaining away in action.'
    },

    // ── Section 4 ──
    { type: 'section', id: 'sec-4', title: '4. Interactive Bayesian Network' },

    {
      type: 'paragraph',
      id: 'p-7',
      content: 'Our interactive model implements the classic "Wet Grass" Bayesian network — a textbook example from Russell and Norvig\'s <em>Artificial Intelligence: A Modern Approach</em>. The network has four nodes with the following causal structure: Cloudy conditions influence both Rain and Sprinkler usage, and both Rain and Sprinkler can make the Grass wet.'
    },

    {
      type: 'paragraph',
      id: 'p-8',
      content: 'Click any node to cycle through evidence states (<strong>Unobserved → True → False</strong>). Adjust the prior probability of Cloudy using the slider to see how changing your assumptions propagates through the entire network.'
    },

    { type: 'custom-element', id: 'w-1', name: 'BayesianNetwork' },

    // ── Section 5 ──
    { type: 'section', id: 'sec-5', title: '5. Beyond Static Networks' },

    {
      type: 'paragraph',
      id: 'p-9',
      content: 'The Bayesian framework extends far beyond static belief networks. Several key extensions have shaped modern AI:'
    },

    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Hidden Markov Models (HMMs)</strong>: Introduced by Baum and Petrie (1966), HMMs model sequential data where the system transitions between hidden states over time. They powered speech recognition for decades and remain central to computational biology (gene finding, protein structure).',
        '<strong>Kalman Filters</strong>: Developed by Rudolf Kálmán (1960), these provide optimal state estimation for linear dynamical systems under Gaussian noise. They are the backbone of navigation systems, tracking algorithms, and were critical for the Apollo program\'s guidance computer.',
        '<strong>Probabilistic Programming</strong>: Modern languages like <strong>Stan</strong>, Church, and Pyro allow programmers to write generative models as code and automatically perform Bayesian inference. This democratizes probabilistic reasoning — you describe the world, and the compiler figures out the math.'
      ]
    },

    // ── Section 6 ──
    { type: 'section', id: 'sec-6', title: '6. Significance in Modern AI' },

    {
      type: 'paragraph',
      id: 'p-10',
      content: 'While modern Large Language Models operate primarily via neural weight activations, probabilistic concepts are woven into their very foundations:'
    },

    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Autoregressive generation</strong>: LLMs output tokens by sampling from a conditional probability distribution <Latex>P(x_t | x_{<t})</Latex>. Every token prediction is fundamentally Bayesian — the model uses all prior context to compute its posterior belief over the next token.',
        '<strong>Temperature and sampling</strong>: The temperature parameter in LLM inference directly controls the entropy of the output distribution — a probabilistic concept. Low temperature sharpens the distribution (more deterministic), high temperature flattens it (more creative).',
        '<strong>Beam search</strong>: When generating text, beam search maintains multiple hypothesis paths weighted by their cumulative log-probabilities — a direct application of probabilistic reasoning to sequence decoding.',
        '<strong>Uncertainty quantification</strong>: Active research areas like conformal prediction and Bayesian deep learning aim to give neural networks calibrated confidence estimates, bridging the gap between connectionist and probabilistic paradigms.'
      ]
    },

    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'accent',
      content: 'Probabilistic reasoning provides the mathematical language for expressing <em>how much</em> you should believe something, given what you have observed. Symbolic logic tells you <em>what</em> follows from <em>what</em>; probability theory tells you <em>how strongly</em>.'
    },

    // ── References ──
    { type: 'section', id: 'sec-7', title: 'References & Further Reading' },

    {
      type: 'reference',
      id: 'r-1',
      title: 'An Essay towards Solving a Problem in the Doctrine of Chances',
      url: 'https://doi.org/10.1098/rstl.1763.0053',
      authors: 'Bayes, T.',
      year: '1763',
      description: 'The foundational paper on inverse probability, published posthumously and communicated by Richard Price.'
    },

    {
      type: 'reference',
      id: 'r-2',
      title: 'Probabilistic Reasoning in Intelligent Systems: Networks of Plausible Inference',
      url: 'https://doi.org/10.1016/C2009-0-27609-4',
      authors: 'Pearl, J.',
      year: '1988',
      description: 'The seminal book introducing Bayesian networks and message-passing algorithms for probabilistic inference.'
    },

    {
      type: 'reference',
      id: 'r-3',
      title: 'ACM A.M. Turing Award: Judea Pearl',
      url: 'https://amturing.acm.org/award_winners/pearl_2658896.cfm',
      authors: 'ACM',
      year: '2011',
      description: 'Turing Award citation for contributions to AI through probabilistic and causal reasoning.'
    },

    {
      type: 'reference',
      id: 'r-4',
      title: 'Artificial Intelligence: A Modern Approach (4th ed.)',
      url: 'https://aima.cs.berkeley.edu/',
      authors: 'Russell, S. & Norvig, P.',
      year: '2020',
      description: 'The standard AI textbook covering probabilistic reasoning, Bayesian networks, and decision-making under uncertainty.'
    },

    {
      type: 'reference',
      id: 'r-5',
      title: 'Statistical Inference for Probabilistic Functions of Finite State Markov Chains',
      url: 'https://doi.org/10.1214/aoms/1177699147',
      authors: 'Baum, L.E. & Petrie, T.',
      year: '1966',
      description: 'Foundational paper on Hidden Markov Models and statistical inference for sequential data.'
    },

    {
      type: 'reference',
      id: 'r-6',
      title: 'A New Approach to Linear Filtering and Prediction Problems',
      url: 'https://doi.org/10.1115/1.3662552',
      authors: 'Kálmán, R.E.',
      year: '1960',
      description: 'Introduced the Kalman filter for optimal state estimation in linear dynamical systems.'
    },

    {
      type: 'reference',
      id: 'r-7',
      title: 'Stan: A Probabilistic Programming Language',
      url: 'https://doi.org/10.18637/jss.v076.i01',
      authors: 'Carpenter, B., Gelman, A., Hoffman, M.D., et al.',
      year: '2017',
      description: 'Describes the Stan platform for Bayesian statistical modeling and inference.'
    }
  ]
};
