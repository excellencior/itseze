import React from 'react';
import ScatterPlot3D from '../three/ScatterPlot3D';

/**
 * Pre-configured scatter plot showing word embedding vectors in 3D space.
 * Demonstrates how semantically similar words cluster together.
 */

const EMBEDDING_POINTS = [
  { label: 'king',    position: [2.1, 1.8, 0.5],   color: '#6366f1' },
  { label: 'queen',   position: [2.4, 1.5, 0.8],   color: '#818cf8' },
  { label: 'man',     position: [1.6, 1.2, 0.2],   color: '#6366f1' },
  { label: 'woman',   position: [1.9, 0.9, 0.5],   color: '#818cf8' },
  { label: 'cat',     position: [-1.8, -0.5, 1.2], color: '#f59e0b' },
  { label: 'dog',     position: [-1.5, -0.8, 0.9], color: '#f59e0b' },
  { label: 'happy',   position: [0.2, -1.8, -1.0], color: '#10b981' },
  { label: 'joyful',  position: [0.5, -1.5, -0.7], color: '#10b981' },
  { label: 'compute', position: [-0.8, 2.0, -1.5], color: '#ef4444' },
  { label: 'GPU',     position: [-0.5, 2.3, -1.2], color: '#ef4444' },
];

const CONNECTIONS = [
  [0, 1], [2, 3],  // king-queen, man-woman
  [4, 5],          // cat-dog
  [6, 7],          // happy-joyful
  [8, 9],          // compute-GPU
  [0, 2], [1, 3],  // gender axis
];

export default function EmbeddingSpace() {
  return (
    <ScatterPlot3D
      points={EMBEDDING_POINTS}
      connections={CONNECTIONS}
      height={320}
      hint="Drag to rotate · Scroll to zoom — Similar words cluster together"
    />
  );
}
