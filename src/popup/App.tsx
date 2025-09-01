import crxLogo from '@/assets/crx.svg'
import reactLogo from '@/assets/react.svg'
import viteLogo from '@/assets/vite.svg'
import HelloWorld from '@/components/HelloWorld'
import './App.css'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="flex space-x-6 mb-8">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="w-16 h-16 hover:scale-110 transition-transform duration-200 drop-shadow-lg" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org/" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="w-16 h-16 hover:scale-110 transition-transform duration-200 drop-shadow-lg" alt="React logo" />
        </a>
        <a href="https://crxjs.dev/vite-plugin" target="_blank" rel="noreferrer">
          <img src={crxLogo} className="w-16 h-16 hover:scale-110 transition-transform duration-200 drop-shadow-lg" alt="crx logo" />
        </a>
      </div>
      <div className=" rounded-xl shadow-xl p-6 w-full max-w-md text-center">
        <HelloWorld msg="Vite + React + CRXJS" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Welcome to Lexiflow!</h2>
        <p className="text-gray-600 mb-4">
          Your news extension powered by modern web tech.
        </p>
        <div className="flex flex-col space-y-3">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors">
            Fetch Latest News
          </button>
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded transition-colors">
            Save Article
          </button>
        </div>
      </div>
      <button
        className="p-2 rounded hover:bg-gray-100 transition"
        title="Open Side Panel"
        onClick={() => {
          if (chrome?.sidePanel?.open) {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
              if (tabs[0]?.id) chrome.sidePanel.open({ tabId: tabs[0].id });
            });
          } else {
            alert("Side panel API not available in this browser.");
          }
        }}
      >
        {/* Side panel SVG icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="3" stroke="#6366f1" strokeWidth="2"/>
          <rect x="7" y="8" width="2" height="8" rx="1" fill="#6366f1"/>
          <rect x="11" y="8" width="2" height="8" rx="1" fill="#6366f1"/>
          <rect x="15" y="8" width="2" height="8" rx="1" fill="#6366f1"/>
        </svg>
      </button>
      <footer className="mt-8 text-white text-xs opacity-80">
        &copy; 2024 Lexiflow. All rights reserved.
      </footer>
    </div>
  )
}
