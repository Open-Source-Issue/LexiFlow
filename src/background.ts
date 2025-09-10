// background.ts
// Handles translation requests via Google GenAI Translate API

import { languages } from "./utils/languages";

console.log("Initializing background translation script...");

const GOOGLE_GENAI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

async function getApiKey(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get("genai_api_key", (result) => {
      resolve(result.genai_api_key || null);
    });
  });
}

// Utility to list available models
async function listModels(apiKey: string): Promise<any> {
  console.log("Listing available models with API key:", apiKey);
  const res = await fetch(`${GOOGLE_GENAI_API_URL}?key=${apiKey}`);
  const json = await res.json();
  console.log("Available models response:", json);
  return json;
}

// Always use 'gemini-1.5-flash' if available for translation
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error("API key not found");
    throw new Error("API key not found");
  }

  // List models and check for 'gemini-1.5-flash'
  const models = await listModels(apiKey);
  const flashModel = models?.models?.find(
    (m: any) => m.name === "models/gemini-1.5-flash"
  );
  if (!flashModel) throw new Error("gemini-1.5-flash model not available");

  // Get language names for prompt
  const sourceLangObj = languages.find((l) => l.code === sourceLang);
  const targetLangObj = languages.find((l) => l.code === targetLang);
  const sourceLangName = sourceLangObj ? sourceLangObj.name : sourceLang;
  const targetLangName = targetLangObj ? targetLangObj.name : targetLang;

  const prompt = `For the following text: "${text}"

Please provide the translation from ${sourceLangName} to ${targetLangName} in a JSON format like this, without any markdown formatting:

{
  "meaning": "The direct translation of the selected word/phrase",
  "synonyms": ["Synonym 1", "Synonym 2"],
  "examples": {
    "source": "An example sentence in ${sourceLangName}",
    "target": "The translation of the example sentence in ${targetLangName}"
  }
}
`;
  console.log("Translation request prompt:", prompt);
  const url = `https://generativelanguage.googleapis.com/v1beta/${flashModel.name}:generateContent?key=${apiKey}`;
  console.log("Translation request URL:", url);
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  console.log("Translation request body:", body);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("Translation API response:", data);
  // Extract JSON from model response text
  let result = "";
  if (Array.isArray(data?.candidates)) {
    const textBlock = data.candidates[0]?.content?.parts?.[0]?.text || "";
    console.log("Model response text block:", textBlock);
    // Try to extract JSON from response
    const match = textBlock.match(/\{[\s\S]*\}/);
    result = match ? match[0] : textBlock;
    console.log("Extracted translation result:", result);
  } else {
    console.log("No candidates found in response.");
  }
  return result;
}

// 🗝️ Set API key placeholder once on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ genai_api_key: "AIzaSyCEWFlAmzu67pkanxJEO2ki55CnmQY3giA" });
});

// 📩 Listen for translation requests
chrome.runtime.onMessage.addListener((msg: any, _sender, sendResponse) => {
  console.log("Received message:", msg);
  if (msg.action === "translate") {
    translateText(msg.text, msg.sourceLang, msg.targetLang)
      .then((translatedText) => {
        console.log("Sending translated text response:", translatedText);
        sendResponse({ translatedText });
      })
      .catch((err) => {
        console.error("Translation error:", err);
        sendResponse({ translatedText: "", error: err.message });
      });
    return true; // async response
  }
});

/* ---------------- 📑 Context Menu (toggle support) ---------------- */
function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "lexiflow-sidepanel",
      title: "Lexiflow: translate and write with AI",
    contexts: ["selection"], // Show when user selects text
    });
      chrome.contextMenus.create({
      id: "google-translate-ai",
    title: "google: translate and write with AI",
    contexts: ["selection"], // Show when user selects text
  });
  });
}


chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("rightClick", (result) => {
    if (result.rightClick) {
      createContextMenu();
    }
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.rightClick) {
    if (changes.rightClick.newValue) {
      createContextMenu();
    } else {
      chrome.contextMenus.removeAll();
    }
  }
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "lexiflow-sidepanel" && info.selectionText && tab?.id) {
    // Save text in storage (for new sidepanel mounts)
    chrome.storage.local.set({ lexiflowSelectedText: info.selectionText }, () => {
      // Also send message to sidepanel if it’s already open
      chrome.runtime.sendMessage({
        action: "updateSelectedText",
        text: info.selectionText,
      });

      // Open the sidepanel
      if (tab?.windowId && tab?.id) {
        chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId });
      }
    });
  }
});

//---------------- ⌨️ Keyboard Shortcut (toggle support) ----------------

// 🎹 NEW: Keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-popup-shortcut") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "openPopupFromShortcut" });
      }
    });
  }
});

