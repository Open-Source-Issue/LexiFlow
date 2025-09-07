import { useState } from 'react';
import ToggleSwitch from '../utils/ToggleSwitch';

const Integrations = () => {
  const integrations = [
    { name: 'Gmail', description: 'Easily translate emails and improve your writing in seconds.', link: '#' },
    { name: 'Google Docs', description: 'Write clear, precise documents and translate them with ease.', link: '#' },
    { name: 'Google Slides', description: 'Create flawless decks in other languages to present your work with confidence.', link: '#' },
    { name: 'X (formerly Twitter)', description: 'Translate tweets you read and write on the fly.', link: '#' },
    { name: 'WhatsApp Web', description: 'Translate messages to communicate instantly across languages.', link: '#' },
    { name: 'LinkedIn', description: 'Make the best impression with potential employers and employees.', link: '#' },
    { name: 'YouTube', description: 'Translate video titles and descriptions to stay connected.', link: '#' },
  ];

  const [toggles, setToggles] = useState(Array(integrations.length).fill(true));

  const handleToggle = (idx: number, value: boolean) => {
    setToggles(prev => prev.map((v, i) => i === idx ? value : v));
  };

  return (
    <div className="p-6 bg-white w-full h-screen overflow-y-auto">
      <h2 className="text-2xl font-normal mb-6">Integrations</h2>
      <div className="space-y-6">
        {integrations.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
              <p className="text-sm text-gray-500">{item.description}</p>
              <a href={item.link} className="text-sm text-pink-600 hover:underline">Try it in {item.name} &rarr;</a>
            </div>
            <ToggleSwitch checked={toggles[index]} onChange={(val: boolean) => handleToggle(index, val)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Integrations;
