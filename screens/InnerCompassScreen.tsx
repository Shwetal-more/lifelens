import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Expense, MoodEntry, UserProfile, MoodType } from '../types';
import { getMoodTip, getFinancialInsight } from '../services/geminiService';
import InsightChart from '../components/InsightChart';
import CategoryPieChart from '../components/CategoryPieChart';
import MoodTrendChart from '../components/MoodTrendChart';
import CategoryTrendChart from '../components/CategoryTrendChart';

// FIX: Expanded moodEmojis to include all MoodType enum values to resolve TypeScript error.
const moodEmojis: Record<MoodType, string> = {
  [MoodType.Happy]: '😊',
  [MoodType.Sad]: '😢',
  [MoodType.Stressed]: '😥',
  [MoodType.Excited]: '🤩',
  [MoodType.Neutral]: '😐',
  [MoodType.Anxious]: '😟',
  [MoodType.Proud]: '😎',
  [MoodType.Grateful]: '🙏',
  [MoodType.Tired]: '😴',
  [MoodType.Bored]: '😒',
  [MoodType.Playful]: '😜',
  [MoodType.Content]: '😌',
};

const MoodButton: React.FC<{ mood: MoodType, onSelect: (mood: MoodType) => void, isSelected: boolean }> = ({ mood, onSelect, isSelected }) => (
    <button
        onClick={() => onSelect(mood)}
        className={`flex flex-col items-center justify-center p-3 bg-card rounded-2xl shadow-card transition-all transform hover:-translate-y-1 ${isSelected ? 'ring-2 ring-accent' : ''}`}
    >
        <span className="text-4xl">{moodEmojis[mood]}</span>
        <span className="mt-2 text-xs font-semibold text-primary">{mood}</span>
    </button>
);

