import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, UserProfile } from '../types';

interface CategoryTrendChartProps {
  expenses: Expense[];
  userProfile: UserProfile | null;
}

const currencySymbols: { [key: string]: string } = {
  'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'JPY': '¥',
};

const COLORS = ['#2C3E50', '#1DE9B6', '#FF8A65', '#4FC3F7', '#FFD54F', '#F06292', '#BA68C8', '#8A9BA8'];

const CustomTooltip = ({ active, payload, label, currencySymbol }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-bold text-primary mb-2">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} style={{ color: pld.stroke }}>
                        ● {pld.name}: {currencySymbol}{(pld.value || 0).toFixed(2)}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CategoryTrendChart: React.FC<CategoryTrendChartProps> = ({ expenses, userProfile }) => {
    const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';

    const { chartData, categories } = useMemo(() => {
        const dataByDate: { [date: string]: { [category: string]: number } } = {};
        const allCategories = new Set<string>();

        expenses.forEach(expense => {
            const date = expense.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dataByDate[date]) {
                dataByDate[date] = {};
            }
            if (!dataByDate[date][expense.category]) {
                dataByDate[date][expense.category] = 0;
            }
            dataByDate[date][expense.category] += expense.amount;
            allCategories.add(expense.category);
        });
        
        const sortedCategories = Array.from(allCategories).sort();

        const sortedChartData = Object.entries(dataByDate).map(([date, categoryData]) => {
            const entry: {[key: string]: any} = { date };
            sortedCategories.forEach(cat => {
                entry[cat] = categoryData[cat] || 0;
            });
            return entry;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return { chartData: sortedChartData, categories: sortedCategories };
    }, [expenses]);
    
    if (expenses.length === 0) {
        return (
            <div className="w-full h-72 flex items-center justify-center text-secondary">
                <p>No spending data for this period.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#8A9BA8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#8A9BA8' }} tickFormatter={(value) => `${currencySymbol}${value}`} axisLine={false} tickLine={false} />
                    <Tooltip 
                        content={<CustomTooltip currencySymbol={currencySymbol} />}
                        cursor={{ stroke: 'rgba(200, 200, 200, 0.5)', strokeWidth: 1 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconSize={10} />
                    {categories.map((cat, index) => (
                        <Line
                            key={cat}
                            type="monotone"
                            dataKey={cat}
                            stroke={COLORS[index % COLORS.length]}
                            name={cat}
                            strokeWidth={2.5}
                            dot={{ r: 3, strokeWidth: 1, fill: 'white' }}
                            activeDot={{ r: 6, strokeWidth: 2 }}
                         />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoryTrendChart;