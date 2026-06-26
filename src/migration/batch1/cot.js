export const pageData = {
  route: 'concept:prompting-cot',
  urlPath: '/concepts/prompting/cot',
  status: 'published',
  meta: {
    title: 'Chain-of-Thought Prompting',
    subtitle: 'The breakthrough insight that providing step-by-step reasoning exemplars in the prompt dramatically improves performance on complex arithmetic, commonsense, and symbolic reasoning tasks, unlocking emergent reasoning abilities in sufficiently large language models.',
    category: 'concept',
    subcategory: 'Prompting',
    ready: true,
  },
  blocks: [
    // ── Section 1: The Key Insight ──
    { type: 'section', id: 'sec-1', title: '1. The Key Insight' },

    {
      type: 'paragraph',
      id: 'p-1',
      content:
        'Standard <strong>few-shot prompting</strong>, as introduced by Brown et al. (2020), demonstrates a task to the model by providing a handful of input output pairs in the prompt. For many tasks (sentiment classification, translation, simple factual recall) this is sufficient. But on problems requiring <em>multi-step reasoning</em>, the model confronts a fundamental bottleneck: it must collapse an arbitrarily complex reasoning process into a single forward pass that directly maps input to output.',
    },

    {
      type: 'paragraph',
      id: 'p-2',
      content:
        '<strong>Chain-of-thought (CoT) prompting</strong>, introduced by Wei et al. (2022), resolves this bottleneck with a deceptively simple modification: instead of providing exemplars as <Latex>x, y</Latex> pairs, provide them as <Latex>x, c, y</Latex> triples, where <Latex>c</Latex> is a sequence of intermediate reasoning steps, a <em>chain of thought</em>, connecting the input <Latex>x</Latex> to the answer <Latex>y</Latex>.',
    },

    {
      type: 'paragraph',
      id: 'p-3',
      content:
        'This is not merely a cosmetic change to the prompt format. By eliciting the model to generate intermediate tokens before producing the final answer, CoT expands the model\'s effective computational capacity. Each generated token functions as a unit of <strong>external working memory</strong>: the model can decompose a complex problem into subproblems, solve each subproblem in sequence, carry intermediate results forward through the generated text, and finally compose them into the answer. The chain of thought transforms the model from a single-step pattern matcher into a sequential reasoner.',
    },

    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content:
        'Chain-of-thought prompting turns the model\'s own generated tokens into a scratchpad for multi-step computation, overcoming the fixed-depth reasoning constraint of a single transformer forward pass.',
    },

    // ── Section 2: Formal Definition and Prompt Structure ──
    { type: 'section', id: 'sec-2', title: '2. Formal Definition and Prompt Structure' },

    {
      type: 'paragraph',
      id: 'p-4',
      content:
        'Formally, a <strong>chain-of-thought prompt</strong> consists of a set of <Latex>k</Latex> exemplars, each structured as a triple <Latex>x_i, c_i, y_i</Latex>, where:',
    },

    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<Latex>x_i</Latex> is the input (e.g., a math word problem or a commonsense question),',
        '<Latex>c_i</Latex> is the chain of thought, a natural-language sequence of intermediate reasoning steps, and',
        '<Latex>y_i</Latex> is the final answer.',
      ],
    },

    {
      type: 'paragraph',
      id: 'p-5',
      content:
        'At inference time, the model is presented with these <Latex>k</Latex> exemplars followed by a new input <Latex>x_{k+1}</Latex>. The model generates <Latex>c_{k+1}</Latex> (its own chain of thought) autoregressively, then produces the final answer <Latex>y_{k+1}</Latex>. Wei et al. (2022) used <Latex>k = 8</Latex> exemplars across their experiments, hand-crafted by the authors to include simple but representative reasoning chains.',
    },

    {
      type: 'paragraph',
      id: 'p-6',
      content:
        'The following example illustrates the structure using a GSM8K-style arithmetic word problem:',
    },

    {
      type: 'code-block',
      id: 'cb-1',
      label: 'standard prompting',
      content:
        'Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?\nA: The answer is 11.',
    },

    {
      type: 'code-block',
      id: 'cb-2',
      label: 'chain-of-thought prompting',
      content:
        'Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?\nA: Roger started with 5 balls. 2 cans of 3 tennis balls each is 2 × 3 = 6 tennis balls. 5 + 6 = 11. The answer is 11.',
    },

    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content:
        'The chain of thought is written in natural language. No special formatting, no structured templates. The model learns the <em>pattern</em> of showing its work from the exemplars and applies it to new problems. This simplicity is a key advantage: CoT requires no fine-tuning, no architectural changes, and no specialized training data.',
    },

    { type: 'custom-element', id: 'w-1', name: 'CoTTraceStepperWidget' },

    // ── Section 3: Empirical Results ──
    { type: 'section', id: 'sec-3', title: '3. Empirical Results' },

    {
      type: 'paragraph',
      id: 'p-7',
      content:
        'Wei et al. (2022) evaluated chain-of-thought prompting across three families of large language models (<strong>LaMDA</strong>, <strong>GPT-3</strong>, and <strong>PaLM</strong>) on a comprehensive suite of benchmarks spanning arithmetic reasoning, commonsense reasoning, and symbolic reasoning. The results established CoT as a major advance in prompting methodology.',
    },

    {
      type: 'paragraph',
      id: 'p-8',
      content:
        '<strong>Arithmetic reasoning.</strong> The flagship result came on the <strong>GSM8K</strong> benchmark, a dataset of grade-school math word problems requiring multi-step arithmetic. PaLM 540B with 8 chain-of-thought exemplars achieved <strong>58% accuracy</strong>, surpassing the prior state-of-the-art set by a fine-tuned GPT-3 model with a learned verifier at 55% (Cobbe et al., 2021). This was a striking result: a simple prompting technique, requiring <em>zero gradient updates</em>, outperformed a system that demanded both fine-tuning and a separately trained verification module. Across additional arithmetic benchmarks (SVAMP, AQuA, ASDiv, MAWPS, SingleEq, AddSub, and MultiArith) CoT prompting consistently improved over standard few-shot prompting. On <strong>AQuA</strong> and <strong>ASDiv</strong>, PaLM 540B with CoT came within 2% of the supervised state-of-the-art.',
    },

    {
      type: 'paragraph',
      id: 'p-9',
      content:
        '<strong>Commonsense reasoning.</strong> On <strong>CommonsenseQA</strong> and <strong>StrategyQA</strong>, CoT prompting likewise demonstrated substantial improvements. These tasks require implicit world knowledge and multi-hop inference, precisely the kind of reasoning that benefits from explicit intermediate steps.',
    },

    {
      type: 'paragraph',
      id: 'p-10',
      content:
        '<strong>Symbolic reasoning.</strong> Wei et al. (2022) further tested CoT on symbolic reasoning tasks (e.g., last letter concatenation, coin flip) from the BIG-bench benchmark suite. CoT enabled strong generalization, including to longer sequences than those seen in the exemplars, demonstrating that the technique facilitates systematic compositional reasoning rather than mere pattern matching.',
    },

    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'tip',
      content:
        'PaLM 540B + 8 CoT exemplars achieved 58% on GSM8K, surpassing the fine-tuned GPT-3 + verifier baseline (55%), using zero gradient updates. With Wang et al.\'s (2023) self-consistency decoding, accuracy further climbed to 74%.',
    },

    {
      type: 'paragraph',
      id: 'p-11',
      content:
        'Subsequent work by Wang et al. (2023) introduced <strong>self-consistency</strong>, a decoding strategy that samples multiple chains of thought and takes a majority vote over the final answers. Applied to the same PaLM 540B + CoT setup, self-consistency pushed GSM8K accuracy to <strong>74%</strong>, demonstrating that the reasoning chains contain genuine signal that can be aggregated for more reliable answers. It is worth noting that the PaLM 540B arithmetic results in the original paper used an external calculator for final computation, ensuring that errors in the chain of thought did not propagate through simple arithmetic mistakes.',
    },

    // ── Section 4: Emergent Scaling Properties ──
    { type: 'section', id: 'sec-4', title: '4. Emergent Scaling Properties' },

    {
      type: 'paragraph',
      id: 'p-12',
      content:
        'Perhaps the most theoretically significant finding of Wei et al. (2022) is that chain-of-thought reasoning is an <strong>emergent ability</strong>, a capability that appears abruptly at sufficient model scale and is essentially absent in smaller models. This places CoT squarely within the broader phenomenon of emergence in large language models, as systematically catalogued by Wei et al. (2022b) in their survey of emergent abilities.',
    },

    {
      type: 'paragraph',
      id: 'p-13',
      content:
        'The scaling behavior is stark. In models with fewer than approximately <strong>100 billion parameters</strong>, chain-of-thought prompting not only fails to help; it actively <em>hurts</em> performance. Smaller models, when prompted to produce intermediate reasoning steps, generate <strong>incoherent chains</strong>: logically disconnected statements, incorrect intermediate computations, and hallucinated reasoning that leads to worse final answers than standard prompting provides. The chains are syntactically plausible but semantically broken.',
    },

    {
      type: 'paragraph',
      id: 'p-14',
      content:
        'At the <Latex>\\sim</Latex>100B parameter threshold, a phase transition occurs. The generated chains become coherent, logically structured, and, critically, <em>useful</em> for arriving at correct answers. The performance gains are dramatic and discontinuous, not the result of gradual improvement.',
    },

    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'warning',
      content:
        'In models below ~100B parameters, CoT prompting produces incoherent reasoning chains and <em>degrades</em> performance relative to standard prompting. Do not assume CoT will help with smaller models; it will likely hurt.',
    },

    {
      type: 'paragraph',
      id: 'p-15',
      content:
        'This creates a distinctive signature in scaling curves. On reasoning-intensive tasks like GSM8K, <strong>standard prompting</strong> exhibits essentially <em>flat scaling curves</em>: increasing model size from 10B to 500B parameters yields negligible accuracy improvements. The task difficulty exceeds what any single forward pass can resolve, regardless of model capacity. <strong>CoT prompting</strong>, by contrast, enables <em>upward-sloping scaling curves</em> once the emergence threshold is crossed. Each increment in model size translates to meaningful accuracy gains, because the larger model produces higher-quality intermediate reasoning.',
    },

    {
      type: 'callout',
      id: 'c-5',
      calloutType: 'accent',
      content:
        'Chain-of-thought prompting is one of the strongest documented examples of emergence in LLMs. It reveals that scale unlocks not just more knowledge, but qualitatively new reasoning <em>strategies</em> that smaller models cannot execute.',
    },

    // ── Section 5: Limitations and Faithfulness ──
    { type: 'section', id: 'sec-5', title: '5. Limitations and Faithfulness' },

    {
      type: 'paragraph',
      id: 'p-16',
      content:
        'Despite its empirical success, chain-of-thought prompting carries important limitations that temper its theoretical significance and constrain its practical reliability.',
    },

    {
      type: 'paragraph',
      id: 'p-17',
      content:
        '<strong>Faithfulness of reasoning chains.</strong> The most fundamental concern is whether the generated chain of thought actually reflects the model\'s internal computation. The chain is produced autoregressively, one token at a time, and there is no guarantee that the natural-language "reasoning" corresponds to the latent representations driving the model\'s predictions. The chain may function as a <strong>post-hoc rationalization</strong>: a plausible sounding narrative that the model generates <em>after</em> (or alongside) arriving at an answer through entirely different internal mechanisms. This distinction between <em>expressed reasoning</em> and <em>actual reasoning</em> remains an open problem in interpretability research.',
    },

    {
      type: 'paragraph',
      id: 'p-18',
      content:
        '<strong>Error compounding.</strong> Because each step in the chain conditions on all previous steps, an error early in the reasoning process can cascade through subsequent steps. A single incorrect arithmetic operation, a misidentified entity, or a flawed logical inference can corrupt the entire downstream chain. This is especially problematic for long chains involving many intermediate steps, where the probability of at least one error grows with chain length.',
    },

    {
      type: 'paragraph',
      id: 'p-19',
      content:
        '<strong>Prompt sensitivity.</strong> The quality of CoT reasoning is sensitive to the specific exemplars chosen. Different exemplar sets, even ones that are individually correct and well-written, can produce substantially different accuracy on the same benchmark. Wei et al. (2022) used hand-crafted exemplars, and the optimal exemplar design remains more art than science. The choice of exemplar ordering, the complexity of the reasoning demonstrated, and even superficial formatting decisions can all influence performance.',
    },

    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Scale dependence:</strong> CoT is only effective in models with ~100B+ parameters, limiting its accessibility.',
        '<strong>Verification gap:</strong> There is no built-in mechanism to verify intermediate steps; the model cannot self-correct mid-chain.',
        '<strong>Task specificity:</strong> CoT provides the largest gains on tasks requiring sequential reasoning; on tasks solvable by pattern matching or retrieval, the overhead of generating a chain provides little benefit.',
        '<strong>Computational cost:</strong> Generating intermediate reasoning tokens increases inference latency and cost proportionally to the length of the chain.',
      ],
    },

    {
      type: 'callout',
      id: 'c-6',
      calloutType: 'info',
      content:
        'Subsequent techniques, including self-consistency (Wang et al., 2023), verification-guided search, and process reward models, address some of these limitations by adding external validation layers on top of the chain-of-thought paradigm.',
    },

    // ── Section 6: References & Further Reading ──
    { type: 'section', id: 'sec-6', title: '6. References & Further Reading' },

    {
      type: 'reference',
      id: 'r-1',
      title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      authors: 'Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q., & Zhou, D.',
      venue: 'NeurIPS',
      year: '2022',
      description:
        'The foundational paper introducing chain-of-thought prompting and demonstrating its effectiveness across arithmetic, commonsense, and symbolic reasoning benchmarks.',
    },

    {
      type: 'reference',
      id: 'r-2',
      title: 'Training Verifiers to Solve Math Word Problems',
      url: 'https://arxiv.org/abs/2110.14168',
      authors: 'Cobbe, K., Kosaraju, V., Bavarian, M., et al.',
      venue: '',
      year: '2021',
      description:
        'Introduced the GSM8K benchmark and a fine-tuned GPT-3 + verifier approach that CoT prompting subsequently surpassed without any fine-tuning.',
    },

    {
      type: 'reference',
      id: 'r-3',
      title: 'Self-Consistency Improves Chain of Thought Reasoning in Language Models',
      url: 'https://arxiv.org/abs/2203.11171',
      authors: 'Wang, X., Wei, J., Schuurmans, D., et al.',
      venue: 'ICLR',
      year: '2023',
      description:
        'Proposed self-consistency decoding, sampling multiple reasoning paths and taking a majority vote, boosting PaLM 540B + CoT on GSM8K from 58% to 74%.',
    },

    {
      type: 'reference',
      id: 'r-4',
      title: 'Emergent Abilities of Large Language Models',
      url: 'https://arxiv.org/abs/2206.07682',
      authors: 'Wei, J., Tay, Y., Bommasani, R., et al.',
      venue: 'TMLR',
      year: '2022',
      description:
        'A comprehensive survey of emergent abilities in LLMs, providing the theoretical framework for understanding why CoT reasoning appears only at sufficient scale.',
    },
  ],
};
