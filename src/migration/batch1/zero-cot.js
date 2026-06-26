export const pageData = {
  route: 'concept:prompting-zero-cot',
  urlPath: '/concepts/prompting/zero-cot',
  status: 'published',
  meta: {
    title: 'Zero-Shot Chain-of-Thought',
    subtitle: 'The remarkable discovery that simply appending "Let\'s think step by step" to a prompt, without any hand crafted demonstrations, can unlock latent multi-step reasoning capabilities across diverse benchmark tasks.',
    category: 'concept',
    subcategory: 'Prompting',
    route: 'concept:prompting-zero-cot',
    ready: true,
  },
  blocks: [
    // ── Section 1: The Discovery ──
    { type: 'section', id: 'sec-1', title: '1. The Discovery' },

    {
      type: 'paragraph',
      id: 'p-1',
      content:
        'In a result that surprised much of the NLP community, <strong>Kojima et al. (2022)</strong> demonstrated that a single, task-agnostic phrase, <em>"Let\'s think step by step"</em>, appended to a question prompt is sufficient to elicit structured, multi-step reasoning from large language models. Published at NeurIPS 2022 under the title <em>Large Language Models are Zero-Shot Reasoners</em>, this work revealed that the reasoning capabilities unlocked by <strong>chain-of-thought (CoT) prompting</strong> do not strictly require hand-crafted exemplars. Instead, a generic textual trigger can serve as a lightweight substitute, achieving dramatic improvements over standard zero-shot baselines.',
    },

    {
      type: 'paragraph',
      id: 'p-2',
      content:
        'The significance of this finding is twofold. First, it eliminates the exemplar engineering burden imposed by <strong>few-shot CoT</strong>, the technique introduced by Wei et al. (2022), which requires manually constructing question answer pairs complete with step-by-step reasoning traces for each new task. Second, and more fundamentally, it suggests that large-scale pre-training implicitly equips models with latent reasoning procedures that can be <em>activated</em> by appropriate prompting rather than taught through in-context demonstrations.',
    },

    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content:
        'Zero-Shot-CoT uses the <strong>same single prompt template</strong> across all tasks, including arithmetic, symbolic, and logical reasoning, with no task-specific engineering whatsoever.',
    },

    {
      type: 'paragraph',
      id: 'p-3',
      content:
        'The method was evaluated across a diverse suite of benchmarks spanning arithmetic reasoning (MultiArith, GSM8K, AQUA-RAT, SVAMP), symbolic reasoning (Last Letter Concatenation, Coin Flip), and commonsense/logical reasoning (Date Understanding, Tracking Shuffled Objects). Across all of these, the same trigger phrase produced substantial gains, establishing Zero-Shot-CoT as a universal, low-cost reasoning elicitation strategy.',
    },

    // ── Section 2: The Two-Stage Process ──
    { type: 'section', id: 'sec-2', title: '2. The Two-Stage Process' },

    {
      type: 'paragraph',
      id: 'p-4',
      content:
        'Unlike standard prompting, which expects the model to produce a final answer in a single forward pass, <strong>Zero-Shot-CoT</strong> employs a deliberate <strong>two-stage prompting pipeline</strong>. This decomposition separates the generation of reasoning from the extraction of a concise answer, mirroring how a human might first work through a problem on scratch paper and then circle the final result.',
    },

    {
      type: 'custom-element',
      id: 'w-1',
      name: 'TwoStagePipelineWidget',
    },

    {
      type: 'paragraph',
      id: 'p-5',
      content:
        '<strong>Stage 1: Reasoning Extraction.</strong> The original question is concatenated with the trigger phrase <em>"Let\'s think step by step."</em> The model is then allowed to generate freely, producing an extended reasoning chain. No format constraints are imposed; the model simply continues from the trigger in whatever structure it finds natural.',
    },

    {
      type: 'code-block',
      id: 'cb-1',
      label: 'stage 1 — reasoning extraction',
      content:
        'Q: If there are 3 cars in the parking lot and 2 more cars arrive,\nhow many cars are in the parking lot?\n\nA: Let\'s think step by step.',
    },

    {
      type: 'paragraph',
      id: 'p-6',
      content:
        'The model then generates a reasoning trace such as: <em>"There are originally 3 cars. Then 2 more cars arrive. 3 + 2 = 5."</em> This reasoning chain is captured in full, including any intermediate calculations or logical deductions.',
    },

    {
      type: 'paragraph',
      id: 'p-7',
      content:
        '<strong>Stage 2: Answer Extraction.</strong> The entire output from Stage 1, including the original question, the trigger phrase, and the generated reasoning, is then concatenated with a second template: <em>"Therefore, the answer (arabic numerals) is"</em>. This instructs the model to distill its reasoning into a clean, parseable final answer.',
    },

    {
      type: 'code-block',
      id: 'cb-2',
      label: 'stage 2 — answer extraction',
      content:
        'Q: If there are 3 cars in the parking lot and 2 more cars arrive,\nhow many cars are in the parking lot?\n\nA: Let\'s think step by step. There are originally 3 cars.\nThen 2 more cars arrive. 3 + 2 = 5.\n\nTherefore, the answer (arabic numerals) is 5',
    },

    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content:
        'The two-stage design is critical. Without the answer extraction step, the model\'s reasoning chain may meander or fail to converge on a clearly stated final answer, making automated evaluation unreliable.',
    },

    // ── Section 3: Empirical Results ──
    { type: 'section', id: 'sec-3', title: '3. Empirical Results' },

    {
      type: 'paragraph',
      id: 'p-8',
      content:
        'The empirical gains reported by Kojima et al. (2022) are striking in both magnitude and consistency. Using <strong>InstructGPT</strong> (<em>text-davinci-002</em>, 175B parameters), Zero-Shot-CoT produces transformative improvements over standard zero-shot prompting:',
    },

    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>MultiArith:</strong> accuracy improved from <Latex>17.7\\%</Latex> to <Latex>78.7\\%</Latex>, a <Latex>4.4\\times</Latex> gain.',
        '<strong>GSM8K:</strong> accuracy improved from <Latex>10.4\\%</Latex> to <Latex>40.7\\%</Latex>, nearly a <Latex>4\\times</Latex> gain on a notably challenging benchmark of grade-school math word problems.',
      ],
    },

    {
      type: 'paragraph',
      id: 'p-9',
      content:
        'These results are not artifacts of a single model family. Similar magnitudes of improvement were observed with <strong>PaLM 540B</strong>, confirming that Zero-Shot-CoT is a model-general phenomenon rather than an idiosyncrasy of the InstructGPT training pipeline.',
    },

    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'tip',
      content:
        'The same single prompt template, "Let\'s think step by step", drives improvements across <em>arithmetic</em> (MultiArith, GSM8K, AQUA-RAT, SVAMP), <em>symbolic reasoning</em> (Last Letter Concatenation, Coin Flip), and <em>logical reasoning</em> (Date Understanding, Tracking Shuffled Objects) without any modification.',
    },

    {
      type: 'paragraph',
      id: 'p-10',
      content:
        'The universality of these gains is perhaps the most notable aspect of the results. Traditional prompting approaches require task-specific tuning: different exemplars, different formatting, different answer templates. Zero-Shot-CoT discards all of this in favor of a single, fixed trigger. That such a minimal intervention can produce gains spanning arithmetic computation, symbolic manipulation, and commonsense reasoning suggests that the underlying reasoning capability is already present in the model and merely needs an appropriate activation signal.',
    },

    {
      type: 'callout',
      id: 'c-4',
      calloutType: 'warning',
      content:
        'While the relative improvements are dramatic, the absolute accuracy on harder benchmarks like GSM8K (40.7%) remains far below human performance. Zero-Shot-CoT is most effective on simpler multi-step problems; it still struggles with problems requiring long chains of dependent reasoning.',
    },

    // ── Section 4: Why Does It Work? ──
    { type: 'section', id: 'sec-4', title: '4. Why Does It Work?' },

    {
      type: 'paragraph',
      id: 'p-11',
      content:
        'The effectiveness of a short trigger phrase in eliciting multi-step reasoning invites a natural question: <em>what mechanism underlies this behavior?</em> While a complete mechanistic account remains an open research problem, several converging lines of evidence provide a coherent explanatory framework.',
    },

    {
      type: 'paragraph',
      id: 'p-12',
      content:
        '<strong>Activation of latent reasoning traces.</strong> Large language models are trained on internet-scale corpora that include textbooks, tutorials, worked examples, and forum discussions where humans explain their reasoning step by step. The phrase "Let\'s think step by step", or close paraphrases, appears naturally in such explanatory contexts. When the model encounters this phrase at inference time, it is statistically biased toward continuing in the register of step-by-step explanation rather than the register of terse answer production.',
    },

    {
      type: 'paragraph',
      id: 'p-13',
      content:
        '<strong>Shifting from System 1 to System 2 processing.</strong> Drawing on Kahneman\'s (2011) dual-process framework, standard zero-shot prompting can be understood as eliciting <em>System 1</em>-like responses: fast, associative, and often wrong on multi-step problems. The "Let\'s think step by step" trigger effectively shifts the model into a <em>System 2</em>-like mode: slower, more deliberate, and decomposed into sequential substeps. Each generated token in the reasoning chain conditions the subsequent generation, creating an implicit scratch-pad that extends the model\'s effective working memory.',
    },

    {
      type: 'callout',
      id: 'c-5',
      calloutType: 'accent',
      content:
        'The reasoning chain serves as an <strong>external working memory</strong>. By writing intermediate results into the generated text, the model sidesteps the capacity limitations of its fixed-width hidden state, enabling multi-step computations that would otherwise exceed its single-pass capabilities.',
    },

    {
      type: 'paragraph',
      id: 'p-14',
      content:
        '<strong>Autoregressive decomposition.</strong> From a technical perspective, chain-of-thought generation decomposes a difficult joint prediction <Latex>P(\\text{answer} \\mid \\text{question})</Latex> into a product of simpler conditional predictions:',
    },

    {
      type: 'math-box',
      id: 'm-1',
      expression:
        'P(s_1 \\mid q) \\cdot P(s_2 \\mid q, s_1) \\cdots P(a \\mid q, s_1, \\ldots, s_n)',
    },

    {
      type: 'paragraph',
      id: 'p-15',
      content:
        'Here each <Latex>s_i</Latex> is an intermediate reasoning step. This factorization allows each prediction to be relatively straightforward even when the overall problem is complex.',
    },

    // ── Section 5: Template Engineering and Alternatives ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. Template Engineering and Alternatives',
    },

    {
      type: 'paragraph',
      id: 'p-16',
      content:
        'A natural question raised by Zero-Shot-CoT is whether the specific phrasing <em>"Let\'s think step by step"</em> is uniquely effective, or whether any instruction to reason carefully would suffice. Kojima et al. (2022) systematically tested a range of alternative trigger phrases, and the results reveal a notable sensitivity to exact wording.',
    },

    {
      type: 'paragraph',
      id: 'p-17',
      content: 'Among the alternatives tested were:',
    },

    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<em>"Let\'s think about this logically"</em>',
        '<em>"Let\'s solve this problem by splitting it into steps"</em>',
        '<em>"Let\'s be realistic and think step by step"</em>',
        '<em>"Let\'s think like a detective step by step"</em>',
        '<em>"Before answering, let\'s think carefully"</em>',
      ],
    },

    {
      type: 'paragraph',
      id: 'p-18',
      content:
        'Of these, <strong>"Let\'s think step by step"</strong> consistently emerged as the top-performing trigger across benchmarks. Other phrases produced improvements over the zero-shot baseline but fell short of the gains achieved by the optimal trigger. The phrase <em>"Let\'s solve this problem by splitting it into steps"</em> performed reasonably well, likely because it similarly invokes a decomposition strategy, but it did not match the brevity and directness of the winning formulation.',
    },

    {
      type: 'callout',
      id: 'c-6',
      calloutType: 'warning',
      content:
        'The sensitivity to exact phrasing underscores that Zero-Shot-CoT is not simply "telling the model to think harder." The trigger phrase must align with patterns in the pre-training distribution that are associated with structured, step-by-step reasoning discourse.',
    },

    {
      type: 'paragraph',
      id: 'p-19',
      content:
        'This observation has practical implications for prompt engineering. While Zero-Shot-CoT eliminates the need for exemplar construction, it introduces a different, albeit much lighter, form of template optimization. In practice, however, the original "Let\'s think step by step" trigger remains the de facto standard and generalizes well enough that further template search is rarely necessary.',
    },

    // ── Section 6: Comparison with Few-Shot CoT ──
    {
      type: 'section',
      id: 'sec-6',
      title: '6. Comparison with Few-Shot CoT',
    },

    {
      type: 'paragraph',
      id: 'p-20',
      content:
        'The relationship between <strong>Zero-Shot-CoT</strong> and <strong>Few-Shot-CoT</strong> (Wei et al., 2022) is best understood as a tradeoff between simplicity and peak performance. Few-Shot-CoT typically achieves higher absolute accuracy on most benchmarks, but at the cost of substantial human effort in constructing task-specific exemplars with detailed reasoning chains.',
    },

    {
      type: 'list',
      id: 'l-3',
      listType: 'unordered',
      items: [
        '<strong>Exemplar cost:</strong> Few-Shot-CoT requires manually crafting 4 to 8 question-reasoning-answer demonstrations per task. Zero-Shot-CoT requires none.',
        '<strong>Task generality:</strong> Few-Shot-CoT exemplars are task-specific and may not transfer across domains. Zero-Shot-CoT uses a single universal template.',
        '<strong>Peak performance:</strong> Few-Shot-CoT generally outperforms Zero-Shot-CoT, particularly on complex benchmarks where the exemplars can demonstrate specific problem-solving strategies.',
        '<strong>Robustness:</strong> Few-Shot-CoT can be sensitive to the choice and ordering of exemplars, whereas Zero-Shot-CoT avoids this variability entirely.',
      ],
    },

    {
      type: 'callout',
      id: 'c-7',
      calloutType: 'tip',
      content:
        'Zero-Shot-CoT is most valuable in three scenarios: (1) when the task domain is unfamiliar and exemplar construction would require domain expertise, (2) when rapid prototyping across many tasks is needed, and (3) when establishing a baseline before investing in exemplar engineering.',
    },

    {
      type: 'paragraph',
      id: 'p-21',
      content:
        'The existence of Zero-Shot-CoT also has theoretical significance. It demonstrates that the reasoning improvements from Few-Shot-CoT are not purely a function of in-context learning from the provided exemplars. Rather, a substantial portion of the reasoning capability is intrinsic to the model and can be accessed through appropriate prompting alone. The exemplars in Few-Shot-CoT may serve less as "training data" and more as additional formatting guidance that further constrains the model\'s generation toward well-structured reasoning.',
    },

    {
      type: 'callout',
      id: 'c-8',
      calloutType: 'accent',
      content:
        'Zero-Shot-CoT proves that chain-of-thought reasoning is not <em>learned</em> from in-context exemplars. It is <em>latent</em> in the model and merely needs to be <em>elicited</em>.',
    },

    // ── References ──
    {
      type: 'section',
      id: 'sec-7',
      title: 'References & Further Reading',
    },

    {
      type: 'reference',
      id: 'r-1',
      title: 'Large Language Models are Zero-Shot Reasoners',
      url: 'https://arxiv.org/abs/2205.11916',
      authors: 'Kojima, T., Gu, S.S., Reid, M., Matsuo, Y., & Iwasawa, Y.',
      venue: 'NeurIPS',
      year: '2022',
      description:
        'The foundational paper introducing Zero-Shot-CoT and the "Let\'s think step by step" trigger phrase.',
    },

    {
      type: 'reference',
      id: 'r-2',
      title:
        'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      authors: 'Wei, J., Wang, X., Schuurmans, D., et al.',
      venue: 'NeurIPS',
      year: '2022',
      description:
        'The original few-shot chain-of-thought paper that inspired the zero-shot variant.',
    },

    {
      type: 'reference',
      id: 'r-3',
      title: 'Language Models are Few-Shot Learners',
      url: 'https://arxiv.org/abs/2005.14165',
      authors: 'Brown, T.B., Mann, B., Ryder, N., et al.',
      venue: 'NeurIPS',
      year: '2020',
      description:
        'The GPT-3 paper establishing in-context learning as a paradigm and providing the foundation for prompting-based approaches.',
    },
  ],
};
