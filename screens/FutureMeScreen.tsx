import React, { useState } from 'react';
import { getAffirmation } from '../services/geminiService';

interface AevumVaultScreenProps {
  onSave: (content: string) => void;
  onCancel: () => void;
}

const AevumVaultScreen: React.FC<AevumVaultScreenProps> = ({ onSave, onCancel }) => {
  const [message, setMessage] = useState('');
  const [isLoadingAffirmation, setIsLoadingAffirmation] = useState(false);

  const handleSave = () => {
    if (message.trim()) {
      onSave(message);
    }
  };

  const handleGetAffirmation = async () => {
    setIsLoadingAffirmation(true);
    const affirmation = await getAffirmation();
    setMessage(prev => prev ? `${prev}\n\n${affirmation}` : affirmation);
    setIsLoadingAffirmation(false);
  };

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">Message for the Aevum Vault</h1>
      <p className="text-secondary text-center mb-8">What hopes, dreams, or advice do you want to seal away?</p>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-64 p-4 bg-card border-none rounded-2xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
        placeholder="Dear Future Me..."
      />
      
      <div className="mt-6">
         <button
          onClick={handleGetAffirmation}
          disabled={isLoadingAffirmation}
          className="w-full bg-card text-accent-dark font-bold py-4 px-4 rounded-2xl shadow-card hover:shadow-lg disabled:bg-gray-100 disabled:text-secondary transform hover:-translate-y-0.5 transition-all"
        >
          {isLoadingAffirmation ? 'Generating...' : '✨ Suggest a Positive Mantra'}
        </button>
      </div>

      <div className="flex items-center justify-end space-x-2 mt-4">
        <button onClick={onCancel} className="text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-100">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
        >
          Save Note
        </button>
      </div>
    </div>
  );
};

export default AevumVaultScreen;
