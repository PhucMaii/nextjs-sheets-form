import React, { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
	Box,
	Typography,
	Button,
	Card,
	CardContent,
	Chip,
	IconButton,
	Grid,
	Avatar,
	LinearProgress,
	Tooltip,
	useTheme,
	useMediaQuery,
	Fade,
	CircularProgress,
	Alert,
} from '@mui/material'
import {
	Add as AddIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	PlayArrow as PlayIcon,
	Pause as PauseIcon,
	Schedule as ScheduleIcon,
	LocationOn as LocationIcon,
	CalendarToday as CalendarIcon,
	Timer as TimerIcon,
} from '@mui/icons-material'
import { ShadowSection } from '../../reports/styled'
import { Program } from './types'
import { format } from 'date-fns'

// Mock data for demonstration - replace with actual API calls
const mockPrograms: Program[] = [
	{
		id: '1',
		name: 'Spring Planting Program',
		totalDays: 30,
		remainingDays: 15,
		isActive: true,
		nextScheduledRun: new Date('2024-02-15T08:00:00'),
		zones: ['Zone 1', 'Zone 2', 'Zone 3'],
		description: 'Comprehensive spring planting program for all zones',
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-15'),
	},
	{
		id: '2',
		name: 'Irrigation Maintenance',
		totalDays: 14,
		remainingDays: 0,
		isActive: false,
		nextScheduledRun: new Date('2024-02-20T10:00:00'),
		zones: ['Zone 1', 'Zone 4'],
		description: 'Regular irrigation system maintenance',
		createdAt: new Date('2024-01-10'),
		updatedAt: new Date('2024-01-24'),
	},
	{
		id: '3',
		name: 'Harvest Preparation',
		totalDays: 21,
		remainingDays: 8,
		isActive: true,
		nextScheduledRun: new Date('2024-02-18T06:00:00'),
		zones: ['Zone 2', 'Zone 3', 'Zone 5'],
		description: 'Pre-harvest preparation and quality checks',
		createdAt: new Date('2024-01-20'),
		updatedAt: new Date('2024-02-01'),
	},
]

export default function Programs() {
	const router = useRouter()
	const params = useParams()
	const [programs, setPrograms] = useState<Program[]>(mockPrograms)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down('md'))

	const activePrograms = useMemo(() => programs.filter(p => p.isActive), [programs])
	const inactivePrograms = useMemo(() => programs.filter(p => !p.isActive), [programs])

	const handleToggleActive = (programId: string) => {
		setPrograms(prev => prev.map(program => 
			program.id === programId 
				? { ...program, isActive: !program.isActive }
				: program
		))
	}

	const handleDeleteProgram = (programId: string) => {
		setPrograms(prev => prev.filter(program => program.id !== programId))
	}

	const handleEditProgram = (programId: string) => {
		// TODO: Implement edit functionality
		console.log('Edit program:', programId)
	}

	const handleAddProgram = () => {
		// Navigate to create program page
		router.push(`/admin/${params?.companyId}/farm/program/create`)
	}

	const getProgressPercentage = (program: Program) => {
		if (!program.remainingDays) return 100
		return ((program.totalDays - program.remainingDays) / program.totalDays) * 100
	}

	const getStatusColor = (program: Program) => {
		if (!program.isActive) return 'default'
		if (program.remainingDays === 0) return 'success'
		if (program.remainingDays && program.remainingDays <= 3) return 'warning'
		return 'primary'
	}

	const ProgramCard = ({ program }: { program: Program }) => (
		<Fade in timeout={300}>
			<Card
				sx={{
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					boxShadow: 'none',
					border: `1px solid ${program.isActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
				}}
			>
				<CardContent sx={{ flexGrow: 1, p: 3 }}>
					{/* Header */}
					<Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
						<Box flex={1}>
							<Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
								{program.name}
							</Typography>
							{program.description && (
								<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
									{program.description}
								</Typography>
							)}
						</Box>
						<Box display="flex" gap={1}>
							<Tooltip title={program.isActive ? 'Pause Program' : 'Activate Program'}>
								<IconButton
									size="small"
									onClick={() => handleToggleActive(program.id)}
									color={program.isActive ? 'primary' : 'default'}
								>
									{program.isActive ? <PauseIcon /> : <PlayIcon />}
								</IconButton>
							</Tooltip>
							<Tooltip title="Edit Program">
								<IconButton
									size="small"
									onClick={() => handleEditProgram(program.id)}
									color="primary"
								>
									<EditIcon />
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete Program">
								<IconButton
									size="small"
									onClick={() => handleDeleteProgram(program.id)}
									color="error"
								>
									<DeleteIcon />
								</IconButton>
							</Tooltip>
						</Box>
					</Box>

					{/* Status and Progress */}
					<Box display="flex" alignItems="center" gap={2} mb={2}>
						<Chip
							label={program.isActive ? 'Active' : 'Inactive'}
							color={getStatusColor(program)}
							size="small"
							icon={program.isActive ? <PlayIcon /> : <PauseIcon />}
						/>
						{program.remainingDays !== undefined && (
							<Chip
								label={`${program.remainingDays} days left`}
								variant="outlined"
								size="small"
								icon={<TimerIcon />}
							/>
						)}
					</Box>

					{/* Progress Bar */}
					{program.remainingDays !== undefined && (
						<Box mb={2}>
							<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
								<Typography variant="body2" color="text.secondary">
									Progress
								</Typography>
								<Typography variant="body2" fontWeight={500}>
									{program.totalDays - program.remainingDays} / {program.totalDays} days
								</Typography>
							</Box>
							<LinearProgress
								variant="determinate"
								value={getProgressPercentage(program)}
								sx={{
									height: 8,
									borderRadius: 4,
									backgroundColor: theme.palette.grey[200],
									'& .MuiLinearProgress-bar': {
										borderRadius: 4,
									},
								}}
							/>
						</Box>
					)}

					{/* Next Scheduled Run */}
					{program.nextScheduledRun && (
						<Box display="flex" alignItems="center" gap={1} mb={2}>
							<CalendarIcon fontSize="small" color="action" />
							<Typography variant="body2" color="text.secondary">
								Next run: {format(program.nextScheduledRun, 'MMM dd, yyyy HH:mm')}
							</Typography>
						</Box>
					)}

					{/* Zones */}
					<Box>
						<Box display="flex" alignItems="center" gap={1} mb={1}>
							<LocationIcon fontSize="small" color="action" />
							<Typography variant="body2" color="text.secondary">
								Zones ({program.zones.length})
							</Typography>
						</Box>
						<Box display="flex" flexWrap="wrap" gap={0.5}>
							{program.zones.map((zone, index) => (
								<Chip
									key={index}
									label={zone}
									size="small"
									variant="outlined"
									sx={{ fontSize: '0.75rem' }}
								/>
							))}
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Fade>
	)

	const renderProgramsSection = (title: string, programs: Program[], color: string) => (
		<Box mb={4}>
			<Box display="flex" alignItems="center" gap={2} mb={3}>
				<Avatar sx={{ bgcolor: color, width: 32, height: 32 }}>
					<ScheduleIcon fontSize="small" />
				</Avatar>
				<Typography variant="h6" fontWeight={600}>
					{title} ({programs.length})
				</Typography>
			</Box>
			{programs.length > 0 ? (
				<Grid container spacing={3}>
					{programs.map((program) => (
						<Grid item xs={12} sm={6} lg={4} key={program.id}>
							<ProgramCard program={program} />
						</Grid>
					))}
				</Grid>
			) : (
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					py={6}
					sx={{
						border: `2px dashed ${theme.palette.grey[300]}`,
						borderRadius: 2,
						backgroundColor: theme.palette.grey[50],
					}}
				>
					<ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
					<Typography variant="body1" color="text.secondary" textAlign="center">
						No {title.toLowerCase()} programs found
					</Typography>
				</Box>
			)}
		</Box>
	)

	return (
		<ShadowSection>
			{/* Header */}
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
				<Box>
					<Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
						Programs
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Manage your farm programs and schedules
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleAddProgram}
					sx={{
						borderRadius: 2,
						textTransform: 'none',
						fontWeight: 600,
						px: 3,
						py: 1.5,
						boxShadow: theme.shadows[4],
						'&:hover': {
							boxShadow: theme.shadows[8],
						},
					}}
				>
					Add Program
				</Button>
			</Box>

			{/* Error State */}
			{error && (
				<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Loading State */}
			{isLoading && (
				<Box display="flex" justifyContent="center" py={4}>
					<CircularProgress />
				</Box>
			)}

			{/* Programs Sections */}
			{!isLoading && (
				<>
					{renderProgramsSection('Active Programs', activePrograms, theme.palette.success.main)}
					{renderProgramsSection('Inactive Programs', inactivePrograms, theme.palette.grey[500])}
				</>
			)}
		</ShadowSection>
	)
}