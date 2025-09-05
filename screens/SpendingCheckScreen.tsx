
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, FinancialGoal, NotificationType, Screen } from '../types';
import { getSpendingNudge } from '../services/geminiService';

interface SpendingCheckScreenProps {
  userProfile: UserProfile | null;
  goals: FinancialGoal[];
  onNavigate: (screen: Screen) => void;
  onPrepareExpense: (data: { amount: string, category: string }) => void;
  addNotification: (message: string, type: NotificationType) => void;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
};

const SpendingCheckScreen: React.FC<SpendingCheckScreenProps> = ({ userProfile, goals, onNavigate, onPrepareExpense, addNotification }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiNudge, setAiNudge] = useState<string | null>(null);
  
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  const handleGetInsight = useCallback(async () => {
    if (!amount || !category || !userProfile) {
      addNotification('Please fill in both amount and category.', 'warning');
      return;
    }
    if (isLoading || aiNudge) return; // Prevent multiple calls

    setIsLoading(true);
    const nudge = await getSpendingNudge(parseFloat(amount), category, userProfile, goals);
    setAiNudge(nudge);
    setIsLoading(false);
  }, [amount, category, userProfile, goals, addNotification, isLoading, aiNudge]);

  useEffect(() => {
    const triggerAutomaticNudge = () => {
      if (!userProfile || !amount || !category) return;
      
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) return;

      const lowerCaseCategory = category.toLowerCase().trim();
      let ruleMet = false;

      // Rule 1: Hotel or Subway
      if (['hotel', 'subway'].some(c => lowerCaseCategory.includes(c))) {
        ruleMet = true;
      }
      
      // Rule 2: General store over 100 INR
      if (userProfile.currency === 'INR' && lowerCaseCategory.includes('general') && numericAmount > 100) {
        ruleMet = true;
      }

      if (ruleMet) {
        handleGetInsight();
      }
    };

    // Debounce to avoid firing on every keystroke
    const handler = setTimeout(() => {
      triggerAutomaticNudge();
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [amount, category, userProfile, handleGetInsight]);

  const handleReconsider = () => {
    addNotification("Great choice! Every mindful decision counts.", 'success');
    onNavigate(Screen.Home);
  };

  const handleLogExpense = () => {
    onPrepareExpense({ amount, category });
  };

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">Mindful Spend Check</h1>
      <p className="text-secondary text-center mb-8">A quick pause before you purchase.</p>

      {!aiNudge ? (
        <div className="space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-secondary mb-1 ml-2">Amount</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-gray-500 sm:text-lg">{currencySymbol}</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${inputStyles} pl-8`}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-secondary mb-1 ml-2">Category</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputStyles}
              placeholder="e.g., Hotel, Groceries, Subway"
              required
            />
          </div>
          <div className="pt-4">
            <button
              onClick={handleGetInsight}
              disabled={isLoading}
              className="w-full bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all"
            >
              {isLoading ? 'Thinking...' : 'Get Insight'}
            </button>
             <button onClick={() => onNavigate(Screen.Home)} className="w-full text-secondary font-bold py-3 px-5 rounded-xl hover:bg-gray-100 mt-2">
                Cancel
             </button>
          </div>
        </div>
      ) : (
        <div className="text-center p-4 bg-card rounded-2xl shadow-card animate-fade-in">
            <h2 className="text-lg font-bold text-primary mb-2">Kai's Nudge...</h2>
            <p className="text-secondary text-xl italic my-6">"{aiNudge}"</p>
            <div className="flex flex-col space-y-3 mt-8">
               <button onClick={handleLogExpense} className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90">
                Log this Expense
              </button>
              <button onClick={handleReconsider} className="font-bold py-3 px-6 rounded-xl hover:bg-gray-100 text-secondary">
                I'll reconsider
              </button>
            </div>
        </div>
      )}
       <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SpendingCheckScreen;
