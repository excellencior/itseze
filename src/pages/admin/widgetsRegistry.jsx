import React from 'react';

// Custom visualizers
import { AttentionHeatmap, AttentionWalkthrough } from '../concepts/AttentionPage';
import { EncoderBlockDiagram, TokenJourney } from '../concepts/EncoderPage';
import { SSMWalkthrough, AttnVsSSMViz } from '../concepts/SSMPage';
import { SpecDecodingWalkthrough } from '../concepts/SpeculativeDecodingPage';
import { CoTTraceStepperWidget } from '../prompting/COTPage';
import { DemonstrationBuilderWidget } from '../prompting/FewShotPage';
import { DecompositionTreeWidget } from '../prompting/LeastToMostPage';
import { SampleAndVoteWidget } from '../prompting/SelfConsistencyPage';
import { TwoStagePipelineWidget } from '../prompting/ZeroCOTPage';
import { PromptAnatomyWidget } from '../prompting/ZeroShotPage';
import { ThoughtTreeDiagram } from '../reasoning/ChainOfThoughtPage';
import { AttentionFlowWidget } from '../reasoning/NeuralPage';
import { TextToSqlCompiler } from '../reasoning/NeuroSymbolicPage';
import { BayesianNetwork } from '../reasoning/ProbabilisticPage';
import { DebuggingLoopSimulator } from '../reasoning/ProgramSynthesisPage';
import { RagPipelineSimulator } from '../reasoning/RagPage';
import { PropositionalEvaluator } from '../reasoning/SymbolicPage';

// Shared viz components
import FunctionPlot from '../../components/viz/FunctionPlot';
import LinearCollapseViz from '../../components/viz/LinearCollapseViz';
import GradientDecayViz from '../../components/viz/GradientDecayViz';
import InlinePanel from '../../components/viz/InlinePanel';

// GPT-3 visual nodes
import Playground from '../../components/GPT3/Playground';
import TokenizationNode from '../../components/GPT3/TokenizationNode';
import EmbeddingNode from '../../components/GPT3/EmbeddingNode';
import TransformerNode from '../../components/GPT3/TransformerNode';
import OutputNode from '../../components/GPT3/OutputNode';

export const WIDGETS = {
  FunctionPlot,
  LinearCollapseViz,
  GradientDecayViz,
  InlinePanel,
  Playground,
  TokenizationNode,
  EmbeddingNode,
  TransformerNode,
  OutputNode,
  AttentionHeatmap,
  AttentionWalkthrough,
  EncoderBlockDiagram,
  TokenJourney,
  SSMWalkthrough,
  AttnVsSSMViz,
  SpecDecodingWalkthrough,
  CoTTraceStepperWidget,
  DemonstrationBuilderWidget,
  DecompositionTreeWidget,
  SampleAndVoteWidget,
  TwoStagePipelineWidget,
  PromptAnatomyWidget,
  ThoughtTreeDiagram,
  AttentionFlowWidget,
  TextToSqlCompiler,
  BayesianNetwork,
  DebuggingLoopSimulator,
  RagPipelineSimulator,
  PropositionalEvaluator,
};

export function renderCustomElement(block, idx) {
  const Component = WIDGETS[block.name];
  if (!Component) {
    return (
      <div key={idx} style={{ color: '#ef4444', padding: '12px', border: '1px dashed #ef4444', fontSize: '12px', borderRadius: '4px', background: '#fef2f2', margin: '12px 0' }}>
        ⚠️ Unknown Visualizer Component: <strong>{block.name}</strong>
      </div>
    );
  }

  // Set default properties for components that expect them
  let extraProps = {};
  if (block.name === 'FunctionPlot') {
    const sigmoid = (x) => 1 / (1 + Math.exp(-x));
    const tanh_ = (x) => Math.tanh(x);
    extraProps = {
      functions: [
        { fn: sigmoid, label: 'σ(x)', color: '#F59E0B' },
        { fn: tanh_, label: 'tanh(x)', color: '#3B82F6' },
      ],
      xRange: [-6, 6],
      yRange: [-1.5, 1.5],
      height: 240,
    };
  } else if (block.name === 'AttentionWalkthrough' || block.name === 'AttentionHeatmap') {
    extraProps = {
      tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat'],
      weights: Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => 0.16)),
    };
  }

  return (
    <div key={idx} style={{ margin: '24px 0' }}>
      <Component {...extraProps} />
    </div>
  );
}
