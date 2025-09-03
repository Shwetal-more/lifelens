import React from 'react';
import { FinancialGoal, Screen, UserProfile } from '../types';

interface FinancialGoalsScreenProps {
  goals: FinancialGoal[];
  onNavigate: (screen: Screen) => void;
}

const PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const FinancialGoalsScreen: React.FC<FinancialGoalsScreenProps> = ({ goals, onNavigate }) => {

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
            <h2 className="text-xl font-semibold text-primary">No Goals Yet!</h2>
            <p className="text-secondary mt-2 mb-6">Let's set up your first financial goal and start saving for something amazing.</p>
            <button
              onClick={() => onNavigate(Screen.AddFinancialGoal)}
              className="bg-accent text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-0.5 transition-all"
            >
              Set First Goal
            </button>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className="bg-card p-4 rounded-2xl shadow-card">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-4xl">{goal.icon}</span>
                <div>
                  <h2 className="font-bold text-lg text-primary">{goal.name}</h2>
                  <p className="text-sm text-secondary font-semibold">${goal.savedAmount.toLocaleString()} / <span className="text-accent-dark">${goal.targetAmount.toLocaleString()}</span></p>
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
