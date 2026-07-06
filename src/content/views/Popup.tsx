import React, { useState, useEffect, useRef } from "react";
import { languages } from "../../utils/languages";
import { useLexiFlowSettings } from "../../context/LexiFlowSettingsContext";
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react-dom';
import { MessageClient } from "../../shared/messaging/MessageClient";
import { FieldDetectionEngine } from "../core/fieldDetection";

interface PopupProps {
  selectedText?: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

const WRITE_MODES = [
  "Improve Writing", "Fix Grammar", "Professional", "Casual", "Formal", 
  "Friendly", "Shorter", "Longer", "Simplify", "Explain", "Rewrite", 
  "Make Natural", "More Confident", "More Polite", "More Persuasive", 
  "Academic", "Business", "Marketing", "Email", "Social Media", 
  "Bullet Points", "Expand Ideas", "Continue Writing", "Summarize"
];

const Popup: React.FC<PopupProps> = ({
  selectedText,
  onClose,
  initialPosition,
}) => {
  const [activeTab, setActiveTab] = useState<'translate' | 'write'>('translate');
  const [writeMode, setWriteMode] = useState<string>("Improve Writing");
  
  const [copied, setCopied] = useState(false);
  const [replaced, setReplaced] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Drag logic
  const [isDragging, setIsDragging] = useState(false);
  const [manualPos, setManualPos] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Floating UI
  const virtualEl = {
    getBoundingClientRect() {
      return {
        x: initialPosition?.x || 0,
        y: initialPosition?.y || 0,
        top: initialPosition?.y || 0,
        left: initialPosition?.x || 0,
        bottom: initialPosition?.y || 0,
        right: initialPosition?.x || 0,
        width: 0,
        height: 0,
      };
    }
  };

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    elements: {
      reference: virtualEl,
    },
    middleware: [offset(10), flip(), shift({ padding: 10 })],
    whileElementsMounted: autoUpdate,
  });

  // Global settings
  const {
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
  } = useLexiFlowSettings();

  // Load last active tab
  useEffect(() => {
    chrome.storage.local.get(["lexiflow_last_tab", "lexiflow_last_write_mode"], (res) => {
      if (res.lexiflow_last_tab === 'write' || res.lexiflow_last_tab === 'translate') {
        setActiveTab(res.lexiflow_last_tab);
      }
      if (typeof res.lexiflow_last_write_mode === 'string') {
        setWriteMode(res.lexiflow_last_write_mode);
      }
    });
  }, []);

  // Save last active tab
  useEffect(() => {
    chrome.storage.local.set({ lexiflow_last_tab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    chrome.storage.local.set({ lexiflow_last_write_mode: writeMode });
  }, [writeMode]);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!(e.target as HTMLElement).closest('.drag-handle')) return;
    setIsDragging(true);
    const currentX = manualPos ? manualPos.x : (parseFloat(floatingStyles.left as string) || 0);
    const currentY = manualPos ? manualPos.y : (parseFloat(floatingStyles.top as string) || 0);
    
    dragOffset.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        setManualPos({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
    };
    const handlePointerUp = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  const handleSettingsClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };

  const handleGlossaryClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html#glossary"));
    }
  };

  const extractStringText = (raw: string | null): string => {
    if (!raw) return "";
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.meaning) {
        return parsed.meaning;
      }
    } catch {
      // Ignored
    }
    return raw;
  }

  const handleCopy = () => {
    const textToCopy = extractStringText(translation);
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        })
        .catch(() => alert("Failed to copy text."));
    }
  };

  const handleReplace = () => {
    const textToReplace = extractStringText(translation);
    if (!textToReplace) return;

    const activeEl = FieldDetectionEngine.getActiveElement();
    const activeAdapter = FieldDetectionEngine.getActiveAdapter();

    if (activeEl && activeAdapter) {
      activeAdapter.replaceText(activeEl, textToReplace);
      setReplaced(true);
      setTimeout(() => setReplaced(false), 1200);
    } else {
      alert("No active editable field detected to replace text.");
    }
  };

  const runRequest = async () => {
    if (!selectedText) return;
    
    setIsLoading(true);
    setTranslation(null);
    setErrorMsg(null);

    try {
      const payload = activeTab === 'translate' 
        ? {
            text: selectedText,
            sourceLang,
            targetLang,
            mode: 'dictionary'
          }
        : {
            text: selectedText,
            sourceLang,
            targetLang,
            mode: 'refine',
            refinementMode: writeMode
          };

      const response = await MessageClient.send<any>('translate', payload, 15000);
      
      // The MessageClient returns the raw chrome.runtime.sendMessage payload inside a success wrapper if it didn't strictly fail chrome APIs
      if (response && (response as any).error) {
        setErrorMsg((response as any).error);
      } else if (response && (response as any).translatedText) {
        setTranslation((response as any).translatedText);
      } else {
        setErrorMsg("Failed to process request (empty response).");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedText) {
      runRequest();
    }
    // eslint-disable-next-line
  }, [selectedText, activeTab, sourceLang, targetLang, writeMode]);

  const logoUrl = chrome.runtime.getURL("logo1.svg");
  const finalStyle = manualPos ? {
    position: 'fixed' as const,
    left: manualPos.x,
    top: manualPos.y,
  } : floatingStyles;

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...finalStyle,
        width: "min(96vw, 630px)",
        zIndex: 9999,
        background: "#fff",
        color: "#222",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        borderLeft: "20px solid #f3f4f6",
      }}
      onPointerDown={handlePointerDown}
      className="bg-white rounded-md flex flex-col"
      role="dialog"
      aria-label="Lexiflow Translator"
    >
      {/* Header Bar - Draggable */}
      <div className="w-full border-b-2 border-gray-100 flex flex-col drag-handle cursor-grab active:cursor-grabbing">
        <div className="flex items-center justify-between border-inline border-t-0 p-4 pt-1">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Logo" className="h-4" />
            <span className="ml-2 font-medium text-gray-700">Lexiflow</span>
          </div>
          <div className="flex items-center gap-2 cursor-auto">
            <button title="Settings" className="text-gray-400 hover:text-gray-700" onClick={handleSettingsClick}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14 12.94C19.06 12.44 19 11.94 19 11.44C19 10.94 19.06 10.44 19.14 9.94L21.12 8.43C21.26 8.31 21.32 8.13 21.27 7.96L19.27 4.46C19.22 4.29 19.06 4.19 18.89 4.24L16.56 5.17C16.04 4.77 15.46 4.44 14.82 4.19L14.5 1.72C14.48 1.54 14.32 1.41 14.14 1.41H9.86C9.68 1.41 9.52 1.54 9.5 1.72L9.18 4.19C8.54 4.44 7.96 4.77 7.44 5.17L5.11 4.24C4.94 4.19 4.78 4.29 4.73 4.46L2.73 7.96C2.68 8.13 2.74 8.31 2.88 8.43L4.86 9.94C4.94 10.44 5 10.94 5 11.44C5 11.94 4.94 12.44 4.86 12.94L2.88 14.45C2.74 14.57 2.68 14.75 2.73 14.92L4.73 18.42C4.78 18.59 4.94 18.69 5.11 18.64L7.44 17.71C7.96 18.11 8.54 18.44 9.18 18.69L9.5 21.16C9.52 21.34 9.68 21.47 9.86 21.47H14.14C14.32 21.47 14.48 21.34 14.5 21.16L14.82 18.69C15.46 18.44 16.04 18.11 16.56 17.71L18.89 18.64C19.06 18.69 19.22 18.59 19.27 18.42L21.27 14.92C21.32 14.75 21.26 14.57 21.12 14.45L19.14 12.94ZM12 15.44C10.1 15.44 8.56 13.9 8.56 12C8.56 10.1 10.1 8.56 12 8.56C13.9 8.56 15.44 10.1 15.44 12C15.44 13.9 13.9 15.44 12 15.44Z" />
              </svg>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-xl font-bold p-1" aria-label="Close">✕</button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-6 px-4 pt-1 cursor-auto border-b border-gray-100">
          <button 
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'translate' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('translate'); }}
          >
            Translate
          </button>
          <button 
            className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'write' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('write'); }}
          >
            Write
          </button>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="px-6 py-4 border-gray-100 border-b flex flex-wrap gap-4 items-center">
        {activeTab === 'translate' ? (
          <>
            <select aria-label="Source Language" value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="w-1/3 min-w-[120px] border-2 rounded-sm px-3 py-1.5 text-sm border-gray-200 focus:outline-none focus:border-gray-400 transition">
              <option value="Detect language">Detect language</option>
              {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
            <button
              className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition"
              title="Swap languages"
              aria-label="Swap languages"
              onClick={() => { const temp = sourceLang; setSourceLang(targetLang); setTargetLang(temp); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 4L21 8L17 12M3 8H21M7 20L3 16L7 12M21 16H3"/></svg>
            </button>
            <select aria-label="Target Language" value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-1/3 min-w-[120px] border-2 rounded-sm px-3 py-1.5 text-sm border-gray-200 focus:outline-none focus:border-gray-400 transition">
              {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
            <button className="ml-auto p-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition" title="Glossary" aria-label="Glossary" onClick={handleGlossaryClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#888"><path d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM9 18H7V16H9V18ZM9 14H7V12H9V14ZM9 10H7V8H9V10ZM15 18H11V16H15V18ZM15 14H11V12H15V14ZM15 10H11V8H15V10ZM17 6H7V4H17V6Z" /></svg>
            </button>
          </>
        ) : (
          <select 
            value={writeMode} 
            onChange={(e) => setWriteMode(e.target.value)} 
            className="w-full border-2 rounded-sm px-3 py-1.5 text-sm border-gray-200 focus:outline-none focus:border-gray-400 transition font-medium text-gray-700"
            aria-label="AI Writing Mode"
          >
            {WRITE_MODES.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        )}
      </div>

      {/* Result Area */}
      <div className="px-6 py-4 bg-white min-h-[120px] max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 animate-pulse">
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Processing with AI...
          </div>
        ) : errorMsg ? (
          <div className="text-red-600 bg-red-50 border border-red-100 p-3 rounded-sm text-sm">
            <span className="font-semibold block mb-1">Error processing request</span>
            {errorMsg}
          </div>
        ) : translation ? (
          <div className="text-left text-[15px]">
            {(() => {
              let parsed;
              try { parsed = JSON.parse(translation); } catch { parsed = null; }
              
              if (parsed && parsed.meaning) {
                return (
                  <div className="space-y-3">
                    <div>
                      <span className="font-bold text-gray-900">Result: </span>
                      <span className="text-gray-800">{parsed.meaning}</span>
                    </div>
                    {parsed.synonyms && parsed.synonyms.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700 text-sm">Synonyms: </span>
                        <span className="text-gray-600 text-sm">{parsed.synonyms.join(', ')}</span>
                      </div>
                    )}
                    {parsed.examples && parsed.examples.target && (
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 italic border border-gray-100">
                        "{parsed.examples.source}"<br />
                        <span className="text-gray-400 px-1">→</span> {parsed.examples.target}
                      </div>
                    )}
                  </div>
                );
              } else {
                return <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{translation}</div>;
              }
            })()}
            
            {/* Action Bar */}
            <div className="flex gap-2 mt-4 justify-end pt-3 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                className="p-1.5 rounded-sm bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-500 transition shadow-sm"
                title="Play sound"
                aria-label="Play text aloud"
                onClick={() => {
                  MessageClient.send('speak', { text: translation, isJson: true, lang: targetLang });
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2V15H6L11 19V5ZM15.54 8.46C16.48 9.4 17 10.64 17 12C17 13.36 16.48 14.6 15.54 15.54" /></svg>
              </button>
              <button
                onClick={handleCopy}
                className={`p-1.5 px-3 rounded-sm border transition shadow-sm font-medium text-sm flex items-center gap-1 ${copied ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                title="Copy to clipboard"
                aria-label="Copy output"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleReplace}
                className={`p-1.5 px-3 rounded-sm transition shadow-sm font-medium text-sm flex items-center gap-1 ${replaced ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                title="Replace selected text in editor"
                aria-label="Replace text"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M12 20L16 16M12 20L8 16M20 4H4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {replaced ? "Replaced!" : "Replace"}
              </button>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 italic">No text selected or processing.</span>
        )}
      </div>
    </div>
  );
};

export default Popup;
