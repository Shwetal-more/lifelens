import React, { useState } from 'react';

interface NotesScreenProps {
  onSave: (content: string) => void;
  onCancel: () => void;
}

const NotesScreen: React.FC<NotesScreenProps> = ({ onSave, onCancel }) => {
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">Add a Note</h1>
      <p className="text-secondary text-center mb-8">A space for your thoughts, reflections, and ideas.</p>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 p-4 bg-card border-none rounded-2xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
        placeholder="What's on your mind?"
      />
      
      <div className="flex items-center justify-end space-x-2 mt-6">
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

export default NotesScreen;
