
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { requestNotificationPermission } from '../services/notificationService';

interface OnboardingScreenProps {
  onSaveProfile: (profile: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSaveProfile }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY'>('USD');
  const [phone, setPhone] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  const handleSave = () => {
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
    onSaveProfile({ name, age: parseInt(age, 10), currency, phone, smsEnabled });
  };
  
  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    handleSave(); // Save after notification step
  };

  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  const totalSteps = 5;

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
            <div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-1 ml-2">Phone Number (Optional)</label>
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputStyles}
                        placeholder="For SMS alerts and future features"
                    />
                     <p className="text-xs text-secondary mt-2 ml-2 italic">For future features like SMS alerts (you can skip this).</p>
                </div>
                 <div className="flex items-center space-x-3 pt-4">
                    <input
                        type="checkbox"
                        id="sms"
                        checked={smsEnabled}
                        onChange={(e) => setSmsEnabled(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <label htmlFor="sms" className="text-sm text-secondary">
                        Enable SMS notifications (coming soon)
                    </label>
                </div>
            </div>
        )}
        
        {step === 5 && (
            <div className="text-center p-4">
                 <h2 className="text-2xl font-bold text-primary mb-4">Get Real-Time Insights</h2>
                 <p className="text-secondary mb-6">Enable notifications to receive AI-powered spending alerts and motivational tips right on your device. It's like having a financial coach in your pocket!</p>
                 <button onClick={handleEnableNotifications} className="w-full bg-accent text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-1 transition-all">
                    Enable & Finish
                 </button>
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
        {step < totalSteps ? (
          <button
            onClick={() => setStep(s => Math.min(totalSteps, s + 1))}
            className="bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all"
          >
             Next
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="bg-accent text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-1 transition-all"
          >
            Skip & Get Started
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;
