export const pageData = {
  route: 'concept:reasoning-program-synthesis',
  urlPath: '/concepts/reasoning/program-synthesis',
  status: 'published',
  meta: {
    title: 'Program Synthesis',
    subtitle: 'Generating structured, executable code as a form of precise reasoning. Instead of solving problems through natural language — which is inherently ambiguous — AI systems write programs, execute them, and use concrete feedback to iteratively self-correct.',
    category: 'concept',
    subcategory: 'Reasoning',
    route: 'concept:reasoning-program-synthesis',
    ready: true
  },
  blocks: [
    // ── Section 1 ──
    {
      type: 'section',
      id: 'sec-1',
      title: '1. Why Code Beats Natural Language for Reasoning'
    },
    {
      type: 'paragraph',
      id: 'p-1',
      content: 'Natural language is expressive but fundamentally ambiguous. When a language model "reasons" in English, it produces tokens that <em>look</em> like logical steps but lack any formal verification mechanism. There is no compiler checking each step, no type system catching category errors, no test suite validating the final answer.'
    },
    {
      type: 'paragraph',
      id: 'p-2',
      content: '<strong>Program synthesis</strong> changes the paradigm entirely: instead of asking the model to <em>solve</em> the problem directly, we ask it to <em>write a program</em> that solves the problem. Code serves as a formal, deterministic sandbox with crucial properties:'
    },
    {
      type: 'list',
      id: 'l-1',
      listType: 'unordered',
      items: [
        '<strong>Precise semantics</strong>: Every line of code has an unambiguous meaning, unlike natural language where the same sentence can be interpreted multiple ways.',
        '<strong>Executable verification</strong>: Code can be compiled and run against test inputs, producing concrete pass/fail signals rather than subjective quality judgments.',
        '<strong>Structured feedback</strong>: When code fails, the error trace (syntax errors, type mismatches, assertion failures, stack traces) tells the model <em>exactly</em> what went wrong and where.'
      ]
    },
    {
      type: 'callout',
      id: 'c-1',
      calloutType: 'tip',
      content: 'This introduces a <strong>closed feedback loop</strong>: write code → execute → read error trace → fix → re-execute. Unlike natural language reasoning, where errors silently propagate, code execution provides immediate, unambiguous feedback.'
    },

    // ── Section 2 ──
    {
      type: 'section',
      id: 'sec-2',
      title: '2. From Codex to Competitive Programming'
    },
    {
      type: 'paragraph',
      id: 'p-3',
      content: 'The era of neural program synthesis began with <strong>Codex</strong> (Chen et al., 2021), a GPT model fine-tuned on publicly available code from GitHub. Codex powered GitHub Copilot and demonstrated that large language models could generate functional code from natural language descriptions, solving 28.8% of problems on the HumanEval benchmark.'
    },
    {
      type: 'paragraph',
      id: 'p-4',
      content: 'The field advanced rapidly. <strong>AlphaCode</strong> (Li et al., 2022, published in <em>Science</em>) tackled <em>competitive programming</em> — problems requiring algorithmic thinking, mathematical reasoning, and careful implementation. AlphaCode\'s approach was distinctive:'
    },
    {
      type: 'list',
      id: 'l-2',
      listType: 'ordered',
      items: [
        '<strong>Massive sampling</strong>: Generate millions of candidate programs for each problem.',
        '<strong>Execution-based filtering</strong>: Run every candidate against sample inputs, discarding programs that produce wrong outputs.',
        '<strong>Behavioral clustering</strong>: Cluster surviving programs by their output patterns, then select one representative from each cluster — ensuring diversity.'
      ]
    },
    {
      type: 'paragraph',
      id: 'p-5',
      content: 'AlphaCode achieved an estimated ranking within the top 54% of competitive programmers on Codeforces, demonstrating that brute-force sampling combined with execution feedback can solve problems requiring genuine algorithmic creativity.'
    },

    // ── Section 3 ──
    {
      type: 'section',
      id: 'sec-3',
      title: '3. Program-of-Thought and PAL'
    },
    {
      type: 'paragraph',
      id: 'p-6',
      content: 'Two influential papers formalized the use of code generation specifically as a <em>reasoning strategy</em>, separate from general-purpose coding:'
    },
    {
      type: 'paragraph',
      id: 'p-7',
      content: '<strong>Program of Thoughts (PoT)</strong> (Chen et al., 2023) prompts the LLM to generate Python code that implements the reasoning steps, then executes the code to produce the final answer. For math problems, the LLM writes expressions like <code>result = (5 * 3) + (2 * 7)</code> rather than trying to compute "5 × 3 = 15, then 2 × 7 = 14, then 15 + 14 = 29" in natural language.'
    },
    {
      type: 'paragraph',
      id: 'p-8',
      content: '<strong>PAL (Program-Aided Language Models)</strong> (Gao et al., 2023) takes a similar approach, demonstrating that offloading computation to a Python interpreter dramatically improves accuracy on math, symbolic, and algorithmic reasoning benchmarks. The key insight: the LLM handles <em>understanding the problem</em>, and Python handles <em>computing the answer</em>.'
    },
    {
      type: 'callout',
      id: 'c-2',
      calloutType: 'info',
      content: 'PoT and PAL show that even a moderate-sized LLM can outperform much larger models on math tasks — simply by generating code instead of reasoning in natural language. The code acts as a <strong>cognitive prosthesis</strong> that compensates for the model\'s weak numerical computation.'
    },

    // ── Section 4 ──
    {
      type: 'section',
      id: 'sec-4',
      title: '4. Interactive Self-Debugging Loop'
    },
    {
      type: 'paragraph',
      id: 'p-9',
      content: 'Explore the synthesis-and-debug cycle in action below. Watch how the agent decomposes a goal into subtasks, generates code, encounters a test failure, analyzes the error traceback, and compiles a corrected version — all within a single automated loop.'
    },
    {
      type: 'custom-element',
      id: 'w-1',
      name: 'DebuggingLoopSimulator'
    },

    // ── Section 5 ──
    {
      type: 'section',
      id: 'sec-5',
      title: '5. The Agentic Paradigm'
    },
    {
      type: 'paragraph',
      id: 'p-10',
      content: 'Program synthesis is the engine of modern <strong>autonomous coding agents</strong> — systems that can independently write, test, debug, and deploy software. The paradigm has evolved from simple code completion to full agentic loops:'
    },
    {
      type: 'list',
      id: 'l-3',
      listType: 'unordered',
      items: [
        '<strong>Test-driven synthesis</strong>: The agent writes unit tests <em>first</em> based on the specification, then iterates on the source code until all tests pass. This inverts the traditional development workflow, making tests the specification and code the implementation.',
        '<strong>Tool use</strong>: The model uses compilers, linters, type checkers, terminals, and even web browsers to check its work, shifting from passive prediction to active software engineering.',
        '<strong>Multi-file reasoning</strong>: Advanced agents (SWE-bench, Devin) navigate entire codebases, understanding dependency graphs, reading documentation, and making coordinated changes across multiple files.',
        '<strong>Iterative repair</strong>: When code triggers a runtime exception, the full traceback — including the call stack, variable values, and error message — is fed back to the model as context, enabling precise self-repair.'
      ]
    },
    {
      type: 'callout',
      id: 'c-3',
      calloutType: 'accent',
      content: 'The progression from code generation → code execution → self-debugging → agentic autonomy represents the most concrete realization of AI reasoning: systems that don\'t just predict what code <em>might look like</em>, but actively <strong>build, test, and verify</strong> working software.'
    },

    // ── Section 6 ──
    {
      type: 'section',
      id: 'sec-6',
      title: '6. Open Challenges'
    },
    {
      type: 'paragraph',
      id: 'p-11',
      content: 'Despite rapid progress, several challenges remain:'
    },
    {
      type: 'list',
      id: 'l-4',
      listType: 'unordered',
      items: [
        '<strong>Specification ambiguity</strong>: Natural language specifications are inherently incomplete. The model must infer edge cases, handle implicit constraints, and ask for clarification when the task is underspecified.',
        '<strong>Security</strong>: Executing model-generated code in production environments creates significant security risks (code injection, resource exhaustion, data exfiltration). Sandboxing and formal verification are essential safeguards.',
        '<strong>Algorithmic creativity</strong>: While LLMs can implement known algorithms, inventing genuinely novel algorithms — the kind that would earn a research publication — remains largely beyond current capabilities.'
      ]
    },

    // ── References ──
    {
      type: 'section',
      id: 'sec-7',
      title: 'References & Further Reading'
    },
    {
      type: 'reference',
      id: 'r-1',
      title: 'Evaluating Large Language Models Trained on Code',
      url: 'https://arxiv.org/abs/2107.03374',
      authors: 'Chen, M., Tworek, J., Jun, H., et al.',
      year: '2021',
      description: 'Introduces Codex and the HumanEval benchmark for measuring functional code generation.'
    },
    {
      type: 'reference',
      id: 'r-2',
      title: 'Competition-Level Code Generation with AlphaCode',
      url: 'https://doi.org/10.1126/science.abq1158',
      authors: 'Li, Y., Choi, D., Chung, J., et al.',
      year: '2022',
      description: 'Massive-scale sampling and execution-based filtering for competitive programming.'
    },
    {
      type: 'reference',
      id: 'r-3',
      title: 'Program of Thoughts Prompting',
      url: 'https://arxiv.org/abs/2211.12588',
      authors: 'Chen, W., Ma, X., Wang, X., & Cohen, W.W.',
      year: '2023',
      description: 'Disentangles computation from reasoning by generating executable Python programs.'
    },
    {
      type: 'reference',
      id: 'r-4',
      title: 'PAL: Program-Aided Language Models',
      url: 'https://arxiv.org/abs/2211.10435',
      authors: 'Gao, L., Madaan, A., Zhou, S., et al.',
      year: '2023',
      description: 'Offloads computation to a Python interpreter, boosting math and symbolic reasoning accuracy.'
    },
    {
      type: 'reference',
      id: 'r-5',
      title: 'SWE-bench: Can Language Models Resolve Real-World GitHub Issues?',
      url: 'https://arxiv.org/abs/2310.06770',
      authors: 'Jimenez, C.E., Yang, J., Wettig, A., et al.',
      year: '2024',
      description: 'Benchmark for evaluating autonomous coding agents on real GitHub issues.'
    }
  ]
};
