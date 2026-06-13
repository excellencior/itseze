# Content Schema

> Reference document defining every building block available for constructing pages.
> Used as the specification for the blog editor.

---

## 1. Page Metadata

Every page has:

| Field | Type | Example |
|---|---|---|
| `title` | string | `"Zero-Shot Prompting"` |
| `subtitle` | string | `"Inference without exemplars"` |
| `category` | enum | `architecture` · `concept` · `reasoning` · `prompting` |
| `subcategory` | string? | `"Prompting"` (for nested nav groups) |
| `route` | string | `"concept:prompting-zero-shot"` |
| `ready` | boolean | Whether the page is visible in navigation |
| `parentHub` | string? | Route of the hub page for subcategories |

### Category Hierarchy

```
architectures/
  └─ gpt3

concepts/
  ├─ activation-functions
  ├─ attention
  ├─ encoder
  ├─ speculative-decoding
  ├─ ssm
  ├─ reasoning/          (subcategory)
  │   ├─ hub
  │   ├─ symbolic
  │   ├─ probabilistic
  │   ├─ neural
  │   ├─ neuro-symbolic
  │   ├─ chain-of-thought
  │   ├─ rag
  │   └─ program-synthesis
  └─ prompting/          (subcategory)
      ├─ hub
      ├─ zero-shot
      ├─ few-shot
      ├─ cot
      ├─ zero-cot
      ├─ least-to-most
      └─ self-consistency
```

---

## 2. Page Header

Every page begins with a header block:

```jsx
<div style={{ marginBottom: '48px' }}>
  <div className="category-label">Concept</div>    // category badge
  <h1>Activation Functions</h1>                      // title
  <p className="subtitle">These are the...</p>       // subtitle
</div>
```

| Field | Required | Notes |
|---|---|---|
| Category label | Yes | Uppercase, 11px, `var(--text-light)` |
| Title (h1) | Yes | 32px, weight 900, `-1px` tracking |
| Subtitle | Yes | 16px, `var(--text-muted)`, line-height 1.6 |

---

## 3. Building Blocks

### 3.1 Section

A top-level content division with an auto-generated anchor ID.

```jsx
<Section title="1. Why Do We Need Activation Functions?">
  {children}
</Section>
```

| Property | Type | Notes |
|---|---|---|
| `title` | string | Rendered as `<h2>`, 22px weight 800 |
| `id` | auto | Slugified from title for anchor links |

---

### 3.2 Paragraph (`P`)

Standard prose wrapper.

```jsx
<P>
  Activation functions are placed <strong>between</strong> linear layers...
</P>
```

Supports inline elements: `<strong>`, `<em>`, `<code>`, `<Latex>`, `<HoverCard>`, `<a>`.

---

### 3.3 Callout

Highlighted information block with icon and colored left border.

```jsx
<Callout type="key">
  <strong>Key insight:</strong> Intelligence need not be programmed explicitly.
</Callout>
```

| Type | Background | Border | Icon |
|---|---|---|---|
| `info` | `#EFF6FF` | `#3B82F6` | ℹ️ |
| `warning` | `#FFF7ED` | `#F59E0B` | ⚠️ |
| `key` | `#F0FDF4` | `#10B981` | 💡 |
| `accent` | `var(--accent-20)` | `var(--accent)` | ↩ |

---

### 3.4 Inline Math (`Latex`)

Inline mathematical notation rendered via KaTeX.

```jsx
<Latex math="\sigma(x) = \frac{1}{1 + e^{-x}}" />
```

Used inline within `<P>` for short expressions: variables, symbols, small formulas.

---

### 3.5 Display Math (`math-box`)

Block-level equation display for complex formulas.

```jsx
<div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
  <Latex math="\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right) V" />
</div>
```

| Property | Value |
|---|---|
| Background | `var(--surface)` or default |
| Border | Left accent or full border |
| Padding | `16px 14px` |
| Text align | `center` |

---

### 3.6 Code Block

Dark-styled prompt/code display.

```jsx
<div style={{
  background: '#1e1e24',
  padding: '16px 18px',
  fontFamily: 'var(--font-mono)',
  fontSize: '12.5px',
  lineHeight: 1.65,
  color: '#e5c07b',
  borderRadius: '6px',
  border: '1px solid #333',
  overflowX: 'auto',
  position: 'relative',
}}>
  <div className="code-label">prompt example</div>
  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
    {promptText}
  </pre>
</div>
```

Optional label in top-left corner (uppercase, 9px, accent color).

---

### 3.7 Property Table (`PropTable`)

Key-value summary table for quick-reference data.

```jsx
<PropTable rows={[
  ['Output range', '(0, 1)'],
  ['Zero-centered?', '❌ No'],
  ['Max gradient', '0.25 (at x = 0)'],
]} />
```

