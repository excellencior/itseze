import { BLOCK_EDITORS } from './BlockEditors';

/* ═══════════════════════════════════════════
 *  Block Type Definitions & Icons
 * ═══════════════════════════════════════════ */
const Icons = {
  section: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>,
  paragraph: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>,
  callout: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
  math: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 4H6l7 8-7 8h13"/></svg>,
  code: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  scene: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
  table: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>,
  reference: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  ai: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"></path></svg>,
};

export const BLOCK_TYPES = [
  { type: 'section', icon: Icons.section, label: 'Section' },
  { type: 'paragraph', icon: Icons.paragraph, label: 'Paragraph' },
  { type: 'callout', icon: Icons.callout, label: 'Callout' },
  { type: 'math-box', icon: Icons.math, label: 'Display Math' },
  { type: 'code-block', icon: Icons.code, label: 'Code Block' },
  { type: 'three-scene', icon: Icons.scene, label: '3D Scene' },
  { type: 'prop-table', icon: Icons.table, label: 'Prop Table' },
  { type: 'reference', icon: Icons.reference, label: 'Reference' },
  { type: 'ai-disclosure', icon: Icons.ai, label: 'AI Note' },
];

/* ═══════════════════════════════════════════
 *  Block Card Wrapper
 * ═══════════════════════════════════════════ */
export default function BlockCard({ block, index, onChange, onDelete, onMoveUp, onMoveDown, onDragStart, onDragOver, onDrop, isDragging, isDragOver, isFirst, isLast }) {
  const Editor = BLOCK_EDITORS[block.type];
  const typeDef = BLOCK_TYPES.find(t => t.type === block.type);

  return (
    <div
      className={`block-card${isDragging ? ' dragging' : ''}${isDragOver ? ' drag-over' : ''}`}
      data-block-id={block.id}
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={e => onDrop(e, index)}
    >
      <div className="block-card-header">
        <span className="drag-handle">⠿</span>
        <span className="block-type-badge">{typeDef?.icon} {typeDef?.label || block.type}</span>
        <div className="block-actions">
          <button className="block-action-btn" onClick={onMoveUp} disabled={isFirst} title="Move up">↑</button>
          <button className="block-action-btn" onClick={onMoveDown} disabled={isLast} title="Move down">↓</button>
          <button className="block-action-btn delete" onClick={onDelete} title="Delete block">✕</button>
        </div>
      </div>
      {Editor && <Editor block={block} onChange={onChange} />}
    </div>
  );
}
