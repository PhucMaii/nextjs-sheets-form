import React from 'react'
import {
	Box,
	Typography,
	Paper,
	Stack,
	Grid,
	Avatar,
	Chip,
	IconButton,
	useTheme,
	alpha,
	Card,
	CardContent,
	CardActions,
	Button,
} from '@mui/material'
import {
	Water as WaterIcon,
	Schedule as ScheduleIcon,
	PlayArrow as PlayIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	Timer as TimerIcon,
	ViewList as ViewListIcon,
} from '@mui/icons-material'

// Mock data for bundle programs
const mockBundlePrograms = [
	{
		id: 1,
		name: 'Spring Growth Bundle',
		duration: 30,
		programCount: 8,
		status: 'active',
		description: 'Comprehensive spring irrigation program for optimal plant growth',
		createdAt: '2024-01-15',
		zones: ['Zone A', 'Zone B', 'Zone C'],
	},
	{
		id: 2,
		name: 'Summer Maintenance',
		duration: 45,
		programCount: 12,
		status: 'scheduled',
		description: 'High-frequency summer watering schedule for hot weather',
		createdAt: '2024-02-01',
		zones: ['Zone A', 'Zone B', 'Zone D', 'Zone E'],
	},
	{
		id: 3,
		name: 'Fall Preparation',
		duration: 21,
		programCount: 6,
		status: 'draft',
		description: 'Gradual reduction program preparing plants for winter',
		createdAt: '2024-02-10',
		zones: ['Zone A', 'Zone C'],
	},
	{
		id: 4,
		name: 'Winter Dormancy',
		duration: 60,
		programCount: 4,
		status: 'inactive',
		description: 'Minimal watering schedule for dormant winter period',
		createdAt: '2024-01-20',
		zones: ['Zone B', 'Zone D'],
	},
	{
		id: 5,
		name: 'Seedling Care',
		duration: 14,
		programCount: 10,
		status: 'active',
		description: 'Gentle, frequent watering for newly planted seedlings',
		createdAt: '2024-02-15',
		zones: ['Zone A', 'Zone B', 'Zone C', 'Zone E'],
	},
	{
		id: 6,
		name: 'Drought Response',
		duration: 35,
		programCount: 15,
		status: 'scheduled',
		description: 'Emergency watering protocol for drought conditions',
		createdAt: '2024-02-20',
		zones: ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E'],
	},
]

const getStatusColor = (status: string) => {
	switch (status) {
		case 'active':
			return '#4CAF50'
		case 'scheduled':
			return '#2196F3'
		case 'draft':
			return '#FF9800'
		case 'inactive':
			return '#9E9E9E'
		default:
			return '#9E9E9E'
	}
}

const getStatusIcon = (status: string) => {
	switch (status) {
		case 'active':
			return <PlayIcon fontSize="small" />
		case 'scheduled':
			return <ScheduleIcon fontSize="small" />
		case 'draft':
			return <EditIcon fontSize="small" />
		case 'inactive':
			return <TimerIcon fontSize="small" />
		default:
			return <TimerIcon fontSize="small" />
	}
}

interface BundleProgramCardProps {
	bundleProgram: typeof mockBundlePrograms[0]
	theme: any
}

function BundleProgramCard({ bundleProgram, theme }: BundleProgramCardProps) {
	const statusColor = getStatusColor(bundleProgram.status)
	
	return (
		<Card
			elevation={0}
			sx={{
				height: '100%',
				borderRadius: 3,
				border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
				transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
				'&:hover': {
					transform: 'translateY(-4px)',
					boxShadow: `0 8px 25px ${alpha(statusColor, 0.15)}`,
					borderColor: alpha(statusColor, 0.3),
				},
			}}
		>
			<CardContent sx={{ p: 3, pb: 2 }}>
				<Stack spacing={2}>
					{/* Header */}
					<Stack direction="row" alignItems="flex-start" justifyContent="space-between">
						<Stack direction="row" alignItems="center" spacing={2}>
							<Avatar
								sx={{
									backgroundColor: alpha(statusColor, 0.1),
									color: statusColor,
									border: `2px solid ${alpha(statusColor, 0.2)}`,
									width: 48,
									height: 48,
								}}
							>
								<WaterIcon />
							</Avatar>
							<Box>
								<Typography
									variant="h6"
									fontWeight={700}
									color="text.primary"
									sx={{ lineHeight: 1.2 }}
								>
									{bundleProgram.name}
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ opacity: 0.8 }}
								>
									{bundleProgram.description}
								</Typography>
							</Box>
						</Stack>
						<Chip
							icon={getStatusIcon(bundleProgram.status)}
							label={bundleProgram.status.charAt(0).toUpperCase() + bundleProgram.status.slice(1)}
							size="small"
							sx={{
								backgroundColor: alpha(statusColor, 0.1),
								color: statusColor,
								fontWeight: 600,
								border: `1px solid ${alpha(statusColor, 0.2)}`,
							}}
						/>
					</Stack>

					{/* Stats */}
					<Stack direction="row" spacing={3}>
						<Box textAlign="center">
							<Typography
								variant="h4"
								fontWeight={800}
								color={statusColor}
								sx={{ lineHeight: 1 }}
							>
								{bundleProgram.duration}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								fontWeight={500}
							>
								Days
							</Typography>
						</Box>
						<Box textAlign="center">
							<Typography
								variant="h4"
								fontWeight={800}
								color={theme.palette.primary.main}
								sx={{ lineHeight: 1 }}
							>
								{bundleProgram.programCount}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								fontWeight={500}
							>
								Programs
							</Typography>
						</Box>
						<Box textAlign="center">
							<Typography
								variant="h4"
								fontWeight={800}
								color={theme.palette.secondary.main}
								sx={{ lineHeight: 1 }}
							>
								{bundleProgram.zones.length}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
								fontWeight={500}
							>
								Zones
							</Typography>
						</Box>
					</Stack>

					{/* Zones */}
					<Box>
						<Typography
							variant="caption"
							color="text.secondary"
							fontWeight={600}
							sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
						>
							Active Zones
						</Typography>
						<Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
							{bundleProgram.zones.map((zone, index) => (
								<Chip
									key={index}
									label={zone}
									size="small"
									variant="outlined"
									sx={{
										fontSize: '0.75rem',
										height: 24,
										borderColor: alpha(theme.palette.grey[400], 0.5),
										color: 'text.secondary',
									}}
								/>
							))}
						</Stack>
					</Box>
				</Stack>
			</CardContent>
			
			<CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ opacity: 0.7 }}
				>
					Created {new Date(bundleProgram.createdAt).toLocaleDateString()}
				</Typography>
				<Stack direction="row" spacing={1}>
					<IconButton
						size="small"
						sx={{
							color: theme.palette.primary.main,
							'&:hover': {
								backgroundColor: alpha(theme.palette.primary.main, 0.1),
							},
						}}
					>
						<ViewListIcon fontSize="small" />
					</IconButton>
					<IconButton
						size="small"
						sx={{
							color: theme.palette.warning.main,
							'&:hover': {
								backgroundColor: alpha(theme.palette.warning.main, 0.1),
							},
						}}
					>
						<EditIcon fontSize="small" />
					</IconButton>
					<IconButton
						size="small"
						sx={{
							color: theme.palette.error.main,
							'&:hover': {
								backgroundColor: alpha(theme.palette.error.main, 0.1),
							},
						}}
					>
						<DeleteIcon fontSize="small" />
					</IconButton>
				</Stack>
			</CardActions>
		</Card>
	)
}