Used in: ActivationFunctions, Attention, Encoder, SSM, SpeculativeDecoding.

---

### 3.8 HoverCard

Inline tooltip that expands on hover/click to show a definition card.

```jsx
<HoverCard term="PReLU" position="above">
  <div className="title">Parametric ReLU</div>
  <div className="math-box">
    <Latex math="..." />
  </div>
  <div className="description">Unlike Leaky ReLU...</div>
</HoverCard>
```

| Property | Type | Notes |
|---|---|---|
| `term` | string | The trigger text |
| `position` | `"above"` · `"below"` | Popup direction |

Used in: ActivationFunctions (3), Attention (4), Encoder (5), SSM (6), SpeculativeDecoding (4).

---

### 3.9 Function Plot

Interactive SVG chart for plotting mathematical functions.

```jsx
<FunctionPlot
  functions={[
    { fn: sigmoid, label: 'σ(x)', color: '#F59E0B' },
    { fn: sigmoidDeriv, label: "σ'(x)", color: '#F59E0B', dash: [6, 4] },
  ]}
  xRange={[-8, 8]}
  yRange={[-0.5, 1.5]}
  height={240}
  title="Sigmoid and its derivative"
/>
```

Used in: ActivationFunctions only (7 instances).

---

### 3.10 Inline Visualize Accordion (`InlinePanel`)

Expandable interactive panel toggled by an inline `◧ visualize` button.

```jsx
<button ref={btnRef} onClick={handleToggle} className="viz-btn">
  ◧ visualize
</button>
<InlinePanel open={panelOpen} onClose={handleClose} maxHeight="900px">
  <MyWidget />
</InlinePanel>
```

| Property | Type | Default |
|---|---|---|
| `open` | boolean | `false` |
| `onClose` | function | Required |
| `maxHeight` | string | `'600px'` |

The panel requires:
- `useState` for open/close state
- `useRef` for scroll-to-button behavior
- Toggle handler with `scrollIntoView({ behavior: 'smooth', block: 'start' })`
- Close handler with `scrollIntoView({ behavior: 'smooth', block: 'center' })`

---

### 3.11 Interactive Widget

Self-contained React component with internal state, rendered inside an `InlinePanel` or directly in a `Section`. Every page has exactly one primary interactive widget.

Widget types observed:

| Widget | Page | Description |
|---|---|---|
| LinearCollapseViz | ActivationFunctions | Demonstrates linear network collapse |
| GradientDecayViz | ActivationFunctions | Shows vanishing gradient through layers |
| AttentionHeatmap | Attention | SVG heatmap of attention weights |
| AttentionWalkthrough | Attention | Step-through Q/K/V matrix computation |
| EncoderBlockDiagram | Encoder | Clickable SVG encoder architecture |
| TokenJourney | Encoder | Token trace through encoder layers |
| SSMWalkthrough | SSM | Discrete SSM state update steps |
| AttnVsSSMViz | SSM | Side-by-side attention vs SSM comparison |
| SpecDecodingWalkthrough | SpeculativeDecoding | Draft/verify/accept cycle walkthrough |
| ParallelViz | SpeculativeDecoding | Gantt chart of parallel vs sequential |
| PropositionalEvaluator | Symbolic | Interactive truth-table evaluator |
| BayesianNetwork | Probabilistic | Adjustable Bayesian network graph |
| AttentionFlowWidget | Neural | Token attention flow simulator |
| TextToSqlCompiler | NeuroSymbolic | Text to SQL conversion demo |
| ThoughtTreeDiagram | ChainOfThought | Interactive reasoning tree |
| RagPipelineSimulator | RAG | Retrieve/augment/generate pipeline |
| DebuggingLoopSimulator | ProgramSynthesis | Code gen/test/debug iteration |
| PromptAnatomyWidget | ZeroShot | Prompt structure visualizer |
| DemonstrationBuilderWidget | FewShot | k-shot prompt assembler |
| CoTTraceStepperWidget | COT | Standard vs CoT step-through |
| TwoStagePipelineWidget | ZeroCOT | Two-stage reasoning pipeline |
| DecompositionTreeWidget | LeastToMost | Problem decomposition flow |
| SampleAndVoteWidget | SelfConsistency | Sampling + majority vote |

---

### 3.12 References Section

Standardized academic citation list.

```jsx
<Section title="References & Further Reading">
  <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
    <li>
      <a href="https://arxiv.org/abs/..." target="_blank" rel="noreferrer"
        style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
        Paper Title
      </a> by Author, A., Author, B., Venue Year. Description.
    </li>
  </ul>
</Section>
```

---

### 3.13 AI Disclosure

Optional footer block.

```jsx
<div className="ai-disclosure">
  <strong>A note on this article:</strong> This post was written
  with the help of AI. All content has been reviewed...
</div>
```

---

