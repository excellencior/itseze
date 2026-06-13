import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/iosevka-charon/400.css'
import '@fontsource/iosevka-charon/500.css'
import '@fontsource/iosevka-charon/700.css'
import './index.css'
import App from './App.jsx'
import { theme, toCSSVariables } from './theme'

// Inject theme tokens as CSS custom properties
const cssVars = toCSSVariables(theme);
Object.entries(cssVars).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});

// Render the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Wait for fonts, then fade out loader and reveal app
const reveal = () => {
  if (document.body.classList.contains('fonts-ready')) return;
  document.body.classList.add('fonts-ready');

  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 350);
  }
};

document.fonts.ready.then(reveal);
// Safety fallback — never stay hidden longer than 500ms
setTimeout(reveal, 500);
