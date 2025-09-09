import ToggleSwitch from "../context/ToggleSwitch";
import { useEffect, useState } from "react";
import { languages } from "../utils/languages";
import { useLexiFlowSettings } from "../context/LexiFlowSettingsContext";

const GeneralSettings = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("translator");
  const [showLanguageList, setShowLanguageList] = useState(false);
  const [excludedLanguages, setExcludedLanguages] = useState<string[]>([]);
  const [showAutoTranslateList, setShowAutoTranslateList] = useState(false);
  const [autoTranslateLanguages, setAutoTranslateLanguages] = useState<string[]>([]);
  const [windowPosition, setWindowPosition] = useState("Default position");
  const [showWindowPositionList, setShowWindowPositionList] = useState(false);
  const windowPositions = [
    "Default position",
    "Top",
    "Bottom",
    "Left",
    "Right",
  ];



  // Use LexiFlow context for global toggles and language
  const {
    clickIcon, setClickIcon,
    rightClick, setRightClick,
    shortcut, setShortcut,
    loading,
    sourceLang, setSourceLang,
    targetLang, setTargetLang,
    improveLang, setImproveLang,
  } = useLexiFlowSettings();



useEffect(()=> {
    console.log("Target language changed to:", targetLang);
},[targetLang])

  // Local fallback for other toggles
  const [toggles, setToggles] = useState({
    advancedMode: true,
    floatingIcon: true,
    alwaysShowReading: true,
    alwaysShowWriting: true,
    fullPagePopup: true,
    autoClosePanel: true,
  });
  
  const handleToggle = (key: keyof typeof toggles, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddLanguage = (langCode: string) => {
    if (!excludedLanguages.includes(langCode)) {
      setExcludedLanguages([...excludedLanguages, langCode]);
    }
    setShowLanguageList(false);
  };

  const handleRemoveLanguage = (langCode: string) => {
    setExcludedLanguages(excludedLanguages.filter((code) => code !== langCode));
  };

  const handleAutoAddLanguage = (langCode: string) => {
    if (!autoTranslateLanguages.includes(langCode)) {
      setAutoTranslateLanguages([...autoTranslateLanguages, langCode]);
    }
    setShowAutoTranslateList(false);
  };

  const handleAutoRemoveLanguage = (langCode: string) => {
    setAutoTranslateLanguages(
      autoTranslateLanguages.filter((code) => code !== langCode)
    );
  };

  const handleWindowPositionChange = (position: string) => {
    setWindowPosition(position);
    setShowWindowPositionList(false);
  };

  const renderSettingsContent = () => {
    switch (activeSettingsTab) {
      case "translator":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Translate selected text into
              </label>
              <select
                className="w-1/3 p-2 border border-gray-300 rounded-md outline-0"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Translate your writing into
              </label>
              <select
                className="w-1/3 p-2 border border-gray-300 rounded-md outline-0"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <ToggleSwitch
                  checked={clickIcon}
                  onChange={setClickIcon}
                  label="Click the LexiFlow icon"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center">
                <ToggleSwitch
                  checked={rightClick}
                  onChange={setRightClick}
                  label="Click right on your mouse"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center">
                <ToggleSwitch
                  checked={shortcut}
                  onChange={setShortcut}
                  label={
                    <span>
                      Use shortcut{" "}
                      <span className="bg-gray-200 px-2 py-1 rounded">Ctrl</span> +{" "}
                      <span className="bg-gray-200 px-2 py-1 rounded">Shift</span> +{" "}
                      <span className="bg-gray-200 px-2 py-1 rounded">Y</span>
                    </span>
                  }
                  disabled={loading}
                />
              </div>
              <button className="text-sm text-blue-600 hover:underline">
                Change your shortcut here
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjust window to
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setShowWindowPositionList(!showWindowPositionList)
                  }
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-left flex justify-between items-center"
                >
                  {windowPosition}
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showWindowPositionList && (
                  <div className="absolute z-10 mt-1 w-1/3 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {windowPositions.map((position) => (
                        <li
                          key={position}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleWindowPositionChange(position)}
                        >
                          {position}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "write":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Improve your writing in
              </label>
              <select
                className="w-1/3 p-2 border border-gray-300 rounded-md"
                value={improveLang}
                onChange={(e) => setImproveLang(e.target.value)}
                disabled={loading}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Show advanced mode window for on-page translation/improvement
                </h4>
              </div>
              <ToggleSwitch
                checked={toggles.advancedMode}
                onChange={(val: boolean) => handleToggle("advancedMode", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Show the LexiFlow floating icon
                </h4>
              </div>
              <ToggleSwitch
                checked={toggles.floatingIcon}
                onChange={(val: boolean) => handleToggle("floatingIcon", val)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Always show the LexiFlow icon for reading
                </h4>
                <p className="text-sm text-gray-500">
                  The icon shows up when you select text.
                </p>
              </div>
              <ToggleSwitch
                checked={toggles.alwaysShowReading}
                onChange={(val: boolean) => handleToggle("alwaysShowReading", val)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Never show the LexiFlow icon for reading on these sites
              </label>
              <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                localhost X
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Always show the LexiFlow icon for writing
                </h4>
                <p className="text-sm text-gray-500">
                  The icon shows up when you write text.
                </p>
              </div>
              <ToggleSwitch
                checked={toggles.alwaysShowWriting}
                onChange={(val: boolean) => handleToggle("alwaysShowWriting", val)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Never show the LexiFlow icon for writing on these sites
              </label>
              <div className="border border-gray-300 rounded-md p-2 flex items-center">
                <span className="text-gray-400 mr-2">i</span>
                <span className="text-gray-500">No sites added yet</span>
              </div>
            </div>
          </div>
        );
      case "full-page":
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Translate websites to
              </label>
              <select
                className="w-1/3 p-2 border border-gray-300 rounded-md"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={loading}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Show full-page translation pop-up
                </h4>
                <p className="text-sm text-gray-500">
                  The pop-up shown when it is possible to translate an entire
                  web page.
                </p>
              </div>
              <ToggleSwitch
                checked={toggles.fullPagePopup}
                onChange={(val: boolean) => handleToggle("fullPagePopup", val)}
              />
            </div>
            <div className="border border-gray-300 rounded-md p-4 flex items-center justify-around">
              <div className="w-1/3 h-12 bg-gray-200 border border-gray-300"></div>
              <div className="w-1/3 h-12 bg-gray-200 border border-gray-300"></div>
              <div className="w-1/3 h-12 bg-pink-600 border border-pink-700"></div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Auto-close the side panel after a web page is fully translated
                </h4>
              </div>
              <ToggleSwitch
                checked={toggles.autoClosePanel}
                onChange={(val: boolean) => handleToggle("autoClosePanel", val)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Never show the full-page translation pop-up on
              </label>
              <div className="border border-gray-300 rounded-md p-2 flex items-center">
                <span className="text-gray-400 mr-2">i</span>
                <span className="text-gray-500">No sites added yet</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Never show the full-page translation pop-up for these languages
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageList(!showLanguageList)}
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full text-left flex justify-between items-center"
                >
                  Add language
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showLanguageList && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {languages
                        .filter(
                          (lang) => !excludedLanguages.includes(lang.code)
                        )
                        .map((lang) => (
                          <li
                            key={lang.code}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleAddLanguage(lang.code)}
                          >
                            {lang.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {excludedLanguages.map((code) => {
                  const lang = languages.find((l) => l.code === code);
                  return (
                    <div
                      key={code}
                      className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {lang?.name}
                      <button
                        onClick={() => handleRemoveLanguage(code)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Reset full-page translation pop-up settings
              </h4>
              <button className="border border-gray-300 rounded-md px-4 py-2 text-sm">
                Reset all
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Always translate automatically from
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setShowAutoTranslateList(!showAutoTranslateList)
                  }
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm w-full text-left flex justify-between items-center"
                >
                  Add language
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showAutoTranslateList && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {languages
                        .filter(
                          (lang) => !autoTranslateLanguages.includes(lang.code)
                        )
                        .map((lang) => (
                          <li
                            key={lang.code}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleAutoAddLanguage(lang.code)}
                          >
                            {lang.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {autoTranslateLanguages.map((code) => {
                  const lang = languages.find((l) => l.code === code);
                  return (
                    <div
                      key={code}
                      className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {lang?.name}
                      <button
                        onClick={() => handleAutoRemoveLanguage(code)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white w-full">
      <h2 className="text-2xl font-normal mb-6">General Settings</h2>
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveSettingsTab("translator")}
          className={`py-2 px-4 text-sm font-medium ${
            activeSettingsTab === "translator"
              ? "border-b-2 border-pink-500 text-pink-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Translator
        </button>
        <button
          onClick={() => setActiveSettingsTab("write")}
          className={`py-2 px-4 text-sm font-medium ${
            activeSettingsTab === "write"
              ? "border-b-2 border-pink-500 text-pink-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setActiveSettingsTab("full-page")}
          className={`py-2 px-4 text-sm font-medium ${
            activeSettingsTab === "full-page"
              ? "border-b-2 border-pink-500 text-pink-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Full page translation
        </button>
      </div>
      {renderSettingsContent()}
    </div>
  );
};

export default GeneralSettings;
