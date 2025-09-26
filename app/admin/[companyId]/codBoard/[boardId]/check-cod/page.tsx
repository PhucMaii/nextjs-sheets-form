'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  AttachMoney as CurrencyDollarIcon,
  Description as DocumentTextIcon,
  Person as UserIcon,
  Done as DoneIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Money as MoneyIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getAdminApiUrl } from '@/app/utils/enum';
import { Order } from '../../../orders/page';
import OverviewCard from '../../../components/OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { ORDER_STATUS } from '@/app/utils/enum';
import { grey, red } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import { LoadingButton } from '@mui/lab';
import BackButton from '../../../components/BackButton';
import CheckCODTable from '../../../components/Tables/CheckCODTable';
import { EditIcon } from 'lucide-react';
import SingleFieldEdit from '../../../components/Modals/edit/SingleFieldEdit';
const CheckCod = () => {
  const { companyId, boardId }: any = useParams();
  const [isOpenEditCashInput, setIsOpenEditCashInput] =
    useState<boolean>(false);

  // Data Fetching
  const {
    data: boardData,
    isLoading: isLoadingBoardData,
    refetch: refetchBoard,
  } = useQuery({
    queryKey: ['boardData', boardId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/cod?id=${boardId}`),
      );
      return response.data.data;
    },
  });
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [completedClients, setCompletedClients] = useState<any[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [clientWithOrders, setClientWithOrders] = useState<any>({});
  const [clientKeys, setClientKeys] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showNotification, NotificationComp } = useNotification();

  const sortedClientPositionIndex: string[] = useMemo(() => {
    if (!boardData) {
      return [];
    }
    return boardData.boardClientPositionIndex.map((client: any) => {
      return client.userId.toString();
    });
  }, [boardData]);

  const totalBill = useMemo(() => {
    if (!selectedClient) {
      return 0;
    }
    return selectedClient?.orders.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);
  }, [selectedClient]);

  // Money tracking calculations
  const moneyStats = useMemo(() => {
    if (!boardData) {
      return {
        targetMoney: 0,
        completedMoney: 0,
        remainingMoney: 0,
        exceedMoney: 0,
        completionPercentage: 0,
        cashInputShouldBe: 0,
      };
    }

    // Calculate target money (sum of all orders)
    const targetMoney = boardData.orders.reduce((acc: number, order: any) => {
      return acc + (order.totalPrice || 0);
    }, 0);

    // Calculate completed money (sum of completed orders)
    const completedMoney = boardData.orders
      .filter((order: any) => order.isCODCheck)
      .reduce((acc: number, order: any) => {
        return acc + (order.totalPrice || 0);
      }, 0);

    const remainingMoney = targetMoney - completedMoney;
    const exceedMoney = completedMoney - targetMoney;
    const completionPercentage =
      targetMoney > 0 ? (completedMoney / targetMoney) * 100 : 0;

    const expenseTotal = boardData.expense.reduce(
      (acc: number, expense: any) => {
        return acc + expense.amount;
      },
      0,
    );
    const cashInputShouldBe = targetMoney - completedMoney - expenseTotal;
    return {
      targetMoney,
      completedMoney,
      remainingMoney,
      exceedMoney,
      completionPercentage,
      cashInputShouldBe,
    };
  }, [boardData]);

  useEffect(() => {
    if (boardData) {
      // Format map of clientIds with client data
      const clients = boardData.orders.reduce((acc: any, order: Order) => {
        if (!acc[order.userId]) {
          acc[order.userId] = {
            ...order.user,
            orders: [],
            completed: true,
          };
        }

        acc[order.userId].orders.push(order);

        if (!order.isCODCheck) {
          acc[order.userId].completed = false;
        }
        return acc;
      }, {});

      setCompletedClients(
        Object.values(clients).filter((client: any) => client.completed),
      );

      setClientWithOrders(clients);
    }
  }, [boardData]);

  useEffect(() => {
    if (sortedClientPositionIndex && clientWithOrders) {
      setClientKeys(Array.from(new Set([...sortedClientPositionIndex, ...Object.keys(clientWithOrders)])));
    }
  }, [clientWithOrders, sortedClientPositionIndex]);

  const handleCompleteChecking = async () => {
    if (!selectedClient) {
      showNotification('error', 'Please select a client');
      return;
    }

    try {
      setIsChecking(true);
      const response = await axios.post(
        getAdminApiUrl(companyId, '/cod/check-cod'),
        {
          orderIds: selectedClient.orders.map((order: any) => order.id),
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setCompletedClients([...completedClients, selectedClient]);
      setClientWithOrders((prev: any) => {
        const newClientWithOrders = { ...prev };
        newClientWithOrders[selectedClient.id].completed = true;
        return newClientWithOrders;
      });
      refetchBoard();

      // select next client
      const nonCheckClients = Object.keys(clientWithOrders).filter(
        (k: string) => {
          return (
            !clientWithOrders[k].completed && Number(k) !== selectedClient.id
          );
        },
      );

      if (nonCheckClients.length > 0) {
        setSelectedClient(clientWithOrders[nonCheckClients[0]]);
      } else {
        setSelectedClient(null);
      }
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleResetAll = async () => {
    try {
      setIsResetting(true);
      const response = await axios.post(
        getAdminApiUrl(companyId, '/cod/check-cod/reset-check-cod'),
        { boardId: Number(boardId) },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      refetchBoard();
      setClientWithOrders((prev: any) => {
        const newClientWithOrders = { ...prev };
        Object.keys(newClientWithOrders).forEach((k: string) => {
          newClientWithOrders[k].completed = false;
        });
        return newClientWithOrders;
      });
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleEditCashInput = async (newValue: any) => {
    if (!boardData) {
      showNotification('error', 'Board data not found');
      return;
    }

    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/cod'), {
        id: boardData?.id,
        updatedBoard: {
          cash: Number(newValue),
          date: boardData?.date,
          driverId: boardData?.driverId,
        },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      refetchBoard();
      showNotification('success', response.data.message);
      setIsOpenEditCashInput(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
    }
  };

  const handleClientSelect = (clientId: number) => {
    setSelectedClient(clientWithOrders[clientId]);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const getFulFillmentStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
        return 'primary';
      case ORDER_STATUS.INCOMPLETED:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Skeleton Components
  const ClientCardSkeleton = () => (
    <Card elevation={1} sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="circular" width={20} height={20} />
            </Box>
            <Skeleton variant="text" width="80%" height={16} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="70%" height={14} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </CardContent>
    </Card>
  );

  const StatsCardSkeleton = () => (
    <Card sx={{ bgcolor: 'primary.50', border: 1, borderColor: 'primary.100' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Box>
            <Skeleton variant="text" width="80px" height={16} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60px" height={32} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const OrderCardSkeleton = () => (
    <Card elevation={1}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Skeleton variant="text" width="120px" height={24} />
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Skeleton
              variant="text"
              width="40px"
              height={12}
              sx={{ mb: 0.5 }}
            />
            <Skeleton variant="text" width="20px" height={16} />
          </Grid>
          <Grid item xs={6}>
            <Skeleton
              variant="text"
              width="80px"
              height={12}
              sx={{ mb: 0.5 }}
            />
            <Skeleton variant="text" width="60px" height={16} />
          </Grid>
          <Grid item xs={6}>
            <Skeleton
              variant="text"
              width="60px"
              height={12}
              sx={{ mb: 0.5 }}
            />
            <Skeleton variant="text" width="30px" height={16} />
          </Grid>
          <Grid item xs={6}>
            <Skeleton
              variant="text"
              width="70px"
              height={12}
              sx={{ mb: 0.5 }}
            />
            <Skeleton variant="text" width="50px" height={16} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <SingleFieldEdit
        open={isOpenEditCashInput}
        onClose={() => setIsOpenEditCashInput(false)}
        handleUpdate={handleEditCashInput}
        title="Edit Cash Input"
        inputLabel="Cash"
        defaultValue={boardData?.cash || 0}
        buttonLabel="Update"
      />
      {NotificationComp}

      {/* Money Tracking Navbar */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'white',
          borderBottom: 1,
          borderColor: 'grey.200',
        }}
      >
        <Box sx={{ p: isMobile ? 1 : 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 1,
            }}
          >
            {/* Row 1 */}
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'primary.50',
                  border: 1,
                  borderColor: grey[200],
                }}
              >
                <MoneyIcon sx={{ color: 'success.main', fontSize: 16 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant={isMobile ? 'caption' : 'subtitle2'}
                      color="text.secondary"
                    >
                      Cash Input
                    </Typography>
                    <Typography
                      variant={isMobile ? 'caption' : 'subtitle2'}
                      color="success.main"
                    >
                      (${moneyStats.cashInputShouldBe.toFixed(2)})
                    </Typography>
                  </Box>
                  <Typography
                    variant={isMobile ? 'caption' : 'subtitle2'}
                    fontWeight="bold"
                    color={
                      Math.abs(boardData?.cash - moneyStats.cashInputShouldBe) <
                      5
                        ? 'success.main'
                        : 'error.main'
                    }
                  >
                    ${boardData?.cash?.toFixed(2)}
                  </Typography>
                </Box>
                <IconButton onClick={() => setIsOpenEditCashInput(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'primary.50',
                  border: 1,
                  borderColor: grey[200],
                }}
              >
                <AccountBalanceIcon
                  sx={{ color: 'primary.main', fontSize: 16 }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant={isMobile ? 'caption' : 'subtitle2'}
                    color="text.secondary"
                  >
                    Target
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'subtitle2'}
                    fontWeight="bold"
                    color="primary.main"
                  >
                    ${moneyStats.targetMoney.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Row 2 */}
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'success.50',
                  border: 1,
                  borderColor: grey[200],
                }}
              >
                <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant={isMobile ? 'caption' : 'subtitle2'}
                    color="text.secondary"
                  >
                    Collected
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'subtitle2'}
                    fontWeight="bold"
                    color="success.main"
                  >
                    ${moneyStats.completedMoney.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  borderRadius: 1,
                  border: 1,
                  borderColor:
                    moneyStats.exceedMoney > 0 ? red[200] : grey[200],
                }}
              >
                {moneyStats.exceedMoney > 0 ? (
                  <TrendingUpIcon
                    sx={{ color: 'warning.main', fontSize: 16 }}
                  />
                ) : (
                  <TrendingDownIcon
                    sx={{ color: 'error.main', fontSize: 16 }}
                  />
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant={isMobile ? 'caption' : 'subtitle2'}
                    color="text.secondary"
                  >
                    {moneyStats.exceedMoney > 0 ? 'Exceed' : 'Remaining'}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'subtitle2'}
                    fontWeight="bold"
                    color={
                      moneyStats.exceedMoney > 0 ? 'warning.main' : 'error.main'
                    }
                  >
                    $
                    {Math.abs(
                      moneyStats.exceedMoney > 0
                        ? moneyStats.exceedMoney
                        : moneyStats.remainingMoney,
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              {/* Row 3 */}
            </Box>
            <Box sx={{ flex: 1, p: 1, flexGrow: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography
                  variant={isMobile ? 'caption' : 'subtitle2'}
                  color="text.secondary"
                >
                  Progress
                </Typography>
                <Typography
                  variant={isMobile ? 'caption' : 'subtitle2'}
                  color="text.secondary"
                  fontWeight="bold"
                >
                  {moneyStats.completionPercentage.toFixed(1)}%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 4,
                  bgcolor: 'grey.200',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(moneyStats.completionPercentage, 100)}%`,
                    height: '100%',
                    bgcolor:
                      moneyStats.completionPercentage >= 100
                        ? 'success.main'
                        : 'primary.main',
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="sticky"
          color="default"
          elevation={1}
          sx={{ top: 'auto' }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {boardData?.employee?.name ||
                boardData?.driver?.name ||
                'No Route Board'}
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {boardData?.date}
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      <Box
        sx={{
          display: 'flex',
          height: isMobile
            ? 'calc(100vh - 64px - 120px)'
            : 'calc(100vh - 120px)',
        }}
      >
        {/* Desktop Sidebar - Client List */}
        {!isMobile && (
          <Paper
            elevation={3}
            sx={{
              width: 320,
              bgcolor: 'white',
              borderRight: 1,
              borderColor: 'grey.200',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'grey.200' }}>
              <BackButton />
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                color="text.primary"
              >
                COD Check
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {boardData?.employee?.name
                  ? `${boardData.employee.name}'s board`
                  : 'No Route Board'}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {boardData?.date}
              </Typography>
              <LoadingButton
                variant="outlined"
                color="error"
                loading={isResetting}
                onClick={handleResetAll}
              >
                Reset All
              </LoadingButton>
            </Box>

            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
              {isLoadingBoardData ? (
                <Stack spacing={2}>
                  {[...Array(5)].map((_, index) => (
                    <ClientCardSkeleton key={index} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  {clientKeys.map((userId: string) => {
                    const client = clientWithOrders[userId];
                    if (!client) {
                      return null;
                    }
                    const isCompleted = completedClients.some(
                      (c: any) => c.id === client.id,
                    );
                    const isSelected = selectedClient?.id === client.id;

                    return (
                      <Card
                        key={client.id}
                        elevation={isSelected ? 2 : 1}
                        onClick={() => handleClientSelect(client.id)}
                        sx={{
                          cursor: 'pointer',
                          border: 2,
                          borderColor: isSelected ? 'primary.main' : 'grey.200',
                          bgcolor: isSelected ? 'primary.50' : 'white',
                          opacity: isCompleted ? 0.6 : 1,
                          boxShadow: isSelected
                            ? '0 0 10px 0 rgba(0, 0, 0, 0.1)'
                            : 'none',
                          '&:hover': {
                            borderColor: isSelected
                              ? 'primary.main'
                              : 'grey.300',
                            bgcolor: isSelected ? 'primary.50' : 'grey.50',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  component="h3"
                                  sx={{
                                    fontWeight: 'semibold',
                                    textDecoration: isCompleted
                                      ? 'line-through'
                                      : 'none',
                                    color: isCompleted
                                      ? 'text.disabled'
                                      : 'text.primary',
                                  }}
                                >
                                  {client.clientName}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {client.clientId || 'N/A'}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                {client.contactNumber}
                              </Typography>
                            </Box>
                            {isCompleted && (
                              <Avatar sx={{ bgcolor: 'success.main' }}>
                                <DoneIcon />
                              </Avatar>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Paper>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'grey.200' }}>
            <BackButton />

            <Typography
              variant="h6"
              component="h2"
              fontWeight="bold"
              color="text.primary"
            >
              Select Client
            </Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            {isLoadingBoardData ? (
              <List>
                {[...Array(5)].map((_, index) => (
                  <ListItem key={index} sx={{ mb: 1 }}>
                    <ListItemIcon>
                      <Skeleton variant="circular" width={32} height={32} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Skeleton variant="text" width="60%" height={20} />
                      }
                      secondary={
                        <Box>
                          <Skeleton
                            variant="text"
                            width="80%"
                            height={14}
                            sx={{ mb: 0.5 }}
                          />
                          <Skeleton variant="text" width="70%" height={14} />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <List>
                {clientKeys.map((userId: string) => {
                  const client = clientWithOrders[userId];
                  if (!client) {
                    return null;
                  }
                  const isCompleted = completedClients.some(
                    (c: any) => c.id === client.id,
                  );
                  const isSelected = selectedClient?.id === client.id;

                  return (
                    <ListItem
                      key={client.id}
                      button
                      onClick={() => handleClientSelect(client.id)}
                      selected={isSelected}
                      sx={{
                        mb: 1,
                        borderRadius: 1,
                        opacity: isCompleted ? 0.6 : 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.50',
                          '&:hover': {
                            bgcolor: 'primary.100',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>
                        {isCompleted ? (
                          <Avatar
                            sx={{
                              bgcolor: 'success.main',
                              width: 32,
                              height: 32,
                            }}
                          >
                            <DoneIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                        ) : (
                          <Avatar
                            sx={{ bgcolor: 'grey.300', width: 32, height: 32 }}
                          >
                            <UserIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 'medium',
                              textDecoration: isCompleted
                                ? 'line-through'
                                : 'none',
                              color: isCompleted
                                ? 'text.disabled'
                                : 'text.primary',
                            }}
                          >
                            {client.clientName}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {client.clientId || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {client.contactNumber}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Drawer>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedClient ? (
            <>
              {/* Header with Stats */}
              <Paper
                elevation={1}
                sx={{
                  borderBottom: 1,
                  borderColor: 'grey.200',
                  p: isMobile ? 2 : 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 3,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 2 : 0,
                  }}
                >
                  <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <Typography
                      variant={isMobile ? 'h6' : 'h5'}
                      component="h2"
                      fontWeight="semibold"
                      color="text.primary"
                    >
                      {selectedClient.clientName}&apos;s Orders
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {completedClients.some(
                        (c: any) => c.id === selectedClient?.id,
                      )
                        ? 'Payment Confirmed'
                        : 'Pending Payment Collection'}
                    </Typography>
                  </Box>

                  {!completedClients.some(
                    (c: any) => c.id === selectedClient.id,
                  ) && (
                    <LoadingButton
                      loading={isChecking}
                      onClick={handleCompleteChecking}
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      sx={{ px: 3, py: 1, width: isMobile ? '100%' : 'auto' }}
                    >
                      Complete Checking
                    </LoadingButton>
                  )}
                </Box>

                {/* Stats Cards */}
                <Grid container spacing={isMobile ? 2 : 3}>
                  <Grid item xs={12} sm={6}>
                    {isLoadingBoardData ? (
                      <StatsCardSkeleton />
                    ) : (
                      <OverviewCard
                        text="Total Orders"
                        value={selectedClient.orders.length}
                        //  backgroundColor={primary.lightest}
                        textColor="black"
                        icon={<ReceiptLongIcon fontSize="large" />}
                        iconBackground={grey[50]}
                        style={{
                          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                          border: `1px solid ${grey[200]} `,
                        }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    {isLoadingBoardData ? (
                      <StatsCardSkeleton />
                    ) : (
                      <OverviewCard
                        text="Total Bill"
                        value={`$${totalBill.toFixed(2)}`}
                        textColor="black"
                        icon={<CurrencyDollarIcon fontSize="large" />}
                        iconBackground={grey[50]}
                        style={{
                          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                          border: `1px solid ${grey[200]} `,
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Paper>

              {/* Orders Table */}
              <Box sx={{ flex: 1, p: isMobile ? 1 : 3 }}>
                {isMobile ? (
                  // Mobile Card View
                  <Stack spacing={2}>
                    {isLoadingBoardData ? (
                      // Show skeleton cards when loading
                      [...Array(3)].map((_, index) => (
                        <OrderCardSkeleton key={index} />
                      ))
                    ) : (
                      <>
                        {selectedClient &&
                          selectedClient?.orders.map((order: any) => (
                            <Card key={order.id} elevation={1}>
                              <CardContent>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    mb: 2,
                                  }}
                                >
                                  <Typography variant="h6" fontWeight="bold">
                                    {order.id}
                                  </Typography>
                                  <Chip
                                    label={order.status}
                                    color={
                                      getFulFillmentStatusColor(
                                        order.status,
                                      ) as any
                                    }
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>

                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Items
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {order.items?.length || 0}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Delivery Date
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {new Date(
                                        order.deliveryDate,
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Client ID
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {selectedClient.clientId}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Total Bill
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color="success.main"
                                    >
                                      ${order.totalPrice?.toFixed(2) || '0.00'}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          ))}

                        {selectedClient &&
                          selectedClient?.orders.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                              <DocumentTextIcon
                                sx={{
                                  fontSize: 48,
                                  color: 'grey.400',
                                  mx: 'auto',
                                  mb: 2,
                                }}
                              />
                              <Typography
                                variant="h6"
                                color="text.primary"
                                gutterBottom
                              >
                                No orders found
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                This client has no orders to display.
                              </Typography>
                            </Box>
                          )}
                      </>
                    )}
                  </Stack>
                ) : (
                  // Desktop Table View
                  <CheckCODTable
                    isLoadingBoardData={isLoadingBoardData}
                    selectedClient={selectedClient}
                    boardData={boardData}
                  />
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                {isLoadingBoardData ? (
                  <>
                    <Skeleton
                      variant="circular"
                      width={isMobile ? 64 : 48}
                      height={isMobile ? 64 : 48}
                      sx={{ mx: 'auto', mb: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="200px"
                      height={isMobile ? 32 : 28}
                      sx={{ mx: 'auto', mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="300px"
                      height={20}
                      sx={{ mx: 'auto', mb: 2 }}
                    />
                    {isMobile && (
                      <Skeleton
                        variant="rectangular"
                        width="150px"
                        height={36}
                        sx={{ mx: 'auto', borderRadius: 1 }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <UserIcon
                      sx={{
                        fontSize: isMobile ? 64 : 48,
                        color: 'grey.400',
                        mx: 'auto',
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'h5' : 'h6'}
                      color="text.primary"
                      gutterBottom
                    >
                      No client selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isMobile
                        ? 'Tap the menu button to select a client'
                        : 'Select a client from the sidebar to view their orders'}
                    </Typography>
                    {isMobile && (
                      <Button
                        variant="outlined"
                        startIcon={<MenuIcon />}
                        onClick={() => setMobileDrawerOpen(true)}
                        sx={{ mt: 2 }}
                      >
                        Select Client
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Menu for Client Selection */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: { width: 200 },
        }}
      >
        <MenuItem
          onClick={() => {
            setSelectedClient(null);
            handleMobileMenuClose();
          }}
        >
          <ListItemIcon>
            <ArrowBackIcon />
          </ListItemIcon>
          <ListItemText>Back to Client List</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CheckCod;
