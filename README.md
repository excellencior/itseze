# It's Eze

A visual, interactive knowledge base for understanding modern AI and deep learning concepts. Each topic is presented as a richly illustrated blog post with inline interactive visualizations, mathematical notation, and references to the original papers.

## Overview

It's Eze breaks down complex AI topics into approachable, visually engaging articles. Rather than relying on static diagrams, the site embeds interactive widgets directly into the prose, letting readers explore concepts like attention routing, activation function behavior, and prompting strategies hands-on.

## Content

### Architectures

Interactive model walkthroughs with 3D component visualizations.

| Architecture | Status |
|---|---|
| GPT-3 (175B) | ✅ Live |
| Llama 3 | 🔜 Planned |
| Claude 3 | 🔜 Planned |

### Concepts

Deep dives into individual building blocks of modern AI.

| Topic | Status |
|---|---|
| Activation Functions | ✅ Live |
| Attention (Self / Cross) | ✅ Live |
| Encoder (Transformer) | ✅ Live |
| Speculative Decoding | ✅ Live |
| State Space Models (SSMs) | ✅ Live |

### Reasoning

A multi-part series covering how AI systems reason, from classical symbolic logic to modern neural approaches.

| Topic | Status |
|---|---|
| Hub (Overview) | ✅ Live |
| Symbolic Logic | ✅ Live |
| Probabilistic Graphs | ✅ Live |
| Neural Networks | ✅ Live |
| Neuro-Symbolic | ✅ Live |
| Chain-of-Thought | ✅ Live |
| RAG Pipelines | ✅ Live |
| Program Synthesis | ✅ Live |

### Prompting

Scholarly blog posts on prompting strategies, each grounded in the original research papers.

| Topic | Paper | Status |
|---|---|---|
| Hub (Overview) | — | ✅ Live |
| Zero-Shot Prompting | Brown et al., 2020 | ✅ Live |
| Few-Shot In-Context Learning | Brown et al., 2020 | ✅ Live |
| Chain-of-Thought Prompting | Wei et al., 2022 | ✅ Live |
| Zero-Shot CoT | Kojima et al., 2022 | ✅ Live |
| Least-to-Most | Zhou et al., 2023 | ✅ Live |
| Self-Consistency | Wang et al., 2023 | ✅ Live |

## Interactive Features

Every page includes a combination of:

- **Inline `◧ visualize` accordions** — expandable interactive widgets embedded in the article flow
- **Mathematical notation** — rendered via KaTeX with dedicated display blocks for complex equations
- **3D visualizations** — React Three Fiber powered model architecture explorations
- **Interactive plots** — function plots, attention grids, and comparison tools
- **Dark code blocks** — prompt and output displays with typing animations

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite |
| Math rendering | KaTeX |
| 3D graphics | Three.js / React Three Fiber |
| Typography | Iosevka Charon (monospace), system sans-serif |
| Styling | Vanilla CSS + inline styles with design tokens |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── GPT3/              # Architecture walkthrough nodes
│   ├── Layout/             # MainLayout, Sidebar, PageNav
│   ├── three/              # 3D visualization components
│   └── viz/                # InlinePanel, FunctionPlot, etc.
├── pages/
│   ├── concepts/           # Concept deep dives
│   ├── reasoning/          # Reasoning series
│   └── prompting/          # Prompting strategies
├── navigation.js           # Route and sidebar config
├── App.jsx                 # Route mapping and state
├── theme.js                # Theme configuration
└── index.css               # Global styles and design tokens
```

## License

Private project.
