/**
 * Batch 2 — Reasoning Pages Index
 * Re-exports all 7 reasoning page data files as a single pages array.
 */
import { pageData as chainOfThought } from './chain-of-thought.js';
import { pageData as neural } from './neural.js';
import { pageData as neuroSymbolic } from './neuro-symbolic.js';
import { pageData as probabilistic } from './probabilistic.js';
import { pageData as programSynthesis } from './program-synthesis.js';
import { pageData as rag } from './rag.js';
import { pageData as symbolic } from './symbolic.js';

export const pages = [
  chainOfThought,
  neural,
  neuroSymbolic,
  probabilistic,
  programSynthesis,
  rag,
  symbolic,
];
