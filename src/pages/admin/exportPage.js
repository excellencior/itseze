/**
 * ═══════════════════════════════════════════
 *  JSX Export Engine
 * ═══════════════════════════════════════════
 *
 * Converts the editor's JSON data model into
 * a valid .jsx file string matching the patterns
 * used throughout the itseze codebase.
 */

function escapeJSX(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

function escapeContent(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');
}

function indent(str, level = 0) {
  const pad = '  '.repeat(level);
  return str.split('\n').map(line => pad + line).join('\n');
}

function renderBlockJSX(block, idx) {
  switch (block.type) {
    case 'section':
      return `      <Section title="${escapeJSX(block.title || 'Untitled Section')}">`;

    case 'paragraph':
      return `        <P>\n          ${block.content || ''}\n        </P>`;

    case 'callout':
      return `        <Callout type="${block.calloutType || 'key'}">\n          ${block.content || ''}\n        </Callout>`;

    case 'math-box':
      return `        <div className="math-box" style={{ padding: '16px 14px', textAlign: 'center', margin: '16px 0' }}>\n          <Latex math="${escapeJSX(block.expression || '')}" />\n        </div>`;

    case 'code-block': {
      const label = block.label
        ? `\n            <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', opacity: 0.7 }}>${escapeJSX(block.label)}</div>`
        : '';
      return `        <div style={{
          background: '#1e1e24',
          padding: '16px 18px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12.5px',
          lineHeight: 1.65,
          color: '#e5c07b',
          borderRadius: '6px',
          border: '1px solid #333',
          overflowX: 'auto',
          position: 'relative',
          margin: '16px 0',
        }}>${label}
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{\`${(block.content || '').replace(/`/g, '\\`')}\`}</pre>
        </div>`;
    }

    case 'prop-table': {
      const rows = (block.rows || [])
        .filter(([k, v]) => k || v)
        .map(([k, v]) => `          ['${escapeJSX(k)}', '${escapeJSX(v)}'],`)
        .join('\n');
      return `        <PropTable rows={[\n${rows}\n        ]} />`;
    }

    case 'reference': {
      return `          <li>
            <a href="${escapeJSX(block.url || '#')}" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              ${block.title || 'Paper Title'}
            </a> by ${block.authors || 'Author(s)'}, ${block.venue || 'Venue'} ${block.year || '20XX'}. ${block.description || ''}
          </li>`;
    }

    case 'ai-disclosure':
      return `      <div style={{
        marginTop: '32px',
        padding: '16px 20px',
        background: '#F8F8F8',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        fontSize: '13px',
        color: 'var(--text-light)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-muted)' }}>A note on this article:</strong> ${block.content || ''}
      </div>`;

    default:
      return `        {/* Unknown block type: ${block.type} */}`;
  }
}

