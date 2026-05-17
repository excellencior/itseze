import React from 'react';
import Latex from './Latex';

/**
 * LinkedLatex — A LaTeX equation that highlights when linked to an active element.
 *
 * Use this to visually connect interactive diagrams/blocks to their corresponding
 * equations. When `active` is true, the equation gets a tinted background and
 * accent outline, creating a clear visual link between the diagram and the math.
 *
 * @param {string}  math     - The LaTeX string to render
 * @param {boolean} [block]  - If true, renders as display-mode block equation
 * @param {boolean} [active] - Whether this equation is currently highlighted
 * @param {object}  [style]  - Optional extra styles for the wrapper
 *
 * @example
 * // Link equation to a diagram's active state:
 * <LinkedLatex
 *   math="\text{Output}_1 = \text{LayerNorm}(x + \text{Attn}(x))"
 *   active={activeBlockId === 'addnorm1'}
 *   block
 * />
 */
export default function LinkedLatex({ math, block = false, active = false, style }) {
  return (
    <div style={{
      padding: '4px 6px',
      borderRadius: '3px',
      transition: 'background 0.15s, outline 0.15s',
      background: active ? 'var(--accent-20)' : 'transparent',
      outline: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
      ...style,
    }}>
      <Latex math={math} block={block} />
    </div>
  );
}
