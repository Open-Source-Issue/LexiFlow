import React, { createContext, useContext, useEffect, useState } from "react";

interface LexiFlowSettingsContextProps {
  clickIcon: boolean;
  setClickIcon: (val: boolean) => void;
  rightClick: boolean;
  setRightClick: (val: boolean) => void;
  shortcut: boolean;
  setShortcut: (val: boolean) => void;
  loading: boolean;
  sourceLang: string;
  setSourceLang: (val: string) => void;
  targetLang: string;
  setTargetLang: (val: string) => void;
  improveLang: string;
  setImproveLang: (val: string) => void;

  // ✅ NEW: Generic feature toggles
  settings: Record<string, boolean>;
  updateSetting: (key: string, value: boolean) => void;
}

const LexiFlowSettingsContext = createContext<LexiFlowSettingsContextProps>({
  clickIcon: true,
  setClickIcon: () => {},
  rightClick: true,
  setRightClick: () => {},
  shortcut: true,
  setShortcut: () => {},
  loading: true,
  sourceLang: "en",
  setSourceLang: () => {},
  targetLang: "en",
  setTargetLang: () => {},
  improveLang: "en",
  setImproveLang: () => {},

  // ✅ NEW defaults
  settings: {},
  updateSetting: () => {},
});

export const LexiFlowSettingsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [clickIcon, setClickIconState] = useState(true);
  const [rightClick, setRightClickState] = useState(true);
  const [shortcut, setShortcutState] = useState(true);
  const [sourceLang, setSourceLangState] = useState("en");
  const [targetLang, setTargetLangState] = useState("en");
  const [improveLang, setImproveLangState] = useState("en");

  const [loading, setLoading] = useState(true);

  // ✅ NEW: feature toggles (for toggle switches in popup/options)
  const [settings, setSettings] = useState<Record<string, boolean>>({
    popupOnSelect: true, // selection-based popup
    sidePanelOnRightClick: true, // right-click sidepanel
    shortcutPopup: true, // 👈 NEW toggle for Ctrl+Shift+Y popup
  });

  // Debug: log state changes
  useEffect(() => {
    console.log("LexiFlowSettingsContext state:", { targetLang, settings });
  }, [targetLang, settings]);

  // Load all settings from chrome.storage on mount
  useEffect(() => {
    chrome.storage.sync.get(
      [
        "clickIcon",
        "rightClick",
        "shortcut",
        "sourceLang",
        "targetLang",
        "improveLang",
        "settings", // ✅ new
      ],
      (result) => {
        if (typeof result.clickIcon === "boolean")
          setClickIconState(result.clickIcon);
        if (typeof result.rightClick === "boolean")
          setRightClickState(result.rightClick);
        if (typeof result.shortcut === "boolean")
          setShortcutState(result.shortcut);
        if (typeof result.sourceLang === "string")
          setSourceLangState(result.sourceLang);
        if (typeof result.targetLang === "string")
          setTargetLangState(result.targetLang);
        if (typeof result.improveLang === "string")
          setImproveLangState(result.improveLang);

        // ✅ restore feature toggles
        if (result.settings && typeof result.settings === "object") {
          setSettings(result.settings);
        }

        setLoading(false);
      }
    );
  }, []);

  // Listen for changes from other extension parts (keep in sync)
  useEffect(() => {
    function handleStorageChange(changes: any, area: string) {
      if (area === "sync") {
        if (changes.clickIcon) setClickIconState(changes.clickIcon.newValue);
        if (changes.rightClick) setRightClickState(changes.rightClick.newValue);
        if (changes.shortcut) setShortcutState(changes.shortcut.newValue);
        if (changes.sourceLang) setSourceLangState(changes.sourceLang.newValue);
        if (changes.targetLang) setTargetLangState(changes.targetLang.newValue);
        if (changes.improveLang)
          setImproveLangState(changes.improveLang.newValue);

        // ✅ sync toggles
        if (changes.settings) setSettings(changes.settings.newValue);
      }
    }
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // Save to chrome.storage on change
  const setClickIcon = (val: boolean) => {
    setClickIconState(val);
    chrome.storage.sync.set({ clickIcon: val });
  };
  const setRightClick = (val: boolean) => {
    setRightClickState(val);
    chrome.storage.sync.set({ rightClick: val });
  };
  const setShortcut = (val: boolean) => {
    setShortcutState(val);
    chrome.storage.sync.set({ shortcut: val });
  };
  const setSourceLang = (val: string) => {
    setSourceLangState(val);
    chrome.storage.sync.set({ sourceLang: val });
  };
  const setTargetLang = (val: string) => {
    console.log("Setting targetLang to:", val);
    setTargetLangState(val);
    chrome.storage.sync.set({ targetLang: val });
  };
  const setImproveLang = (val: string) => {
    setImproveLangState(val);
    chrome.storage.sync.set({ improveLang: val });
  };

  // ✅ NEW: update feature toggles
  const updateSetting = (key: string, value: boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      chrome.storage.sync.set({ settings: newSettings });
      return newSettings;
    });
  };

  return (
    <LexiFlowSettingsContext.Provider
      value={{
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
        settings, // ✅ new
        updateSetting, // ✅ new
      }}
    >
      {children}
    </LexiFlowSettingsContext.Provider>
  );
};

export const useLexiFlowSettings = () => useContext(LexiFlowSettingsContext);
