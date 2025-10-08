import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './App.css'
import { ClerkProvider } from '@clerk/chrome-extension'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={"pk_test_bWVycnktamFndWFyLTY0LmNsZXJrLmFjY291bnRzLmRldiQ"}>
      <App />
    </ClerkProvider>
  </StrictMode>
)
