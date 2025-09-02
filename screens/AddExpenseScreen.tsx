import React, { useState, useEffect } from 'react';
import { Expense, MoodType, UserProfile } from '../types';
import { getExpenseAdvice } from '../services/geminiService';

interface AddExpenseScreenProps {
  userProfile: UserProfile | null;
  onSave: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  expenseToEdit?: Expense | null;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
};


const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ userProfile, onSave, onCancel, onDelete, expenseToEdit }) => {
  const isEditMode = !!expenseToEdit;
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [occasion, setOccasion] = useState('');
  const [emotion, setEmotion] = useState<MoodType>(MoodType.Neutral);
  const [isUseful, setIsUseful] = useState(true);
  const [aiAdvice, setAiAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setOccasion(expenseToEdit.occasion);
      setEmotion(expenseToEdit.emotion);
      setIsUseful(expenseToEdit.isUseful);
    }
  }, [isEditMode, expenseToEdit]);

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
    
    if (isEditMode) {
        onSave(expenseData);
        return;
    }

    setIsLoading(true);
    const advice = await getExpenseAdvice(expenseData);
    setAiAdvice(advice);
    setIsLoading(false);

    setTimeout(() => {
        onSave(expenseData);
    }, 3000);
  };

  const handleDelete = () => {
    if (isEditMode && expenseToEdit && window.confirm('Are you sure you want to delete this expense?')) {
        onDelete(expenseToEdit.id);
    }
  }
  
  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h1>
      
      {aiAdvice ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-secondary mb-2">Your LifeLens Guide says:</p>
            <p className="text-2xl font-semibold text-primary italic">"{aiAdvice}"</p>
            <p className="text-sm text-secondary mt-6 animate-pulse">Saving your expense...</p>
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
            <label htmlFor="emotion" className="block text-sm font-medium text-secondary mb-1 ml-2">How were you feeling?</label>
            <select
              id="emotion"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value as MoodType)}
              className={`${inputStyles} appearance-none`}
            >
              {Object.values(MoodType).map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
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
      `}</style>
    </div>
  );
};

export default AddExpenseScreen;