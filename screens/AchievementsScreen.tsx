import React from 'react';
import { Badge } from '../types';

interface AchievementsScreenProps {
  badges: Badge[];
  onBack: () => void;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ badges, onBack }) => {
  return (
    <div className="p-4 pt-8">
      <div className="flex items-center mb-8 relative justify-center">
        <button onClick={onBack} className="absolute left-0 text-primary bg-card p-2 rounded-full shadow-card" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
        <h1 className="text-3xl font-bold text-primary">Achievements</h1>
      </div>

      <div className="space-y-4">
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`p-4 rounded-2xl border flex items-center space-x-4 transition-all duration-300 ${
              badge.unlocked
                ? 'bg-card shadow-card border-white'
                : 'bg-white-soft'
            }`}
          >
            <div className={`text-5xl transition-all duration-500 ${!badge.unlocked ? 'grayscale filter opacity-40' : ''}`}>
              🏆
            </div>
            <div className="flex-grow">
              <h2 className={`font-bold ${badge.unlocked ? 'text-primary' : 'text-gray-500'}`}>
                {badge.name}
              </h2>
              <p className={`text-sm ${badge.unlocked ? 'text-secondary' : 'text-gray-400'}`}>
                {badge.description}
              </p>
              {badge.unlocked && badge.date && (
                <p className="text-xs text-accent-dark font-semibold mt-1">
                  Unlocked on {badge.date}
                </p>
              )}
            </div>
            {!badge.unlocked && (
              <div className="text-4xl text-gray-300">
                🔒
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsScreen;
