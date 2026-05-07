import React, { useState, useEffect, useMemo } from 'react';
import AccordionNode from './AccordionNode';
import { BarChart3D } from '../three';

export default function OutputNode({ isOpen, onToggle }) {
  const [temp, setTemp] = useState(1.0);
  const [topK, setTopK] = useState(50);
  const [topP, setTopP] = useState(0.9);
  
  const [probs, setProbs] = useState({ p1: 75, p2: 15, p3: 5 });

  useEffect(() => {
    let base1 = 75; let base2 = 15; let base3 = 5;
    
    if (temp < 1) {
      base1 = Math.min(95, base1 + (1 - temp) * 20);
      base2 = Math.max(1, base2 - (1 - temp) * 10);
      base3 = Math.max(1, base3 - (1 - temp) * 4);
    } else if (temp > 1) {
      base1 = Math.max(40, base1 - (temp - 1) * 20);
      base2 = Math.min(30, base2 + (temp - 1) * 10);
      base3 = Math.min(25, base3 + (temp - 1) * 8);
    }
    
    const sum = base1 + base2 + base3;
    const p1 = Math.round((base1 / sum) * 100);
    const p2 = Math.round((base2 / sum) * 100);
    const p3 = 100 - p1 - p2;
    
    setProbs({ p1, p2, p3 });
  }, [temp, topK, topP]);

  return (
    <AccordionNode
      title="4. Output Probabilities"
      subtitle="Converts the final vectors into next-token predictions and samples them."
      icon="04"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="inner-block">
        <div className="inner-title">Linear Projection & Softmax</div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>The final vector of the last token is multiplied by the 50,257-token vocabulary matrix. This produces raw scores (logits). Softmax converts these logits into a probability distribution summing to 1.0.</p>
      </div>
      
      <div className="inner-block">
        <div className="inner-title">Generation Controls</div>
        <div className="controls-grid">
          <div className="control-group">
            <label>Temperature <span>{temp.toFixed(1)}</span></label>
            <input type="range" min="0.1" max="2.0" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Top-K <span>{topK}</span></label>
            <input type="range" min="1" max="100" step="1" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} />
          </div>
          <div className="control-group">
            <label>Top-P <span>{topP.toFixed(2)}</span></label>
            <input type="range" min="0.1" max="1.0" step="0.05" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} />
          </div>
        </div>

        <div style={{ marginTop: '32px' }}>
          <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '16px' }}>PREDICTED NEXT TOKEN</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '90px', fontFamily: '"Fira Code", monospace', fontSize: '15px', fontWeight: 600 }}>" to"</div>
            <div style={{ flex: 1, background: 'var(--bg)', height: '24px', overflow: 'hidden' }}>
              <div style={{ width: probs.p1 + '%', height: '100%', background: 'var(--accent)', transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
            </div>
            <div style={{ width: '40px', fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>{probs.p1}%</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{ width: '90px', fontFamily: '"Fira Code", monospace', fontSize: '15px', fontWeight: 600 }}>" them"</div>
            <div style={{ flex: 1, background: 'var(--bg)', height: '24px', overflow: 'hidden' }}>
              <div style={{ width: probs.p2 + '%', height: '100%', background: '#000000', transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
            </div>
            <div style={{ width: '40px', fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>{probs.p2}%</div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '90px', fontFamily: '"Fira Code", monospace', fontSize: '15px', fontWeight: 600 }}>" everyone"</div>
            <div style={{ flex: 1, background: 'var(--bg)', height: '24px', overflow: 'hidden' }}>
              <div style={{ width: probs.p3 + '%', height: '100%', background: '#545454', transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
            </div>
            <div style={{ width: '40px', fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>{probs.p3}%</div>
          </div>
        </div>

        {isOpen && (
          <div style={{ marginTop: '20px' }}>
            <BarChart3D
              data={[
                { label: '" to"', value: probs.p1 / 100, color: '#276EF1' },
                { label: '" them"', value: probs.p2 / 100, color: '#6366f1' },
                { label: '" everyone"', value: probs.p3 / 100, color: '#818cf8' },
                { label: '" the"', value: 0.02, color: '#10b981' },
                { label: '" a"', value: 0.01, color: '#f59e0b' },
              ]}
              height={260}
              hint="Adjust sliders above — bars animate in real-time"
            />
          </div>
        )}
      </div>
    </AccordionNode>
  );
}
