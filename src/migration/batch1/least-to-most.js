export const pageData = {
  route: 'concept:prompting-ltm',
  urlPath: '/concepts/prompting/least-to-most',
  status: 'published',
  meta: {
    title: 'Least-to-Most Prompting',
    subtitle: 'A two-stage prompting strategy that overcomes chain-of-thought\'s compositionality gap by first decomposing complex problems into simpler subproblems, then solving them sequentially, enabling generalization to problems harder than those in the prompt.',
    category: 'concept',
    subcategory: 'Prompting',
    route: 'concept:prompting-ltm',
    ready: true
  },
  blocks: [
    // ── Section 1 ──
    {
      type: 'section',
      id: 'sec-1',
      title: '1. The Compositionality Gap'
    },
    {
      type: 'paragraph',
      id: 'p-1',
      content: '<strong>Chain-of-thought (CoT) prompting</strong> represented a major advance in eliciting reasoning from large language models, yet it harbors a fundamental limitation: it fails to generalize from easy exemplars to harder test problems. If the few-shot demonstrations in a CoT prompt illustrate two-step reasoning chains, the model struggles, often catastrophically, when confronted with problems requiring five or more steps. This phenomenon is what Press et al. (2023) formally term the <strong>compositionality gap</strong>: the fraction of compositional problems a model answers incorrectly despite correctly answering all constituent sub-questions.'
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content: 'The root cause is structural. In standard CoT, the model must produce the entire reasoning chain in a single forward pass, with no mechanism for breaking the problem into manageable pieces. The exemplars implicitly define a difficulty ceiling: the model learns to mimic the <em>depth</em> of reasoning shown in the prompt, not to exceed it. Zhou et al. (2023) identify this as the <strong>easy-to-hard generalization failure</strong> and demonstrate that it is not merely a marginal degradation but a near-total collapse in performance on benchmarks designed to test compositional generalization.'
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content: 'The compositionality gap is not about model capacity. It is about prompting architecture. The same model that fails with CoT can succeed with a decomposition-based approach, because the bottleneck is how reasoning is <em>structured</em>, not whether the model <em>possesses</em> the requisite knowledge.'
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content: 'This insight motivates <strong>Least-to-Most Prompting (LTM)</strong>, introduced by Zhou et al. (2023) at ICLR 2023. Rather than asking the model to reason through a complex problem in one shot, LTM explicitly separates the act of <em>decomposing</em> a problem from the act of <em>solving</em> its parts. The result is a prompting strategy that enables large language models to solve problems substantially harder than anything shown in the few-shot exemplars, a capability that standard CoT fundamentally lacks.'
    },

    // ── Section 2 ──
    {
      type: 'section',
      id: 'sec-2',
      title: '2. The Two-Stage Framework'
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content: 'Least-to-Most Prompting operates in two distinct stages, each with its own prompt template and its own call to the language model. This separation is the core architectural innovation: by decoupling problem decomposition from problem solving, LTM ensures that the model can focus on one cognitive task at a time, and that the solutions to earlier subproblems are available as context when tackling later, harder ones.'
    },
    {
      type: 'heading',
      id: 'h-1',
      level: 3,
      text: 'Stage 1: Decomposition'
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content: 'In the <strong>decomposition stage</strong>, the model is prompted with a small number of exemplars showing how a complex problem can be broken down into a sequence of simpler subproblems. The prompt ends with the new (unseen) problem and asks the model to produce a similar decomposition. Crucially, the exemplars demonstrate the <em>principle</em> of decomposition. They need not cover every possible problem type, because the model generalizes the decomposition strategy itself.'
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'DecompositionTreeWidget'
    },
    {
      type: 'code-block',
      id: 'cb-1',
      label: 'decomposition prompt',
      content: `Q: "walk opposite left thrice after run left twice"
To solve "walk opposite left thrice after run left twice",
I need to first solve: "run left twice", then solve:
"walk opposite left thrice".

Q: "look around right thrice and walk opposite left"
To solve "look around right thrice and walk opposite left",
I need to first solve: "look around right thrice", then solve:
"walk opposite left".

Q: "jump around left twice after walk around left thrice"
To solve this, I need to first solve:`
    },
    {
      type: 'paragraph',
      id: 'p-6',
      content: '<Highlight>The model produces a list of subproblems ordered from simplest to most complex, hence the name <em>least-to-most</em>.</Highlight> This ordering is essential: it ensures that each subsequent subproblem can build on the solutions to all preceding ones.'
    },
    {
      type: 'heading',
      id: 'h-2',
      level: 3,
      text: 'Stage 2: Sequential Solving'
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content: 'In the <strong>subproblem solving stage</strong>, the decomposed subproblems are solved one at a time, in order from simplest to most complex. The key mechanism is <em>context accumulation</em>. After each subproblem is solved, its question-answer pair is appended to the prompt context for the next subproblem. This means that when the model tackles the hardest subproblem (typically the original question itself), it has access to the solutions of all prerequisite subproblems as part of its input.'
    },
    {
      type: 'code-block',
      id: 'cb-2',
      label: 'sequential solving prompt',
      content: `[Few-shot exemplars for solving atomic subproblems]

Q: "walk around left thrice"
A: "TURN LEFT WALK" repeated 3 times →
   TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK ...

(Previous solution appended to context)

Q: "jump around left twice after walk around left thrice"
The output of "walk around left thrice" is
TURN LEFT WALK TURN LEFT WALK TURN LEFT WALK ...
The output of "jump around left twice" is
TURN LEFT JUMP TURN LEFT JUMP TURN LEFT JUMP ...
So the output of "jump around left twice after
walk around left thrice" is
TURN LEFT WALK ... TURN LEFT JUMP ...`
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'accent',
      content: 'The critical innovation: solving each subproblem is <em>facilitated</em> by the answers to previously solved subproblems. This is what enables easy-to-hard generalization. The model never needs to solve a problem more complex than the exemplars in a single step, because the hard problem has been reduced to a series of easy ones.'
    },

    // ── Section 3 ──
    {
      type: 'section',
      id: 'sec-3',
      title: '3. The SCAN Breakthrough'
    },
    {
      type: 'paragraph',
      id: 'p-8',
      content: 'The most striking demonstration of Least-to-Most Prompting comes from the <strong>SCAN benchmark</strong>, a compositional generalization dataset introduced by Lake &amp; Baroni (2018). SCAN maps natural language commands (e.g., "jump around left twice after walk opposite right thrice") to action sequences (e.g., sequences of TURN, WALK, JUMP tokens). The benchmark is specifically designed to test whether models can compose familiar primitives into novel combinations, a capability often called <strong>systematic compositionality</strong>.'
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content: 'SCAN\'s most challenging evaluation is the <strong>length split</strong>, where the training set contains only short action sequences and the test set contains long ones. This split is deliberately designed to test easy-to-hard generalization, making it a natural proving ground for Least-to-Most Prompting.'
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content: 'The results are remarkable. Using <strong>code-davinci-002</strong> with only <strong>14 exemplars</strong>, Zhou et al. (2023) report the following:'
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Least-to-Most Prompting:</strong> <Latex>\\geq</Latex> 99% accuracy on <em>all</em> SCAN splits, including the notoriously difficult length split',
        '<strong>Standard Chain-of-Thought:</strong> approximately 16% accuracy on the length split',
        '<strong>Neural-symbolic models</strong> trained on the full training set of 15,000+ examples were required to match the performance that LTM achieved with 14 exemplars'
      ]
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'tip',
      content: 'With only 14 exemplars and no gradient updates, Least-to-Most Prompting matched the performance of specialized neural-symbolic architectures trained on over 15,000 examples. This is arguably the clearest empirical evidence that decomposition-based prompting can unlock compositional generalization in large language models.'
    },
    {
      type: 'paragraph',
      id: 'p-11',
      content: 'The gap between LTM and CoT on SCAN, from 99% to approximately 16%, is not a marginal improvement. It represents a qualitative shift in capability. Standard CoT cannot bridge the compositionality gap because its reasoning is monolithic: the model must produce the entire output sequence in one chain. LTM, by contrast, reduces the problem to a sequence of subproblems, each of which is no harder than the exemplars. The <em>composition</em> of solutions is handled by the context accumulation mechanism, not by the model\'s ability to reason across long chains.'
    },

    // ── Section 4 ──
    {
      type: 'section',
      id: 'sec-4',
      title: '4. Results on DROP and Math Reasoning'
    },
    {
      type: 'paragraph',
      id: 'p-12',
      content: 'Beyond SCAN, Zhou et al. (2023) evaluate Least-to-Most Prompting on the <strong>DROP benchmark</strong> (Discrete Reasoning Over Paragraphs), a reading comprehension dataset that requires numerical reasoning over text passages. DROP problems often involve multiple steps (counting entities, computing differences, or aggregating values) but many of these steps are individually straightforward. The challenge lies in their <em>composition</em>.'
    },
    {
      type: 'paragraph',
      id: 'p-13',
      content: 'On DROP, Least-to-Most Prompting <strong>significantly outperforms</strong> standard chain-of-thought. The improvement is particularly pronounced on questions where the required reasoning involves multiple subproblems that interact. For instance, finding two separate counts in a passage and then computing their difference. In these cases, CoT often conflates the subproblems or loses track of intermediate results, whereas LTM\'s explicit decomposition ensures that each quantity is computed in isolation before being combined.'
    },
    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'info',
      content: 'Many DROP problems involve what the authors describe as "trivially decomposed" subproblems: subproblems that are individually easy but collectively confusing when addressed in a single reasoning chain. LTM excels precisely in this regime, because the decomposition step separates concerns that CoT conflates.'
    },
    {
      type: 'paragraph',
      id: 'p-14',
      content: 'The authors also evaluate on <strong>symbolic manipulation</strong> tasks and <strong>math word problems</strong> requiring compositional reasoning. Across these domains, the pattern is consistent: whenever the test problems are compositionally harder than the exemplars, LTM maintains strong performance while CoT degrades. The advantage is smallest when the test problems are of comparable difficulty to the exemplars. In such cases, CoT\'s single-chain approach is sufficient, and the overhead of decomposition provides little benefit.'
    },
    {
      type: 'callout',
      id: 'c-5',
      calloutType: 'warning',
      content: 'Least-to-Most Prompting is not universally superior to CoT. When problems are not compositional in nature, or when test difficulty does not exceed exemplar difficulty, the two-stage overhead of LTM may be unnecessary. The method\'s strength is specifically in easy-to-hard generalization across compositional problem structures.'
    },

    // ── Section 5 ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. Comparison with Chain-of-Thought'
    },
    {
      type: 'paragraph',
      id: 'p-15',
      content: 'To understand when and why to choose Least-to-Most Prompting over Chain-of-Thought, it is useful to compare them along several dimensions. The two methods share the goal of eliciting multi-step reasoning from large language models, but they differ fundamentally in <em>how</em> that reasoning is structured.'
    },
    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Reasoning structure:</strong> CoT produces a single, linear reasoning chain. LTM explicitly decomposes the problem into subproblems and solves them sequentially, with context accumulation between steps.',
        '<strong>Compositional generalization:</strong> CoT fails when test problems are harder than the exemplars. LTM is specifically designed to handle this regime, where each subproblem is reduced to exemplar-level difficulty.',
        '<strong>Prompt templates:</strong> CoT requires a single prompt template containing exemplars with reasoning chains. LTM requires <em>two</em> prompt templates, one for decomposition and one for solving, which increases design complexity.',
        '<strong>API calls:</strong> CoT uses one LLM call per problem. LTM uses at minimum two calls (one for decomposition, one or more for solving), and potentially <Latex>k+1</Latex> calls for a problem that decomposes into <Latex>k</Latex> subproblems.',
        '<strong>Context utilization:</strong> CoT does not reuse intermediate results across separate reasoning steps. LTM explicitly appends prior solutions to the context, enabling later subproblems to build on earlier answers.',
        '<strong>Failure modes:</strong> CoT fails by producing incorrect or incomplete reasoning chains. LTM can fail at the decomposition stage (producing incorrect or incomplete subproblem lists) or at the solving stage (propagating errors from earlier subproblems).'
      ]
    },
    {
      type: 'callout',
      id: 'c-6',
      calloutType: 'accent',
      content: 'The choice between CoT and LTM reduces to a question of problem structure. For problems where the reasoning depth at test time is comparable to the exemplars, CoT is simpler and equally effective. For problems requiring compositional generalization, where the model must solve harder problems than it has seen, LTM is the principled choice.'
    },
    {
      type: 'paragraph',
      id: 'p-16',
      content: 'It is worth noting that LTM\'s two-stage design also offers a practical advantage: the decomposition and solving prompts can be designed and debugged independently. If the model produces correct decompositions but incorrect solutions (or vice versa), the practitioner can isolate and fix the problematic stage without redesigning the entire prompt.'
    },

    // ── Section 6: References ──
    {
      type: 'section',
      id: 'sec-6',
      title: '6. References & Further Reading'
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'Least-to-Most Prompting Enables Complex Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2205.10625',
      authors: 'Zhou, D., Schärli, N., Hou, L., Wei, J., Scales, N., Wang, X., Schuurmans, D., Cui, C., Bousquet, O., Le, Q., & Chi, E.',
      venue: 'ICLR',
      year: '2023',
      description: 'The foundational paper introducing the two-stage decomposition-then-solving framework with breakthrough results on SCAN, DROP, and compositional generalization benchmarks.'
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      authors: 'Wei, J., Wang, X., Schuurmans, D., et al.',
      venue: 'NeurIPS',
      year: '2022',
      description: 'The seminal CoT paper that established few-shot reasoning chains as a prompting paradigm, and whose limitations on compositional generalization motivated Least-to-Most Prompting.'
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'Generalization without Systematicity: On the Compositional Skills of Sequence-to-Sequence Recurrent Networks',
      url: 'https://arxiv.org/abs/1711.00350',
      authors: 'Lake, B.M. & Baroni, M.',
      venue: 'ICML',
      year: '2018',
      description: 'Introduces the SCAN benchmark for compositional generalization, which became the flagship evaluation for Least-to-Most Prompting\'s easy-to-hard generalization capabilities.'
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'Measuring and Narrowing the Compositionality Gap in Language Models',
      url: 'https://arxiv.org/abs/2210.03350',
      authors: 'Press, O., Zhang, M., Min, S., et al.',
      venue: 'EMNLP Findings',
      year: '2023',
      description: 'Formalizes the compositionality gap metric and demonstrates that decomposition-based prompting strategies systematically narrow this gap across model scales.'
    }
  ]
};
