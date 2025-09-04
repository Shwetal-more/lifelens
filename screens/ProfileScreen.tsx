

import React, { useState, useEffect } from 'react';
import { Screen, UserProfile, SavingsTarget } from '../types';
import { getNotificationPermission, requestNotificationPermission } from '../services/notificationService';


interface NotificationSettings {
    enabled: boolean;
    time: string;
}

interface AppSettings {
    notifications: NotificationSettings;
    savingsTarget: SavingsTarget;
}

interface ProfileScreenProps {
  userProfile: UserProfile | null;
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onNavigate: (screen: Screen) => void;
}

const UserCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);


const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, settings, onSettingsChange, onNavigate }) => {
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [savingsTargetInput, setSavingsTargetInput] = useState(settings.savingsTarget.amount.toString());

  useEffect(() => {
    setNotificationStatus(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
      const status = await requestNotificationPermission();
      setNotificationStatus(status);
  }
  
  const handleSavingsTargetBlur = () => {
      const amount = parseInt(savingsTargetInput, 10);
      if (!isNaN(amount) && amount > 0) {
          onSettingsChange({ savingsTarget: { ...settings.savingsTarget, amount }});
      } else {
          setSavingsTargetInput(settings.savingsTarget.amount.toString());
      }
  };

  const getStatusChip = () => {
    switch(notificationStatus) {
        case 'granted':
            return <span className="text-xs font-semibold text-green-800 bg-green-200 px-2 py-1 rounded-full">Granted</span>;
        case 'denied':
            return <span className="text-xs font-semibold text-red-800 bg-red-200 px-2 py-1 rounded-full">Denied</span>;
        default:
             return <span className="text-xs font-semibold text-gray-800 bg-gray-200 px-2 py-1 rounded-full">Default</span>;
    }
  }

  return (
    <div className="p-4 pt-8 space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full shadow-lg border-4 border-white bg-card flex items-center justify-center">
          <UserCircleIcon className="w-20 h-20 text-secondary" />
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-primary">{userProfile?.name || 'User'}</h1>
          <p className="text-secondary">{userProfile?.name?.toLowerCase().replace(/\s+/g, '.')}@lifelens.app</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary px-2">Account</h2>
        
        <div onClick={() => onNavigate(Screen.EditProfile)} className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold">Edit Profile</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>
        
        <div onClick={() => onNavigate(Screen.Achievements)} className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold">🏆 Achievements</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>
        
        <div className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5" onClick={() => onNavigate(Screen.FinancialGoals)}>
          <span className="font-semibold">Set Financial Goals</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>

         <h2 className="text-lg font-bold text-primary px-2 pt-4">Settings</h2>
          <div className="bg-card p-4 rounded-2xl shadow-card">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Monthly Savings Target</p>
                    <p className="text-sm text-secondary">Set a goal to unlock rewards.</p>
                </div>
                <input 
                  type="number"
                  value={savingsTargetInput}
                  onChange={(e) => setSavingsTargetInput(e.target.value)}
                  onBlur={handleSavingsTargetBlur}
                  className="w-24 px-2 py-1 text-right bg-background rounded-lg shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
                />
            </div>
        </div>
        <div className="bg-card p-4 rounded-2xl shadow-card">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Real-time AI Insights</p>
                    <p className="text-sm text-secondary">Get mindful spending alerts.</p>
                </div>
                {getStatusChip()}
            </div>
             {notificationStatus !== 'granted' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                   <button onClick={handleRequestPermission} className="w-full bg-accent text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-accent-dark transform hover:-translate-y-0.5 transition-all">
                        {notificationStatus === 'denied' ? 'Enable in Browser Settings' : 'Enable Notifications'}
                    </button>
                    {notificationStatus === 'denied' && <p className="text-xs text-secondary mt-2 text-center">You've previously blocked notifications. Please enable them in your browser settings to use this feature.</p>}
                </div>
            )}
        </div>
        
        <div className="bg-card p-4 rounded-2xl shadow-card flex justify-center items-center cursor-pointer mt-6 transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold text-red-500">Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;