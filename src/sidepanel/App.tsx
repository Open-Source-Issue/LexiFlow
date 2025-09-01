import { useState } from 'react'
import crxLogo from '@/assets/logo1.svg';
import './App.css'

export default function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [fromLang, setFromLang] = useState('Detect language')
  const [toLang, setToLang] = useState('English (American)')

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
          <button className="p-2 rounded-lg hover:bg-gray-100 transition">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="2"/>
              <path d="M12 8v4l3 2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Language Selectors */}
      <section className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-indigo-400 bg-gray-50"
          value={fromLang}
          onChange={e => setFromLang(e.target.value)}
        >
          <option>Detect language</option>
          <option>English</option>
          <option>Hindi</option>
          {/* Add more languages */}
        </select>
        <span className="text-xl text-indigo-400 font-bold">→</span>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-indigo-400 bg-gray-50"
          value={toLang}
          onChange={e => setToLang(e.target.value)}
        >
          <option>English (American)</option>
          <option>Hindi</option>
          {/* Add more languages */}
        </select>
      </section>

      {/* Input/Output Areas */}
      <main className="flex-1 flex flex-col gap-6 px-6 py-6">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <label className="text-lg font-semibold text-indigo-700 mb-2">Type to translate</label>
          <textarea
            className="w-full h-32 resize-none outline-none text-gray-800 text-base rounded-lg border border-gray-100 p-3 bg-gray-50 focus:ring-2 focus:ring-indigo-100 transition"
            placeholder="Enter text here..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <span className="text-gray-400 text-sm mt-2">The translation is shown below.</span>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
          <label className="text-lg font-semibold text-indigo-700 mb-2">Translation output</label>
          <textarea
            className="w-full h-32 resize-none outline-none text-gray-800 text-base rounded-lg border border-gray-100 p-3 bg-gray-50"
            placeholder="Translation will appear here..."
            value={output}
            readOnly
          />
        </div>
      </main>
    </div>
  )
}
