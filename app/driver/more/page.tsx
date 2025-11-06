'use client';
import React from 'react';
import Sidebar from '../components/Sidebar';
import {
	Box,
	Typography,
	Paper,
	AppBar,
	Toolbar,
	Container,
	useMediaQuery,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { driverMoreTabs } from '@/app/lib/constant';
import { useRouter } from 'next/navigation';
import { primary } from '@/theme/color';

export default function MorePage() {
	const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));
	const router = useRouter();

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
							More
						</Typography>
					</Box>
				</Toolbar>
			</AppBar>

			<Container maxWidth={false} sx={{ px: { xs: 1, sm: 2 }, pt: 2, pb: 8 }}>
				<Paper
					elevation={0}
					sx={{
						borderRadius: 2,
						border: '1px solid',
						borderColor: 'divider',
						overflow: 'hidden',
					}}
				>
					<List sx={{ p: 0 }}>
						{driverMoreTabs.map((tab, index) => {
							const IconComponent = tab.icon;
							return (
								<ListItem key={index} disablePadding>
									<ListItemButton
										onClick={() => router.push(tab.path)}
										sx={{
											py: 2,
											px: 2,
											'&:hover': {
												backgroundColor: 'action.hover',
											},
										}}
									>
										<ListItemIcon
											sx={{
												minWidth: 40,
												color: primary.main,
											}}
										>
											<IconComponent />
										</ListItemIcon>
										<ListItemText
											primary={tab.name}
											primaryTypographyProps={{
												fontWeight: 500,
												color: 'text.primary',
											}}
										/>
									</ListItemButton>
								</ListItem>
							);
						})}
					</List>
				</Paper>
			</Container>
		</Sidebar>
	);
}

