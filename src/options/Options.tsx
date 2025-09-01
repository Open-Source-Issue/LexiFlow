
import { createRoot } from "react-dom/client";
import SettingsPage from "../components/SettingsPage";
import './index.css'

// Mount GeneralSettings to #root in option.html
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<SettingsPage />);
} else {
  console.error("Root element not found in option.html");
}

