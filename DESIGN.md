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

## 4. Animation & Motion (Choreography)
- **Unified Easing**: Use a consistent, polished easing curve for layout transitions: `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Soft Scrolling**: Whenever a large inline element opens or closes, use JavaScript's `scrollIntoView({ behavior: 'smooth', block: 'center' })` to softly guide the user's focus back to the relevant content, preventing them from getting lost when layout shifts occur.
- **Staggered Reveals**: For complex panels, stagger the animations (e.g., expand the container height first, then fade in the internal content 150ms later) to create a premium, choreographed feel.

## 5. Components & State
- **Self-Contained Logic**: Visualizers (like `LinearCollapseViz`) should manage their own internal animation states (e.g., `progress`, `collapsed`) so they can be easily dropped into any `InlinePanel`.
- **Provide Escape Hatches**: Always provide a clear way to close or dismiss an interactive element (e.g., a top-right `✕` button inside `InlinePanel` that softly scrolls the user back to the trigger button).
