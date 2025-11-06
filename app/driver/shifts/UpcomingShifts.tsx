import {
	Box,
	Divider,
	Grid,
	Typography,
	Paper,
	Container,
	useMediaQuery,
	Chip,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import '../../../styles/swiper.css';
import { generateWeekRange } from '@/app/utils/time';
import { getDaysOfThisWeek } from '@/pages/api/utils/date';
import { grey } from '@mui/material/colors';
import { IScheduledShift } from '@/app/utils/type';
import { fetchApi } from '@/app/utils/db';
import UpcomingShift from '../components/UpcomingShift';
import SelectWeek from '@/app/admin/[companyId]/components/Select/SelectWeek';
import ErrorComponent from '@/app/admin/[companyId]/components/ErrorComponent';
import { primary } from '@/theme/color';
import { alpha } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';

export default function UpcomingShifts() {
	const [shiftsInRange, setShiftsInRange] = useState<IScheduledShift[]>([]);
	const [selectedDate, setSelectedDate] = useState<string>(() => {
		const today = new Date();
		return today.toLocaleDateString('en-US', { dateStyle: 'full' });
	});
	const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

	const [selectedWeek, setSelectedWeek] = useState<any>(() =>
		generateWeekRange(),
	);

	const daysInWeek = useMemo(() => {
		if (!selectedWeek) return [];
		const dates = getDaysOfThisWeek(selectedWeek[0], selectedWeek[1]);
		return dates;
	}, [selectedWeek]);

	const shiftsInDate = useMemo(() => {
		if (shiftsInRange.length > 0 && selectedDate) {
			return shiftsInRange.filter((shift) => shift.date === selectedDate);
		}
		return [];
	}, [shiftsInRange, selectedDate]);

	const overviewData = useMemo(() => {
		if (shiftsInRange.length === 0) return { shifts: 0, hours: 0 };

		return {
			shifts: shiftsInRange.length,
			hours: shiftsInRange.reduce((acc, shift) => acc + (shift.hours || 0), 0),
		};
	}, [shiftsInRange]);

	useEffect(() => {
		fetchScheduledShifts();

		if (daysInWeek.length > 0) {
			const today = new Date();
			const todayString = today.toLocaleDateString('en-US', {
				dateStyle: 'full',
			});

			const isInThisWeek = daysInWeek.includes(todayString);
			if (isInThisWeek) {
				setSelectedDate(todayString);
			} else {
				setSelectedDate(daysInWeek[0]);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedWeek, daysInWeek]);

	const fetchScheduledShifts = async () => {
		const data = await fetchApi(
			`/api/drivers/scheduled-shifts?startedDate=${selectedWeek[0]}&endedDate=${selectedWeek[1]}`,
		);
		setShiftsInRange(data || []);
	};

	return (
		<Container maxWidth={false} sx={{ px: { xs: 1.5, sm: 2 }, pb: 4 }}>
			{/* Week Selector and Stats */}
			<Paper
				elevation={0}
				sx={{
					p: 2.5,
					mb: 3,
					borderRadius: 3,
					background: `linear-gradient(135deg, ${alpha(primary.main, 0.05)} 0%, ${alpha(primary.main, 0.02)} 100%)`,
					border: `1px solid ${alpha(primary.main, 0.1)}`,
				}}
			>
				<Box display="flex" alignItems="center" gap={1.5} mb={2}>
					<CalendarTodayIcon sx={{ color: primary.main, fontSize: 24 }} />
					<Typography variant="h6" fontWeight={700} color="text.primary">
						Select Week
					</Typography>
				</Box>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} sm={6}>
						<SelectWeek
							selectedWeek={selectedWeek}
							setSelectedWeek={setSelectedWeek}
							variant="standard"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						sm={6}
						sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: { xs: 'flex-start', sm: 'flex-end' },
							gap: 2,
						}}
					>
						<Paper
							elevation={0}
							sx={{
								px: 2.5,
								py: 1.5,
								borderRadius: 3,
								border: `1.5px solid ${alpha(primary.main, 0.2)}`,
								background: alpha(primary.main, 0.05),
							}}
						>
							<Box display="flex" alignItems="center" gap={3}>
								<Box display="flex" flexDirection="column" alignItems="center">
									<Typography
										fontWeight={800}
										variant="h5"
										color="primary.main"
										lineHeight={1}
									>
										{overviewData.shifts}
									</Typography>
									<Typography
										variant="caption"
										sx={{ color: grey[600], fontWeight: 600, mt: 0.5 }}
									>
										shifts
									</Typography>
								</Box>
								<Divider orientation="vertical" flexItem />
								<Box display="flex" flexDirection="column" alignItems="center">
									<Typography
										fontWeight={800}
										variant="h5"
										color="primary.main"
										lineHeight={1}
									>
										{overviewData.hours.toFixed(1)}
									</Typography>
									<Typography
										variant="caption"
										sx={{ color: grey[600], fontWeight: 600, mt: 0.5 }}
									>
										hours
									</Typography>
								</Box>
							</Box>
						</Paper>
					</Grid>
				</Grid>
			</Paper>

			{/* Date Picker Swiper */}
			<Box mb={3}>
				<Box display="flex" alignItems="center" gap={1.5} mb={2}>
					<EventIcon sx={{ color: primary.main, fontSize: 24 }} />
					<Typography variant="h6" fontWeight={700} color="text.primary">
						Select Date
					</Typography>
				</Box>
				<Swiper
					modules={[]}
					spaceBetween={isMobile ? 10 : 12}
					slidesPerView={isMobile ? 3.2 : 4}
					style={{ padding: isMobile ? '8px 12px' : '12px 20px' }}
				>
					{daysInWeek.map((day) => {
						const hasShift =
							shiftsInRange.length > 0 &&
							shiftsInRange.find((shift) => shift.date === day);
						const isSelected = selectedDate === day;
						const isToday =
							day ===
							new Date().toLocaleDateString('en-US', { dateStyle: 'full' });

						return (
							<SwiperSlide key={day}>
								<Paper
									elevation={0}
									sx={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										gap: 0.5,
										backgroundColor: isSelected
											? primary.main
											: isToday
												? alpha(primary.main, 0.08)
												: 'background.paper',
										borderRadius: 3,
										cursor: 'pointer',
										padding: isMobile ? 1.5 : 2,
										border: `2px solid ${
											isSelected
												? primary.main
												: isToday
													? alpha(primary.main, 0.3)
													: 'transparent'
										}`,
										transition: 'all 0.2s ease',
										position: 'relative',
										overflow: 'hidden',
										'&:hover': {
											borderColor: primary.main,
											backgroundColor: isSelected
												? primary.main
												: alpha(primary.main, 0.1),
											transform: 'translateY(-2px)',
											boxShadow: `0 4px 12px ${alpha(primary.main, 0.2)}`,
										},
									}}
									onClick={() => setSelectedDate(day)}
								>
									{hasShift && (
										<Box
											sx={{
												position: 'absolute',
												top: 6,
												right: 6,
												width: 8,
												height: 8,
												borderRadius: '50%',
												backgroundColor: isSelected ? 'white' : primary.main,
												boxShadow: `0 2px 4px ${alpha(primary.main, 0.3)}`,
											}}
										/>
									)}
									<Typography
										variant="body2"
										sx={{
											color: isSelected ? 'white' : grey[600],
											fontWeight: isSelected ? 700 : 500,
											fontSize: isMobile ? '0.75rem' : '0.875rem',
											textTransform: 'uppercase',
											letterSpacing: 0.5,
										}}
									>
										{day.split(',')[0].slice(0, 3)}
									</Typography>
									<Typography
										variant={isMobile ? 'h6' : 'h5'}
										fontWeight={isSelected ? 800 : 700}
										sx={{
											color: isSelected ? 'white' : 'text.primary',
											lineHeight: 1,
										}}
									>
										{day.split(',')[1].split(' ')[2]}
									</Typography>
									{isToday && !isSelected && (
										<Typography
											variant="caption"
											sx={{
												color: primary.main,
												fontWeight: 600,
												fontSize: '0.65rem',
												mt: 0.5,
											}}
										>
											Today
										</Typography>
									)}
								</Paper>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</Box>

			{/* Shifts List */}
			<Box>
				<Box display="flex" alignItems="center" gap={1.5} mb={2}>
					<AccessTimeIcon sx={{ color: primary.main, fontSize: 24 }} />
					<Typography variant="h6" fontWeight={700} color="text.primary">
						{selectedDate}
					</Typography>
					{shiftsInDate.length > 0 && (
						<Chip
							label={shiftsInDate.length}
							size="small"
							sx={{
								height: 24,
								fontWeight: 600,
								backgroundColor: alpha(primary.main, 0.1),
								color: primary.main,
							}}
						/>
					)}
				</Box>

				{shiftsInDate.length > 0 ? (
					<Box display="flex" flexDirection="column" gap={1.5}>
						{shiftsInDate.map((shift, index) => (
							<Paper
								key={shift.id}
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
									<UpcomingShift shift={shift} />
								</Box>
							</Paper>
						))}
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
						<ErrorComponent errorText="No shifts scheduled for this date" />
					</Paper>
				)}
			</Box>
		</Container>
	);
}
