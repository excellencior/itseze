/**
 * Three.js Visualization Component Library
 * 
 * Reusable 3D visualization primitives for the It'sEze platform.
 * All components are parameterized and composable.
 * 
 * === Base ===
 * ThreeCanvas     - Wrapper for consistent Three.js scene setup
 * 
 * === Charts ===
 * ScatterPlot3D   - Labeled 3D scatter plot with optional connections
 * BarChart3D      - Animated 3D bar chart with labels and values
 * 
 * === Domain-Specific ===
 * AttentionFlow   - Token cards with attention weight arcs
 * EmbeddingSpace  - Pre-configured scatter plot for word embeddings
 */

export { default as ThreeCanvas } from './ThreeCanvas';
export { default as ScatterPlot3D } from './ScatterPlot3D';
export { default as BarChart3D } from './BarChart3D';
export { default as AttentionFlow } from './AttentionFlow';
export { default as EmbeddingSpace } from './EmbeddingSpace';
