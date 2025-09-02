import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingScreenProps {
  onSaveProfile: (profile: UserProfile) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSaveProfile }) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY'>('USD');
  const [phone, setPhone] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  const handleSave = () => {
    if (name.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    onSaveProfile({ name, currency, phone, smsEnabled });
  };
  
  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  return (
    <div className="p-4 flex flex-col justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome to LifeLens!</h1>
        <p className="text-secondary mb-10">Let's set up your profile to personalize your experience.</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1 ml-2">Your Name</label>
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
        </div>

        <div className="flex items-center space-x-3 pt-2">
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

        <div className="pt-8">
          <button
            onClick={handleSave}
            className="w-full bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-1 transition-all"
          >
            Save & Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;