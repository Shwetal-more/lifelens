
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
  onProfileChange: (profileData: Partial<UserProfile>) => void;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, settings, onSettingsChange, onProfileChange, onNavigate, onLogout }) => {
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  const [savingsTargetInput, setSavingsTargetInput] = useState(settings.savingsTarget.amount.toString());
  const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';

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
       <style>{`
        .toggle-checkbox:checked { right: 0; border-color: #1DE9B6; }
        .toggle-checkbox:checked + .toggle-label { background-color: #1DE9B6; }
      `}</style>
      <div id="tutorial-profile-header" className="flex flex-col items-center text-center">
        <img src={`https://i.pravatar.cc/150?u=a042581f4e29026704d`} alt="Profile" className="w-24 h-24 rounded-full shadow-lg border-4 border-white" />
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-primary">{userProfile?.name || 'User'}</h1>
          <p className="text-secondary">{userProfile?.name?.toLowerCase().replace(' ', '.')}@lifelens.app</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-primary px-2">Account</h2>
        
        <div className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold">Edit Profile</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>
        
        <div id="tutorial-achievements-button" onClick={() => onNavigate(Screen.Achievements)} className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold">🏆 Achievements</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>
        
        <div className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5" onClick={() => onNavigate(Screen.FinancialGoals)}>
          <span className="font-semibold">Set Financial Goals</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>
        
        <div className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5" onClick={() => onNavigate(Screen.PrivacyPolicy)}>
          <span className="font-semibold">Privacy Policy</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>

         <h2 className="text-lg font-bold text-primary px-2 pt-4">Settings</h2>

         <div className="bg-card p-4 rounded-2xl shadow-card">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Weekly Insight Roundup</p>
                    <p className="text-sm text-secondary">Get an AI-powered weekly summary in the app.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                        type="checkbox" 
                        name="smsToggle" 
                        id="smsToggle" 
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        checked={userProfile?.smsEnabled || false}
                        onChange={() => onProfileChange({ smsEnabled: !userProfile?.smsEnabled })}
                    />
                    <label htmlFor="smsToggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
            </div>
        </div>

          <div className="bg-card p-4 rounded-2xl shadow-card">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Monthly Savings Target</p>
                    <p className="text-sm text-secondary">Set a goal to unlock rewards.</p>
                </div>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary">{currencySymbol}</span>
                  <input 
                    type="number"
                    value={savingsTargetInput}
                    onChange={(e) => setSavingsTargetInput(e.target.value)}
                    onBlur={handleSavingsTargetBlur}
                    className="w-28 pl-6 pr-2 py-1 text-right bg-background rounded-lg shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>
            </div>
        </div>
        <div className="bg-card p-4 rounded-2xl shadow-card">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Push Notifications</p>
                    <p className="text-sm text-secondary">Get daily reminders.</p>
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

        <div className="bg-card p-4 rounded-2xl shadow-card">
          <h3 className="font-semibold mb-2">Mindful Spending Alerts</h3>
          <p className="text-sm text-secondary mb-3">
            We'll automatically provide an AI nudge in the 'Mindful Spend Check' screen for these conditions:
          </p>
          <ul className="list-disc list-inside text-sm text-primary space-y-1">
            <li>Any spending in 'Hotel' or 'Subway' categories.</li>
            <li>'General Store' purchases over {currencySymbol}100.</li>
          </ul>
        </div>
        
        <div onClick={onLogout} className="bg-card p-4 rounded-2xl shadow-card flex justify-center items-center cursor-pointer mt-6 transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold text-red-500">Log Out</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
