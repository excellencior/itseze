import React, { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders a LaTeX expression using KaTeX.
 * 
 * @param {string} math - The LaTeX string to render
 * @param {boolean} [block=false] - If true, renders as a display-mode block equation
 * @param {object} [style] - Optional inline styles for the container
 * @param {string} [className] - Optional CSS class
 */
export default function Latex({ math, block = false, style, className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && math) {
      try {
        katex.render(math, ref.current, {
          displayMode: block,
          throwOnError: false,
          strict: false,
        });
      } catch (e) {
        if (ref.current) {
          ref.current.textContent = math;
        }
      }
    }
  }, [math, block]);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        display: block ? 'block' : 'inline',
        textAlign: block ? 'center' : undefined,
        ...style,
      }}
    />
  );
}
