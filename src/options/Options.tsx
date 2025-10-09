
import { createRoot } from "react-dom/client";
import SettingsPage from "../components/SettingsPage";
import './index.css'
import { ClerkProvider } from '@clerk/chrome-extension'

// Mount GeneralSettings to #root in option.html
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <ClerkProvider 
      publishableKey={"pk_test_bWVycnktamFndWFyLTY0LmNsZXJrLmFjY291bnRzLmRldiQ"}
      signInUrl="/dashboard"
      signUpUrl="/dashboard"
    >
      <SettingsPage />
    </ClerkProvider>
  );
} else {
  console.error("Root element not found in option.html");
}

