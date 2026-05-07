import React, { useState } from 'react';
import Playground from '../components/GPT3/Playground';
import TokenizationNode from '../components/GPT3/TokenizationNode';
import EmbeddingNode from '../components/GPT3/EmbeddingNode';
import TransformerNode from '../components/GPT3/TransformerNode';
import OutputNode from '../components/GPT3/OutputNode';

export default function GPT3Course() {
  const [promptText, setPromptText] = useState('Data visualization empowers users');
  const [openNodeId, setOpenNodeId] = useState(null);

  const tokens = promptText.split(/(?=\s)/g).filter(w => w.length > 0);

  const toggleNode = (id) => {
    setOpenNodeId(openNodeId === id ? null : id);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', color: '#000', margin: '0 0 12px 0' }}>Transformer</h1>
        <p style={{ fontSize: '1rem', color: '#545454', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
          An interactive, step-by-step visual dive into how Large Language Models like GPT-3 process text using the Transformer architecture.
        </p>
      </header>

      <Playground 
        promptText={promptText} 
        setPromptText={setPromptText} 
        tokens={tokens} 
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', width: '100%', position: 'relative', marginTop: '20px' }}>
        <div className="spine-line"></div>
        
        <TokenizationNode 
          isOpen={openNodeId === 'token'} 
          onToggle={() => toggleNode('token')} 
        />
        
        <EmbeddingNode 
          isOpen={openNodeId === 'embed'} 
          onToggle={() => toggleNode('embed')} 
        />
        
        <TransformerNode 
          isOpen={openNodeId === 'block'} 
          onToggle={() => toggleNode('block')} 
          tokens={tokens}
        />
        
        <OutputNode 
          isOpen={openNodeId === 'out'} 
          onToggle={() => toggleNode('out')} 
        />
      </div>
    </div>
  );
}
