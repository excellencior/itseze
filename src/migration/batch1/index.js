/**
 * Batch 1 — Prompting Pages Index
 * Re-exports all 6 prompting page data files as a single pages array.
 */
import { pageData as zeroShot } from './zero-shot.js';
import { pageData as fewShot } from './few-shot.js';
import { pageData as cot } from './cot.js';
import { pageData as zeroCot } from './zero-cot.js';
import { pageData as leastToMost } from './least-to-most.js';
import { pageData as selfConsistency } from './self-consistency.js';

export const pages = [
  zeroShot,
  fewShot,
  cot,
  zeroCot,
  leastToMost,
  selfConsistency,
];
