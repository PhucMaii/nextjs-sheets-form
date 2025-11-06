'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
	Tab,
	Tabs,
	AppBar,
	Toolbar,
	Box,
	Typography,
	useMediaQuery,
} from '@mui/material';
import HistoryShifts from './HistoryShifts';
import UpcomingShifts from './UpcomingShifts';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`shifts-tabpanel-${index}`}
			aria-labelledby={`shifts-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 2 }}>{children}</Box>}
		</div>
	);
}

export default function ShiftPage() {
	const [tab, setTab] = useState<number>(0);
	const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTab(newValue);
	};

	return (
		<Sidebar>
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
						alignItems="center"
						justifyContent="space-between"
						width="100%"
					>
						<Typography
							variant={isMobile ? 'h6' : 'h5'}
							fontWeight={700}
							color="primary.main"
							noWrap
						>
							Shifts
						</Typography>
					</Box>
				</Toolbar>

				{/* Tabs */}
				<Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
					<Tabs
						value={tab}
						onChange={handleTabChange}
						variant="fullWidth"
						aria-label="shifts tabs"
						sx={{
							'& .MuiTab-root': {
								minHeight: 48,
								fontSize: isMobile ? '0.875rem' : '1rem',
								fontWeight: 600,
								textTransform: 'none',
							},
						}}
					>
						<Tab label="Upcoming" />
						<Tab label="History" />
					</Tabs>
				</Box>
			</AppBar>

			{/* Tab Panels */}
			<TabPanel value={tab} index={0}>
				<UpcomingShifts />
			</TabPanel>
			<TabPanel value={tab} index={1}>
				<HistoryShifts />
			</TabPanel>
		</Sidebar>
	);
}
