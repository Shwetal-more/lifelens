import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense, UserProfile } from '../types';

interface CategoryPieChartProps {
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

const COLORS = ['#2C3E50', '#1DE9B6', '#8A9BA8', '#FF8A65', '#4FC3F7', '#FFD54F'];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ expenses, userProfile }) => {
    const currencySymbol = userProfile ? currencySymbols[userProfile.currency] : '$';

    const processedData = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
    }, {} as { [key: string]: number });

    const chartData = Object.entries(processedData).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
    }));

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


    return (
        <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            border: 'none',
                            borderRadius: '1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value) => [`${currencySymbol}${Number(value).toFixed(2)}`]}
                    />
                    <Legend iconSize={12} wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CategoryPieChart;
