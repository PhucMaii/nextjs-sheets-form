'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import MessageRoomCard from '../components/MessageRoomCard';
import AddIcon from '@mui/icons-material/Add';
import AddRoom from '../components/Modals/AddRoom';
import useNotification from '@/hooks/useNotification';

export default function MessagesPage() {
  const [isOpenAddRoom, setIsOpenAddRoom] = useState<boolean>(false);

  const {showNotification, NotificationComp} = useNotification();

  return (
    <Sidebar>
      {NotificationComp}
      <AddRoom 
        showNotification={showNotification} 
        open={isOpenAddRoom} 
        onClose={() => setIsOpenAddRoom(false)} 
      />
      <Grid container alignItems="center">
        <Grid item xs={4}></Grid>
        <Grid item xs={4} textAlign="center">
          <Typography variant="h6" textAlign="center">
            Messages
          </Typography>
        </Grid>
        <Grid item xs={4} textAlign="right">
          <IconButton onClick={() => setIsOpenAddRoom(true)} color="primary">
            <AddIcon fontSize="large" />
          </IconButton>
        </Grid>
      </Grid>

      <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
        <MessageRoomCard />
        <MessageRoomCard />
        <MessageRoomCard />
        <MessageRoomCard />
      </Box>
    </Sidebar>
  );
}
