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
  
  const handleSkip = () => {
    onSaveProfile({
      name: 'Explorer',
      age: 25, // A sensible default
      currency: 'USD',
      smsEnabled: false,
    });
  };
  
  const handleNextStep = () => {
    setStep(s => Math.min(totalSteps, s + 1))
  };

  const handlePrevStep = () => {
    setStep(s => Math.max(1, s - 1))
  };

  const inputStyles = "w-full px-4 py-3 bg-card border border-light-shadow rounded-xl focus:ring-2 focus:ring-accent focus:outline-none transition-shadow text-lg";
  const totalSteps = 4;

  return (
    <div className="p-6 flex flex-col h-full bg-background text-primary">
      {/* --- TOP HEADER (FIXED) --- */}
      <div className="flex-shrink-0">
          <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Profile Setup</h1>
              <button onClick={handleSkip} className="text-sm font-semibold text-secondary px-3 py-1 rounded-lg hover:bg-gray-100/50 transition-colors">Skip</button>
          </div>
          <p className="text-secondary mb-6">Let's get to know you.</p>

          <div className="mb-8">
              <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                      <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-accent-dark bg-accent/20">Step {step} of {totalSteps}</span></div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-accent/20">
                      <div style={{ width: `${(step / totalSteps) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent transition-all duration-500"></div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* --- MIDDLE CONTENT (VERTICALLY CENTERED) --- */}
      <div className="flex-grow flex flex-col justify-center">
        <div className="space-y-6">
          {/* Step 1: Name */}
          <div className={step === 1 ? 'block animate-fade-in' : 'hidden'}>
            <label htmlFor="name" className="block text-lg font-medium text-primary mb-4 text-center">What should we call you?</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="e.g., Jane Doe" required />
          </div>

          {/* Step 2: Age */}
          <div className={step === 2 ? 'block animate-fade-in' : 'hidden'}>
             <label htmlFor="age" className="block text-lg font-medium text-primary mb-4 text-center">Your Age</label>
            <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} className={inputStyles} placeholder="e.g., 25" required />
            <p className="text-xs text-secondary mt-2 text-center italic">To personalize your experience.</p>
          </div>

          {/* Step 3: Currency */}
          <div className={step === 3 ? 'block animate-fade-in' : 'hidden'}>
            <label htmlFor="currency" className="block text-lg font-medium text-primary mb-4 text-center">Preferred Currency</label>
            <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as UserProfile['currency'])} className={`${inputStyles} appearance-none`}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          
          {/* Step 4: SMS */}
          <div className={step === 4 ? 'block text-center animate-fade-in' : 'hidden'}>
            <h2 className="text-xl font-bold text-primary mb-2">Automate Your Insights</h2>
            <p className="text-secondary mb-6 text-sm">Allow LifeLens to read financial SMS messages to automatically generate insights and track your spending. Your data is processed securely and never shared.</p>
            <div className="space-y-3">
                <button onClick={() => handleSave(true)} className="w-full bg-accent text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-0.5 transition-all">
                    Enable Automatic Insights
                </button>
                <button onClick={() => handleSave(false)} className="w-full text-sm text-secondary font-semibold py-2">
                    Maybe Later
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM NAVIGATION (FIXED) --- */}
      <div className="pt-6 flex-shrink-0 flex items-center justify-between">
        <button onClick={handlePrevStep} disabled={step === 1} className="text-secondary font-bold py-4 px-8 rounded-xl hover:bg-gray-100/50 disabled:opacity-50">
          Back
        </button>
        {step < totalSteps && (
          <button onClick={handleNextStep} className="bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all">
             Next
          </button>
        )}
      </div>
       <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OnboardingScreen;