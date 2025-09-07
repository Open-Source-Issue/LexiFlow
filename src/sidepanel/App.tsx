import { useState, useEffect } from 'react'
import crxLogo from '@/assets/logo1.svg'
import { languages } from '@/utils/languages'
import './App.css'

export default function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [fromLang, setFromLang] = useState('Detect language')
  const [toLang, setToLang] = useState('hi')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    chrome.storage.local.get('lexiflowSelectedText', (result) => {
      if (result.lexiflowSelectedText) {
        setInput(result.lexiflowSelectedText)
        chrome.storage.local.remove('lexiflowSelectedText')
      }
    })
  }, [])

  useEffect(() => {
    if (input && toLang && toLang !== 'Detect language') {
      chrome.runtime.sendMessage(
        {
          action: "translate",
          text: input,
          sourceLang: fromLang === 'Detect language' ? 'en' : fromLang,
          targetLang: toLang,
        },
        (response) => {
          setOutput(response?.translatedText || '')
        }
      )
    } else {
      setOutput('')
    }
  }, [input, toLang, fromLang])

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  // --- Add this function for settings redirect ---
  const handleSettingsClick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html#glossary"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src={crxLogo} alt="Logo" className="h-6" />
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition text-sm font-semibold shadow">
            Log in
          </button>
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            title="Settings"
            onClick={handleSettingsClick}
          >
            {/* Settings icon (same as popup) */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M19.14 12.94C19.06 12.44 19 11.94 19 11.44C19 10.94 19.06 10.44 19.14 9.94L21.12 8.43C21.26 8.31 21.32 8.13 21.27 7.96L19.27 4.46C19.22 4.29 19.06 4.19 18.89 4.24L16.56 5.17C16.04 4.77 15.46 4.44 14.82 4.19L14.5 1.72C14.48 1.54 14.32 1.41 14.14 1.41H9.86C9.68 1.41 9.52 1.54 9.5 1.72L9.18 4.19C8.54 4.44 7.96 4.77 7.44 5.17L5.11 4.24C4.94 4.19 4.78 4.29 4.73 4.46L2.73 7.96C2.68 8.13 2.74 8.31 2.88 8.43L4.86 9.94C4.94 10.44 5 10.94 5 11.44C5 11.94 4.94 12.44 4.86 12.94L2.88 14.45C2.74 14.57 2.68 14.75 2.73 14.92L4.73 18.42C4.78 18.59 4.94 18.69 5.11 18.64L7.44 17.71C7.96 18.11 8.54 18.44 9.18 18.69L9.5 21.16C9.52 21.34 9.68 21.47 9.86 21.47H14.14C14.32 21.47 14.48 21.34 14.5 21.16L14.82 18.69C15.46 18.44 16.04 18.11 16.56 17.71L18.89 18.64C19.06 18.69 19.22 18.59 19.27 18.42L21.27 14.92C21.32 14.75 21.26 14.57 21.12 14.45L19.14 12.94ZM12 15.44C10.1 15.44 8.56 13.9 8.56 12C8.56 10.1 10.1 8.56 12 8.56C13.9 8.56 15.44 10.1 15.44 12C15.44 13.9 13.9 15.44 12 15.44Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Language Selectors */}
      <section className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100">
        <select
          className="border border-gray-300 rounded-sm px-3 py-2 text-gray-700 focus:outline-none bg-gray-50 flex-1 min-w-0"
          value={fromLang}
          onChange={e => setFromLang(e.target.value)}
        >
          <option value="Detect language">Detect language</option>
          {languages.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
        <span className="text-xl text-pink-400 font-bold">→</span>
        <select
          className="border border-gray-300 rounded-sm px-3 py-2 text-gray-700 focus:outline-none bg-gray-50 flex-1 min-w-0"
          value={toLang}
          onChange={e => setToLang(e.target.value)}
        >
          {languages.map(lang => (
        <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </section>

      {/* Input/Output Areas */}
      <main className="flex-1 flex flex-col gap-6 px-6 py-6">
        <div className="flex-1 bg-white rounded-sm border border-gray-200 shadow-sm p-5 flex flex-col">
          <label className="text-lg font-semibold text-pink-400 mb-2">Type to translate</label>
          <div className="flex-1 flex flex-col">
            <textarea
              className="w-full flex-1 resize-none outline-none text-gray-800 text-lg rounded-sm border border-gray-100 p-3 bg-gray-50 focus:ring-2 focus:ring-indigo-100 transition"
              style={{ minHeight: 0 }}
              placeholder="Enter text here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>
          <span className="text-gray-400 text-sm mt-2">The translation is shown below.</span>
        </div>
        <div className="flex-1 bg-white rounded-sm border border-gray-200 shadow-sm p-5 flex flex-col">
          <label className="text-lg font-semibold text-pink-400 mb-2">Translation output</label>
            <div className="px-6 py-4 bg-gray-50 flex-1 overflow-auto">
            {output ? (
              <div className="text-left text-lg leading-relaxed">
              {(() => {
                let parsed;
                try {
                parsed = JSON.parse(output);
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
                return <span>{output}</span>;
                }
              })()}
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
              <span className="text-gray-400 text-base">Translation will appear here.</span>
            )}
            </div>
        </div>
      </main>
    </div>
  )
}

// byterover-store-knowledge: Translation output now displays structured data if available,
