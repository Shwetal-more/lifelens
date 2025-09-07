import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, UserProfile } from '../types';

interface InsightChartProps {
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

// Custom Tooltip for the area chart
const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
    if (active && payload && payload.length) {
        const essential = payload.find((p: any) => p.dataKey === 'essential')?.value || 0;
        const indulgence = payload.find((p: any) => p.dataKey === 'indulgence')?.value || 0;
        const totalSpending = essential + indulgence;

        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-primary mb-2">{label}</p>
                <p className="text-sm" style={{ color: '#2C3E50' }}>● Essential: {currencySymbol}{essential.toFixed(2)}</p>
                <p className="text-sm" style={{ color: '#FF8A65' }}>● Indulgence: {currencySymbol}{indulgence.toFixed(2)}</p>
                <p className="text-sm font-semibold text-primary mt-1">Total Spending: {currencySymbol}{totalSpending.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};


const InsightChart: React.FC<InsightChartProps> = ({ expenses, userProfile }) => {
    const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';
    
    // Aggregate data by day
    const dataByDate = new Map<string, { date: Date, essential: number, indulgence: number }>();

    expenses.forEach(expense => {
        const dateStr = expense.date.toDateString();
        if (!dataByDate.has(dateStr)) {
            dataByDate.set(dateStr, { date: expense.date, essential: 0, indulgence: 0 });
        }
        const dayData = dataByDate.get(dateStr)!;
        if (expense.isUseful) {
            dayData.essential += expense.amount;
        } else {
            dayData.indulgence += expense.amount;
        }
    });

    const chartData = Array.from(dataByDate.values())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map(item => ({
            date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            essential: item.essential,
            indulgence: item.indulgence,
        }));


  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 20,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8A9BA8' }} axisLine={false} tickLine={false} />
          <YAxis stroke="#2C3E50" tick={{ fontSize: 12, fill: '#8A9BA8' }} tickFormatter={(value) => `${currencySymbol}${value}`} axisLine={false} tickLine={false}/>
          
          <Tooltip 
            content={<CustomTooltip currencySymbol={currencySymbol} />}
            cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
          />

          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Area type="monotone" dataKey="essential" name="Essential" stackId="spending" stroke="#2C3E50" fill="#2C3E50" fillOpacity={0.8}/>
          <Area type="monotone" dataKey="indulgence" name="Indulgence" stackId="spending" stroke="#FF8A65" fill="#FF8A65" fillOpacity={0.8}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightChart;