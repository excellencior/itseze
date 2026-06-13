# It'sEze Design Philosophy & UX Guidelines

This document serves as the source of truth for the "Uber-aesthetic" and interactive design language of the It'sEze platform. Whenever building new features or refactoring old ones, adhere strictly to these principles.

## 1. Visual Aesthetic (The "Uber-aesthetic")
- **Minimalist & Clean**: Avoid visual clutter. Use negative space generously to let content breathe.
- **High Contrast**: Use stark contrasts (e.g., `#FFFFFF` or `#FAFAFA` backgrounds with deep `#333` text) to ensure readability.
- **Accents**: Use the designated accent color (`var(--accent)`, currently a sharp cyan `#0891B2`) sparingly but purposefully for interactive elements, focus states, and primary actions.
- **Typography**: Google Sans as primary, Roboto as fallback. No hyphenation in prose. Text should feel approachable yet authoritative.

## 2. Layout & Responsiveness
- **Fluid Proportions**: Avoid hardcoded pixel widths for structural containers. Use percentages (e.g., `width: 80%`) paired with reasonable maximums (e.g., `maxWidth: 1200px`).
- **Centered Reading Flow**: The main reading column should be horizontally centered (`margin: 0 auto`) to maintain an optimal line-length for readability.

## 3. Interactive Visualizations (Inline Expansion)
- **Inline, Not Detached**: Complex visualizers (like canvas elements) should open **inline** directly below the concept they illustrate, rather than in disconnected side panels that shift the main page layout.
- **Contextual Triggers**: Use slim, unassuming toggle buttons (e.g., `◧ visualize`) placed directly inside or immediately following the relevant paragraph. Avoid massive, block-level call-to-action buttons for inline learning tools.
- **Expandable Accordions**: Use the `InlinePanel` component for expanding visualizers. It handles the choreographed height and opacity transitions automatically.
- **Plot Spacing**: `FunctionPlot` (and similar canvas visualizations) should include built-in `marginBottom` (≥10px) so there is always breathing room between the plot and the prose that follows. This is handled in the component itself — do not rely on page-level overrides.

## 4. Animation & Motion (Choreography)
- **Unified Easing**: Use a consistent, polished easing curve for layout transitions: `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Soft Scrolling**: Whenever a large inline element opens or closes, use JavaScript's `scrollIntoView({ behavior: 'smooth', block: 'center' })` to softly guide the user's focus back to the relevant content, preventing them from getting lost when layout shifts occur.
- **Staggered Reveals**: For complex panels, stagger the animations (e.g., expand the container height first, then fade in the internal content 150ms later) to create a premium, choreographed feel.

## 5. Components & State
- **Self-Contained Logic**: Visualizers (like `LinearCollapseViz`) should manage their own internal animation states (e.g., `progress`, `collapsed`) so they can be easily dropped into any `InlinePanel`.
- **Provide Escape Hatches**: Always provide a clear way to close or dismiss an interactive element (e.g., a top-right `✕` button inside `InlinePanel` that softly scrolls the user back to the trigger button).

## 5b. Sidebar

### Collapsible Sidebar
- **Toggle**: The sidebar is fully collapsible via an SVG left-arrow button (`◁`) in the header. When collapsed, width animates to `0px` with `cubic-bezier(0.22, 1, 0.36, 1)` easing. The collapsed state is persisted in `sessionStorage`.
- **Reopen**: A floating `☰` hamburger button appears fixed at `left: 24px, top: 24px` when the sidebar is collapsed. It has a frosted glass background and accent-colored hover effect.
- **Resize Handle**: When expanded, a 5px drag handle between the sidebar and content area allows manual width resizing (200–500px range). The handle is hidden when collapsed.
- **No Footer**: The sidebar has no footer element — navigation fills the available space.

### Color Palette
The sidebar uses a pure dark palette (`SB` object in `Sidebar.jsx`) matching the `#111` outer shell:
| Token          | Value     | Usage                              |
|----------------|-----------|-------------------------------------|
| `SB.bg`        | `#000000` | Sidebar background                  |
| `SB.bgHover`   | `#1a1a1a` | Boxy hover background on items      |
| `SB.bgActive`  | `#1f1f1f` | Active item background              |
| `SB.border`    | `#222`    | Borders, dividers                   |
| `SB.textBright`| `#EDEDED` | Section headers, active text        |
| `SB.text`      | `#B0B0B0` | Normal item text                    |
| `SB.textMuted` | `#777`    | Badges, secondary text              |
| `SB.textDim`   | `#444`    | Disabled items                      |

### Boxy Interactive Items
- **Component**: All nav items use the `NavItem` component — a full-width `<button>` with `borderRadius: 8px`.
- **Hover**: On hover, the entire item gets a visible rounded background (`SB.bgHover = #1a1a1a`). Text brightens to `SB.textBright`. Transition: `0.15s ease`.
- **Active**: Active items show `SB.bgActive` background, accent-colored text, and a small accent dot (`6px` circle) to the left of the label.
- **Disabled**: Disabled items use `SB.textDim` color with `cursor: not-allowed` and a "Soon" badge.
- **Spacing**: Items have `10–14px` vertical padding and `2px` bottom margin for generous breathing room between options.