### 3.14 Hub Page (Strategy Map)

Hub pages (Reasoning Hub, Prompting Hub) use a custom SVG node-link graph for navigation instead of standard prose sections.

```jsx
const nodes = [
  { id: 0, name: 'Zero-Shot', x: 200, y: 100, route: 'concept:prompting-zero-shot', desc: '...' },
  ...
];
const connections = [
  { from: 0, to: 1, label: 'add examples' },
  ...
];
```

---

## 4. CSS Animations Used

| Keyframe | Page | Effect |
|---|---|---|
| `blink` | ZeroShot | Cursor blinking |
| `demoFadeIn` | FewShot | Card fade + slide up |
| `demoBlink` | FewShot | Blinking `?` cursor |
| `cot-pulse` | ZeroCOT | Pulsing box-shadow on active stage |
| `fadeSlideIn` | LeastToMost | Card fade + slide up |
| `scFadeIn` | SelfConsistency | Card fade + slide up |

---

## 5. Design Tokens

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#0891B2` | Primary color, links, active states |
| `--accent-20` | `rgba(8,145,178,0.12)` | Hover backgrounds, subtle highlights |
| `--border` | `#E5E7EB` | Card borders, separators |
| `--text-muted` | `#6B7280` | Secondary text |
| `--text-light` | `#9CA3AF` | Tertiary text, labels |
| `--font-mono` | Iosevka Charon | Code, prompts, math contexts |
| `--font-main` | System sans-serif | Body text |
| `--shadow-sm` | subtle shadow | Card elevation |
| `--shadow-md` | medium shadow | Elevated panels |

---

## 6. Page Inventory

| # | Page | Category | Sections | Math-box | Code | Widget | Accordion | HoverCard | PropTable | FuncPlot | Refs |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | GPT3Course | architecture | 4 nodes | 0 | 0 | Playground | 0 | 0 | 0 | 0 | No |
| 2 | ActivationFunctions | concept | 9 | 14 | 0 | 2 (Collapse, Gradient) | 2 | 3 | 4 | 7 | 7 |
| 3 | Attention | concept | 7 | 10 | 0 | 2 (Heatmap, Walkthrough) | 0 | 4 | 3 | 0 | 5 |
| 4 | Encoder | concept | 7 | 7 | 0 | 2 (Diagram, Journey) | 0 | 5 | 1 | 0 | 5 |
| 5 | SSM | concept | 8 | 3 | 3 | 2 (Walkthrough, Compare) | 0 | 6 | 1 | 0 | 7 |
| 6 | SpeculativeDecoding | concept | 7 | 3 | 0 | 2 (Walkthrough, Parallel) | 1 | 4 | 3 | 0 | 5 |
| 7 | ReasoningHub | reasoning | 2 | 0 | 0 | SVG map | 0 | 0 | 0 | 0 | No |
| 8 | Symbolic | reasoning | 6 | 0 | 0 | PropEvaluator | 0 | 0 | 0 | 0 | 3+ |
| 9 | Probabilistic | reasoning | 6 | 1 | 0 | BayesNet | 0 | 0 | 0 | 0 | Yes |
| 10 | Neural | reasoning | 6 | 2 | 0 | AttentionFlow | 0 | 0 | 0 | 0 | 8 |
| 11 | NeuroSymbolic | reasoning | 6 | 0 | 0 | TextToSQL | 0 | 0 | 0 | 0 | Yes |
| 12 | ChainOfThought | reasoning | 6 | 0 | 0 | ThoughtTree | 0 | 0 | 0 | 0 | 3+ |
| 13 | RAG | reasoning | 6 | 0 | 0 | RagPipeline | 0 | 0 | 0 | 0 | Yes |
| 14 | ProgramSynthesis | reasoning | 6 | 0 | 0 | DebugLoop | 0 | 0 | 0 | 0 | Yes |
| 15 | PromptingHub | prompting | 2 | 0 | 0 | SVG map | 0 | 0 | 0 | 0 | No |
| 16 | ZeroShot | prompting | 7 | 2 | 4 | PromptAnatomy | 1 | 0 | 0 | 0 | 3 |
| 17 | FewShot | prompting | 7 | 2 | 1 | DemoBuilder | 1 | 0 | 0 | 0 | 4 |
| 18 | COT | prompting | 7 | 0 | 2 | CoTStepper | 1 | 0 | 0 | 0 | 4 |
| 19 | ZeroCOT | prompting | 7 | 1 | 2 | TwoStage | 1 | 0 | 0 | 0 | 3 |
| 20 | LeastToMost | prompting | 7 | 0 | 2 | DecompTree | 1 | 0 | 0 | 0 | 4 |
| 21 | SelfConsistency | prompting | 7 | 2 | 2 | SampleVote | 1 | 0 | 0 | 0 | 4 |
