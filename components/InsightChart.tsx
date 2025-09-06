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

// Custom Tooltip for combined chart
const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const essential = data.essential || 0;
        const indulgence = data.indulgence || 0;
        const totalSpending = essential + indulgence;

        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-primary mb-2">{label}</p>
                {totalSpending > 0 && (
                    <>
                        <p className="text-sm" style={{ color: '#2C3E50' }}>● Essential: {currencySymbol}{essential.toFixed(2)}</p>
                        <p className="text-sm" style={{ color: '#FF8A65' }}>● Indulgence: {currencySymbol}{indulgence.toFixed(2)}</p>
                        <p className="text-sm font-semibold text-primary mt-1">Total Spending: {currencySymbol}{totalSpending.toFixed(2)}</p>
                    </>
                )}
                {data.moodLabel !== 'N/A' && (
                    <p className={`text-sm mt-2 pt-2 ${totalSpending > 0 ? 'border-t' : ''}`} style={{ color: '#1DE9B6' }}>● Mood: {data.moodLabel}</p>
                )}
            </div>
        );
    }
    return null;
};


const InsightChart: React.FC<InsightChartProps> = ({ expenses, moods, userProfile }) => {
    const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
    
    // Aggregate data by day
    const dataByDate = new Map<string, { date: Date, essential: number, indulgence: number, mood: MoodType | null }>();

    expenses.forEach(expense => {
        const dateStr = expense.date.toDateString();
        if (!dataByDate.has(dateStr)) {
            dataByDate.set(dateStr, { date: expense.date, essential: 0, indulgence: 0, mood: null });
        }
        const dayData = dataByDate.get(dateStr)!;
        if (expense.isUseful) {
            dayData.essential += expense.amount;
        } else {
            dayData.indulgence += expense.amount;
        }
    });

    moods.forEach(mood => {
        const dateStr = mood.date.toDateString();
        if (!dataByDate.has(dateStr)) {
            dataByDate.set(dateStr, { date: mood.date, essential: 0, indulgence: 0, mood: null });
        }
        // If multiple moods on a day, this will take the last one, which is fine for this visualization
        dataByDate.get(dateStr)!.mood = mood.mood;
    });

    const combinedData = Array.from(dataByDate.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(item => ({
            date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            essential: item.essential,
            indulgence: item.indulgence,
            mood: item.mood ? moodToValue(item.mood) : null,
            moodLabel: item.mood || 'N/A'
        }));


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
            content={<CustomTooltip currencySymbol={currencySymbol} />}
            cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
          />

          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar yAxisId="left" dataKey="essential" name="Essential" stackId="spending" fill="#2C3E50" />
          <Bar yAxisId="left" dataKey="indulgence" name="Indulgence" stackId="spending" fill="#FF8A65" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="mood" fill="#1DE9B6" name="Mood" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightChart;