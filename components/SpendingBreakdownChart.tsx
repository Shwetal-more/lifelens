import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, UserProfile } from '../types';

interface SpendingBreakdownChartProps {
  expenses: Expense[];
  userProfile: UserProfile | null;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
};

const SpendingBreakdownChart: React.FC<SpendingBreakdownChartProps> = ({ expenses, userProfile }) => {
    const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';

    const processedData = expenses.reduce((acc, expense) => {
        const date = expense.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = { date, essential: 0, indulgence: 0 };
        }
        if (expense.isUseful) {
            acc[date].essential += expense.amount;
        } else {
            acc[date].indulgence += expense.amount;
        }
        return acc;
    }, {} as { [key: string]: { date: string, essential: number, indulgence: number } });

    const chartData = Object.values(processedData).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8A9BA8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#8A9BA8' }} tickFormatter={(value) => `${currencySymbol}${value}`} axisLine={false} tickLine={false} />
                    <Tooltip 
                         contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            border: 'none',
                            borderRadius: '1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value) => [`${currencySymbol}${Number(value).toFixed(2)}`]}
                        labelStyle={{ color: '#2C3E50', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} iconSize={12} />
                    <Bar dataKey="essential" stackId="a" fill="#2C3E50" name="Essential" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="indulgence" stackId="a" fill="#FF8A65" name="Indulgence" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingBreakdownChart;
