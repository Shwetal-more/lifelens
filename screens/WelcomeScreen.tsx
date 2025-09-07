import React from 'react';

const LogoIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1ABC9C" /> 
                <stop offset="100%" stopColor="#2C3E50" />
            </linearGradient>
            <clipPath id="apertureClip">
                <path d="M50,50 L95,50 A45,45 0 0,0 50,5 Z"></path>
            </clipPath>
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="url(#logoGradient)" strokeWidth="3" opacity="0.5" />
        <g className="aperture-blades">
            {[0, 60, 120, 180, 240, 300].map(angle => (
                 <circle key={angle} cx="50" cy="50" r="45" fill="url(#logoGradient)" clipPath="url(#apertureClip)" transform={`rotate(${angle}, 50, 50)`} />
            ))}
        </g>
        <circle cx="50" cy="50" r="10" fill="#2C3E50" />
    </svg>
);

interface WelcomeScreenProps {
  onNavigate: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col justify-between items-center text-center p-8 bg-background overflow-hidden">
        <style>{`
            @keyframes aperture-open {
                0%, 100% { transform: scale(0.2) rotate(90deg); }
                50% { transform: scale(1) rotate(0deg); }
            }
            .aperture-blades {
                animation: aperture-open 5s ease-in-out infinite;
                transform-origin: 50% 50%;
            }
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 1s ease-out forwards;
            }
        `}</style>
      <div className="w-full pt-16 flex justify-center items-center">
         <LogoIcon className="w-32 h-32" />
      </div>
      <div className="flex-grow flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold mb-4 tracking-tight text-primary animate-fade-in-up" style={{ animationDelay: '200ms' }}>LifeLens</h1>
        <p className="text-lg text-secondary max-w-sm animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          Track your money, moods, and mindset.
        </p>
      </div>
      <div className="w-full pb-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <button
          onClick={onNavigate}
          className="w-full bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
