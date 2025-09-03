import React, { useState, useEffect, useMemo } from 'react';
import { Expense, MoodEntry, UserProfile } from '../types';
import InsightChart from '../components/InsightChart';
import SpendingBreakdownChart from '../components/SpendingBreakdownChart';
import CategoryPieChart from '../components/CategoryPieChart';
import MoodTrendChart from '../components/MoodTrendChart';
import { getFinancialInsight } from '../services/geminiService';

interface InsightsScreenProps {
  expenses: Expense[];
  moods: MoodEntry[];
  userProfile: UserProfile | null;
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ expenses, moods, userProfile }) => {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const allCategories = useMemo(() => Array.from(new Set(expenses.map(e => e.category))), [expenses]);

  useEffect(() => {
    // Select all categories by default when the component mounts or categories change
    setSelectedCategories(allCategories);
  }, [allCategories]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const daysToFilter = period === 'week' ? 7 : 30;
    const cutoffDate = new Date(new Date().setDate(now.getDate() - daysToFilter));
    
    return expenses.filter(e => {
        const expenseDate = new Date(e.date);
        const isWithinDate = expenseDate >= cutoffDate;
        const isInCategory = selectedCategories.length === 0 || selectedCategories.includes(e.category);
        return isWithinDate && isInCategory;
    });
  }, [expenses, period, selectedCategories]);

  const filteredMoods = useMemo(() => {
    const now = new Date();
    const daysToFilter = period === 'week' ? 7 : 30;
    const cutoffDate = new Date(new Date().setDate(now.getDate() - daysToFilter));
    return moods.filter(m => new Date(m.date) >= cutoffDate);
  }, [moods, period]);


  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      const result = await getFinancialInsight(filteredExpenses);
      setInsight(result);
      setIsLoading(false);
    };
    if (filteredExpenses.length > 0) {
        fetchInsight();
    } else {
        setInsight("Not enough data for this period/filter. Keep tracking!");
        setIsLoading(false);
    }
  }, [filteredExpenses]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const PeriodButton: React.FC<{
    label: string, 
    value: 'week' | 'month', 
    current: 'week' | 'month', 
    onClick: (p: 'week' | 'month') => void 
  }> = ({ label, value, current, onClick }) => (
    <button 
      onClick={() => onClick(value)} 
      className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
        current === value ? 'bg-primary text-white' : 'bg-transparent text-secondary hover:text-primary'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 pt-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Your Insights</h1>
        <p className="text-secondary mt-1">Discover patterns in your financial life.</p>
      </div>

      <div className="bg-card p-2 rounded-2xl shadow-card space-y-3">
        <div className="flex justify-center bg-background p-1 rounded-full w-max mx-auto">
            <PeriodButton label="Last 7 Days" value="week" current={period} onClick={setPeriod} />
            <PeriodButton label="Last 30 Days" value="month" current={period} onClick={setPeriod} />
        </div>
        <div>
            <h3 className="text-sm font-bold text-primary text-center mb-2">Filter by Category</h3>
            <div className="flex flex-wrap justify-center gap-2 px-2">
                {allCategories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-colors ${
                            selectedCategories.includes(cat)
                            ? 'bg-accent border-accent text-white'
                            : 'bg-transparent border-gray-200 text-secondary hover:border-secondary'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
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

      {filteredExpenses.length > 0 || filteredMoods.length > 0 ? (
        <>
            <div className="bg-card p-4 rounded-2xl shadow-card">
                <h2 className="text-lg font-bold text-primary mb-4 text-center">Mood Trend</h2>
                <MoodTrendChart moods={filteredMoods} />
            </div>

            <div className="bg-card p-4 rounded-2xl shadow-card">
                <h2 className="text-lg font-bold text-primary mb-4 text-center">Essential vs. Indulgence</h2>
                <SpendingBreakdownChart expenses={filteredExpenses} userProfile={userProfile} />
            </div>
            
            <div className="bg-card p-4 rounded-2xl shadow-card">
                <h2 className="text-lg font-bold text-primary mb-4 text-center">Spending by Category</h2>
                <CategoryPieChart expenses={filteredExpenses} userProfile={userProfile} />
            </div>

            <div className="bg-card p-4 rounded-2xl shadow-card">
                <h2 className="text-lg font-bold text-primary mb-4 text-center">Spending vs Mood</h2>
                <InsightChart expenses={filteredExpenses} moods={moods} userProfile={userProfile}/>
            </div>
        </>
      ) : (
        <div className="bg-card p-8 rounded-2xl shadow-card text-center">
            <h3 className="text-xl font-semibold text-primary">No Data for This Period</h3>
            <p className="text-secondary mt-2">Try logging more activities or selecting a different time frame to see your insights.</p>
        </div>
      )}
    </div>
  );
};

export default InsightsScreen;
