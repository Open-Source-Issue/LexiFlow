const GlossarySettings = () => {
  return (
    <div className="p-6 bg-white w-full text-center">
      <h2 className="text-2xl font-normal mb-4">Glossary</h2>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        Do you want to set rules for translating your key words and phrases? Try the Glossary for <span className="font-bold">free</span> for 30 days with a LexiFlow Pro trial plan.
      </p>
      <button className="bg-pink-600 text-white font-bold py-2 px-6 rounded hover:bg-pink-700 transition-colors">
        Try it for free
      </button>
      <p className="text-sm text-gray-600 mt-4">
        Already signed up to LexiFlow Pro? <a href="#" className="text-pink-600 hover:underline">Log in</a>
      </p>
    </div>
  );
};

export default GlossarySettings;
