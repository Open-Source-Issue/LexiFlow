import { defineManifest } from '@crxjs/vite-plugin'
// Removed unused pkg import

export default defineManifest({
  name: "lexiflow",
  version: "1.0.0",
  manifest_version: 3,
  description: "Translate selected text using Google GenAI API.",
  permissions: ["contextMenus", "activeTab", "storage", "scripting",  "sidePanel"],
  background: {
    service_worker: "src/background.ts"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/main.tsx"],
      run_at: "document_end"
    }
  ],
  action: {
    default_popup: "src/popup/index.html"
  },
  side_panel: {
    default_path: "src/sidepanel/index.html"
  },
    options_ui: {
     page: "src/options/options.html",
    open_in_tab: true
  },
  icons: {
    "16": "public/logo1.png",
    "48": "public/logo1.png",
    "128": "public/logo1.png"
  }
});