const PeriodButton: React.FC<{
    label: string, 
    value: 'week' | 'month', 
    current: 'week' | 'month', 
    onClick: (p: 'week' | 'month') => void 
  }> = ({ label, value, current, onClick }) => (
    <button 
      onClick={() => onClick(value)} 
      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 ${
        current === value ? 'bg-primary text-white' : 'bg-transparent text-secondary hover:text-primary'
      }`}
    >
      {label}
    </button>
  );

interface InnerCompassScreenProps {
  expenses: Expense[];
  moods: MoodEntry[];
  userProfile: UserProfile | null;
  onSaveMood: (moodData: { mood: MoodType, reason?: string }) => void;
}

const InnerCompassScreen: React.FC<InnerCompassScreenProps> = ({ expenses, moods, userProfile, onSaveMood }) => {
  // Mood Tracker State
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [reason, setReason] = useState('');
  const [aiTip, setAiTip] = useState('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // Insights State
  const [insight, setInsight] = useState('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const allCategories = useMemo(() => Array.from(new Set(expenses.map(e => e.category))), [expenses]);

  const insightDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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
    if (insightDebounceRef.current) {
        clearTimeout(insightDebounceRef.current);
    }
    
    setIsLoadingInsight(true);

    insightDebounceRef.current = setTimeout(async () => {
        if (filteredExpenses.length > 0) {
            const result = await getFinancialInsight(filteredExpenses);
            setInsight(result);
        } else {
            setInsight("Not enough data for this period/filter. Keep tracking!");
        }
        setIsLoadingInsight(false);
    }, 500); // 500ms debounce delay

    return () => {
        if (insightDebounceRef.current) {
            clearTimeout(insightDebounceRef.current);
        }
    };
  }, [filteredExpenses]);
  
  const handleSelectMood = async (mood: MoodType) => {
    setSelectedMood(mood);
    setIsLoadingTip(true);
    setAiTip('');
    const tip = await getMoodTip(mood);
    setAiTip(tip);
    setIsLoadingTip(false);
  };
  
  const handleSave = () => {
    if (selectedMood) {
        onSaveMood({ mood: selectedMood, reason });
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setSelectedMood(null);
            setReason('');
            setAiTip('');
        }, 2000);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div id="tutorial-compass-content" className="p-4 pt-8 space-y-8">
      <div id="tutorial-compass-header" className="text-center">
        <h1 className="text-3xl font-bold text-primary">Inner Compass</h1>
        <p className="text-secondary mt-1">Reflect on your mood and uncover your patterns.</p>
      </div>

      <div id="tutorial-mood-tracker" className="bg-card p-5 rounded-2xl shadow-card">
        <h2 className="text-lg font-bold text-primary mb-4 text-center">How are you feeling right now?</h2>
        
        {isSaved && selectedMood ? (
             <div className="text-center py-4">
                <p className="text-5xl mb-2 animate-bounce">{moodEmojis[selectedMood]}</p>
                <h4 className="font-bold text-accent-dark">Mood Logged!</h4>
            </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.values(MoodType).map((mood) => (
                <MoodButton key={mood} mood={mood} onSelect={handleSelectMood} isSelected={selectedMood === mood} />
              ))}
            </div>
          
            {selectedMood && (
              <div className="mt-6 border-t pt-4">
                <div className="w-full my-4 min-h-[4rem]">
                  {isLoadingTip && <p className="text-secondary animate-pulse">Generating a power-up for you...</p>}
                  {aiTip && (
                    <div className="bg-background p-3 rounded-xl">
                      <p className="text-secondary text-sm mb-1">Power-Up:</p>
                      <p className="font-semibold text-primary text-lg italic">"{aiTip}"</p>
                    </div>
                  )}
                </div>
              
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full h-20 p-3 bg-background border-none rounded-xl shadow-soft-inset focus:ring-2 focus:ring-accent focus:outline-none"
                    placeholder="What's on your mind? (Optional)"
                />
              
                <div className="flex justify-end mt-4">
                  <button onClick={handleSave} className="bg-accent text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-accent-dark transform hover:-translate-y-0.5 transition-all">
                      Save Mood
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <div id="tutorial-charts-container" className="space-y-6">
         <h2 className="text-xl font-bold text-primary text-center pt-4">Your Data Story</h2>

         <div className="bg-card p-4 rounded-2xl shadow-card space-y-3">
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


        <div id="tutorial-secret-pattern" className="bg-card p-5 rounded-2xl shadow-card">
            <h2 className="text-lg font-bold text-primary mb-2">Secret Pattern Unlocked!</h2>
            <div className="min-h-[4rem] flex items-center">
                {isLoadingInsight ? (
                    <p className="text-secondary animate-pulse">Analyzing your data...</p>
                ) : (
                    <p className="text-primary font-semibold text-lg italic">"{insight}"</p>
                )}
            </div>
        </div>

        {filteredExpenses.length > 0 || filteredMoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-4 rounded-2xl shadow-card">
              <h3 className="text-lg font-bold text-primary mb-4 text-center">Spending Breakdown</h3>
              <InsightChart expenses={filteredExpenses} userProfile={userProfile} />
            </div>
            <div className="bg-card p-4 rounded-2xl shadow-card">
              <h3 className="text-lg font-bold text-primary mb-4 text-center">Mood Trend</h3>
              <MoodTrendChart moods={filteredMoods} />
            </div>
            <div className="bg-card p-4 rounded-2xl shadow-card">
              <h3 className="text-lg font-bold text-primary mb-4 text-center">Category Breakdown</h3>
              <CategoryPieChart expenses={filteredExpenses} userProfile={userProfile} />
            </div>
            <div className="bg-card p-4 rounded-2xl shadow-card">
              <h3 className="text-lg font-bold text-primary mb-4 text-center">Category Spending Over Time</h3>
              <CategoryTrendChart expenses={filteredExpenses} userProfile={userProfile} />
            </div>
          </div>
        ) : (
          <div className="bg-card p-8 rounded-2xl shadow-card text-center">
            <h3 className="text-xl font-semibold text-primary">No Data for This Period</h3>
            <p className="text-secondary mt-2">Try logging more activities or selecting a different time frame to see your insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InnerCompassScreen;