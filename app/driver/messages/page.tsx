import React from 'react';
import Sidebar from '../components/Sidebar';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import MessageSummary from '../components/MessageRoom';
import AddIcon from '@mui/icons-material/Add';

export default function MessagesPage() {
  return (
    <Sidebar>
      <Grid container alignItems="center">
        <Grid item xs={4}></Grid>
        <Grid item xs={4} textAlign="center">
          <Typography variant="h6" textAlign="center">
            Messages
          </Typography>
        </Grid>
        <Grid item xs={4} textAlign="right">
          <IconButton color="primary">
            <AddIcon fontSize="large" />
          </IconButton>
        </Grid>
      </Grid>

      <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
        <MessageSummary />
        <MessageSummary />
        <MessageSummary />
        <MessageSummary />
      </Box>
    </Sidebar>
  );
}
