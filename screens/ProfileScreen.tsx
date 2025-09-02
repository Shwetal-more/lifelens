import React from 'react';
import { Screen, UserProfile } from '../types';

interface NotificationSettings {
    enabled: boolean;
    time: string;
}

interface ProfileScreenProps {
  userProfile: UserProfile | null;
  settings: NotificationSettings;
  onSettingsChange: (settings: NotificationSettings) => void;
  onNavigate: (screen: Screen) => void;
}


const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, settings, onSettingsChange, onNavigate }) => {
  return (
    <div className="p-4 pt-8 space-y-8">
      <div className="flex flex-col items-center text-center">
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
        
        <div onClick={() => onNavigate(Screen.Achievements)} className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold">🏆 Achievements</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>
        
        <div className="bg-card p-4 rounded-2xl shadow-card flex justify-between items-center cursor-pointer transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold">Set Financial Goals</span>
          <span className="text-secondary text-lg font-bold">{'>'}</span>
        </div>

         <h2 className="text-lg font-bold text-primary px-2 pt-4">Settings</h2>
        <div className="bg-card p-4 rounded-2xl shadow-card">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Enable Notifications</p>
                    <p className="text-sm text-secondary">Get daily reminders and insights.</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                        type="checkbox" 
                        name="toggle" 
                        id="toggle" 
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        checked={settings.enabled}
                        onChange={(e) => onSettingsChange({ ...settings, enabled: e.target.checked })}
                    />
                    <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
            </div>
            {settings.enabled && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <label htmlFor="reminderTime" className="block text-sm font-medium text-secondary mb-1">Reminder Time</label>
                    <input 
                        type="time" 
                        id="reminderTime"
                        value={settings.time}
                        onChange={(e) => onSettingsChange({ ...settings, time: e.target.value })}
                        className="w-full px-3 py-2 bg-background border-none rounded-lg shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
                    />
                </div>
            )}
        </div>
        
        <div className="bg-card p-4 rounded-2xl shadow-card flex justify-center items-center cursor-pointer mt-6 transition-transform transform hover:-translate-y-0.5">
          <span className="font-semibold text-red-500">Log Out</span>
        </div>
      </div>
       <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #1DE9B6; /* accent */
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #1DE9B6; /* accent */
        }
      `}</style>
    </div>
  );
};

export default ProfileScreen;