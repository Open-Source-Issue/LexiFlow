import React from 'react';
import './FullPageTranslationPopup.css';

const FullPageTranslationPopup = () => {
  const handleTranslate = () => {
    chrome.runtime.sendMessage({ action: 'translateFullPage' });
  };

  return (
    <div className="lexiflow-popup">
      <p>Translate this page?</p>
      <button onClick={handleTranslate}>Translate</button>
    </div>
  );
};

export default FullPageTranslationPopup;