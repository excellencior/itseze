/**
 * ═══════════════════════════════════════════
 *  Shared Navigation Config
 * ═══════════════════════════════════════════
 *
 * Single source of truth for all navigable pages.
 * Used by Sidebar, PageNav, and App routing.
 */

export const ARCHITECTURES = [
  { name: 'GPT-3 (175B)', route: 'gpt3', ready: true },
  { name: 'Llama 3', route: 'llama3', ready: false },
  { name: 'Claude 3', route: 'claude3', ready: false },
];

export const CONCEPTS = [
  { name: 'Activation Functions', route: 'concept:activation-functions', ready: true },
  { name: 'Attention (Self / Cross)', route: 'concept:attention', ready: true },
  { name: 'Batch Normalization', route: 'concept:batch-norm', ready: false },
  { name: 'Convolution Layers', route: 'concept:convolution', ready: false },
  { name: 'Dropout', route: 'concept:dropout', ready: false },
  { name: 'Embedding (Token + Positional)', route: 'concept:embedding', ready: false },
  { name: 'Encoder (Transformer)', route: 'concept:encoder', ready: true },
  { name: 'Feed-Forward Network (MLP)', route: 'concept:mlp', ready: false },
  { name: 'KV Cache', route: 'concept:kv-cache', ready: false },
  { name: 'Layer Normalization / RMSNorm', route: 'concept:layer-norm', ready: false },
  { name: 'Loss Functions', route: 'concept:loss-functions', ready: false },
  { name: 'Mixture of Experts (MoE)', route: 'concept:moe', ready: false },
  { name: 'Multi-Head Attention', route: 'concept:multi-head-attention', ready: false },
  {
    name: 'Reasoning',
    ready: true,
    children: [
      { name: 'Hub', route: 'concept:reasoning', ready: true },
      { name: 'Symbolic Logic', route: 'concept:reasoning-symbolic', ready: true },
      { name: 'Probabilistic Graphs', route: 'concept:reasoning-probabilistic', ready: true },
      { name: 'Neural Networks', route: 'concept:reasoning-neural', ready: true },
      { name: 'Neuro-Symbolic', route: 'concept:reasoning-neuro-symbolic', ready: true },
      { name: 'Chain-of-Thought', route: 'concept:reasoning-chain-of-thought', ready: true },
      { name: 'RAG Pipelines', route: 'concept:reasoning-rag', ready: true },
      { name: 'Program Synthesis', route: 'concept:reasoning-program-synthesis', ready: true },
    ]
  },
  {
    name: 'Prompting',
    ready: true,
    children: [
      { name: 'Hub', route: 'concept:prompting', ready: true },
      { name: 'Zero-Shot', route: 'concept:prompting-zero-shot', ready: true },
      { name: 'Few-Shot ICL', route: 'concept:prompting-few-shot', ready: true },
      { name: 'Chain-of-Thought', route: 'concept:prompting-cot', ready: true },
      { name: 'Zero-Shot CoT', route: 'concept:prompting-zero-cot', ready: true },
      { name: 'Least-to-Most', route: 'concept:prompting-ltm', ready: true },
      { name: 'Self-Consistency', route: 'concept:prompting-sc', ready: true },
    ]
  },
  { name: 'Residual Connections', route: 'concept:residual', ready: false },
  { name: 'Rotary Position Embedding (RoPE)', route: 'concept:rope', ready: false },
  { name: 'Softmax', route: 'concept:softmax', ready: false },
  { name: 'Speculative Decoding', route: 'concept:speculative-decoding', ready: true },
  { name: 'State Space Models (SSMs)', route: 'concept:ssm', ready: true },
  { name: 'Tokenization (BPE / SentencePiece)', route: 'concept:tokenization', ready: false },
];

/**
 * Given a route key, returns { prev, next } with only ready pages,
 * scoped to the same category (architectures or concepts).
 */
export function getPageNeighbors(route) {
  const isConcept = route.startsWith('concept:') || route.startsWith('__pub__/concepts/');
  const list = isConcept ? CONCEPTS : ARCHITECTURES;
  
  // Flatten concept categories containing nested children
  const flatList = [];
  list.forEach(item => {
    if (item.children) {
      item.children.forEach(child => {
        flatList.push({
          name: `${item.name}: ${child.name}`,
          route: child.route,
          ready: child.ready,
        });
      });
    } else {
      flatList.push(item);
    }
  });

  // Merge published pages
  const published = getPublishedNavItems();
  published.forEach(pub => {
    const pubIsConcept = pub.route.startsWith('__pub__/concepts/');
    if (pubIsConcept === isConcept) {
      // Only add if not already in the list
      if (!flatList.some(p => p.route === pub.route)) {
        flatList.push(pub);
      }
    }
  });

  const readyList = flatList.filter(p => p.ready);
  const idx = readyList.findIndex(p => p.route === route);

  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? readyList[idx - 1] : null,
    next: idx < readyList.length - 1 ? readyList[idx + 1] : null,
  };
}

/**
 * Reads published pages from localStorage and returns them as nav items.
 * Each item has { name, route, ready, isPublished, firstPublishedAt }.
 */
export function getPublishedNavItems() {
  try {
    const published = JSON.parse(localStorage.getItem('itseze-published') || '{}');
    return Object.entries(published).map(([urlPath, data]) => ({
      name: data.meta?.title || 'Untitled',
      route: `__pub__${urlPath}`,
      ready: true,
      isPublished: true,
      firstPublishedAt: data.firstPublishedAt || data.publishedAt,
      category: data.meta?.category || 'concept',
      subcategory: data.meta?.subcategory || '',
      parentCategory: detectParentCategory(urlPath),
    }));
  } catch { return []; }
}

/** Detect which subcategory group a published URL belongs to */
function detectParentCategory(urlPath) {
  if (urlPath.startsWith('/concepts/reasoning/')) return 'Reasoning';
  if (urlPath.startsWith('/concepts/prompting/')) return 'Prompting';
  if (urlPath.startsWith('/concepts/')) return null; // flat concept
  return null; // architecture or other
}
