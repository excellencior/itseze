export const pageData = {
  route: 'concept:reasoning-rag',
  urlPath: '/concepts/reasoning/rag',
  status: 'published',
  meta: {
    title: 'Retrieval-Augmented Reasoning (RAG)',
    subtitle: 'Outsourcing factual memory to external knowledge stores. RAG pipelines query vector databases to inject verified context into the LLM\'s input, enabling grounded reasoning with up-to-date and domain-specific knowledge — without retraining or modifying model weights.',
    category: 'concept',
    subcategory: 'Reasoning',
    route: 'concept:reasoning-rag',
    ready: true
  },
  blocks: [
    // ── Section 1: The Knowledge Staleness Problem ──
    {
      type: 'section',
      id: 'sec-1',
      title: '1. The Knowledge Staleness Problem'
    },
    {
      type: 'paragraph',
      id: 'p-1',
      content: 'Large language models are knowledge snapshots: they lock everything they know inside static weight matrices at the end of training. This creates three fundamental problems:'
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Temporal staleness</strong>: A model trained in January 2024 cannot answer questions about events in March 2024. The world keeps moving; the model\'s knowledge does not.',
        '<strong>Domain gaps</strong>: General-purpose models lack deep expertise in specialized domains (medical records, legal case law, proprietary codebases) unless they were specifically trained on that data.',
        '<strong>Parameter bloat</strong>: Trying to memorize the entirety of human knowledge within model weights leads to enormous parameter counts, training costs, and — ironically — more hallucinations, because the model must compress and approximate vast amounts of information.'
      ]
    },

    // ── Section 2: The RAG Architecture ──
    {
      type: 'section',
      id: 'sec-2',
      title: '2. The RAG Architecture'
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content: '<strong>Retrieval-Augmented Generation</strong>, introduced by Lewis et al. (2020), provides an elegant solution: instead of expecting the model to memorize everything, the system searches an external knowledge base for relevant information and injects it directly into the prompt\'s context window.'
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content: 'The standard RAG pipeline has three phases:'
    },
    {
      type: 'prop-table',
      id: 'pt-1',
      rows: [
        ['Phase 1: Embed', 'Documents are chunked and converted into dense vector embeddings using a model like <strong>E5</strong>, <strong>BGE</strong>, or OpenAI\'s <strong>text-embedding</strong> series. These vectors capture semantic meaning.'],
        ['Phase 2: Retrieve', 'The user\'s query is embedded and compared against the document vectors using <strong>cosine similarity</strong> or approximate nearest neighbor (ANN) search. Top-<Latex>k</Latex> chunks are selected.'],
        ['Phase 3: Generate', 'Retrieved chunks are prepended to the prompt as context. The LLM synthesizes an answer grounded in the retrieved evidence, with explicit references where possible.']
      ]
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content: 'RAG fundamentally redefines the role of the LLM: from a <strong>factual database</strong> (which it is poor at, prone to hallucinations) to a <strong>reasoning engine</strong> that synthesizes and analyzes facts provided in context (which it is excellent at).'
    },

    // ── Section 3: Active Retrieval and Self-RAG ──
    {
      type: 'section',
      id: 'sec-3',
      title: '3. Active Retrieval and Self-RAG'
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content: 'Standard RAG is <em>passive</em>: it retrieves once at the beginning of a query and generates. But not every query needs retrieval (simple greetings, creative tasks), and some queries need <em>multiple</em> retrieval rounds (complex multi-hop questions where the first retrieved passage points to another topic that must also be looked up).'
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content: '<strong>Self-RAG</strong> (Asai et al., ICLR 2024) addresses this by training the LLM itself to decide <em>when</em> retrieval is needed. The model generates special <strong>reflection tokens</strong> that evaluate: (1) whether retrieval is necessary, (2) whether the retrieved passages are relevant, and (3) whether the generated response is supported by the evidence. These tokens enable the model to critique its own retrieval and generation process in real time.'
    },
    {
      type: 'paragraph',
      id: 'p-6',
      content: 'Additionally, <strong>DSPy</strong> (Khattab et al., ICLR 2024) takes a programming-language approach to RAG: developers write declarative modules (Retrieve, ChainOfThought, Assert), and DSPy\'s compiler automatically optimizes prompt instructions and few-shot demonstrations based on validation metrics — turning hand-crafted RAG pipelines into self-improving programs.'
    },

    // ── Section 4: Interactive RAG Simulator ──
    {
      type: 'section',
      id: 'sec-4',
      title: '4. Interactive RAG Simulator'
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content: 'Experiment with the retrieval pipeline below. Adjust the cosine similarity threshold to control how many documents enter the context window. Notice how lowering the threshold includes more (but less relevant) chunks, while raising it aggressively can exclude critical information. Try toggling individual documents on/off to see how the generator\'s output changes.'
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'RagPipelineSimulator'
    },

    // ── Section 5: Design Trade-offs and Challenges ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. Design Trade-offs and Challenges'
    },
    {
      type: 'paragraph',
      id: 'p-8',
      content: 'Building production RAG systems requires navigating several critical trade-offs:'
    },
    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Chunking strategy</strong>: How documents are segmented (sentences, paragraphs, fixed token windows, or semantic sections) dramatically affects retrieval precision. Too small and you lose context; too large and you dilute the signal.',
        '<strong>Context window limits</strong>: Even with 128K-token context windows, injecting too many retrieved passages creates the <strong>needle-in-a-haystack</strong> problem — the model struggles to locate and utilize the relevant passage among many irrelevant ones.',
        '<strong>Embedding model quality</strong>: The retriever is only as good as its embedding model. If the embedding space doesn\'t capture the semantic relationship between the query and the answer, no amount of LLM sophistication can compensate.',
        '<strong>Latency vs. quality</strong>: Vector search adds overhead (typically 50–200ms), and multi-hop retrieval can multiply this. Real-time applications require careful optimization of ANN indices (HNSW, IVF) and caching strategies.',
        '<strong>Attribution and traceability</strong>: A key advantage of RAG is that answers can be traced back to source documents, enabling fact-checking and citation. But this only works if the pipeline preserves provenance metadata through the entire chain.'
      ]
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'warning',
      content: 'RAG does not eliminate hallucinations — it reduces them. If the retriever returns irrelevant passages, or if the LLM ignores the retrieved context in favor of its parametric memory, the system can still produce unfounded claims. Robust RAG systems require both retrieval quality and generation faithfulness.'
    },

    // ── References ──
    {
      type: 'section',
      id: 'sec-6',
      title: 'References & Further Reading'
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      url: 'https://arxiv.org/abs/2005.11401',
      authors: 'Lewis, P., Perez, E., Piktus, A., et al.',
      year: '2020',
      description: 'The foundational RAG paper, introducing the retrieve-then-generate paradigm for knowledge-intensive NLP.'
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection',
      url: 'https://arxiv.org/abs/2310.11511',
      authors: 'Asai, A., Wu, Z., Wang, Y., Sil, A., & Hajishirzi, H.',
      year: '2024',
      description: 'Trains the LLM to decide when retrieval is needed using reflection tokens.'
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines',
      url: 'https://arxiv.org/abs/2310.03714',
      authors: 'Khattab, O., Singhvi, A., Maheshwari, P., et al.',
      year: '2024',
      description: 'A programming framework that automatically optimizes RAG pipeline prompts and demonstrations.'
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'Needle in a Haystack — Pressure Testing LLMs',
      url: 'https://github.com/gkamradt/LLMTest_NeedleInAHaystack',
      authors: 'Kamradt, G.',
      year: '2023',
      description: 'An empirical benchmark testing LLM ability to retrieve specific facts from long contexts.'
    }
  ]
};
