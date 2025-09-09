import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LexiFlowSettingsProvider } from "../context/LexiFlowSettingsContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LexiFlowSettingsProvider>
      <App />
    </LexiFlowSettingsProvider>
  </StrictMode>,
)
