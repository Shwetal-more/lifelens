import React, { useState } from 'react';
import { FinancialGoal, UserProfile } from '../types';

interface AddFinancialGoalScreenProps {
  onSave: (goal: Omit<FinancialGoal, 'id'>) => void;
  onCancel: () => void;
  userProfile: UserProfile | null;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
};

const goalPresets = [
    { name: 'Vacation', icon: '🌴' },
    { name: 'New Car', icon: '🚗' },
    { name: 'Dream Home', icon: '🏠' },
    { name: 'Tech Upgrade', icon: '💻' },
    { name: 'Gift Fund', icon: '🎁' },
];

const AddFinancialGoalScreen: React.FC<AddFinancialGoalScreenProps> = ({ onSave, onCancel, userProfile }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  const handlePresetSelect = (preset: { name: string, icon: string }) => {
    setName(preset.name);
    setIcon(preset.icon);
  }

  const handleSave = () => {
    if (!name || !targetAmount || !targetDate) {
        alert("Please fill out all fields.");
        return;
    }
    onSave({
        name,
        icon,
        targetAmount: parseFloat(targetAmount),
        savedAmount: parseFloat(savedAmount),
        targetDate,
    });
  };

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary text-center mb-8">Set a New Goal</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-bold text-primary mb-3 text-center">Start with an idea</h2>
        <div className="grid grid-cols-3 gap-3">
            {goalPresets.map(p => (
                <button key={p.name} onClick={() => handlePresetSelect(p)} className="flex flex-col items-center p-3 bg-card rounded-2xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all">
                    <span className="text-3xl">{p.icon}</span>
                    <span className="text-xs font-semibold mt-1">{p.name}</span>
                </button>
            ))}
             <button onClick={() => { setName(''); setIcon('🎯'); }} className="flex flex-col items-center p-3 bg-card rounded-2xl shadow-card hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <span className="text-3xl">✨</span>
                <span className="text-xs font-semibold mt-1">Custom</span>
            </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-1/4">
            <label className="block text-sm font-medium text-secondary mb-1 ml-2">Icon</label>
            <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} className={inputStyles} maxLength={2} />
          </div>
          <div className="w-3/4">
            <label className="block text-sm font-medium text-secondary mb-1 ml-2">Goal Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="e.g., Summer Vacation" required/>
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-secondary mb-1 ml-2">Target Amount</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-500 sm:text-lg">{currencySymbol}</span>
                </div>
                <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className={`${inputStyles} pl-8`} placeholder="5,000" required/>
            </div>
        </div>
        
         <div>
            <label className="block text-sm font-medium text-secondary mb-1 ml-2">Already Saved (Optional)</label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-500 sm:text-lg">{currencySymbol}</span>
                </div>
                <input type="number" value={savedAmount} onChange={(e) => setSavedAmount(e.target.value)} className={`${inputStyles} pl-8`} placeholder="0"/>
            </div>
        </div>

         <div>
            <label className="block text-sm font-medium text-secondary mb-1 ml-2">Target Date</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={inputStyles} required/>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-6">
            <button type="button" onClick={onCancel} className="text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-100">
            Cancel
            </button>
            <button
            type="submit"
            className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
            >
            Save Goal
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddFinancialGoalScreen;
