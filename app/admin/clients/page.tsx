'use client';
import { SplashScreen } from '@/HOC/AuthenGuard';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Fab,
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
import { UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL, ORDER_TYPE, PAYMENT_TYPE } from '@/app/utils/enum';
import ClientsTable from '../components/Tables/ClientsTable';
import LoadingModal from '../components/Modals/LoadingModal';
import { ShadowSection } from '../reports/styled';
import useDebounce from '@/hooks/useDebounce';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ErrorComponent from '../components/ErrorComponent';
import { DropdownItemContainer } from '../orders/styled';
import SingleFieldUpdate, {
  SingleFieldUpdateProps,
} from '../components/Modals/edit/SingleFieldUpdate';
import AddClient from '../components/Modals/add/AddClient';
import { SWRFetchData } from '@/app/utils/db';
import useNotification from '@/hooks/useNotification';
import ClientDetails from '../components/Clients/ClientDetails';
import { useReactToPrint } from 'react-to-print';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import ClientListPrint from '../components/Printing/ClientListPrint';

export default function ClientsPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
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
  const [selectedDetailsClient, setSelectedDetailedClient] =
    useState<any>(null);
  const [selectedClients, setSelectedClients] = useState<UserType[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  
  const clientPrintRef = useRef(null);

  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const { showNotification, NotificationComp } = useNotification();

  // Data Fetching
  const [clients, mutateClients] = SWRFetchData(API_URL.CLIENTS);
  const [categories, mutateCategories] = SWRFetchData(API_URL.CATEGORIES);

  useEffect(() => {
    if (clients) {
      initializeClients();
    }
  }, [clients]);

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

  const directToClientDetails = (clientData: any) => {
    setSelectedDetailedClient(clientData);
  };

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

  const onAddClientUI = (newClient: UserType) => {
    setBaseClientList([...baseClientList, newClient]);
    setClientList([...clientList, newClient]);
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const initializeClients = () => {
    setClientList(clients?.data);
    setBaseClientList(clients?.data);
    setIsFetching(false);
  };

  const onPrintClientList = useReactToPrint({
    content: () => clientPrintRef.current,
  });

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
        showNotification('error', response.data.error);
        return;
      }

      mutateClients();

      // reset after update successfully
      setSelectedClients([]);
      handleCloseAnchor();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to update client: ', error);
      showNotification('error', 'Fail to update client: ' + error);
      return;
    }
  };

  const onUpdateClient = async (userId: number, updatedData: object) => {
    if (Object.keys(updatedData).length === 0) {
      showNotification('error', 'Please provide at least 1 updated data');
      return;
    }
    try {
      setIsUpdating(true);
      const response = await axios.put(API_URL.CLIENTS, {
        userId,
        ...updatedData,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsUpdating(false);
        return;
      }

      // Optimistic UI Update
      handleChangeClients(userId, response.data.data);

      // Update Real Data
      mutateClients();
      showNotification('success', response.data.message);
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Fail to update client preference: ', error);
      showNotification('error', 'Fail to update client preference: ' + error);
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
        Bulk Update
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

  if (selectedDetailsClient) {
    return (
      <Sidebar noMargin>
        <ClientDetails
          clientData={selectedDetailsClient}
          onClose={() => setSelectedDetailedClient(null)}
        />
      </Sidebar>
    );
  }

  if (isFetching) {
    return (
      <Sidebar>
        <SplashScreen />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {/* <AuthenGuard> */}
      <div style={{display: 'none'}}>
        <ClientListPrint
          ref={clientPrintRef}
          clients={clients?.data || []}
        />
      </div>
      <LoadingModal open={isUpdating} />
      <AddClient
        open={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        categories={categories?.data || []}
        // subCategories={subCategories?.data || []}
        showNotification={showNotification}
        handleAddClientUI={onAddClientUI}
        mutateClients={mutateClients}
        mutateCategories={mutateCategories}
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
      {NotificationComp}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <OverviewCard
            icon={<PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }} />}
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
            icon={<CalendarMonthIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="No. clients pay monthly"
            helperText={`${numberOfUserPayMonthly().percentage}% of total`}
            value={numberOfUserPayMonthly().numberOfUsers as number}
          />
        </Grid>
      </Grid>
      <ShadowSection>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={2.5}>
            {generalUpdate}
          </Grid>
          <Grid item xs={11} md={8}>
            <TextField
              fullWidth
              variant="filled"
              placeholder="Search by client id or client name"
              sx={{ borderRadius: 1 }}
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          <Grid item xs={1} md={1.5} textAlign="center">
            <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
              <Fab
                size="medium"
                onClick={() => setIsAddClientOpen(true)}
                color="primary"
              >
                <AddIcon />
              </Fab>
              <IconButton color='primary' onClick={onPrintClientList}>
                <LocalPrintshopIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        {clientList.length > 0 ? (
          <ClientsTable
            categories={categories?.data || []}
            clients={clientList}
            onUpdateClient={onUpdateClient}
            handleDeleteClientUI={handleDeleteClientUI}
            showNotification={showNotification}
            selectedClients={selectedClients}
            handleSelectClient={handleSelectClient}
            handleSelectAll={handleSelectAll}
            // subCategories={subCategories?.data || []}
            mutateClients={mutateClients}
            handleDirectToDetails={directToClientDetails}
          />
        ) : (
          <ErrorComponent errorText="No User Found" />
        )}
      </ShadowSection>
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
