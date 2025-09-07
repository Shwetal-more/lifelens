
import React, { useState } from 'react';
import { Screen, NotificationType } from '../types';
import { parseSmsExpense } from '../services/geminiService';

interface SmsImportScreenProps {
  onNavigate: (screen: Screen) => void;
  onPrepareExpense: (data: { amount: string, category: string, purpose: string }) => void;
  addNotification: (message: string, type: NotificationType) => void;
}

const SmsImportScreen: React.FC<SmsImportScreenProps> = ({ onNavigate, onPrepareExpense, addNotification }) => {
  const [smsContent, setSmsContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<{ amount: number; category: string; purpose: string } | null>(null);
  
  const exampleSms = "Your SB A/c *8889 Debited for Rs.46.00 on 04-09-2025 11:57:33 by GBM Avl Bal Rs.49586.64 -Union Bank of India";

  const handleAnalyze = async () => {
    if (!smsContent.trim()) {
      addNotification('Please paste an SMS message first.', 'warning');
      return;
    }
    setIsLoading(true);
    setParsedData(null);
    const result = await parseSmsExpense(smsContent);
    setIsLoading(false);

    if (result) {
      setParsedData(result);
      addNotification('SMS analyzed successfully!', 'success');
    } else {
      addNotification('Could not analyze the SMS. Please try a different message.', 'error');
    }
  };

  const handleCreateExpense = () => {
    if (parsedData) {
      onPrepareExpense({
        amount: parsedData.amount.toString(),
        category: parsedData.category,
        purpose: parsedData.purpose,
      });
    }
  };

  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">Import from SMS</h1>
      <p className="text-secondary text-center mb-6">Paste a transaction SMS to quickly log an expense.</p>
      
      <div className="space-y-6">
        <div>
          <textarea
            value={smsContent}
            onChange={(e) => setSmsContent(e.target.value)}
            className="w-full h-32 p-4 bg-card border-none rounded-2xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
            placeholder="Paste your transaction message here..."
          />
          <button 
            onClick={() => setSmsContent(exampleSms)}
            className="text-xs text-secondary hover:text-primary underline mt-2"
          >
            Show an example
          </button>
        </div>

        {parsedData ? (
          <div className="bg-green-50 p-4 rounded-2xl shadow-card text-center animate-fade-in">
            <h2 className="text-lg font-bold text-green-800">Analysis Complete!</h2>
            <p className="text-2xl font-bold text-primary my-3">{parsedData.amount.toFixed(2)}</p>
            <p className="text-md text-secondary">Purpose: <span className="font-semibold text-primary">{parsedData.purpose}</span></p>
            <p className="text-md text-secondary">Suggested Category: <span className="font-semibold text-primary">{parsedData.category}</span></p>
            <button
              onClick={handleCreateExpense}
              className="mt-4 w-full bg-accent text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-accent-dark"
            >
              Continue to Log Expense
            </button>
          </div>
        ) : (
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Message'}
          </button>
        )}
        
        <button onClick={() => onNavigate(Screen.Home)} className="w-full text-secondary font-bold py-3 px-5 rounded-xl hover:bg-gray-100">
          Cancel
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SmsImportScreen;
