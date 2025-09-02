import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, MoodEntry, MoodType, UserProfile } from '../types';

interface InsightChartProps {
  expenses: Expense[];
  moods: MoodEntry[];
  userProfile: UserProfile | null;
}

const moodToValue = (mood: MoodType): number => {
    const moodMap: Record<MoodType, number> = {
        [MoodType.Sad]: 1,
        [MoodType.Anxious]: 2,
        [MoodType.Stressed]: 3,
        [MoodType.Neutral]: 4,
        [MoodType.Happy]: 5,
        [MoodType.Excited]: 6,
    };
    return moodMap[mood] || 3;
};

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
};


const InsightChart: React.FC<InsightChartProps> = ({ expenses, moods, userProfile }) => {
    const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
    
    const combinedData = expenses.map(expense => {
        const expenseDate = expense.date.toLocaleDateString();
        const moodOnDay = moods.find(mood => mood.date.toLocaleDateString() === expenseDate);
        return {
            date: expense.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            spending: expense.amount,
            mood: moodOnDay ? moodToValue(moodOnDay.mood) : null,
            moodLabel: moodOnDay ? moodOnDay.mood : 'N/A'
        };
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={combinedData}
          margin={{
            top: 20,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8A9BA8' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" orientation="left" stroke="#2C3E50" tick={{ fontSize: 12, fill: '#8A9BA8' }} tickFormatter={(value) => `${currencySymbol}${value}`} axisLine={false} tickLine={false}/>
          <YAxis yAxisId="right" orientation="right" stroke="#1DE9B6" domain={[0, 6]} tick={{ fontSize: 12, fill: '#8A9BA8' }} tickFormatter={(value) => Object.keys(MoodType).find(key => moodToValue(MoodType[key as keyof typeof MoodType]) === value) || ''} axisLine={false} tickLine={false}/>
          <Tooltip 
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: 'none',
                borderRadius: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
             formatter={(value, name, props) => {
                 if (name === 'mood') return [props.payload.moodLabel, 'Mood'];
                 if (name === 'spending') return [`${currencySymbol}${Number(value).toFixed(2)}`, 'Spending'];
                 return value;
            }}
             labelStyle={{ color: '#2C3E50', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar yAxisId="left" dataKey="spending" fill="#2C3E50" name="Spending" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="mood" fill="#1DE9B6" name="Mood" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightChart;