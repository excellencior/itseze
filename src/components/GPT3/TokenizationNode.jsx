import React from 'react';
import AccordionNode from './AccordionNode';

export default function TokenizationNode({ isOpen, onToggle }) {
  return (
    <AccordionNode
      title="1. Tokenization (BPE)"
      subtitle="Neural networks only understand numbers. Text must be chunked into integer IDs."
      icon="01"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="inner-block">
        <div className="inner-title">Byte-Level Byte-Pair Encoding (BBPE)</div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          GPT models don't read character-by-character, nor do they read word-by-word. They use sub-word tokenization. 
          The BPE algorithm starts with single characters (bytes) and iteratively merges the most frequently occurring pairs in the training data until it reaches a vocabulary of <strong>50,257 tokens</strong>.
        </p>

        <div style={{ background: '#f6f6f6', border: '1px solid var(--border)', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)', marginBottom: '12px' }}>SUB-WORD SPLITTING</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '15px' }}>
            <span style={{ background: 'white', border: '1.5px solid var(--border)', padding: '6px 12px', fontWeight: 600 }}>"unhappiness"</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 800 }}>→</span>
            <span style={{ background: '#333', color: 'white', padding: '6px 12px', fontWeight: 600 }}>"un" (250)</span>
            <span style={{ background: '#333', color: 'white', padding: '6px 12px', fontWeight: 600 }}>"happi" (1823)</span>
            <span style={{ background: '#333', color: 'white', padding: '6px 12px', fontWeight: 600 }}>"ness" (321)</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '16px' }}>Rare words are split into known sub-words. This ensures the model never encounters an "Unknown" token!</p>
        </div>
      </div>

      <div className="inner-block" style={{ borderLeft: '4px solid var(--border)' }}>
        <div className="inner-title">Literal Vocabulary Dictionary</div>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          GPT-3 has a fixed, hardcoded dictionary. Every token maps to exactly one integer. Notice how spaces are included as part of the token (often visualized as <code>Ġ</code> in raw BPE).
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600 }}>
          <div style={{ background: 'white', padding: '12px 16px', border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-main)' }}>"!"</span><span>0</span>
          </div>
          <div style={{ background: 'white', padding: '12px 16px', border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-main)' }}>"The"</span><span>464</span>
          </div>
          <div style={{ background: 'white', padding: '12px 16px', border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-main)' }}>" cat"</span><span>3797</span>
          </div>
          <div style={{ background: 'white', padding: '12px 16px', border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-main)' }}>" Data"</span><span>8585</span>
          </div>
          <div style={{ background: 'white', padding: '12px 16px', border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-main)' }}>" visualization"</span><span>18451</span>
          </div>
          <div style={{ background: 'white', padding: '12px 16px', border: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-main)' }}>"&lt;|endoftext|&gt;"</span><span>50256</span>
          </div>
        </div>
      </div>
    </AccordionNode>
  );
}
