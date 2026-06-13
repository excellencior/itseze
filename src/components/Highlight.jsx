/**
 * Highlight — inline tint highlight for key sentences.
 *
 * Usage:
 *   <Highlight>This sentence is important.</Highlight>
 *
 * Renders a <span> with accent-tinted background and
 * bottom border, matching the site's design language.
 */
export default function Highlight({ children }) {
  return (
    <span style={{
      background: 'var(--accent-20)',
      borderBottom: '2px solid var(--accent)',
      padding: '1px 4px',
    }}>
      {children}
    </span>
  );
}
