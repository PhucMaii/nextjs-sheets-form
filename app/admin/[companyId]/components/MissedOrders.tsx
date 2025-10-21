import {
  Box,
  Button,
  Modal,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Paper,
  Badge,
  IconButton,
  alpha,
  useTheme,
  Fade,
  CircularProgress,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import WarningIcon from '@mui/icons-material/Warning';
import { BoxModal } from './Modals/styled';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { days } from '@/app/lib/constant';

export default function MissedOrders() {
  const { companyId }: any = useParams();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const { data, isLoading } = useQuery({
    queryKey: ['missed-orders'],
    queryFn: async () => {
      const response = await axios.get(
        `/api/admin/${companyId}/orders/missed-orders`,
      );
      return response.data.data;
    },
    enabled: !!companyId,
  });

  const missedOrdersCount = useMemo(
    () => data?.missedOrders?.length || 0,
    [data],
  );

  const isAllowToShow = useMemo(() => {
    const today = new Date();
    const isAfter6AM = today.getHours() >= 6;
    const isBefore11PM = today.getHours() <= 23;

    return isAfter6AM && isBefore11PM && missedOrdersCount > 0;
  }, [missedOrdersCount]);

  if (!isAllowToShow) {
    return null;
  }

  return (
    <>
      <Badge
        badgeContent={missedOrdersCount}
        color="error"
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.75rem',
            fontWeight: 600,
            minWidth: '20px',
            height: '20px',
          },
        }}
      >
        <Button
          startIcon={<EventBusyIcon />}
          variant="outlined"
          color="warning"
          onClick={() => setOpen(true)}
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            py: 1,
            borderColor: alpha(theme.palette.warning.main, 0.3),
            color: theme.palette.warning.main,
            '&:hover': {
              borderColor: theme.palette.warning.main,
              backgroundColor: alpha(theme.palette.warning.main, 0.08),
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.2)}`,
            },
          }}
        >
          Missed Orders ({days[new Date().getDay()]})
        </Button>
      </Badge>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Fade in={open}>
          <BoxModal
            maxHeight="85vh"
            overflow="hidden"
            sx={{
              width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
              maxWidth: '900px',
              borderRadius: 3,
              boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            {/* Custom Header */}
            <Box
              sx={{
                p: 3,
                pb: 2,
                backgrounColor: theme.palette.warning.light,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                position: 'relative',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.15),
                      color: theme.palette.warning.main,
                      border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    }}
                  >
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="text.primary"
                    >
                      Missed Orders Alert
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {missedOrdersCount === 0
                        ? 'No missed orders found'
                        : `${missedOrdersCount} order${missedOrdersCount > 1 ? 's' : ''} require${missedOrdersCount === 1 ? 's' : ''} attention`}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton
                  onClick={() => setOpen(false)}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Content */}
            <Box
              sx={{ p: 3, overflow: 'auto', maxHeight: 'calc(85vh - 120px)' }}
            >
              {isLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  py={4}
                >
                  <CircularProgress color="warning" />
                </Box>
              ) : missedOrdersCount === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: alpha(theme.palette.success.main, 0.15),
                      color: theme.palette.success.main,
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <EventBusyIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="success.main"
                    gutterBottom
                  >
                    All Orders Delivered Successfully
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No missed orders to display at this time.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={3}>
                  {data?.formattedMissedOrders &&
                    Object.keys(data.formattedMissedOrders || {}).map(
                      (route) => (
                        <Card
                          key={route}
                          elevation={0}
                          sx={{
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 0 }}>
                            {/* Route Header */}
                            <Box
                              sx={{
                                p: 2.5,
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.05,
                                ),
                                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                              >
                                <Avatar
                                  sx={{
                                    backgroundColor: alpha(
                                      theme.palette.primary.main,
                                      0.15,
                                    ),
                                    color: theme.palette.primary.main,
                                    width: 40,
                                    height: 40,
                                  }}
                                >
                                  <RouteIcon />
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    color="text.primary"
                                  >
                                    {route}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {data.formattedMissedOrders[route].length}{' '}
                                    missed order
                                    {data.formattedMissedOrders[route].length >
                                    1
                                      ? 's'
                                      : ''}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>

                            {/* Missed Orders List */}
                            <Box sx={{ p: 2 }}>
                              <Stack spacing={1.5}>
                                {data.formattedMissedOrders[route].map(
                                  (missedOrder: any) => (
                                    <Paper
                                      key={missedOrder.id}
                                      elevation={0}
                                      sx={{
                                        p: 2,
                                        backgroundColor: alpha(
                                          theme.palette.error.main,
                                          0.03,
                                        ),
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                                        borderRadius: 1.5,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                          backgroundColor: alpha(
                                            theme.palette.error.main,
                                            0.06,
                                          ),
                                          borderColor: alpha(
                                            theme.palette.error.main,
                                            0.2,
                                          ),
                                        },
                                      }}
                                    >
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={2}
                                      >
                                        <Avatar
                                          sx={{
                                            backgroundColor: alpha(
                                              theme.palette.error.main,
                                              0.15,
                                            ),
                                            color: theme.palette.error.main,
                                            width: 36,
                                            height: 36,
                                          }}
                                        >
                                          <PersonIcon sx={{ fontSize: 20 }} />
                                        </Avatar>
                                        <Box flex={1}>
                                          <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            color="text.primary"
                                          >
                                            {missedOrder.user.clientName}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            Client ID:{' '}
                                            {missedOrder.user.clientId}
                                          </Typography>
                                        </Box>
                                        <Chip
                                          label="Missed"
                                          size="small"
                                          color="error"
                                          variant="outlined"
                                          sx={{
                                            fontWeight: 600,
                                            borderColor: alpha(
                                              theme.palette.error.main,
                                              0.3,
                                            ),
                                            color: theme.palette.error.main,
                                            backgroundColor: alpha(
                                              theme.palette.error.main,
                                              0.08,
                                            ),
                                          }}
                                        />
                                      </Stack>
                                    </Paper>
                                  ),
                                )}
                              </Stack>
                            </Box>
                          </CardContent>
                        </Card>
                      ),
                    )}
                </Stack>
              )}
            </Box>
          </BoxModal>
        </Fade>
      </Modal>
    </>
  );
}
