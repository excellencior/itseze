export const pageData = {
  route: 'concept:prompting-zero-shot',
  urlPath: '/concepts/prompting/zero-shot',
  status: 'published',
  meta: {
    title: 'Zero-Shot Prompting',
    subtitle: 'The simplest and most fundamental evaluation paradigm for large language models. Zero-shot prompting measures a model\'s ability to generalize from pre-training knowledge alone, completing tasks from nothing more than a natural language instruction.',
    category: 'concept',
    subcategory: 'Prompting',
    ready: true
  },
  blocks: [
    // ── Section 1 ──
    { type: 'section', id: 'sec-1', title: '1. What Is Zero-Shot Prompting' },

    {
      type: 'paragraph', id: 'p-1',
      content: '<strong>Zero-shot prompting</strong> is the evaluation setting in which a language model receives <em>only</em> a natural language description of a task, with no worked examples whatsoever, before being asked to produce an answer. Formally, the model is given a prompt <Latex>p</Latex> consisting of a task instruction <Latex>I</Latex> and a query <Latex>q</Latex>, and must generate a completion <Latex>y</Latex> that maximizes the conditional probability:'
    },

    {
      type: 'math-box', id: 'm-1',
      expression: 'y = \\arg\\max P(y \\mid I, q)'
    },

    {
      type: 'paragraph', id: 'p-2',
      content: 'Critically, the conditioning context contains zero demonstration pairs <Latex>(x_i, y_i)</Latex>; the model must rely entirely on knowledge acquired during pre-training. The prompt structure is therefore minimal: an instruction, an empty demonstrations slot, and the input query.'
    },

    {
      type: 'custom-element', id: 'w-1',
      name: 'PromptAnatomyWidget'
    },

    {
      type: 'paragraph', id: 'p-3',
      content: 'This stands in contrast to <strong>few-shot prompting</strong>, where the prompt is augmented with <Latex>k</Latex> input output examples (typically <Latex>k \\in [10, 100]</Latex>) that illustrate the desired behavior before the actual query, and <strong>one-shot prompting</strong>, which provides a single demonstration. Brown et al. (2020) formalized these three settings as a spectrum of <em>in-context learning</em> regimes, each distinguished solely by the number of examples prepended to the query, with no gradient updates or fine-tuning applied in any case.'
    },

    {
      type: 'callout', id: 'c-1', calloutType: 'tip',
      content: 'Zero-shot is the purest test of generalization: the model must infer what task is being asked, how to format its answer, and what knowledge to draw upon, all from a single natural language instruction.'
    },

    {
      type: 'paragraph', id: 'p-4',
      content: 'The following example illustrates the structural difference between a zero-shot prompt and a few-shot prompt for the same sentiment classification task:'
    },

    {
      type: 'code-block', id: 'cb-1', label: 'zero-shot prompt',
      content: 'Classify the sentiment of the following review as "positive" or "negative".\n\nReview: "The cinematography was breathtaking but the plot felt hollow."\nSentiment:'
    },

    {
      type: 'code-block', id: 'cb-2', label: 'few-shot prompt',
      content: 'Classify the sentiment of each review as "positive" or "negative".\n\nReview: "An absolute masterpiece from start to finish."\nSentiment: positive\n\nReview: "Terrible acting and a predictable storyline."\nSentiment: negative\n\nReview: "The cinematography was breathtaking but the plot felt hollow."\nSentiment:'
    },

    {
      type: 'paragraph', id: 'p-5',
      content: 'In the zero-shot case, the model must independently determine the label space, output format, and decision boundary. In the few-shot case, these are implicitly communicated through the provided demonstrations.'
    },

    // ── Section 2 ──
    { type: 'section', id: 'sec-2', title: '2. The GPT-3 Paradigm Shift' },

    {
      type: 'paragraph', id: 'p-6',
      content: 'Before GPT-3, the dominant paradigm in NLP was <em>pre-train then fine-tune</em>: a model would be pre-trained on a large corpus of text, then its parameters would be updated via supervised gradient descent on a task-specific labeled dataset. Models such as BERT, GPT-2, and their variants required this fine-tuning step to achieve competitive performance on downstream benchmarks. Radford et al. (2019) demonstrated with GPT-2 that language models could perform tasks in a zero-shot manner, notably achieving promising results on reading comprehension and summarization, but the performance remained well below fine-tuned baselines.'
    },

    {
      type: 'paragraph', id: 'p-7',
      content: 'Brown et al. (2020) changed the landscape entirely. <strong>GPT-3</strong>, a 175 billion parameter autoregressive language model, demonstrated that sufficient scale unlocks meaningful zero-shot performance without any gradient updates or fine-tuning. Tasks were specified purely via text interaction: the model received a natural language instruction describing the task, and produced an answer as a straightforward continuation. GPT-3 achieved strong zero-shot performance on translation, question-answering, and cloze tasks, establishing that <em>in-context task specification</em> is a viable alternative to the fine-tuning paradigm.'
    },

    {
      type: 'callout', id: 'c-2', calloutType: 'info',
      content: 'A key finding from Brown et al. (2020) is that the performance gap between zero-shot, one-shot, and few-shot settings <em>grows</em> with model scale. Larger models benefit disproportionately from in-context examples, but they also exhibit stronger zero-shot baselines, suggesting that scale improves both raw generalization and the ability to learn from context.'
    },

    {
      type: 'paragraph', id: 'p-8',
      content: 'The conceptual breakthrough was the recognition that a sufficiently large language model, trained on a diverse enough corpus, implicitly learns to perform a wide variety of tasks during pre-training. The prompt serves not as training data but as a <em>task specifier</em>, a natural language interface that activates pre-existing capabilities. This insight, that prompting is a form of task retrieval rather than task learning, remains foundational to the field of prompt engineering.'
    },

    // ── Section 3 ──
    { type: 'section', id: 'sec-3', title: '3. Instruction Tuning and RLHF' },

    {
      type: 'paragraph', id: 'p-9',
      content: 'While GPT-3 demonstrated the feasibility of zero-shot prompting at scale, its zero-shot performance still lagged behind the few-shot setting on most benchmarks. The model often struggled to follow instructions precisely, produced outputs in unexpected formats, or generated plausible-sounding but factually incorrect completions. <Highlight>The reason is straightforward: GPT-3 was trained as a <em>next-token predictor</em> over web text, not as an instruction follower.</Highlight> Its objective was to model the next-token conditional probability:'
    },

    {
      type: 'math-box', id: 'm-2',
      expression: 'P(\\text{token}_t \\mid \\text{token}_{<t})'
    },

    {
      type: 'paragraph', id: 'p-10',
      content: 'This objective does not inherently reward helpfulness, correctness, or adherence to user intent.'
    },

    {
      type: 'paragraph', id: 'p-11',
      content: '<strong>Instruction tuning</strong> addresses this misalignment. Ouyang et al. (2022) introduced <strong>InstructGPT</strong>, which applied <strong>Reinforcement Learning from Human Feedback (RLHF)</strong> to align model outputs with human preferences. The training pipeline consisted of three stages: (1) supervised fine-tuning on a dataset of human-written demonstrations of desired behavior, (2) training a reward model on human-ranked comparisons of model outputs, and (3) optimizing the language model against this reward signal using Proximal Policy Optimization (PPO).'
    },

    {
      type: 'callout', id: 'c-3', calloutType: 'tip',
      content: 'InstructGPT showed that a 1.3 billion parameter model fine-tuned with RLHF could outperform a 175 billion parameter GPT-3 on human preference evaluations, demonstrating that alignment techniques are a powerful multiplier for zero-shot capability, often more impactful than raw scale alone.'
    },

    {
      type: 'paragraph', id: 'p-12',
      content: 'The implication for zero-shot prompting is profound. Instruction-tuned models generalize dramatically better to unseen tasks phrased as natural language instructions. Where base GPT-3 required carefully engineered prompts, often including formatting cues, explicit output specifications, and occasionally few-shot examples to steer behavior, instruction-tuned models can interpret and act on straightforward instructions with markedly higher reliability. This improvement is not simply a matter of better outputs; it fundamentally broadened the set of tasks accessible through zero-shot prompting.'
    },

    // ── Section 4 ──
    { type: 'section', id: 'sec-4', title: '4. The Role of Task Phrasing' },

    {
      type: 'paragraph', id: 'p-13',
      content: 'One of the most consequential and under-appreciated aspects of zero-shot prompting is the sensitivity of model performance to <strong>task phrasing</strong>. Because zero-shot prompts contain no demonstrations to anchor the model\'s interpretation, the exact wording of the instruction becomes the <em>sole</em> signal the model has for inferring the task, the expected output format, the label space, and the desired reasoning depth. Small variations in phrasing can produce dramatically different results, a phenomenon sometimes called <em>prompt brittleness</em>.'
    },

    {
      type: 'paragraph', id: 'p-14',
      content: 'Consider the following two phrasings for the same fact extraction task:'
    },

    {
      type: 'code-block', id: 'cb-3', label: 'effective phrasing',
      content: 'Extract the country of origin from the following product description. \nRespond with only the country name.\n\nDescription: "This single-origin Arabica coffee is sourced from the highlands of Ethiopia and roasted in small batches in Portland, Oregon."\nCountry of origin:'
    },

    {
      type: 'code-block', id: 'cb-4', label: 'poor phrasing',
      content: 'Where is this from?\n\n"This single-origin Arabica coffee is sourced from the highlands of Ethiopia and roasted in small batches in Portland, Oregon."'
    },

    {
      type: 'paragraph', id: 'p-15',
      content: 'The effective phrasing succeeds because it specifies the exact task (<em>extract the country of origin</em>), constrains the output format (<em>respond with only the country name</em>), and provides a clear completion cue (<em>Country of origin:</em>). The poor phrasing is ambiguous. The question "where is this from" could refer to the bean origin, the roasting location, the brand, or the text source, and provides no formatting constraint, making the model likely to produce verbose or off-target responses.'
    },

    {
      type: 'callout', id: 'c-4', calloutType: 'warning',
      content: 'In the zero-shot setting, there are no demonstrations to disambiguate intent. Every ambiguity in the instruction is an opportunity for the model to diverge from the desired behavior. Effective zero-shot prompts are explicit about <em>what</em> to do, <em>how</em> to format the output, and <em>what constraints</em> to observe.'
    },

    {
      type: 'paragraph', id: 'p-16',
      content: 'This phrasing sensitivity has important practical consequences. It means that zero-shot prompt design is not a trivial exercise; it requires careful attention to specificity, output constraints, and the elimination of ambiguity. It also partially explains why instruction-tuned models show such dramatic improvements in zero-shot settings: RLHF training makes models more robust to variation in phrasing by teaching them to infer user intent even from imprecise instructions.'
    },

    // ── Section 5 ──
    { type: 'section', id: 'sec-5', title: '5. Strengths and Limitations' },

    {
      type: 'paragraph', id: 'p-17',
      content: 'Zero-shot prompting occupies a unique position in the landscape of prompting strategies. Its strengths make it the default starting point for most interactions with modern language models, while its limitations motivate the development of more sophisticated techniques such as few-shot prompting, chain-of-thought reasoning, and retrieval-augmented generation.'
    },

    {
      type: 'paragraph', id: 'p-18',
      content: '<strong>Strengths:</strong>'
    },

    {
      type: 'list', id: 'l-1', listType: 'unordered',
      items: [
        '<strong>No labeled examples required.</strong> Zero-shot prompting eliminates the need for curated demonstration sets, making it immediately applicable to any task, including novel or domain-specific tasks for which no labeled data exists.',
        '<strong>Cross-domain generality.</strong> A single instruction-tuned model can be applied to translation, summarization, classification, extraction, code generation, and creative writing without task-specific adaptation.',
        '<strong>Speed and simplicity.</strong> Zero-shot prompts are fast to construct and require minimal engineering effort. They serve as the natural first attempt when exploring a new task.',
        '<strong>Reduced prompt length.</strong> Without demonstrations, prompts are short, leaving more of the model\'s context window available for the actual input and output, a meaningful advantage for tasks involving long documents.',
        '<strong>No example selection bias.</strong> Few-shot prompting introduces the problem of which examples to select and in what order, choices that can significantly affect performance. Zero-shot prompting avoids this confound entirely.'
      ]
    },

    {
      type: 'paragraph', id: 'p-19',
      content: '<strong>Limitations:</strong>'
    },

    {
      type: 'list', id: 'l-2', listType: 'unordered',
      items: [
        '<strong>Struggles with complex multi-step reasoning.</strong> Brown et al. (2020) found that zero-shot GPT-3 performed poorly on tasks requiring arithmetic, logical inference, or compositional reasoning, a limitation that directly motivated the development of chain-of-thought prompting (Wei et al., 2022).',
        '<strong>Sensitivity to phrasing.</strong> As discussed in Section 4, zero-shot performance is highly dependent on the exact wording of the instruction. This brittleness can make results unreliable without careful prompt design.',
        '<strong>Performance gap relative to few-shot.</strong> On most standardized benchmarks, zero-shot performance consistently lags behind few-shot performance, particularly for smaller models where in-context examples provide a larger marginal benefit.',
        '<strong>Format unpredictability.</strong> Without demonstrations to anchor the expected output structure, zero-shot models may produce answers in inconsistent formats, a significant issue for downstream pipelines that parse model outputs programmatically.',
        '<strong>Dependence on model scale and alignment.</strong> Zero-shot prompting is most effective with large, instruction-tuned models. Smaller or base models may require few-shot examples to achieve acceptable performance on the same tasks.'
      ]
    },

    {
      type: 'callout', id: 'c-5', calloutType: 'accent',
      content: 'Zero-shot prompting is best understood not as a competitor to few-shot or chain-of-thought methods, but as the <em>baseline</em> from which more sophisticated strategies depart. Understanding its capabilities and failure modes is essential for knowing when additional techniques are warranted.'
    },

    // ── Section 6 ──
    { type: 'section', id: 'sec-6', title: '6. References & Further Reading' },

    {
      type: 'reference', id: 'r-1',
      title: 'Language Models are Few-Shot Learners',
      url: 'https://arxiv.org/abs/2005.14165',
      authors: 'Brown, T.B., Mann, B., Ryder, N., et al.',
      venue: 'NeurIPS',
      year: '2020',
      description: 'The foundational GPT-3 paper that formalized zero-shot, one-shot, and few-shot in-context learning with a 175B parameter autoregressive model.'
    },

    {
      type: 'reference', id: 'r-2',
      title: 'Training Language Models to Follow Instructions with Human Feedback',
      url: 'https://arxiv.org/abs/2203.02155',
      authors: 'Ouyang, L., Wu, J., Jiang, X., et al.',
      venue: 'NeurIPS',
      year: '2022',
      description: 'Introduces InstructGPT and the RLHF pipeline that dramatically improved zero-shot instruction following.'
    },

    {
      type: 'reference', id: 'r-3',
      title: 'Language Models are Unsupervised Multitask Learners',
      url: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf',
      authors: 'Radford, A., Wu, J., Child, R., et al.',
      venue: 'OpenAI',
      year: '2019',
      description: 'The GPT-2 paper that first demonstrated zero-shot task transfer via language modeling, establishing the conceptual predecessor to GPT-3\'s in-context learning paradigm.'
    }
  ]
};
