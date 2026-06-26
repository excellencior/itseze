export const pageData = {
  route: 'concept:prompting-sc',
  urlPath: '/concepts/prompting/self-consistency',
  status: 'published',
  meta: {
    title: 'Self-Consistency',
    subtitle: 'A decoding strategy that replaces greedy chain-of-thought generation with diverse sampling and majority voting, leveraging the intuition that correct reasoning paths converge on the same answer while incorrect paths scatter across many wrong answers.',
    category: 'concept',
    subcategory: 'Prompting',
    ready: true
  },
  blocks: [
    // ── Section 1: The Problem with Greedy Decoding ──
    { type: 'section', id: 'sec-1', title: '1. The Problem with Greedy Decoding' },

    {
      type: 'paragraph', id: 'p-1',
      content: 'Standard <strong>chain-of-thought (CoT) prompting</strong>, as introduced by Wei et al. (2022), dramatically improves the reasoning capabilities of large language models by eliciting intermediate reasoning steps before a final answer. However, conventional CoT relies on <strong>greedy decoding</strong>: the model generates a single reasoning chain by deterministically selecting the highest-probability token at every step. This one-shot, left-to-right generation process is inherently fragile. A single misstep in any intermediate reasoning step propagates forward and derails the entire conclusion.'
    },

    {
      type: 'paragraph', id: 'p-2',
      content: 'Consider a multi-step arithmetic problem. Under greedy decoding, the model produces exactly one chain of reasoning. If it miscalculates in step two of a five-step derivation, the remaining three steps build upon a faulty premise, and the final answer is almost certainly wrong. There is no mechanism for error correction, backtracking, or exploration of alternative reasoning strategies. The model is locked into a single trajectory through the space of possible derivations.'
    },

    {
      type: 'callout', id: 'c-1', calloutType: 'warning',
      content: 'Greedy decoding is a <em>mode-seeking</em> strategy: it finds the single most likely sequence, not the most likely <em>answer</em>. These are fundamentally different objectives. Many distinct reasoning chains can lead to the same correct answer, and the most probable individual chain is not always the one that reaches it.'
    },

    {
      type: 'paragraph', id: 'p-3',
      content: 'This limitation is not merely theoretical. On benchmarks such as GSM8K (grade-school math), greedy CoT decoding with strong models still leaves substantial room for improvement, not because the model lacks the knowledge to solve the problem, but because the decoding strategy fails to exploit the full distribution of valid reasoning paths the model has learned. Wang et al. (2023) recognized this gap and proposed a remarkably simple yet powerful remedy: <strong>self-consistency</strong>.'
    },

    // ── Section 2: The Self-Consistency Principle ──
    { type: 'section', id: 'sec-2', title: '2. The Self-Consistency Principle' },

    {
      type: 'paragraph', id: 'p-4',
      content: '<strong>Self-consistency</strong> (SC), introduced by Wang et al. (2023), replaces greedy decoding with a sample-and-marginalize procedure. Instead of generating a single chain of thought, the model samples multiple diverse reasoning paths using stochastic decoding (i.e., temperature <Latex>T > 0</Latex>), then aggregates the final answers via <strong>majority vote</strong>. The core insight is deceptively simple. If the model "knows" how to solve a problem, many different sampled reasoning chains should converge on the same correct answer.'
    },

    {
      type: 'paragraph', id: 'p-5',
      content: 'The formal procedure consists of three stages:'
    },

    {
      type: 'list', id: 'l-1', listType: 'unordered',
      items: [
        '<strong>Step 1: Prompt with CoT exemplars.</strong> Construct a prompt containing the same few-shot chain-of-thought demonstrations used in standard CoT prompting. The exemplars define the format: question → reasoning steps → answer.',
        '<strong>Step 2: Sample <Latex>N</Latex> diverse completions.</strong> Rather than decoding greedily, sample <Latex>N</Latex> independent completions from the language model using temperature sampling. Each completion produces its own reasoning chain and arrives at a (possibly different) final answer.',
        '<strong>Step 3: Majority vote.</strong> Extract the final answer from each of the <Latex>N</Latex> sampled chains, then return the answer that appears most frequently. Ties can be broken arbitrarily.'
      ]
    },

    {
      type: 'code-block', id: 'cb-1', label: 'self-consistency procedure',
      content: '# Standard CoT (greedy):\nprompt + question → [single chain] → answer\n\n# Self-Consistency:\nprompt + question → sample chain₁ → answer₁\nprompt + question → sample chain₂ → answer₂\nprompt + question → sample chain₃ → answer₃\n  ...\nprompt + question → sample chainₙ → answerₙ\n\nfinal_answer = majority_vote(answer₁, answer₂, ..., answerₙ)'
    },

    {
      type: 'callout', id: 'c-2', calloutType: 'tip',
      content: 'Self-consistency requires <em>no</em> additional training, fine-tuning, or human annotation. It is purely a decoding-time strategy, a drop-in replacement for greedy decoding that works with any model capable of chain-of-thought reasoning.'
    },

    {
      type: 'paragraph', id: 'p-6',
      content: 'Mathematically, self-consistency can be understood as an approximation to <strong>marginalization</strong> over reasoning paths. Let <Latex>r</Latex> denote a reasoning path and <Latex>a</Latex> a final answer. Greedy decoding selects the single most likely (chain, answer) pair:'
    },

    {
      type: 'math-box', id: 'm-1',
      expression: '\\arg\\max_{r,a} P(r, a \\mid \\text{prompt})'
    },

    {
      type: 'paragraph', id: 'p-7',
      content: 'Self-consistency instead approximates the answer with the highest total probability mass across <em>all</em> reasoning paths:'
    },

    {
      type: 'math-box', id: 'm-2',
      expression: '\\arg\\max_a \\sum_r P(r, a \\mid \\text{prompt})'
    },

    {
      type: 'paragraph', id: 'p-8',
      content: 'This is a fundamentally more robust objective. Self-consistency operationalizes this by sampling diverse chains and letting the answers vote.'
    },

    { type: 'custom-element', id: 'w-1', name: 'SampleAndVoteWidget' },

    // ── Section 3: Why Diversity Helps ──
    { type: 'section', id: 'sec-3', title: '3. Why Diversity Helps' },

    {
      type: 'paragraph', id: 'p-9',
      content: 'The effectiveness of self-consistency rests on a powerful statistical regularity: <strong>correct reasoning paths converge, while incorrect ones scatter</strong>. When a language model samples multiple chains of thought for a reasoning problem it can solve, the correct chains, despite following different intermediate steps, different variable names, or different algebraic rearrangements, tend to arrive at the same numerical or categorical answer. Incorrect chains, by contrast, fail in idiosyncratic ways and produce a dispersed distribution over many different wrong answers.'
    },

    {
      type: 'paragraph', id: 'p-10',
      content: 'Consider a concrete example. Suppose we sample 40 reasoning paths for a grade-school math problem. If 32 of them produce the answer <Latex>42</Latex>, while the remaining 8 produce answers like <Latex>38</Latex>, <Latex>45</Latex>, <Latex>41</Latex>, <Latex>50</Latex>, <Latex>39</Latex>, <Latex>36</Latex>, <Latex>44</Latex>, and <Latex>47</Latex>, then the majority vote overwhelmingly selects <Latex>42</Latex>, which is almost certainly correct. The errors are <em>uncorrelated</em>: each wrong chain fails for a different reason and arrives at a different wrong destination.'
    },

    {
      type: 'callout', id: 'c-3', calloutType: 'accent',
      content: 'This convergence-divergence asymmetry is the engine of self-consistency. It is analogous to the <em>wisdom of crowds</em> effect: independent estimators with uncorrelated errors average out to the truth, even when individual estimates are noisy.'
    },

    {
      type: 'paragraph', id: 'p-11',
      content: 'The analogy to <strong>ensemble methods</strong> in classical machine learning is instructive. In bagging (bootstrap aggregation), multiple models trained on different subsets of data produce diverse predictions; averaging them reduces variance without increasing bias. In self-consistency, the "diversity" comes not from different training sets but from <strong>temperature sampling</strong>. The stochasticity of the decoding process explores different regions of the model\'s learned distribution over reasoning chains. The variance reduction mechanism is the same: independent errors cancel under aggregation.'
    },

    {
      type: 'paragraph', id: 'p-12',
      content: 'Crucially, the diversity must be <em>genuine</em>. If all sampled chains were near-identical (as they would be with temperature close to zero), majority voting would offer no advantage over greedy decoding. Temperature sampling at <Latex>T \\approx 0.5\\text{–}0.7</Latex> provides the sweet spot: enough randomness to explore diverse reasoning strategies, but not so much that the chains become incoherent.'
    },

    // ── Section 4: Empirical Results ──
    { type: 'section', id: 'sec-4', title: '4. Empirical Results' },

    {
      type: 'paragraph', id: 'p-13',
      content: 'Wang et al. (2023) evaluated self-consistency across a wide range of reasoning benchmarks, consistently demonstrating substantial gains over greedy chain-of-thought decoding. The absolute improvements over standard CoT are striking:'
    },

    {
      type: 'list', id: 'l-2', listType: 'unordered',
      items: [
        '<strong>GSM8K</strong> (grade-school math): <strong>+17.9%</strong> accuracy improvement',
        '<strong>SVAMP</strong> (math word problems): <strong>+11.0%</strong>',
        '<strong>AQuA</strong> (algebraic word problems): <strong>+12.2%</strong>',
        '<strong>StrategyQA</strong> (multi-hop commonsense): <strong>+6.4%</strong>',
        '<strong>ARC-challenge</strong> (science reasoning): <strong>+3.9%</strong>'
      ]
    },

    {
      type: 'callout', id: 'c-4', calloutType: 'tip',
      content: 'The largest gains (+17.9% on GSM8K) appear on tasks requiring multi-step mathematical reasoning, precisely the setting where greedy decoding is most vulnerable to error propagation. Commonsense and science reasoning tasks, which often require fewer steps, still benefit but to a lesser degree.'
    },

    {
      type: 'paragraph', id: 'p-14',
      content: 'A critical feature of these results is their <strong>consistency across model architectures</strong>. Wang et al. (2023) tested self-consistency on four distinct model families (<strong>PaLM</strong>, <strong>LaMDA</strong>, <strong>GPT-3</strong>, and <strong>UL2</strong>) and found improvements across all of them. This rules out the possibility that self-consistency exploits architecture-specific idiosyncrasies; it is a genuinely model-agnostic decoding strategy.'
    },

    {
      type: 'paragraph', id: 'p-15',
      content: 'The gains are also notable for what they do <em>not</em> require. Unlike approaches based on learned verifiers (Cobbe et al., 2021) or step-aware verification (Li et al., 2023), self-consistency uses no auxiliary models, no reward signals, and no additional training data. The entire improvement comes from a change in how the model\'s existing knowledge is decoded, making it one of the most cost-effective interventions available for improving reasoning performance.'
    },

    {
      type: 'code-block', id: 'cb-2', label: 'results summary',
      content: 'Benchmark       | Greedy CoT | + Self-Consistency | Δ\n────────────────┼────────────┼────────────────────┼────────\nGSM8K           |    base    |       +17.9%       | ▲▲▲▲▲\nSVAMP           |    base    |       +11.0%       | ▲▲▲▲\nAQuA            |    base    |       +12.2%       | ▲▲▲▲\nStrategyQA      |    base    |        +6.4%       | ▲▲▲\nARC-challenge   |    base    |        +3.9%       | ▲▲\n\nModels tested: PaLM, LaMDA, GPT-3, UL2\nAdditional training required: None'
    },

    // ── Section 5: Computational Tradeoffs ──
    { type: 'section', id: 'sec-5', title: '5. Computational Tradeoffs' },

    {
      type: 'paragraph', id: 'p-16',
      content: 'The primary cost of self-consistency is computational: it requires <Latex>N</Latex> forward passes through the language model instead of one. If each greedy CoT inference costs <Latex>C</Latex> compute units, self-consistency costs approximately <Latex>N \\times C</Latex>. This linear scaling is straightforward but nontrivial. At <Latex>N = 40</Latex>, inference cost increases by a factor of 40.'
    },

    {
      type: 'paragraph', id: 'p-17',
      content: 'In practice, typical values of <Latex>N</Latex> range from <strong>5 to 40</strong> sampled paths. The accuracy-cost tradeoff follows a characteristic curve of <strong>diminishing returns</strong>: the largest gains come from the first few samples (going from <Latex>N = 1</Latex> to <Latex>N = 5</Latex> is dramatic), while moving from <Latex>N = 20</Latex> to <Latex>N = 40</Latex> yields only marginal additional improvement. This is consistent with the statistical intuition: the variance of a majority vote estimator decreases as <Latex>O(1/N)</Latex>, so each additional sample contributes less.'
    },

    {
      type: 'callout', id: 'c-5', calloutType: 'info',
      content: 'For resource-constrained deployments, even <Latex>N = 5</Latex> self-consistency samples can capture a substantial fraction of the maximum possible gain, making it a practical choice even when budgets are tight.'
    },

    {
      type: 'paragraph', id: 'p-18',
      content: 'Several strategies can mitigate the computational overhead:'
    },

    {
      type: 'list', id: 'l-3', listType: 'unordered',
      items: [
        '<strong>Batch parallelism.</strong> All <Latex>N</Latex> samples are independent and can be generated in parallel on hardware with sufficient memory, converting latency cost into throughput cost.',
        '<strong>Adaptive sampling.</strong> One can implement early stopping: if the first <Latex>k</Latex> samples already show overwhelming agreement, skip the remaining <Latex>N - k</Latex> samples.',
        '<strong>Hybrid strategies.</strong> Use self-consistency selectively for difficult problems (identified by low model confidence under greedy decoding) and fall back to greedy decoding for easy ones.'
      ]
    },

    {
      type: 'callout', id: 'c-6', calloutType: 'warning',
      content: 'Compared to verifier-based approaches such as best-of-<Latex>N</Latex> with a trained reward model (Cobbe et al., 2021), self-consistency has comparable inference cost but avoids the upfront expense of training a separate verifier. The tradeoff is that a well-trained verifier can outperform majority voting when verification is easier than generation, but training such a verifier requires labeled reasoning traces.'
    },

    // ── Section 6: Connection to Ensemble Methods ──
    { type: 'section', id: 'sec-6', title: '6. Connection to Ensemble Methods' },

    {
      type: 'paragraph', id: 'p-19',
      content: 'Self-consistency can be formally situated within the broader framework of <strong>ensemble methods</strong> in statistical learning theory. Classical ensemble techniques, such as bagging, boosting, and random forests, achieve superior predictive performance by aggregating the outputs of multiple diverse base learners. The theoretical foundation, dating to Breiman (1996), is that aggregation reduces variance when the component predictions exhibit sufficient diversity.'
    },

    {
      type: 'paragraph', id: 'p-20',
      content: 'In standard ensembles, diversity comes from variation in <em>model parameters</em>: each base learner is trained on a different bootstrap sample (bagging), given different feature subsets (random forests), or sequentially corrected (boosting). In self-consistency, diversity comes from variation in <em>reasoning paths</em>: the stochasticity of temperature sampling explores different trajectories through the model\'s internal computation. The underlying model parameters are identical across all samples; only the decoded output varies.'
    },

    {
      type: 'callout', id: 'c-7', calloutType: 'tip',
      content: 'Self-consistency is an ensemble over <em>reasoning paths</em>, not over <em>model parameters</em>. This is a crucial distinction: it means SC can be applied to any single model without the expense of training multiple models, while still achieving the variance-reduction benefits of ensembling.'
    },

    {
      type: 'paragraph', id: 'p-21',
      content: 'The connection to the <strong>bias-variance decomposition</strong> is illuminating. Greedy decoding can be viewed as a high-variance estimator. Small perturbations in the sampling process (even a single different token choice early in the chain) can lead to dramatically different final answers. Self-consistency reduces this variance through averaging, at no cost to bias, assuming the model\'s distribution already places the highest total probability mass on the correct answer. The result is a strictly better estimator under the same model.'
    },

    {
      type: 'paragraph', id: 'p-22',
      content: 'This perspective also clarifies when self-consistency will <em>fail</em>. If the model is systematically biased (if most reasoning paths lead to the same <em>wrong</em> answer), then majority voting will confidently return that wrong answer. Self-consistency reduces variance but cannot correct bias. For bias correction, one needs either better models, better prompts, or auxiliary verification mechanisms such as the step-aware verifiers explored by Li et al. (2023).'
    },

    // ── References ──
    { type: 'section', id: 'sec-7', title: 'References & Further Reading' },

    {
      type: 'reference', id: 'r-1',
      title: 'Self-Consistency Improves Chain of Thought Reasoning in Language Models',
      url: 'https://arxiv.org/abs/2203.11171',
      authors: 'Wang, X., Wei, J., Schuurmans, D., Le, Q., Chi, E., Narang, S., Chowdhery, A., & Zhou, D.',
      venue: 'ICLR',
      year: '2023',
      description: 'The foundational paper introducing self-consistency as a decoding strategy for chain-of-thought reasoning.'
    },

    {
      type: 'reference', id: 'r-2',
      title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      authors: 'Wei, J., Wang, X., Schuurmans, D., et al.',
      venue: 'NeurIPS',
      year: '2022',
      description: 'The original CoT prompting paper that self-consistency builds upon.'
    },

    {
      type: 'reference', id: 'r-3',
      title: 'Training Verifiers to Solve Math Word Problems',
      url: 'https://arxiv.org/abs/2110.14168',
      authors: 'Cobbe, K., Kosaraju, V., Bavarian, M., et al.',
      venue: 'arXiv',
      year: '2021',
      description: 'Introduces the verifier-based approach to improving math reasoning, an alternative to self-consistency\'s majority voting.'
    },

    {
      type: 'reference', id: 'r-4',
      title: 'Making Language Models Better Reasoners with Step-Aware Verifier',
      url: 'https://arxiv.org/abs/2206.02336',
      authors: 'Li, Y., Lin, Z., Zhang, S., et al.',
      venue: 'ACL',
      year: '2023',
      description: 'Extends verification to step-level granularity, complementing the self-consistency paradigm.'
    }
  ]
};
