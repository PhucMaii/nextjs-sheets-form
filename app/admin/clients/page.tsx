'use client';
import { SplashScreen } from '@/HOC/AuthenGuard';
import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Fab,
  Grid,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { blue } from '@mui/material/colors';
import { UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL, ORDER_TYPE, PAYMENT_TYPE, USER_ROLE } from '@/app/utils/enum';
import ClientsTable from '../components/Tables/ClientsTable';
import LoadingModal from '../components/Modals/LoadingModal';
import { ShadowSection } from '../reports/styled';
import useDebounce from '@/hooks/useDebounce';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DropdownItemContainer } from '../orders/styled';
import SingleFieldUpdate, {
  SingleFieldUpdateProps,
} from '../components/Modals/edit/SingleFieldUpdate';
import AddClient from '../components/Modals/add/AddClient';
import { SWRFetchData } from '@/app/utils/db';
import useNotification from '@/hooks/useNotification';
import ClientListCSV from '../components/CSV/ClientListCSV';
import { useRouter } from 'next/navigation';
import AdminTable from '../components/Tables/AdminTable';
import GuestTable from '../components/Tables/GuestTable';

export default function ClientsPage() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [baseUsersList, setBaseUsersList] = useState<UserType[]>([]);
  const [userList, setUserList] = useState<UserType[]>([]);
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
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const { showNotification, NotificationComp } = useNotification();

  // Data Fetching
  const [users, mutateClients] = SWRFetchData(
    selectedTab === 0
      ? API_URL.CLIENTS
      : selectedTab === 1
        ? API_URL.ADMIN
        : `${API_URL.CLIENTS}?role=${USER_ROLE.GUEST}`,
  );
  const [categories, mutateCategories] = SWRFetchData(API_URL.CATEGORIES);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const router = useRouter();

  useEffect(() => {
    if (users) {
      initializeUsers();
    }
  }, [users]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newClientList = baseUsersList.filter((client: UserType) => {
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
      setUserList(newClientList);
    } else {
      setUserList(baseUsersList);
    }
  }, [debouncedKeywords, baseUsersList]);

  const directToClientDetails = (clientData: any) => {
    router.push('/admin/clients/' + clientData.id);
  };

  const numberOfUserUsingApp = useCallback(() => {
    const totalUserUsingApp = baseUsersList.filter((client: UserType) => {
      return client?.preference?.orderType === ORDER_TYPE.QR_CODE;
    });

    const percentageTaken =
      (totalUserUsingApp.length / baseUsersList.length) * 100;
    return {
      numberOfUsers: totalUserUsingApp.length,
      percentage: percentageTaken.toFixed(2),
    };
  }, [baseUsersList]);

  const numberOfUserPayMonthly = useCallback(() => {
    const totalUserPayMonthly = baseUsersList.filter((client: UserType) => {
      return client?.preference?.paymentType === PAYMENT_TYPE.MONTHLY;
    });

    const percentageTaken =
      (totalUserPayMonthly.length / baseUsersList.length) * 100;
    return {
      numberOfUsers: totalUserPayMonthly.length,
      percentage: percentageTaken.toFixed(2),
    };
  }, [baseUsersList]);

  const onAddClientUI = (newClient: UserType) => {
    setBaseUsersList([...baseUsersList, newClient]);
    setUserList([...userList, newClient]);
  };

  const handleCloseAnchor = () => {
    setActionButtonAnchor(null);
  };

  const initializeUsers = () => {
    setUserList(users?.data);
    setBaseUsersList(users?.data);
    setIsFetching(false);
  };

  // const onPrintClientList = useReactToPrint({
  //   content: () => clientPrintRef.current,
  // });

  const handleChangeClients = (clientId: number, updatedData: any) => {
    const newClientList = baseUsersList.map((client: UserType) => {
      if (client.id === clientId) {
        return { ...client, ...updatedData };
      }
      return client;
    });
    setUserList(newClientList);
    setBaseUsersList(newClientList);
  };

  const handleDeleteClientUI = (clientId: number) => {
    const newClientList = userList.filter((client: UserType) => {
      return client.id !== clientId;
    });

    setUserList(newClientList);
    setBaseUsersList(newClientList);
  };

  const handleBulkUpdate = async (key: string, value: any) => {
    if (!selectedUsers) {
      return;
    }
    try {
      const response = await axios.put(API_URL.CLIENTS, {
        clientList: selectedUsers,
        [key]: value,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      mutateClients();

      // reset after update successfully
      setSelectedUsers([]);
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
    const selectedClient = selectedUsers.find((client: UserType) => {
      return client.id === targetClient.id;
    });

    if (selectedClient) {
      const newSelectedUsers = selectedUsers.filter((client: UserType) => {
        return client.id !== targetClient.id;
      });
      setSelectedUsers(newSelectedUsers);
    } else {
      setSelectedUsers([...selectedUsers, targetClient]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === userList.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(userList);
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
        disabled={selectedUsers.length === 0}
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

  // if (selectedDetailsClient) {
  //   return (
  //     <Sidebar noMargin>
  //       <ClientDetails
  //         clientData={selectedDetailsClient}
  //         onClose={() => setSelectedDetailedClient(null)}
  //       />
  //     </Sidebar>
  //   );
  // }

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
            value={baseUsersList.length}
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
        <Box
          sx={{ borderBottom: 1, width: '100%', borderColor: 'divider', mb: 2 }}
        >
          <Tabs
            variant="fullWidth"
            value={selectedTab}
            onChange={(e: any, value: number) => setSelectedTab(value)}
          >
            <Tab value={0} label="Clients" />
            <Tab value={1} label="Admins" />
            <Tab value={2} label="Guests" />
          </Tabs>
        </Box>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} md={2.5}>
            {generalUpdate}
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="filled"
              placeholder="Search by client id or client name"
              sx={{ borderRadius: 1 }}
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
          {!smDown && (
            <Grid item xs={1} md={1.5} textAlign="center">
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                <Fab
                  size="medium"
                  onClick={() => setIsAddClientOpen(true)}
                  color="primary"
                >
                  <AddIcon />
                </Fab>
                {/* <IconButton color='primary' onClick={onPrintClientList}>
                <LocalPrintshopIcon />
              </IconButton> */}
              </Box>
            </Grid>
          )}
          <Grid item xs={12} md={12} textAlign="right">
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={1}
            >
              <ClientListCSV
                clientData={userList}
                style={{ marginTop: '10px' }}
              />
              {smDown && (
                <Fab
                  size="medium"
                  onClick={() => setIsAddClientOpen(true)}
                  color="primary"
                >
                  <AddIcon />
                </Fab>
              )}
            </Box>
          </Grid>
        </Grid>
        {selectedTab === 0 ? (
          <ClientsTable
            categories={categories?.data || []}
            clients={userList}
            onUpdateClient={onUpdateClient}
            handleDeleteClientUI={handleDeleteClientUI}
            showNotification={showNotification}
            selectedClients={selectedUsers}
            handleSelectClient={handleSelectClient}
            handleSelectAll={handleSelectAll}
            // subCategories={subCategories?.data || []}
            mutateClients={mutateClients}
            handleDirectToDetails={directToClientDetails}
          />
        ) : selectedTab === 1 ? (
          <AdminTable admins={userList} showNotification={showNotification} />
        ) : selectedTab === 2 ? (
          <GuestTable guests={userList} showNotification={showNotification}/>
        ) : null}
      </ShadowSection>
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
