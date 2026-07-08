import { useEffect, useState } from "react";

const ApiSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get("genai_api_key", (result) => {
      if (result.genai_api_key) {
        setApiKey(result.genai_api_key as string);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ genai_api_key: apiKey }, () => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    });
  };

  return (
    <div className="p-6 bg-white w-full">
      <h2 className="text-2xl font-normal mb-6">API & Security</h2>
      
      <div className="space-y-6 max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-4 mb-6 text-sm">
          <p className="font-semibold mb-1">Bring Your Own Key (BYOK)</p>
          <p>
            To use Lexiflow, you must provide your own Google Gemini API key. 
            This key is stored securely in your browser's local storage and is never sent to our servers.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded-md outline-0 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            placeholder="AIzaSy..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">
            You can get a free API key from Google AI Studio.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handleSave}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-md font-medium text-sm transition"
          >
            Save Key
          </button>
          {isSaved && (
            <span className="text-green-600 text-sm font-medium flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
