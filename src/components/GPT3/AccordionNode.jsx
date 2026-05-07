import React from 'react';

export default function AccordionNode({ title, subtitle, icon, isOpen, onToggle, children }) {
  const className = 'node ' + (isOpen ? 'expanded' : '');
  return (
    <div className={className}>
      <div className="node-header" onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="node-icon">{icon}</div>
          <div className="node-title-area">
            <div className="node-title">{title}</div>
            <div className="node-subtitle">{subtitle}</div>
          </div>
        </div>
        <div className="chevron">▼</div>
      </div>
      <div className="node-content">
        {children}
      </div>
    </div>
  );
}
