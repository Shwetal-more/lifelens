import React, { useState } from 'react';
import { Screen, NotificationType } from '../types';
import { parseSmsExpense } from '../services/geminiService';

interface SmsImportScreenProps {
  onNavigate: (screen: Screen) => void;
  onPrepareExpense: (data: { amount: string, category: string, purpose: string }) => void;
  onPrepareIncome: (data: { amount: string, source: string }) => void;
  addNotification: (message: string, type: NotificationType) => void;
  onAnalysisComplete: () => void;
  isTutorialActive: boolean;
}

const SmsImportScreen: React.FC<SmsImportScreenProps> = ({ onNavigate, onPrepareExpense, onPrepareIncome, addNotification, onAnalysisComplete, isTutorialActive }) => {
  const [smsContent, setSmsContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isManualFallback, setIsManualFallback] = useState(false);
  const [editableData, setEditableData] = useState<{
    type: 'income' | 'expense';
    amount: string;
    category: string;
    purpose: string;
  } | null>(null);

  const exampleSms = "Your SB A/c *8889 Debited for Rs.46.00 on 04-09-2025 11:57:33 by GBM Avl Bal Rs.49586.64 -Union Bank of India";

  const handleShowExample = () => {
    setSmsContent(exampleSms);
    if (isTutorialActive) {
      onAnalysisComplete();
    }
  };

  const handleAnalyze = async () => {
    if (!smsContent.trim()) {
      addNotification('Please paste an SMS message first.', 'warning');
      return;
    }
    setIsLoading(true);
    setEditableData(null);
    setIsManualFallback(false);
    const result = await parseSmsExpense(smsContent);
    setIsLoading(false);

    if (isTutorialActive) {
      onAnalysisComplete();
    }

    if (result) {
      setEditableData({
        ...result,
        amount: result.amount.toString(),
      });
      addNotification('SMS analyzed successfully!', 'success');
    } else {
      addNotification('AI analysis failed. Please enter the details manually.', 'error');
      setIsManualFallback(true);
    }
  };

  const handleContinue = () => {
    if (editableData) {
        if (!editableData.amount || !editableData.category || !editableData.purpose) {
            addNotification('Please fill all fields.', 'warning');
            return;
        }

        if (editableData.type === 'expense') {
             onPrepareExpense({
                amount: editableData.amount,
                category: editableData.category,
                purpose: editableData.purpose,
            });
        } else { // It's income
            onPrepareIncome({
                amount: editableData.amount,
                source: editableData.purpose, // Use purpose as source for income
            });
        }
    } else if (isManualFallback) {
         if (!editableData?.amount || !editableData?.category || !editableData?.purpose) {
            addNotification('Please fill all fields to log the expense.', 'warning');
            return;
        }
        onPrepareExpense({
            amount: editableData.amount,
            category: editableData.category,
            purpose: editableData.purpose,
        });
    }
  };

  const handleFieldChange = (field: keyof typeof editableData, value: string) => {
    if (editableData) {
        setEditableData(prev => prev ? {...prev, [field]: value} : null);
    }
  }

  const renderForm = (title: string, submitText: string) => (
     <div id="tutorial-sms-results-form" className="bg-card p-4 rounded-2xl shadow-card animate-fade-in space-y-4 border-2 border-accent/20">
        <h2 className="text-lg font-bold text-primary text-center">{title}</h2>
        
        <div>
            <label className="text-sm font-medium text-secondary ml-2">Transaction Type</label>
            <select
                value={editableData?.type}
                onChange={e => handleFieldChange('type', e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-white rounded-lg border focus:ring-accent focus:border-accent"
            >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>
        </div>
        
        <div>
            <label className="text-sm font-medium text-secondary ml-2">Amount</label>
            <input type="number" value={editableData?.amount} onChange={e => handleFieldChange('amount', e.target.value)} className="w-full mt-1 px-3 py-2 bg-white rounded-lg border" placeholder="e.g., 46.00" />
        </div>
        <div>
            <label className="text-sm font-medium text-secondary ml-2">Category</label>
            <input type="text" value={editableData?.category} onChange={e => handleFieldChange('category', e.target.value)} className="w-full mt-1 px-3 py-2 bg-white rounded-lg border" placeholder="e.g., Food, Shopping" />
        </div>
         <div>
            <label className="text-sm font-medium text-secondary ml-2">{editableData?.type === 'expense' ? 'Purpose / Merchant' : 'Source'}</label>
            <input type="text" value={editableData?.purpose} onChange={e => handleFieldChange('purpose', e.target.value)} className="w-full mt-1 px-3 py-2 bg-white rounded-lg border" placeholder="e.g., Starbucks" />
        </div>
        <button
          id="tutorial-sms-continue-button"
          onClick={handleContinue}
          className="w-full bg-accent text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-accent-dark"
        >
          {submitText}
        </button>
     </div>
  );


  return (
    <div className="p-4 pt-8">
      <h1 className="text-3xl font-bold text-primary text-center mb-2">Import from SMS</h1>
      <p className="text-secondary text-center mb-6">Paste a transaction SMS to quickly log an expense.</p>
      
      <div className="space-y-6">
        <div>
          <textarea
            id="tutorial-sms-textarea"
            value={smsContent}
            onChange={(e) => setSmsContent(e.target.value)}
            className="w-full h-32 p-4 bg-card border-none rounded-2xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none transition-shadow"
            placeholder="Paste your transaction message here..."
            readOnly={isLoading || editableData !== null || isManualFallback}
          />
          {!smsContent && (
            <button
              id="tutorial-sms-example-button"
              onClick={handleShowExample}
              className="text-xs text-secondary hover:text-primary underline mt-2"
            >
              Show an example
            </button>
          )}
        </div>

        {isManualFallback ? (
           renderForm("Manual Entry", "Continue to Log Expense")
        ) : editableData ? (
          renderForm("Confirm Details", `Continue to Log ${editableData.type}`)
        ) : (
          <button
            id="tutorial-sms-analyze-button"
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