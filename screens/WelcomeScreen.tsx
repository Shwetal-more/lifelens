import React from 'react';

interface WelcomeScreenProps {
  onNavigate: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col justify-between items-center text-center p-8 bg-background">
      <div className="w-full pt-16">
         {/* Placeholder for a nice graphic in the future */}
      </div>
      <div className="flex-grow flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight text-primary">LifeLens</h1>
        <p className="text-lg text-secondary max-w-sm">
          Track your money, moods, and mindset.
        </p>
      </div>
      <div className="w-full pb-8">
        <button
          onClick={onNavigate}
          className="w-full bg-card text-primary font-bold py-4 px-8 rounded-2xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;