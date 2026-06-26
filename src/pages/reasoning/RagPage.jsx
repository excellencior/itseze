import { useState } from 'react';
import Latex from '../../components/Latex';
import Callout from '../../components/Callout';

function Section({ title, children }) {
  return (
    <div id={title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')} data-section style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p>{children}</p>;
}


const mockKnowledgeBase = [
  { id: 'chunk1', text: 'DeepProbLog was introduced by Robin Manhaeve et al. at NeurIPS 2018. It integrates deep neural networks with probabilistic logic programming, allowing neural predicates within logic rules.', keywords: ['deepproblog', 'manhaeve', 'neurips', 'logic', 'probabilistic'], similarity: 0.88 },
  { id: 'chunk2', text: 'Vaswani et al. published "Attention Is All You Need" in 2017, introducing the Transformer architecture which replaces recurrence with parallel self-attention mechanisms.', keywords: ['vaswani', 'attention', 'transformer', '2017', 'self-attention'], similarity: 0.82 },
  { id: 'chunk3', text: 'Tree of Thoughts was proposed by Shunyu Yao et al. in 2023. It expands Chain-of-Thought prompting to search trees (BFS/DFS) with self-evaluation and backtracking.', keywords: ['tree', 'thoughts', 'yao', 'backtracking', 'search'], similarity: 0.65 },
  { id: 'chunk4', text: 'Bayesian networks represent conditional dependencies between variables using Directed Acyclic Graphs (DAGs) and update beliefs via Bayes\' Theorem. Judea Pearl formalized this in 1988.', keywords: ['bayesian', 'bayes', 'conditional', 'uncertainty', 'pearl'], similarity: 0.45 },
  { id: 'chunk5', text: 'Large language models process text by converting inputs into token embeddings, then applying attention layers and feed-forward networks. They generate tokens autoregressively from P(x_t | x_{<t}).', keywords: ['models', 'token', 'embeddings', 'ffn', 'autoregressive'], similarity: 0.35 },
];

export function RagPipelineSimulator() {
  const [query, setQuery] = useState('What is DeepProbLog and when was it proposed?');
  const [similarityThreshold, setSimilarityThreshold] = useState(0.5);
  const [manualExclusions, setManualExclusions] = useState({});

  const getProcessedChunks = () => {
    const queryWords = query.toLowerCase().split(/\s+/);
    return mockKnowledgeBase.map(chunk => {
      let overlap = 0;
      chunk.keywords.forEach(kw => {
        if (queryWords.some(qw => qw.includes(kw) || kw.includes(qw))) {
          overlap += 0.25;
        }
      });
      const similarityScore = Math.min(0.99, Math.max(0.05, chunk.similarity * 0.5 + overlap));
      return { ...chunk, score: similarityScore };
    }).sort((a, b) => b.score - a.score);
  };

  const processedChunks = getProcessedChunks();
  const retrievedChunks = processedChunks.filter(c => c.score >= similarityThreshold && !manualExclusions[c.id]);

  const generateResponse = () => {
    if (retrievedChunks.length === 0) {
      return "⚠️ No relevant documents retrieved. Without grounding context, the model would rely solely on parametric memory — increasing the risk of hallucination and factual errors.";
    }

    const hasProbLog = retrievedChunks.some(c => c.id === 'chunk1');
    const hasAttention = retrievedChunks.some(c => c.id === 'chunk2');
    const hasTree = retrievedChunks.some(c => c.id === 'chunk3');

    let response = "";
    const facts = [];

    if (hasProbLog && query.toLowerCase().includes('problog')) {
      facts.push("DeepProbLog is a hybrid neuro-symbolic framework introduced by Robin Manhaeve et al. at NeurIPS 2018. It integrates deep neural networks with probabilistic logic programming, allowing neural predicates within logical rules.");
    }
    if (hasAttention && (query.toLowerCase().includes('attention') || query.toLowerCase().includes('transformer'))) {
      facts.push("The Transformer architecture was introduced in 2017 by Vaswani et al. in the paper 'Attention Is All You Need', replacing recurrence with self-attention.");
    }
    if (hasTree && query.toLowerCase().includes('tree')) {
      facts.push("Tree of Thoughts (Yao et al., 2023) extends Chain-of-Thought prompting into a tree-structured search with BFS/DFS and self-evaluation, enabling backtracking.");
    }

    if (facts.length > 0) {
      response = facts.join(" Furthermore, ");
    } else {
      response = "Retrieved context is available but does not directly answer the query. The model would synthesize a response by extracting relevant signals from: " + retrievedChunks.map(c => '"' + c.text.slice(0, 50) + '..."').join(", ");
    }

    return response;
  };

  const toggleManualExclusion = (id) => {
    setManualExclusions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const responseText = generateResponse();

  return (
    <div style={{ background: 'var(--node-bg)', border: '1px solid var(--border)', padding: '24px', margin: '24px 0' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        Interactive pipeline
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.3px' }}>
        RAG Vector Retrieval & Synthesis Playground
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Change the query or adjust the cosine similarity threshold. Chunks scoring above the threshold enter the LLM's context window. Toggle checkboxes to manually include/exclude documents and observe how retrieval quality affects the generated answer.
      </p>

      {/* Query */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>User Query</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '14.5px',
            border: '1.5px solid var(--border)',
            fontWeight: 600,
            outline: 'none',
          }}
        />
      </div>

      {/* Threshold Slider */}
      <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
          <span>Cosine Similarity Cutoff</span>
          <span>{similarityThreshold.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.10"
          max="0.90"
          step="0.05"
          value={similarityThreshold}
          onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
        />
      </div>

      {/* Chunks */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
          Knowledge Base Chunks ({retrievedChunks.length} of {processedChunks.length} retrieved)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {processedChunks.map(chunk => {
            const meetsThreshold = chunk.score >= similarityThreshold;
            const isExcluded = !!manualExclusions[chunk.id];
            const isActive = meetsThreshold && !isExcluded;

            return (
              <div
                key={chunk.id}
                style={{
                  padding: '10px 14px',
                  border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  background: isActive ? 'var(--accent-20)' : '#FAF9F6',
                  opacity: isExcluded ? 0.4 : (meetsThreshold ? 1 : 0.6),
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={!isExcluded}
                  onChange={() => toggleManualExclusion(chunk.id)}
                  style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12.5px', color: '#000', lineHeight: 1.4 }}>{chunk.text}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '10px', color: 'var(--text-light)', fontWeight: 700 }}>
                    <span>SIMILARITY: {chunk.score.toFixed(2)}</span>
                    <span>•</span>
                    <span style={{ color: meetsThreshold ? '#10B981' : '#EF4444' }}>
                      {meetsThreshold ? 'RETRIEVED' : 'BELOW THRESHOLD'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generator output */}
      <div style={{ padding: '16px', background: 'var(--bg-subtle)', border: '1.5px solid var(--border)' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
          🤖 LLM Generator Output (Grounded in Retrieved Context)
        </div>
        <div style={{ fontSize: '14px', color: '#000', lineHeight: 1.5, fontWeight: 600 }}>
          {responseText}
        </div>
      </div>
    </div>
  );
}

export default function RagPage() {
  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Reasoning
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Retrieval-Augmented Reasoning (RAG)
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          Outsourcing factual memory to external knowledge stores. RAG pipelines query vector databases to inject verified context into the LLM's input, enabling grounded reasoning with up-to-date and domain-specific knowledge — without retraining or modifying model weights.
        </p>
      </div>

      <Section title="1. The Knowledge Staleness Problem">
        <P>
          Large language models are knowledge snapshots: they lock everything they know inside static weight matrices at the end of training. This creates three fundamental problems:
        </P>

        <ul >
          <li><strong>Temporal staleness</strong>: A model trained in January 2024 cannot answer questions about events in March 2024. The world keeps moving; the model's knowledge does not.</li>
          <li><strong>Domain gaps</strong>: General-purpose models lack deep expertise in specialized domains (medical records, legal case law, proprietary codebases) unless they were specifically trained on that data.</li>
          <li><strong>Parameter bloat</strong>: Trying to memorize the entirety of human knowledge within model weights leads to enormous parameter counts, training costs, and — ironically — more hallucinations, because the model must compress and approximate vast amounts of information.</li>
        </ul>
      </Section>

      <Section title="2. The RAG Architecture">
        <P>
          <strong>Retrieval-Augmented Generation</strong>, introduced by Lewis et al. (2020), provides an elegant solution: instead of expecting the model to memorize everything, the system searches an external knowledge base for relevant information and injects it directly into the prompt's context window.
        </P>
        <P>
          The standard RAG pipeline has three phases:
        </P>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', margin: '16px 0' }}>
          <div style={{ background: 'var(--node-bg)', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', marginBottom: '6px' }}>Phase 1: Embed</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Documents are chunked and converted into dense vector embeddings using a model like <strong>E5</strong>, <strong>BGE</strong>, or OpenAI's <strong>text-embedding</strong> series. These vectors capture semantic meaning.
            </p>
          </div>
          <div style={{ background: 'var(--node-bg)', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>Phase 2: Retrieve</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              The user's query is embedded and compared against the document vectors using <strong>cosine similarity</strong> or approximate nearest neighbor (ANN) search. Top-<Latex math="k" /> chunks are selected.
            </p>
          </div>
          <div style={{ background: 'var(--node-bg)', border: '1px solid var(--border)', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', marginBottom: '6px' }}>Phase 3: Generate</div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Retrieved chunks are prepended to the prompt as context. The LLM synthesizes an answer grounded in the retrieved evidence, with explicit references where possible.
            </p>
          </div>
        </div>

        <Callout type="key">
          RAG fundamentally redefines the role of the LLM: from a <strong>factual database</strong> (which it is poor at, prone to hallucinations) to a <strong>reasoning engine</strong> that synthesizes and analyzes facts provided in context (which it is excellent at).
        </Callout>
      </Section>

      <Section title="3. Active Retrieval and Self-RAG">
        <P>
          Standard RAG is <em>passive</em>: it retrieves once at the beginning of a query and generates. But not every query needs retrieval (simple greetings, creative tasks), and some queries need <em>multiple</em> retrieval rounds (complex multi-hop questions where the first retrieved passage points to another topic that must also be looked up).
        </P>
        <P>
          <strong>Self-RAG</strong> (Asai et al., ICLR 2024) addresses this by training the LLM itself to decide <em>when</em> retrieval is needed. The model generates special <strong>reflection tokens</strong> that evaluate: (1) whether retrieval is necessary, (2) whether the retrieved passages are relevant, and (3) whether the generated response is supported by the evidence. These tokens enable the model to critique its own retrieval and generation process in real time.
        </P>
        <P>
          Additionally, <strong>DSPy</strong> (Khattab et al., ICLR 2024) takes a programming-language approach to RAG: developers write declarative modules (Retrieve, ChainOfThought, Assert), and DSPy's compiler automatically optimizes prompt instructions and few-shot demonstrations based on validation metrics — turning hand-crafted RAG pipelines into self-improving programs.
        </P>
      </Section>

      <Section title="4. Interactive RAG Simulator">
        <P>
          Experiment with the retrieval pipeline below. Adjust the cosine similarity threshold to control how many documents enter the context window. Notice how lowering the threshold includes more (but less relevant) chunks, while raising it aggressively can exclude critical information. Try toggling individual documents on/off to see how the generator's output changes.
        </P>

        <RagPipelineSimulator />
      </Section>

      <Section title="5. Design Trade-offs and Challenges">
        <P>
          Building production RAG systems requires navigating several critical trade-offs:
        </P>

        <ul >
          <li><strong>Chunking strategy</strong>: How documents are segmented (sentences, paragraphs, fixed token windows, or semantic sections) dramatically affects retrieval precision. Too small and you lose context; too large and you dilute the signal.</li>
          <li><strong>Context window limits</strong>: Even with 128K-token context windows, injecting too many retrieved passages creates the <strong>needle-in-a-haystack</strong> problem — the model struggles to locate and utilize the relevant passage among many irrelevant ones.</li>
          <li><strong>Embedding model quality</strong>: The retriever is only as good as its embedding model. If the embedding space doesn't capture the semantic relationship between the query and the answer, no amount of LLM sophistication can compensate.</li>
          <li><strong>Latency vs. quality</strong>: Vector search adds overhead (typically 50–200ms), and multi-hop retrieval can multiply this. Real-time applications require careful optimization of ANN indices (HNSW, IVF) and caching strategies.</li>
          <li><strong>Attribution and traceability</strong>: A key advantage of RAG is that answers can be traced back to source documents, enabling fact-checking and citation. But this only works if the pipeline preserves provenance metadata through the entire chain.</li>
        </ul>

        <Callout type="warning">
          RAG does not eliminate hallucinations — it reduces them. If the retriever returns irrelevant passages, or if the LLM ignores the retrieved context in favor of its parametric memory, the system can still produce unfounded claims. Robust RAG systems require both retrieval quality and generation faithfulness.
        </Callout>
      </Section>

      <Section title="References & Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks
            </a> — Lewis, P., Perez, E., Piktus, A., et al., 2020. The foundational RAG paper, introducing the retrieve-then-generate paradigm for knowledge-intensive NLP.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2310.11511" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection
            </a> — Asai, A., Wu, Z., Wang, Y., Sil, A., & Hajishirzi, H., 2024. Trains the LLM to decide when retrieval is needed using reflection tokens.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2310.03714" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              DSPy: Compiling Declarative Language Model Calls into Self-Improving Pipelines
            </a> — Khattab, O., Singhvi, A., Maheshwari, P., et al., 2024. A programming framework that automatically optimizes RAG pipeline prompts and demonstrations.
          </li>
          <li>
            <a href="https://github.com/gkamradt/LLMTest_NeedleInAHaystack" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Needle in a Haystack — Pressure Testing LLMs
            </a> — Kamradt, G., 2023. An empirical benchmark testing LLM ability to retrieve specific facts from long contexts.
          </li>
        </ul>
      </Section>
    </div>
  );
}
