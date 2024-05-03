'use client';
import AuthenGuard, { SplashScreen } from '@/app/HOC/AuthenGuard';
import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { blue } from '@mui/material/colors';
import { Notification, UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL, ORDER_TYPE, PAYMENT_TYPE } from '@/app/utils/enum';
import NotificationPopup from '../components/Notification';
import ClientsTable from '../components/ClientsTable';
import LoadingModal from '../components/Modals/LoadingModal';
import { Category } from '@prisma/client';
import { ShadowSection } from '../reports/styled';
import useDebounce from '@/hooks/useDebounce';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddBoxIcon from '@mui/icons-material/AddBox';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ErrorComponent from '../components/ErrorComponent';
import { DropdownItemContainer } from '../orders/styled';
import SingleFieldUpdate, {
  SingleFieldUpdateProps,
} from '../components/Modals/SingleFieldUpdate';
import { infoColor } from '@/app/theme/color';
import AddClient from '../components/Modals/AddClient';

export default function ClientsPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [baseClientList, setBaseClientList] = useState<UserType[]>([]);
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [singleFieldUpdateProps, setSingleFieldUpdateProps] =
    useState<SingleFieldUpdateProps>({
      open: false,
      title: '',
      menuList: [],
      label: '',
      updatedField: 'orderType',
    });
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isAddClientOpen, setIsAddClientOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [selectedClients, setSelectedClients] = useState<UserType[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    handleFetchAllUsers();
    handleFetchAllCategories();
  }, []);

  useEffect(() => {
    if (debouncedKeywords) {
      const newClientList = baseClientList.filter((client: UserType) => {
        if (
          client.clientId.includes(debouncedKeywords) ||
          client.clientName
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
      setClientList(newClientList);
    } else {
      setClientList(baseClientList);
    }
  }, [debouncedKeywords, baseClientList]);

  const numberOfUserUsingApp = useCallback(() => {
    const totalUserUsingApp = baseClientList.filter((client: UserType) => {
      return client?.preference?.orderType === ORDER_TYPE.QR_CODE;
    });

    const percentageTaken =
      (totalUserUsingApp.length / baseClientList.length) * 100;
    return {
      numberOfUsers: totalUserUsingApp.length,
      percentage: percentageTaken.toFixed(2),
    };
  }, [baseClientList]);

  const numberOfUserPayMonthly = useCallback(() => {
    const totalUserPayMonthly = baseClientList.filter((client: UserType) => {
      return client?.preference?.paymentType === PAYMENT_TYPE.MONTHLY;
    });

    const percentageTaken =
      (totalUserPayMonthly.length / baseClientList.length) * 100;
    return {
      numberOfUsers: totalUserPayMonthly.length,
      percentage: percentageTaken.toFixed(2),
    };
  }, [baseClientList]);

  const handleAddClientUI = (newClient: UserType) => {
    setBaseClientList([...baseClientList, newClient]);
    setClientList([...clientList, newClient]);
  };

  const handleFetchAllCategories = async () => {
    try {
      const response = await axios.get(API_URL.CATEGORIES);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      setCategoryList(response.data.data);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch all categories: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch all categories: ' + error,
      });
      setIsFetching(true);
    }
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const handleFetchAllUsers = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(API_URL.CLIENTS);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      setClientList(response.data.data);
      setBaseClientList(response.data.data);
    } catch (error: any) {
      console.log('Fail to fetch all users: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch all users: ' + error,
      });
      setIsFetching(true);
    }
  };

  const handleChangeClients = (clientId: number, updatedData: any) => {
    const newClientList = baseClientList.map((client: UserType) => {
      if (client.id === clientId) {
        return { ...client, ...updatedData };
      }
      return client;
    });
    setClientList(newClientList);
    setBaseClientList(newClientList);
  };

  const handleDeleteClientUI = (clientId: number) => {
    const newClientList = clientList.filter((client: UserType) => {
      return client.id !== clientId;
    });

    setClientList(newClientList);
    setBaseClientList(newClientList);
  };

  const handleBulkUpdate = async (key: string, value: any) => {
    if (!selectedClients) {
      return;
    }
    try {
      const response = await axios.put(API_URL.CLIENTS, {
        clientList: selectedClients,
        [key]: value,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      const newClientList = baseClientList.map((client: UserType) => {
        const targetClient = response.data.data.find(
          (findClient: UserType) => findClient.id === client.id,
        );

        if (targetClient) {
          return targetClient;
        }
        return client;
      });

      setClientList(newClientList);
      setBaseClientList(newClientList);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to update client: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update client: ' + error,
      });
      return;
    }
  };

  const handleUpdateClient = async (userId: number, updatedData: object) => {
    if (Object.keys(updatedData).length === 0) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please provide at least 1 updated data',
      });
      return;
    }
    try {
      setIsUpdating(true);
      const response = await axios.put(API_URL.CLIENTS, {
        userId,
        ...updatedData,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsUpdating(false);
        return;
      }

      handleChangeClients(userId, response.data.data);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Fail to update client preference: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update client preference: ' + error,
      });
      setIsUpdating(false);
    }
  };

  const handleSelectClient = (e: any, targetClient: UserType) => {
    e.preventDefault();
    const selectedClient = selectedClients.find((client: UserType) => {
      return client.id === targetClient.id;
    });

    if (selectedClient) {
      const newSelectedClients = selectedClients.filter((client: UserType) => {
        return client.id !== targetClient.id;
      });
      setSelectedClients(newSelectedClients);
    } else {
      setSelectedClients([...selectedClients, targetClient]);
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clientList.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clientList);
    }
  };

  const generalUpdate = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <Button
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        disabled={selectedClients.length === 0}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
        endIcon={<ArrowDownwardIcon />}
        variant="outlined"
        fullWidth
      >
        General Update
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={actionButtonAnchor}
        open={openDropdown}
        onClose={handleCloseAnchor}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setSingleFieldUpdateProps({
              open: true,
              title: 'Edit Order Type',
              menuList: [
                ORDER_TYPE.FIXED,
                ORDER_TYPE.CALL,
                ORDER_TYPE.ON_CALL,
                ORDER_TYPE.QR_CODE,
              ],
              label: 'Order type',
              updatedField: 'orderType',
            });
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <Typography>Update Order Type</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSingleFieldUpdateProps({
              open: true,
              title: 'Edit Payment Type',
              menuList: [
                PAYMENT_TYPE.MONTHLY,
                PAYMENT_TYPE.COD,
                PAYMENT_TYPE.WCOD,
              ],
              label: 'Payment type',
              updatedField: 'paymentType',
            });
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <Typography>Update Payment Type</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  if (isFetching) {
    return (
      <Sidebar>
        <SplashScreen />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <AuthenGuard>
        <LoadingModal open={isUpdating} />
        <AddClient
          open={isAddClientOpen}
          onClose={() => setIsAddClientOpen(false)}
          categories={categoryList}
          setNotification={setNotification}
          handleAddClientUI={handleAddClientUI}
        />
        <SingleFieldUpdate
          open={singleFieldUpdateProps.open}
          onClose={() =>
            setSingleFieldUpdateProps({
              ...singleFieldUpdateProps,
              open: false,
            })
          }
          title={singleFieldUpdateProps.title}
          menuList={singleFieldUpdateProps.menuList}
          label={singleFieldUpdateProps.label}
          handleUpdate={handleBulkUpdate}
          updatedField={singleFieldUpdateProps.updatedField}
        />
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification({ ...notification, on: false })}
        />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={
                <PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }} />
              }
              text="Total Clients"
              value={baseClientList.length}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={<QrCodeIcon sx={{ color: blue[700], fontSize: 50 }} />}
              text="No. clients use the app"
              value={numberOfUserUsingApp().numberOfUsers as number}
              helperText={`${numberOfUserUsingApp().percentage}% of total`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <OverviewCard
              icon={
                <CalendarMonthIcon sx={{ color: blue[700], fontSize: 50 }} />
              }
              text="No. clients pay monthly"
              helperText={`${numberOfUserPayMonthly().percentage}% of total`}
              value={numberOfUserPayMonthly().numberOfUsers as number}
            />
          </Grid>
        </Grid>
        <ShadowSection>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              {generalUpdate}
            </Grid>
            <Grid item xs={11} md={8}>
              <TextField
                fullWidth
                placeholder="Search by client id or client name"
                sx={{ mb: 2 }}
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
              />
            </Grid>
            <Grid item xs={1} textAlign="center">
              <IconButton
                sx={{ width: 50, height: 40 }}
                onClick={() => setIsAddClientOpen(true)}
              >
                <AddBoxIcon sx={{ color: infoColor, width: 50, height: 50 }} />
              </IconButton>
            </Grid>
          </Grid>
          {clientList.length > 0 ? (
            <ClientsTable
              categories={categoryList}
              clients={clientList}
              handleUpdateClient={handleUpdateClient}
              handleDeleteClientUI={handleDeleteClientUI}
              setNotification={setNotification}
              selectedClients={selectedClients}
              handleSelectClient={handleSelectClient}
              handleSelectAll={handleSelectAll}
            />
          ) : (
            <ErrorComponent errorText="No User Found" />
          )}
        </ShadowSection>
      </AuthenGuard>
    </Sidebar>
  );
}
