import React from 'react';
import AccordionNode from './AccordionNode';
import Latex from '../Latex';
import { AttentionFlow } from '../three';

export default function TransformerNode({ isOpen, onToggle, tokens }) {
  return (
    <AccordionNode
      title="3. Transformer Block (×96)"
      subtitle="The core processing engine. Includes Self-Attention and Multilayer Perceptron."
      icon="03"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="inner-block" style={{ borderLeft: '4px solid var(--border)' }}>
        <div className="inner-title">Masked Multi-Head Self-Attention</div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Tokens communicate with past tokens to build contextual understanding.</p>
        
        <div className="qkv-grid">
          <div className="qkv-card">
            <div className="qkv-title">Query (Q)</div>
            <div className="qkv-desc">"What context am I looking for?"</div>
          </div>
          <div className="qkv-card">
            <div className="qkv-title">Key (K)</div>
            <div className="qkv-desc">"What information do I contain?"</div>
          </div>
          <div className="qkv-card">
            <div className="qkv-title">Value (V)</div>
            <div className="qkv-desc">"Here is my actual content."</div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>LIVE ATTENTION HEATMAP (Q × K)</div>
          
          <div className="attn-wrap">
            {tokens.length === 0 ? (
              <div style={{ color: 'var(--text-light)', fontSize: '13px', fontWeight: 600 }}>Type above to see attention.</div>
            ) : (
              <div style={{ display: 'inline-block' }}>
                <div className="attn-row">
                  <div className="attn-lbl"></div>
                  {tokens.map((t, idx) => (
                    <div key={idx} className="attn-cell" style={{ border: 'none', background: 'transparent' }}>{t}</div>
                  ))}
                </div>
                
                {tokens.map((rowTok, r) => (
                  <div key={r} className="attn-row">
                    <div className="attn-lbl">{rowTok}</div>
                    {tokens.map((colTok, c) => {
                      if (c > r) {
                        return <div key={c} className="attn-cell" style={{ background: 'var(--bg-subtle)', color: 'var(--text-light)' }}>-</div>;
                      } else if (c === r) {
                        return <div key={c} className="attn-cell" style={{ background: 'var(--accent)', color: 'white' }}>.60</div>;
                      } else {
                        const val = ((r * 0.1 + c * 0.05) % 0.3 + 0.05).toFixed(2);
                        // Convert value to an opacity for the accent color
                        const opacity = parseFloat(val) * 2; // scale it up slightly for visibility
                        const bg = 'rgba(39, 110, 241, ' + opacity + ')';
                        return <div key={c} className="attn-cell" style={{ background: bg, color: 'var(--text-main)' }}>{val.replace('0.', '.')}</div>;
                      }
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 500 }}>Hover over cells to see interaction. Grey cells are masked (future tokens).</p>
          
          {isOpen && (
            <div style={{ marginTop: '16px' }}>
              <AttentionFlow tokens={tokens} />
            </div>
          )}
        </div>
      </div>

      <div className="arrow-down">↓</div>

      <div className="inner-block" style={{ borderLeft: '4px solid var(--border)' }}>
        <div className="inner-title">Multilayer Perceptron (MLP)</div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>After Attention routes information between tokens, the MLP processes each token completely independently. It expands the token vector into a higher-dimensional space (4× larger) to extract non-linear features, then projects it back down.</p>
        <div className="math-box">
          <Latex math={"\\text{MLP}(\\mathbf{x}) = \\text{GELU}(\\mathbf{x} \\mathbf{W}_1 + \\mathbf{b}_1) \\mathbf{W}_2 + \\mathbf{b}_2"} block />
        </div>
      </div>
      
      <div className="inner-block" style={{ background: 'var(--bg)', borderStyle: 'dashed' }}>
        <div className="inner-title" style={{ color: 'var(--text-muted)' }}>Residual Connections & LayerNorm</div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Both the Attention and MLP blocks are wrapped in Layer Normalization and Residual (Skip) Connections to stabilize training across 96 deep layers.</p>
      </div>
    </AccordionNode>
  );
}
