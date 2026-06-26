/**
 * Batch 3 — Concept Pages Index
 * Re-exports all 5 concept page data files as a single pages array.
 */
import { pageData as activationFunctions } from './activation-functions.js';
import { pageData as attention } from './attention.js';
import { pageData as encoder } from './encoder.js';
import { pageData as speculativeDecoding } from './speculative-decoding.js';
import { pageData as ssm } from './ssm.js';

export const pages = [
  activationFunctions,
  attention,
  encoder,
  speculativeDecoding,
  ssm,
];
