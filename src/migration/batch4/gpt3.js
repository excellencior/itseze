export const pageData = {
  route: 'gpt3',
  urlPath: '/gpt3',
  status: 'published',
  meta: {
    title: 'Transformer',
    subtitle: 'An interactive, step-by-step visual dive into how Large Language Models like GPT-3 process text using the Transformer architecture.',
    category: 'architecture',
    subcategory: null,
    ready: true
  },
  blocks: [
    // ── Header / Intro ──
    {
      type: 'heading', id: 'h-1', level: 1,
      text: 'Transformer'
    },

    {
      type: 'paragraph', id: 'p-1',
      content: 'An interactive, step-by-step visual dive into how Large Language Models like GPT-3 process text using the Transformer architecture.'
    },

    // ── Playground ──
    {
      type: 'custom-element', id: 'w-1',
      name: 'Playground'
    },

    // ── Pipeline Spine ──
    // The following nodes form a vertical accordion pipeline connected by a spine line.
    // Each node can be toggled open/closed independently (only one open at a time).

    {
      type: 'custom-element', id: 'w-2',
      name: 'TokenizationNode'
    },

    {
      type: 'custom-element', id: 'w-3',
      name: 'EmbeddingNode'
    },

    {
      type: 'custom-element', id: 'w-4',
      name: 'TransformerNode'
    },

    {
      type: 'custom-element', id: 'w-5',
      name: 'OutputNode'
    }
  ]
};
