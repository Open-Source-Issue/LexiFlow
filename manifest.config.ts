import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  name: "lexiflow",
  version: "1.0.0",
  manifest_version: 3,
  description: "Translate selected text using Google GenAI API.",
  permissions: [
    "contextMenus",
    "activeTab",
    "storage",
    "scripting",
    "sidePanel",
    "tabs",
  ],

  background: {
    service_worker: "src/background.ts",
  },

  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/main.tsx"],
      run_at: "document_end",
    },
  ],

  action: {
    default_popup: "src/popup/index.html",
  },

  side_panel: {
    default_path: "src/sidepanel/index.html",
  },

  options_ui: {
    page: "options.html",
    open_in_tab: true,
  },

  web_accessible_resources: [
    {
      resources: [
         "options.html",
         "logo1.svg",
      ],
      matches: ["http://*/*", "https://*/*"],

      use_dynamic_url: true,
    },
  ],

  icons: {
    "16": "logo1.png", // keep logo1.png in /public
    "48": "logo1.png",
    "128": "logo1.png",
  },
});
