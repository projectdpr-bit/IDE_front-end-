import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { themeColors } from './config/theme'

// Inject theme colors dynamically to CSS variables
const rootElement = document.documentElement;

// Primary
rootElement.style.setProperty('--color-primary-top', themeColors.primary.gradientTop);
rootElement.style.setProperty('--color-primary-bottom', themeColors.primary.gradientBottom);
rootElement.style.setProperty('--color-primary-hover-top', themeColors.primary.hoverGradientTop);
rootElement.style.setProperty('--color-primary-hover-bottom', themeColors.primary.hoverGradientBottom);
rootElement.style.setProperty('--color-primary-shadow', themeColors.primary.shadowGlow);
rootElement.style.setProperty('--color-primary-border', themeColors.primary.border);

// Layout
rootElement.style.setProperty('--color-layout-bg', themeColors.layout.background);
rootElement.style.setProperty('--color-layout-border', themeColors.layout.border);
rootElement.style.setProperty('--color-layout-active-nav-bg', themeColors.layout.activeNavCard);
rootElement.style.setProperty('--color-layout-active-nav-border', themeColors.layout.activeNavCardBorder);

// Secondary
rootElement.style.setProperty('--color-secondary-top', themeColors.secondary.gradientTop);
rootElement.style.setProperty('--color-secondary-bottom', themeColors.secondary.gradientBottom);
rootElement.style.setProperty('--color-secondary-hover-top', themeColors.secondary.hoverGradientTop);
rootElement.style.setProperty('--color-secondary-hover-bottom', themeColors.secondary.hoverGradientBottom);
rootElement.style.setProperty('--color-secondary-text', themeColors.secondary.text);
rootElement.style.setProperty('--color-secondary-border', themeColors.secondary.border);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
