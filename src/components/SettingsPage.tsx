import { useState, useEffect } from 'react';
import GeneralSettings from './GeneralSettings';
import Integrations from './Integrations';
import GlossarySettings from './GlossarySettings';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(window.location.hash || '#general');

  useEffect(() => {
    const onHashChange = () => setActiveTab(window.location.hash || '#general');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case '#general':
        return <GeneralSettings />;
      case '#integrations':
        return <Integrations />;
      case '#glossary':
        return <GlossarySettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white p-4 border-r">
        <div className="flex items-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-full w-30 mr-2" />
        </div>
        <nav className="space-y-2">
          <button 
            onClick={() => {
              setActiveTab('#general');
              window.location.hash = '#general';
            }}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === '#general' ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            General Settings
          </button>
          <button 
            onClick={() => {
              setActiveTab('#integrations');
              window.location.hash = '#integrations';
            }}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === '#integrations' ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Integrations
          </button>
          <button 
            onClick={() => {
              setActiveTab('#glossary');
              window.location.hash = '#glossary';
            }}
            className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium ${activeTab === '#glossary' ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Glossary
          </button>
        </nav>
      </div>
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default SettingsPage;
