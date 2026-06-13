function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/\{?["']([\s\S]*?)["']\}?/g, '$1') // remove braces or quotes
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanContent(str) {
  if (!str) return '';
  // Remove interactive buttons (e.g. visualize buttons)
  let cleaned = str.replace(/<button\b[^>]*>([\s\S]*?)<\/button>/gi, '');
  
  // Clean up React curly brace blocks: {' '} or {" "} or {`...`}
  cleaned = cleaned.replace(/\{\s*['"\`]([\s\S]*?)['"\`]\s*\}/g, '$1');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

export function parseJSX(jsxText, route) {
  const blocks = [];
  const meta = {
    title: '',
    subtitle: '',
    category: 'concept',
    subcategory: '',
    route: route || ''
  };

  // 1. Extract title and subtitle from the page header
  const h1Match = jsxText.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  if (h1Match) {
    meta.title = cleanText(h1Match[1]);
  }

  const pSubtitleMatch = jsxText.match(/<p\s+style=\{\{[\s\S]*?fontSize:\s*['"]16px['"][\s\S]*?\}\}[^>]*>([\s\S]*?)<\/p>/) ||
                         jsxText.match(/<header[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/);
  if (pSubtitleMatch) {
    meta.subtitle = cleanText(pSubtitleMatch[1]);
  }

  // 2. Determine category and subcategory from the route
  if (route) {
    if (route.startsWith('concept:reasoning-')) {
      meta.category = 'concept';
      meta.subcategory = 'Reasoning';
    } else if (route.startsWith('concept:prompting-')) {
      meta.category = 'concept';
      meta.subcategory = 'Prompting';
    } else if (route === 'gpt3') {
      meta.category = 'architecture';
    } else if (route.startsWith('concept:')) {
      meta.category = 'concept';
    }
  }

  // 3. Extract blocks inside the return statement
  const returnMatch = jsxText.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*}/);
  if (!returnMatch) return { meta, blocks };

  const bodyText = returnMatch[1];
  
  // Regex to match both open/close elements and self-closing tags
  const tagRegex = /<(Section|P|p|Callout|Latex|pre|PropTable|li|FunctionPlot|LinearCollapseViz|GradientDecayViz|Playground|TokenizationNode|EmbeddingNode|TransformerNode|OutputNode|AttentionHeatmap|AttentionWalkthrough|EncoderBlockDiagram|TokenJourney|SSMWalkthrough|AttnVsSSMViz|SpecDecodingWalkthrough|CoTTraceStepperWidget|DemonstrationBuilderWidget|DecompositionTreeWidget|SampleAndVoteWidget|TwoStagePipelineWidget|PromptAnatomyWidget|ThoughtTreeDiagram|AttentionFlowWidget|TextToSqlCompiler|BayesianNetwork|DebuggingLoopSimulator|RagPipelineSimulator|PropositionalEvaluator)\b([^>]*?)>([\s\S]*?)<\/\1>|<(Latex|PropTable|FunctionPlot|LinearCollapseViz|GradientDecayViz|Playground|TokenizationNode|EmbeddingNode|TransformerNode|OutputNode|AttentionHeatmap|AttentionWalkthrough|EncoderBlockDiagram|TokenJourney|SSMWalkthrough|AttnVsSSMViz|SpecDecodingWalkthrough|CoTTraceStepperWidget|DemonstrationBuilderWidget|DecompositionTreeWidget|SampleAndVoteWidget|TwoStagePipelineWidget|PromptAnatomyWidget|ThoughtTreeDiagram|AttentionFlowWidget|TextToSqlCompiler|BayesianNetwork|DebuggingLoopSimulator|RagPipelineSimulator|PropositionalEvaluator)\b([^>]*?)\/>/g;

  let match;
  let inReferences = false;
  let idCounter = 0;
  const uid = () => `parsed-${++idCounter}-${Date.now()}`;

  while ((match = tagRegex.exec(bodyText)) !== null) {
    const openTagName = match[1] || match[4];
    const attributesStr = match[2] || match[5] || '';
    const innerContent = match[3] || '';

    const lowerTagName = openTagName.toLowerCase();

    if (lowerTagName === 'section') {
      const titleAttr = attributesStr.match(/title=\{?["']([^"']+)["']\}?/);
      const title = titleAttr ? titleAttr[1] : 'Section';
      blocks.push({
        id: uid(),
        type: 'section',
        title: title
      });
      if (title.toLowerCase().includes('references') || title.toLowerCase().includes('reading')) {
        inReferences = true;
      } else {
        inReferences = false;
      }
    } 
    else if (lowerTagName === 'p') {
      let content = cleanContent(innerContent);
      if (content) {
        blocks.push({
          id: uid(),
          type: 'paragraph',
          content: content
        });
      }
    } 
    else if (lowerTagName === 'callout') {
      const typeAttr = attributesStr.match(/type=["']([^"']+)["']/);
      const calloutType = typeAttr ? typeAttr[1] : 'info';
      blocks.push({
        id: uid(),
        type: 'callout',
        calloutType,
        content: cleanContent(innerContent)
      });
    } 
    else if (lowerTagName === 'latex') {
      const mathAttr = attributesStr.match(/math=\{?["']([\s\S]*?)["']\}?/);
      if (mathAttr) {
        blocks.push({
          id: uid(),
          type: 'math-box',
          expression: mathAttr[1]
        });
      }
    } 
    else if (lowerTagName === 'pre') {
      let content = innerContent;
      const codeMatch = content.match(/\{\`([\s\S]*?)\`\}/);
      if (codeMatch) {
        content = codeMatch[1];
      }
      blocks.push({
        id: uid(),
        type: 'code-block',
        content: content.trim()
      });
    } 
    else if (lowerTagName === 'proptable') {
      const rowsAttr = attributesStr.match(/rows=\{\[([\s\S]*?)\]\}/);
      const rows = [];
      if (rowsAttr) {
        const rowsText = rowsAttr[1];
        const rowRegex = /\[\s*['"]([\s\S]*?)['"]\s*,\s*['"]([\s\S]*?)['"]\s*\]/g;
        let rowMatch;
        while ((rowMatch = rowRegex.exec(rowsText)) !== null) {
          rows.push([rowMatch[1], rowMatch[2]]);
        }
      }
      blocks.push({
        id: uid(),
        type: 'prop-table',
        rows: rows.length > 0 ? rows : [['', '']]
      });
    } 
    else if (lowerTagName === 'li' && inReferences) {
      const urlMatch = innerContent.match(/href=["']([^"']+)["']/);
      const titleMatch = innerContent.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const rest = innerContent.replace(/<a[\s\S]*?<\/a>/, '').replace(/<\/?[a-z][^>]*>/gi, '');
      const partsMatch = rest.match(/by\s+([^,]+),\s*([^\d]+)\s*(\d{4})\.\s*([\s\S]*)/) ||
                         rest.match(/by\s+([^,]+),\s*([\s\S]*)/);
      blocks.push({
        id: uid(),
        type: 'reference',
        url: urlMatch ? urlMatch[1] : '',
        title: titleMatch ? cleanText(titleMatch[1]) : 'Paper Title',
        authors: partsMatch ? cleanText(partsMatch[1]) : '',
        venue: partsMatch && partsMatch[2] ? cleanText(partsMatch[2]) : '',
        year: partsMatch && partsMatch[3] ? cleanText(partsMatch[3]) : '',
        description: partsMatch && partsMatch[4] ? cleanText(partsMatch[4]) : ''
      });
    } 
    else {
      // Custom visualizer component!
      blocks.push({
        id: uid(),
        type: 'custom-element',
        name: openTagName
      });
    }
  }

  // 4. Look for AI disclosure block if any
  const disclosureMatch = jsxText.match(/This post was written with the help of AI[\s\S]*?<\/div>/) ||
                          jsxText.match(/A note on this article:<\/strong>([\s\S]*?)<\/div>/);
  if (disclosureMatch) {
    blocks.push({
      id: uid(),
      type: 'ai-disclosure',
      content: 'This post was written with the help of AI. All content has been reviewed, verified against the original papers, and checked to ensure it is accurate and up to date.'
    });
  }

  return { meta, blocks };
}
