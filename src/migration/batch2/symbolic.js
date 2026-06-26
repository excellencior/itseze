export const pageData = {
  route: 'concept:reasoning-symbolic',
  urlPath: '/concepts/reasoning/symbolic',
  status: 'published',
  meta: {
    title: 'Symbolic (Logical) Reasoning',
    subtitle: 'The oldest and most rigorously grounded paradigm in artificial intelligence. Symbolic reasoning translates facts and premises into formal mathematical structures, then applies rules of inference to compute exact, sound, and fully explainable conclusions.',
    category: 'concept',
    subcategory: 'Reasoning',
    ready: true
  },
  blocks: [
    // ── Section 1: Historical Foundations ──
    {
      type: 'section',
      id: 'sec-1',
      title: '1. Historical Foundations'
    },
    {
      type: 'paragraph',
      id: 'p-1',
      content: 'The story of symbolic AI begins in the summer of 1956 at the Dartmouth Workshop, where John McCarthy, Marvin Minsky, Allen Newell, and Herbert Simon coined the term <strong>Artificial Intelligence</strong> and set the field\'s founding agenda. McCarthy went on to create <strong>LISP</strong> (1958), one of the earliest programming languages built explicitly for symbolic computation — manipulating lists, trees, and logical expressions rather than numerical data.'
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content: 'Newell and Simon formalized the core thesis of symbolic AI in their <strong>Physical Symbol System Hypothesis</strong> (1976): a physical symbol system — one that can create, copy, modify, and destroy symbolic expressions — has the necessary and sufficient means for general intelligent action. In other words, they argued that all intelligence, human or artificial, can be reduced to the manipulation of symbols according to rules.'
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content: 'The Physical Symbol System Hypothesis was the intellectual foundation for decades of AI research. It implies that if you can write enough rules and encode enough knowledge in symbols, you can build a thinking machine — no neural networks required.'
    },

    // ── Section 2: Propositional and First-Order Logic ──
    {
      type: 'section',
      id: 'sec-2',
      title: '2. Propositional and First-Order Logic'
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content: 'Symbolic reasoning systems are built on two major branches of mathematical logic. <strong>Propositional logic</strong> deals with statements that are either true or false, connected by operators like AND (<Latex>\\land</Latex>), OR (<Latex>\\lor</Latex>), NOT (<Latex>\\lnot</Latex>), and IMPLIES (<Latex>\\rightarrow</Latex>).'
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content: '<strong>First-order logic (FOL)</strong> extends propositional logic with <em>quantifiers</em> and <em>predicates</em>, allowing statements about classes of objects. For example, <Latex>\\forall x\\, (\\text{Human}(x) \\rightarrow \\text{Mortal}(x))</Latex> reads: "For all <Latex>x</Latex>, if <Latex>x</Latex> is human, then <Latex>x</Latex> is mortal." This representational power made FOL the backbone of knowledge-based systems throughout the 1970s and 80s.'
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content: 'Two classical rules of inference remain central to all symbolic reasoning:'
    },
    {
      type: 'prop-table',
      id: 'pt-1',
      rows: [
        ['Modus Ponens', '<Latex>\\frac{P, \\quad P \\rightarrow Q}{Q}</Latex> — If <Latex>P</Latex> is true, and <Latex>P</Latex> implies <Latex>Q</Latex>, then <Latex>Q</Latex> must be true. The most fundamental deductive step.'],
        ['Modus Tollens', '<Latex>\\frac{\\lnot Q, \\quad P \\rightarrow Q}{\\lnot P}</Latex> — If <Latex>Q</Latex> is false, and <Latex>P</Latex> implies <Latex>Q</Latex>, then <Latex>P</Latex> must be false. Reasoning by contradiction.']
      ]
    },
    {
      type: 'paragraph',
      id: 'p-6',
      content: 'J. Alan Robinson\'s <strong>Resolution Principle</strong> (1965) unified these inference patterns into a single, mechanizable rule, proving that any valid logical consequence can be derived through repeated resolution steps. This result made automated theorem proving practical and directly inspired the creation of logic programming languages.'
    },

    // ── Section 3: Expert Systems and Knowledge Engineering ──
    {
      type: 'section',
      id: 'sec-3',
      title: '3. Expert Systems and Knowledge Engineering'
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content: 'The 1970s and 80s saw symbolic AI\'s greatest commercial success: <strong>expert systems</strong>. These programs encoded domain knowledge as massive collections of if-then rules and used inference engines to diagnose diseases, configure hardware, or analyze chemical compounds.'
    },
    {
      type: 'paragraph',
      id: 'p-8',
      content: '<strong>DENDRAL</strong> (Buchanan & Feigenbaum, 1969) was among the first — it analyzed mass spectrometry data to infer the molecular structure of unknown organic compounds. <strong>MYCIN</strong> (Shortliffe, 1976) diagnosed bacterial infections and recommended antibiotics, achieving diagnostic accuracy comparable to human experts in controlled evaluations.'
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content: 'Meanwhile, <strong>Prolog</strong> — created by Alain Colmerauer and Philippe Roussel in 1972 — brought logic programming to life. In Prolog, a programmer declares facts and rules, and the language\'s built-in inference engine automatically searches for solutions using depth-first backtracking. A simple knowledge base might look like:'
    },
    {
      type: 'code-block',
      id: 'cb-1',
      label: 'prolog',
      content: 'parent(tom, bob).\nparent(tom, liz).\nparent(bob, ann).\n\ngrandparent(X, Z) :- parent(X, Y), parent(Y, Z).\n\n% Query: ?- grandparent(tom, ann).\n% Result: true'
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content: 'The knowledge engineering bottleneck became apparent: building expert systems required human experts to sit with knowledge engineers for months, painstakingly encoding every rule. This approach did not scale to open-ended domains like general conversation or visual perception.'
    },

    // ── Section 4: Interactive Truth Tables ──
    {
      type: 'section',
      id: 'sec-4',
      title: '4. Interactive Truth Tables'
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content: 'A <strong>truth table</strong> is a tabular breakdown showing every possible valuation of propositional variables alongside the resulting evaluation of a complex statement. Truth tables are the simplest and most direct method for verifying whether a formula is a <em>tautology</em> (always true), a <em>contradiction</em> (always false), or <em>contingent</em> (true under some valuations, false under others).'
    },
    {
      type: 'paragraph',
      id: 'p-11',
      content: 'Use the interactive evaluator below to test your own logic formulas. Toggle the variables <Latex>A</Latex> and <Latex>B</Latex> to watch the truth table highlight the active row in real time. Try the preset "Tautology" and "Contradiction" examples to see the automatic detection feature.'
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'PropositionalEvaluator'
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'tip',
      content: 'Notice that <Latex>A \\lor \\lnot A</Latex> (the Law of Excluded Middle) is always true regardless of <Latex>A</Latex>\'s value, while <Latex>A \\land \\lnot A</Latex> is always false. These two extremes are fundamental to classical logic — they define the boundary between valid reasoning and logical impossibility.'
    },

    // ── Section 5: The Limitations of Symbolic Systems ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. The Limitations of Symbolic Systems'
    },
    {
      type: 'paragraph',
      id: 'p-12',
      content: 'Despite decades of success in structured domains, symbolic reasoning faces deep, well-documented limitations that ultimately drove the field toward statistical and neural approaches:'
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Brittleness</strong>: A single missing rule, a slightly misspelled predicate, or an unanticipated edge case can cause the entire reasoning chain to fail silently or produce incorrect results. Symbolic systems have no graceful degradation.',
        '<strong>The Frame Problem</strong>: Formulated by McCarthy and Hayes (1969), this asks: how do you formally specify <em>what does not change</em> when an action occurs? In a world with millions of properties, writing explicit frame axioms for every action becomes combinatorially intractable.',
        '<strong>The Qualification Problem</strong>: Closely related, this asks: how do you enumerate every precondition that must hold for an action to succeed? In the real world, the list is essentially infinite — a robot cannot pour water if the cup has a hole, if gravity is reversed, if the water is frozen, etc.',
        '<strong>No Handling of Noise</strong>: Symbolic logic operates in a binary True/False universe. It does not naturally handle the uncertainty, ambiguity, and noise present in real-world sensory data like audio waveforms, image pixels, or natural language text.',
        '<strong>The Knowledge Acquisition Bottleneck</strong>: All knowledge must be manually encoded by human experts. There is no mechanism for learning from data — every fact and rule must be explicitly programmed.'
      ]
    },
    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'warning',
      content: 'These limitations motivated two major alternative paradigms: <strong>probabilistic reasoning</strong> (to handle uncertainty mathematically) and <strong>connectionist neural networks</strong> (to learn patterns directly from noisy, unstructured data). Yet symbolic methods have not disappeared — they are experiencing a renaissance through <strong>neuro-symbolic</strong> hybrid systems that combine the best of both worlds.'
    },

    // ── Section 6: Legacy and Modern Revival ──
    {
      type: 'section',
      id: 'sec-6',
      title: '6. Legacy and Modern Revival'
    },
    {
      type: 'paragraph',
      id: 'p-13',
      content: 'The symbolic tradition\'s emphasis on <em>explainability</em>, <em>compositionality</em>, and <em>formal guarantees</em> remains deeply relevant today. Modern AI safety research often calls for exactly the properties that symbolic systems provide: the ability to audit reasoning chains, verify logical consistency, and guarantee that certain constraints are never violated.'
    },
    {
      type: 'paragraph',
      id: 'p-14',
      content: 'SAT solvers (satisfiability solvers) and SMT solvers (Satisfiability Modulo Theories) — direct descendants of Robinson\'s resolution principle — are now among the most powerful tools in hardware verification, compiler optimization, and automated planning. They solve Boolean constraint problems with billions of variables in seconds, powering everything from CPU design validation to airline scheduling.'
    },
    {
      type: 'paragraph',
      id: 'p-15',
      content: 'As we will explore in later sections, the frontier of AI reasoning is increasingly <strong>neuro-symbolic</strong>: using neural networks to parse and understand messy real-world inputs, then compiling those understandings into formal symbolic representations that can be executed, verified, and explained with mathematical certainty.'
    },

    // ── References & Further Reading ──
    {
      type: 'section',
      id: 'sec-7',
      title: 'References & Further Reading'
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence',
      url: 'https://en.wikipedia.org/wiki/Dartmouth_workshop',
      authors: 'McCarthy, Minsky, Rochester & Shannon',
      venue: 'Dartmouth Workshop',
      year: '1956',
      description: 'The founding document of AI as a field.'
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I',
      url: 'https://doi.org/10.1145/367177.367199',
      authors: 'McCarthy',
      venue: 'Communications of the ACM',
      year: '1960',
      description: 'Introduces LISP and symbolic computation foundations.'
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'Computer Science as Empirical Inquiry: Symbols and Search',
      url: 'https://doi.org/10.1145/360018.360022',
      authors: 'Newell & Simon',
      venue: 'Communications of the ACM',
      year: '1976',
      description: 'Presents the Physical Symbol System Hypothesis.'
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'A Machine-Oriented Logic Based on the Resolution Principle',
      url: 'https://doi.org/10.1145/321250.321253',
      authors: 'Robinson',
      venue: 'Journal of the ACM',
      year: '1965',
      description: 'Unifies inference into a single mechanizable resolution rule.'
    },
    {
      type: 'reference',
      id: 'r-5',
      title: 'DENDRAL and Meta-DENDRAL: Their Applications Dimension',
      url: 'https://doi.org/10.1016/0004-3702(78)90010-2',
      authors: 'Buchanan & Feigenbaum',
      venue: 'Artificial Intelligence',
      year: '1978',
      description: 'Pioneering expert system for chemical structure inference.'
    },
    {
      type: 'reference',
      id: 'r-6',
      title: 'Computer-Based Medical Consultations: MYCIN',
      url: 'https://doi.org/10.1016/B978-0-444-00179-5.X5001-X',
      authors: 'Shortliffe',
      venue: 'Elsevier',
      year: '1976',
      description: 'Landmark rule-based expert system for medical diagnosis.'
    },
    {
      type: 'reference',
      id: 'r-7',
      title: 'The Birth of Prolog',
      url: 'https://doi.org/10.1145/154766.155362',
      authors: 'Colmerauer & Roussel',
      venue: 'Communications of the ACM',
      year: '1993',
      description: 'History of the creation of the Prolog logic programming language.'
    },
    {
      type: 'reference',
      id: 'r-8',
      title: 'Some Philosophical Problems from the Standpoint of Artificial Intelligence',
      url: 'http://www-formal.stanford.edu/jmc/mcchay69.pdf',
      authors: 'McCarthy & Hayes',
      venue: 'Machine Intelligence',
      year: '1969',
      description: 'Introduces the Frame Problem and foundational AI philosophy.'
    }
  ]
};
