

import React, { useState, useEffect } from 'react';
import { Expense, MoodType, UserProfile, FinancialGoal, NotificationType } from '../types';
import { getEmotionalSpendingInsight, getMindfulSpendingPrompt, getPostPurchaseReassurance } from '../services/geminiService';

interface AddExpenseScreenProps {
  userProfile: UserProfile | null;
  onSave: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  expenseToEdit?: Expense | null;
  expenses: Expense[];
  goals: FinancialGoal[];
  addNotification: (message: string, type: NotificationType) => void;
  pendingData?: { amount: string, category: string } | null;
  onClearPendingData: () => void;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
};

const moodEmojis: Record<MoodType, string> = {
  [MoodType.Happy]: '😊',
  [MoodType.Sad]: '😢',
  [MoodType.Stressed]: '😥',
  [MoodType.Excited]: '🤩',
  [MoodType.Neutral]: '😐',
  [MoodType.Anxious]: '😟',
};

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ userProfile, onSave, onCancel, onDelete, expenseToEdit, expenses, goals, addNotification, pendingData, onClearPendingData }) => {
  const isEditMode = !!expenseToEdit;
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [occasion, setOccasion] = useState('');
  const [emotion, setEmotion] = useState<MoodType>(MoodType.Neutral);
  const [isUseful, setIsUseful] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [mindfulPrompt, setMindfulPrompt] = useState<string | null>(null);
  const [pendingExpense, setPendingExpense] = useState<Omit<Expense, 'id' | 'date'> | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [isShowingInsight, setIsShowingInsight] = useState(false);

  useEffect(() => {
    if (isEditMode && expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setOccasion(expenseToEdit.occasion);
      setEmotion(expenseToEdit.emotion);
      setIsUseful(expenseToEdit.isUseful);
    }
  }, [isEditMode, expenseToEdit]);
  
  useEffect(() => {
    if(pendingData && !isEditMode) {
      setAmount(pendingData.amount);
      setCategory(pendingData.category);
      onClearPendingData();
    }
  }, [pendingData, isEditMode, onClearPendingData]);

  // FIX: Replaced comma with pipe in Omit type to correctly form a union of keys.
  const processAndShowInsight = async (expenseData: Omit<Expense, 'id' | 'date'>) => {
    setIsLoading(true);
    const insight = await getEmotionalSpendingInsight(expenseData, expenses);
    setAiInsight(insight);
    setIsShowingInsight(true);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      amount: parseFloat(amount),
      category,
      occasion,
      emotion,
      isUseful,
    };
    if (!expenseData.amount || !expenseData.category) return;
    
    setPendingExpense(expenseData);

    if (isEditMode) {
        onSave(expenseData);
        return;
    }

    if (!isUseful) {
      setIsLoading(true);
      const prompt = await getMindfulSpendingPrompt(expenseData, goals);
      setMindfulPrompt(prompt);
      setIsLoading(false);
      return; 
    }
    
    await processAndShowInsight(expenseData);
  };

  const handleDelete = () => {
    if (isEditMode && expenseToEdit && window.confirm('Are you sure you want to delete this expense?')) {
        onDelete(expenseToEdit.id);
    }
  }

  const handleConfirmMindfulExpense = async () => {
    if (pendingExpense) {
      setMindfulPrompt(null);
      await processAndShowInsight(pendingExpense);
    }
  };

  const handleCancelMindfulExpense = () => {
    setMindfulPrompt(null);
    setPendingExpense(null);
  };

  const handleFinalizeSave = () => {
    if (pendingExpense) {
      if (!pendingExpense.isUseful) {
        getPostPurchaseReassurance(pendingExpense, goals.length > 0 ? goals[0] : null)
          .then(reassurance => addNotification(reassurance, 'info'));
      }
      onSave(pendingExpense);
    }
  };
  
  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  return (
    <div className="p-4 pt-8">
      {mindfulPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 shadow-xl text-center max-w-sm animate-fade-in">
            <h2 className="text-lg font-bold text-primary mb-2">A quick reflection...</h2>
            <p className="text-secondary text-lg italic mb-6">"{mindfulPrompt}"</p>
            <div className="flex justify-center space-x-4">
              <button onClick={handleCancelMindfulExpense} className="font-bold py-3 px-6 rounded-xl hover:bg-gray-100 text-secondary">
                Maybe not
              </button>
              <button onClick={handleConfirmMindfulExpense} className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90">
                Log it anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-primary mb-8 text-center">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h1>
      
      {isShowingInsight ? (
        <div className="flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-xl font-bold text-primary mb-4">A Mindful Moment</h2>
            <p className="text-secondary mb-2">Here's a reflection on your entry:</p>
            <div className="bg-background p-4 rounded-xl min-h-[6rem] flex items-center justify-center w-full">
              <p className="text-xl font-semibold text-primary italic">"{aiInsight}"</p>
            </div>
            <button onClick={handleFinalizeSave} className="mt-8 w-full max-w-xs bg-accent text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-1 transition-all">
                Continue
            </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="e.g., Food, Shopping"
              required
            />
          </div>
           <div>
            <label htmlFor="occasion" className="block text-sm font-medium text-secondary mb-1 ml-2">Occasion</label>
            <input
              type="text"
              id="occasion"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className={inputStyles}
              placeholder="e.g., Dinner with friends"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2 ml-2">How were you feeling?</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
               {Object.entries(moodEmojis).map(([moodKey, emoji]) => (
                  <button
                    type="button"
                    key={moodKey}
                    onClick={() => setEmotion(moodKey as MoodType)}
                    className={`flex flex-col items-center justify-center p-2 bg-card rounded-2xl shadow-card transition-all transform hover:-translate-y-1 ${emotion === moodKey ? 'ring-2 ring-accent' : 'ring-2 ring-transparent'}`}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <span className="mt-1 text-xs font-semibold text-primary">{moodKey}</span>
                  </button>
               ))}
            </div>
          </div>
          <div className="flex items-center justify-between bg-card p-3 rounded-xl shadow-soft-inset">
            <label htmlFor="isUsefulToggle" className="font-medium text-secondary flex-grow cursor-pointer">
                {isUseful ? 'Essential Spending' : 'Indulgence'}
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                    type="checkbox" 
                    name="isUsefulToggle" 
                    id="isUsefulToggle" 
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    checked={isUseful}
                    onChange={() => setIsUseful(!isUseful)}
                />
                <label htmlFor="isUsefulToggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
        </div>

          <div className="flex items-center justify-between pt-6">
            <div>
              {isEditMode && (
                <button type="button" onClick={handleDelete} className="text-red-500 font-bold py-3 px-5 rounded-xl hover:bg-red-500/10">
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
                <button type="button" onClick={onCancel} className="text-secondary font-bold py-3 px-5 rounded-xl hover:bg-gray-100">
                Cancel
                </button>
                <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all"
                >
                {isLoading ? 'Thinking...' : (isEditMode ? 'Update' : 'Save')}
                </button>
            </div>
          </div>
        </form>
      )}
       <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #1DE9B6; /* accent */
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #1DE9B6; /* accent */
        }
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

export default AddExpenseScreen;