export default function BundlePrograms() {
	const theme = useTheme()

	return (
		<Box sx={{ p: 3 }}>
			{/* Header */}
			<Paper
				elevation={0}
				sx={{
					p: 3,
					mb: 3,
					borderRadius: 3,
					background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.02)})`,
					border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
				}}
			>
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
				>
					<Stack direction="row" alignItems="center" spacing={3}>
						<Paper
							elevation={0}
							sx={{
								p: 2,
								borderRadius: 2,
								background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
								boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
							}}
						>
							<WaterIcon sx={{ color: 'white', fontSize: 28 }} />
						</Paper>
						<Box>
							<Typography
								variant="h4"
								fontWeight={800}
								color="text.primary"
								gutterBottom
							>
								Bundle Programs
							</Typography>
							<Typography
								variant="body1"
								color="text.secondary"
								sx={{ opacity: 0.8 }}
							>
								Manage your irrigation program bundles and schedules
							</Typography>
						</Box>
					</Stack>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						size="large"
						sx={{
							borderRadius: 2,
							textTransform: 'none',
							fontWeight: 600,
							px: 4,
							py: 1.5,
							background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
							boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
							'&:hover': {
								background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
								boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
								transform: 'translateY(-1px)',
							},
							transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						}}
					>
						Create Bundle
					</Button>
				</Stack>
			</Paper>

			{/* Stats Overview */}
			<Grid container spacing={3} sx={{ mb: 3 }}>
				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: 2,
							textAlign: 'center',
							border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
							background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.success.light, 0.02)})`,
						}}
					>
						<Typography
							variant="h3"
							fontWeight={800}
							color={theme.palette.success.main}
							gutterBottom
						>
							{mockBundlePrograms.filter(p => p.status === 'active').length}
						</Typography>
						<Typography variant="body2" color="text.secondary" fontWeight={500}>
							Active Bundles
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: 2,
							textAlign: 'center',
							border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
							background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)}, ${alpha(theme.palette.info.light, 0.02)})`,
						}}
					>
						<Typography
							variant="h3"
							fontWeight={800}
							color={theme.palette.info.main}
							gutterBottom
						>
							{mockBundlePrograms.reduce((sum, p) => sum + p.programCount, 0)}
						</Typography>
						<Typography variant="body2" color="text.secondary" fontWeight={500}>
							Total Programs
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: 2,
							textAlign: 'center',
							border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
							background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)}, ${alpha(theme.palette.warning.light, 0.02)})`,
						}}
					>
						<Typography
							variant="h3"
							fontWeight={800}
							color={theme.palette.warning.main}
							gutterBottom
						>
							{mockBundlePrograms.reduce((sum, p) => sum + p.duration, 0)}
						</Typography>
						<Typography variant="body2" color="text.secondary" fontWeight={500}>
							Total Days
						</Typography>
					</Paper>
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<Paper
						elevation={0}
						sx={{
							p: 3,
							borderRadius: 2,
							textAlign: 'center',
							border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
							background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.secondary.light, 0.02)})`,
						}}
					>
						<Typography
							variant="h3"
							fontWeight={800}
							color={theme.palette.secondary.main}
							gutterBottom
						>
							{new Set(mockBundlePrograms.flatMap(p => p.zones)).size}
						</Typography>
						<Typography variant="body2" color="text.secondary" fontWeight={500}>
							Active Zones
						</Typography>
					</Paper>
				</Grid>
			</Grid>

			{/* Bundle Programs Grid */}
			<Grid container spacing={3}>
				{mockBundlePrograms.map((bundleProgram) => (
					<Grid item xs={12} sm={6} lg={4} key={bundleProgram.id}>
						<BundleProgramCard
							bundleProgram={bundleProgram}
							theme={theme}
						/>
					</Grid>
				))}
			</Grid>
		</Box>
	)
}