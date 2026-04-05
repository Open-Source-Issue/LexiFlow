import { useState, useEffect } from "react";
import Popup from "./Popup";
import "./App.css";
import { useLexiFlowSettings } from "../../context/LexiFlowSettingsContext";
import { languages } from "../../utils/languages";

function App() {
  const [showButton, setShowButton] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // ✅ For shortcut-triggered popup
  const [shortcutPopup, setShortcutPopup] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const { settings, setSourceLang } = useLexiFlowSettings();

  const normalizeDetectedLang = (detected: string | undefined | null): string | null => {
    if (!detected) return null;
    const lower = detected.toLowerCase();
    const exact = languages.find((l) => l.code.toLowerCase() === lower);
    if (exact) return exact.code;
    const base = lower.split("-")[0];
    const baseMatch = languages.find((l) => l.code.toLowerCase() === base);
    return baseMatch ? baseMatch.code : null;
  };

  const pickBestDetectedLang = (
    result: chrome.i18n.LanguageDetectionResult,
    text: string
  ): string | null => {
    const isAscii = /^[\x00-\x7F]+$/.test(text);
    // For plain ASCII text (typical English web content), always treat as English.
    if (isAscii) return "en";

    if (!result.languages || result.languages.length === 0) return null;

    const candidates = result.languages
      .filter((l) => typeof l.language === "string")
      .map((l) => ({
        raw: l.language,
        normalized: normalizeDetectedLang(l.language),
        percentage: l.percentage ?? 0,
      }))
      .filter((c) => c.normalized);

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => b.percentage - a.percentage);

    const top = candidates[0];

    if (top.percentage >= 70) {
      return top.normalized!;
    }

    return null;
  };

  // --- Selection-based popup ---
  useEffect(() => {
    const handleSelection = () => {
      if (!settings.popupOnSelect) {
        setShowButton(false);
        setSelectedText("");
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";
      if (selection && text) {
        setSelectedText(text);
        if (typeof chrome !== "undefined" && chrome.i18n && chrome.i18n.detectLanguage) {
          chrome.i18n.detectLanguage(text, (result) => {
            const best = pickBestDetectedLang(result, text);
            if (best) {
              setSourceLang(best);
            }
          });
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setButtonPosition({
          x: rect.right + window.scrollX,
          y: rect.top + window.scrollY,
        });
        setShowButton(true);
      } else {
        setShowButton(false);
        setSelectedText("");
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [settings.popupOnSelect]);

  const handleButtonClick = () => {
    setShowPopup(true);
    setShowButton(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShortcutPopup(null); // also closes shortcut popup
  };

  // --- Listen for shortcut command from background ---
  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.action === "openPopupFromShortcut") {
        const selection = window.getSelection();
        if (!selection) return;
        const text = selection?.toString().trim() || "";
        if (!text) return;

        if (typeof chrome !== "undefined" && chrome.i18n && chrome.i18n.detectLanguage) {
          chrome.i18n.detectLanguage(text, (result) => {
            const best = pickBestDetectedLang(result, text);
            if (best) {
              setSourceLang(best);
            }
          });
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setShortcutPopup({
          text,
          x: rect.right + window.scrollX,
          y: rect.top + window.scrollY,
        });
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <div>
      {/* Selection-based button */}
      {settings.popupOnSelect && showButton && buttonPosition && (
        <button
          style={{
            position: "absolute",
            left: buttonPosition.x,
            top: buttonPosition.y,
            zIndex: 1000,
          }}
          className="bg-gray-100 rounded-sm p-1 shadow-lg border-gray-200 border-2"
          onClick={handleButtonClick}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              background: "linear-gradient(135deg, #f3f3f3 60%, #e0e0e0 100%)",
              borderRadius: "3px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "none",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ padding: "0px" }}
            >
              <rect width="24" height="24" rx="6" fill="#fff" />
              <path
                d="M7 7h10M7 7v2.5a5 5 0 0 0 5 5M17 7v2.5a5 5 0 0 1-5 5M10 17h4M12 14.5v2.5"
                stroke="#555"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="6"
                y="22"
                fontSize="5"
                fill="#888"
                fontFamily="sans-serif"
              >
                A
              </text>
              <text
                x="15"
                y="22"
                fontSize="5"
                fill="#888"
                fontFamily="sans-serif"
              >
                文
              </text>
            </svg>
          </span>
        </button>
      )}

      {/* Selection popup */}
      {settings.popupOnSelect && showPopup && buttonPosition && (
        <Popup
          selectedText={selectedText}
          onClose={handleClosePopup}
          initialPosition={buttonPosition}
        />
      )}

      {/* Shortcut popup (independent of toggle) */}
      {settings.shortcutPopup && shortcutPopup && (
        <Popup
          selectedText={shortcutPopup.text}
          onClose={handleClosePopup}
          initialPosition={{ x: shortcutPopup.x, y: shortcutPopup.y }}
        />
      )}
    </div>
  );
}

export default App;
