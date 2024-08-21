import {
  Avatar,
  AvatarGroup,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { stringAvatar } from '@/app/utils/avatarProps';

const avatarSize = {
  width: 35,
  height: 35,
};

export default function ChatRoomPage() {
  return (
    <>
      <Grid
        container
        alignItems="center"
        sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
      >
        <Grid item xs={4}>
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
        </Grid>
        <Grid item xs={4} textAlign="center">
          <Typography variant="h6" textAlign="center" fontWeight="bold">
            Room Name
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <AvatarGroup max={3}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Avatar {...stringAvatar('NGUYEN', avatarSize)} />
            <Avatar {...stringAvatar('Bao Bao', avatarSize)} />
          </AvatarGroup>
        </Grid>
      </Grid>
    </>
  );
}
