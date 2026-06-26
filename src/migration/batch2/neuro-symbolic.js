export const pageData = {
  route: 'concept:reasoning-neuro-symbolic',
  urlPath: '/concepts/reasoning/neuro-symbolic',
  status: 'published',
  meta: {
    title: 'Neuro-Symbolic Reasoning',
    subtitle: 'The hybrid frontier of AI: combining the perceptual power of neural networks with the logical rigor of symbolic engines. By translating neural outputs into executable symbolic representations, hybrid systems reason with mathematical precision while retaining the ability to learn from raw, unstructured data.',
    category: 'concept',
    subcategory: 'Reasoning',
    route: 'concept:reasoning-neuro-symbolic',
    ready: true,
  },
  blocks: [
    // ── Section 1: Two Systems of Thought ──
    {
      type: 'section',
      id: 'sec-1',
      title: '1. Two Systems of Thought',
    },
    {
      type: 'paragraph',
      id: 'p-1',
      content: 'In cognitive psychology, Daniel Kahneman\'s framework distinguishes between <strong>System 1</strong> (fast, automatic, intuitive) and <strong>System 2</strong> (slow, deliberate, logical) thinking. Modern AI mirrors this distinction remarkably well: neural networks embody System 1 — they process inputs quickly and intuitively through learned pattern matching — while classical symbolic logic embodies System 2 — slow, methodical, and provably correct.',
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content: 'The fundamental insight of neuro-symbolic AI is that these two systems are <em>complementary, not competing</em>. Rather than trying to force a single neural network to do everything (including precise arithmetic, logical deduction, and formal verification), neuro-symbolic architectures use the neural component to <strong>perceive and interpret</strong>, and the symbolic component to <strong>reason and verify</strong>.',
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content: 'This division of labor maps directly to what each system does best. Neural networks excel at handling ambiguity, noise, and unstructured inputs (images, speech, natural language). Symbolic engines excel at precision, compositionality, and guarantees. Together, they cover each other\'s weaknesses.',
    },

    // ── Section 2: A Taxonomy of Integration ──
    {
      type: 'section',
      id: 'sec-2',
      title: '2. A Taxonomy of Integration',
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content: 'Kautz (2022) proposed a taxonomy of neuro-symbolic integration strategies, ranging from loose coupling to deep fusion:',
    },
    {
      type: 'prop-table',
      id: 'pt-1',
      rows: [
        ['Type 1: Sequential Pipeline', 'Neural model produces structured output (e.g., SQL, code, logical form), which is then executed by a symbolic engine. <strong>Example</strong>: Text-to-SQL systems, LLM code generation.'],
        ['Type 2: Symbolic Loss', 'Symbolic constraints are incorporated into the neural network\'s loss function during training, ensuring the model learns to satisfy logical rules. <strong>Example</strong>: DeepProbLog, Logic Tensor Networks.'],
        ['Type 3: Neural Theorem Proving', 'Neural networks guide the search process of a symbolic theorem prover, selecting which proof steps to try next. <strong>Example</strong>: AlphaProof, HyperTree Proof Search.'],
        ['Type 4: Neural Architecture with Symbolic Structure', 'The neural architecture itself is designed to mirror symbolic reasoning patterns (e.g., graph neural networks over knowledge graphs). <strong>Example</strong>: Neural Module Networks.'],
      ],
    },

    // ── Section 3: DeepProbLog ──
    {
      type: 'section',
      id: 'sec-3',
      title: '3. DeepProbLog: Differentiable Logic Programming',
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content: 'A landmark in neuro-symbolic research is <strong>DeepProbLog</strong>, introduced by Robin Manhaeve et al. at NeurIPS 2018. DeepProbLog extends the ProbLog probabilistic logic programming language by allowing <strong>neural predicates</strong> — logical predicates whose truth values are predicted by neural networks rather than looked up in a database.',
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content: 'Consider a task to add two handwritten digits. A purely neural approach would need to learn addition from pixel patterns — requiring enormous training data and still failing on unseen digit combinations. DeepProbLog separates concerns: a neural network classifies each digit image into a probability distribution over 0–9, and a logic program performs the addition:',
    },
    {
      type: 'code-block',
      id: 'cb-1',
      label: 'problog',
      content: 'nn(digit_classifier, [Image], Digit) :: digit(Image, Digit).\n\naddition(Img1, Img2, Sum) :-\n    digit(Img1, D1),\n    digit(Img2, D2),\n    Sum is D1 + D2.',
    },
    {
      type: 'paragraph',
      id: 'p-6',
      content: 'The crucial innovation: because ProbLog\'s inference is differentiable with respect to the neural network\'s output probabilities, <strong>gradients flow end-to-end</strong> from the logical loss (did we get the sum right?) back through the digit classifier. The neural network learns to classify digits correctly <em>without ever seeing digit labels</em> — only addition labels!',
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content: 'This is sometimes called <strong>indirect supervision</strong>: the symbolic program provides the learning signal that teaches the neural network, eliminating the need for expensive manual annotation.',
    },

    // ── Section 4: Tool-Augmented Language Models ──
    {
      type: 'section',
      id: 'sec-4',
      title: '4. Tool-Augmented Language Models',
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content: 'The most commercially impactful form of neuro-symbolic AI today is <strong>tool-augmented LLMs</strong>. Instead of asking a language model to perform arithmetic, database queries, or code execution internally (where it is unreliable), the model is trained to emit structured <strong>tool calls</strong> that delegate computation to external symbolic systems.',
    },
    {
      type: 'paragraph',
      id: 'p-8',
      content: 'Schick et al. (2023) formalized this in <strong>Toolformer</strong>, showing that language models can learn <em>when</em> and <em>how</em> to call external APIs (calculators, search engines, translators) by inserting API calls into their text generation. Gao et al. (2023) introduced <strong>PAL (Program-Aided Language Models)</strong>, where the LLM generates Python code to solve math problems, then executes the code in a sandboxed interpreter.',
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'tip',
      content: 'PAL demonstrated that simply asking an LLM to <em>write code</em> that solves a math problem — rather than solving it directly — improved accuracy dramatically. The neural model handles language understanding; Python handles the math.',
    },

    // ── Section 5: Interactive Database Compiler ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. Interactive Database Compiler',
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content: 'The Text-to-SQL pattern is one of the most mature examples of neuro-symbolic reasoning in production systems. Large language models translate natural language questions into formal SQL statements, which are then executed by standard database engines with guaranteed correctness.',
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content: 'Try the interactive demo below: select a question and observe how the neural interpretation phase produces a structured SQL query, which the symbolic execution phase applies deterministically to the database table.',
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'TextToSqlCompiler',
    },

    // ── Section 6: Key Advantages and Open Challenges ──
    {
      type: 'section',
      id: 'sec-6',
      title: '6. Key Advantages and Open Challenges',
    },
    {
      type: 'paragraph',
      id: 'p-11',
      content: 'Neuro-symbolic systems offer compelling advantages over either pure neural or pure symbolic approaches:',
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Out-of-distribution generalization</strong>: Once compiled into symbolic form, a query or program runs correctly on inputs of any size, bypassing the scaling limits of neural computation.',
        '<strong>Full explainability</strong>: The compiled program (SQL, Python, logical proof) is explicit and inspectable, making error auditing straightforward.',
        '<strong>Parameter efficiency</strong>: Because heavy reasoning is offloaded to symbolic engines, the neural component can remain smaller and requires less training data.',
        '<strong>Formal verification</strong>: Symbolic outputs can be checked against formal specifications — a critical requirement for safety-critical applications in medicine, law, and finance.',
      ],
    },
    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'warning',
      content: 'The key open challenge is <strong>compilation reliability</strong>: if the neural model generates incorrect symbolic output (wrong SQL, buggy code, invalid logical form), the symbolic engine will execute it faithfully — <em>producing a precisely wrong answer</em>. Ensuring the neural-to-symbolic translation is robust remains an active research frontier.',
    },

    // ── References ──
    {
      type: 'section',
      id: 'sec-7',
      title: 'References & Further Reading',
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'Thinking, Fast and Slow',
      url: 'https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow',
      authors: 'Daniel Kahneman',
      venue: 'Book',
      year: '2011',
      description: 'Foundational framework on dual-process theory (System 1 vs System 2) that motivates the neuro-symbolic paradigm.',
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'The Third AI Summer',
      url: 'https://doi.org/10.1002/aaai.12036',
      authors: 'Henry Kautz',
      venue: 'AAAI Robert S. Engelmore Memorial Lecture',
      year: '2022',
      description: 'Proposed a taxonomy of neuro-symbolic integration strategies.',
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'DeepProbLog: Neural Probabilistic Logic Programming',
      url: 'https://arxiv.org/abs/1805.10872',
      authors: 'Robin Manhaeve et al.',
      venue: 'NeurIPS',
      year: '2018',
      description: 'Integrates neural predicates into probabilistic logic programs with end-to-end differentiable inference.',
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'Toolformer: Language Models Can Teach Themselves to Use Tools',
      url: 'https://arxiv.org/abs/2302.04761',
      authors: 'Timo Schick et al.',
      venue: 'arXiv',
      year: '2023',
      description: 'Demonstrates self-supervised learning of API tool usage within language model text generation.',
    },
    {
      type: 'reference',
      id: 'r-5',
      title: 'PAL: Program-Aided Language Models',
      url: 'https://arxiv.org/abs/2211.10435',
      authors: 'Luyu Gao et al.',
      venue: 'arXiv',
      year: '2023',
      description: 'Offloads mathematical reasoning to generated Python code executed in a sandboxed interpreter.',
    },
  ],
};
