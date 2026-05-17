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

## 5b. Sidebar Interaction
- **Unified Rendering**: Both Architecture and Concepts sections use **identical** rendering logic — same `conceptItem` style, same hover/dot behavior. Both are data-driven from `ARCHITECTURES` and `CONCEPTS` arrays in `navigation.js`. Never hardcode individual items; always loop over the shared config.
- **Active Indicator**: The active page is shown with the accent-colored dot positioned on the left vertical border line (using `position: absolute; left: -9px; transform: translate(-50%, -50%)`). Text does not shift when a page becomes active.
- **Hover Effect**: Inactive sidebar items show a `1px solid var(--accent)` outline around the **text span only** (not the full-width row) with `outlineOffset: 2px` and `borderRadius: 4px`. Active items do **not** change on hover. The outline is cleared on click before navigation fires.
- **Auto-expand**: The sidebar auto-expands the relevant section (Architecture or Concepts) based on the active page.

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
