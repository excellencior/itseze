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
  { name: 'Residual Connections', route: 'concept:residual', ready: false },
  { name: 'Rotary Position Embedding (RoPE)', route: 'concept:rope', ready: false },
  { name: 'Softmax', route: 'concept:softmax', ready: false },
  { name: 'Speculative Decoding', route: 'concept:speculative-decoding', ready: true },
  { name: 'Tokenization (BPE / SentencePiece)', route: 'concept:tokenization', ready: false },
];

/**
 * Given a route key, returns { prev, next } with only ready pages,
 * scoped to the same category (architectures or concepts).
 */
export function getPageNeighbors(route) {
  const isConcept = route.startsWith('concept:');
  const list = isConcept ? CONCEPTS : ARCHITECTURES;
  const readyList = list.filter(p => p.ready);
  const idx = readyList.findIndex(p => p.route === route);

  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? readyList[idx - 1] : null,
    next: idx < readyList.length - 1 ? readyList[idx + 1] : null,
  };
}
