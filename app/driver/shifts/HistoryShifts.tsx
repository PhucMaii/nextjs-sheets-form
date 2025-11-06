import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { IShiftSession } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import {
	Box,
	Grid,
	Typography,
	Paper,
	Container,
	useMediaQuery,
	Chip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShiftSummary from '../components/ShiftSummary';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '@/app/admin/[companyId]/components/Select/SelectDateRange';
import { PayrollType } from '@prisma/client';
import { primary, success, warning } from '@/theme/color';
import { alpha } from '@mui/material/styles';
import ErrorComponent from '@/app/admin/[companyId]/components/ErrorComponent';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface StatCardProps {
	label: string;
	current: string | number;
	color: string;
	icon: React.ReactNode;
}

function StatCard({ label, current, color, icon }: StatCardProps) {
	const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

	return (
		<Paper
			elevation={0}
			sx={{
				p: isMobile ? 2 : 2.5,
				borderRadius: 3,
				background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
				border: `1.5px solid ${alpha(color, 0.3)}`,
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				position: 'relative',
				overflow: 'hidden',
				transition: 'transform 0.2s ease, box-shadow 0.2s ease',
				'&:hover': {
					transform: 'translateY(-2px)',
					boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
				},
			}}
		>
			<Box
				sx={{
					position: 'absolute',
					top: -20,
					right: -20,
					width: 80,
					height: 80,
					borderRadius: '50%',
					background: alpha(color, 0.1),
					zIndex: 0,
				}}
			/>
			<Box position="relative" zIndex={1}>
				<Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
					<Typography
						variant="caption"
						fontWeight={700}
						color={color}
						textTransform="uppercase"
						letterSpacing={1}
						fontSize={isMobile ? '0.7rem' : '0.75rem'}
					>
						{label}
					</Typography>
					<Box
						sx={{
							color: color,
							display: 'flex',
							alignItems: 'center',
							backgroundColor: alpha(color, 0.15),
							padding: 1,
							borderRadius: 2,
						}}
					>
						{React.cloneElement(icon as React.ReactElement, {
							sx: { fontSize: isMobile ? 22 : 26 },
						})}
					</Box>
				</Box>
				<Typography
					variant={isMobile ? 'h5' : 'h4'}
					fontWeight={800}
					color={color}
					lineHeight={1.1}
				>
					{current}
				</Typography>
			</Box>
		</Paper>
	);
}

export default function HistoryShifts() {
	const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
	const [shifts, setShifts] = useState<IShiftSession[]>([]);

	const { showNotification, NotificationComp } = useNotification();

	useEffect(() => {
		fetchShifts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRange]);

	const shiftOverview = useMemo(() => {
		if (shifts.length === 0) {
			return {
				totalHours: 0,
				estEarnings: 0,
			};
		}

		const totalHours = shifts?.reduce((acc: number, shift: any) => {
			return acc + shift.hours;
		}, 0);

		let estEarnings = 0;

		if (shifts[0]?.employee?.payrollType === PayrollType.hourly) {
			estEarnings = shifts?.reduce((acc: number, shift: any) => {
				return acc + shift.cost;
			}, 0);
		} else {
			estEarnings = shifts[0]?.employee?.payRate || 0;
		}

		return {
			totalHours: totalHours.toFixed(2),
			estEarnings: estEarnings.toFixed(2),
		};
	}, [shifts]);

	const fetchShifts = async () => {
		try {
			const response = await axios.get(
				`${API_URL.DRIVER}/shift?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
			);

			if (response.data.error) {
				showNotification('error', response.data.error);
				return;
			}

			setShifts(response.data.data);
		} catch (error: any) {
			console.log('There was an error: ', error);
			showNotification('error', 'There was an error: ' + error);
		}
	};

	return (
		<>
			{NotificationComp}
			<Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 2 }, pb: 4 }}>
				{/* Date Range Selector */}
				<Paper
					elevation={0}
					sx={{
						p: 2,
						mb: 3,
						borderRadius: 3,
						background: `linear-gradient(135deg, ${alpha(primary.main, 0.05)} 0%, ${alpha(primary.main, 0.02)} 100%)`,
						border: `1px solid ${alpha(primary.main, 0.1)}`,
					}}
				>
					<Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
						<CalendarTodayIcon sx={{ color: primary.main, fontSize: 24 }} />
						<Typography variant="h6" fontWeight={700} color="text.primary">
							Select Date Range
						</Typography>
					</Box>
					<SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
				</Paper>

				{/* Stats Cards */}
				<Box mb={3}>
					<Typography
						variant="h6"
						fontWeight={700}
						color="text.primary"
						sx={{ mb: 2 }}
					>
						Overview
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={4}>
							<StatCard
								label="Total Shifts"
								current={shifts.length}
								color={primary.main}
								icon={<ScheduleIcon />}
							/>
						</Grid>
						<Grid item xs={12} sm={4}>
							<StatCard
								label="Total Hours"
								current={`${shiftOverview?.totalHours || 0}h`}
								color={warning.main}
								icon={<AccessTimeIcon />}
							/>
						</Grid>
						<Grid item xs={12} sm={4}>
							<StatCard
								label="Est. Earnings"
								current={`$${shiftOverview?.estEarnings || 0}`}
								color={success.main}
								icon={<AttachMoneyIcon />}
							/>
						</Grid>
					</Grid>
				</Box>

				{/* Shifts List */}
				{shifts.length > 0 ? (
					<Box>
						<Typography
							variant="h6"
							fontWeight={700}
							color="text.primary"
							sx={{ mb: 2 }}
						>
							Shift History
							<Chip
								label={shifts.length}
								size="small"
								sx={{
									ml: 1,
									height: 24,
									fontWeight: 600,
									backgroundColor: alpha(primary.main, 0.1),
									color: primary.main,
								}}
							/>
						</Typography>
						<Box display="flex" flexDirection="column" gap={1.5}>
							{shifts.map((shift: IShiftSession, index: number) => (
								<Paper
									key={index}
									elevation={0}
									sx={{
										borderRadius: 3,
										border: '1.5px solid',
										borderColor: 'divider',
										overflow: 'hidden',
										transition: 'all 0.2s ease',
										'&:hover': {
											borderColor: primary.main,
											boxShadow: `0 4px 12px ${alpha(primary.main, 0.15)}`,
											transform: 'translateY(-2px)',
										},
									}}
								>
									<Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
										<ShiftSummary shift={shift} />
									</Box>
								</Paper>
							))}
						</Box>
					</Box>
				) : (
					<Paper
						elevation={0}
						sx={{
							p: 6,
							borderRadius: 3,
							border: '1px dashed',
							borderColor: 'divider',
							textAlign: 'center',
						}}
					>
						<ErrorComponent errorText="No shifts found for this date range" />
					</Paper>
				)}
			</Container>
		</>
	);
}
