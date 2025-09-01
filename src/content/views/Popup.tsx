import React, { useState, useEffect, useRef } from "react";
import { languages } from "../../utils/languages";

interface PopupProps {
  selectedText?: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

const Popup: React.FC<PopupProps> = ({
  selectedText,
  onClose,
  initialPosition,
}) => {
  const [copied, setCopied] = useState(false);
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [translating, setTranslating] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  console.log("Selected Text:", translating);
  // Drag logic
  const handleMouseDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };
  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      if (dragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      window.addEventListener("pointermove", handleMouseMove);
      window.addEventListener("pointerup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
    };
  }, [dragging, position]);

  // byterover-retrieve-knowledge: Reviewing translation logic and Chrome extension messaging context

  const handleSettingsClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("src/options/options.html"));
    }
  };

  const handleGlossaryClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("src/options/options.html#glossary"));
    }
  };


  // Copy to clipboard handler
  const handleCopy = () => {
    if (translation) {
      navigator.clipboard
        .writeText(translation)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200); // Reset after 1.2s
        })
        .catch(() => {
          alert("Failed to copy translation.");
        });
    }
  };

  // Translation logic
  const handleTranslate = () => {
    if (!selectedText) return;
    // setTranslating(true);
    setTranslation(null);

    // Check if chrome.runtime and chrome.runtime.sendMessage are available
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      typeof chrome.runtime.sendMessage === "function"
    ) {
      // Send message to background script for translation
      chrome.runtime.sendMessage(
        {
          action: "translate",
          text: selectedText,
          sourceLang,
          targetLang,
        },
        (response) => {
          setTranslating(false);
          if (chrome.runtime.lastError) {
            setTranslation(
              "Translation failed: " + chrome.runtime.lastError.message
            );
          } else {
            setTranslation(response?.translatedText || "No result");
          }
          // byterover-store-knowledge: Store translation result and error info for debugging
        }
      );
    } else {
      setTranslating(false);
      setTranslation(
        "Translation unavailable: Not running in extension context."
      );
    }
  };

  useEffect(() => {
    if (selectedText) handleTranslate();
    // eslint-disable-next-line
  }, [selectedText, targetLang]);

  const logoUrl = chrome.runtime.getURL("logo.png");

  return (
    <div
      ref={dragRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: "min(96vw, 630px)",
        height: "320px",
        zIndex: 9999,
        background: "#fff",
        color: "#222",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        borderRadius: "0",
        padding: "20px 10px 0px 0px",
        borderLeft: "20px solid #f3f4f6",
        borderColor: "#f3f4f6",
        transition: "box-shadow 0.2s",
      }}
      onPointerDown={handleMouseDown}
      className=" bg-white"
    >
      {/* Header Bar */}
      <div className="w-full border-b-2 border-gray-100 flex flex-col">
        <div className="flex items-center justify-between border-inline border-t-0 p-4 pt-1">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Lexiflow" className="h-4" />
            <span className="ml-2 flex items-center gap-1 text-gray-700 font-medium">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: "inline", verticalAlign: "middle" }}
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
              Translator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              title="Settings"
              className="text-gray-400 hover:text-gray-700"
              onClick={handleSettingsClick}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19.14 12.94C19.06 12.44 19 11.94 19 11.44C19 10.94 19.06 10.44 19.14 9.94L21.12 8.43C21.26 8.31 21.32 8.13 21.27 7.96L19.27 4.46C19.22 4.29 19.06 4.19 18.89 4.24L16.56 5.17C16.04 4.77 15.46 4.44 14.82 4.19L14.5 1.72C14.48 1.54 14.32 1.41 14.14 1.41H9.86C9.68 1.41 9.52 1.54 9.5 1.72L9.18 4.19C8.54 4.44 7.96 4.77 7.44 5.17L5.11 4.24C4.94 4.19 4.78 4.29 4.73 4.46L2.73 7.96C2.68 8.13 2.74 8.31 2.88 8.43L4.86 9.94C4.94 10.44 5 10.94 5 11.44C5 11.94 4.94 12.44 4.86 12.94L2.88 14.45C2.74 14.57 2.68 14.75 2.73 14.92L4.73 18.42C4.78 18.59 4.94 18.69 5.11 18.64L7.44 17.71C7.96 18.11 8.54 18.44 9.18 18.69L9.5 21.16C9.52 21.34 9.68 21.47 9.86 21.47H14.14C14.32 21.47 14.48 21.34 14.5 21.16L14.82 18.69C15.46 18.44 16.04 18.11 16.56 17.71L18.89 18.64C19.06 18.69 19.22 18.59 19.27 18.42L21.27 14.92C21.32 14.75 21.26 14.57 21.12 14.45L19.14 12.94ZM12 15.44C10.1 15.44 8.56 13.9 8.56 12C8.56 10.1 10.1 8.56 12 8.56C13.9 8.56 15.44 10.1 15.44 12C15.44 13.9 13.9 15.44 12 15.44Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
      {/* Language Selectors and Swap */}
      <div className="flex justify-between items-center gap-6 px-6 py-6 border-gray-200 border-b-2">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="w-1/3 border-2 rounded-sm px-3 py-2 text-sm border-t-0 border-gray-300 focus:outline-none"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          className="mx-2 p-2 rounded-full border border-gray-200  hover:bg-gray-200"
          title="Swap languages"
          onClick={() => {
            setSourceLang(targetLang);
            setTargetLang(sourceLang);
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 4L21 8L17 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 8H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 20L3 16L7 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 16H3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="w-1/3 border-2 rounded-sm px-3 py-2 text-sm border-t-0 border-gray-300 focus:outline-none"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          className="ml-2 p-2 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
          title="Glossary"
          onClick={handleGlossaryClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM9 18H7V16H9V18ZM9 14H7V12H9V14ZM9 10H7V8H9V10ZM15 18H11V16H15V18ZM15 14H11V12H15V14ZM15 10H11V8H15V10ZM17 6H7V4H17V6Z"
              fill="#888"
            />
          </svg>
        </button>
      </div>

      {/* Divider */}
      {/* Translation Result */}
      <div className="px-6 py-4 bg-white">
        {translation ? (
          <div className="text-left">
            {/* If translation is structured JSON, show sections */}
            {(() => {
              let parsed;
              try {
                parsed = JSON.parse(translation);
              } catch {
                parsed = null;
              }
              if (parsed && parsed.meaning) {
                return (
                  <>
                    <div className="mb-2">
                      <span className="font-semibold text-gray-800">
                        Word Meaning:
                      </span>
                      <span className="ml-2">{parsed.meaning}</span>
                    </div>
                    {parsed.synonyms && parsed.synonyms.length > 0 && (
                      <div className="mb-2">
                        <span className="font-semibold text-gray-800">
                          Synonyms:
                        </span>
                        <ul className="list-disc list-inside ml-4">
                          {parsed.synonyms.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {parsed.examples && (
                      <div className="mb-2">
                        <span className="font-semibold text-gray-800">
                          Example Sentences:
                        </span>
                        <ul className="list-disc list-inside ml-4">
                          <li className="text-gray-600">
                            {parsed.examples.source}
                          </li>
                          <li className="italic">→ {parsed.examples.target}</li>
                        </ul>
                      </div>
                    )}
                  </>
                );
              } else {
                return <span>{translation}</span>;
              }
            })()}
            {/* Sound and Copy icons */}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500"
                title="Play sound"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 5L6 9H2V15H6L11 19V5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15.54 8.46C16.48 9.4 17 10.64 17 12C17 13.36 16.48 14.6 15.54 15.54"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={handleCopy}
                className={`p-2 rounded-full hover:bg-gray-200 ${
                  copied ? "text-gray-900" : "text-gray-500"
                }`}
                title={copied ? "Copied!" : "Copy"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={copied ? "#888" : "none"}
                >
                  <rect
                    x="6"
                    y="8"
                    width="12"
                    height="12"
                    rx="2"
                    stroke={copied ? "#fff" : "currentColor"}
                    strokeWidth="2"
                  />
                  <rect
                    x="2"
                    y="4"
                    width="12"
                    height="12"
                    rx="2"
                    stroke={copied ? "#fff" : "currentColor"}
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Translation will appear here.</span>
        )}
      </div>
    </div>
  );
};

export default Popup;
