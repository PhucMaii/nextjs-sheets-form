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

export default function ClientsPage() {
  const [clientList, setClientList] = useState<UserType[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification>({
    on: true,
    type: 'info',
    message: ''
  });

  useEffect(() => {
    handleFetchAllUsers();
  }, [])

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
        setIsFetching(true);
        return;
      }

      setClientList(response.data.data);
      setIsFetching(false);
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
        <ClientsTable clients={clientList} />
      </AuthenGuard>
    </Sidebar>
  )
}
