import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingScreenProps {
  onSaveProfile: (profile: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSaveProfile }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY'>('USD');
  
  const handleSave = (smsEnabled: boolean) => {
    if (name.trim() === '') {
      alert('Please enter your name.');
      setStep(1);
      return;
    }
     if (parseInt(age, 10) <= 0 || isNaN(parseInt(age, 10))) {
        alert('Please enter a valid age.');
        setStep(2);
        return;
    }
    onSaveProfile({ name, age: parseInt(age, 10), currency, smsEnabled });
  };

  const handleNextStep = () => {
    setStep(s => Math.min(totalSteps, s + 1))
  };

  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  const totalSteps = 4;

  return (
    <div className="p-4 flex flex-col justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome to LifeLens!</h1>
        <p className="text-secondary mb-8">Let's set up your profile.</p>
      </div>

      <div className="mb-8 px-2">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-accent-dark bg-accent/20">
                Step {step} of {totalSteps}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-accent/20">
            <div style={{ width: `${(step / totalSteps) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent transition-all duration-500"></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-5 flex-grow">
        {step === 1 && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1 ml-2">What should we call you?</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyles}
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
        )}
        
        {step === 2 && (
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-secondary mb-1 ml-2">Your Age</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputStyles}
              placeholder="e.g., 25"
              required
            />
             <p className="text-xs text-secondary mt-2 ml-2 italic">To personalize your experience.</p>
          </div>
        )}

        {step === 3 && (
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-secondary mb-1 ml-2">Preferred Currency</label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as UserProfile['currency'])}
              className={`${inputStyles} appearance-none`}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        )}
        
        {step === 4 && (
            <div className="text-center p-4">
                 <h2 className="text-2xl font-bold text-primary mb-4">Automate Your Insights</h2>
                 <p className="text-secondary mb-6">Allow LifeLens to read financial SMS messages to automatically generate insights and track your spending. Your data is processed securely and never shared.</p>
                 <div className="space-y-3">
                    <button onClick={() => handleSave(true)} className="w-full bg-accent text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-1 transition-all">
                        Enable Automatic Insights
                    </button>
                    <button onClick={() => handleSave(false)} className="w-full text-sm text-secondary font-semibold py-2">
                        Maybe Later
                    </button>
                 </div>
            </div>
        )}
      </div>

      <div className="pt-8 flex items-center justify-between">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
          className="text-secondary font-bold py-4 px-8 rounded-xl hover:bg-gray-100 disabled:opacity-50"
        >
          Back
        </button>
        {step < totalSteps && (
          <button
            onClick={handleNextStep}
            className="bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all"
          >
             Next
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;