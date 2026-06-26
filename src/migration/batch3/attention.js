export const pageData = {
  route: 'concept:attention',
  urlPath: '/concepts/attention',
  status: 'published',
  meta: {
    title: 'Attention Mechanisms',
    subtitle: 'The mechanism that lets a model dynamically focus on the most relevant parts of its input. Attention is the foundational building block of every modern transformer.',
    category: 'concept',
    subcategory: null,
    ready: true
  },
  blocks: [
    // ── Section 1: The Bottleneck Problem ──
    { type: 'section', id: 'sec-1', title: 'The Bottleneck Problem' },

    {
      type: 'paragraph', id: 'p-1',
      content: 'Before attention existed, sequence-to-sequence models (like early machine translation systems) worked by reading an entire input sentence and compressing it into a single fixed-size vector. This vector, called the <HoverCard term="context vector"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Context Vector</div><div style="color:var(--text-muted);font-size:12px">A single hidden state vector (typically 256 to 1024 dimensions) that the encoder produces after processing the entire input. The decoder then had to reconstruct the <strong>entire output</strong> from just this one vector.</div></HoverCard>, was the only thing the decoder had access to.'
    },

    {
      type: 'paragraph', id: 'p-2',
      content: 'Think about translating a 50 word paragraph. All the nuance, word order, and meaning of those 50 words had to be jammed into a single vector of a few hundred numbers. As sentences got longer, translation quality collapsed. This was the <strong>information bottleneck</strong>.'
    },

    {
      type: 'callout', id: 'c-1', calloutType: 'warning',
      content: '<strong>The longer the input, the worse the bottleneck.</strong> Sutskever et al. (2014) showed that seq2seq models degraded sharply beyond ~20 tokens because the fixed-size vector simply could not encode enough information.'
    },

    {
      type: 'paragraph', id: 'p-3',
      content: '<Highlight>Bahdanau, Cho &amp; Bengio (2014) solved this by letting the decoder look back at every encoder state, not just the final one.</Highlight> Instead of one summary vector, the model learned to <em>attend</em> to different parts of the input at each decoding step. This was the birth of attention.'
    },

    // ── Section 2: The Core Intuition: Query, Key, Value ──
    { type: 'section', id: 'sec-2', title: 'The Core Intuition: Query, Key, Value' },

    {
      type: 'paragraph', id: 'p-4',
      content: 'Every attention mechanism boils down to three ingredients: a <strong>Query</strong>, a set of <strong>Keys</strong>, and a set of <strong>Values</strong>. The analogy is a search engine.'
    },

    {
      type: 'prop-table', id: 'pt-1',
      rows: [
        ['Query (Q)', 'What am I looking for? — The current token asking a question about context.'],
        ['Key (K)', 'What do I contain? — Each token advertising what information it holds.'],
        ['Value (V)', "Here's my content. — The actual information retrieved when a key is matched."]
      ]
    },

    {
      type: 'paragraph', id: 'p-5',
      content: 'When the word "cat" is being processed, it sends out a query: <em>"Who in this sentence is relevant to me?"</em> Every other word responds with its key. The query is compared against all keys to produce a set of attention weights. These weights determine how much of each word\'s value gets mixed into the final representation of "cat".'
    },

    {
      type: 'callout', id: 'c-2', calloutType: 'tip',
      content: '<strong>The key insight:</strong> Q, K, and V are not hand-designed. They are <strong>learned linear projections</strong> of the input: <Latex>Q = XW_Q, \\quad K = XW_K, \\quad V = XW_V</Latex>. The network learns <em>what to ask</em>, <em>what to advertise</em>, and <em>what to return</em>.'
    },

    // ── Section 3: Scaled Dot-Product Attention ──
    { type: 'section', id: 'sec-3', title: 'Scaled Dot-Product Attention' },

    {
      type: 'math-box', id: 'm-1',
      expression: '\\text{Attention}(Q, K, V) = \\text{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d_k}}\\right) V'
    },

    {
      type: 'prop-table', id: 'pt-2',
      rows: [
        ['Inputs', 'Q ∈ ℝⁿˣᵈ, K ∈ ℝⁿˣᵈ, V ∈ ℝⁿˣᵈ'],
        ['Output', 'Weighted combination of V, same shape as Q'],
        ['Complexity', 'O(n² · d) where n = sequence length'],
        ['Used in', 'Every transformer ever built']
      ]
    },

    {
      type: 'paragraph', id: 'p-6',
      content: 'Let\'s walk through this step by step with concrete numbers. Say we have a 6-token sentence and d_k = 4.'
    },

    {
      type: 'heading', id: 'h-1', level: 3,
      text: 'Step 1 — Compute similarity scores'
    },

    {
      type: 'math-box', id: 'm-2',
      expression: 'S = QK^\\top \\in \\mathbb{R}^{n \\times n}'
    },

    {
      type: 'paragraph', id: 'p-7',
      content: 'Each entry S[i][j] is the dot product between query i and key j. Higher dot product = more relevant.'
    },

    {
      type: 'heading', id: 'h-2', level: 3,
      text: 'Step 2 — Scale to prevent exploding softmax'
    },

    {
      type: 'math-box', id: 'm-3',
      expression: 'S_{\\text{scaled}} = \\frac{S}{\\sqrt{d_k}}'
    },

    {
      type: 'paragraph', id: 'p-8',
      content: 'Without scaling, large d_k causes dot products to grow in magnitude, pushing softmax into saturated regions where gradients vanish. Dividing by <Latex>\\sqrt{d_k}</Latex> keeps the variance at ~1.'
    },

    {
      type: 'heading', id: 'h-3', level: 3,
      text: 'Step 3 — Normalize with softmax'
    },

    {
      type: 'math-box', id: 'm-4',
      expression: '\\alpha_{ij} = \\text{softmax}_j\\!\\left(\\frac{S_{ij}}{\\sqrt{d_k}}\\right) = \\frac{e^{S_{ij}/\\sqrt{d_k}}}{\\sum_k e^{S_{ik}/\\sqrt{d_k}}}'
    },

    {
      type: 'paragraph', id: 'p-9',
      content: 'Each row sums to 1. Now α[i][j] is the <strong>attention weight</strong>: how much token i attends to token j.'
    },

    {
      type: 'heading', id: 'h-4', level: 3,
      text: 'Step 4 — Weighted sum of values'
    },

    {
      type: 'math-box', id: 'm-5',
      expression: '\\text{output}_i = \\sum_j \\alpha_{ij} \\cdot V_j'
    },

    {
      type: 'paragraph', id: 'p-10',
      content: 'Each token\'s output is a blend of all values, weighted by attention. Highly attended tokens contribute more.'
    },

    {
      type: 'paragraph', id: 'p-11',
      content: 'Let\'s trace the full computation for "The cat sat on the mat". Click through each step below to see how raw embeddings become attention weights:'
    },

    {
      type: 'custom-element', id: 'w-1',
      name: 'AttentionWalkthrough'
    },

    {
      type: 'paragraph', id: 'p-12',
      content: 'Each row in the final matrix is a probability distribution. The model uses these weights to blend the Value vectors, producing a context-aware representation for each token.'
    },

    // ── Section 4: Self-Attention vs Cross-Attention ──
    { type: 'section', id: 'sec-4', title: '4. Self-Attention vs Cross-Attention' },

    {
      type: 'paragraph', id: 'p-13',
      content: '<Highlight>Self-attention is what makes transformers transformers.</Highlight> It is the mechanism where a sequence attends to <em>itself</em>. Every token in the input simultaneously queries every other token in the same sequence to build a context-aware representation.'
    },

    {
      type: 'heading', id: 'h-5', level: 3,
      text: 'Self-Attention'
    },

    {
      type: 'math-box', id: 'm-6',
      expression: 'Q, K, V = XW_Q, \\; XW_K, \\; XW_V'
    },

    {
      type: 'paragraph', id: 'p-14',
      content: 'Q, K, V all come from the <strong>same input X</strong>. Each token can attend to every other token in the same sequence, building rich contextual representations.'
    },

    {
      type: 'paragraph', id: 'p-15',
      content: 'Used in: GPT (decoder), BERT (encoder), ViT'
    },

    {
      type: 'heading', id: 'h-6', level: 3,
      text: 'Cross-Attention'
    },

    {
      type: 'math-box', id: 'm-7',
      expression: 'Q = XW_Q, \\quad K, V = YW_K, \\; YW_V'
    },

    {
      type: 'paragraph', id: 'p-16',
      content: 'Q comes from one sequence (decoder), but K and V come from a <strong>different sequence</strong> (encoder output). This is how the decoder "reads" the encoder.'
    },

    {
      type: 'paragraph', id: 'p-17',
      content: 'Used in: original Transformer, T5, Whisper, Stable Diffusion'
    },

    {
      type: 'paragraph', id: 'p-18',
      content: 'In the original Transformer (Vaswani et al., 2017), both types appear. The encoder uses self-attention so each source token can see all other source tokens. The decoder uses <strong>causal self-attention</strong> (more on that below) plus cross-attention to read the encoder output. Modern decoder-only models like GPT use only causal self-attention and have no cross-attention at all.'
    },

    // ── Section 5: Multi-Head Attention ──
    { type: 'section', id: 'sec-5', title: '5. Multi-Head Attention' },

    {
      type: 'math-box', id: 'm-8',
      expression: '\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\ldots, \\text{head}_h)\\, W^O'
    },

    {
      type: 'paragraph', id: 'p-19',
      content: 'where <Latex>\\text{head}_i = \\text{Attention}(QW_i^Q,\\; KW_i^K,\\; VW_i^V)</Latex>'
    },

    {
      type: 'prop-table', id: 'pt-3',
      rows: [
        ['Heads (h)', 'Typically 12 (base) or 16-96 (large models)'],
        ['Head dimension', 'd_k = d_model / h (e.g., 768/12 = 64)'],
        ['Parameters', 'h separate W_Q, W_K, W_V projections + one W_O'],
        ['GPT-3', '96 heads, d_k = 128, d_model = 12288']
      ]
    },

    {
      type: 'paragraph', id: 'p-20',
      content: '<Highlight>A single attention head can only learn one type of relationship.</Highlight> Multi-head attention runs <strong>h parallel attention operations</strong>, each with its own learned projections. One head might learn syntactic relationships (subject-verb), another might learn positional proximity, and another might capture coreference (pronouns to their antecedents).'
    },

    {
      type: 'callout', id: 'c-3', calloutType: 'tip',
      content: '<strong>Why not just use a bigger single head?</strong> Multiple smaller heads are more expressive than one large head with the same total parameters. Each head operates in its own <HoverCard term="subspace"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Subspace Projection</div><div style="color:var(--text-muted);font-size:12px">Each head projects Q, K, V into a <strong>lower-dimensional space</strong> (d_model/h dimensions). This forces each head to specialize, learning different aspects of the input relationships rather than redundantly learning the same patterns.</div></HoverCard>, so they naturally learn complementary features.'
    },

    {
      type: 'paragraph', id: 'p-21',
      content: 'After all heads compute their attention, the results are concatenated and passed through a final linear projection <Latex>W^O</Latex> to mix the information from different heads back together.'
    },

    // ── Section 6: Causal (Masked) Attention ──
    { type: 'section', id: 'sec-6', title: '6. Causal (Masked) Attention' },

    {
      type: 'paragraph', id: 'p-22',
      content: 'In autoregressive models like GPT, the model generates tokens one at a time, left to right. During training, we process the entire sequence at once for efficiency, but the model must not be able to "cheat" by looking at future tokens. This is enforced with a <strong>causal mask</strong>.'
    },

    {
      type: 'math-box', id: 'm-9',
      expression: '\\text{Mask}_{ij} = \\begin{cases} 0 & \\text{if } j \\leq i \\;\\text{(allowed)} \\\\ -\\infty & \\text{if } j > i \\;\\text{(blocked)} \\end{cases}'
    },

    {
      type: 'paragraph', id: 'p-23',
      content: 'The mask is added to the attention scores <em>before</em> softmax. Setting future positions to −∞ makes their softmax output exactly 0, so no information leaks from the future.'
    },

    {
      type: 'paragraph', id: 'p-24',
      content: 'Causal mask for a 5-token sequence: a lower-triangular matrix where position [i][j] is allowed (✓) if j ≤ i and blocked (−∞) if j > i.'
    },

    {
      type: 'callout', id: 'c-4', calloutType: 'accent',
      content: '<strong>BERT vs GPT:</strong> BERT uses <strong>bidirectional</strong> self-attention (no mask, every token sees everything). GPT uses <strong>causal</strong> self-attention (lower-triangular mask). This is why BERT excels at understanding tasks and GPT excels at generation.'
    },

    // ── Section 7: Attention in Practice ──
    { type: 'section', id: 'sec-7', title: '7. Attention in Practice' },

    {
      type: 'paragraph', id: 'p-25',
      content: 'Attention appears in different configurations across the major architectures. The distinction comes down to which tokens can see which other tokens, and whether cross-attention is used.'
    },

    {
      type: 'prop-table', id: 'pt-4',
      rows: [
        ['GPT (decoder-only)', 'Causal self-attention only. Each token sees past tokens + itself. No encoder.'],
        ['BERT (encoder-only)', 'Bidirectional self-attention. Every token sees every other token. No decoder.'],
        ['T5 / Original Transformer', 'Encoder: bidirectional self-attn. Decoder: causal self-attn + cross-attn to encoder.'],
        ['Vision Transformer (ViT)', 'Image split into patches → treated as tokens → bidirectional self-attention.'],
        ['Stable Diffusion', 'Cross-attention between image latents (Q) and text embeddings (K, V) from CLIP.']
      ]
    },

    {
      type: 'callout', id: 'c-5', calloutType: 'info',
      content: '<strong>A trend to notice:</strong> the field has largely moved toward <strong>decoder-only</strong> models (GPT, Llama, Claude, Gemini). The encoder-decoder architecture is now mostly used in specialized tasks like translation and speech recognition (Whisper).'
    },

    // ── Section 8: The O(n²) Problem ──
    { type: 'section', id: 'sec-8', title: '8. The O(n²) Problem' },

    {
      type: 'paragraph', id: 'p-26',
      content: 'The attention matrix has shape n × n, where n is the sequence length. This means attention is <strong>quadratic in both compute and memory</strong>. Double the sequence length, and you quadruple the cost. This is why context windows are expensive.'
    },

    {
      type: 'math-box', id: 'm-10',
      expression: '\\text{Cost} = O(n^2 \\cdot d)'
    },

    {
      type: 'paragraph', id: 'p-27',
      content: 'For GPT-3 with a 2048-token context window, the attention matrix has 2048 × 2048 = ~4.2M entries <em>per head, per layer</em>. With 96 heads across 96 layers, that is a staggering amount of computation. Scaling to 128K or 1M token contexts requires fundamental algorithmic changes.'
    },

    {
      type: 'callout', id: 'c-6', calloutType: 'tip',
      content: '<strong>Solutions people have tried:</strong> <HoverCard term="Flash Attention"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Flash Attention</div><div style="color:var(--text-muted);font-size:12px">An IO-aware algorithm (Dao et al., 2022) that <strong>fuses</strong> the attention computation into a single GPU kernel, avoiding materializing the full n×n matrix in HBM. Gives 2-4× speedup with exact (not approximate) attention.</div></HoverCard> fuses computation to avoid materializing the full matrix. <HoverCard term="Sparse attention"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Sparse Attention</div><div style="color:var(--text-muted);font-size:12px">Instead of attending to all n tokens, each token only attends to a <strong>subset</strong> (local window + some global tokens). Reduces complexity to O(n√n) or O(n log n). Used in Longformer, BigBird.</div></HoverCard> limits which tokens attend to each other. Sliding window attention (Mistral) restricts attention to a fixed local window.'
    },

    // ── Section 9: Quick Reference ──
    { type: 'section', id: 'sec-9', title: 'Quick Reference' },

    {
      type: 'prop-table', id: 'pt-5',
      rows: [
        ['Scaled Dot-Product', 'softmax(QKᵀ/√d_k)V — Core attention: similarity → weights → blend values'],
        ['Self-Attention', 'Q,K,V from same X — Token attends to its own sequence'],
        ['Cross-Attention', 'Q from X, K/V from Y — Token attends to a different sequence'],
        ['Multi-Head', 'Concat(head₁…h)W_O — Parallel heads learn different relationships'],
        ['Causal Mask', 'mask future to −∞ — Prevents seeing future tokens in generation']
      ]
    },

    // ── Section 10: References & Further Reading ──
    { type: 'section', id: 'sec-10', title: 'References & Further Reading' },

    {
      type: 'reference', id: 'r-1',
      title: 'Attention in transformers, visually explained',
      url: 'https://www.youtube.com/watch?v=eMlx5fFNoYc',
      authors: '3Blue1Brown',
      venue: 'YouTube',
      year: '',
      description: 'The absolute best place to understand what attention is and visualize how it works intuitively.'
    },

    {
      type: 'reference', id: 'r-2',
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      authors: 'Vaswani et al.',
      venue: 'NeurIPS',
      year: '2017',
      description: 'The paper that introduced the Transformer and scaled dot-product attention.'
    },

    {
      type: 'reference', id: 'r-3',
      title: 'Neural Machine Translation by Jointly Learning to Align and Translate',
      url: 'https://arxiv.org/abs/1409.0473',
      authors: 'Bahdanau, Cho & Bengio',
      venue: 'ICLR',
      year: '2014',
      description: 'The paper that introduced attention for seq2seq.'
    },

    {
      type: 'reference', id: 'r-4',
      title: 'Sequence to Sequence Learning with Neural Networks',
      url: 'https://arxiv.org/abs/1409.3215',
      authors: 'Sutskever, Vinyals & Le',
      venue: 'NeurIPS',
      year: '2014',
      description: 'The encoder-decoder bottleneck that motivated attention.'
    },

    {
      type: 'reference', id: 'r-5',
      title: 'FlashAttention: Fast and Memory-Efficient Exact Attention',
      url: 'https://arxiv.org/abs/2205.14135',
      authors: 'Dao et al.',
      venue: 'NeurIPS',
      year: '2022',
      description: 'IO-aware attention algorithm.'
    },

    {
      type: 'reference', id: 'r-6',
      title: 'Longformer: The Long-Document Transformer',
      url: 'https://arxiv.org/abs/2004.05150',
      authors: 'Beltagy, Peters & Cohan',
      venue: 'arXiv',
      year: '2020',
      description: 'Sparse attention for long sequences.'
    },

    {
      type: 'reference', id: 'r-7',
      title: 'The Illustrated Transformer',
      url: 'https://jalammar.github.io/illustrated-transformer/',
      authors: 'Jay Alammar',
      venue: 'Blog',
      year: '',
      description: 'Jay Alammar\'s visual walkthrough. Excellent for building intuition.'
    },

    // ── AI Disclosure ──
    {
      type: 'callout', id: 'c-7', calloutType: 'info',
      content: '<strong>A note on this article:</strong> This post was written with the help of AI. All content has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date as of 2025.'
    }
  ]
};
