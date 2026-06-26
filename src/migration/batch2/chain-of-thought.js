export const pageData = {
  route: 'concept:reasoning-chain-of-thought',
  urlPath: '/concepts/reasoning/chain-of-thought',
  status: 'published',
  meta: {
    title: 'Chain-of-Thought Reasoning',
    subtitle: 'Teaching language models to think step-by-step. Chain-of-thought prompting transforms a single-pass token predictor into a deliberative reasoning engine, unlocking systematic deduction, error detection, and backtracking search.',
    category: 'concept',
    subcategory: 'Reasoning',
    route: 'concept:reasoning-chain-of-thought',
    ready: true,
  },
  blocks: [
    // ── Section 1 ──
    {
      type: 'section',
      id: 'sec-1',
      title: '1. The Problem with Direct Answering',
    },
    {
      type: 'paragraph',
      id: 'p-1',
      content:
        'Large language models generate text one token at a time, left to right. For simple factual questions ("What is the capital of France?"), predicting the answer directly works well — the answer is a single cached association. But for complex multi-step problems — arithmetic, logical puzzles, multi-hop reasoning — predicting the final answer in a single forward pass is fundamentally limited.',
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content:
        'Consider the question: "If a train travels at 60 mph for 2.5 hours, then stops for 30 minutes, then travels at 80 mph for 1 hour, what is the total distance?" A model trying to output just the answer must perform multiple multiplications and an addition <em>implicitly</em> within its hidden activations — a task that exceeds what fixed-depth Transformer circuits can reliably compute.',
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content:
        'The core insight: <strong>generating intermediate reasoning tokens</strong> is not just cosmetic — it fundamentally increases the model\'s computational capacity. Each intermediate token acts as an external memory register, allowing the model to decompose complex computations into sequences of simpler steps.',
    },

    // ── Section 2 ──
    {
      type: 'section',
      id: 'sec-2',
      title: '2. Chain-of-Thought Prompting',
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content:
        'Jason Wei et al. (2022) introduced <strong>Chain-of-Thought (CoT) prompting</strong> at NeurIPS, demonstrating that a simple modification to the prompt — including step-by-step reasoning examples, or even just appending "Let\'s think step by step" — could dramatically improve performance on reasoning benchmarks.',
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content:
        'The technique works by providing few-shot examples where the answer includes explicit intermediate steps. The model learns to mimic this format, generating its own intermediate reasoning before arriving at the final answer. On the GSM8K math benchmark, CoT improved accuracy from 17.9% to 58.1% for the PaLM 540B model — a 3× improvement from a prompting change alone.',
    },
    {
      type: 'code-block',
      id: 'cb-1',
      label: 'prompt example',
      content:
        'Q: Roger has 5 tennis balls. He buys 2 cans of\n3 tennis balls each. How many does he have now?\n\nA: Roger starts with 5 balls. He buys 2 cans,\neach with 3 balls, so 2 × 3 = 6 new balls.\nTotal = 5 + 6 = 11. The answer is 11.',
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content:
        'Kojima et al. (2022) further showed that even <strong>zero-shot CoT</strong> — simply appending "Let\'s think step by step" without any examples — significantly improves reasoning, suggesting that LLMs already contain latent step-by-step reasoning capabilities that just need to be elicited.',
    },

    // ── Section 3 ──
    {
      type: 'section',
      id: 'sec-3',
      title: '3. Tree of Thoughts',
    },
    {
      type: 'paragraph',
      id: 'p-6',
      content:
        'Standard CoT is <em>linear</em>: the model generates one reasoning path and commits to it. If it makes a mistake in Step 2, that error propagates irreversibly through all subsequent steps. Shunyu Yao et al. (2023) addressed this with <strong>Tree of Thoughts (ToT)</strong>, which generalizes CoT from a single chain to a search tree.',
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content:
        'In ToT, the model generates multiple candidate "thoughts" at each step, evaluates them using a self-critique mechanism (asking "Is this step correct? Does it make progress toward the goal?"), and uses standard search algorithms — Breadth-First Search (BFS) or Depth-First Search (DFS) — to explore promising branches, prune dead ends, and backtrack when a contradiction is detected.',
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content:
        'ToT transforms the language model from a passive text generator into an active search agent — one that can explore, evaluate, and backtrack, much like a human solving a puzzle on a whiteboard.',
    },

    // ── Section 4 ──
    {
      type: 'section',
      id: 'sec-4',
      title: '4. Thought Tree Diagram',
    },
    {
      type: 'paragraph',
      id: 'p-8',
      content:
        'The tree below illustrates deliberative reasoning in action. Notice the critical moment where the model\'s self-verification check detects an arithmetic error, prunes the incorrect branch, backtracks to the last stable state, and explores a correct alternative path.',
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'ThoughtTreeDiagram',
    },

    // ── Section 5 ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. Inference-Time Compute Scaling',
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content:
        'Chain-of-thought and tree search represent a fundamental shift in how AI systems allocate computational resources. Traditional scaling laws (Kaplan et al., 2020) focused on <em>training-time</em> compute: more parameters and more data yield better models. CoT introduces <strong>inference-time compute scaling</strong>: spending more tokens (and time) during generation to think more carefully about hard problems.',
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content:
        'This connects to the cognitive science concept of <strong>System 2 thinking</strong> — conscious, slow, and effortful reasoning. In AI terms, this is achieved by:',
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Search over tokens</strong>: The model generates more intermediate tokens, trading speed for accuracy on hard problems.',
        '<strong>Self-verification</strong>: The model critiques its own intermediate steps before committing, catching errors early.',
        '<strong>Backtracking and retry</strong>: Rather than a single forward pass, the model can explore multiple reasoning paths and select the best one.',
        '<strong>Reinforcement learning from reasoning traces</strong>: Models like OpenAI\'s o1 are trained with RL to optimize their internal chain of thought, learning <em>when</em> to think longer, when to backtrack, and when to verify assumptions.',
      ],
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'accent',
      content:
        'The implication is profound: with inference-time scaling, a smaller model that thinks carefully can outperform a larger model that answers impulsively. Quality of reasoning can substitute for quantity of parameters.',
    },

    // ── Section 6 ──
    {
      type: 'section',
      id: 'sec-6',
      title: '6. Limitations and Faithfulness',
    },
    {
      type: 'paragraph',
      id: 'p-11',
      content:
        'Despite the impressive gains, CoT reasoning has important limitations:',
    },
    {
      type: 'list',
      id: 'l-2',
      listType: 'unordered',
      items: [
        '<strong>Faithfulness concerns</strong>: The generated chain of thought may not reflect the model\'s actual internal computation. Turpin et al. (2023) showed that models can produce correct-looking reasoning chains that are actually post-hoc rationalizations rather than genuine step-by-step derivations.',
        '<strong>Error compounding</strong>: Even with self-verification, errors in early steps can cascade in subtle ways. A wrong intermediate value may not trigger an obvious contradiction, leading to a plausible-looking but incorrect final answer.',
        '<strong>Prompt sensitivity</strong>: CoT performance depends heavily on prompt formatting, example selection, and instruction phrasing. Small changes to the prompt can cause large swings in accuracy.',
      ],
    },

    // ── Section 7: References ──
    {
      type: 'section',
      id: 'sec-7',
      title: 'References & Further Reading',
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      authors: 'Wei, J., Wang, X., Schuurmans, D., et al.',
      venue: 'NeurIPS',
      year: '2022',
      description:
        'The foundational paper introducing few-shot chain-of-thought prompting at NeurIPS.',
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'Large Language Models are Zero-Shot Reasoners',
      url: 'https://arxiv.org/abs/2205.11916',
      authors: 'Kojima, T., Gu, S.S., Reid, M., Matsuo, Y., & Iwasawa, Y.',
      venue: 'NeurIPS',
      year: '2022',
      description:
        'Shows that appending "Let\'s think step by step" enables zero-shot CoT reasoning.',
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'Tree of Thoughts: Deliberate Problem Solving with Large Language Models',
      url: 'https://arxiv.org/abs/2305.10601',
      authors: 'Yao, S., Yu, D., Zhao, J., et al.',
      venue: 'NeurIPS',
      year: '2023',
      description:
        'Generalizes CoT to tree search with self-evaluation and backtracking.',
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'Scaling Laws for Neural Language Models',
      url: 'https://arxiv.org/abs/2001.08361',
      authors: 'Kaplan, J., McCandlish, S., Henighan, T., et al.',
      venue: 'arXiv',
      year: '2020',
      description:
        'Empirical study of how model performance scales with parameters, data, and compute.',
    },
    {
      type: 'reference',
      id: 'r-5',
      title: 'Learning to Reason with LLMs',
      url: 'https://openai.com/index/learning-to-reason-with-llms/',
      authors: 'OpenAI',
      venue: 'Blog',
      year: '2024',
      description:
        'Blog post describing the o1 model series trained with RL to produce extended reasoning chains.',
    },
    {
      type: 'reference',
      id: 'r-6',
      title: "Language Models Don't Always Say What They Think",
      url: 'https://arxiv.org/abs/2305.04388',
      authors: 'Turpin, M., Michael, J., Perez, E., & Bowman, S.R.',
      venue: 'arXiv',
      year: '2023',
      description:
        'Demonstrates unfaithful explanations in chain-of-thought prompting.',
    },
  ],
};
