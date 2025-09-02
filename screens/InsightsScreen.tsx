import React, { useState, useEffect } from 'react';
import { Expense, MoodEntry, UserProfile } from '../types';
import InsightChart from '../components/InsightChart';
import { getFinancialInsight } from '../services/geminiService';

interface InsightsScreenProps {
  expenses: Expense[];
  moods: MoodEntry[];
  userProfile: UserProfile | null;
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ expenses, moods, userProfile }) => {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      const result = await getFinancialInsight(expenses);
      setInsight(result);
      setIsLoading(false);
    };
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  return (
    <div className="p-4 pt-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Your Insights</h1>
        <p className="text-secondary mt-1">Discover patterns in your financial life.</p>
      </div>

      <div className="bg-card p-5 rounded-2xl shadow-card">
        <h2 className="text-lg font-bold text-primary mb-2">Secret Pattern Unlocked!</h2>
        <div className="min-h-[4rem] flex items-center">
            {isLoading ? (
                <p className="text-secondary animate-pulse">Analyzing your data...</p>
            ) : (
                <p className="text-primary font-semibold text-lg italic">"{insight}"</p>
            )}
        </div>
      </div>

      <div className="bg-card p-4 rounded-2xl shadow-card">
        <h2 className="text-lg font-bold text-primary mb-4 text-center">Spending vs Mood</h2>
        <InsightChart expenses={expenses} moods={moods} userProfile={userProfile}/>
      </div>
    </div>
  );
};

export default InsightsScreen;