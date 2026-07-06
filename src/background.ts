// background.ts
// Handles translation requests via Google GenAI Translate API

import { languages } from "./utils/languages";

console.log("Initializing background translation script...");

function normalizeDetectedLang(detected: string | undefined | null): string {
  if (!detected) return "en";
  const lower = detected.toLowerCase();
  const exact = languages.find((l) => l.code.toLowerCase() === lower);
  if (exact) return exact.code;
  const base = lower.split("-")[0];
  const baseMatch = languages.find((l) => l.code.toLowerCase() === base);
  return baseMatch ? baseMatch.code : "en";
}

import { LLMFactory } from "./services/llm.factory";
import { CacheService } from "./services/cache/CacheService";

const DEFAULT_PROVIDER = 'gemini';

async function getApiKey(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get("genai_api_key", (result) => {
      resolve(typeof result.genai_api_key === 'string' ? result.genai_api_key : '');
    });
  });
}

// 🗝️ Initialize API key placeholder (for dev/testing, though users should set it in options)
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("genai_api_key", (result) => {
    if (!result.genai_api_key) {
      chrome.storage.local.set({ genai_api_key: "" });
    }
  });
});

async function handleTranslation(msg: any, sourceLang: string, sendResponse: (res: any) => void) {
  try {
    const apiKey = await getApiKey();
    const provider = LLMFactory.createProvider(DEFAULT_PROVIDER, apiKey);
    
    const cacheKey = CacheService.generateKey(msg.text, msg.mode === 'refine' ? (msg.refinementMode || 'improve') : msg.mode, msg.targetLang);
    const cached = await CacheService.get(cacheKey);
    
    if (cached) {
      return sendResponse({ translatedText: cached });
    }

    if (msg.mode === 'dictionary') {
      const res = await provider.translateDictionary({
        text: msg.text, sourceLang, targetLang: msg.targetLang
      });
      const resString = JSON.stringify(res);
      await CacheService.set(cacheKey, resString);
      sendResponse({ translatedText: resString });
    } else if (msg.mode === 'refine') {
      const res = await provider.refineText(
        msg.text, { targetLang: msg.targetLang, mode: msg.refinementMode || 'improve' }
      );
      await CacheService.set(cacheKey, res);
      sendResponse({ translatedText: res });
    } else {
      const res = await provider.translateRaw({
        text: msg.text, sourceLang, targetLang: msg.targetLang
      });
      await CacheService.set(cacheKey, res);
      sendResponse({ translatedText: res });
    }
  } catch (err: any) {
    console.error("Translation error:", err);
    sendResponse({ translatedText: "", error: err.message });
  }
}

