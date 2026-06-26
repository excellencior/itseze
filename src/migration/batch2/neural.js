export const pageData = {
  route: 'concept:reasoning-neural',
  urlPath: '/concepts/reasoning/neural',
  status: 'published',
  meta: {
    title: 'Neural (Connectionist) Reasoning',
    subtitle: 'Implicit patterns, soft weights, and distributed activations. Connectionist networks reason by routing activations through billions of learned parameters, extracting concepts from statistical associations rather than formal rules — and in doing so, they achieve feats that symbolic systems never could.',
    category: 'concept',
    subcategory: 'Reasoning',
    route: 'concept:reasoning-neural',
    ready: true,
  },
  blocks: [
    // ── Section 1: From Neurons to Networks ──
    {
      type: 'section',
      id: 'sec-1',
      title: '1. From Neurons to Networks',
    },
    {
      type: 'paragraph',
      id: 'p-1',
      content:
        'The connectionist tradition began with a bold question: can computation emerge from the interaction of simple processing units, the way thought emerges from neurons in the brain? In 1943, Warren McCulloch and Walter Pitts published a landmark paper showing that networks of idealized neurons could compute any logical function, establishing the theoretical foundation for neural computation.',
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content:
        'Frank Rosenblatt\'s <strong>Perceptron</strong> (1958) was the first implemented neural network that could learn from data — adjusting its weights to classify inputs correctly. But the field stalled for decades after Minsky and Papert (1969) proved that single-layer perceptrons could not learn the XOR function, demonstrating fundamental limitations of shallow architectures.',
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content:
        'The breakthrough came in 1986 when Rumelhart, Hinton, and Williams demonstrated that <strong>backpropagation</strong> — propagating error gradients backward through multi-layer networks — could train deep architectures effectively. This simple algorithm is still the engine behind every modern neural network, from image classifiers to trillion-parameter language models.',
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content:
        'The key insight of connectionism is that intelligence need not be programmed explicitly through rules. Instead, it can <em>emerge</em> from the statistical structure of data, captured in the weights of a network trained through gradient descent.',
    },

    // ── Section 2: The Transformer Revolution ──
    {
      type: 'section',
      id: 'sec-2',
      title: '2. The Transformer Revolution',
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content:
        'The modern era of neural reasoning was inaugurated by Vaswani et al. (2017) with the <strong>Transformer architecture</strong>. By replacing sequential recurrence with parallel <strong>self-attention</strong>, Transformers enabled models to relate any token to any other token in constant depth, regardless of their distance in the sequence. The core operation computes:',
    },
    {
      type: 'math-box',
      id: 'm-1',
      expression:
        '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right) V',
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content:
        'Each token produces a <strong>query</strong> (what am I looking for?), a <strong>key</strong> (what do I advertise?), and a <strong>value</strong> (what information do I carry?). The dot product between queries and keys determines how much each token attends to every other, and the result is a weighted sum of values. This mechanism allows the model to dynamically route information based on content, not position.',
    },
    {
      type: 'paragraph',
      id: 'p-6',
      content:
        'Critically, Transformers stack dozens of these attention layers, and each layer progressively builds more abstract representations. Early layers detect syntactic patterns (word order, grammar), middle layers resolve coreferences (who does "it" refer to?), and later layers encode high-level semantic relationships.',
    },

    // ── Section 3: FFNs as Implicit Memory Banks ──
    {
      type: 'section',
      id: 'sec-3',
      title: '3. FFNs as Implicit Memory Banks',
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content:
        'While attention gets the headlines, a growing body of <strong>mechanistic interpretability</strong> research reveals that the feed-forward networks (FFNs) within each Transformer layer play an equally crucial role. Geva et al. (2021) demonstrated that FFN layers function as <strong>key-value memories</strong>: the first weight matrix acts as a pattern detector (key), recognizing specific input features, and the second matrix projects factual information (value) back into the residual stream.',
    },
    {
      type: 'math-box',
      id: 'm-2',
      expression:
        '\\text{FFN}(x) = W_2 \\cdot \\sigma(W_1 \\cdot x + b_1) + b_2',
    },
    {
      type: 'paragraph',
      id: 'p-8',
      content:
        'The implication is profound: when a language model "knows" that the Eiffel Tower is in Paris, that knowledge is not stored in a lookup table — it is distributed across the activation patterns of specific neurons in specific FFN layers. Meng et al. (2022) showed that you can surgically <strong>edit</strong> individual facts in a model by performing rank-one updates to these FFN weight matrices, a technique called <strong>ROME</strong> (Rank-One Model Editing).',
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content:
        'This means neural networks don\'t "reason" the way humans think about reasoning — they retrieve and compose stored associations through continuous-valued computations. Understanding <em>where</em> and <em>how</em> knowledge is encoded is the central goal of mechanistic interpretability.',
    },

    // ── Section 4: Interactive Attention Routing ──
    {
      type: 'section',
      id: 'sec-4',
      title: '4. Interactive Attention Routing',
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content:
        'See this routing in action using the Attention Flow visualizer below. Type any sentence, click a token to select it as the query, and switch between layer depths. Notice how:',
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Layer 1 (Syntax)</strong>: Attention concentrates on immediately adjacent tokens — capturing local bigram and trigram patterns.',
        '<strong>Layer 2 (Relational)</strong>: Content words begin attending to each other across distances, linking subjects to verbs and objects.',
        '<strong>Layer 3 (Semantic)</strong>: Attention strongly favors all content words while largely ignoring function words (the, on, a), creating a global semantic summary.',
      ],
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'AttentionFlowWidget',
    },

    // ── Section 5: Emergent Reasoning Abilities ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. Emergent Reasoning Abilities',
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content:
        'Perhaps the most remarkable aspect of neural reasoning is <strong>emergence</strong>: capabilities that appear abruptly as models scale, without being explicitly trained. Wei et al. (2022) documented that abilities like multi-step arithmetic, analogical reasoning, and code generation appear suddenly once models cross certain parameter thresholds — they are absent in smaller models and present in larger ones, with a sharp transition rather than a gradual improvement.',
    },
    {
      type: 'paragraph',
      id: 'p-11',
      content:
        'This raises a fundamental question: do large language models genuinely <em>reason</em>, or do they merely pattern-match on an astronomically large scale? The answer likely lies somewhere in between. As Elhage et al. (2021) showed through circuit analysis at Anthropic, Transformers develop structured internal algorithms — identifiable circuits that implement specific reasoning steps — but these circuits operate through continuous-valued activations rather than discrete symbolic rules.',
    },

    // ── Section 6: Limitations of Pure Connectionism ──
    {
      type: 'section',
      id: 'sec-6',
      title: '6. Limitations of Pure Connectionism',
    },
    {
      type: 'paragraph',
      id: 'p-12',
      content:
        'Despite their versatility, pure neural models suffer from serious reasoning flaws that remain active areas of research:',
    },
    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Hallucinations</strong>: Neural nets construct answers probabilistically and cannot distinguish verified facts from plausible-sounding falsehoods. The model will generate confident, fluent text even when the underlying claim is entirely fabricated.',
        '<strong>Opacity</strong>: Despite progress in mechanistic interpretability, inspecting activations or weights does not yield a clean logical proof. We can identify <em>what</em> circuits activate, but explaining <em>why</em> they compose a particular answer remains extremely difficult.',
        '<strong>Compositional generalization failure</strong>: Neural models struggle with systematic compositional reasoning — tasks requiring the application of learned rules in novel combinations. A model that learns "A is left of B" and "B is left of C" may fail to infer "A is left of C" if it never saw that exact combination during training.',
        '<strong>Sensitivity to surface form</strong>: Rephrasing a math problem or changing variable names can dramatically alter a model\'s accuracy, suggesting it may rely on surface correlations rather than deep structural understanding.',
      ],
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'accent',
      content:
        'These limitations have driven AI research toward hybridization — combining connectionist flexibility with symbolic precision to create <strong>neuro-symbolic reasoning</strong> systems that can learn from noisy data <em>and</em> guarantee logical correctness.',
    },

    // ── Section 7: References & Further Reading ──
    {
      type: 'section',
      id: 'sec-7',
      title: 'References & Further Reading',
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'A Logical Calculus of the Ideas Immanent in Nervous Activity',
      url: 'https://doi.org/10.1007/BF02478259',
      authors: 'McCulloch, W.S. & Pitts, W.',
      year: '1943',
      description:
        'Foundational paper proving that networks of idealized neurons can compute any logical function.',
    },
    {
      type: 'reference',
      id: 'r-2',
      title:
        'The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain',
      url: 'https://doi.org/10.1037/h0042519',
      authors: 'Rosenblatt, F.',
      year: '1958',
      description:
        'Introduced the first trainable neural network model capable of learning from data.',
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'Learning Representations by Back-Propagating Errors',
      url: 'https://doi.org/10.1038/323533a0',
      authors: 'Rumelhart, D.E., Hinton, G.E., & Williams, R.J.',
      year: '1986',
      description:
        'Demonstrated backpropagation for training multi-layer neural networks.',
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      authors: 'Vaswani, A., et al.',
      year: '2017',
      description:
        'Introduced the Transformer architecture with self-attention replacing recurrence.',
    },
    {
      type: 'reference',
      id: 'r-5',
      title: 'Transformer Feed-Forward Layers Are Key-Value Memories',
      url: 'https://arxiv.org/abs/2012.14913',
      authors: 'Geva, M., et al.',
      year: '2021',
      description:
        'Showed that FFN layers act as key-value memory stores for factual knowledge.',
    },
    {
      type: 'reference',
      id: 'r-6',
      title: 'Locating and Editing Factual Associations in GPT',
      url: 'https://arxiv.org/abs/2202.05262',
      authors: 'Meng, K., et al.',
      year: '2022',
      description:
        'Introduced ROME for surgically editing factual knowledge in language models.',
    },
    {
      type: 'reference',
      id: 'r-7',
      title: 'Emergent Abilities of Large Language Models',
      url: 'https://arxiv.org/abs/2206.07682',
      authors: 'Wei, J., et al.',
      year: '2022',
      description:
        'Documented abilities that appear abruptly as language models scale past certain thresholds.',
    },
    {
      type: 'reference',
      id: 'r-8',
      title: 'A Mathematical Framework for Transformer Circuits',
      url: 'https://transformer-circuits.pub/2021/framework/index.html',
      authors: 'Elhage, N., et al.',
      year: '2021',
      description:
        "Anthropic's mechanistic interpretability framework for understanding Transformer internals.",
    },
  ],
};
