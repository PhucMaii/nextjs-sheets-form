import {
	Divider,
	Modal,
	Box,
	Typography,
	Card,
	CardContent,
	Button,
	Collapse,
	IconButton,
	Avatar,
	Chip,
	Grid,
	Alert,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	ListItemAvatar,
	Paper,
	Stack,
} from '@mui/material'
import {
	ExpandMore as ExpandMoreIcon,
	ExpandLess as ExpandLessIcon,
	Person as PersonIcon,
	Route as RouteIcon,
	CheckCircle as CheckCircleIcon,
	Add as AddIcon,
	DriveEta as DriverIcon,
	Badge as EmployeeIcon,
} from '@mui/icons-material'
import React, { useState } from 'react'
import { ModalProps } from './type'
import { BoxModal } from './styled'
import ModalHead from '@/app/lib/ModalHead'
import { Order } from '../../orders/page'
import { useQuery } from '@tanstack/react-query'
import { getAdminApiUrl } from '@/app/utils/enum'
import { useParams } from 'next/navigation'
import { days } from '@/app/lib/constant'
import axios from 'axios'

interface IProps extends ModalProps {
	order: Order
}

interface Route {
	id: number
	name: string
	day: string
	driverId: number
	employeeId?: number
	companyId?: number
	clients: Array<{
		user: {
			id: number
			clientName: string
			clientId: string
			contactNumber: string
			deliveryAddress: string
			category?: {
				name: string
			}
			preference?: {
				paymentType: string
			}
		}
	}>
	driver?: {
		id: number
		name: string
	}
	employee?: {
		id: number
		name: string
	}
}

