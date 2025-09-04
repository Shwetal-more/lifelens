
import React, { useState } from 'react';

interface SetVaultWishScreenProps {
  pendingGoalName: string;
  onSaveWish: (message: string) => void;
  onCancel: () => void;
}

const SetVaultWishScreen: React.FC<SetVaultWishScreenProps> = ({ pendingGoalName, onSaveWish, onCancel }) => {
  const [message, setMessage] = useState('');

  const handleSave = () => {
    if (message.trim()) {
      onSaveWish(message);
    } else {
        alert("Please write a message to your future self!");
    }
  };

  return (
    <div className="p-4 pt-8 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">Seal the Vault</h1>
      <p className="text-secondary text-center mb-8">You've set a goal for <span className="font-bold text-primary">{pendingGoalName}</span>. What message will you read when you achieve it?</p>
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full flex-grow p-4 bg-card border-none rounded-2xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
        placeholder="Dear Future Me, I'm so proud of us for achieving this..."
      />
      
      <div className="flex items-center justify-end space-x-2 mt-6">
        <button onClick={onCancel} className="text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-100">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
        >
          Seal the Vault
        </button>
      </div>
    </div>
  );
};

export default SetVaultWishScreen;
