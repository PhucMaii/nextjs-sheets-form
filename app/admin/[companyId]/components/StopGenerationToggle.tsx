import React from 'react'
import {
	Box,
	Typography,
	Switch,
	FormControlLabel,
	Paper,
	useMediaQuery,
	alpha,
} from '@mui/material'
import { primary, warning } from '@/theme/color'

interface StopGenerationToggleProps {
	hasStopped: boolean
	lastStopAt?: string | null
	onChange: (checked: boolean) => void
	title?: string
	description?: {
		active: string
		stopped: string
	}
	disabled?: boolean
}

export default function StopGenerationToggle({
	hasStopped,
	lastStopAt,
	onChange,
	title = 'Stop Generation for Next Term',
	description = {
		active:
			'Enable this to prevent this fixed transaction from being generated in the next term.',
		stopped:
			'This fixed transaction will not be generated for the upcoming term. You can re-enable it anytime.',
	},
	disabled = false,
}: StopGenerationToggleProps) {
	const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))

	const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.checked)
	}

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2.5,
				borderRadius: 2,
				border: `1px solid ${alpha(primary.main, 0.12)}`,
				backgroundColor: hasStopped
					? alpha(warning.lightest, 0.5)
					: alpha(primary.lightest, 0.3),
				transition: 'all 0.2s ease',
			}}
		>
			<Box
				display="flex"
				flexDirection={isMobile ? 'column' : 'row'}
				justifyContent="space-between"
				alignItems={isMobile ? 'flex-start' : 'center'}
				gap={2}
			>
				<Box flex={1}>
					<Typography
						variant="subtitle1"
						fontWeight={600}
						sx={{ mb: 0.5, color: 'text.primary' }}
					>
						{title}
					</Typography>
					<Typography
						variant="body2"
						sx={{
							color: 'text.secondary',
							fontSize: '0.875rem',
							lineHeight: 1.5,
						}}
					>
						{hasStopped ? description.stopped : description.active}
					</Typography>
					{hasStopped && lastStopAt && (
						<Typography
							variant="caption"
							sx={{
								mt: 1,
								display: 'block',
								color: warning.dark,
								fontWeight: 500,
							}}
						>
							Stopped on: {lastStopAt}
						</Typography>
					)}
				</Box>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						flexShrink: 0,
					}}
				>
					<FormControlLabel
						control={
							<Switch
								checked={hasStopped}
								onChange={handleToggle}
								disabled={disabled}
								color="primary"
								sx={{
									'& .MuiSwitch-switchBase.Mui-checked': {
										color: warning.main,
									},
									'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
										{
											backgroundColor: warning.main,
										},
								}}
							/>
						}
						label={
							<Typography
								variant="body2"
								fontWeight={600}
								sx={{
									color: hasStopped ? warning.dark : 'text.primary',
									minWidth: isMobile ? 'auto' : 80,
									textAlign: isMobile ? 'left' : 'right',
								}}
							>
								{hasStopped ? 'Stopped' : 'Active'}
							</Typography>
						}
						labelPlacement={isMobile ? 'end' : 'start'}
						sx={{
							m: 0,
							flexDirection: isMobile ? 'row' : 'row-reverse',
							gap: 1,
						}}
					/>
				</Box>
			</Box>
		</Paper>
	)
}