// 📩 Listen for translation requests and text-to-speech
chrome.runtime.onMessage.addListener((msg: any, sender, sendResponse) => {
  console.log("Received message:", msg);
  if (msg.action === "translate") {
    // First, detect language if source is not set
    if (msg.sourceLang === "Detect language") {
      chrome.i18n.detectLanguage(msg.text, (result) => {
        const raw = result.languages[0]?.language || "en";
        const detectedLang = normalizeDetectedLang(raw);
        chrome.storage.sync.set({ sourceLang: detectedLang });
        handleTranslation(msg, detectedLang, sendResponse);
      });
    } else {
      handleTranslation(msg, msg.sourceLang, sendResponse);
    }
    return true; // async response
  } else if (msg.action === "openDashboard") {
    // If invoked from options page (GlossarySettings), open Dashboard in a new tab instead of side panel
    if (sender.url && sender.url.includes("options.html")) {
      const url = chrome.runtime.getURL("src/sidepanel/index.html#dashboard");
      chrome.tabs.create({ url });
    } else {
      // Default behavior: open sidepanel with dashboard for the current webpage tab
      if (sender.tab?.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];
          const isExtensionTab = !!activeTab?.url && activeTab.url.startsWith("chrome-extension://");
          if (activeTab?.id && !isExtensionTab) {
            chrome.sidePanel.open({ tabId: activeTab.id });
            return;
          }
          chrome.tabs.query({ currentWindow: true }, (allTabs) => {
            const webTab = allTabs.find((t) => !!t.id && !!t.url && /^https?:\/\//.test(t.url));
            if (webTab?.id) {
              chrome.sidePanel.open({ tabId: webTab.id });
              return;
            }
            chrome.tabs.create({ url: "https://example.com" }, (newTab) => {
              if (newTab?.id) chrome.sidePanel.open({ tabId: newTab.id });
            });
          });
        });
      }
    }
    sendResponse({ success: true });
  } else if (msg.action === "speak") {
    try {
      // Extract text to speak
      let textToSpeak = msg.text;
      
      // If it's JSON, try to extract meaningful content
      if (msg.isJson) {
        try {
          const parsed = JSON.parse(msg.text);
          if (parsed.meaning) {
            textToSpeak = parsed.meaning;
            // Add example if available
            if (parsed.examples && parsed.examples.target) {
              textToSpeak += ". " + parsed.examples.target;
            }
          }
        } catch (e) {
          console.error("Failed to parse JSON for speech:", e);
        }
      }
      
      // Send message to content script to speak the text
      if (sender.tab?.id) {
        // If the request came from a content script, send it back to the same tab
        chrome.tabs.sendMessage(
          sender.tab.id,
          { 
            action: "speakText", 
            text: textToSpeak,
            lang: msg.lang || 'en-US'
          },
          (response) => {
            sendResponse({ success: true, ...response });
          }
        );
      } else {
        // If the request came from popup or sidepanel, get the active tab and send it there
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              { 
                action: "speakText", 
                text: textToSpeak,
                lang: msg.lang || 'en-US'
              },
              (response) => {
                sendResponse({ success: true, ...response });
              }
            );
          } else {
            sendResponse({ success: false, error: "No active tab found" });
          }
        });
      }
      
      return true; // async response
    } catch (err) {
      console.error("Speech synthesis error:", err);
      sendResponse({ success: false, error: (err as Error).message });
      return true;
    }
  } else if (msg.action === "showFullPagePopup") {
    chrome.storage.sync.get(
      [
        "fullPageTranslate",
        "fullPageTargetLang",
        "showFullPagePopup",
        "excludedSites",
        "excludedLanguages",
        "autoTranslateLangs",
      ],
      (settings) => {
        const tabId = sender.tab?.id;
        if (!tabId) return;

        chrome.storage.local.get([`pageLang_${tabId}`], (result) => {
          const pageLang = result[`pageLang_${tabId}`];
          const pageUrl = sender.tab?.url;

          if (
            settings.fullPageTranslate &&
            settings.showFullPagePopup &&
            pageUrl &&
            !(settings as any).excludedSites.includes(new URL(pageUrl).hostname) &&
            !(settings as any).excludedLanguages.includes(pageLang)
          ) {
            // Show popup
            chrome.tabs.sendMessage(tabId, { action: "createPopup" });
          }
        });
      }
    );
  } else if (msg.action === "translateFullPage") {
    const tabId = sender.tab?.id;
    if (!tabId) return;

    chrome.storage.sync.get(["fullPageTargetLang", "autoCloseSidePanel"], (settings) => {
      if (settings.fullPageTargetLang) {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            func: (targetLang) => {
              // This is a placeholder for the actual translation logic.
              document.body.innerHTML = `<h1>Translated to ${targetLang}</h1>`;
            },
            args: [settings.fullPageTargetLang],
          },
          () => {
            if (settings.autoCloseSidePanel) {
              chrome.sidePanel.setOptions({ enabled: false });
            }
          }
        );
      }
    });
  } else if (msg.action === "resetFullPageSettings") {
    chrome.storage.sync.set({
      fullPageTranslate: true,
      fullPageTargetLang: "en",
      showFullPagePopup: true,
      autoCloseSidePanel: false,
      excludedSites: [],
      excludedLanguages: [],
      autoTranslateLangs: [],
    });
  }
});

// Detect page language on tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: () => document.documentElement.lang || document.querySelector('meta[name="lang"]')?.getAttribute('content'),
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          const detectedLang = results[0].result;
          chrome.storage.local.set({ [`pageLang_${tabId}`]: detectedLang });
        }
      }
    );
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
    // Detect language and save to sync storage
    chrome.i18n.detectLanguage(info.selectionText, (result) => {
      const raw = result.languages[0]?.language || "en";
      const detectedLang = normalizeDetectedLang(raw);
      chrome.storage.sync.set({ sourceLang: detectedLang });
    });

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

