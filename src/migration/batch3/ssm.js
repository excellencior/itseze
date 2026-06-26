export const pageData = {
  route: 'concept:ssm',
  urlPath: '/concepts/ssm',
  status: 'published',
  meta: {
    title: 'State Space Models (SSMs)',
    subtitle: 'From classical control theory to Mamba and beyond — how a 60 year old mathematical framework became the leading alternative to Transformers for efficient sequence modeling.',
    category: 'concept',
    subcategory: null,
    route: 'concept:ssm',
    ready: true
  },
  blocks: [
    // ══ 1. THE QUADRATIC WALL ══
    { type: 'section', id: 'sec-1', title: 'The Quadratic Wall' },

    {
      type: 'paragraph', id: 'p-1',
      content: 'Transformers revolutionized sequence modeling with the <HoverCard term="attention mechanism"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Attention Mechanism</div><div style="color:var(--text-muted);font-size:12px">The core operation of a Transformer. Each token computes a similarity score against every other token, producing a weighted sum of value vectors. This enables direct, content based access to any position in the sequence regardless of distance.</div></HoverCard>. But attention has a fundamental computational limitation that becomes devastating at scale.'
    },

    {
      type: 'paragraph', id: 'p-2',
      content: 'The matrix multiplication <code>Q · Kᵀ</code> produces a score matrix of shape (sequence_length × sequence_length). Every token must compute a similarity score against every other token. The cost grows <strong>quadratically</strong> — doubling the sequence length quadruples the computation.'
    },

    {
      type: 'comp-table', id: 'ct-1',
      headers: ['Sequence Length', 'Score Matrix Size', 'Relative Cost'],
      rows: [
        ['512', '262,144', '1×'],
        ['2,048', '4,194,304', '16×'],
        ['8,192', '67,108,864', '256×'],
        ['32,768', '1,073,741,824', '4,096×'],
        ['131,072', '17,179,869,184', '65,536×']
      ]
    },

    {
      type: 'paragraph', id: 'p-3',
      content: 'Beyond computation, there is a <strong>memory</strong> problem. During autoregressive generation, Transformers must store a <HoverCard term="KV Cache"><div style="font-weight:700;font-size:14px;margin-bottom:8px">KV Cache</div><div style="color:var(--text-muted);font-size:12px">The Key and Value matrices stored for every previously generated token, across every layer and every attention head. This cache allows the model to avoid recomputing attention for past tokens during generation, but grows linearly with sequence length and can consume tens of gigabytes of GPU memory.</div></HoverCard> that grows linearly with sequence length. For a 7B parameter model at 128K context, the KV cache alone can exceed 32 GB — more than many GPUs can hold.'
    },

    {
      type: 'callout', id: 'c-1', calloutType: 'warning',
      content: '<strong>The central question SSMs answer:</strong> What if we could process sequences in linear time with constant memory? Instead of computing pairwise relationships between all tokens (quadratic), maintain a <strong>fixed size hidden state</strong> that evolves with each new token. Cost per token: O(1). Total cost: O(L). Memory: constant.'
    },

    { type: 'custom-element', id: 'w-1', name: 'AttnVsSSMViz' },

    // ══ 2. ORIGINS ══
    { type: 'section', id: 'sec-2', title: 'Origins: State Space Models in Control Theory' },

    {
      type: 'paragraph', id: 'p-4',
      content: 'State Space Models did not originate in machine learning. They are a cornerstone of <strong>control theory and signal processing</strong>, dating back to the work of Rudolf Kalman in the late 1950s. Understanding these classical roots is essential because modern deep learning SSMs directly inherit their mathematical structure.'
    },

    {
      type: 'paragraph', id: 'p-5',
      content: 'A State Space Model describes a <strong>dynamical system</strong> — any system whose behavior evolves over time. The key insight is to model it with two equations:'
    },

    {
      type: 'math-box', id: 'm-1',
      expression: '\\dot{x}(t) = Ax(t) + Bu(t) \\quad \\text{(state equation)}\n\ny(t) = Cx(t) + Du(t) \\quad \\text{(output equation)}'
    },

    {
      type: 'prop-table', id: 'pt-1',
      rows: [
        ['<Latex>u(t)</Latex>', 'Input signal — the external driving signal (e.g., a token embedding)'],
        ['<Latex>x(t)</Latex>', 'Hidden state — a compressed summary of all past inputs (shape: N × 1)'],
        ['<Latex>y(t)</Latex>', 'Output signal — computed from the current state'],
        ['<Latex>A</Latex>', 'State matrix (N × N) — governs how the state evolves over time'],
        ['<Latex>B</Latex>', 'Input matrix (N × 1) — controls how the input influences the state'],
        ['<Latex>C</Latex>', 'Output matrix (1 × N) — controls how the state maps to the output'],
        ['<Latex>D</Latex>', 'Feedthrough matrix — direct input to output (often zero)']
      ]
    },

    {
      type: 'paragraph', id: 'p-6',
      content: '<strong>The Physical Analogy: The Heated Room.</strong> Imagine controlling the temperature of a room. The input u(t) is heater power. The hidden state x(t) = [room_temp, wall_temp] captures the internal thermal dynamics. The output y(t) is the thermometer reading. Matrix A encodes the physics: heat flows from hot surfaces to cold ones, rooms lose heat outside. <strong>The state is a sufficient statistic for predicting the future</strong> — you do not need the entire history of heater settings, just the current state.'
    },

    {
      type: 'paragraph', id: 'p-7',
      content: 'The most celebrated application was the <HoverCard term="Kalman Filter"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Kalman Filter (1960)</div><div style="color:var(--text-muted);font-size:12px">An optimal recursive estimator for linear dynamical systems with noise. Used in the Apollo program to navigate spacecraft to the Moon. It alternates between predicting the next state and correcting the prediction using observations. The deep learning SSM insight: maintain a compact, recursively updated state that summarizes all relevant history.</div></HoverCard> (1960), which navigated Apollo spacecraft to the Moon using exactly this framework. The deep learning versions simply <strong>learn</strong> the matrices A, B, C, D from data instead of deriving them from physics.'
    },

    {
      type: 'callout', id: 'c-2', calloutType: 'info',
      content: '<strong>Why were SSMs ignored in early deep learning?</strong> Three reasons: (1) nobody knew how to initialize the A matrix for long range memory, (2) the recurrent form is sequential and slow on GPUs, and (3) LSTMs were "good enough" for short sequences. It took HiPPO (solving #1) and S4 (solving #2) to change this.'
    },

    // ══ 3. HiPPO ══
    { type: 'section', id: 'sec-3', title: 'The HiPPO Framework: Teaching SSMs to Remember (2020)' },

    {
      type: 'paragraph', id: 'p-8',
      content: 'The story of modern deep learning SSMs begins with a single paper: <strong>"HiPPO: Recurrent Memory with Optimal Polynomial Projections"</strong> by Albert Gu, Tri Dao, Stefano Ermon, Atri Rudra, and Christopher Ré (NeurIPS 2020). This paper solved the most fundamental problem: how should we initialize the state matrix A so that the hidden state actually remembers the input history?'
    },

    {
      type: 'paragraph', id: 'p-9',
      content: 'Consider a sequence model at time step t. It has seen inputs u₁, u₂, …, uₜ. The hidden state xₜ is a fixed size vector (say, N = 64 dimensions). How can 64 numbers faithfully represent a history of thousands of inputs? The answer: fit the <strong>best polynomial approximation</strong> to the input history. The N coefficients of this polynomial become the state vector.'
    },

    {
      type: 'code-block', id: 'cb-1',
      content: 'Input history:  u₁, u₂, u₃, ..., u₁₀₀₀   (1000 values)\n\nCompress to:    c₀, c₁, c₂, ..., c₆₃       (64 coefficients)\n                representing:  f(t) ≈ c₀ + c₁t + c₂t² + ... + c₆₃t⁶³\n\nThe polynomial f(t) is the "best" approximation of the input history\nin the least squares sense.'
    },

    {
      type: 'paragraph', id: 'p-10',
      content: 'HiPPO formalized this using <HoverCard term="orthogonal polynomials"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Orthogonal Polynomials</div><div style="color:var(--text-muted);font-size:12px">A family of polynomials (Legendre, Laguerre, etc.) where each polynomial is "perpendicular" to all others under a specific inner product. This orthogonality means each coefficient captures independent information about the signal, leading to optimal compression with no redundancy.</div></HoverCard> (Legendre, Laguerre) and showed that the coefficients can be maintained <strong>online</strong> — updated incrementally as each new input arrives — using a state space model with a specific, mathematically derived A matrix.'
    },

    {
      type: 'comp-table', id: 'ct-2',
      headers: ['Property', 'Random A Matrix', 'HiPPO A Matrix'],
      rows: [
        ['Memory of distant past', 'Decays exponentially', 'Preserved optimally'],
        ['Initialization quality', 'Requires extensive tuning', 'Mathematically optimal from the start'],
        ['Long range dependency', 'Fails beyond ~100 steps', 'Works for 10,000+ steps'],
        ['Theoretical guarantee', 'None', 'Optimal polynomial approximation of input history']
      ]
    },

    {
      type: 'callout', id: 'c-3', calloutType: 'tip',
      content: '<strong>The Big Insight:</strong> HiPPO showed that long range memory in sequence models is fundamentally a <strong>function approximation problem</strong>. The hidden state should be thought of as the coefficients of an optimal polynomial approximation. This reframing — from "learned memory" to "optimal compression" — was the conceptual breakthrough that enabled everything that followed.'
    },

    // ══ 4. DISCRETIZATION ══
    { type: 'section', id: 'sec-4', title: 'From Continuous to Discrete: Processing Digital Data' },

    {
      type: 'paragraph', id: 'p-11',
      content: 'The equations above describe a <strong>continuous time</strong> system. But computers process <strong>discrete</strong> sequences. We need to convert the continuous SSM into a discrete one using a <strong>step size</strong> <HoverCard term="Δ (Delta)"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Step Size Δ (Delta)</div><div style="color:var(--text-muted);font-size:12px">Controls the effective resolution at which the SSM samples the continuous dynamics. Small Δ = fine resolution (detailed processing). Large Δ = coarse resolution (fast skimming). In S4, Δ is a learned parameter. In Mamba, Δ becomes input dependent — different for every token — enabling selective behavior.</div></HoverCard> that transforms continuous matrices into discrete ones.'
    },

    {
      type: 'math-box', id: 'm-2',
      expression: 'h_k = \\bar{A} \\cdot h_{k-1} + \\bar{B} \\cdot u_k \\quad \\text{(state update)}\n\ny_k = C \\cdot h_k + D \\cdot u_k \\quad \\text{(output)}'
    },

    {
      type: 'paragraph', id: 'p-12',
      content: 'The discrete matrices <Latex>\\bar{A}</Latex> and <Latex>\\bar{B}</Latex> are computed from the continuous ones via discretization rules like <strong>Zero Order Hold (ZOH)</strong> — which assumes the input stays constant between samples — or the <strong>Bilinear Transform</strong>.'
    },

    { type: 'custom-element', id: 'w-2', name: 'SSMWalkthrough' },

    {
      type: 'paragraph', id: 'p-13',
      content: 'The most remarkable property of discretized SSMs is that the <strong>same model</strong> can be viewed through three completely different computational lenses:'
    },

    {
      type: 'comp-table', id: 'ct-3',
      headers: ['View', 'Cost', 'Parallelism', 'Best For'],
      rows: [
        ['Recurrence (RNN mode)', 'O(L)', 'Sequential', 'Inference — generate one token at a time'],
        ['Convolution (CNN mode)', 'O(L log L)', 'Fully parallel', 'Training — process whole sequences via FFT'],
        ['Matrix multiply', 'O(L)', 'Chunkwise parallel', 'Training with Tensor Core optimization (Mamba 2)']
      ]
    },

    {
      type: 'callout', id: 'c-4', calloutType: 'tip',
      content: '<strong>The duality superpower:</strong> Train like a CNN (fast, parallel), deploy like an RNN (efficient, streaming). No other architecture family offers this flexibility.'
    },

    // ══ 5. S4 ══
    { type: 'section', id: 'sec-5', title: 'S4: The First Practical Deep Learning SSM (2022)' },

    {
      type: 'paragraph', id: 'p-14',
      content: 'With HiPPO providing the initialization and discretization providing the computational framework, the stage was set for <strong>S4: Structured State Spaces for Sequence Modeling</strong> by Albert Gu, Karan Goel, and Christopher Ré (ICLR 2022). S4 was the first SSM to achieve genuinely competitive results with Transformers.'
    },

    {
      type: 'paragraph', id: 'p-15',
      content: 'The key computational challenge: computing the convolution kernel requires repeated matrix powers of Ā, which is expensive and numerically unstable for long sequences. S4 solved this by parameterizing A as <HoverCard term="NPLR"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Normal Plus Low Rank (NPLR)</div><div style="color:var(--text-muted);font-size:12px">A decomposition of the state matrix A as the sum of a normal (diagonalizable) matrix and a low rank correction. This structure allows the convolution kernel to be computed efficiently using techniques from numerical linear algebra (Cauchy kernel, Woodbury identity), reducing the cost to O(N + L) from what would otherwise be intractable.</div></HoverCard>, allowing the convolution kernel to be computed in O(N + L) time.'
    },

    {
      type: 'paragraph', id: 'p-16',
      content: 'S4 was evaluated on the <strong>Long Range Arena (LRA)</strong> benchmark. The results were striking:'
    },

    {
      type: 'comp-table', id: 'ct-4',
      headers: ['Task', 'Sequence Length', 'Transformer', 'S4'],
      rows: [
        ['ListOps', '2,048', '36.37%', '58.35%'],
        ['Text', '4,096', '64.27%', '76.02%'],
        ['Retrieval', '4,000', '57.46%', '87.09%'],
        ['Image', '1,024', '42.44%', '88.65%'],
        ['Pathfinder', '1,024', '71.40%', '94.20%'],
        ['Path X', '16,384', 'FAIL (random)', '96.35%'],
        ['Average', '', '53.66%', '86.09%']
      ]
    },

    {
      type: 'paragraph', id: 'p-17',
      content: 'S4 sparked a wave of successors — S4D (diagonal simplification), DSS, GSS (gated), S5 (MIMO formulation), H3 (Hungry Hungry Hippos), and Hyena (long convolutions). But all shared one critical limitation: they were <strong>Linear Time Invariant (LTI)</strong>. Their parameters were fixed regardless of input content, meaning they could not selectively focus on specific tokens the way attention does.'
    },

    // ══ 6. MAMBA ══
    { type: 'section', id: 'sec-6', title: 'Mamba: The Selection Breakthrough (2023)' },

    {
      type: 'paragraph', id: 'p-18',
      content: 'In December 2023, Albert Gu and Tri Dao released <strong>"Mamba: Linear Time Sequence Modeling with Selective State Spaces"</strong> — a paper that fundamentally changed the SSM landscape by solving the biggest remaining weakness: the inability to selectively process content.'
    },

    {
      type: 'paragraph', id: 'p-19',
      content: '<strong>The LTI Problem:</strong> All prior SSMs processed every token with identical dynamics. The model could not decide to "pay more attention" to important tokens while skimming filler. Attention is <strong>content aware</strong> (what matters depends on what the tokens say); LTI SSMs are <strong>content blind</strong> (the dynamics are fixed regardless of content).'
    },

    {
      type: 'paragraph', id: 'p-20',
      content: '<strong>Mamba\'s solution:</strong> make the SSM parameters <strong>depend on the input</strong>. Specifically, three of the four core parameters become input dependent:'
    },

    {
      type: 'comp-table', id: 'ct-5',
      headers: ['Parameter', 'Before Mamba (LTI)', 'Mamba (Selective)', 'Controls'],
      rows: [
        ['Δ (step size)', 'Fixed scalar', 'Input dependent (per token)', 'How much to update state vs. retain old state'],
        ['B (input matrix)', 'Fixed', 'Input dependent (per token)', 'How current input is written into state'],
        ['C (output matrix)', 'Fixed', 'Input dependent (per token)', 'How state is read to produce output'],
        ['A (state matrix)', 'Fixed (HiPPO)', 'Fixed (modulated by Δ)', 'Base dynamics of state evolution']
      ]
    },

    {
      type: 'paragraph', id: 'p-21',
      content: 'The key insight is that <strong>Δ acts as a gate</strong>:'
    },

    {
      type: 'callout', id: 'c-5', calloutType: 'accent',
      content: '<strong>Large Δ:</strong> Ā ≈ 0 (forget old state), B̄ is large (write new input). <strong>"This token is important — store it!"</strong><br><br><strong>Small Δ:</strong> Ā ≈ 1 (keep old state), B̄ ≈ 0 (ignore new input). <strong>"This token is filler — skip it."</strong>'
    },

    {
      type: 'paragraph', id: 'p-22',
      content: 'Making parameters input dependent broke the convolution view (the kernel changes at every step), so Mamba could not use FFT based training. Gu and Dao solved this with a <HoverCard term="parallel scan"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Parallel Scan Algorithm</div><div style="color:var(--text-muted);font-size:12px">The recurrence h_k = a_k · h_(k−1) + b_k is an associative operation. This means it can be computed using a parallel prefix sum (scan) with O(log L) depth instead of O(L) sequential steps. Mamba implements this entirely in GPU SRAM with kernel fusion and recomputation to minimize memory bandwidth bottlenecks.</div></HoverCard> algorithm that runs in O(log L) depth on GPU, plus three critical optimizations: kernel fusion (all SSM ops in one GPU kernel), recomputation (trade compute for memory during backpropagation), and SRAM utilization (fast on chip memory instead of slow HBM).'
    },

    {
      type: 'paragraph', id: 'p-23',
      content: 'Mamba was the <strong>first SSM to match Transformers at scale</strong> across language, audio, and genomics — with 5× faster generation throughput, no KV cache, and linear scaling to million length sequences.'
    },

    {
      type: 'callout', id: 'c-6', calloutType: 'tip',
      content: '<strong>The Deep Insight:</strong> Mamba\'s selection mechanism is a continuous, learned generalization of a gate. LSTMs had discrete gates. Attention has soft gates (attention weights). Mamba has a <strong>resolution gate (Δ)</strong> that controls the granularity at which each token is processed. All three solve the same problem — deciding what to remember and what to forget — but Mamba does it within a linear time framework.'
    },

    // ══ 7. MAMBA 2 ══
    { type: 'section', id: 'sec-7', title: 'Mamba 2 and State Space Duality (2024)' },

    {
      type: 'paragraph', id: 'p-24',
      content: 'In mid 2024, Gu and Dao revealed a deep mathematical connection: <strong>selective SSMs and a specific form of structured attention are mathematically equivalent</strong>. If you restrict the state matrix A to be a scalar times identity, the SSM output at position k is a weighted sum of all past inputs — identical to linear attention with an exponential decay mask.'
    },

    {
      type: 'comp-table', id: 'ct-6',
      headers: ['Concept', 'Attention', 'Selective SSM (via SSD)'],
      rows: [
        ['Weight computation', 'softmax(Q·Kᵀ/√d)', 'C_k · B_j · (product of decay factors)'],
        ['Value aggregation', 'Weighted sum of V', 'Weighted sum of u (inputs)'],
        ['Causal structure', 'Lower triangular mask', 'Exponential decay mask'],
        ['Complexity', 'O(L²)', 'O(L) via recurrence']
      ]
    },

    {
      type: 'paragraph', id: 'p-25',
      content: 'The SSD framework enabled Mamba 2 to be <strong>2 to 8 times faster</strong> than Mamba 1 by reformulating the selective scan as structured matrix multiplications that run on highly optimized GPU Tensor Cores. Key changes: larger state dimension (64 to 256 vs. 16), multi head structure, and simplified parameterization.'
    },

    // ══ 8. THE ACHILLES HEEL ══
    { type: 'section', id: 'sec-8', title: 'The Achilles Heel: Why Pure SSMs Struggle with Fine Grained Recall' },

    {
      type: 'paragraph', id: 'p-26',
      content: 'Despite Mamba\'s impressive results, researchers quickly identified a fundamental weakness. The core strength of SSMs — compressing all history into a <strong>fixed size state</strong> — is also their core weakness.'
    },

    {
      type: 'callout', id: 'c-7', calloutType: 'info',
      content: '<strong>Transformer (Attention):</strong> Like having a <strong>complete recording</strong> of every lecture. Want to recall what was said at minute 42? Just look it up. Exact, verbatim recall. <strong>Cost:</strong> Storage proportional to everything recorded.<br><br><strong>SSM (State Space):</strong> Like taking <strong>handwritten notes</strong>. Great summary of key themes, but the exact wording? Lost. You have the gist, not the recording. <strong>Cost:</strong> Notebook is always the same size.'
    },

    {
      type: 'paragraph', id: 'p-27',
      content: '<strong>Three systematic failure modes</strong> have been identified in pure SSMs:'
    },

    {
      type: 'list', id: 'l-1', listType: 'unordered',
      items: [
        '<strong>Failure Mode 1: Associative Recall</strong> — Retrieving a specific value associated with a specific key (e.g., "A→7, B→3, C→9 … Query: C→?"). Attention looks up directly; SSMs must extract from compressed state where individual associations get muddled.',
        '<strong>Failure Mode 2: Verbatim Copying</strong> — Reproducing exact sequences from the input. Attention directly attends to original tokens; SSMs must reconstruct from compressed state, often paraphrasing rather than reproducing verbatim.',
        '<strong>Failure Mode 3: Recency Bias</strong> — SSMs tend to weight recent tokens more heavily than distant ones. Information at position 100 may be overwritten by position 9,900, even when the earlier information is the correct answer.'
      ]
    },

    {
      type: 'callout', id: 'c-8', calloutType: 'warning',
      content: '<strong>The Fundamental Tension:</strong> There is a deep, arguably irreducible tension between <strong>compression efficiency</strong> (fixed size state, linear cost) and <strong>retrieval fidelity</strong> (exact recall of arbitrary past tokens). Transformers pay the quadratic cost to achieve perfect retrieval. SSMs pay linear cost but sacrifice retrieval precision. The question becomes: can we get the best of both?'
    },

    // ══ 9. HYBRID ARCHITECTURES ══
    { type: 'section', id: 'sec-9', title: 'Hybrid Architectures: The Best of Both Worlds (2024 to 2026)' },

    {
      type: 'paragraph', id: 'p-28',
      content: 'The realization that SSMs and Transformers have <strong>complementary strengths</strong> led to a surge of hybrid architectures that combine both mechanisms. This is arguably the most important trend in sequence modeling as of 2026.'
    },

    {
      type: 'comp-table', id: 'ct-7',
      headers: ['Capability', 'Attention', 'SSM'],
      rows: [
        ['Global context summarization', 'Expensive (quadratic)', '★ Excellent (linear, compressed state)'],
        ['Fine grained token recall', '★ Excellent (direct lookup)', 'Weak (compression loss)'],
        ['Long range memory', 'Degrades with length (cost)', '★ Constant cost per token'],
        ['Associative reasoning', '★ Strong (key value lookup)', 'Weak (state interference)'],
        ['Streaming / real time', 'Difficult (growing KV cache)', '★ Natural (fixed state)'],
        ['Inference memory', 'O(L) KV cache', '★ O(1) constant state']
      ]
    },

    {
      type: 'paragraph', id: 'p-29',
      content: '<strong>Jamba (AI21 Labs, 2024)</strong> was one of the first production grade hybrids. It interleaves ~7 Mamba layers per 1 attention layer — roughly 87% efficient SSM compute with strategic attention "recall checkpoints." The result: Transformer level quality with drastically reduced KV cache size and 256K token context windows.'
    },

    {
      type: 'paragraph', id: 'p-30',
      content: '<strong>Hymba (NVIDIA Research, ICLR 2025)</strong> takes a fundamentally different approach. Instead of stacking SSM and attention layers sequentially, it runs attention heads and SSM heads <strong>in parallel within the same layer</strong>.'
    },

    {
      type: 'code-block', id: 'cb-2', label: 'Sequential Stacking (Jamba)',
      content: 'Input → [SSM] → [SSM] → [SSM] → [Attn] → [SSM]\n                                  ↑\n                      Details may be compressed\n                      away before attention sees them'
    },

    {
      type: 'code-block', id: 'cb-3', label: 'Parallel Fusion (Hymba)',
      content: 'Input → ┌─ [Attention Heads] ─┐\n        │                     │ → Fuse\n        └─ [SSM Heads]  ──────┘\n\nEvery layer has BOTH capabilities.\nNo information lost between stages.'
    },

    {
      type: 'paragraph', id: 'p-31',
      content: 'Within a single Hymba layer, the multi head computation is split: some heads run full softmax attention (fine grained recall), while other heads run selective SSM processing (global context sweep). Their outputs are concatenated and linearly projected. Every layer produces a representation that is both <strong>globally aware</strong> (from SSM heads) and <strong>locally precise</strong> (from attention heads).'
    },

    {
      type: 'paragraph', id: 'p-32',
      content: 'Hymba also introduces <strong>learnable meta tokens</strong> — a small set of special tokens (typically 8 to 128) prepended to every input. These are not part of the actual input; they are learned parameters that act as a "compressed knowledge cache," storing frequently needed information to reduce the attention burden.'
    },

    {
      type: 'comp-table', id: 'ct-8',
      headers: ['Metric', 'Hymba 1.5B', 'Llama 3.2 3B', 'Advantage'],
      rows: [
        ['Parameters', '1.5B', '3B', 'Hymba uses half the parameters'],
        ['Average Accuracy', 'Higher', 'Baseline', 'Better quality with fewer parameters'],
        ['KV Cache Size', 'Significantly smaller', 'Baseline', 'SSM heads need no KV cache'],
        ['Throughput', 'Higher', 'Baseline', 'Linear SSM heads are cheaper to compute']
      ]
    },

    {
      type: 'callout', id: 'c-9', calloutType: 'tip',
      content: '<strong>Why Hymba matters:</strong> Rather than asking "SSM or Transformer?", it asks "how can these two mechanisms complement each other at the finest granularity?" The answer — parallel heads within the same layer — is both elegant and practical. It acknowledges that compression (SSM) and retrieval (attention) are fundamentally different cognitive operations, and a model benefits from having both available at every stage of processing.'
    },

    {
      type: 'paragraph', id: 'p-33',
      content: '<strong>Other notable hybrids:</strong>'
    },

    {
      type: 'comp-table', id: 'ct-9',
      headers: ['Architecture', 'Organization', 'Year', 'Key Design'],
      rows: [
        ['Griffin', 'Google DeepMind', '2024', 'Local attention + linear recurrences. Powers RecurrentGemma.'],
        ['Zamba', 'Zyphra', '2024', 'SSM backbone with shared attention. Optimized for edge deployment.'],
        ['RWKV 6/7', 'RWKV Foundation', '2024–2025', 'RNN style with constant memory. Open source, community driven.'],
        ['Mamba 3', 'Gu, Dao et al.', '2026', 'Complex valued states and MIMO formulation.']
      ]
    },

    // ══ 10. QUICK REFERENCE ══
    { type: 'section', id: 'sec-10', title: 'Quick Reference' },

    {
      type: 'math-box', id: 'm-3',
      expression: 'h_k = \\bar{A} \\cdot h_{k-1} + \\bar{B} \\cdot u_k \\quad \\text{(state update)}\n\ny_k = C \\cdot h_k \\quad \\text{(output)}'
    },

    {
      type: 'comp-table', id: 'ct-10',
      headers: ['Concept', 'Key Idea', 'One Line Summary'],
      rows: [
        ['Fixed size state', 'h ∈ ℝᴺ — same size regardless of sequence length', 'O(1) memory vs. O(L) KV cache'],
        ['HiPPO', 'Optimal polynomial compression of input history', 'How to initialize A for long range memory'],
        ['Three views', 'Recurrence (RNN) / Convolution (CNN) / Matrix multiply', 'Train parallel, deploy sequential'],
        ['Selectivity (Mamba)', 'Input dependent Δ, B, C', 'Content aware gating within linear time'],
        ['SSD (Mamba 2)', 'SSM = structured linear attention', 'Tensor Core optimization, 2 to 8× faster'],
        ['Compression tax', 'Fixed state loses fine grained details', 'Why pure SSMs fail at exact recall'],
        ['Hybrid heads (Hymba)', 'Parallel attention + SSM within each layer', 'Best of both: compression + retrieval']
      ]
    },

    // ══ 11. REFERENCES ══
    { type: 'section', id: 'sec-11', title: 'References & Further Reading' },

    {
      type: 'reference', id: 'r-1',
      title: 'HiPPO: Recurrent Memory with Optimal Polynomial Projections',
      url: 'https://arxiv.org/abs/2008.07669',
      authors: 'Gu, Dao, Ermon, Rudra, Ré',
      venue: 'NeurIPS',
      year: '2020',
      description: 'The memory initialization breakthrough.'
    },
    {
      type: 'reference', id: 'r-2',
      title: 'Efficiently Modeling Long Sequences with Structured State Spaces (S4)',
      url: 'https://arxiv.org/abs/2111.00396',
      authors: 'Gu, Goel, Ré',
      venue: 'ICLR',
      year: '2022',
      description: 'The first practical deep learning SSM.'
    },
    {
      type: 'reference', id: 'r-3',
      title: 'Mamba: Linear Time Sequence Modeling with Selective State Spaces',
      url: 'https://arxiv.org/abs/2312.00752',
      authors: 'Gu and Dao',
      venue: '',
      year: '2023',
      description: 'The selection breakthrough that matched Transformers at scale.'
    },
    {
      type: 'reference', id: 'r-4',
      title: 'Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality (Mamba 2)',
      url: 'https://arxiv.org/abs/2405.21060',
      authors: 'Dao and Gu',
      venue: 'ICML',
      year: '2024',
      description: 'The SSM attention duality.'
    },
    {
      type: 'reference', id: 'r-5',
      title: 'Jamba: A Hybrid Transformer Mamba Language Model',
      url: 'https://arxiv.org/abs/2403.19887',
      authors: 'Lieber et al.',
      venue: 'AI21 Labs',
      year: '2024',
      description: 'The first production hybrid.'
    },
    {
      type: 'reference', id: 'r-6',
      title: 'Hymba: A Hybrid head Architecture for Small Language Models',
      url: 'https://arxiv.org/abs/2411.13676',
      authors: 'Dong et al.',
      venue: 'NVIDIA Research, ICLR',
      year: '2025',
      description: 'Parallel fusion of attention and SSM heads.'
    },
    {
      type: 'reference', id: 'r-7',
      title: 'Griffin: Mixing Gated Linear Recurrences with Local Attention for Efficient Language Models',
      url: 'https://arxiv.org/abs/2402.19427',
      authors: 'De et al.',
      venue: 'Google DeepMind',
      year: '2024',
      description: 'Powers RecurrentGemma.'
    },

    // ── AI DISCLOSURE ──
    {
      type: 'callout', id: 'c-10', calloutType: 'info',
      content: '<strong>A note on this article:</strong> This post was written with the help of AI. All content has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date as of 2026.'
    }
  ]
};
