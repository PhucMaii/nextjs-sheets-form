'use client';
import AuthenGuard, { SplashScreen } from '@/app/HOC/AuthenGuard'
import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar';
import { Grid } from '@mui/material';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { blue } from '@mui/material/colors';
import { Notification, UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import NotificationPopup from '../components/Notification';
import ClientsTable from '../components/ClientsTable';
import LoadingModal from '../components/Modals/LoadingModal';
import { Category } from '@prisma/client';

export default function ClientsPage() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: ''
  });

  useEffect(() => {
    handleFetchAllUsers();
    handleFetchAllCategories();
  }, [])

  const handleFetchAllCategories = async () => {
    try {
      const response = await axios.get(API_URL.CATEGORIES);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error
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
        message: 'Fail to fetch all categories: ' + error
      });
      setIsFetching(true);
    }
  }

  const handleFetchAllUsers = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(API_URL.CLIENTS);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error
        });
        setIsFetching(false);
        return;
      }

      setClientList(response.data.data);
    } catch (error: any) {
      console.log('Fail to fetch all users: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch all users: ' + error
      });
      setIsFetching(true);
    }
  }

  const handleChangeClients = (clientId: number, updatedData: any) => {
    const newClientList = clientList.map((client: UserType) => {
      if (client.id === clientId) {
        return {...client, ...updatedData}
      }
      return client;
    })
    setClientList(newClientList);
  }

  const handleDeleteClientUI = (clientId: number) => {
    const newClientList = clientList.filter((client: UserType) => {
      return client.id !== clientId;
    });

    setClientList(newClientList);
  }

  const handleUpdateClient = async (userId: number, updatedData: object) => {
    if (Object.keys(updatedData).length === 0) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please provide at least 1 updated data'
      });
      return;
    }
    try {
      setIsUpdating(true);
      const response = await axios.put(API_URL.CLIENTS, {userId, ...updatedData});

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error
        });
        setIsUpdating(false);
        return;
      }
      
      handleChangeClients(userId, response.data.data);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message
      });
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Fail to update client preference: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update client preference: ' + error
      });
      setIsUpdating(false);
    }
  }

  if (isFetching) {
    return (
      <Sidebar>
        <SplashScreen />
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <AuthenGuard>
        <LoadingModal  open={isUpdating}/>
        <NotificationPopup 
          notification={notification}
          onClose={() => setNotification({...notification, on: false})}        
        />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <OverviewCard 
              icon={<PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }}/>}
              text="Total Clients"
              value={200}
            />  
          </Grid>
          <Grid item xs={12} md={4}>
            <OverviewCard 
              icon={<PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }}/>}
              text="Total Clients"
              value={200}
            />  
          </Grid> 
          <Grid item xs={12} md={4}>
            <OverviewCard 
              icon={<PeopleOutlineIcon sx={{ color: blue[700], fontSize: 50 }}/>}
              text="Total Clients"
              value={200}
            />  
          </Grid>         
        </Grid>
        <ClientsTable 
          categories={categoryList} 
          clients={clientList} 
          handleUpdateClient={handleUpdateClient}
          handleDeleteClientUI={handleDeleteClientUI} 
          setNotification={setNotification}
          />
      </AuthenGuard>
    </Sidebar>
  )
}
