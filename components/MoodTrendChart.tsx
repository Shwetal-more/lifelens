import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MoodEntry, MoodType } from '../types';

interface MoodTrendChartProps {
  moods: MoodEntry[];
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

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ moods }) => {
    const data = moods
        .map(mood => ({
            date: mood.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            moodScore: moodToValue(mood.mood),
            moodLabel: mood.mood,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const moodLabels: { [key: number]: string } = {
        1: 'Sad', 2: 'Anxious', 3: 'Stressed', 4: 'Neutral', 5: 'Happy', 6: 'Excited'
    };
    
    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8A9BA8' }} axisLine={false} tickLine={false} />
                    <YAxis 
                        domain={[0, 7]} 
                        tickCount={7} 
                        tickFormatter={(value) => moodLabels[value] || ''}
                        tick={{ fontSize: 10, fill: '#8A9BA8' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            border: 'none',
                            borderRadius: '1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name, props) => [props.payload.moodLabel, 'Mood']}
                        labelStyle={{ color: '#2C3E50', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Line type="monotone" dataKey="moodScore" name="Mood Trend" stroke="#1DE9B6" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MoodTrendChart;
