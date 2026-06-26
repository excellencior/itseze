export const pageData = {
  route: 'concept:speculative-decoding',
  urlPath: '/concepts/speculative-decoding',
  status: 'published',
  meta: {
    title: 'Speculative Decoding',
    subtitle: 'How to make large language models generate faster without changing a single weight — by guessing ahead with a small model and verifying in parallel with the big one.',
    category: 'concept',
    subcategory: null,
    route: 'concept:speculative-decoding',
    ready: true,
  },
  blocks: [
    // ── The Latency Wall ──
    { type: 'section', id: 'sec-1', title: 'The Latency Wall' },
    {
      type: 'paragraph',
      id: 'p-1',
      content:
        'Large language models generate text one token at a time. Each token requires a full forward pass through the entire network — every layer, every attention head, every parameter. For GPT-3, that is 175 billion parameters consulted to produce a single word. For Llama 3 405B, it is 405 billion. The arithmetic is sobering: if your model takes 40ms per forward pass, generating a 500-token response takes 20 full seconds of serial computation.',
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content:
        'The cruel irony is that during generation (as opposed to the initial prompt processing), the GPU is <strong>dramatically underutilized</strong>. The model processes just one token at a time, so the computation is <em>memory-bandwidth bound</em>, not compute-bound. The expensive tensor cores sit idle while the system waits for weights to be loaded from memory. You are paying for a supercomputer and using it as a calculator.',
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'warning',
      content:
        '<strong>The core problem:</strong> Autoregressive decoding is inherently sequential. Token <em>n</em> depends on token <em>n−1</em>, which depends on <em>n−2</em>, and so on. You cannot parallelize generation the way you parallelize prompt processing. Or can you?',
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content:
        'This is where <HoverCard term="speculative decoding"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Speculative Decoding</div><div style="color:var(--text-muted);font-size:12px">A technique introduced independently by Leviathan et al. (2023) and Chen et al. (2023) that uses a small <strong>draft model</strong> to propose multiple tokens, which the large <strong>target model</strong> then verifies in a single forward pass. It produces <em>exactly</em> the same output distribution as the target model alone.</div></HoverCard> enters the picture. The key insight is deceptively elegant: <em>verifying a guess is cheaper than making one from scratch</em>.',
    },

    // ── The Core Insight ──
    { type: 'section', id: 'sec-2', title: 'The Core Insight' },
    {
      type: 'paragraph',
      id: 'p-4',
      content:
        'Imagine you are editing a colleague\'s draft essay. Reading through a paragraph and confirming "yes, this is exactly what I would have written" is far faster than composing that paragraph yourself from a blank page. Speculative decoding exploits precisely this asymmetry.',
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content:
        'A small, fast <strong>draft model</strong> (say, 1B parameters) proposes a sequence of <em>K</em> tokens speculatively — it <em>guesses</em> what the large target model would have generated. Then the large target model processes all <em>K</em> draft tokens <strong>in a single forward pass</strong> (just like processing a prompt), verifying each one against its own distribution. If the draft tokens match, you\'ve just generated <em>K</em> tokens for the cost of one large-model forward pass.',
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'InlinePanel',
      description: 'Wraps SpecDecodingWalkthrough widget with open/close toggle',
    },
    {
      type: 'custom-element',
      id: 'w-2',
      name: 'SpecDecodingWalkthrough',
      description: 'Step-by-step walkthrough of one iteration of speculative decoding with 5 tabs: The analogy, Drafter guesses, Big model: one pass, Checking each position, Rejection → result',
    },
    {
      type: 'prop-table',
      id: 'pt-1',
      rows: [
        ['Without Speculative Decoding', 'Generate 5 tokens → <strong>5 serial forward passes</strong> through the 70B model.<br>Each pass: ~40ms. Total: ~200ms.'],
        ['With Speculative Decoding', 'Draft model proposes 5 tokens → <strong>1 forward pass</strong> through 70B to verify all 5.<br>Draft: ~5ms. Verify: ~42ms. Total: ~47ms. <strong>~4× faster.</strong>'],
      ],
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'tip',
      content:
        '<strong>The beautiful guarantee:</strong> Speculative decoding is <strong>lossless</strong>. The output distribution is mathematically identical to running the target model alone. No approximation, no quality loss, no changed behavior. It is pure speed, free of charge.',
    },

    // ── The Algorithm, Step by Step ──
    { type: 'section', id: 'sec-3', title: 'The Algorithm, Step by Step' },
    {
      type: 'paragraph',
      id: 'p-6',
      content:
        'The algorithm operates in a loop. Each iteration has two phases: <strong>drafting</strong> (the small model guesses) and <strong>verification</strong> (the large model checks). Let us trace through one iteration.',
    },
    {
      type: 'prop-table',
      id: 'pt-2',
      rows: [
        ['Draft model (Mq)', 'A small, fast model (e.g., 1B params). Generates K candidate tokens autoregressively.'],
        ['Target model (Mp)', 'The large model whose distribution we want to sample from (e.g., 70B params).'],
        ['K (speculation length)', 'Number of tokens the draft model proposes per iteration. Typically 4–8.'],
        ['Acceptance rate (α)', 'Fraction of draft tokens accepted. Higher α = more speedup.'],
      ],
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'ordered',
      items: [
        '<strong>Draft K tokens</strong> — Run the draft model autoregressively for K steps, producing tokens x₁, x₂, …, xₖ. Store the draft probabilities q(xₜ) at each step.',
        '<strong>Verify in parallel</strong> — Feed all K draft tokens into the target model in a single forward pass. This gives us the target probabilities p(xₜ) for each position — essentially, what the big model would have chosen.',
        '<strong>Accept or reject each token</strong> — For each draft token xₜ, accept it with probability min(1, p(xₜ)/q(xₜ)). If p(xₜ) ≥ q(xₜ), the target agrees at least as much as the draft, so accept unconditionally. Otherwise, accept proportionally.',
        '<strong>On first rejection, resample</strong> — At the first rejected position, sample a corrected token from an adjusted distribution: norm(max(0, p(x) − q(x))). This ensures the final distribution is exactly p(x).',
        '<strong>Repeat</strong> — Advance the context by all accepted tokens (+ the one resampled token), and start a new draft-verify iteration.',
      ],
    },
    {
      type: 'math-box',
      id: 'm-1',
      expression: '\\text{accept } x_t \\text{ with probability } \\min\\!\\left(1,\\; \\frac{p(x_t)}{q(x_t)}\\right)',
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content:
        'This acceptance criterion is the heart of the algorithm. It is a form of <HoverCard term="rejection sampling"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Rejection Sampling</div><div style="color:var(--text-muted);font-size:12px">A classical technique in statistics for sampling from a target distribution <em>p</em> using a proposal distribution <em>q</em>. You draw from <em>q</em> and accept with probability <em>p(x)/q(x)</em>, scaled by a constant. The accepted samples are exactly distributed according to <em>p</em>.</div></HoverCard> adapted for autoregressive sequences. The crucial property: regardless of how bad the draft model is, <strong>the output distribution is always exactly that of the target model</strong>. A bad draft model simply means more rejections and less speedup — but never wrong outputs.',
    },

    // ── Why It's Truly Lossless ──
    { type: 'section', id: 'sec-4', title: "Why It's Truly Lossless" },
    {
      type: 'paragraph',
      id: 'p-8',
      content:
        'This is the question everyone asks: <em>if the draft model is small and makes wrong guesses, how can the final output be identical to the target model?</em> The answer is that verification is not a passive check — it is an <strong>active correction mechanism</strong>. The draft model proposes, and the target model disposes. Every wrong guess is caught and replaced with a sample from the correct distribution. The draft model never gets the final say.',
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content:
        'The trick lies in the rejection sampling step. When the draft proposes token <em>x</em> with probability <Latex>q(x)</Latex> and the target assigns it probability <Latex>p(x)</Latex>, three things can happen:',
    },
    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Case 1: Target agrees more — <Latex>p(x) \\geq q(x)</Latex></strong> — The target would have been <em>even more likely</em> to pick this token than the draft was. Accept unconditionally. The ratio <Latex>p(x)/q(x) \\geq 1</Latex>, so <Latex>\\min(1, p/q) = 1</Latex>.',
        '<strong>Case 2: Target agrees less — <Latex>p(x) < q(x)</Latex></strong> — The draft was <em>overconfident</em> about this token. Accept with probability <Latex>p(x)/q(x) < 1</Latex>. For example, if the draft says 0.80 and the target says 0.40, accept with probability 0.50. This downweights tokens the draft liked too much.',
        '<strong>Case 3: Rejected — resample from the residual</strong> — When rejected, don\'t just pick the target\'s top token — sample from the <strong>adjusted distribution</strong> <Latex>p\'(x) = \\text{norm}(\\max(0,\\; p(x) - q(x)))</Latex>. This distribution precisely compensates for the probability mass already "used up" by the accepted tokens, ensuring the overall sample follows <Latex>p(x)</Latex> exactly.',
      ],
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'tip',
      content:
        '<strong>The mathematical guarantee:</strong> For every token in the vocabulary, the probability of it being the final output equals <em>exactly</em> <Latex>p(x)</Latex>. The draft model affects only <strong>how many tokens get accepted per iteration</strong> (speed), never <strong>which tokens appear in the output</strong> (quality). A perfect draft means more speed. A terrible draft means no speed gain — but the output is <em>still</em> sampled from <Latex>p(x)</Latex>.',
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content:
        'Think of it this way: the verification step is a filter that only lets through tokens the target model would have produced. The draft model is merely a <em>proposal engine</em> — it suggests candidates to accelerate the search, but the target model has absolute veto power. The output is the target model\'s output, generated faster.',
    },

    // ── Why Verification Is Cheap ──
    { type: 'section', id: 'sec-5', title: 'Why Verification Is Cheap' },
    {
      type: 'paragraph',
      id: 'p-11',
      content:
        'The reason this works is a fundamental asymmetry in transformer inference. During <strong>prefill</strong> (processing a prompt), the model sees all tokens at once and processes them in parallel through its attention layers. The GPU\'s tensor cores are fully utilized because the batch of tokens creates large matrix multiplications. During <strong>decoding</strong>, the model processes one token at a time — the matrix multiplications collapse to matrix-vector products, and the GPU is starved for work.',
    },
    {
      type: 'prop-table',
      id: 'pt-3',
      rows: [
        ['Prefill (Compute-Bound)', 'Many tokens processed at once. Large matrix × matrix multiplications. GPU tensor cores fully saturated. Processing 5 tokens takes barely longer than processing 1.'],
        ['Decode (Memory-Bound)', 'One token at a time. Matrix × vector multiplications. GPU waits for weight loading from HBM. Processing 1 token wastes most of the available compute.'],
      ],
    },
    {
      type: 'custom-element',
      id: 'w-3',
      name: 'ParallelViz',
      description: 'Interactive visualization comparing sequential decode vs parallel verify with Gantt timelines, matrix shape diagrams, and key insight callouts. Includes HoverCard for HBM explanation.',
    },
    {
      type: 'paragraph',
      id: 'p-12',
      content:
        'Speculative decoding converts decode-time work into prefill-time work. By feeding <em>K</em> draft tokens into the target model simultaneously, you turn <em>K</em> sequential matrix-vector operations into one matrix-matrix operation. The wall-clock time barely increases, but you get <em>K</em> tokens verified instead of 1 generated.',
    },
    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'info',
      content:
        '<strong>The arithmetic intensity argument:</strong> A single decode step for a 70B model requires loading ~140GB of weights from HBM to compute a single output logit vector. Those same 140GB of weights, once loaded, could just as easily multiply against 5 or 10 input vectors. The weights are the bottleneck, not the computation.',
    },

    // ── The Acceptance Rate and Expected Speedup ──
    { type: 'section', id: 'sec-6', title: 'The Acceptance Rate and Expected Speedup' },
    {
      type: 'paragraph',
      id: 'p-13',
      content:
        'The speedup from speculative decoding depends almost entirely on the <strong>acceptance rate α</strong> — the probability that the target model agrees with each draft token. If the draft model perfectly matches the target, α = 1 and every draft token is accepted, yielding maximum speedup. If the draft model is terrible, α ≈ 0 and you waste time drafting tokens that are immediately rejected.',
    },
    {
      type: 'math-box',
      id: 'm-2',
      expression: '\\text{Expected tokens per iteration} = \\frac{1 - \\alpha^{K+1}}{1 - \\alpha}',
    },
    {
      type: 'prop-table',
      id: 'pt-4',
      rows: [
        ['α = 0.9, K = 5', '~4.1 tokens per iteration (great — nearly all accepted)'],
        ['α = 0.7, K = 5', '~2.7 tokens per iteration (decent speedup)'],
        ['α = 0.5, K = 5', '~1.9 tokens per iteration (marginal benefit)'],
        ['α = 0.3, K = 5', '~1.4 tokens per iteration (barely worth it)'],
      ],
    },
    {
      type: 'paragraph',
      id: 'p-14',
      content:
        'The effective wall-clock speedup also depends on the cost ratio between the draft and target models. If the draft model is 1/40th the size, its forward passes are nearly free. But if you use a draft model that is 1/3 the size of the target, the overhead of drafting becomes significant and eats into the gains.',
    },
    {
      type: 'math-box',
      id: 'm-3',
      expression: '\\text{Speedup} \\approx \\frac{\\text{Expected accepted tokens}}{1 + K \\cdot c}',
      note: 'where <em>c</em> = cost ratio (draft forward pass / target forward pass)',
    },
    {
      type: 'callout',
      id: 'c-5',
      calloutType: 'tip',
      content:
        '<strong>Rule of thumb:</strong> Speculative decoding is most effective when (1) the draft model is very small relative to the target, and (2) the draft model\'s distribution closely matches the target\'s. These two goals are in tension — a bigger draft model matches better but costs more.',
    },

    // ── Draft Model Strategies ──
    { type: 'section', id: 'sec-7', title: 'Draft Model Strategies' },
    {
      type: 'paragraph',
      id: 'p-15',
      content:
        'The choice of draft model is the single most important design decision in speculative decoding. Several strategies have emerged, each with distinct trade-offs.',
    },
    {
      type: 'list',
      id: 'l-3',
      listType: 'unordered',
      items: [
        '<strong>Independent Small Model</strong> — Use a separately trained smaller model from the same family (e.g., Llama 3 8B drafting for Llama 3 70B). Simple and effective, but requires maintaining two models in memory.',
        '<strong>Self-Drafting (Layer Skipping)</strong> — Use a subset of the target model\'s own layers as the draft model (e.g., exit early after layer 8 of 80). No additional memory cost, but typically lower acceptance rates.',
        '<strong>Medusa Heads (Cai et al., 2024)</strong> — Attach multiple lightweight prediction heads to the target model. Each head predicts a different future token position. No separate draft model needed — the heads are tiny MLPs trained on top of the target model\'s hidden states.',
        '<strong>EAGLE (Li et al., 2024)</strong> — Trains a lightweight autoregressive head on top of the target model\'s hidden states to draft tokens. Achieves higher acceptance rates than Medusa by modeling token dependencies in the draft.',
        '<strong>Prompt Lookup Decoding</strong> — No draft model at all. Instead, look for n-gram matches in the prompt itself to predict continuations. Works remarkably well for tasks like summarization or code editing where the output overlaps with the input.',
      ],
    },

    // ── Tree-Based Speculative Decoding ──
    { type: 'section', id: 'sec-8', title: 'Tree-Based Speculative Decoding' },
    {
      type: 'paragraph',
      id: 'p-16',
      content:
        'Standard speculative decoding proposes a single linear chain of <em>K</em> tokens. But what if the draft model is uncertain at some position? A single wrong guess at position 2 means positions 3, 4, 5 are all wasted. <strong>Tree-based speculation</strong> solves this by proposing multiple alternative continuations, forming a tree of candidates.',
    },
    {
      type: 'paragraph',
      id: 'p-17',
      content:
        'At each draft position, instead of committing to one token, the draft model proposes the top-<em>b</em> most likely tokens, branching the speculation into a tree. The target model then verifies all branches in parallel using <HoverCard term="tree attention"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Tree Attention</div><div style="color:var(--text-muted);font-size:12px">A modified attention mask that respects the tree structure of the draft. Each node in the tree can only attend to its ancestors, not its siblings. This is implemented by constructing a custom causal mask that follows the tree topology.</div></HoverCard> — a specially constructed attention mask that encodes the tree structure. The longest accepted path through the tree becomes the accepted output.',
    },
    {
      type: 'callout',
      id: 'c-6',
      calloutType: 'info',
      content:
        '<strong>SpecInfer (Miao et al., 2024)</strong> showed that tree-based speculation can improve acceptance length by 1.5–2× compared to linear speculation, at the cost of verifying more candidate tokens per iteration. The sweet spot depends on how uncertain the draft model is at each position.',
    },

    // ── When It Shines and When It Struggles ──
    { type: 'section', id: 'sec-9', title: 'When It Shines and When It Struggles' },
    {
      type: 'paragraph',
      id: 'p-18',
      content:
        'Speculative decoding is not uniformly beneficial. Its effectiveness varies dramatically across tasks, and understanding when it helps — and when it doesn\'t — is critical for practical deployment.',
    },
    {
      type: 'prop-table',
      id: 'pt-5',
      rows: [
        ['High Speedup Scenarios', '<strong>Predictable text:</strong> boilerplate code, formulaic writing, translations · <strong>Continuation tasks:</strong> where output resembles input (summarization, editing) · <strong>Low temperature:</strong> greedy or near-greedy sampling (higher acceptance rate) · <strong>Large target model:</strong> the bigger the target, the more decode time is wasted'],
        ['Low Speedup Scenarios', '<strong>Creative writing:</strong> high entropy, many equally valid continuations · <strong>High temperature:</strong> random sampling reduces agreement between models · <strong>Domain mismatch:</strong> draft model trained on different data than target · <strong>Small target model:</strong> less room for decode-time inefficiency to exploit'],
      ],
    },

    // ── Speculative Decoding in Production ──
    { type: 'section', id: 'sec-10', title: 'Speculative Decoding in Production' },
    {
      type: 'paragraph',
      id: 'p-19',
      content:
        'As of 2025, speculative decoding has moved from a research curiosity to a production staple. Major inference frameworks and API providers have adopted it as a default optimization.',
    },
    {
      type: 'prop-table',
      id: 'pt-6',
      rows: [
        ['vLLM', 'Supports speculative decoding with configurable draft models and speculation length.'],
        ['TensorRT-LLM (NVIDIA)', 'Built-in support for draft-model and Medusa-style speculation.'],
        ['Hugging Face TGI', 'Integrated speculative decoding for served models.'],
        ['Google (Gemini)', 'Uses speculative decoding internally for inference serving.'],
        ['Anthropic (Claude)', 'Confirmed use of speculative decoding techniques for faster inference.'],
        ['Together AI', 'Offers speculative decoding as a configurable option in their API.'],
      ],
    },
    {
      type: 'callout',
      id: 'c-7',
      calloutType: 'accent',
      content:
        '<strong>The industry consensus:</strong> speculative decoding is now considered a <strong>standard optimization</strong> for LLM serving, alongside KV caching, continuous batching, and quantization. It is one of the few techniques that offers genuine speedup with zero quality loss.',
    },

    // ── Quick Reference ──
    { type: 'section', id: 'sec-11', title: 'Quick Reference' },
    {
      type: 'prop-table',
      id: 'pt-7',
      headers: ['Concept', 'Key Idea', 'One-Line Summary'],
      rows: [
        ['Draft-Verify Loop', 'Small model guesses, big model checks', 'Convert sequential decode into parallel verify'],
        ['Rejection Sampling', 'min(1, p(x)/q(x))', 'Accept draft if target agrees at least as much'],
        ['Acceptance Rate (α)', 'P(target accepts draft)', 'Higher α = more tokens per iteration = more speedup'],
        ['Tree Speculation', 'Branch at uncertain positions', 'Multiple candidates verified in one pass via tree attention'],
        ['Medusa / EAGLE', 'Lightweight heads on target', 'No separate draft model — heads predict future tokens'],
        ['Lossless Guarantee', 'Output ≡ target distribution', 'Rejection sampling ensures exact equivalence'],
      ],
    },

    // ── References & Further Reading ──
    { type: 'section', id: 'sec-12', title: 'References & Further Reading' },
    {
      type: 'reference',
      id: 'r-1',
      title: 'Fast Inference from Transformers via Speculative Decoding',
      url: 'https://arxiv.org/abs/2211.17192',
      authors: 'Leviathan, Kalman & Matias',
      year: '2023',
      description: 'The foundational paper that introduced speculative decoding with the rejection sampling guarantee.',
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'Accelerating Large Language Model Decoding with Speculative Sampling',
      url: 'https://arxiv.org/abs/2302.01318',
      authors: 'Chen, Borgeaud, Irving et al. (DeepMind)',
      year: '2023',
      description: 'Independent concurrent work establishing the same framework.',
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads',
      url: 'https://arxiv.org/abs/2401.10774',
      authors: 'Cai et al.',
      year: '2024',
      description: 'Draft-free speculation using parallel prediction heads.',
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty',
      url: 'https://arxiv.org/abs/2401.15077',
      authors: 'Li et al.',
      year: '2024',
      description: 'Autoregressive draft heads achieving state-of-the-art acceptance rates.',
    },
    {
      type: 'reference',
      id: 'r-5',
      title: 'SpecInfer: Accelerating LLM Serving with Tree-based Speculative Inference',
      url: 'https://arxiv.org/abs/2305.09781',
      authors: 'Miao et al.',
      year: '2024',
      description: 'Tree-structured speculation with verified parallel decoding.',
    },
    {
      type: 'reference',
      id: 'r-6',
      title: 'Looking Back at Speculative Decoding',
      url: 'https://research.google/blog/looking-back-at-speculative-decoding/',
      authors: 'Google Research Blog',
      year: '2024',
      description: 'An accessible overview from the original authors.',
    },

    // ── AI Disclosure ──
    {
      type: 'callout',
      id: 'c-8',
      calloutType: 'info',
      content:
        '<strong>A note on this article:</strong> This post was written with the help of AI. All content has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date as of 2025.',
    },
  ],
};
