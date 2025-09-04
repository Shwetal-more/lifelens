
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface EditProfileScreenProps {
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ userProfile, onSave, onCancel }) => {
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age.toString());
  const [currency, setCurrency] = useState(userProfile.currency);

  const handleSave = () => {
    if (name.trim() === '' || !age || parseInt(age, 10) <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }
    onSave({
      ...userProfile,
      name,
      age: parseInt(age, 10),
      currency,
    });
  };

  const inputStyles = "w-full px-4 py-3 bg-card border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow";

  return (
    <div className="p-4 pt-8 h-full flex flex-col">
       <div className="flex items-center mb-8 relative justify-center">
        <button onClick={onCancel} className="absolute left-0 text-primary bg-card p-2 rounded-full shadow-card">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
        <h1 className="text-3xl font-bold text-primary">Edit Profile</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6 flex-grow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1 ml-2">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputStyles}
            required
          />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-secondary mb-1 ml-2">Age</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={inputStyles}
            required
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-secondary mb-1 ml-2">Currency</label>
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
        <div className="flex items-center justify-end space-x-2 pt-6">
          <button type="button" onClick={onCancel} className="text-secondary font-bold py-3 px-6 rounded-xl hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-primary/90 transform hover:-translate-y-0.5 transition-all"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileScreen;