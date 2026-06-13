import gpt3 from '../GPT3Course.jsx?raw';
import activationFunctions from '../concepts/ActivationFunctionsPage.jsx?raw';
import attention from '../concepts/AttentionPage.jsx?raw';
import encoder from '../concepts/EncoderPage.jsx?raw';
import speculativeDecoding from '../concepts/SpeculativeDecodingPage.jsx?raw';
import ssm from '../concepts/SSMPage.jsx?raw';

import reasoningHub from '../reasoning/ReasoningHubPage.jsx?raw';
import reasoningSymbolic from '../reasoning/SymbolicPage.jsx?raw';
import reasoningProbabilistic from '../reasoning/ProbabilisticPage.jsx?raw';
import reasoningNeural from '../reasoning/NeuralPage.jsx?raw';
import reasoningNeuroSymbolic from '../reasoning/NeuroSymbolicPage.jsx?raw';
import reasoningChainOfThought from '../reasoning/ChainOfThoughtPage.jsx?raw';
import reasoningRag from '../reasoning/RagPage.jsx?raw';
import reasoningProgramSynthesis from '../reasoning/ProgramSynthesisPage.jsx?raw';

import promptingHub from '../prompting/PromptingHubPage.jsx?raw';
import promptingZeroShot from '../prompting/ZeroShotPage.jsx?raw';
import promptingFewShot from '../prompting/FewShotPage.jsx?raw';
import promptingCot from '../prompting/COTPage.jsx?raw';
import promptingZeroCot from '../prompting/ZeroCOTPage.jsx?raw';
import promptingLtm from '../prompting/LeastToMostPage.jsx?raw';
import promptingSc from '../prompting/SelfConsistencyPage.jsx?raw';

export const RAW_PAGES = {
  'gpt3': gpt3,
  'concept:activation-functions': activationFunctions,
  'concept:attention': attention,
  'concept:encoder': encoder,
  'concept:speculative-decoding': speculativeDecoding,
  'concept:ssm': ssm,
  'concept:reasoning': reasoningHub,
  'concept:reasoning-symbolic': reasoningSymbolic,
  'concept:reasoning-probabilistic': reasoningProbabilistic,
  'concept:reasoning-neural': reasoningNeural,
  'concept:reasoning-neuro-symbolic': reasoningNeuroSymbolic,
  'concept:reasoning-chain-of-thought': reasoningChainOfThought,
  'concept:reasoning-rag': reasoningRag,
  'concept:reasoning-program-synthesis': reasoningProgramSynthesis,
  'concept:prompting': promptingHub,
  'concept:prompting-zero-shot': promptingZeroShot,
  'concept:prompting-few-shot': promptingFewShot,
  'concept:prompting-cot': promptingCot,
  'concept:prompting-zero-cot': promptingZeroCot,
  'concept:prompting-ltm': promptingLtm,
  'concept:prompting-sc': promptingSc,
};
