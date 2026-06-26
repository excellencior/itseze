export const pageData = {
  route: 'concept:activation-functions',
  urlPath: '/concepts/activation-functions',
  status: 'published',
  meta: {
    title: 'Activation Functions',
    subtitle: 'These are the nonlinear transformations that give neural networks the power to learn complex patterns. Without them, any network, no matter how deep, collapses into a single linear function.',
    category: 'concept',
    subcategory: null,
    route: 'concept:activation-functions',
    ready: true,
  },
  blocks: [
    // ── Section 1: Why Do We Need Activation Functions? ──
    { type: 'section', id: 'sec-1', title: 'Why Do We Need Activation Functions?' },
    { type: 'paragraph', id: 'p-1', content: 'Consider stacking linear layers without any activation:' },
    { type: 'math-box', id: 'm-1', expression: "f(x) = W_3(W_2(W_1 x + b_1) + b_2) + b_3 = W'x + b'" },
    {
      type: 'paragraph',
      id: 'p-2',
      content:
        'No matter how many layers you stack, the result is always a single matrix multiply. A 96 layer GPT-3 would be mathematically identical to a 1 layer network. Activation functions <strong>break this linearity</strong>, allowing the network to learn curved decision boundaries and complex, hierarchical features.',
    },
    { type: 'custom-element', id: 'w-1', name: 'LinearCollapseViz' },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content:
        'Activation functions are placed <strong>between linear transformations</strong> in every MLP block: Linear → <strong>Activation</strong> → Linear. They are the source of all nonlinear power.',
    },

    // ── Section 2: Sigmoid ──
    { type: 'section', id: 'sec-2', title: '1. Sigmoid (Logistic)' },
    { type: 'math-box', id: 'm-2', expression: '\\sigma(x) = \\frac{1}{1 + e^{-x}}' },
    {
      type: 'prop-table',
      id: 'pt-1',
      rows: [
        ['Output range', '(0, 1)'],
        ['Zero-centered?', '❌ No, outputs are always positive'],
        ['Max gradient', '0.25 (at x = 0)'],
        ['Saturates?', '✅ Yes, gradient → 0 for |x| > 5'],
      ],
    },
    { type: 'custom-element', id: 'w-2', name: 'FunctionPlot', props: { title: 'Sigmoid and its derivative', functions: 'σ(x), σ\'(x)' } },
    {
      type: 'paragraph',
      id: 'p-3',
      content:
        "The sigmoid squashes any real-valued input into the (0, 1) range. Crucially, it isn't just an arbitrary bounding function—it is the mathematical inverse of the logit function. If a network outputs the log-odds (logits) of a binary event, passing them through a sigmoid rigorously converts them into a true probability.",
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content:
        '<Highlight>However, as a hidden layer activation, it has a fatal flaw. Take a look at its derivative (the dashed line). It peaks at just <strong>0.25</strong> and rapidly drops to zero on both sides.</Highlight> In a deep network, gradients get multiplied through every layer via the chain rule, and each one is capped at a quarter. This causes the infamous <strong>vanishing gradient problem</strong>.',
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'warning',
      content:
        '<strong>Vanishing gradients:</strong> After 10 layers of sigmoid, the gradient is at most 0.25¹⁰ ≈ 0.000001. The early layers essentially stop learning entirely.',
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content:
        '<strong>Where it\'s still used:</strong> Binary classification output layers, and gates in LSTMs and GRUs where the 0 to 1 range is deliberately needed as a "gate".',
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'accent',
      content:
        "<strong>Interesting twist:</strong> Sigmoid's \"flaws\" are actually <strong>features</strong> here. A gate <em>needs</em> outputs between 0 and 1 to work as a <strong>learned valve</strong>. And as the final layer, there's nowhere left for gradients to vanish <em>through</em>.",
    },

    // ── Section 3: Tanh ──
    { type: 'section', id: 'sec-3', title: '2. Tanh (Hyperbolic Tangent)' },
    { type: 'math-box', id: 'm-3', expression: '\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}} = 2\\sigma(2x) - 1' },
    {
      type: 'prop-table',
      id: 'pt-2',
      rows: [
        ['Output range', '(-1, 1)'],
        ['Zero-centered?', '✅ Yes'],
        ['Max gradient', '1.0 (at x = 0)'],
        ['Saturates?', '✅ Yes, gradient → 0 at extremes'],
      ],
    },
    { type: 'custom-element', id: 'w-3', name: 'FunctionPlot', props: { title: 'Tanh and its derivative', functions: "tanh(x), tanh'(x)" } },
    {
      type: 'paragraph',
      id: 'p-6',
      content:
        'Think of tanh as a rescaled sigmoid. It\'s centered around zero and has stronger gradients, peaking at 1.0 instead of 0.25. That means gradients flow about 4× better through each layer. The catch is that it still saturates at the extremes, so deep networks will still run into vanishing gradients, just not as quickly.',
    },
    { type: 'custom-element', id: 'w-4', name: 'GradientDecayViz' },
    {
      type: 'paragraph',
      id: 'p-7',
      content: '<strong>Where it\'s used:</strong> LSTM cell states, some RNN architectures, and normalization outputs.',
    },

    // ── Section 4: ReLU ──
    { type: 'section', id: 'sec-4', title: '3. ReLU (Rectified Linear Unit)' },
    { type: 'math-box', id: 'm-4', expression: '\\text{ReLU}(x) = \\max(0, x)' },
    {
      type: 'prop-table',
      id: 'pt-3',
      rows: [
        ['Output range', '[0, ∞)'],
        ['Gradient for x > 0', '1 (constant, never vanishes!)'],
        ['Gradient for x < 0', '0 (completely dead)'],
        ['Computational cost', 'Extremely cheap, just a comparison'],
      ],
    },
    { type: 'custom-element', id: 'w-5', name: 'FunctionPlot', props: { title: 'ReLU and its derivative', functions: "ReLU(x), ReLU'(x)" } },
    {
      type: 'paragraph',
      id: 'p-8',
      content:
        "<Highlight>ReLU was the breakthrough that enabled deep learning.</Highlight> For positive inputs, the gradient is always exactly 1, so it never vanishes no matter how deep the network goes. It's also incredibly cheap to compute since it's just a max operation. This simplicity is what enabled training networks like AlexNet, VGG, and ResNet that were previously impossible with sigmoid or tanh.",
    },
    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'warning',
      content:
        "<strong>Dying ReLU problem:</strong> If a neuron's weights shift so that its input is always negative, the gradient becomes permanently zero. That neuron is \"dead\" and can never recover. In practice, up to 20 to 40% of neurons can die during training.",
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content: "<strong>Example:</strong> Say a neuron computes <code>ReLU(w·x + b)</code>. Here's exactly how it dies:",
    },
    {
      type: 'heading',
      id: 'h-1',
      level: 4,
      text: 'Step 1: A bad gradient update',
    },
    {
      type: 'math-box',
      id: 'm-5',
      expression: 'w \\leftarrow w - \\eta \\cdot \\nabla L \\quad \\Rightarrow \\quad w = -3.2, \\; b = -1.5',
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content: 'A large learning rate or unlucky gradient pushes the weights deeply negative.',
    },
    {
      type: 'heading',
      id: 'h-2',
      level: 4,
      text: 'Step 2: Next input arrives',
    },
    {
      type: 'math-box',
      id: 'm-6',
      expression: 'z = w \\cdot x + b = (-3.2)(0.8) + (-1.5) = -4.06',
    },
    {
      type: 'paragraph',
      id: 'p-11',
      content: '<Latex>\\text{ReLU}(-4.06) = \\max(0,\\, -4.06)</Latex> = <strong style="color: #EF4444">0</strong>',
    },
    {
      type: 'paragraph',
      id: 'p-12',
      content: 'The pre-activation is negative, so ReLU <strong>kills the output entirely</strong>.',
    },
    {
      type: 'heading',
      id: 'h-3',
      level: 4,
      text: 'Step 3: Gradient is zero. Forever.',
    },
    {
      type: 'math-box',
      id: 'm-7',
      expression: '\\frac{\\partial \\text{ReLU}}{\\partial z} = 0 \\quad \\text{(since } z < 0\\text{)}',
    },
    {
      type: 'math-box',
      id: 'm-8',
      expression: '\\Rightarrow \\; \\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial z} \\cdot \\underbrace{\\frac{\\partial \\text{ReLU}}{\\partial z}}_{= \\, 0} \\cdot x = 0',
    },
    {
      type: 'math-box',
      id: 'm-9',
      expression: '\\Rightarrow \\; \\Delta w = -\\eta \\cdot 0 = 0',
    },
    {
      type: 'paragraph',
      id: 'p-13',
      content: "The weight <strong>never changes</strong>. The neuron outputs zero for every future input. It's dead.",
    },

    // ── Section 5: Leaky ReLU & Variants ──
    { type: 'section', id: 'sec-5', title: '4. Leaky ReLU & Variants' },
    {
      type: 'math-box',
      id: 'm-10',
      expression: '\\text{LeakyReLU}(x) = \\begin{cases} x & \\text{if } x > 0 \\\\ \\alpha x & \\text{if } x \\leq 0 \\end{cases} \\quad (\\alpha = 0.01)',
    },
    { type: 'custom-element', id: 'w-6', name: 'FunctionPlot', props: { title: 'ReLU vs Leaky ReLU vs ELU', functions: 'ReLU, Leaky ReLU, ELU' } },
    {
      type: 'paragraph',
      id: 'p-14',
      content:
        '<Highlight>Leaky ReLU fixes the dying neuron problem by giving a small slope (α = 0.01) to negative inputs.</Highlight> The gradient is never zero — dead neurons can always recover. <HoverCard term="PReLU" position="above">Unlike Leaky ReLU where <strong>α = 0.01</strong> is fixed, PReLU makes <strong>α a learnable parameter</strong> that the network optimizes during training. Each channel can learn its own slope.</HoverCard> (Parametric ReLU) makes α a learnable parameter. <HoverCard term="ELU" position="above">The exponential curve for negative values makes ELU <strong>smooth at x = 0</strong> (unlike ReLU\'s sharp corner) and pushes mean activations <strong>closer to zero</strong>, which speeds up convergence.</HoverCard> uses an exponential curve for negative values, making it smooth at zero and pushing mean activations closer to zero.',
    },

    // ── Section 6: GELU ──
    { type: 'section', id: 'sec-6', title: '5. GELU (Gaussian Error Linear Unit) ⭐' },
    {
      type: 'math-box',
      id: 'm-11',
      expression: '\\text{GELU}(x) = x \\cdot \\Phi(x) \\approx 0.5x\\left(1 + \\tanh\\left[\\sqrt{\\frac{2}{\\pi}}\\left(x + 0.044715x^3\\right)\\right]\\right)',
    },
    {
      type: 'prop-table',
      id: 'pt-4',
      rows: [
        ['Output range', '≈ (-0.17, ∞)'],
        ['Smooth?', '✅ Everywhere differentiable'],
        ['Key insight', 'Probabilistically gates values instead of hard-thresholding'],
        ['Used in', 'GPT-2, GPT-3, BERT, ViT, most transformers'],
      ],
    },
    { type: 'custom-element', id: 'w-7', name: 'FunctionPlot', props: { title: 'GELU vs ReLU, notice the smooth transition near zero', functions: "GELU, GELU', ReLU" } },
    {
      type: 'paragraph',
      id: 'p-15',
      content:
        '<Highlight>GELU is the default activation in modern transformers.</Highlight> Instead of the hard cutoff that ReLU uses at zero, GELU essentially asks: <em>"How likely is this input to be positive?"</em> and scales the value by that probability. So small negative values still get a small negative output rather than being zeroed out completely. It creates a smooth, probabilistic gate.',
    },
    {
      type: 'callout',
      id: 'c-5',
      calloutType: 'tip',
      content:
        '<strong>Why smooth matters:</strong> Because the curve is smooth, the gradient transitions gradually instead of jumping from 0 to 1. This gives the optimizer much more nuanced information about the loss landscape, which leads to better convergence during training.',
    },
    {
      type: 'paragraph',
      id: 'p-16',
      content:
        'If you look at the plot, notice how GELU dips slightly below zero around x ≈ −0.5. This non monotonic behavior acts as a built in regularizer, similar to dropout.',
    },

    // ── Section 7: SiLU / Swish ──
    { type: 'section', id: 'sec-7', title: '6. SiLU / Swish' },
    {
      type: 'math-box',
      id: 'm-12',
      expression: '\\text{SiLU}(x) = x \\cdot \\sigma(x) = \\frac{x}{1 + e^{-x}}',
    },
    { type: 'custom-element', id: 'w-8', name: 'FunctionPlot', props: { title: 'SiLU/Swish vs GELU, remarkably similar shapes', functions: "SiLU/Swish, SiLU', GELU" } },
    {
      type: 'paragraph',
      id: 'p-17',
      content:
        'This one has an interesting origin story. Google Brain discovered it through <strong>automated search</strong> (<HoverCard term="NAS" position="below">A technique where a <strong>search algorithm</strong> (often reinforcement learning or evolutionary methods) automatically explores the space of possible neural network designs to find optimal architectures, instead of relying on human intuition. — Zoph & Le, "Neural Architecture Search with Reinforcement Learning" (2017)</HoverCard>) over the space of possible activation functions. What it does is multiply the input by its own sigmoid, which is a form of <em>self gating</em>. Essentially, the input decides how much of itself to let through.',
    },
    {
      type: 'paragraph',
      id: 'p-18',
      content:
        'SiLU and GELU are nearly identical in shape, but SiLU dips a bit deeper below zero (about −0.28 compared to −0.17 for GELU). Both consistently outperform ReLU in benchmarks across vision and language tasks.',
    },

    // ── Section 8: SwiGLU ──
    { type: 'section', id: 'sec-8', title: '7. SwiGLU (Gated Linear Units) ⭐' },
    {
      type: 'math-box',
      id: 'm-13',
      expression: '\\text{SwiGLU}(x) = \\text{SiLU}(xW_1) \\otimes (xW_2)',
    },
    {
      type: 'callout',
      id: 'c-6',
      calloutType: 'tip',
      content:
        '<strong>Current state of the art.</strong> Used in LLaMA 2/3, PaLM, Gemini, Mistral, and Mixtral. SwiGLU is the dominant activation in modern large language models.',
    },
    {
      type: 'paragraph',
      id: 'p-19',
      content:
        'Instead of applying a single nonlinearity, GLU variants project the input <strong>twice</strong>. One path becomes the "content" and the other becomes a "gate". The gate (processed through SiLU) controls how much content passes through using element wise multiplication (⊗).',
    },
    {
      type: 'paragraph',
      id: 'p-20',
      content:
        'This is more expressive than a single activation because the network actually learns <em>what information to keep</em> at each position. The trade off is that it requires an extra weight matrix (W₂), which increases the parameter count by roughly 33% in the MLP block.',
    },
    {
      type: 'math-box',
      id: 'm-14',
      expression: '\\text{Variants:}',
      variants: [
        { expression: '\\text{GLU: } \\sigma(xW_1) \\otimes (xW_2)', note: 'the original, using a sigmoid gate' },
        { expression: '\\text{GeGLU: } \\text{GELU}(xW_1) \\otimes (xW_2)', note: 'used in some T5 variants' },
        { expression: '\\text{SwiGLU: } \\text{SiLU}(xW_1) \\otimes (xW_2)', note: 'the current state of the art' },
      ],
    },

    // ── Section 9: Interactive Comparison ──
    { type: 'section', id: 'sec-9', title: 'Interactive Comparison' },
    {
      type: 'paragraph',
      id: 'p-21',
      content:
        'Overlay multiple activation functions to see how they relate. Hover over the plot to compare exact values at any input.',
    },
    {
      type: 'tabs',
      id: 't-1',
      tabs: [
        { label: 'Classic (Sigmoid, Tanh, ReLU)', content: 'FunctionPlot with Sigmoid, Tanh, ReLU' },
        { label: 'Modern (ReLU, GELU, SiLU)', content: 'FunctionPlot with ReLU, GELU, SiLU' },
        { label: 'All Functions', content: 'FunctionPlot with Sigmoid, Tanh, ReLU, GELU, SiLU' },
      ],
    },
    { type: 'custom-element', id: 'w-9', name: 'FunctionPlot', props: { title: 'Interactive comparison (tabbed)', functions: 'Classic / Modern / All' } },

    // ── Section 10: The Evolution ──
    { type: 'section', id: 'sec-10', title: 'The Evolution' },
    {
      type: 'list',
      id: 'l-1',
      listType: 'ordered',
      items: [
        '<strong>1960s — Sigmoid:</strong> Inspired by biological neurons. First practical activation.',
        '<strong>1990s — Tanh:</strong> Zero-centered, 4× stronger gradients. Standard for RNNs.',
        '<strong>2010 — ReLU:</strong> Enabled deep learning revolution. AlexNet (2012) breakthrough.',
        '<strong>2015 — Leaky/PReLU:</strong> Fixed dying neurons. Small but meaningful improvement.',
        '<strong>2016 — GELU:</strong> Smooth probabilistic gating. Became transformer default.',
        '<strong>2017 — Swish/SiLU:</strong> Discovered by AutoML. Self-gating mechanism.',
        '<strong>2020 — SwiGLU:</strong> Current SOTA. Powers LLaMA, PaLM, Gemini, Mistral.',
      ],
    },

    // ── Section 11: Quick Reference ──
    { type: 'section', id: 'sec-11', title: 'Quick Reference' },
    {
      type: 'prop-table',
      id: 'pt-5',
      headers: ['Function', 'Range', 'Smooth', 'Zero-centered', 'Era'],
      rows: [
        ['Sigmoid', '(0, 1)', '✅', '❌', 'Legacy'],
        ['Tanh', '(-1, 1)', '✅', '✅', 'Legacy'],
        ['ReLU', '[0, ∞)', '❌', '❌', 'CNNs'],
        ['Leaky ReLU', '(-∞, ∞)', '❌', '~Yes', 'CNNs'],
        ['GELU', '(-0.17, ∞)', '✅', '~Yes', 'Transformers'],
        ['SiLU/Swish', '(-0.28, ∞)', '✅', '~Yes', 'LLMs'],
        ['SwiGLU', 'varies', '✅', '~Yes', 'SOTA'],
      ],
    },

    // ── Section 12: References ──
    { type: 'section', id: 'sec-12', title: 'References & Further Reading' },
    {
      type: 'paragraph',
      id: 'p-22',
      content: 'The original papers and some of the best resources for going deeper into activation functions.',
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'Gaussian Error Linear Units (GELUs)',
      url: 'https://arxiv.org/abs/1606.08415',
      authors: 'Dan Hendrycks & Kevin Gimpel',
      venue: 'arXiv',
      year: '2016',
      description: 'The original GELU paper.',
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'Searching for Activation Functions',
      url: 'https://arxiv.org/abs/1710.05941',
      authors: 'Ramachandran, Zoph & Le',
      venue: 'arXiv',
      year: '2017',
      description: 'The paper that discovered Swish/SiLU via NAS.',
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'GLU Variants Improve Transformer',
      url: 'https://arxiv.org/abs/2002.05202',
      authors: 'Noam Shazeer',
      venue: 'arXiv',
      year: '2020',
      description: 'Introduced SwiGLU and benchmarked GLU variants.',
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'Delving Deep into Rectifiers (PReLU)',
      url: 'https://arxiv.org/abs/1502.01852',
      authors: 'He et al.',
      venue: 'arXiv',
      year: '2015',
      description: 'Parametric ReLU and the Kaiming initialization.',
    },
    {
      type: 'reference',
      id: 'r-5',
      title: 'Stanford CS231n: Activation Functions',
      url: 'https://cs231n.github.io/neural-networks-1/#actfun',
      authors: 'Andrej Karpathy',
      venue: 'Stanford CS231n',
      year: '',
      description: "Excellent visual walkthrough from Andrej Karpathy's Stanford course.",
    },
    {
      type: 'reference',
      id: 'r-6',
      title: 'PyTorch: Non-linear Activations',
      url: 'https://pytorch.org/docs/stable/nn.html#non-linear-activations-weighted-sum-nonlinearity',
      authors: 'PyTorch',
      venue: 'PyTorch Documentation',
      year: '',
      description: 'Official PyTorch docs with implementation details and API.',
    },
    {
      type: 'reference',
      id: 'r-7',
      title: 'Deep Learning Book, Ch. 6: MLPs',
      url: 'https://www.deeplearningbook.org/contents/mlp.html',
      authors: 'Goodfellow, Bengio & Courville',
      venue: 'Deep Learning Book',
      year: '',
      description: 'Foundational textbook chapter on hidden units.',
    },

    // ── AI Disclosure ──
    {
      type: 'callout',
      id: 'c-7',
      calloutType: 'info',
      content:
        '<strong>A note on this article:</strong> This post was written with the help of AI. All content has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date as of 2025.',
    },
  ],
};
