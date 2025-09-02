import React, { useState } from 'react';
import { MoodType, MoodEntry } from '../types';
import { getMoodTip } from '../services/geminiService';

interface MoodTrackerScreenProps {
  moods: MoodEntry[];
  onSave: (moodData: { mood: MoodType, reason?: string }) => void;
  onCancel: () => void;
}

const moodEmojis: Record<MoodType, string> = {
  [MoodType.Happy]: '😊',
  [MoodType.Sad]: '😢',
  [MoodType.Stressed]: '😥',
  [MoodType.Excited]: '🤩',
  [MoodType.Neutral]: '😐',
  [MoodType.Anxious]: '😟',
};

const MoodButton: React.FC<{ mood: MoodType, onSelect: (mood: MoodType) => void }> = ({ mood, onSelect }) => (
    <button
        onClick={() => onSelect(mood)}
        className="flex flex-col items-center justify-center p-4 bg-card rounded-2xl shadow-card hover:shadow-lg transition-all transform hover:-translate-y-1"
    >
        <span className="text-5xl">{moodEmojis[mood]}</span>
        <span className="mt-2 font-semibold text-primary">{mood}</span>
    </button>
);


const MoodTrackerScreen: React.FC<MoodTrackerScreenProps> = ({ moods, onSave, onCancel }) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [reason, setReason] = useState('');
  const [aiTip, setAiTip] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSelectMood = async (mood: MoodType) => {
    setSelectedMood(mood);
    setIsLoading(true);
    const tip = await getMoodTip(mood);
    setAiTip(tip);
    setIsLoading(false);
  };
  
  const handleSave = () => {
    if (selectedMood) {
        setIsSaved(true);
        setTimeout(() => {
            onSave({ mood: selectedMood, reason });
        }, 1500);
    }
  }
  
  const inputStyles = "w-full h-28 p-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  if (isSaved && selectedMood) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
          <p className="text-6xl mb-4 animate-bounce">{moodEmojis[selectedMood]}</p>
          <p className="text-2xl font-semibold text-accent-dark">Mood successfully logged!</p>
      </div>
    );
  }

  if (selectedMood) {
      return (
        <div className="p-4 pt-8 flex flex-col items-center justify-start text-center h-full">
            <p className="text-7xl mb-4">{moodEmojis[selectedMood]}</p>
            <h2 className="text-2xl font-bold">You're feeling {selectedMood.toLowerCase()}</h2>
            
            <div className="w-full my-6 min-h-[6rem]">
              {isLoading && <p className="text-secondary animate-pulse">Generating a power-up for you...</p>}
              
              {aiTip && (
                  <div className="bg-card shadow-card p-3 rounded-2xl">
                      <p className="text-secondary text-sm mb-1">Power-Up:</p>
                      <p className="font-semibold text-primary text-lg italic">"{aiTip}"</p>
                  </div>
              )}
            </div>
            
            <div className="w-full my-4">
                 <label htmlFor="reason" className="block text-sm font-medium text-secondary text-left mb-2 ml-2">Why do you feel this way? (Optional)</label>
                <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className={inputStyles}
                    placeholder="e.g., Had a great meeting at work."
                />
            </div>
            
             <div className="flex items-center justify-center space-x-4 w-full mt-auto pb-4">
                <button onClick={() => setSelectedMood(null)} className="text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-100">
                    Back
                </button>
                <button onClick={handleSave} className="bg-accent text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-0.5 transition-all">
                    Save Mood
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">How are you feeling right now?</h1>
      <p className="text-secondary text-center mb-8">Select a mood to track it.</p>
      
      <div className="grid grid-cols-2 gap-5">
        {Object.values(MoodType).map(mood => (
          <MoodButton key={mood} mood={mood} onSelect={handleSelectMood} />
        ))}
      </div>
      
      <div className="mt-10 pb-16">
        <h2 className="text-xl font-bold text-primary mb-4">Recent Moods</h2>
        <div className="space-y-3">
            {moods.slice(-3).reverse().map(entry => (
                <div key={entry.id} className="bg-card p-4 rounded-2xl shadow-card">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-lg">{moodEmojis[entry.mood]} {entry.mood}</p>
                        <p className="text-xs text-secondary">{entry.date.toLocaleDateString()}</p>
                    </div>
                    {entry.reason && <p className="text-sm text-secondary mt-2 pl-1 italic">"{entry.reason}"</p>}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default MoodTrackerScreen;