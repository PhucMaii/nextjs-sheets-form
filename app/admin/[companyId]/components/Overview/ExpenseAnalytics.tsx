'use client';

import React, { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Typography,
	Grid,
	Card,
	CardContent,
	Alert,
	LinearProgress,
} from '@mui/material';
import {
	TrendingUp,
	TrendingDown,
	Warning,
	AttachMoney,
	Category,
	Savings,
	Lightbulb,
} from '@mui/icons-material';
import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import DonutChart from '../Charts/DonutChart';
import BarChart from '../Charts/BarChart';
import LineChart from '../Charts/LineChart';
import {
	primary,
	success,
	error,
	warning,
	info,
	neutral,
} from '@/theme/color';

interface ExpenseAnalyticsProps {
	overviewData: any;
	dateRange: any;
}

interface ExpenseData {
	id: number;
	amount: number;
	description: string;
	category: string;
	date: string;
	companyId: number;
}

const themeColors = {
	primary: {
		main: primary.main,
		light: primary.light,
		dark: primary.dark,
		gradient: `linear-gradient(135deg, ${primary.main} 0%, ${primary.dark} 100%)`,
		background: primary.lightest,
	},
	success: {
		main: success.main,
		light: success.light,
		dark: success.dark,
		gradient: `linear-gradient(135deg, ${success.main} 0%, ${success.dark} 100%)`,
		background: success.lightest,
	},
	error: {
		main: error.main,
		light: error.light,
		dark: error.dark,
		gradient: `linear-gradient(135deg, ${error.main} 0%, ${error.dark} 100%)`,
		background: error.lightest,
	},
	warning: {
		main: warning.main,
		light: warning.light,
		dark: warning.dark,
		gradient: `linear-gradient(135deg, ${warning.main} 0%, ${warning.dark} 100%)`,
		background: warning.lightest,
	},
	info: {
		main: info.main,
		light: info.light,
		dark: info.dark,
		gradient: `linear-gradient(135deg, ${info.main} 0%, ${info.dark} 100%)`,
		background: info.lightest,
	},
};

