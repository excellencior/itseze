import React, { useState, useEffect } from 'react';
import MainLayout from './components/Layout/MainLayout';
import GPT3Course from './pages/GPT3Course';
import ActivationFunctionsPage from './pages/concepts/ActivationFunctionsPage';

function App() {
  const [selectedModel, setSelectedModel] = useState(() => {
    return sessionStorage.getItem('itseze-active-page') || 'gpt3';
  });

  useEffect(() => {
    sessionStorage.setItem('itseze-active-page', selectedModel);
  }, [selectedModel]);

  const renderContent = () => {
    switch (selectedModel) {
      case 'gpt3':
        return <GPT3Course />;
      case 'concept:activation-functions':
        return <ActivationFunctionsPage />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-light)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Under Construction</h2>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>This page is currently being built.</p>
          </div>
        );
    }
  };

  return (
    <MainLayout selectedModel={selectedModel} onSelectModel={setSelectedModel}>
      {renderContent()}
    </MainLayout>
  );
}

export default App;
