import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LexiFlowSettingsProvider } from "../context/LexiFlowSettingsContext";
import { ClerkProvider } from '@clerk/chrome-extension'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={"pk_test_bWVycnktamFndWFyLTY0LmNsZXJrLmFjY291bnRzLmRldiQ"}
        afterSignOutUrl="/"
        signInForceRedirectUrl="/"
    >
      <LexiFlowSettingsProvider>
        <App />
      </LexiFlowSettingsProvider>
    </ClerkProvider>
  </StrictMode>,
)
