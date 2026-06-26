import React from 'react';
import { getTokenID } from '../../utils/bpe';

export default function Playground({ promptText, setPromptText, tokens }) {
  return (
    <div className="playground">
      <div style={{ fontWeight: 800, marginBottom: '16px', fontSize: '14px', letterSpacing: '1px' }}>INTERACTIVE PROMPT</div>
      <input 
        type="text" 
        className="pg-input" 
        value={promptText} 
        onChange={(e) => setPromptText(e.target.value)} 
      />
      
      <div className="pg-tokens">
        {tokens.map((w, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div className="tok">{w}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800 }}>
              ID: {getTokenID(w)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
