import React, { useState } from 'react';
import { Income, UserProfile } from '../types';

interface AddIncomeScreenProps {
  onSave: (income: Omit<Income, 'id' | 'date'>) => void;
  onCancel: () => void;
  userProfile: UserProfile | null;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
};

const AddIncomeScreen: React.FC<AddIncomeScreenProps> = ({ onSave, onCancel, userProfile }) => {
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source) {
      alert('Please fill in all fields.');
      return;
    }
    onSave({
      amount: parseFloat(amount),
      source,
    });
  };

  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Add Income</h1>
      
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
          <label htmlFor="source" className="block text-sm font-medium text-secondary mb-1 ml-2">Source</label>
          <input
            type="text"
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={inputStyles}
            placeholder="e.g., Salary, Freelance"
            required
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-6">
          <button type="button" onClick={onCancel} className="text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
          >
            Save Income
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddIncomeScreen;