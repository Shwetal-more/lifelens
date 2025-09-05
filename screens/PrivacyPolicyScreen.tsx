import React from 'react';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <div className="p-4 pt-8">
      <div className="flex items-center mb-8 relative justify-center">
        <button onClick={onBack} className="absolute left-0 text-primary bg-card p-2 rounded-full shadow-card">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
        <h1 className="text-3xl font-bold text-primary">Privacy Policy</h1>
      </div>

      <div className="space-y-6 text-secondary leading-relaxed">
        <p className="text-sm text-center italic">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-card p-4 rounded-2xl shadow-card">
          <h2 className="text-lg font-bold text-primary mb-2">Our Commitment to Your Privacy</h2>
          <p>LifeLens is designed from the ground up to be a private, personal space for you. We believe you should have full control over your data. This policy explains what data we handle and how we protect it.</p>
        </div>

        <div className="bg-card p-4 rounded-2xl shadow-card">
          <h2 className="text-lg font-bold text-primary mb-2">1. Data Storage: It's All on Your Device</h2>
          <p>All the data you enter into LifeLens—including your expenses, moods, notes, and goals—is stored exclusively in your browser's local storage. This means:</p>
          <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
            <li>Your data <span className="font-bold">never leaves your device</span>.</li>
            <li>We do not have a central server that collects or stores your personal financial information.</li>
            <li>If you clear your browser data or use a different device, your information will not be there.</li>
          </ul>
        </div>

        <div className="bg-card p-4 rounded-2xl shadow-card">
          <h2 className="text-lg font-bold text-primary mb-2">2. AI-Powered Insights (Google Gemini)</h2>
          <p>To provide you with personalized insights, tips, and game content, we send specific, non-identifiable data to the Google Gemini API. Here's how that works:</p>
          <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
            <li>We <span className="font-bold">do not send your name, age, or phone number</span> with these requests.</li>
            <li>For example, when generating a "Weekly Insight," we might send a list of recent expense amounts and categories, but not your entire financial history.</li>
            <li>This data is used by Google to generate a response for you and is governed by Google's privacy policy. The data is not used to identify you.</li>
          </ul>
        </div>

        <div className="bg-card p-4 rounded-2xl shadow-card">
            <h2 className="text-lg font-bold text-primary mb-2">3. SMS Data and Security</h2>
            <p>
                LifeLens <span className="font-bold">cannot and does not</span> automatically read your SMS messages. This is a critical security feature of modern web browsers that we fully support.
            </p>
            <p className="mt-2">
                The "Import from SMS" feature requires you to <span className="font-bold">manually copy and paste</span> the text of a single message into the app. This text is then sent to the AI for one-time analysis and is not stored or logged by us. You are always in control.
            </p>
        </div>
        
        <div className="bg-card p-4 rounded-2xl shadow-card">
          <h2 className="text-lg font-bold text-primary mb-2">4. Your Control</h2>
          <p>You have the ultimate control over your data. You can delete any entry within the app, and you can clear all data at any time by clearing your browser's site data for LifeLens.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
