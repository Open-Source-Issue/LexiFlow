import ToggleSwitch from "../context/ToggleSwitch";
import { useEffect, useState } from "react";
import { languages } from "../utils/languages";
import { useLexiFlowSettings } from "../context/LexiFlowSettingsContext";

const GeneralSettings = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState("translator");
  const [showAutoTranslateList, setShowAutoTranslateList] = useState(false);
  const [autoTranslateLanguages, setAutoTranslateLanguages] = useState<
    string[]
  >([]);
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
    clickIcon,
    setClickIcon,
    rightClick,
    setRightClick,
    shortcut,
    setShortcut,
    loading,
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    improveLang,
    setImproveLang,
    fullPageTargetLang,
    setFullPageTargetLang,
    showFullPagePopup,
    setShowFullPagePopup,
    autoCloseSidePanel,
    setAutoCloseSidePanel,
    excludedSites,
    setExcludedSites,
    excludedLanguages,
    setExcludedLanguages,
  } = useLexiFlowSettings();

  const [showLanguageList, setShowLanguageList] = useState(false);

  const handleAddSite = (site: string) => {
    if (site && !excludedSites.includes(site)) {
      setExcludedSites([...excludedSites, site]);
    }
  };

  const handleRemoveSite = (site: string) => {
    setExcludedSites(excludedSites.filter((s) => s !== site));
  };

  const handleAddLanguage = (langCode: string) => {
    if (!excludedLanguages.includes(langCode)) {
      setExcludedLanguages([...excludedLanguages, langCode]);
    }
    setShowLanguageList(false);
  };

  const handleRemoveLanguage = (langCode: string) => {
    setExcludedLanguages(excludedLanguages.filter((l) => l !== langCode));
  };

  useEffect(() => {
    console.log("Target language changed to:", targetLang);
  }, [targetLang]);

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
          <div className="space-y-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Translate your writing from
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
                  label="Enable or Disable the Floating Icon Feature"
                  disabled={loading}
                  settingKey="popupOnSelect"
                />
              </div>

              <div className="flex items-center">
                <ToggleSwitch
                  checked={rightClick}
                  onChange={setRightClick}
                  label="Enable or Disable Sidepanel Right-Click Translation"
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
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        Ctrl
                      </span>{" "}
                      +{" "}
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        Shift
                      </span>{" "}
                      + <span className="bg-gray-200 px-2 py-1 rounded">Q</span>
                    </span>
                  }
                  disabled={loading}
                  settingKey="shortcutPopup"
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
                    xmlns=" http://www.w3.org/2000/svg "
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
                onChange={(val: boolean) =>
                  handleToggle("alwaysShowReading", val)
                }
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
                onChange={(val: boolean) =>
                  handleToggle("alwaysShowWriting", val)
                }
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
                value={fullPageTargetLang}
                onChange={(e) => setFullPageTargetLang(e.target.value)}
                disabled={loading}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <ToggleSwitch
                checked={showFullPagePopup}
                onChange={setShowFullPagePopup}
                label="Show full-page translation pop-up"
                disabled={loading}
              />
              <ToggleSwitch
                checked={autoCloseSidePanel}
                onChange={setAutoCloseSidePanel}
                label="Auto-close side panel after translation"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Never show the pop-up on these sites
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="e.g., github.com"
                  className="w-1/3 p-2 border border-gray-300 rounded-md"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddSite(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {excludedSites.map((site) => (
                  <div
                    key={site}
                    className="bg-gray-200 px-2 py-1 rounded-full flex items-center"
                  >
                    <span>{site}</span>
                    <button
                      onClick={() => handleRemoveSite(site)}
                      className="ml-2 text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Never show the pop-up for these languages
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageList(!showLanguageList)}
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-left flex justify-between items-center"
                >
                  Add a language
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
                  <div className="absolute z-10 mt-1 w-1/3 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {languages.map((lang) => (
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
              <div className="flex flex-wrap gap-2 mt-2">
                {excludedLanguages.map((langCode) => (
                  <div
                    key={langCode}
                    className="bg-gray-200 px-2 py-1 rounded-full flex items-center"
                  >
                    <span>
                      {languages.find((l) => l.code === langCode)?.name}
                    </span>
                    <button
                      onClick={() => handleRemoveLanguage(langCode)}
                      className="ml-2 text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
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
                  className="w-1/3 p-2 border border-gray-300 rounded-md text-left flex justify-between items-center"
                >
                  Add a language
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
                  <div className="absolute z-10 mt-1 w-1/3 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                      {languages.map((lang) => (
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
              <div className="flex flex-wrap gap-2 mt-2">
                {autoTranslateLanguages.map((langCode) => (
                  <div
                    key={langCode}
                    className="bg-gray-200 px-2 py-1 rounded-full flex items-center"
                  >
                    <span>
                      {languages.find((l) => l.code === langCode)?.name}
                    </span>
                    <button
                      onClick={() => handleAutoRemoveLanguage(langCode)}
                      className="ml-2 text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setExcludedSites([]);
                setExcludedLanguages([]);
                setAutoTranslateLanguages([]);
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Reset all
            </button>
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