export default function ExpenseAnalytics({
	overviewData,
	dateRange,
}: ExpenseAnalyticsProps) {
	const { companyId }: any = useParams();
	const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchExpenseData();
	}, [dateRange]);

	const fetchExpenseData = async () => {
		try {
			setIsLoading(true);
			const data = await fetchApi(
				getAdminApiUrl(
					companyId,
					`/expense?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
				),
			);
			setExpenseData(data || []);
		} catch (error) {
			console.error('Error fetching expense data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Calculate expense insights
	const getExpenseInsights = () => {
		if (!expenseData.length) return null;

		const totalExpense = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
		const avgExpense = totalExpense / expenseData.length;
		const maxExpense = Math.max(...expenseData.map(e => e.amount));
		const minExpense = Math.min(...expenseData.map(e => e.amount));

		// Group by category
		const categoryExpenses = expenseData.reduce((acc, expense) => {
			acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
			return acc;
		}, {} as Record<string, number>);

		// Group by date for trend analysis
		const dailyExpenses = expenseData.reduce((acc, expense) => {
			const date = new Date(expense.date).toLocaleDateString();
			acc[date] = (acc[date] || 0) + expense.amount;
			return acc;
		}, {} as Record<string, number>);

		// Find top expense categories
		const topCategories = Object.entries(categoryExpenses)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5);

		// Calculate expense efficiency metrics
		const revenue = overviewData?.revenue || 0;
		const expenseRatio = revenue > 0 ? (totalExpense / revenue) * 100 : 0;
		const profitMargin = revenue > 0 ? ((revenue - totalExpense) / revenue) * 100 : 0;

		return {
			totalExpense,
			avgExpense,
			maxExpense,
			minExpense,
			categoryExpenses,
			dailyExpenses,
			topCategories,
			expenseRatio,
			profitMargin,
			expenseCount: expenseData.length,
		};
	};

	const insights = getExpenseInsights();

	// Prepare chart data
	const getCategoryChartData = () => {
		if (!insights) return [];
		return Object.entries(insights.categoryExpenses).map(([category, amount]) => ({
			label: category,
			value: amount,
			color: getCategoryColor(category),
		}));
	};

	const getDailyExpenseData = () => {
		if (!insights) return { categories: [], data: [] };
		const sortedDates = Object.keys(insights.dailyExpenses).sort();
		return {
			categories: sortedDates,
			data: sortedDates.map(date => insights.dailyExpenses[date]),
		};
	};

	const getCategoryColor = (category: string) => {
		const colors = [
			error.main,
			warning.main,
			info.main,
			success.main,
			primary.main,
			neutral[500],
		];
		const index = category.length % colors.length;
		return colors[index];
	};

	// Get optimization recommendations
	const getOptimizationTips = () => {
		if (!insights) return [];
		const tips = [];

		if (insights.expenseRatio > 80) {
			tips.push({
				type: 'warning',
				message: 'Expense ratio is high (>80%). Consider cost-cutting measures.',
				icon: <Warning />,
			});
		}

		if (insights.profitMargin < 20) {
			tips.push({
				type: 'error',
				message: 'Low profit margin. Focus on reducing operational costs.',
				icon: <TrendingDown />,
			});
		}

		const topCategory = insights.topCategories[0];
		if (topCategory && topCategory[1] > insights.totalExpense * 0.4) {
			tips.push({
				type: 'info',
				message: `${topCategory[0]} accounts for ${((topCategory[1] / insights.totalExpense) * 100).toFixed(1)}% of expenses. Review for optimization.`,
				icon: <Category />,
			});
		}

		if (insights.avgExpense > insights.totalExpense * 0.1) {
			tips.push({
				type: 'info',
				message: 'High average expense per transaction. Consider bulk purchasing.',
				icon: <Savings />,
			});
		}

		return tips;
	};

	if (isLoading) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: 3,
					background: `linear-gradient(135deg, ${themeColors.error.background} 0%, #ffffff 100%)`,
					border: '1px solid',
					borderColor: themeColors.error.light,
					borderRadius: 3,
					boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				}}
			>
				<LinearProgress />
			</Paper>
		);
	}

	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				background: `linear-gradient(135deg, ${themeColors.error.background} 0%, #ffffff 100%)`,
				border: '1px solid',
				borderColor: themeColors.error.light,
				borderRadius: 3,
				boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'&:hover': {
					boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
					transform: 'translateY(-2px)',
					transition: 'all 0.3s ease',
				},
			}}
		>
			{/* Header */}
			<Box display="flex" alignItems="center" gap={2} mb={3}>
				<Box
					sx={{
						p: 1.5,
						borderRadius: 2,
						background: themeColors.error.gradient,
						color: 'white',
						boxShadow: `0 4px 6px -1px ${error.main}40`,
					}}
				>
					<AttachMoney />
				</Box>
				<Box>
					<Typography variant="h6" fontWeight="bold">
						Expense Analytics
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Cost analysis and optimization insights
					</Typography>
				</Box>
			</Box>

			{!insights ? (
				<Alert severity="info">No expense data available for the selected period.</Alert>
			) : (
				<>
					{/* Key Metrics */}
					<Grid container spacing={3} mb={4}>
						<Grid item xs={12} sm={6} md={3}>
							<Card
								sx={{
									background: `linear-gradient(135deg, ${error.lightest} 0%, #ffffff 100%)`,
									border: '1px solid',
									borderColor: error.light,
									borderRadius: 2,
								}}
							>
								<CardContent>
									<Typography variant="h4" fontWeight="bold" color="error.main">
										${insights.totalExpense.toFixed(2)}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Total Expenses
									</Typography>
									<Box display="flex" alignItems="center" gap={1} mt={1}>
										<Typography variant="caption" color="text.secondary">
											{insights.expenseCount} transactions
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<Card
								sx={{
									background: `linear-gradient(135deg, ${warning.lightest} 0%, #ffffff 100%)`,
									border: '1px solid',
									borderColor: warning.light,
									borderRadius: 2,
								}}
							>
								<CardContent>
									<Typography variant="h4" fontWeight="bold" color="warning.main">
										{insights.expenseRatio.toFixed(1)}%
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Expense Ratio
									</Typography>
									<Box display="flex" alignItems="center" gap={1} mt={1}>
										{insights.expenseRatio > 80 ? (
											<TrendingUp color="error" fontSize="small" />
										) : (
											<TrendingDown color="success" fontSize="small" />
										)}
										<Typography variant="caption" color="text.secondary">
											{insights.expenseRatio > 80 ? 'High' : 'Good'}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<Card
								sx={{
									background: `linear-gradient(135deg, ${success.lightest} 0%, #ffffff 100%)`,
									border: '1px solid',
									borderColor: success.light,
									borderRadius: 2,
								}}
							>
								<CardContent>
									<Typography variant="h4" fontWeight="bold" color="success.main">
										{insights.profitMargin.toFixed(1)}%
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Profit Margin
									</Typography>
									<Box display="flex" alignItems="center" gap={1} mt={1}>
										{insights.profitMargin < 20 ? (
											<TrendingDown color="error" fontSize="small" />
										) : (
											<TrendingUp color="success" fontSize="small" />
										)}
										<Typography variant="caption" color="text.secondary">
											{insights.profitMargin < 20 ? 'Low' : 'Healthy'}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<Card
								sx={{
									background: `linear-gradient(135deg, ${info.lightest} 0%, #ffffff 100%)`,
									border: '1px solid',
									borderColor: info.light,
									borderRadius: 2,
								}}
							>
								<CardContent>
									<Typography variant="h4" fontWeight="bold" color="info.main">
										${insights.avgExpense.toFixed(2)}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Avg per Transaction
									</Typography>
									<Box display="flex" alignItems="center" gap={1} mt={1}>
										<Typography variant="caption" color="text.secondary">
											Max: ${insights.maxExpense.toFixed(2)}
										</Typography>
									</Box>
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					{/* Charts Section */}
					<Grid container spacing={3} mb={4}>
						{/* Expense Categories Donut Chart */}
						<Grid item xs={12} md={6}>
							<Box
								sx={{
									p: 2,
									background: 'white',
									borderRadius: 2,
									border: '1px solid',
									borderColor: 'white',
								}}
							>
								<Typography variant="h6" fontWeight="bold" mb={2}>
									Expense by Category
								</Typography>
								<DonutChart
									data={getCategoryChartData()}
									title=""
									height={250}
								/>
							</Box>
						</Grid>

						{/* Daily Expense Trend */}
						<Grid item xs={12} md={6}>
							<Box
								sx={{
									p: 2,
									background: 'white',
									borderRadius: 2,
									border: '1px solid',
									borderColor: 'white',
								}}
							>
								<Typography variant="h6" fontWeight="bold" mb={2}>
									Daily Expense Trend
								</Typography>
								<LineChart
									categories={getDailyExpenseData().categories}
									data={getDailyExpenseData().data}
									color={error.main}
									height={250}
								/>
							</Box>
						</Grid>
					</Grid>

					{/* Top Expense Categories */}
					<Grid container spacing={3} mb={4}>
						<Grid item xs={12}>
							<Box
								sx={{
									p: 2,
									background: 'white',
									borderRadius: 2,
									border: '1px solid',
									borderColor: 'white',
								}}
							>
								<Typography variant="h6" fontWeight="bold" mb={2}>
									Top Expense Categories
								</Typography>
								<BarChart
									categories={insights.topCategories.map(([category]) => category)}
									data={insights.topCategories.map(([, amount]) => amount)}
									title=""
									color={error.main}
									height={200}
									horizontal={true}
								/>
							</Box>
						</Grid>
					</Grid>

					{/* Optimization Recommendations */}
					<Grid container spacing={3}>
						<Grid item xs={12}>
							<Box
								sx={{
									p: 2,
									background: 'white',
									borderRadius: 2,
									border: '1px solid',
									borderColor: 'white',
								}}
							>
								<Box display="flex" alignItems="center" gap={1} mb={2}>
									<Lightbulb color="warning" />
									<Typography variant="h6" fontWeight="bold">
										Cost Optimization Tips
									</Typography>
								</Box>
								<Grid container spacing={2}>
									{getOptimizationTips().map((tip, index) => (
										<Grid item xs={12} sm={6} key={index}>
											<Alert
												severity={tip.type as any}
												icon={tip.icon}
												sx={{ mb: 1 }}
											>
												<Typography variant="body2">
													{tip.message}
												</Typography>
											</Alert>
										</Grid>
									))}
								</Grid>
							</Box>
						</Grid>
					</Grid>
				</>
			)}
		</Paper>
	);
} 