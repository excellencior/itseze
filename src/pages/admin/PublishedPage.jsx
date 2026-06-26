import { useState, useMemo } from 'react';
import Latex from '../../components/Latex';
import Highlight from '../../components/Highlight';
import { BarChart3D, ScatterPlot3D } from '../../components/three';
import { renderCustomElement } from './widgetsRegistry';

/**
 * Renders a published page from localStorage block data.
 * Mirrors the real page styling used across the site.
 * Includes data-section attributes for SeekLadder compatibility.
 */

/* ── Helpers ── */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── Rich content parser ── */
function RichText({ content }) {
  if (!content) return null;
  const html = content.replace(
    /<Highlight>(.*?)<\/Highlight>/g,
    '<span style="background:var(--accent-20);border-bottom:2px solid var(--accent);padding:1px 4px">$1</span>'
  );
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── Section wrapper (data-section for SeekLadder) ── */
function Section({ id, title, children }) {
  return (
    <div id={id} data-section style={{ marginBottom: '48px', scrollMarginTop: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>{title}</h2>
      {children}
    </div>
  );
}

/* ── Block Renderer ── */
function renderBlock(block, idx) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={idx} style={{ fontSize: 'var(--font-size)', lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: '14px' }}>
          <RichText content={block.content} />
        </p>
      );

    case 'callout': {
      const colors = {
        info:    { bg: 'rgba(59,130,246,0.12)', border: '#3B82F6', icon: 'ℹ️' },
        warning: { bg: 'rgba(245,158,11,0.12)', border: '#F59E0B', icon: '⚠️' },
        key:     { bg: 'rgba(16,185,129,0.12)', border: '#10B981', icon: '💡' },
        tip:     { bg: 'rgba(16,185,129,0.12)', border: '#10B981', icon: '💡' },
        accent:  { bg: 'rgba(8,145,178,0.12)', border: '#0891B2', icon: '↩' },
      };
      const c = colors[block.calloutType] || colors.info;
      return (
        <div key={idx} style={{
          background: c.bg, borderLeft: `4px solid ${c.border}`,
          padding: '14px 18px', marginBottom: '16px', borderRadius: '0 8px 8px 0',
          fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)',
        }}>
          <span style={{ marginRight: '8px' }}>{c.icon}</span>
          <RichText content={block.content} />
        </div>
      );
    }

    case 'math-box':
      return block.expression ? (
        <div key={idx} className="math-box" style={{ textAlign: 'center', padding: '16px' }}>
          <Latex math={block.expression} block />
        </div>
      ) : null;

    case 'code-block':
      return (
        <div key={idx} style={{
          background: '#1e1e24', padding: '16px 18px',
          fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.65,
          color: '#e5c07b', borderRadius: '6px', border: '1px solid var(--border)',
          overflowX: 'auto', position: 'relative', margin: '16px 0',
        }}>
          {block.label && (
            <div style={{ position: 'absolute', top: '8px', right: '12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', opacity: 0.7 }}>
              {block.label}
            </div>
          )}
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{block.content || '...'}</pre>
        </div>
      );

    case 'three-scene': {
      let parsedData = null;
      try { parsedData = JSON.parse(block.data); } catch { /* */ }
      if (!parsedData) return null;
      return (
        <div key={idx} style={{ margin: '16px 0' }}>
          {block.sceneType === 'bar-chart' && Array.isArray(parsedData) && (
            <BarChart3D data={parsedData} height={block.height || 280} hint={block.hint} />
          )}
          {block.sceneType === 'scatter-plot' && parsedData.points && (
            <ScatterPlot3D
              points={parsedData.points}
              connections={parsedData.connections}
              height={block.height || 280}
              hint={block.hint}
            />
          )}
        </div>
      );
    }

    case 'prop-table': {
      const rows = (block.rows || []).filter(([k, v]) => k || v);
      if (rows.length === 0) return null;
      return (
        <table key={idx} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--border)' }}>
          <tbody>
            {rows.map(([k, v], i) => (
              <tr key={i}>
                <td style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '1px solid var(--border)', width: '40%', background: 'var(--node-bg)' }}>{k}</td>
                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'custom-element':
      return renderCustomElement(block, idx);

    case 'comp-table': {
      const headers = block.headers || [];
      const rows = block.rows || [];
      if (rows.length === 0) return null;
      return (
        <table key={idx} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '13px', border: '1px solid var(--border)' }}>
          {headers.length > 0 && (
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} style={{ padding: '8px 12px', fontWeight: 700, borderBottom: '2px solid var(--border)', background: 'var(--node-bg)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case 'video-embed': {
      const getEmbedUrl = (url) => {
        if (!url) return null;
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vmMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
        if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
        return null;
      };
      const embedUrl = getEmbedUrl(block.url);
      if (!embedUrl) return null;
      const ratioMap = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%' };
      return (
        <div key={idx} style={{ position: 'relative', paddingBottom: ratioMap[block.aspectRatio] || '56.25%', height: 0, overflow: 'hidden', borderRadius: '6px', margin: '16px 0' }}>
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded video"
          />
        </div>
      );
    }

    case 'divider': {
      if (block.style === 'gradient') {
        return (
          <div key={idx} style={{ height: '2px', margin: '24px 0', background: 'linear-gradient(to right, transparent, var(--border), transparent)', borderRadius: '1px' }} />
        );
      }
      return (
        <hr key={idx} style={{ border: 'none', borderTop: `2px ${block.style || 'solid'} var(--border)`, margin: '24px 0' }} />
      );
    }

    case 'blockquote':
      return (
        <blockquote key={idx} style={{
          borderLeft: '4px solid var(--accent)', padding: '14px 20px', margin: '16px 0',
          background: 'var(--node-bg)', borderRadius: '0 4px 4px 0', fontStyle: 'italic',
          fontSize: 'var(--font-size)', lineHeight: 1.75, color: 'var(--text-muted)',
        }}>
          <RichText content={block.content} />
          {block.attribution && (
            <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, fontStyle: 'normal', color: 'var(--text-light)' }}>
              {block.attribution}
            </div>
          )}
        </blockquote>
      );

    case 'list': {
      const listItems = (block.items || []).filter(item => item);
      if (listItems.length === 0) return null;
      const ListTag = block.listType === 'ordered' ? 'ol' : 'ul';
      return (
        <ListTag key={idx} style={{ fontSize: 'var(--font-size)', lineHeight: 1.75, color: 'var(--text-muted)', marginBottom: '16px', paddingLeft: '24px' }}>
          {listItems.map((item, i) => <li key={i} style={{ marginBottom: '4px' }}>{item}</li>)}
        </ListTag>
      );
    }

    case 'heading': {
      const level = block.level || 2;
      const sizes = { 2: '22px', 3: '18px', 4: '15px' };
      const HeadingTag = `h${level}`;
      return (
        <HeadingTag key={idx} style={{ fontSize: sizes[level], fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.3px', color: 'var(--text-main)' }}>
          {block.text || 'Untitled'}
        </HeadingTag>
      );
    }

    case 'tabs':
      return <PublishedTabs key={idx} block={block} />;

    default:
      return null;
  }
}

function PublishedTabs({ block }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = block.tabs || [];
  if (tabs.length === 0) return null;
  return (
    <div style={{ margin: '16px 0', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--node-bg)' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: activeTab === i ? 700 : 500,
              border: 'none', background: activeTab === i ? 'var(--bg)' : 'transparent',
              borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === i ? 'var(--text-main)' : 'var(--text-light)', cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '16px 18px', fontSize: '14px', lineHeight: 1.65, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
        {tabs[activeTab]?.content || ''}
      </div>
    </div>
  );
}

export default function PublishedPage({ pageData }) {
  const { meta, blocks, firstPublishedAt, publishedAt } = pageData;

  // Separate content, references, disclosure
  const contentBlocks = blocks.filter(b => b.type !== 'reference' && b.type !== 'ai-disclosure');
  const refBlocks = blocks.filter(b => b.type === 'reference');
  const disclosureBlock = blocks.find(b => b.type === 'ai-disclosure');

  // Group into sections
  const sections = useMemo(() => {
    const result = [];
    let currentSection = null;

    contentBlocks.forEach((block, idx) => {
      if (block.type === 'section') {
        if (currentSection) result.push(currentSection);
        const sectionId = (block.title || 'section').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
        currentSection = { title: block.title || 'Untitled', id: sectionId, children: [] };
      } else {
        const el = renderBlock(block, idx);
        if (el) {
          if (currentSection) {
            currentSection.children.push(el);
          } else {
            result.push({ type: 'loose', element: el, key: idx });
          }
        }
      }
    });
    if (currentSection) result.push(currentSection);
    return result;
  }, [contentBlocks]);

  // Build category label: "Category · Subcategory" format
  const category = capitalizeFirst(meta.category);
  const subcategory = meta.subcategory ? capitalizeFirst(meta.subcategory) : '';
  const categoryLabel = subcategory ? `${category} · ${subcategory}` : category;

  // Dates
  const publishedDate = formatDate(firstPublishedAt);
  const updatedDate = formatDate(publishedAt);
  const showUpdated = publishedAt && firstPublishedAt && publishedAt !== firstPublishedAt;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--text-light)',
          }}>
            {categoryLabel}
          </div>
          <div style={{
            fontSize: '11px', fontWeight: 500, color: 'var(--text-light)',
            display: 'flex', gap: '12px', letterSpacing: '0.01em',
          }}>
            {publishedDate && <span>Published {publishedDate}</span>}
            {showUpdated && <span>· Updated {updatedDate}</span>}
          </div>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px', color: 'var(--text-main)' }}>
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {meta.subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      {sections.map((item, i) => {
        if (item.type === 'loose') return <div key={item.key}>{item.element}</div>;
        return (
          <Section key={i} id={item.id} title={item.title}>
            {item.children}
          </Section>
        );
      })}

      {/* References */}
      {refBlocks.length > 0 && (
        <Section id="references" title="References & Further Reading">
          <ul style={{ fontSize: '14px', lineHeight: 2, color: 'var(--text-muted)', paddingLeft: '20px' }}>
            {refBlocks.map((ref, i) => (
              <li key={i}>
                <a href={ref.url || '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                  {ref.title}
                </a>{' '}
                by {ref.authors}, {ref.venue} {ref.year}. {ref.description}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* AI Disclosure */}
      {disclosureBlock && (
        <div style={{
          marginTop: '32px', padding: '16px 20px', background: 'var(--node-bg)',
          border: '1px solid var(--border)', fontSize: '13px',
          color: 'var(--text-light)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--text-muted)' }}>A note on this article:</strong> {disclosureBlock.content}
        </div>
      )}
    </div>
  );
}
