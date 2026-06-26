export const pageData = {
  route: 'concept:prompting-few-shot',
  urlPath: '/concepts/prompting/few-shot',
  status: 'published',
  meta: {
    title: 'Few-Shot In-Context Learning',
    subtitle: 'The paradigm-defining discovery of GPT-3: large language models can learn new tasks at inference time simply by conditioning on a handful of input-output demonstrations, without any gradient updates to model parameters.',
    category: 'concept',
    subcategory: 'Prompting',
    ready: true,
  },
  blocks: [
    // ── Section 1 ──
    { type: 'section', id: 'sec-1', title: '1. The In-Context Learning Paradigm' },

    {
      type: 'paragraph',
      id: 'p-1',
      content:
        '<strong>In-context learning</strong> (ICL) refers to a model\'s ability to perform a new task at inference time by conditioning on a small set of <Latex>k</Latex> input-output demonstrations, called <strong>few-shot examples</strong>, prepended to the prompt. Crucially, ICL involves <em>no gradient updates</em> to the model\'s parameters. The entire "learning" occurs through the forward pass: the model reads the demonstrations, infers the latent task structure, and generates an appropriate completion for the test query. This stands in sharp contrast to the traditional <strong>fine-tuning</strong> paradigm, which requires collecting a task-specific labeled dataset, computing gradients via backpropagation, and updating some or all of the model\'s weights through iterative optimization.',
    },

    {
      type: 'paragraph',
      id: 'p-2',
      content:
        'Formally, given a pre-trained language model <Latex>p_\\theta</Latex>, a set of demonstrations <Latex>D = \\{(x_1, y_1), (x_2, y_2), \\ldots, (x_k, y_k)\\}</Latex>, and a test input <Latex>x_{\\text{test}}</Latex>, few-shot ICL computes the prediction as follows.',
    },

    {
      type: 'math-box',
      id: 'm-1',
      expression: 'y_{\\text{test}} = \\arg\\max_y \\, p_\\theta(y \\mid D, x_{\\text{test}})',
    },

    {
      type: 'paragraph',
      id: 'p-3',
      content:
        'The parameters <Latex>\\theta</Latex> remain frozen throughout; the demonstrations <Latex>D</Latex> serve purely as a textual conditioning signal.',
    },

    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content:
        'The defining property of in-context learning is that the model\'s weights are never updated. All task adaptation happens through the input text itself. The demonstrations act as a soft specification of the desired input-output mapping.',
    },

    {
      type: 'paragraph',
      id: 'p-4',
      content:
        'Brown et al. (2020) systematically defined three evaluation settings for GPT-3: <strong>zero-shot</strong> (a natural language task description only, with no examples), <strong>one-shot</strong> (a single demonstration), and <strong>few-shot</strong> (typically 10 to 100 demonstrations, limited only by the model\'s context window). The following prompt illustrates a typical few-shot translation setup:',
    },

    {
      type: 'code-block',
      id: 'cb-1',
      label: 'prompt example',
      content:
        "Translate English to French:\n\nEnglish: The weather is beautiful today.\nFrench: Le temps est magnifique aujourd'hui.\n\nEnglish: Where is the nearest library?\nFrench: Où est la bibliothèque la plus proche ?\n\nEnglish: I would like a cup of coffee, please.\nFrench: Je voudrais une tasse de café, s'il vous plaît.\n\nEnglish: How much does this cost?\nFrench:",
    },

    {
      type: 'paragraph',
      id: 'p-5',
      content:
        'In this example, three English-French pairs serve as demonstrations. The model observes the pattern: each English sentence is followed by its French translation. It then applies this mapping to the final, unanswered query. No translation-specific training data, loss function, or optimizer is involved.',
    },

    // ── Section 2 ──
    { type: 'section', id: 'sec-2', title: '2. Emergence at Scale' },

    {
      type: 'paragraph',
      id: 'p-6',
      content:
        'The central empirical finding of Brown et al. (2020) was that few-shot in-context learning is an <strong>emergent capability</strong> that appears, and dramatically improves, with model scale. The authors trained GPT-3, a 175 billion parameter autoregressive Transformer, which was at the time 10× larger than any previous non-sparse language model. The architecture employed a standard Transformer design with alternating dense and locally banded sparse attention patterns across its 96 layers.',
    },

    {
      type: 'paragraph',
      id: 'p-7',
      content:
        'Across a comprehensive suite of NLP benchmarks, spanning translation, question answering, cloze tasks, word unscrambling, and 3-digit arithmetic, the authors observed a consistent pattern: <em>the performance gap between zero-shot and few-shot evaluation widens as model size increases</em>. Smaller models (e.g., GPT-3 Small at 125M parameters) showed only modest improvements when provided with demonstrations. By contrast, GPT-3 175B exhibited substantial gains, often achieving results competitive with state-of-the-art fine-tuned models on the same benchmarks.',
    },

    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content:
        'GPT-3 was trained on a filtered version of Common Crawl, WebText2, Books1, Books2, and English-language Wikipedia, totaling approximately 570 GB of text after filtering. The diversity of this pre-training corpus is believed to be a key factor enabling broad generalization across tasks.',
    },

    {
      type: 'paragraph',
      id: 'p-8',
      content:
        'This scale-dependent emergence had profound implications. It suggested that in-context learning is not merely a surface-level pattern-matching heuristic but rather a capability that becomes qualitatively more powerful as the model\'s representational capacity grows. The 175B model could, for instance, perform 2-digit addition with high accuracy in the few-shot setting, a task that requires implicit algorithmic reasoning rather than lexical pattern matching. On SuperGLUE, GPT-3 few-shot approached the performance of fine-tuned BERT-Large, despite never updating a single parameter on task-specific data.',
    },

    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'accent',
      content:
        'The scaling behavior of ICL fundamentally challenged the prevailing fine-tuning paradigm: if a sufficiently large model can match fine-tuned performance by simply reading a few examples, the economic and engineering calculus of NLP deployment shifts entirely.',
    },

    // ── Section 3 ──
    { type: 'section', id: 'sec-3', title: '3. Mechanics of In-Context Learning' },

    {
      type: 'paragraph',
      id: 'p-9',
      content:
        'A central open question in the field is <em>how</em> in-context learning works mechanistically. How can a model "learn" a task from demonstrations without any weight updates? Several theoretical frameworks have been proposed, each offering a partial but illuminating perspective.',
    },

    {
      type: 'paragraph',
      id: 'p-10',
      content:
        '<strong>ICL as implicit Bayesian inference.</strong> Xie et al. (2022) provided a formal analysis showing that in-context learning can be understood as implicit Bayesian inference over a latent concept variable. Under their framework, the pre-training distribution is modeled as a mixture of latent "concepts" (analogous to tasks or domains). When demonstrations are provided, the model implicitly performs posterior inference, using the examples to narrow down which concept generated the data, and then generates completions consistent with the inferred concept. Formally, if <Latex>\\theta</Latex> represents the latent concept, the model computes something akin to the following expression, where <Latex>p(\\theta \\mid D)</Latex> is the posterior over concepts given the demonstrations.',
    },

    { type: 'custom-element', id: 'w-1', name: 'DemonstrationBuilderWidget' },

    {
      type: 'math-box',
      id: 'm-2',
      expression:
        'p(y \\mid x_{\\text{test}}, D) = \\sum_\\theta p(y \\mid x_{\\text{test}}, \\theta) \\, p(\\theta \\mid D)',
    },

    {
      type: 'paragraph',
      id: 'p-11',
      content:
        '<strong>ICL as implicit meta-learning.</strong> A complementary perspective frames pre-training itself as a form of meta-learning. During pre-training, the model is exposed to a vast distribution of implicit "tasks" embedded in natural text: summarization within news articles, translation within multilingual documents, question-answering within educational texts. The Transformer architecture, with its attention mechanism, learns a general-purpose algorithm for extracting task specifications from context and applying them to new inputs. In this view, ICL is not a surprising emergent behavior but rather the <em>intended</em> output of a meta-learning process that spans the entire pre-training phase.',
    },

    {
      type: 'paragraph',
      id: 'p-12',
      content:
        '<strong>The role of the pre-training distribution.</strong> Min et al. (2022) conducted a surprising experiment that further illuminated ICL mechanics: they found that, by <em>randomly replacing the labels</em> in few-shot demonstrations, (e.g., assigning incorrect sentiment labels to reviews) had only a modest effect on performance. This suggested that ICL relies heavily on the <em>format</em> and <em>input distribution</em> of the demonstrations rather than the specific input-label mappings. The demonstrations appear to serve primarily as a signal about the task format, label space, and input distribution. This is information the model uses to activate the appropriate pre-trained capabilities.',
    },

    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'tip',
      content:
        'These findings suggest that in-context learning is not a single mechanism but a composite phenomenon: the demonstrations simultaneously specify the task format, constrain the output space, activate relevant pre-trained knowledge, and, in larger models, provide genuine input-output mapping information.',
    },

    // ── Section 4 ──
    { type: 'section', id: 'sec-4', title: '4. Sensitivity and Failure Modes' },

    {
      type: 'paragraph',
      id: 'p-13',
      content:
        'Despite its remarkable capabilities, few-shot in-context learning exhibits well-documented <strong>brittleness</strong> that practitioners must carefully navigate. The same model, given the same set of demonstrations in different configurations, can produce wildly divergent results.',
    },

    {
      type: 'paragraph',
      id: 'p-14',
      content:
        '<strong>Example ordering sensitivity.</strong> Lu et al. (2022) demonstrated that the <em>permutation</em> of few-shot examples alone can cause accuracy to swing from near-chance to near-state-of-the-art on the same task. On the SST-2 sentiment classification benchmark, simply reordering the same set of demonstrations produced accuracy ranging from approximately 54% (near random) to 93% (near SOTA). This extreme sensitivity to ordering is not predicted by any simple theory of ICL and remains an active area of investigation.',
    },

    {
      type: 'callout',
      id: 'c-5',
      calloutType: 'warning',
      content:
        'Reporting few-shot results from a single example ordering is methodologically inadequate. Robust evaluation requires averaging over multiple permutations or using principled ordering strategies such as the entropy-based methods proposed by Lu et al. (2022).',
    },

    {
      type: 'paragraph',
      id: 'p-15',
      content: 'Several systematic biases have been identified in few-shot ICL:',
    },

    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Majority label bias:</strong> Models disproportionately predict whichever label appears most frequently in the demonstrations, regardless of the test input\'s true label.',
        '<strong>Recency bias:</strong> Labels appearing toward the end of the demonstration sequence exert a stronger influence on the model\'s prediction than those appearing earlier, reflecting the autoregressive attention pattern.',
        '<strong>Label space bias:</strong> The model may exhibit strong prior preferences for certain tokens in the label space (e.g., preferring "positive" over "negative"), independent of the demonstrations provided.',
        '<strong>Format sensitivity:</strong> The choice between natural language templates (e.g., "This review is positive") versus structured formats (e.g., "Input: ... Label: positive") can significantly affect performance, and the optimal format varies by task and model.',
      ],
    },

    {
      type: 'paragraph',
      id: 'p-16',
      content:
        'These failure modes collectively suggest that few-shot ICL, while powerful, is not a reliable drop-in replacement for fine-tuning in high-stakes applications without careful calibration and prompt engineering. Techniques such as contextual calibration, which adjusts predictions by the model\'s prior bias estimated from content-free inputs, have been proposed to mitigate some of these issues, though none fully resolves the underlying fragility.',
    },

    // ── Section 5 ──
    { type: 'section', id: 'sec-5', title: '5. Legacy and Impact' },

    {
      type: 'paragraph',
      id: 'p-17',
      content:
        'Few-shot in-context learning, as demonstrated by GPT-3, represents one of the most consequential discoveries in modern NLP. It fundamentally reshaped how practitioners interact with language models, inaugurating what is now called the <strong>prompting paradigm</strong>: the idea that task-specific behavior can be elicited through carefully designed textual inputs rather than through model retraining.',
    },

    {
      type: 'paragraph',
      id: 'p-18',
      content: 'The impact of this discovery cascaded through the field in several directions:',
    },

    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Chain-of-thought prompting:</strong> Wei et al. (2022) extended the few-shot paradigm by including explicit reasoning steps within each demonstration. Rather than providing only input-output pairs, chain-of-thought demonstrations include intermediate reasoning traces, enabling models to solve complex multi-step problems that are intractable under standard few-shot ICL.',
        '<strong>Instruction tuning:</strong> The success of ICL motivated research into training models to follow arbitrary instructions, blending the flexibility of prompting with the reliability of fine-tuning. This led to systems like InstructGPT and FLAN.',
        '<strong>Prompt engineering as a discipline:</strong> ICL spawned an entirely new field concerned with optimizing prompts, including automatic prompt search, prompt tuning (soft prompts), and the study of what makes certain demonstrations more effective than others.',
        '<strong>Democratization of NLP:</strong> By eliminating the need for task-specific training data and GPU-intensive fine-tuning, ICL made sophisticated NLP capabilities accessible to users without machine learning expertise, a shift that catalyzed the rapid adoption of large language models across industries.',
      ],
    },

    {
      type: 'callout',
      id: 'c-6',
      calloutType: 'accent',
      content:
        'Few-shot ICL did not merely introduce a new technique; it redefined the interface between humans and language models. The prompt became the program, and natural language became the programming language of AI systems.',
    },

    {
      type: 'paragraph',
      id: 'p-19',
      content:
        'Today, virtually every major prompting strategy, from chain of thought to tree of thought to retrieval-augmented generation, traces its conceptual lineage to the few-shot in-context learning paradigm established by Brown et al. (2020). The discovery that large Transformers can learn from examples provided at inference time remains one of the foundational insights of the current era of artificial intelligence.',
    },

    // ── References ──
    { type: 'section', id: 'sec-6', title: 'References & Further Reading' },

    {
      type: 'reference',
      id: 'r-1',
      title: 'Language Models are Few-Shot Learners',
      url: 'https://arxiv.org/abs/2005.14165',
      authors: 'Brown, T.B., Mann, B., Ryder, N., et al.',
      venue: 'NeurIPS',
      year: '2020',
      description:
        'The foundational GPT-3 paper establishing few-shot in-context learning as a viable paradigm across diverse NLP tasks.',
    },

    {
      type: 'reference',
      id: 'r-2',
      title: 'An Explanation of In-context Learning as Implicit Bayesian Inference',
      url: 'https://arxiv.org/abs/2111.02080',
      authors: 'Xie, S.M., Raghunathan, A., Liang, P., & Ma, T.',
      venue: 'ICLR',
      year: '2022',
      description:
        'A theoretical framework modeling ICL as posterior inference over latent concepts in the pre-training distribution.',
    },

    {
      type: 'reference',
      id: 'r-3',
      title: 'Fantastically Ordered Prompts and Where to Find Them',
      url: 'https://arxiv.org/abs/2104.08786',
      authors: 'Lu, Y., Bartolo, M., Moore, A., Riedel, S., & Stenetorp, P.',
      venue: 'ACL',
      year: '2022',
      description:
        'Demonstrates that few-shot prompt ordering can cause accuracy swings from near-chance to near-SOTA and proposes entropy-based ordering strategies.',
    },

    {
      type: 'reference',
      id: 'r-4',
      title: 'Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?',
      url: 'https://arxiv.org/abs/2202.12837',
      authors: 'Min, S., Lyu, X., Holtzman, A., et al.',
      venue: 'EMNLP',
      year: '2022',
      description:
        'Reveals that ground-truth labels in demonstrations matter less than expected, suggesting ICL relies heavily on format and input distribution cues.',
    },
  ],
};
