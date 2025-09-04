import React from 'react';
import { FinancialGoal } from '../types';

interface VaultRevealedScreenProps {
  goal: FinancialGoal;
  message: string;
  onDone: () => void;
}

const VaultRevealedScreen: React.FC<VaultRevealedScreenProps> = ({ goal, message, onDone }) => {
  return (
    <div className="p-4 pt-8 h-full flex flex-col justify-center items-center text-center bg-gradient-to-b from-primary to-slate-800">
      <div className="text-6xl mb-4 animate-bounce">🎉</div>
      <h1 className="text-3xl font-bold text-white mb-2">The Aevum Vault is Open!</h1>
      <p className="text-accent text-xl font-semibold mb-8">You achieved your goal: "{goal.name}"!</p>
      
      <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-full max-w-sm animate-fade-in">
        <h2 className="text-lg font-bold text-primary mb-2">A Message From Your Past Self...</h2>
        <p className="text-secondary text-lg italic my-4">"{message}"</p>
      </div>
      
      <button
        onClick={onDone}
        className="mt-12 bg-accent text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-1 transition-all"
      >
        Continue Your Journey
      </button>
       <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
            animation-delay: 0.5s;
            opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default VaultRevealedScreen;