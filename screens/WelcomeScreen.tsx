
import React from 'react';

interface WelcomeScreenProps {
  onNavigate: () => void;
}

const PrivacyIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm-1.5 6.036a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 1.5 0v2.25Z" />
    </svg>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col justify-between items-center text-center p-8 bg-background">
      <div className="w-full pt-16">
         <PrivacyIcon className="w-24 h-24 text-accent mx-auto" />
      </div>
      <div className="flex-grow flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight text-primary">Your Lens, Your Data.</h1>
        <p className="text-lg text-secondary max-w-sm">
          LifeLens is a private, device-only experience. All your financial and mood data stays securely on this device and is never sent to a server.
        </p>
      </div>
      <div className="w-full pb-8">
        <button
          onClick={onNavigate}
          className="w-full bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
        >
          Begin Your Private Journey
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
