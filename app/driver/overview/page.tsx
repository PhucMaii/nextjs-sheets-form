'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
	Box,
	Grid,
	Skeleton,
	Typography,
	Paper,
	AppBar,
	Toolbar,
	Container,
	useMediaQuery,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { primary, success } from '@/theme/color';
import { API_URL } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ManifestTable from '@/app/admin/[companyId]/components/Tables/ManifestTable';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import StatusText from '@/app/admin/[companyId]/components/StatusText';
import { SWRFetchData } from '@/app/utils/db';
import { alpha } from '@mui/material/styles';
import LoadingModal from '@/app/admin/[companyId]/components/Modals/LoadingModal';

interface StatCardProps {
	label: string;
	current: string | number;
	total?: string | number;
	color: string;
	icon: React.ReactNode;
}

function StatCard({ label, current, total, color, icon }: StatCardProps) {
	const percentage = useMemo(() => {
		if (!total) return 0;
		const currentNum =
			typeof current === 'string' ? parseFloat(current.replace('$', '')) : current;
		const totalNum = typeof total === 'string' ? parseFloat(total.replace('$', '')) : total;
		if (totalNum === 0) return 0;
		return Math.round((currentNum / totalNum) * 100);
	}, [current, total]);

	const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

	return (
		<Paper
			elevation={0}
			sx={{
				p: isMobile ? 1.5 : 2,
				borderRadius: 2,
				background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
				border: `1px solid ${alpha(color, 0.2)}`,
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
			}}
		>
			<Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
				<Typography
					variant="caption"
					fontWeight={600}
					color={color}
					textTransform="uppercase"
					letterSpacing={0.5}
					fontSize={isMobile ? '0.65rem' : '0.75rem'}
				>
					{label}
				</Typography>
				<Box
					sx={{
						color: color,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					{React.cloneElement(icon as React.ReactElement, {
						sx: { fontSize: isMobile ? 20 : 24 },
					})}
				</Box>
			</Box>
			<Box>
				<Typography
					variant={isMobile ? 'h5' : 'h4'}
					fontWeight={700}
					color={color}
					lineHeight={1.2}
					mb={0.5}
				>
					{current}
				</Typography>
				{total && (
					<Typography
						variant="body2"
						color="text.secondary"
						fontWeight={500}
						fontSize={isMobile ? '0.7rem' : '0.875rem'}
					>
						{percentage}% of target
					</Typography>
				)}
			</Box>
			{total && (
				<Box
					sx={{
						mt: 1,
						height: 3,
						borderRadius: 2,
						backgroundColor: alpha(color, 0.1),
						overflow: 'hidden',
					}}
				>
					<Box
						sx={{
							height: '100%',
							width: `${Math.min(percentage, 100)}%`,
							backgroundColor: color,
							borderRadius: 2,
							transition: 'width 0.3s ease',
						}}
					/>
				</Box>
			)}
		</Paper>
	);
}

export default function OverviewPage() {
	const [isFirstLoading, setIsFirstLoading] = useState<boolean>(true);
	const date = new Date();
	const today = YYYYMMDDFormat(date);
	const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

	// Data Fetching
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [orders, mutate, isValidating] = SWRFetchData(
		`${API_URL.DRIVER}/orders?deliveryDate=${today}`,
	);

	useEffect(() => {
		if (isFirstLoading && !isValidating) {
			setIsFirstLoading(false);
		}
	}, [isFirstLoading, isValidating]);

	const totalOrders = useMemo(
		() => orders?.data.deliveryOrders.length || 0,
		[orders?.data.deliveryOrders.length],
	);

	const codAmount = useMemo(
		() => orders?.data.codAmount.toFixed(2) || '0.00',
		[orders?.data.codAmount],
	);

	return (
		<Sidebar>
			<LoadingModal open={isValidating && isFirstLoading} />

			{/* Sticky Header */}
			<AppBar
				position="sticky"
				elevation={0}
				sx={{
					backgroundColor: 'background.paper',
					color: 'text.primary',
					top: isMobile ? 0 : 0,
					zIndex: 1100,
					p: 2,
					borderRadius: 2,
				}}
			>
				<Toolbar
					sx={{
						minHeight: { xs: '56px !important', sm: '64px !important' },
					}}
				>
					<Box
						display="flex"
						flexDirection="column"
						alignItems="flex-start"
						width="100%"
					>
						<Typography
							variant={isMobile ? 'h6' : 'h5'}
							fontWeight={700}
							color="primary.main"
							noWrap
						>
							Welcome back, {orders?.data.employee.name || 'Driver'}
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mt: 0.5 }}
						>
							We wish you have a good day!
						</Typography>
					</Box>
				</Toolbar>
			</AppBar>

			{/* Stats Cards */}
			<Container maxWidth={false} sx={{ px: { xs: 1, sm: 2 }, pt: 2 }}>
				<Box mb={2}>
					<Typography
						variant="subtitle1"
						fontWeight={600}
						color="text.primary"
						sx={{ mb: 1.5 }}
					>
						Today&apos;s Overview
					</Typography>
					<Grid container spacing={1.5}>
						<Grid item xs={6}>
							<StatCard
								label="Total Orders"
								current={totalOrders}
								color={primary.main}
								icon={<ReceiptLongIcon />}
							/>
						</Grid>
						<Grid item xs={6}>
							<StatCard
								label="COD Amount"
								current={`$${parseFloat(codAmount).toFixed(0)}`}
								color={success.main}
								icon={<AttachMoneyIcon />}
							/>
						</Grid>
					</Grid>
				</Box>

				{/* Manifest Section */}
				{isFirstLoading ? (
					<Skeleton
						variant="rounded"
						sx={{
							width: '100%',
							height: { xs: '300px', sm: '390px' },
							borderRadius: 2,
						}}
					/>
				) : totalOrders > 0 ? (
					<Box>
						<Typography
							variant="subtitle1"
							fontWeight={600}
							color="text.primary"
							sx={{ mb: 1.5 }}
						>
							Manifest
						</Typography>
						{orders?.data.manifest && (
							<Paper
								elevation={0}
								sx={{
									borderRadius: 2,
									border: '1px solid',
									borderColor: 'divider',
									overflow: 'hidden',
								}}
							>
								<ManifestTable manifest={orders.data.manifest} />
							</Paper>
						)}
					</Box>
				) : (
					<Box
						display="flex"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
						mt={6}
						mb={4}
					>
						<EventAvailableIcon
							color="success"
							sx={{ fontSize: { xs: 80, sm: 100 }, mb: 2 }}
						/>
						<StatusText
							text="There is no orders waiting for you today."
							type="success"
						/>
					</Box>
				)}
			</Container>
		</Sidebar>
	);
}
