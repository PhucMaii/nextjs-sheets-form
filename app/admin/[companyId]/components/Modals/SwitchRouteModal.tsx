import {
  Divider,
  Modal,
  Box,
  Typography,
  Card,
  CardContent,
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
} from '@mui/material';
import { primary, neutral } from '@/theme/color';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Route as RouteIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Badge as EmployeeIcon,
} from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import { Order } from '../../orders/page';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import { days } from '@/app/lib/constant';
import axios from 'axios';
import { ShowNotificationType } from '@/hooks/useNotification';
import ConfirmModal from './ConfirmModal';

interface IProps extends ModalProps {
  order: Order;
  showNotification: ShowNotificationType;
  refetchOrder?: () => void;
}

interface Route {
  id: number;
  name: string;
  day: string;
  driverId: number;
  employeeId?: number;
  companyId?: number;
  clients: Array<{
    user: {
      id: number;
      clientName: string;
      clientId: string;
      contactNumber: string;
      deliveryAddress: string;
      category?: {
        name: string;
      };
      preference?: {
        paymentType: string;
      };
    };
  }>;
  driver?: {
    id: number;
    name: string;
  };
  employee?: {
    id: number;
    name: string;
  };
}

export default function SwitchRouteModal({
  open,
  onClose,
  order,
  showNotification,
  refetchOrder,
}: IProps) {
  const { companyId }: any = useParams();

  const [expandedRoutes, setExpandedRoutes] = useState<Set<number>>(new Set());
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState<any>({
    open: false,
    message: '',
  });
  const {
    data: routes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['routes', order?.deliveryDate],
    queryFn: async () => {
      const day = days[new Date(order.deliveryDate).getDay()];
      const response = await axios.get(
        getAdminApiUrl(companyId, `/routes?day=${day}`),
      );
      return response.data.data as Route[];
    },
    enabled: !!order?.deliveryDate,
  });

  const handleToggleExpanded = (routeId: number) => {
    const newExpanded = new Set(expandedRoutes);
    if (newExpanded.has(routeId)) {
      newExpanded.delete(routeId);
    } else {
      newExpanded.add(routeId);
    }
    setExpandedRoutes(newExpanded);
  };

  // const handleRouteSelect = (routeId: number) => {
  // 	setSelectedRouteId(routeId)
  // 	setInsertPosition(null) // Reset position when selecting new route
  // }

  const handleInsertPosition = (routeId: number, position: number) => {
    setSelectedRouteId(routeId);
    setInsertPosition(position);
  };

  const handleSwitchRoute = async () => {
    if (!selectedRouteId || insertPosition === null) return;

    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/orders/switch-route'),
        {
          orderId: order.id,
          currentRouteId: currentRoute?.id,
          newRouteId: selectedRouteId,
          newIndex: insertPosition,
          date: order.deliveryDate,
        },
      );

      if (response.data.error) {
        console.error('Error switching route:', response.data.error);
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      refetchOrder?.();
      onClose();
    } catch (error: any) {
      console.error('Error switching route:', error);
      showNotification(
        'error',
        error.response.data.error || 'Error switching route',
      );
    }
  };

  const getCurrentRoute = () => {
    // Find the current route for this order
    return routes?.find((route) =>
      route.clients.some((client) => client.user.id === order.userId),
    );
  };

  const currentRoute = useMemo(() => getCurrentRoute(), [routes, order.userId]);

  return (
    <>
      <ConfirmModal
        open={isOpenConfirm.open}
        onClose={() => setIsOpenConfirm({ open: false, message: '' })}
        handleSubmit={handleSwitchRoute}
        showNotification={showNotification}
        title={isOpenConfirm.message}
        buttonLabel="Switch Route"
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal
          overflow="auto"
          maxHeight="90vh"
          width="1000px"
          sx={{
            background: neutral[50],
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: `1px solid ${neutral[200]}`,
            // Mobile responsive styles
            '@media (max-width: 768px)': {
              width: '95vw',
              maxHeight: '95vh',
              margin: '2.5vh auto',
              borderRadius: '8px',
            },
            '@media (max-width: 480px)': {
              width: '98vw',
              maxHeight: '98vh',
              margin: '1vh auto',
              borderRadius: '6px',
            },
          }}
        >
          <ModalHead
            heading="Switch Route"
            buttonLabel="Switch Route"
            onClick={() => {}}
            buttonProps={{}}
            onClose={onClose}
            onlyHeading
          />

          <Divider
            sx={{
              my: { xs: 2, sm: 3 },
              borderColor: neutral[200],
            }}
          />

          {isLoading && (
            <Box display="flex" justifyContent="center" py={{ xs: 4, sm: 6 }}>
              <CircularProgress
                sx={{
                  color: primary.main,
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
                borderRadius: '8px',
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
                borderRadius: '8px',
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
                  borderRadius: '8px',
                  background: 'white',
                  border: `1px solid ${neutral[200]}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: primary.main,
                    mb: 1,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  }}
                >
                  Available Routes for{' '}
                  {days[new Date(order.deliveryDate).getDay()]}
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
                  <Box
                    component="span"
                    sx={{ fontWeight: 600, color: primary.main }}
                  >
                    Current route: {currentRoute?.name || 'Unknown'}
                  </Box>
                </Typography>
              </Paper>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {routes.map((route) => (
                  <Grid item xs={12} key={route.id}>
                    <Card
                      sx={{
                        border: selectedRouteId === route.id ? 2 : 1,
                        borderColor:
                          selectedRouteId === route.id
                            ? primary.main
                            : neutral[200],
                        transition: 'all 0.2s ease-in-out',
                        background:
                          selectedRouteId === route.id
                            ? primary.alpha4
                            : 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        '&:hover': {
                          borderColor: primary.main,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={{ xs: 2, sm: 3 }}
                          >
                            <Avatar
                              sx={{
                                width: { xs: 48, sm: 56 },
                                height: { xs: 48, sm: 56 },
                                background: primary.main,
                              }}
                            >
                              <RouteIcon
                                sx={{ fontSize: { xs: 24, sm: 28 } }}
                              />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                  fontWeight: 600,
                                  color: neutral[800],
                                  mb: 0.5,
                                  fontSize: { xs: '1rem', sm: '1.25rem' },
                                }}
                              >
                                {route.name}
                              </Typography>
                              {route.employee && (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.5}
                                >
                                  <EmployeeIcon
                                    sx={{
                                      fontSize: { xs: 14, sm: 16 },
                                      color: neutral[600],
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: {
                                        xs: '0.75rem',
                                        sm: '0.875rem',
                                      },
                                    }}
                                  >
                                    {route.employee.name}
                                  </Typography>
                                </Box>
                              )}
                              {/* </Stack> */}
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
                                background: primary.alpha4,
                                borderColor: primary.alpha30,
                                color: primary.main,
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              }}
                            />
                            {currentRoute?.id === route.id && (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Current"
                                size="small"
                                sx={{
                                  background: '#4caf50',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                }}
                              />
                            )}
                            <IconButton
                              onClick={() => handleToggleExpanded(route.id)}
                              aria-expanded={expandedRoutes.has(route.id)}
                              size="small"
                              sx={{
                                background: primary.alpha4,
                                color: primary.main,
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                                '&:hover': {
                                  background: primary.alpha8,
                                },
                              }}
                            >
                              {expandedRoutes.has(route.id) ? (
                                <ExpandLessIcon
                                  sx={{ fontSize: { xs: 18, sm: 20 } }}
                                />
                              ) : (
                                <ExpandMoreIcon
                                  sx={{ fontSize: { xs: 18, sm: 20 } }}
                                />
                              )}
                            </IconButton>
                          </Stack>
                        </Box>
                      </CardContent>

                      <Collapse
                        in={expandedRoutes.has(route.id)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <CardContent sx={{ pt: 0, pb: { xs: 2, sm: 3 } }}>
                          <Divider
                            sx={{
                              mb: { xs: 2, sm: 3 },
                              borderColor: neutral[200],
                            }}
                          />
                          <Typography
                            variant="subtitle1"
                            gutterBottom
                            sx={{
                              fontWeight: 600,
                              color: neutral[800],
                              mb: 2,
                              fontSize: { xs: '0.875rem', sm: '1rem' },
                            }}
                          >
                            Client List - Click to insert order at position:
                          </Typography>

                          <Paper
                            elevation={0}
                            sx={{
                              background: neutral[50],
                              borderRadius: '8px',
                              border: `1px solid ${neutral[200]}`,
                              maxHeight: { xs: '250px', sm: '300px' },
                              overflow: 'auto',
                            }}
                          >
                            <List sx={{ p: 0 }}>
                              {/* Insert at beginning option */}
                              <ListItem
                                button
                                onClick={() => {
                                  setIsOpenConfirm({
                                    open: true,
                                    message: `Are you sure you want to switch from ${currentRoute?.name} to ${route.name} at the beginning?`,
                                  });
                                  handleInsertPosition(route.id, 0);
                                }}
                                sx={{
                                  borderRadius: 2,
                                  mx: { xs: 0.5, sm: 1 },
                                  mt: { xs: 0.5, sm: 1 },
                                  py: { xs: 1, sm: 1.5 },
                                  background:
                                    insertPosition === 0 &&
                                    selectedRouteId === route.id
                                      ? primary.alpha4
                                      : 'transparent',
                                  border:
                                    insertPosition === 0 &&
                                    selectedRouteId === route.id
                                      ? `2px solid ${primary.main}`
                                      : '2px solid transparent',
                                  '&:hover': {
                                    background: primary.alpha4,
                                  },
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{
                                      width: { xs: 28, sm: 32 },
                                      height: { xs: 28, sm: 32 },
                                      background: '#ff9800',
                                    }}
                                  >
                                    <AddIcon
                                      sx={{ fontSize: { xs: 16, sm: 18 } }}
                                    />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Insert at beginning"
                                  primaryTypographyProps={{
                                    fontWeight:
                                      insertPosition === 0 &&
                                      selectedRouteId === route.id
                                        ? 600
                                        : 400,
                                    color:
                                      insertPosition === 0 &&
                                      selectedRouteId === route.id
                                        ? primary.main
                                        : neutral[800],
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
                                      borderRadius: '6px',
                                      mx: { xs: 0.5, sm: 1 },
                                      '&:hover': {
                                        background: primary.alpha4,
                                      },
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar
                                        sx={{
                                          width: { xs: 32, sm: 36 },
                                          height: { xs: 32, sm: 36 },
                                          background: primary.main,
                                        }}
                                      >
                                        <PersonIcon
                                          sx={{ fontSize: { xs: 18, sm: 20 } }}
                                        />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={client.user.clientName}
                                      primaryTypographyProps={{
                                        fontWeight: 500,
                                        color: neutral[800],
                                        fontSize: {
                                          xs: '0.75rem',
                                          sm: '0.875rem',
                                        },
                                      }}
                                    />
                                  </ListItem>

                                  {/* Insert after this client option */}
                                  <ListItem
                                    button
                                    onClick={() => {
                                      setIsOpenConfirm({
                                        open: true,
                                        message: `Are you sure you want to switch from ${currentRoute?.name} to ${route.name} after ${client.user.clientName}?`,
                                      });
                                      handleInsertPosition(route.id, index + 1);
                                    }}
                                    sx={{
                                      borderRadius: 2,
                                      mx: { xs: 0.5, sm: 1 },
                                      py: { xs: 1, sm: 1.5 },
                                      background:
                                        insertPosition === index + 1 &&
                                        selectedRouteId === route.id
                                          ? primary.alpha4
                                          : 'transparent',
                                      border:
                                        insertPosition === index + 1 &&
                                        selectedRouteId === route.id
                                          ? `2px solid ${primary.main}`
                                          : '2px solid transparent',
                                      '&:hover': {
                                        background: primary.alpha4,
                                      },
                                    }}
                                  >
                                    <ListItemAvatar>
                                      <Avatar
                                        sx={{
                                          width: { xs: 28, sm: 32 },
                                          height: { xs: 28, sm: 32 },
                                          background: '#ff9800',
                                        }}
                                      >
                                        <AddIcon
                                          sx={{ fontSize: { xs: 16, sm: 18 } }}
                                        />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={`Insert after ${client.user.clientName}`}
                                      primaryTypographyProps={{
                                        fontWeight:
                                          insertPosition === index + 1 &&
                                          selectedRouteId === route.id
                                            ? 600
                                            : 400,
                                        color:
                                          insertPosition === index + 1 &&
                                          selectedRouteId === route.id
                                            ? primary.main
                                            : neutral[800],
                                        fontSize: {
                                          xs: '0.75rem',
                                          sm: '0.875rem',
                                        },
                                      }}
                                      sx={{
                                        borderRadius: 2,
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
    </>
  );
}
