'use client';
import AuthenGuard from '@/app/HOC/AuthenGuard'
import React from 'react'
import Sidebar from '../components/Sidebar/Sidebar';
import { Grid } from '@mui/material';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { blue } from '@mui/material/colors';

export default function ClientsPage() {
  return (
    <Sidebar>
      <AuthenGuard>
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

      </AuthenGuard>
    </Sidebar>
  )
}
