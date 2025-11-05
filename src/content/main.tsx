// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App.tsx'
import { LexiFlowSettingsProvider } from "../context/LexiFlowSettingsContext";
import { languages } from "../utils/languages";
import FullPageTranslationPopup from './components/FullPageTranslationPopup';

console.log('[CRXJS] Hello world from content script!')

// Listen for messages from the background script for text-to-speech
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "speakText") {
    // Handle text-to-speech request
    try {
      let textToSpeak = msg.text;
      
      // If the text is in JSON format, extract the meaning
      if (msg.isJson) {
        try {
          const jsonData = JSON.parse(msg.text);
          if (jsonData.meaning) {
            textToSpeak = jsonData.meaning;
            // Include examples if available
            if (jsonData.examples && jsonData.examples.length > 0) {
              textToSpeak += ". For example: " + jsonData.examples.join(". ");
            }
          }
        } catch (jsonError) {
          console.log("Not valid JSON, using text as is");
        }
      }
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Convert language code to BCP 47 language tag if needed
      const langCode = msg.lang || 'en';
      
      // Use the languages array from languages.ts to create a mapping
      // This ensures we're using the same language codes as the rest of the app
      const langMap: Record<string, string> = {};
      
      // Convert language codes to BCP 47 language tags
      languages.forEach(lang => {
        // Handle special cases for language codes
        switch(lang.code) {
          case 'af': langMap[lang.code] = 'af-ZA'; break; // Afrikaans
          case 'sq': langMap[lang.code] = 'sq-AL'; break; // Albanian
          case 'am': langMap[lang.code] = 'am-ET'; break; // Amharic
          case 'ar': langMap[lang.code] = 'ar-SA'; break; // Arabic
          case 'as': langMap[lang.code] = 'as-IN'; break; // Assamese
          case 'az': langMap[lang.code] = 'az-AZ'; break; // Azerbaijani
          case 'be': langMap[lang.code] = 'be-BY'; break; // Belarusian
          case 'bn': langMap[lang.code] = 'bn-BD'; break; // Bengali
          case 'bs': langMap[lang.code] = 'bs-BA'; break; // Bosnian
          case 'bg': langMap[lang.code] = 'bg-BG'; break; // Bulgarian
          case 'ca': langMap[lang.code] = 'ca-ES'; break; // Catalan
          case 'zh-CN': langMap[lang.code] = 'zh-CN'; break; // Chinese (simplified)
          case 'zh-TW': langMap[lang.code] = 'zh-TW'; break; // Chinese (traditional)
          case 'hr': langMap[lang.code] = 'hr-HR'; break; // Croatian
          case 'cs': langMap[lang.code] = 'cs-CZ'; break; // Czech
          case 'da': langMap[lang.code] = 'da-DK'; break; // Danish
          case 'nl': langMap[lang.code] = 'nl-NL'; break; // Dutch
          case 'en': langMap[lang.code] = 'en-US'; break; // English
          case 'et': langMap[lang.code] = 'et-EE'; break; // Estonian
          case 'tl': langMap[lang.code] = 'fil-PH'; break; // Filipino
          case 'fi': langMap[lang.code] = 'fi-FI'; break; // Finnish
          case 'fr': langMap[lang.code] = 'fr-FR'; break; // French
          case 'gl': langMap[lang.code] = 'gl-ES'; break; // Galician
          case 'ka': langMap[lang.code] = 'ka-GE'; break; // Georgian
          case 'de': langMap[lang.code] = 'de-DE'; break; // German
          case 'el': langMap[lang.code] = 'el-GR'; break; // Greek
          case 'gu': langMap[lang.code] = 'gu-IN'; break; // Gujarati
          case 'iw': langMap[lang.code] = 'he-IL'; break; // Hebrew
          case 'hi': langMap[lang.code] = 'hi-IN'; break; // Hindi
          case 'hu': langMap[lang.code] = 'hu-HU'; break; // Hungarian
          case 'is': langMap[lang.code] = 'is-IS'; break; // Icelandic
          case 'id': langMap[lang.code] = 'id-ID'; break; // Indonesian
          case 'ga': langMap[lang.code] = 'ga-IE'; break; // Irish
          case 'it': langMap[lang.code] = 'it-IT'; break; // Italian
          case 'ja': langMap[lang.code] = 'ja-JP'; break; // Japanese
          case 'kn': langMap[lang.code] = 'kn-IN'; break; // Kannada
          case 'kk': langMap[lang.code] = 'kk-KZ'; break; // Kazakh
          case 'km': langMap[lang.code] = 'km-KH'; break; // Khmer
          case 'ko': langMap[lang.code] = 'ko-KR'; break; // Korean
          case 'ky': langMap[lang.code] = 'ky-KG'; break; // Kyrgyz
          case 'lo': langMap[lang.code] = 'lo-LA'; break; // Lao
          case 'lv': langMap[lang.code] = 'lv-LV'; break; // Latvian
          case 'lt': langMap[lang.code] = 'lt-LT'; break; // Lithuanian
          case 'mk': langMap[lang.code] = 'mk-MK'; break; // Macedonian
          case 'ms': langMap[lang.code] = 'ms-MY'; break; // Malay
          case 'ml': langMap[lang.code] = 'ml-IN'; break; // Malayalam
          case 'mr': langMap[lang.code] = 'mr-IN'; break; // Marathi
          case 'mn': langMap[lang.code] = 'mn-MN'; break; // Mongolian
          case 'ne': langMap[lang.code] = 'ne-NP'; break; // Nepali
          case 'no': langMap[lang.code] = 'nb-NO'; break; // Norwegian
          case 'fa': langMap[lang.code] = 'fa-IR'; break; // Persian
          case 'pl': langMap[lang.code] = 'pl-PL'; break; // Polish
          case 'pt': langMap[lang.code] = 'pt-PT'; break; // Portuguese
          case 'pa': langMap[lang.code] = 'pa-IN'; break; // Punjabi
          case 'ro': langMap[lang.code] = 'ro-RO'; break; // Romanian
          case 'ru': langMap[lang.code] = 'ru-RU'; break; // Russian
          case 'sr': langMap[lang.code] = 'sr-RS'; break; // Serbian
          case 'si': langMap[lang.code] = 'si-LK'; break; // Sinhala
          case 'sk': langMap[lang.code] = 'sk-SK'; break; // Slovak
          case 'sl': langMap[lang.code] = 'sl-SI'; break; // Slovenian
          case 'es': langMap[lang.code] = 'es-ES'; break; // Spanish
          case 'sw': langMap[lang.code] = 'sw-KE'; break; // Swahili
          case 'sv': langMap[lang.code] = 'sv-SE'; break; // Swedish
          case 'ta': langMap[lang.code] = 'ta-IN'; break; // Tamil
          case 'te': langMap[lang.code] = 'te-IN'; break; // Telugu
          case 'th': langMap[lang.code] = 'th-TH'; break; // Thai
          case 'tr': langMap[lang.code] = 'tr-TR'; break; // Turkish
          case 'uk': langMap[lang.code] = 'uk-UA'; break; // Ukrainian
          case 'ur': langMap[lang.code] = 'ur-PK'; break; // Urdu
          case 'uz': langMap[lang.code] = 'uz-UZ'; break; // Uzbek
          case 'vi': langMap[lang.code] = 'vi-VN'; break; // Vietnamese
          case 'cy': langMap[lang.code] = 'cy-GB'; break; // Welsh
          default: langMap[lang.code] = lang.code; // Use as-is for other languages
        }
      });
      
      // Set the language for speech synthesis
      utterance.lang = langMap[langCode] || 'en-US';
      
      // Try to find a voice that matches the language
      let voices = window.speechSynthesis.getVoices();
      
      // If voices array is empty, wait for voices to load
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          setVoiceForLanguage();
        };
      } else {
        setVoiceForLanguage();
      }
      
      // Function to set the appropriate voice for the language
      function setVoiceForLanguage() {
        const bcp47Tag = langMap[langCode] || 'en-US';
        const languageCode = bcp47Tag.split('-')[0]; // Get the primary language part
        
        // Try to find a voice that exactly matches the BCP 47 tag
        let voice = voices.find(v => v.lang === bcp47Tag);
        
        // If no exact match, try to find a voice that matches the primary language code
        if (!voice) {
          voice = voices.find(v => v.lang.startsWith(languageCode + '-'));
        }
        
        // If still no match, try to find any voice containing the language code
        if (!voice) {
          voice = voices.find(v => v.lang.includes(languageCode));
        }
        
        // If a matching voice is found, use it
        if (voice) {
          utterance.voice = voice;
          console.log(`Using voice: ${voice.name} (${voice.lang}) for language: ${bcp47Tag}`);
        } else {
          console.log(`No matching voice found for language: ${bcp47Tag}, using default voice`);
        }
      }
      
      console.log(`Speaking text in language: ${utterance.lang}`);
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
      
      // Send response that speech has started
      sendResponse({ status: "started" });
    } catch (error) {
      console.error("Speech synthesis error:", error);
      sendResponse({ status: "error", message: (error as Error).message });
    }
    
    return true; // Indicate async response
  } else if (msg.action === "createPopup") {
    const popupContainer = document.createElement('div');
    popupContainer.id = 'lexiflow-full-page-popup-container';
    document.body.appendChild(popupContainer);
    createRoot(popupContainer).render(<FullPageTranslationPopup />);
    sendResponse({ status: "popup created" });
  }
});

const container = document.createElement('div')
container.id = 'crxjs-app'
document.body.appendChild(container)
createRoot(container).render(
    <LexiFlowSettingsProvider>
      <App />
    </LexiFlowSettingsProvider>
)

// Inform the background script that the content script is ready
chrome.runtime.sendMessage({ action: "showFullPagePopup" });
