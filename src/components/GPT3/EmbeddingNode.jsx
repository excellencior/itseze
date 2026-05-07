import React from 'react';
import AccordionNode from './AccordionNode';
import Latex from '../Latex';
import { EmbeddingSpace } from '../three';

export default function EmbeddingNode({ isOpen, onToggle }) {
  return (
    <AccordionNode
      title="2. Embedding"
      subtitle="Converts Token IDs into numerical vectors and adds positional information."
      icon="02"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="inner-block">
        <div className="inner-title">Matrix Lookup</div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          The integer IDs are practically useless for math. Each Token ID acts as a row index to look up a 12,288-dimensional vector from the massive Embedding Matrix. This captures the dense semantic meaning of the token.
        </p>
        {isOpen && (
          <div style={{ marginTop: '16px' }}>
            <EmbeddingSpace />
          </div>
        )}
      </div>
      <div className="arrow-down">↓</div>
      <div className="inner-block">
        <div className="inner-title">Positional Encoding</div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Because Transformers process all tokens simultaneously, they have no concept of word order. A learned positional vector is added to each token embedding so it knows exactly where it sits in the sequence.
        </p>
        <div className="math-box">
          <Latex math={"\\mathbf{x}_i = \\text{TokenEmbed}[\\text{id}_i] + \\text{PosEmbed}[i]"} block />
        </div>
      </div>
    </AccordionNode>
  );
}

