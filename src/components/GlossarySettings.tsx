import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/chrome-extension'

const GlossarySettings = () => {
  return (
    <div className="p-6 bg-white w-full text-center">
      <h2 className="text-2xl font-normal mb-4">Glossary</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        Do you want to set rules for translating your key words and phrases? Try the Glossary for <span className="font-bold">free</span> for 30 days with a LexiFlow Pro trial plan.
      </p>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="bg-pink-600 text-white font-bold py-2 px-6 rounded hover:bg-pink-700 transition-colors">
            Log in to try it free
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">You're signed in</span>
            <UserButton />
          </div>
          <button 
            onClick={() => {
              // Navigate to dashboard in sidepanel
              chrome.runtime.sendMessage({ action: 'openDashboard' });
            }}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Go to Dashboard →
          </button>
        </div>
      </SignedIn>
    </div>
  );
};

export default GlossarySettings;
