import { useState, useRef } from 'react';
import Latex from '../../components/Latex';
import Highlight from '../../components/Highlight';
import InlinePanel from '../../components/viz/InlinePanel';

function Section({ title, children }) {
  return (
    <div id={title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')} data-section style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>{title}</h2>
      {children}
    </div>
  );
}

function P({ children }) {
  return <p>{children}</p>;
}

function Callout({ type = 'info', children }) {
  const colors = {
    info: { bg: '#EFF6FF', border: '#3B82F6', icon: 'ℹ️' },
    warning: { bg: '#FFF7ED', border: '#F59E0B', icon: '⚠️' },
    key: { bg: '#F0FDF4', border: '#10B981', icon: '💡' },
    accent: { bg: 'var(--accent-20)', border: 'var(--accent)', icon: '↩' },
  };
  const c = colors[type];
  return (
    <div style={{
      background: c.bg, borderLeft: `4px solid ${c.border}`,
      padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',
      fontSize: '14px', lineHeight: 1.6, color: '#333',
    }}>
      <span style={{ marginRight: '8px' }}>{c.icon}</span>{children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   PromptAnatomyWidget — interactive zero-shot prompt diagram
   ──────────────────────────────────────────────────────── */
export function PromptAnatomyWidget() {
  const tasks = {
    Translation: {
      instruction: 'Translate the following English text to French:',
      input: 'The weather is nice today.',
      output: "Le temps est beau aujourd'hui.",
    },
    Sentiment: {
      instruction: 'Classify the sentiment of the following review as positive, negative, or neutral:',
      input: 'The battery life is incredible but the screen quality is disappointing.',
      output: 'Mixed/Neutral',
    },
    Summarization: {
      instruction: 'Summarize the following paragraph in one sentence:',
      input: 'Large language models have shown remarkable capabilities in few-shot learning, where they can perform new tasks with just a few examples. This ability emerges from pre-training on vast amounts of text data, which gives the model a broad understanding of language patterns and world knowledge.',
      output: 'LLMs can perform new tasks from minimal examples due to broad knowledge gained from large-scale pre-training.',
    },
    QA: {
      instruction: 'Answer the following question based on the given context:',
      input: 'Context: The Eiffel Tower was built in 1889 for the World\'s Fair in Paris.\nQuestion: When was the Eiffel Tower built?',
      output: '1889',
    },
  };

  const [selected, setSelected] = useState('Translation');
  const [outputText, setOutputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const timerRef = useRef(null);

  const task = tasks[selected];

  const handleSelect = (key) => {
    setSelected(key);
    setOutputText('');
    setShowOutput(false);
    setGenerating(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleGenerate = () => {
    if (generating) return;
    setShowOutput(true);
    setGenerating(true);
    setOutputText('');
    const full = task.output;
    let idx = 0;
    timerRef.current = setInterval(() => {
      idx++;
      setOutputText(full.slice(0, idx));
      if (idx >= full.length) {
        clearInterval(timerRef.current);
        setGenerating(false);
      }
    }, 35);
  };

  const sectionBox = (label, color, content, extra) => (
    <div style={{
      border: `1.5px solid ${color}`,
      borderRadius: '6px',
      overflow: 'hidden',
      ...(extra || {}),
    }}>
      <div style={{
        background: color,
        padding: '4px 10px',
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#fff',
        fontFamily: 'var(--font-mono)',
      }}>{label}</div>
      <div style={{
        padding: '10px 12px',
        fontSize: '13px',
        lineHeight: 1.55,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text)',
        background: 'var(--bg, #fff)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>{content}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'var(--font-main)' }}>
      {/* Header */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '2px' }}>Interactive</div>
        <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '4px' }}>Prompt Anatomy</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Select a task to see how a zero-shot prompt is structured — then generate a plausible output.</div>
      </div>

      {/* Task selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {Object.keys(tasks).map((key) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            style={{
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: 600,
              border: selected === key ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: '4px',
              background: selected === key ? 'var(--accent)' : 'transparent',
              color: selected === key ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-main)',
              transition: 'all 0.15s',
            }}
          >
            {key === 'QA' ? 'Question Answering' : key}
          </button>
        ))}
      </div>

      {/* Prompt diagram */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {/* Instruction */}
        {sectionBox('Instruction', '#3B82F6', task.instruction)}

        {/* Connector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0 2px 18px' }}>
          <div style={{ width: '2px', height: '18px', background: 'var(--border)' }} />
        </div>

        {/* No demonstrations */}
        <div style={{
          border: '1.5px dashed var(--border)',
          borderRadius: '6px',
          padding: '12px 14px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12.5px',
          fontStyle: 'italic',
          background: 'transparent',
          opacity: 0.7,
        }}>
          <span style={{ fontSize: '14px', marginRight: '6px' }}>∅</span>
          Zero-shot: no examples provided
        </div>

        {/* Connector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0 2px 18px' }}>
          <div style={{ width: '2px', height: '18px', background: 'var(--border)' }} />
        </div>

        {/* Input */}
        {sectionBox('Input', '#10B981', task.input)}

        {/* Connector + Generate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0 6px 18px' }}>
          <div style={{ width: '2px', height: '24px', background: 'var(--border)' }} />
          {!showOutput && (
            <button
              onClick={handleGenerate}
              style={{
                padding: '5px 16px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1.5px solid var(--accent)',
                borderRadius: '4px',
                background: 'var(--accent)',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'var(--font-main)',
                transition: 'all 0.15s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              ▶ Generate
            </button>
          )}
        </div>

        {/* Output */}
        {showOutput && sectionBox(
          '→ Model Output',
          '#F59E0B',
          <>
            <span>{outputText}</span>
            {generating && (
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '14px',
                background: '#F59E0B',
                marginLeft: '2px',
                verticalAlign: 'text-bottom',
                animation: 'blink 0.7s steps(2) infinite',
              }} />
            )}
            <style>{`@keyframes blink { 0%{opacity:1} 100%{opacity:0} }`}</style>
          </>,
          { transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)' },
        )}
      </div>

      {/* Annotations */}
      <div style={{ marginTop: '14px', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
        Each colored section represents a component of the prompt. In zero-shot prompting, the demonstrations slot is always empty — the model relies solely on the instruction and its pre-trained knowledge.
      </div>
    </div>
  );
}

export default function ZeroShotPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const btnRef = useRef(null);

  const handleToggle = () => {
    setPanelOpen(prev => {
      const next = !prev;
      if (next && btnRef.current) {
        setTimeout(() => {
          btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return next;
    });
  };

  const handleClose = () => {
    setPanelOpen(false);
    if (btnRef.current) {
      setTimeout(() => {
        btnRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  return (
    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>
          Prompting
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
          Zero-Shot Prompting
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>
          The simplest and most fundamental evaluation paradigm for large language models. Zero-shot prompting measures a model's ability to generalize from pre-training knowledge alone, completing tasks from nothing more than a natural language instruction.
        </p>
      </div>

      {/* Section 1 */}
      <Section title="1. What Is Zero-Shot Prompting">
        <P>
          <strong>Zero-shot prompting</strong> is the evaluation setting in which a language model receives <em>only</em> a natural language description of a task, with no worked examples whatsoever, before being asked to produce an answer. Formally, the model is given a prompt <Latex math="p" /> consisting of a task instruction <Latex math="I" /> and a query <Latex math="q" />, and must generate a completion <Latex math="y" /> that maximizes the conditional probability:
        </P>
        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="y = \arg\max P(y \mid I, q)" />
        </div>
        <P>
          Critically, the conditioning context contains zero demonstration pairs <Latex math="(x_i, y_i)" />; the model must rely entirely on knowledge acquired during pre-training. The prompt structure is therefore minimal: an instruction, an empty demonstrations slot, and the input query{' '}
          <button
            ref={btnRef}
            onClick={handleToggle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid var(--accent)',
              background: 'transparent',
              color: 'var(--accent)',
              cursor: 'pointer',
              borderRadius: '3px',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              verticalAlign: 'middle',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-20)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            ◧ visualize
          </button>.
        </P>
        <InlinePanel open={panelOpen} onClose={handleClose}>
          <PromptAnatomyWidget />
        </InlinePanel>
        <P>
          This stands in contrast to <strong>few-shot prompting</strong>, where the prompt is augmented with <Latex math="k" /> input output examples (typically <Latex math="k \in [10, 100]" />) that illustrate the desired behavior before the actual query, and <strong>one-shot prompting</strong>, which provides a single demonstration. Brown et al. (2020) formalized these three settings as a spectrum of <em>in-context learning</em> regimes, each distinguished solely by the number of examples prepended to the query, with no gradient updates or fine-tuning applied in any case.
        </P>

        <Callout type="key">
          Zero-shot is the purest test of generalization: the model must infer what task is being asked, how to format its answer, and what knowledge to draw upon, all from a single natural language instruction.
        </Callout>

        <P>
          The following example illustrates the structural difference between a zero-shot prompt and a few-shot prompt for the same sentiment classification task:
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            zero-shot prompt
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Classify the sentiment of the following review as "positive" or "negative".

Review: "The cinematography was breathtaking but the plot felt hollow."
Sentiment:`}</pre>
        </div>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            few-shot prompt
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Classify the sentiment of each review as "positive" or "negative".

Review: "An absolute masterpiece from start to finish."
Sentiment: positive

Review: "Terrible acting and a predictable storyline."
Sentiment: negative

Review: "The cinematography was breathtaking but the plot felt hollow."
Sentiment:`}</pre>
        </div>

        <P>
          In the zero-shot case, the model must independently determine the label space, output format, and decision boundary. In the few-shot case, these are implicitly communicated through the provided demonstrations.
        </P>
      </Section>

      {/* Section 2 */}
      <Section title="2. The GPT-3 Paradigm Shift">
        <P>
          Before GPT-3, the dominant paradigm in NLP was <em>pre-train then fine-tune</em>: a model would be pre-trained on a large corpus of text, then its parameters would be updated via supervised gradient descent on a task-specific labeled dataset. Models such as BERT, GPT-2, and their variants required this fine-tuning step to achieve competitive performance on downstream benchmarks. Radford et al. (2019) demonstrated with GPT-2 that language models could perform tasks in a zero-shot manner, notably achieving promising results on reading comprehension and summarization, but the performance remained well below fine-tuned baselines.
        </P>
        <P>
          Brown et al. (2020) changed the landscape entirely. <strong>GPT-3</strong>, a 175 billion parameter autoregressive language model, demonstrated that sufficient scale unlocks meaningful zero-shot performance without any gradient updates or fine-tuning. Tasks were specified purely via text interaction: the model received a natural language instruction describing the task, and produced an answer as a straightforward continuation. GPT-3 achieved strong zero-shot performance on translation, question-answering, and cloze tasks, establishing that <em>in-context task specification</em> is a viable alternative to the fine-tuning paradigm.
        </P>

        <Callout type="info">
          A key finding from Brown et al. (2020) is that the performance gap between zero-shot, one-shot, and few-shot settings <em>grows</em> with model scale. Larger models benefit disproportionately from in-context examples, but they also exhibit stronger zero-shot baselines, suggesting that scale improves both raw generalization and the ability to learn from context.
        </Callout>

        <P>
          The conceptual breakthrough was the recognition that a sufficiently large language model, trained on a diverse enough corpus, implicitly learns to perform a wide variety of tasks during pre-training. The prompt serves not as training data but as a <em>task specifier</em>, a natural language interface that activates pre-existing capabilities. This insight, that prompting is a form of task retrieval rather than task learning, remains foundational to the field of prompt engineering.
        </P>
      </Section>

      {/* Section 3 */}
      <Section title="3. Instruction Tuning and RLHF">
        <P>
          While GPT-3 demonstrated the feasibility of zero-shot prompting at scale, its zero-shot performance still lagged behind the few-shot setting on most benchmarks. The model often struggled to follow instructions precisely, produced outputs in unexpected formats, or generated plausible-sounding but factually incorrect completions. <Highlight>The reason is straightforward: GPT-3 was trained as a <em>next-token predictor</em> over web text, not as an instruction follower.</Highlight> Its objective was to model the next-token conditional probability:
        </P>
        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>
          <Latex math="P(\text{token}_t \mid \text{token}_{<t})" />
        </div>
        <P>
          This objective does not inherently reward helpfulness, correctness, or adherence to user intent.
        </P>
        <P>
          <strong>Instruction tuning</strong> addresses this misalignment. Ouyang et al. (2022) introduced <strong>InstructGPT</strong>, which applied <strong>Reinforcement Learning from Human Feedback (RLHF)</strong> to align model outputs with human preferences. The training pipeline consisted of three stages: (1) supervised fine-tuning on a dataset of human-written demonstrations of desired behavior, (2) training a reward model on human-ranked comparisons of model outputs, and (3) optimizing the language model against this reward signal using Proximal Policy Optimization (PPO).
        </P>

        <Callout type="key">
          InstructGPT showed that a 1.3 billion parameter model fine-tuned with RLHF could outperform a 175 billion parameter GPT-3 on human preference evaluations, demonstrating that alignment techniques are a powerful multiplier for zero-shot capability, often more impactful than raw scale alone.
        </Callout>

        <P>
          The implication for zero-shot prompting is profound. Instruction-tuned models generalize dramatically better to unseen tasks phrased as natural language instructions. Where base GPT-3 required carefully engineered prompts, often including formatting cues, explicit output specifications, and occasionally few-shot examples to steer behavior, instruction-tuned models can interpret and act on straightforward instructions with markedly higher reliability. This improvement is not simply a matter of better outputs; it fundamentally broadened the set of tasks accessible through zero-shot prompting.
        </P>
      </Section>

      {/* Section 4 */}
      <Section title="4. The Role of Task Phrasing">
        <P>
          One of the most consequential and under-appreciated aspects of zero-shot prompting is the sensitivity of model performance to <strong>task phrasing</strong>. Because zero-shot prompts contain no demonstrations to anchor the model's interpretation, the exact wording of the instruction becomes the <em>sole</em> signal the model has for inferring the task, the expected output format, the label space, and the desired reasoning depth. Small variations in phrasing can produce dramatically different results, a phenomenon sometimes called <em>prompt brittleness</em>.
        </P>
        <P>
          Consider the following two phrasings for the same fact extraction task:
        </P>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            effective phrasing
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Extract the country of origin from the following product description. 
Respond with only the country name.

Description: "This single-origin Arabica coffee is sourced from the highlands of Ethiopia and roasted in small batches in Portland, Oregon."
Country of origin:`}</pre>
        </div>

        <div style={{
          background: '#1e1e24', color: '#e5c07b', padding: '16px 20px', margin: '16px 0',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.6,
          border: '1px solid #333', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666', fontWeight: 700 }}>
            poor phrasing
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`Where is this from?

"This single-origin Arabica coffee is sourced from the highlands of Ethiopia and roasted in small batches in Portland, Oregon."`}</pre>
        </div>

        <P>
          The effective phrasing succeeds because it specifies the exact task (<em>extract the country of origin</em>), constrains the output format (<em>respond with only the country name</em>), and provides a clear completion cue (<em>Country of origin:</em>). The poor phrasing is ambiguous. The question "where is this from" could refer to the bean origin, the roasting location, the brand, or the text source, and provides no formatting constraint, making the model likely to produce verbose or off-target responses.
        </P>

        <Callout type="warning">
          In the zero-shot setting, there are no demonstrations to disambiguate intent. Every ambiguity in the instruction is an opportunity for the model to diverge from the desired behavior. Effective zero-shot prompts are explicit about <em>what</em> to do, <em>how</em> to format the output, and <em>what constraints</em> to observe.
        </Callout>

        <P>
          This phrasing sensitivity has important practical consequences. It means that zero-shot prompt design is not a trivial exercise; it requires careful attention to specificity, output constraints, and the elimination of ambiguity. It also partially explains why instruction-tuned models show such dramatic improvements in zero-shot settings: RLHF training makes models more robust to variation in phrasing by teaching them to infer user intent even from imprecise instructions.
        </P>
      </Section>

      {/* Section 5 */}
      <Section title="5. Strengths and Limitations">
        <P>
          Zero-shot prompting occupies a unique position in the landscape of prompting strategies. Its strengths make it the default starting point for most interactions with modern language models, while its limitations motivate the development of more sophisticated techniques such as few-shot prompting, chain-of-thought reasoning, and retrieval-augmented generation.
        </P>

        <P><strong>Strengths:</strong></P>
        <ul>
          <li><strong>No labeled examples required.</strong> Zero-shot prompting eliminates the need for curated demonstration sets, making it immediately applicable to any task, including novel or domain-specific tasks for which no labeled data exists.</li>
          <li><strong>Cross-domain generality.</strong> A single instruction-tuned model can be applied to translation, summarization, classification, extraction, code generation, and creative writing without task-specific adaptation.</li>
          <li><strong>Speed and simplicity.</strong> Zero-shot prompts are fast to construct and require minimal engineering effort. They serve as the natural first attempt when exploring a new task.</li>
          <li><strong>Reduced prompt length.</strong> Without demonstrations, prompts are short, leaving more of the model's context window available for the actual input and output, a meaningful advantage for tasks involving long documents.</li>
          <li><strong>No example selection bias.</strong> Few-shot prompting introduces the problem of which examples to select and in what order, choices that can significantly affect performance. Zero-shot prompting avoids this confound entirely.</li>
        </ul>

        <P><strong>Limitations:</strong></P>
        <ul>
          <li><strong>Struggles with complex multi-step reasoning.</strong> Brown et al. (2020) found that zero-shot GPT-3 performed poorly on tasks requiring arithmetic, logical inference, or compositional reasoning, a limitation that directly motivated the development of chain-of-thought prompting (Wei et al., 2022).</li>
          <li><strong>Sensitivity to phrasing.</strong> As discussed in Section 4, zero-shot performance is highly dependent on the exact wording of the instruction. This brittleness can make results unreliable without careful prompt design.</li>
          <li><strong>Performance gap relative to few-shot.</strong> On most standardized benchmarks, zero-shot performance consistently lags behind few-shot performance, particularly for smaller models where in-context examples provide a larger marginal benefit.</li>
          <li><strong>Format unpredictability.</strong> Without demonstrations to anchor the expected output structure, zero-shot models may produce answers in inconsistent formats, a significant issue for downstream pipelines that parse model outputs programmatically.</li>
          <li><strong>Dependence on model scale and alignment.</strong> Zero-shot prompting is most effective with large, instruction-tuned models. Smaller or base models may require few-shot examples to achieve acceptable performance on the same tasks.</li>
        </ul>

        <Callout type="accent">
          Zero-shot prompting is best understood not as a competitor to few-shot or chain-of-thought methods, but as the <em>baseline</em> from which more sophisticated strategies depart. Understanding its capabilities and failure modes is essential for knowing when additional techniques are warranted.
        </Callout>
      </Section>

      {/* Section 6 */}
      <Section title="6. References &amp; Further Reading">
        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
          <li>
            <a href="https://arxiv.org/abs/2005.14165" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Language Models are Few-Shot Learners
            </a> Brown, T.B., Mann, B., Ryder, N., et al., NeurIPS 2020. The foundational GPT-3 paper that formalized zero-shot, one-shot, and few-shot in-context learning with a 175B parameter autoregressive model.
          </li>
          <li>
            <a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Training Language Models to Follow Instructions with Human Feedback
            </a> Ouyang, L., Wu, J., Jiang, X., et al., NeurIPS 2022. Introduces InstructGPT and the RLHF pipeline that dramatically improved zero-shot instruction following.
          </li>
          <li>
            <a href="https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Language Models are Unsupervised Multitask Learners
            </a> Radford, A., Wu, J., Child, R., et al., 2019. The GPT-2 paper that first demonstrated zero-shot task transfer via language modeling, establishing the conceptual predecessor to GPT-3's in-context learning paradigm.
          </li>
        </ul>
      </Section>
    </div>
  );
}