export function exportToJSX(pageData) {
  const { meta, blocks } = pageData;

  const componentName = (meta.title || 'NewPage')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('') + 'Page';

  const categoryLabel = meta.subcategory || meta.category || 'Concept';

  // Check if we need Latex
  const needsLatex = blocks.some(b =>
    b.type === 'math-box' ||
    (b.type === 'paragraph' && b.content && b.content.includes('<Latex')) ||
    (b.type === 'callout' && b.content && b.content.includes('<Latex'))
  );

  // Check if we need PropTable
  const needsPropTable = blocks.some(b => b.type === 'prop-table');

  // Group blocks into sections
  const sections = [];
  let currentSection = null;
  let refItems = [];
  let topLevelBlocks = [];

  blocks.forEach(block => {
    if (block.type === 'section') {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: block.title, blocks: [] };
    } else if (block.type === 'reference') {
      refItems.push(block);
    } else if (currentSection) {
      currentSection.blocks.push(block);
    } else {
      topLevelBlocks.push(block);
    }
  });
  if (currentSection) sections.push(currentSection);

  // Build imports
  let imports = needsLatex ? "import Latex from '../../components/Latex';\n" : '';

  // Build component string
  let jsx = '';
  jsx += `${imports}\n`;

  // Local component definitions
  jsx += `function Section({ title, children }) {\n`;
  jsx += `  return (\n`;
  jsx += `    <div id={title.toLowerCase().replace(/[^\\w\\s-]/g, '').trim().replace(/\\s+/g, '-')} data-section style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>\n`;
  jsx += `      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px' }}>{title}</h2>\n`;
  jsx += `      {children}\n`;
  jsx += `    </div>\n`;
  jsx += `  );\n`;
  jsx += `}\n\n`;

  jsx += `function P({ children }) {\n`;
  jsx += `  return <p>{children}</p>;\n`;
  jsx += `}\n\n`;

  jsx += `function Callout({ type = 'info', children }) {\n`;
  jsx += `  const colors = {\n`;
  jsx += `    info: { bg: '#EFF6FF', border: '#3B82F6', icon: 'ℹ️' },\n`;
  jsx += `    warning: { bg: '#FFF7ED', border: '#F59E0B', icon: '⚠️' },\n`;
  jsx += `    key: { bg: '#F0FDF4', border: '#10B981', icon: '💡' },\n`;
  jsx += `    accent: { bg: 'var(--accent-20)', border: 'var(--accent)', icon: '↩' },\n`;
  jsx += `  };\n`;
  jsx += `  const c = colors[type];\n`;
  jsx += `  return (\n`;
  jsx += `    <div style={{\n`;
  jsx += `      background: c.bg, borderLeft: \`4px solid \${c.border}\`,\n`;
  jsx += `      padding: '14px 18px', marginBottom: '16px', borderRadius: '0 4px 4px 0',\n`;
  jsx += `      fontSize: '14px', lineHeight: 1.6, color: '#333',\n`;
  jsx += `    }}>\n`;
  jsx += `      <span style={{ marginRight: '8px' }}>{c.icon}</span>{children}\n`;
  jsx += `    </div>\n`;
  jsx += `  );\n`;
  jsx += `}\n\n`;

  if (needsPropTable) {
    jsx += `function PropTable({ rows }) {\n`;
    jsx += `  return (\n`;
    jsx += `    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--border)' }}>\n`;
    jsx += `      <tbody>\n`;
    jsx += `        {rows.map(([k, v], i) => (\n`;
    jsx += `          <tr key={i}>\n`;
    jsx += `            <td style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid var(--border)', width: '40%', background: '#FAFAFA' }}>{k}</td>\n`;
    jsx += `            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{v}</td>\n`;
    jsx += `          </tr>\n`;
    jsx += `        ))}\n`;
    jsx += `      </tbody>\n`;
    jsx += `    </table>\n`;
    jsx += `  );\n`;
    jsx += `}\n\n`;
  }

  // Main component
  jsx += `export default function ${componentName}() {\n`;
  jsx += `  return (\n`;
  jsx += `    <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto' }}>\n`;

  // Header
  jsx += `      {/* Header */}\n`;
  jsx += `      <div style={{ marginBottom: '48px' }}>\n`;
  jsx += `        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-light)', marginBottom: '8px' }}>\n`;
  jsx += `          ${categoryLabel}\n`;
  jsx += `        </div>\n`;
  jsx += `        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>\n`;
  jsx += `          ${meta.title || 'Page Title'}\n`;
  jsx += `        </h1>\n`;
  jsx += `        <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '800px' }}>\n`;
  jsx += `          ${meta.subtitle || ''}\n`;
  jsx += `        </p>\n`;
  jsx += `      </div>\n\n`;

  // Top-level blocks (before any section)
  topLevelBlocks.forEach(block => {
    jsx += renderBlockJSX(block) + '\n\n';
  });

  // Sections
  sections.forEach(section => {
    jsx += `      <Section title="${escapeJSX(section.title)}">\n`;
    section.blocks.forEach(block => {
      jsx += renderBlockJSX(block) + '\n';
    });
    jsx += `      </Section>\n\n`;
  });

  // References
  if (refItems.length > 0) {
    jsx += `      <Section title="References & Further Reading">\n`;
    jsx += `        <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>\n`;
    refItems.forEach(ref => {
      jsx += renderBlockJSX(ref) + '\n';
    });
    jsx += `        </ul>\n`;
    jsx += `      </Section>\n\n`;
  }

  // AI disclosure
  const disclosure = blocks.find(b => b.type === 'ai-disclosure');
  if (disclosure) {
    jsx += renderBlockJSX(disclosure) + '\n';
  }

  jsx += `    </div>\n`;
  jsx += `  );\n`;
  jsx += `}\n`;

  return jsx;
}

export function exportToJSON(pageData) {
  return JSON.stringify(pageData, null, 2);
}