### Section & Subcategory Toggles
- **SectionToggle**: Top-level sections (Architecture, Concepts) use uppercase 11.5px labels with `letterSpacing: 0.1em`. Boxy hover with accent-colored text. `4px` bottom margin for separation.
- **SubcategoryToggle**: Nested subcategories (e.g., Reasoning) render as 13.5px semi-bold labels, slightly indented. Same boxy hover pattern.
- **Chevron**: SVG chevron icons (16px for sections, 14px for subcategories) with rounded stroke caps. Rotates 180° when expanded, with `0.25s ease` transition. Stroke color transitions to accent on hover.
- **Auto-expand**: The sidebar auto-expands the relevant section (Architecture or Concepts) and subcategory based on the active page.

### Rendering
Both Architecture and Concepts sections are data-driven from `ARCHITECTURES` and `CONCEPTS` arrays in `navigation.js`. The `CONCEPTS` array supports nested hierarchies via a `children` array on items that act as subcategories. Never hardcode individual items; always loop over the shared config.

## 5c. SeekLadder (Section Navigation)
- **Component**: `SeekLadder` (`src/components/Layout/SeekLadder.jsx`) — a Notion-style vertical section indicator anchored to the right edge of the viewport.
- **Auto-discovery**: Uses `querySelectorAll('[data-section]')` to find all sections on any page. Works globally via `MainLayout` without per-page wiring. Re-scans via `MutationObserver` on DOM changes.
- **Tick marks**: Each section is represented by a horizontal tick mark (10px wide, 2px tall). The active section's tick is wider (20px), thicker (3px), and accent-colored.
- **Hover behavior**: On hovering the ladder area, a frosted glass panel (`rgba(255,255,255,0.85)` + `backdrop-filter: blur(8px)`) appears with section labels sliding in from the right. Each individual item has its own hover state — tick grows to 16px, text brightens.
- **Click**: Clicking a tick smooth-scrolls to that section.
- **Active tracking**: `IntersectionObserver` (rooted to the scroll container) tracks the topmost visible section and highlights it in real time.
- **Hidden on empty pages**: Returns `null` if no `data-section` elements are found.

## 6. Inline Hover Cards (Wikipedia-style Popups)
- **When to Use**: For terms that don't need their own full section but benefit from an equation or brief context on demand (e.g., PReLU, ELU, LayerNorm). If the reader can understand the flow without clicking away, use a `HoverCard` instead of expanding the prose.
- **Component**: `HoverCard` (`src/components/HoverCard.jsx`). Wrap the term inline; pass card content (equation via `Latex`, brief description) as children.
- **Interaction**: The term is styled with `var(--accent)` color and a dashed underline to signal hover-ability. The card appears after a 200ms delay, fades + slides in over 180ms, and stays open while the cursor is over either the term or the card itself (150ms leave grace period).
- **Positioning**: Use `position="above"` (default) or `position="below"` depending on where the term sits on the page. The card includes an arrow pointer connecting it to the term.
- **Content Guidelines**: Keep card content concise — a bold title, the equation in a `math-box`, and 1–2 sentences max. This is a glance, not a deep dive.

## 7. Text Highlighting
- **Tint Highlights**: To draw attention to key sentences, wrap them in a `<span>` with `background: var(--accent-20)`, `borderBottom: 2px solid var(--accent)`, and `padding: 1px 4px`. This uses the site's tint color for a consistent, on-brand highlight.
- **Use Sparingly**: Highlights should mark genuinely important sentences (breakthroughs, key insights, surprising distinctions). Overuse dilutes their impact.

## 8. URL Routing & Section Hashes
- **Clean URLs**: Each page maps to a clean path via `ROUTE_MAP` in `App.jsx` (e.g., `gpt3` → `/gpt3`, `concept:activation-functions` → `/concepts/activation-functions`). Navigation uses `history.pushState`, browser back/forward is handled via `popstate`.
- **Section Hashes**: The `Section` component auto-generates a kebab-case `id` from its title (stripping numbers, emoji, punctuation via `slugify()`). An `IntersectionObserver` in `App.jsx` tracks the topmost visible section and updates the URL hash (e.g., `#sigmoid`, `#gelu`) in real time as the user scrolls.
- **Deep Linking**: On initial load, if a hash is present in the URL, the app scrolls smoothly to that section. This enables shareable links to specific sections.
- **Adding New Pages**: When adding a new page, add its key → path entry to `ROUTE_MAP` and `PATH_TO_KEY` in `App.jsx`.

## 9. References & Citations
- **Format**: All blog pages use a consistent reference format in a "References & Further Reading" section at the bottom. References are an unordered list (`<ul>`) with clickable `<a>` links to actual paper URLs (arXiv, DOI, or publisher).
- **Structure**: `Paper Title (clickable link) — Author Names, Year. Brief description of the paper's contribution.`
- **Styling**: Links use `color: var(--accent)`, `fontWeight: 600`, `textDecoration: 'none'`. List uses `fontSize: 14px`, `lineHeight: 2`.
- **Inline citations**: Use natural author mentions in prose (e.g., "Wei et al. (2022) showed...") rather than numbered superscript references. No `<Ref>` component.
- **Quality**: All citations must be verified against real papers. Hallucinated references are strictly prohibited.
