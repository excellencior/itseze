export const pageData = {
  route: 'concept:encoder',
  urlPath: '/concepts/encoder',
  status: 'published',
  meta: {
    title: 'Encoder (Transformer)',
    subtitle: 'The bidirectional half of the original Transformer. An encoder reads an entire sequence at once and transforms each token from a static, context-free embedding into a rich, context-aware representation — the foundation of every understanding task in modern NLP.',
    category: 'concept',
    subcategory: null,
    ready: true
  },
  blocks: [
    // ── 1. THE CONTEXT PROBLEM ──
    { type: 'section', id: 'sec-1', title: '1. The Context Problem' },
    {
      type: 'paragraph', id: 'p-1',
      content: 'In early NLP, words were mapped to static vectors using algorithms like Word2Vec or GloVe. The word <strong>"bank"</strong> always had the exact same mathematical representation, regardless of whether it appeared in "I sat by the river <strong>bank</strong>" or "I deposited money in the <strong>bank</strong>".'
    },
    {
      type: 'paragraph', id: 'p-2',
      content: 'This is fundamentally broken because language is deeply contextual. A word\'s meaning is almost entirely determined by its surrounding context — what linguists call <HoverCard term="distributional semantics"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Distributional Semantics</div><div style="color:var(--text-muted);font-size:12px">The idea that <strong>"a word is characterized by the company it keeps"</strong> (J.R. Firth, 1957). Words appearing in similar contexts tend to have similar meanings. This is the theoretical foundation behind all embedding methods, from Word2Vec to BERT.</div></HoverCard>.'
    },
    {
      type: 'prop-table', id: 'pt-1',
      title: 'Static vs Contextual Embeddings',
      rows: [
        {
          label: 'Static Embedding (Word2Vec)',
          labelColor: '#EF4444',
          content: '"river <strong>bank</strong>" → bank = [0.23, −0.41, ...]\n"money <strong>bank</strong>" → bank = [0.23, −0.41, ...]\n\nSame vector regardless of context. The model <strong>cannot</strong> distinguish the two meanings.'
        },
        {
          label: 'Contextual Embedding (Encoder)',
          labelColor: '#10B981',
          content: '"river <strong>bank</strong>" → bank = [0.87, 0.12, ...]\n"money <strong>bank</strong>" → bank = [−0.15, 0.93, ...]\n\nDifferent vectors because the encoder has <strong>mixed in context</strong> from surrounding words.'
        }
      ]
    },
    {
      type: 'callout', id: 'c-1', calloutType: 'key',
      content: 'The goal of an <strong>Encoder</strong> is to take a sequence of static, context-free word embeddings and transform them into a sequence of dynamic, context-aware embeddings where each token\'s vector reflects its meaning <em>in this specific sentence</em>.'
    },

    // ── 2. THE ENCODER BLOCK ──
    { type: 'section', id: 'sec-2', title: '2. The Encoder Block' },
    {
      type: 'paragraph', id: 'p-3',
      content: 'The Transformer architecture introduced in <em>Attention Is All You Need</em> (Vaswani et al., 2017) defines a standard encoder block. A full encoder model like BERT stacks many identical copies of this block (typically 12 to 24). Each block has two sub-layers, both wrapped in <HoverCard term="residual connections"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Residual (Skip) Connection</div><div style="color:var(--text-muted);font-size:12px;margin-bottom:8px">Instead of passing input <Latex>x</Latex> through a function to get <Latex>F(x)</Latex>, we output <Latex>x + F(x)</Latex>. This provides a "highway" for gradients to flow backwards during training, preventing the vanishing gradient problem in deep networks.</div><div style="color:var(--text-light);font-size:11px;font-style:italic">Introduced by He et al., 2015 (ResNet)</div></HoverCard> and <HoverCard term="Layer Normalization"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Layer Normalization</div><div style="color:var(--text-muted);font-size:12px">Normalizes the vector across its feature dimension to have mean 0 and variance 1, stabilizing training. Unlike Batch Norm, it operates independently per token, making it suitable for variable-length sequences.</div></HoverCard>.'
    },
    { type: 'custom-element', id: 'w-1', name: 'EncoderBlockDiagram' },
    {
      type: 'math-box', id: 'm-1',
      expression: '\\text{Output}_1 = \\text{LayerNorm}(x + \\text{MultiHeadSelfAttn}(x))'
    },
    {
      type: 'math-box', id: 'm-2',
      expression: '\\text{Output}_2 = \\text{LayerNorm}(\\text{Output}_1 + \\text{FFN}(\\text{Output}_1))'
    },
    {
      type: 'callout', id: 'c-2', calloutType: 'info',
      content: '<strong>Pre-Norm vs Post-Norm:</strong> The original Transformer applies LayerNorm <em>after</em> the residual addition (Post-Norm). Most modern models apply it <em>before</em> the sub-layer (Pre-Norm), which makes training more stable for very deep networks. The equations above show the original Post-Norm variant.'
    },

    // ── 3. A TOKEN'S JOURNEY ──
    { type: 'section', id: 'sec-3', title: "3. A Token's Journey Through One Block" },
    {
      type: 'paragraph', id: 'p-4',
      content: 'Let\'s trace the word <strong>"bank"</strong> through a single encoder block in the sentence "The river bank was flooded". Click each step to see exactly how it transforms:'
    },
    { type: 'custom-element', id: 'w-2', name: 'TokenJourney' },
    {
      type: 'paragraph', id: 'p-5',
      content: 'The critical insight is that the <strong>input and output have the same shape</strong>. Every token goes in as a d-dimensional vector and comes out as a d-dimensional vector. This is what makes encoder blocks stackable — the output of block N becomes the input of block N+1, with each pass refining the contextual representation further.'
    },

    // ── 4. BIDIRECTIONAL VS CAUSAL ──
    { type: 'section', id: 'sec-4', title: '4. Bidirectional vs Causal Attention' },
    {
      type: 'paragraph', id: 'p-6',
      content: '<Highlight>The defining feature of an encoder is that its attention is bidirectional.</Highlight> Every token can attend to every other token in the sequence — past, present, and future. This is in sharp contrast to decoder-style causal attention, where each token can only see tokens that came before it.'
    },
    {
      type: 'prop-table', id: 'pt-2',
      title: 'Attention Mask Comparison',
      rows: [
        {
          label: 'Encoder: Bidirectional (no mask)',
          labelColor: '#3B82F6',
          content: 'Full 5×5 attention matrix — all positions marked ✓. Every token sees everything.'
        },
        {
          label: 'Decoder: Causal (masked)',
          labelColor: '#EF4444',
          content: 'Lower-triangular 5×5 attention matrix — positions above the diagonal marked ✕. Each token only sees the past.'
        }
      ]
    },
    {
      type: 'paragraph', id: 'p-7',
      content: 'This is why encoders excel at <strong>understanding</strong> tasks. When classifying sentiment, answering questions, or extracting entities, you want the model to see the full picture. The word "not" at the end of a sentence completely changes the meaning of every word before it — a causal model would miss this until it reaches that token.'
    },
    {
      type: 'callout', id: 'c-3', calloutType: 'accent',
      content: '<strong>The trade-off:</strong> Bidirectional attention makes encoders great at understanding but unsuitable for text generation. You can\'t generate token-by-token if every token needs to see tokens that haven\'t been generated yet. This is why generation tasks use decoders.'
    },

    // ── 5. STACKING ──
    { type: 'section', id: 'sec-5', title: '5. Stacking: Depth Equals Understanding' },
    {
      type: 'paragraph', id: 'p-8',
      content: 'A single encoder block gives each token a basic sense of its neighbors. But language has layers of meaning — syntax, semantics, pragmatics, world knowledge — that can\'t be captured in one pass. By stacking identical blocks, each layer builds upon the representations of the previous one, extracting progressively more abstract features.'
    },
    {
      type: 'list', id: 'l-1', listType: 'unordered',
      items: [
        '<strong>Layers 1–4 — Surface Features:</strong> Part-of-speech, basic word relationships, local syntax. Similar to what a traditional parser captures.',
        '<strong>Layers 5–8 — Syntactic Structure:</strong> Subject-verb agreement, dependency parsing, clause boundaries. The model "understands" grammar.',
        '<strong>Layers 9–12 — Semantic Meaning:</strong> Word sense disambiguation, coreference resolution, entity relationships. "bank" finally resolves to its correct meaning.'
      ]
    },
    {
      type: 'callout', id: 'c-4', calloutType: 'info',
      content: '<strong>Probing studies</strong> (Hewitt &amp; Manning, 2019; Tenney et al., 2019) have confirmed this layered hierarchy empirically. You can train simple classifiers on the intermediate representations of each layer to test what information is encoded at each depth.'
    },

    // ── 6. ENCODER VS DECODER ──
    { type: 'section', id: 'sec-6', title: '6. Encoder vs Decoder — When to Use What' },
    {
      type: 'paragraph', id: 'p-9',
      content: 'The original Transformer had both an encoder and a decoder. Modern architectures tend to specialize. The choice of architecture depends entirely on whether you need to <strong>understand</strong> input or <strong>generate</strong> output.'
    },
    {
      type: 'tabs', id: 't-1',
      tabs: [
        {
          label: 'Encoder-Only',
          content: '<div style="color:#3B82F6;font-weight:800;font-size:15px;margin-bottom:8px">Encoder-Only</div><div style="font-size:12px;color:var(--text-muted);line-height:1.6;margin-bottom:8px">Sees full context in both directions. Optimal for understanding.</div><div style="font-size:11px"><div><strong>Models:</strong> BERT, RoBERTa, DeBERTa</div><div><strong>Attention:</strong> Bidirectional self-attention</div><div><strong>Tasks:</strong> Classification, NER, QA, embeddings</div></div>'
        },
        {
          label: 'Decoder-Only',
          content: '<div style="color:#10B981;font-weight:800;font-size:15px;margin-bottom:8px">Decoder-Only</div><div style="font-size:12px;color:var(--text-muted);line-height:1.6;margin-bottom:8px">Generates token by token. Scales to massive sizes.</div><div style="font-size:11px"><div><strong>Models:</strong> GPT, LLaMA, Claude, Gemini</div><div><strong>Attention:</strong> Causal self-attention</div><div><strong>Tasks:</strong> Text generation, chat, code, reasoning</div></div>'
        },
        {
          label: 'Encoder-Decoder',
          content: '<div style="color:#8B5CF6;font-weight:800;font-size:15px;margin-bottom:8px">Encoder-Decoder</div><div style="font-size:12px;color:var(--text-muted);line-height:1.6;margin-bottom:8px">Encoder understands input; decoder generates output conditioned on it.</div><div style="font-size:11px"><div><strong>Models:</strong> T5, BART, Whisper</div><div><strong>Attention:</strong> Bidirectional + causal + cross</div><div><strong>Tasks:</strong> Translation, summarization, ASR</div></div>'
        }
      ]
    },
    {
      type: 'callout', id: 'c-5', calloutType: 'accent',
      content: '<strong>Industry trend:</strong> The field has largely converged on decoder-only models for general-purpose AI. But encoder-only models remain <strong>dominant</strong> for search, retrieval, classification, and embedding — any task where you need a fixed-size representation of text.'
    },

    // ── 7. ENCODER MODELS IN THE WILD ──
    { type: 'section', id: 'sec-7', title: '7. Encoder Models in the Wild' },
    {
      type: 'paragraph', id: 'p-10',
      content: 'All major encoder models share the same fundamental block architecture described above. They differ in training objectives, data scale, and architectural tweaks.'
    },
    {
      type: 'prop-table', id: 'pt-3',
      rows: [
        ['BERT (2018)', '12 layers, 768d, 12 heads, 110M params. Trained with Masked Language Modeling (MLM). The model that started the encoder era.'],
        ['RoBERTa (2019)', 'Same architecture as BERT, but trained with 10× more data, no NSP objective, and dynamic masking. Consistently outperforms BERT.'],
        ['ALBERT (2019)', 'Parameter-efficient: shares weights across layers and factorizes the embedding matrix. 18× fewer params than BERT-large with competitive performance.'],
        ['DeBERTa (2020)', 'Disentangles content and position into separate attention streams. Adds an enhanced mask decoder. SOTA on many NLU benchmarks.'],
        ['ViT (2020)', 'Applies the encoder to vision: splits images into 16×16 patches, treats them as tokens, and runs standard Transformer encoding. Proved that attention scales beyond NLP.']
      ]
    },
    {
      type: 'callout', id: 'c-6', calloutType: 'key',
      content: '<strong>The encoder\'s secret weapon:</strong> <HoverCard term="Masked Language Modeling (MLM)"><div style="font-weight:700;font-size:14px;margin-bottom:8px">Masked Language Modeling</div><div style="color:var(--text-muted);font-size:12px;margin-bottom:8px">During pre-training, 15% of input tokens are randomly replaced with a <strong>[MASK]</strong> token. The model must predict the original word using only the surrounding context. This forces the encoder to build deep bidirectional representations of every token.</div><div style="color:var(--text-light);font-size:11px;font-style:italic">Introduced by Devlin et al. (BERT, 2018)</div></HoverCard> is the pre-training objective that makes bidirectional encoding possible. Unlike autoregressive training (predict the next word), MLM forces the encoder to use <em>both</em> left and right context, producing richer representations.'
    },

    // ── QUICK REFERENCE ──
    { type: 'section', id: 'sec-8', title: 'Quick Reference' },
    {
      type: 'prop-table', id: 'pt-4',
      headers: ['Property', 'Encoder', 'Decoder'],
      rows: [
        ['Attention direction', 'Bidirectional (full)', 'Causal (lower-triangular mask)'],
        ['Sees future tokens?', '✅ Yes', '❌ No'],
        ['Can generate text?', '❌ Not directly', '✅ Yes, autoregressively'],
        ['Typical pre-training', 'MLM (fill in blanks)', 'Next-token prediction'],
        ['Output shape', 'Same as input (n × d)', 'Same as input (n × d)'],
        ['Sub-layers per block', 'Self-Attention + FFN', 'Self-Attention + (Cross-Attn) + FFN'],
        ['Best for', 'Understanding, retrieval, classification', 'Generation, conversation, reasoning']
      ]
    },

    // ── REFERENCES ──
    { type: 'section', id: 'sec-9', title: 'References & Further Reading' },
    {
      type: 'reference', id: 'r-1',
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      authors: 'Vaswani et al.',
      year: '2017',
      description: 'The paper that introduced the Transformer encoder-decoder architecture.'
    },
    {
      type: 'reference', id: 'r-2',
      title: 'BERT: Pre-training of Deep Bidirectional Transformers',
      url: 'https://arxiv.org/abs/1810.04805',
      authors: 'Devlin et al.',
      year: '2018',
      description: 'Showed that encoder-only models with MLM dominate NLU tasks.'
    },
    {
      type: 'reference', id: 'r-3',
      title: 'RoBERTa: A Robustly Optimized BERT',
      url: 'https://arxiv.org/abs/1907.11692',
      authors: 'Liu et al.',
      year: '2019',
      description: 'Better training recipe for BERT-style encoders.'
    },
    {
      type: 'reference', id: 'r-4',
      title: 'DeBERTa: Decoding-enhanced BERT with Disentangled Attention',
      url: 'https://arxiv.org/abs/2006.03654',
      authors: 'He et al.',
      year: '2020',
      description: 'Disentangled position and content attention.'
    },
    {
      type: 'reference', id: 'r-5',
      title: 'An Image Is Worth 16x16 Words (ViT)',
      url: 'https://arxiv.org/abs/2010.11929',
      authors: 'Dosovitskiy et al.',
      year: '2020',
      description: 'Proved the encoder architecture works for vision.'
    },
    {
      type: 'reference', id: 'r-6',
      title: 'The Illustrated Transformer',
      url: 'https://jalammar.github.io/illustrated-transformer/',
      authors: 'Jay Alammar',
      year: null,
      description: "Jay Alammar's visual walkthrough. The best resource for building intuition."
    },
    {
      type: 'reference', id: 'r-7',
      title: 'Attention in transformers, visually explained',
      url: 'https://www.youtube.com/watch?v=eMlx5fFNoYc',
      authors: '3Blue1Brown',
      year: null,
      description: 'Outstanding visual explanation of how attention works inside the encoder.'
    },

    // ── AI DISCLOSURE ──
    {
      type: 'callout', id: 'c-7', calloutType: 'info',
      content: '<strong>A note on this article:</strong> This post was written with the help of AI. Interactive elements (click-to-pin block diagram with linked equation highlighting, tabbed token walkthrough, attention mask comparisons) were designed to aid understanding. All content has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date as of 2026.'
    }
  ]
};
