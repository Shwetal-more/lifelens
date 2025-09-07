import React from 'react';
import { FinancialGoal, Screen, UserProfile } from '../types';

interface FinancialGoalsScreenProps {
  goals: FinancialGoal[];
  onNavigate: (screen: Screen) => void;
  userProfile: UserProfile | null;
}

const VaultIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
};

const FinancialGoalsScreen: React.FC<FinancialGoalsScreenProps> = ({ goals, onNavigate, userProfile }) => {
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';

  const calculateProgress = (saved: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min((saved / target) * 100, 100);
  };
    
  return (
    <div className="p-4 pt-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Financial Goals</h1>
        <p className="text-secondary mt-1">Plan and track your journey to your dreams.</p>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center bg-card p-8 rounded-2xl shadow-card">
            <VaultIcon className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary">The Aevum Vault Awaits</h2>
            <p className="text-secondary mt-2 mb-6">Your first goal is your "North Star." Seal it in the vault with a message for your future self. When you achieve it, the vault will open, revealing your words of encouragement.</p>
            <button
              id="tutorial-forge-north-star"
              onClick={() => onNavigate(Screen.AddFinancialGoal)}
              className="bg-accent text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-0.5 transition-all"
            >
              Forge Your North Star
            </button>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="bg-card p-4 rounded-2xl shadow-card">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-4xl">{goal.icon}</span>
                <div>
                  <h2 className="font-bold text-lg text-primary">{goal.name}</h2>
                  <p className="text-sm text-secondary font-semibold">{currencySymbol}{goal.savedAmount.toLocaleString()} / <span className="text-accent-dark">{currencySymbol}{goal.targetAmount.toLocaleString()}</span></p>
                </div>
              </div>
              <div className="w-full bg-background rounded-full h-4">
                <div 
                  className="bg-accent h-4 rounded-full transition-all duration-500" 
                  style={{ width: `${calculateProgress(goal.savedAmount, goal.targetAmount)}%` }}
                ></div>
              </div>
              <p className="text-xs text-right mt-1 text-secondary">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      {goals.length > 0 && (
         <div className="mt-8">
            <button
              onClick={() => onNavigate(Screen.AddFinancialGoal)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
            >
                <PlusIcon className="w-5 h-5" />
                <span>Add New Goal</span>
            </button>
        </div>
      )}
    </div>
  );
};

export default FinancialGoalsScreen;
