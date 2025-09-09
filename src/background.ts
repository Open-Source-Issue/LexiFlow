// background.ts
// Handles translation requests via Google GenAI Translate API

// byterover-retrieve-knowledge: Checked user instructions and context. Always use byterover-retrieve-knowledge before tasks and byterover-store-knowledge after successful tasks. User wants to always use 'gemini-1.5-flash' for translation if available.

import { languages } from "./utils/languages";

console.log("Initializing background translation script...");

const GOOGLE_GENAI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

async function getApiKey(): Promise<string | null> {
  console.log("Fetching API key from chrome.storage...");
  return new Promise((resolve) => {
    chrome.storage.local.get("genai_api_key", (result) => {
      console.log("API key fetch result:", result);
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
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  console.log("Starting translation for text:", text, "from", sourceLang, "to", targetLang);
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.error("API key not found");
    throw new Error("API key not found");
  }

  // List models and check for 'gemini-1.5-flash'
  const models = await listModels(apiKey);
  console.log("Models fetched:", models);
  const flashModel = models?.models?.find((m: any) => m.name === "models/gemini-1.5-flash");
  console.log("'gemini-1.5-flash' model found:", flashModel);

  // Get language names for prompt using languages array
  const sourceLangObj = languages.find(l => l.code === sourceLang);
  const targetLangObj = languages.find(l => l.code === targetLang);
  console.log("Source language object:", sourceLangObj);
  console.log("Target language object:", targetLangObj);
  const sourceLangName = sourceLangObj ? sourceLangObj.name : sourceLang;
  const targetLangName = targetLangObj ? targetLangObj.name : targetLang;

  // Use the prompt format provided by user
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
  // byterover-store-knowledge: Store translation API response and extracted JSON for debugging
  return result;
}

// byterover-retrieve-knowledge: Setting the API key permanently in chrome.storage.local at extension startup

chrome.storage.local.set(
  { genai_api_key: "" },
  () => {
    console.log("API key set permanently in chrome.storage.local.");
    // byterover-store-knowledge: Store info about API key being set
  }
);

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

chrome.runtime.onInstalled.addListener(() => {
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


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "lexiflow-sidepanel" && info.selectionText && tab?.id) {
    // Store selected text in storage for sidepanel access
    chrome.storage.local.set({ lexiflowSelectedText: info.selectionText }, () => {
      // Open the sidepanel for the current tab
      if (tab?.windowId && tab?.id) {
        chrome.sidePanel.open({ tabId: tab.id, windowId: tab.windowId });
      }
    });
  }
});