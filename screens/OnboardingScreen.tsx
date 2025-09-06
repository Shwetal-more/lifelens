import React, { useState } from 'react';
import { UserProfile } from '../types';

const UserIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);
const CakeIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.75a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V14.25m18 1.5v-1.5m-18 0v1.5m18-1.5v-6A2.25 2.25 0 0 0 18.75 6H5.25A2.25 2.25 0 0 0 3 8.25v6m18 1.5H3m18-1.5a.75.75 0 0 0 .75-.75V8.25a3.75 3.75 0 0 0-3.75-3.75H5.25a3.75 3.75 0 0 0-3.75 3.75v5.25c0 .414.336.75.75.75h1.5m15-1.5h-15M9 6a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H9.75A.75.75 0 0 1 9 6Zm-3.023 7.5a.75.75 0 1 0-1.458-.295 9.71 9.71 0 0 0 3.238 3.238.75.75 0 1 0 .295-1.458A8.21 8.21 0 0 1 5.977 13.5Zm12.046 0a.75.75 0 1 0-.295 1.458 9.71 9.71 0 0 0 3.238-3.238.75.75 0 1 0-1.458-.295 8.21 8.21 0 0 1-3.238 3.238Z" />
    </svg>
);
const GlobeIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 1-9-9c0-1.044.184-2.044.522-2.962M12 21a9 9 0 0 0 9-9c0-1.044-.184-2.044-.522-2.962M12 21v-2.131M12 3v2.131m0 0a8.956 8.956 0 0 1 4.5 2.962m-4.5-2.962a8.956 8.956 0 0 0-4.5 2.962M3 12a9 9 0 0 0 9 9m9-9a9 9 0 0 0-9-9m-9 9H0m24 0h-3" />
    </svg>
);
const SmsIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75A2.25 2.25 0 0 0 15.75 1.5h-2.25m-3.75 0h3.75M12 18.75h.008v.008H12v-.008Z" />
    </svg>
);


interface OnboardingScreenProps {
  onSaveProfile: (profile: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSaveProfile }) => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
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
    setDirection('forward');
    setStep(s => Math.min(totalSteps, s + 1))
  };

  const handlePrevStep = () => {
    setDirection('backward');
    setStep(s => Math.max(1, s - 1))
  };

  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  const totalSteps = 4;
  
  const stepContent = [
    {
      icon: <UserIcon className="w-16 h-16 text-accent mb-4"/>,
      content: (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1 ml-2">What should we call you?</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="e.g., Jane Doe" required />
        </div>
      )
    },
    {
      icon: <CakeIcon className="w-16 h-16 text-accent mb-4"/>,
      content: (
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-secondary mb-1 ml-2">Your Age</label>
          <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} className={inputStyles} placeholder="e.g., 25" required />
          <p className="text-xs text-secondary mt-2 ml-2 italic">To personalize your experience.</p>
        </div>
      )
    },
    {
      icon: <GlobeIcon className="w-16 h-16 text-accent mb-4"/>,
      content: (
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-secondary mb-1 ml-2">Preferred Currency</label>
          <select id="currency" value={currency} onChange={(e) => setCurrency(e.target.value as UserProfile['currency'])} className={`${inputStyles} appearance-none`}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
      )
    },
    {
      icon: <SmsIcon className="w-16 h-16 text-accent mb-4"/>,
      content: (
        <div className="text-center">
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
      )
    }
  ];

  return (
    <div className="p-4 flex flex-col h-full bg-background">
        <style>{`
            @keyframes slide-in-from-right { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes slide-out-to-left { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-30px); } }
            @keyframes slide-in-from-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes slide-out-to-right { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(30px); } }

            .step-container[data-direction="forward"][data-active="false"] { animation: slide-out-to-left 0.4s ease-in-out forwards; }
            .step-container[data-direction="forward"][data-active="true"] { animation: slide-in-from-right 0.4s ease-in-out forwards; }
            .step-container[data-direction="backward"][data-active="false"] { animation: slide-out-to-right 0.4s ease-in-out forwards; }
            .step-container[data-direction="backward"][data-active="true"] { animation: slide-in-from-left 0.4s ease-in-out forwards; }
        `}</style>
        
        {/* --- TOP HEADER (FIXED) --- */}
        <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-primary">Profile Setup</h1>
                <button onClick={handleSkip} className="text-sm font-semibold text-secondary px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors">Skip</button>
            </div>
            <p className="text-secondary mb-6">Let's get to know you.</p>

            <div className="mb-8 px-2">
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
      
        {/* --- MIDDLE CONTENT (SCROLLABLE) --- */}
        <div className="flex-grow relative overflow-y-auto py-4">
            {stepContent.map((item, index) => (
                <div 
                  key={index}
                  className="step-container absolute w-full" 
                  data-active={step === index + 1}
                  data-direction={direction}
                >
                    {step === index + 1 && (
                      <div className="flex flex-col items-center">
                          {item.icon}
                          <div className="w-full max-w-sm">
                              {item.content}
                          </div>
                      </div>
                    )}
                </div>
            ))}
        </div>

      {/* --- BOTTOM NAVIGATION (FIXED) --- */}
      <div className="pt-4 flex-shrink-0 flex items-center justify-between">
        <button onClick={handlePrevStep} disabled={step === 1} className="text-secondary font-bold py-4 px-8 rounded-xl hover:bg-gray-100 disabled:opacity-50">
          Back
        </button>
        {step < totalSteps && (
          <button onClick={handleNextStep} className="bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all">
             Next
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;