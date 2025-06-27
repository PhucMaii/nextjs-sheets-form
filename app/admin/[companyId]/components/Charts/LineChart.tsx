'use client';

import React from 'react';
import {
	LineChart as RechartsLineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

interface LineChartProps {
	categories: string[];
	data: number[];
	color?: string;
	height?: number;
}

export default function LineChart({
	categories,
	data,
	color = '#1976d2',
	height = 300,
}: LineChartProps) {
	const chartData = categories.map((category, index) => ({
		name: category,
		value: data[index] || 0,
	}));

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	return (
		<ResponsiveContainer width="100%" height={height}>
			<RechartsLineChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
				<XAxis
					dataKey="name"
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: '#666' }}
				/>
				<YAxis
					axisLine={false}
					tickLine={false}
					tick={{ fontSize: 12, fill: '#666' }}
					tickFormatter={formatCurrency}
				/>
				<Tooltip
					contentStyle={{
						backgroundColor: '#fff',
						border: '1px solid #e0e0e0',
						borderRadius: '8px',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
					}}
					formatter={(value: number) => [formatCurrency(value), 'Amount']}
					labelFormatter={(label) => `Date: ${label}`}
				/>
				<Line
					type="monotone"
					dataKey="value"
					stroke={color}
					strokeWidth={3}
					dot={{ fill: color, strokeWidth: 2, r: 4 }}
					activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
				/>
			</RechartsLineChart>
		</ResponsiveContainer>
	);
} 