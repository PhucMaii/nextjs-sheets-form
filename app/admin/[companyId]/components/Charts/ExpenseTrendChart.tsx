'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
	LineChart as RechartsLineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from 'recharts';
import { fetchApi } from '@/app/utils/db';
import { useParams } from 'next/navigation';
import { Skeleton, Box, Typography } from '@mui/material';
import { getAdminApiUrl } from '@/app/utils/enum';

interface ExpenseTrendChartProps {
	dateRange: any;
	revenueData?: any;
	height?: number;
}

interface ExpenseData {
	id: number;
	amount: number;
	description: string;
	category: string;
	date: string;
	companyId: number;
}

export default function ExpenseTrendChart({
	dateRange,
	revenueData,
	height = 300,
}: ExpenseTrendChartProps) {
	const { companyId }: any = useParams();
	const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchExpenseData = useCallback(async () => {
		try {
			setIsLoading(true);
			const data = await fetchApi(
				getAdminApiUrl(
					companyId,
					`/expenses/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
				),
			);
			setExpenseData(data || []);
		} catch (error) {
			console.error('Error fetching expense data:', error);
		} finally {
			setIsLoading(false);
		}
	}, [companyId, dateRange]);

	useEffect(() => {
		fetchExpenseData();
	}, [fetchExpenseData]);

	const formatCurrency = useCallback((value: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'CAD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}, []);

	// Memoize chart data to prevent unnecessary re-renders
	const chartData = useMemo(() => {
		if (!revenueData?.timeSeries || !expenseData.length) {
			return [];
		}

		// Group expenses by date
		const dailyExpenses = expenseData.reduce((acc, expense) => {
			const date = expense.date;
			if (acc[date]) {
				acc[date] += expense.amount;
			} else {
				acc[date] = expense.amount;
			}
			return acc;
		}, {} as Record<string, number>);

		// Create combined data with stable object references
		return revenueData.timeSeries.map((date: string, index: number) => {
			const revenue = revenueData.thisMonth[index] || 0;
			const expense = dailyExpenses[date] || 0;
			// const profit = revenue - expense;

			return {
				// date: new Date(date).toLocaleDateString('en-US', {
				// 	month: 'short',
				// 	day: 'numeric',
				// }),
				date,
				revenue: Number(revenue.toFixed(2)),
				expense: Number(expense.toFixed(2)),
				// profit: Number(profit.toFixed(2)),
			};
		});
	}, [revenueData?.timeSeries, revenueData?.thisMonth, expenseData]);

	// Memoize the tooltip formatter
	const tooltipFormatter = useCallback((value: number, name: string) => [
		formatCurrency(value),
		name.charAt(0).toUpperCase() + name.slice(1),
	], [formatCurrency]);

	// Memoize the label formatter
	const labelFormatter = useCallback((label: string) => `Date: ${label}`, []);

	if (isLoading) {
		return <Skeleton variant="rounded" height={height} />;
	}

	if (!chartData.length) {
		return (
			<Box
				sx={{
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					gap: 2,
				}}
			>
				<Typography variant="body1" color="text.secondary">
					No expense data available
				</Typography>
				<Typography variant="caption" color="text.secondary">
					Add expenses to see trends
				</Typography>
			</Box>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={height}>
			<RechartsLineChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
				<XAxis
					dataKey="date"
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
					formatter={tooltipFormatter}
					labelFormatter={labelFormatter}
				/>
				<Legend />
				<Line
					type="monotone"
					dataKey="revenue"
					stroke="#4caf50"
					strokeWidth={3}
					dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
					activeDot={{ r: 6, stroke: '#4caf50', strokeWidth: 2 }}
					name="Revenue"
					isAnimationActive={false}
				/>
				<Line
					type="monotone"
					dataKey="expense"
					stroke="#f44336"
					strokeWidth={3}
					dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
					activeDot={{ r: 6, stroke: '#f44336', strokeWidth: 2 }}
					name="Expenses"
					isAnimationActive={false}
				/>
				{/* <Line
					type="monotone"
					dataKey="profit"
					stroke="#2196f3"
					strokeWidth={3}
					dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
					activeDot={{ r: 6, stroke: '#2196f3', strokeWidth: 2 }}
					name="Profit"
					isAnimationActive={false}
				/> */}
			</RechartsLineChart>
		</ResponsiveContainer>
	);
} 