export default function SwitchRouteModal({ open, onClose, order }: IProps) {
	const { companyId }: any = useParams()
	const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set())
	const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null)
	const [isSwitching, setIsSwitching] = useState(false)
	const [insertPosition, setInsertPosition] = useState<number | null>(null)

	const { data: routes, isLoading, error } = useQuery({
		queryKey: ['routes', order?.deliveryDate],
		queryFn: async () => {
			const day = days[new Date(order.deliveryDate).getDay()]
			const response = await axios.get(
				getAdminApiUrl(companyId, `/routes?day=${day}`),
			)
			return response.data.data as Route[]
		},
		enabled: !!order?.deliveryDate,
	})

	const handleToggleExpanded = (routeId: number) => {
		const newExpanded = new Set(expandedRoutes)
		if (newExpanded.has(routeId)) {
			newExpanded.delete(routeId)
		} else {
			newExpanded.add(routeId)
		}
		setExpandedRoutes(newExpanded)
	}

	const handleRouteSelect = (routeId: number) => {
		setSelectedRouteId(routeId)
		setInsertPosition(null) // Reset position when selecting new route
	}

	const handleInsertPosition = (routeId: number, position: number) => {
		setSelectedRouteId(routeId)
		setInsertPosition(position)
	}

	const handleSwitchRoute = async () => {
		if (!selectedRouteId) return

		try {
			setIsSwitching(true)
			const response = await axios.put(
				getAdminApiUrl(companyId, '/orders/switch-route'),
				{
					orderId: order.id,
					newRouteId: selectedRouteId,
					insertPosition: insertPosition,
				},
			)

			if (response.data.error) {
				console.error('Error switching route:', response.data.error)
				// You might want to show a notification here
				return
			}

			console.log('Route switched successfully:', response.data.message)
			onClose()
		} catch (error: any) {
			console.error('Error switching route:', error)
			// You might want to show a notification here
		} finally {
			setIsSwitching(false)
		}
	}

	const getCurrentRoute = () => {
		// Find the current route for this order
		return routes?.find((route) =>
			route.clients.some((client) => client.user.id === order.userId),
		)
	}

	const currentRoute = getCurrentRoute()

	return (
		<Modal open={open} onClose={onClose}>
			<BoxModal 
				overflow="auto" 
				maxHeight="90vh" 
				width="1000px"
				sx={{
					background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
					borderRadius: '16px',
					boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
					// Mobile responsive styles
					'@media (max-width: 768px)': {
						width: '95vw',
						maxHeight: '95vh',
						margin: '2.5vh auto',
						borderRadius: '12px',
					},
					'@media (max-width: 480px)': {
						width: '98vw',
						maxHeight: '98vh',
						margin: '1vh auto',
						borderRadius: '8px',
					},
				}}
			>
				<ModalHead
					heading="Switch Route"
					buttonLabel="Switch Route"
					onClick={handleSwitchRoute}
					buttonProps={{
						disabled: !selectedRouteId || isSwitching,
						loading: isSwitching,
						sx: {
							background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
							'&:hover': {
								background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
							},
						},
					}}
					onClose={onClose}
				/>

				<Divider sx={{ 
					my: { xs: 2, sm: 3 }, 
					borderColor: 'rgba(255,255,255,0.2)' 
				}} />

				{isLoading && (
					<Box display="flex" justifyContent="center" py={{ xs: 4, sm: 6 }}>
						<CircularProgress 
							sx={{ 
								color: '#667eea',
								'& .MuiCircularProgress-circle': {
									strokeLinecap: 'round',
								},
							}} 
						/>
					</Box>
				)}

				{error && (
					<Alert 
						severity="error" 
						sx={{ 
							mb: { xs: 2, sm: 3 },
							borderRadius: '12px',
							background: 'rgba(244, 67, 54, 0.1)',
							border: '1px solid rgba(244, 67, 54, 0.2)',
							fontSize: { xs: '0.875rem', sm: '1rem' },
						}}
					>
						Failed to load routes. Please try again.
					</Alert>
				)}

				{routes && routes.length === 0 && (
					<Alert 
						severity="info" 
						sx={{ 
							mb: { xs: 2, sm: 3 },
							borderRadius: '12px',
							background: 'rgba(33, 150, 243, 0.1)',
							border: '1px solid rgba(33, 150, 243, 0.2)',
							fontSize: { xs: '0.875rem', sm: '1rem' },
						}}
					>
						No routes available for this day.
					</Alert>
				)}

				{routes && routes.length > 0 && (
					<Box>
						<Paper 
							elevation={0}
							sx={{
								p: { xs: 2, sm: 3 },
								mb: { xs: 2, sm: 3 },
								borderRadius: { xs: '12px', sm: '16px' },
								background: 'rgba(255, 255, 255, 0.9)',
								backdropFilter: 'blur(10px)',
								border: '1px solid rgba(255, 255, 255, 0.2)',
							}}
						>
							<Typography 
								variant="h5" 
								gutterBottom
								sx={{
									fontWeight: 600,
									background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
									backgroundClip: 'text',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									mb: 1,
									fontSize: { xs: '1.25rem', sm: '1.5rem' },
								}}
							>
								Available Routes for {days[new Date(order.deliveryDate).getDay()]}
							</Typography>
							<Typography 
								variant="body1" 
								color="text.secondary" 
								sx={{ 
									mb: 2,
									fontSize: { xs: '0.875rem', sm: '0.95rem' },
									lineHeight: 1.5,
								}}
							>
								Select a route and position to move this order to. 
								<Box component="span" sx={{ fontWeight: 600, color: '#667eea' }}>
									Current route: {currentRoute?.name || 'Unknown'}
								</Box>
							</Typography>
						</Paper>

						<Grid container spacing={{ xs: 2, sm: 3 }}>
							{routes.map((route) => (
								<Grid item xs={12} key={route.id}>
									<Card
										sx={{
											border: selectedRouteId === route.id ? 3 : 1,
											borderColor: selectedRouteId === route.id 
												? 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)' 
												: 'rgba(255,255,255,0.3)',
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
											background: selectedRouteId === route.id 
												? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
												: 'rgba(255, 255, 255, 0.95)',
											backdropFilter: 'blur(10px)',
											borderRadius: { xs: '16px', sm: '20px' },
											overflow: 'hidden',
											'&:hover': {
												transform: { xs: 'none', sm: 'translateY(-4px)' },
												boxShadow: { xs: '0 4px 12px rgba(102, 126, 234, 0.1)', sm: '0 12px 24px rgba(102, 126, 234, 0.15)' },
											},
										}}
									>
										<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
											<Box 
												display="flex" 
												alignItems="center" 
												justifyContent="space-between"
												flexDirection={{ xs: 'column', sm: 'row' }}
												gap={{ xs: 2, sm: 0 }}
											>
												<Box display="flex" alignItems="center" gap={{ xs: 2, sm: 3 }}>
													<Avatar 
														sx={{ 
															width: { xs: 48, sm: 56 },
															height: { xs: 48, sm: 56 },
															background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
															boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
														}}
													>
														<RouteIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
													</Avatar>
													<Box>
														<Typography 
															variant="h6" 
															component="div"
															sx={{ 
																fontWeight: 600,
																color: '#2c3e50',
																mb: 0.5,
																fontSize: { xs: '1rem', sm: '1.25rem' },
															}}
														>
															{route.name}
														</Typography>
														<Stack 
															direction={{ xs: 'column', sm: 'row' }} 
															spacing={{ xs: 0.5, sm: 2 }} 
															alignItems={{ xs: 'flex-start', sm: 'center' }}
														>
															<Box display="flex" alignItems="center" gap={0.5}>
																<DriverIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#667eea' }} />
																<Typography 
																	variant="body2" 
																	color="text.secondary"
																	sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
																>
																	{route.driver?.name || 'Unassigned'}
																</Typography>
															</Box>
															{route.employee && (
																<Box display="flex" alignItems="center" gap={0.5}>
																	<EmployeeIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#764ba2' }} />
																	<Typography 
																		variant="body2" 
																		color="text.secondary"
																		sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
																	>
																		{route.employee.name}
																	</Typography>
																</Box>
															)}
														</Stack>
													</Box>
												</Box>

												<Stack 
													direction={{ xs: 'column', sm: 'row' }} 
													spacing={{ xs: 1, sm: 1 }} 
													alignItems="center"
													width={{ xs: '100%', sm: 'auto' }}
												>
													<Chip
														icon={<PersonIcon />}
														label={`${route.clients.length} clients`}
														size="small"
														variant="outlined"
														sx={{
															background: 'rgba(102, 126, 234, 0.1)',
															borderColor: 'rgba(102, 126, 234, 0.3)',
															color: '#667eea',
															fontSize: { xs: '0.75rem', sm: '0.875rem' },
														}}
													/>
													{currentRoute?.id === route.id && (
														<Chip
															icon={<CheckCircleIcon />}
															label="Current"
															size="small"
															sx={{
																background: 'linear-gradient(45deg, #4caf50 0%, #8bc34a 100%)',
																color: 'white',
																fontWeight: 600,
																fontSize: { xs: '0.75rem', sm: '0.875rem' },
															}}
														/>
													)}
													<Button
														variant={selectedRouteId === route.id ? 'contained' : 'outlined'}
														size="small"
														onClick={() => handleRouteSelect(route.id)}
														disabled={currentRoute?.id === route.id}
														sx={{
															background: selectedRouteId === route.id 
																? 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
																: 'transparent',
															borderColor: '#667eea',
															color: selectedRouteId === route.id ? 'white' : '#667eea',
															fontWeight: 600,
															fontSize: { xs: '0.75rem', sm: '0.875rem' },
															minWidth: { xs: '80px', sm: 'auto' },
															'&:hover': {
																background: selectedRouteId === route.id 
																	? 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
																	: 'rgba(102, 126, 234, 0.1)',
															},
														}}
													>
														{selectedRouteId === route.id ? 'Selected' : 'Select'}
													</Button>
													<IconButton
														onClick={() => handleToggleExpanded(route.id)}
														aria-expanded={expandedRoutes.has(route.id)}
														size="small"
														sx={{
															background: 'rgba(102, 126, 234, 0.1)',
															color: '#667eea',
															width: { xs: 32, sm: 40 },
															height: { xs: 32, sm: 40 },
															'&:hover': {
																background: 'rgba(102, 126, 234, 0.2)',
															},
														}}
													>
														{expandedRoutes.has(route.id) ? 
															<ExpandLessIcon sx={{ fontSize: { xs: 18, sm: 20 } }} /> : 
															<ExpandMoreIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
														}
													</IconButton>
												</Stack>
											</Box>
										</CardContent>

										<Collapse in={expandedRoutes.has(route.id)} timeout="auto" unmountOnExit>
											<CardContent sx={{ pt: 0, pb: { xs: 2, sm: 3 } }}>
												<Divider sx={{ mb: { xs: 2, sm: 3 }, borderColor: 'rgba(102, 126, 234, 0.2)' }} />
												<Typography 
													variant="subtitle1" 
													gutterBottom
													sx={{ 
														fontWeight: 600,
														color: '#2c3e50',
														mb: 2,
														fontSize: { xs: '0.875rem', sm: '1rem' },
													}}
												>
													Client List - Click to insert order at position:
												</Typography>
												
												<Paper 
													elevation={0}
													sx={{
														background: 'rgba(255, 255, 255, 0.7)',
														borderRadius: { xs: '8px', sm: '12px' },
														border: '1px solid rgba(102, 126, 234, 0.1)',
														maxHeight: { xs: '250px', sm: '300px' },
														overflow: 'auto',
													}}
												>
													<List sx={{ p: 0 }}>
														{/* Insert at beginning option */}
														<ListItem
															button
															onClick={() => handleInsertPosition(route.id, 0)}
															sx={{
																borderRadius: { xs: '6px', sm: '8px' },
																mx: { xs: 0.5, sm: 1 },
																mt: { xs: 0.5, sm: 1 },
																py: { xs: 1, sm: 1.5 },
																background: insertPosition === 0 && selectedRouteId === route.id 
																	? 'linear-gradient(45deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
																	: 'transparent',
																border: insertPosition === 0 && selectedRouteId === route.id 
																	? '2px solid #667eea'
																	: '2px solid transparent',
																'&:hover': {
																	background: 'rgba(102, 126, 234, 0.1)',
																},
															}}
														>
															<ListItemAvatar>
																<Avatar sx={{ 
																	width: { xs: 28, sm: 32 }, 
																	height: { xs: 28, sm: 32 },
																	background: 'linear-gradient(45deg, #ff9800 0%, #ff5722 100%)',
																}}>
																	<AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
																</Avatar>
															</ListItemAvatar>
															<ListItemText
																primary="Insert at beginning"
																primaryTypographyProps={{
																	fontWeight: insertPosition === 0 && selectedRouteId === route.id ? 600 : 400,
																	color: insertPosition === 0 && selectedRouteId === route.id ? '#667eea' : '#2c3e50',
																	fontSize: { xs: '0.75rem', sm: '0.875rem' },
																}}
															/>
														</ListItem>

														{route.clients.map((client, index) => (
															<React.Fragment key={client.user.id}>
																<ListItem
																	sx={{
																		px: { xs: 1, sm: 2 },
																		py: { xs: 0.5, sm: 1 },
																		borderRadius: { xs: '6px', sm: '8px' },
																		mx: { xs: 0.5, sm: 1 },
																		'&:hover': {
																			background: 'rgba(102, 126, 234, 0.05)',
																		},
																	}}
																>
																	<ListItemAvatar>
																		<Avatar sx={{ 
																			width: { xs: 32, sm: 36 }, 
																			height: { xs: 32, sm: 36 },
																			background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
																		}}>
																			<PersonIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
																		</Avatar>
																	</ListItemAvatar>
																	<ListItemText
																		primary={client.user.clientName}
																		primaryTypographyProps={{
																			fontWeight: 500,
																			color: '#2c3e50',
																			fontSize: { xs: '0.75rem', sm: '0.875rem' },
																		}}
																	/>
																</ListItem>

																{/* Insert after this client option */}
																<ListItem
																	button
																	onClick={() => handleInsertPosition(route.id, index + 1)}
																	sx={{
																		borderRadius: { xs: '6px', sm: '8px' },
																		mx: { xs: 0.5, sm: 1 },
																		py: { xs: 1, sm: 1.5 },
																		background: insertPosition === index + 1 && selectedRouteId === route.id 
																			? 'linear-gradient(45deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
																			: 'transparent',
																		border: insertPosition === index + 1 && selectedRouteId === route.id 
																			? '2px solid #667eea'
																			: '2px solid transparent',
																		'&:hover': {
																			background: 'rgba(102, 126, 234, 0.1)',
																		},
																	}}
																>
																	<ListItemAvatar>
																		<Avatar sx={{ 
																			width: { xs: 28, sm: 32 }, 
																			height: { xs: 28, sm: 32 },
																			background: 'linear-gradient(45deg, #ff9800 0%, #ff5722 100%)',
																		}}>
																			<AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
																		</Avatar>
																	</ListItemAvatar>
																	<ListItemText
																		primary={`Insert after ${client.user.clientName}`}
																		primaryTypographyProps={{
																			fontWeight: insertPosition === index + 1 && selectedRouteId === route.id ? 600 : 400,
																			color: insertPosition === index + 1 && selectedRouteId === route.id ? '#667eea' : '#2c3e50',
																			fontSize: { xs: '0.75rem', sm: '0.875rem' },
																		}}
																	/>
																</ListItem>
															</React.Fragment>
														))}
													</List>
												</Paper>
											</CardContent>
										</Collapse>
									</Card>
								</Grid>
							))}
						</Grid>
					</Box>
				)}
			</BoxModal>
		</Modal>
	)
}
