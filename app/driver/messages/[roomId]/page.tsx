'use client';
import {
  Avatar,
  AvatarGroup,
  Box,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { stringAvatar } from '@/app/utils/avatarProps';
import { useRouter } from 'next/navigation';
import { grey } from '@mui/material/colors';
import { primaryColor } from '@/theme/color';
import SendIcon from '@mui/icons-material/Send';

const avatarSize = {
  width: 35,
  height: 35,
};

export default function ChatRoomPage() {
  const router = useRouter();

  return (
    <Box sx={{overflow: 'hidden', cursor: 'pointer'}}>
      <Grid
        container
        alignItems="center"
        sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white' }}
      >
        <Grid item xs={4}>
          <IconButton onClick={() => router.push('/driver/messages')}>
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

      {/* Messages */}
      <Grid container style={{marginTop: '20px', paddingLeft: 10, paddingRight: 10, zIndex: 0, marginBottom: 100}} rowGap={2}>
        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" alignItems="flex-end" gap={1}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Typography variant="body1"style={{padding: 10, backgroundColor: grey[200], borderRadius: 20}}>Hey, can somebody take Little Minh's Kitchen order for me on Tuesday? I have different route on that day</Typography>
          </Box>
        </Grid>
        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" alignItems="flex-end" gap={1}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Typography variant="body1"style={{padding: 10, backgroundColor: grey[200], borderRadius: 20}}>Hey, can somebody take Little Minh's Kitchen order for me on Tuesday? I have different route on that day</Typography>
          </Box>
        </Grid>
        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" alignItems="flex-end" gap={1}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Typography variant="body1"style={{padding: 10, backgroundColor: grey[200], borderRadius: 20}}>Hey, can somebody take Little Minh's Kitchen order for me on Tuesday? I have different route on that day</Typography>
          </Box>
        </Grid>
        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" alignItems="flex-end" gap={1}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Typography variant="body1"style={{padding: 10, backgroundColor: grey[200], borderRadius: 20}}>Hey, can somebody take Little Minh's Kitchen order for me on Tuesday? I have different route on that day</Typography>
          </Box>
        </Grid>

        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" alignItems="flex-end" gap={1}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Typography variant="body1"style={{padding: 10, backgroundColor: grey[200], borderRadius: 20}}>Hey, can somebody take Little Minh's Kitchen order for me on Tuesday? I have different route on that day</Typography>
          </Box>
        </Grid>

        {/* For current user message - one Grid xs = 2 for end the above line, the second one for push the message to the right*/}
        <Grid item xs={2}></Grid>
        <Grid item xs={2}></Grid>
        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" justifyContent="flex-end" alignItems="flex-end" gap={1}>
            <Typography variant="body1"style={{padding: 10, backgroundColor: primaryColor, color: 'white', borderRadius: 20}}>oke</Typography>
            {/* <Avatar {...stringAvatar('Bin Mai', avatarSize)} /> */}
          </Box>
        </Grid>
        {/* For current user message */}

        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" alignItems="right" gap={1}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Typography variant="body1"style={{padding: 10, backgroundColor: grey[200], borderRadius: 20}}>Hey, can somebody take Little Minh's Kitchen order for me on Tuesday? I have different route on that day</Typography>
          </Box>
        </Grid>
        <Grid item xs={10}>
          <Box display="flex" flexDirection="row" alignItems="flex-end" gap={1}>
            <Avatar {...stringAvatar('Bin Mai', avatarSize)} />
            <Typography variant="body1"style={{padding: 10, backgroundColor: grey[200], borderRadius: 20}}>Hey, can somebody take Little Minh's Kitchen order for me on Tuesday? I have different route on that day</Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid container sx={{position: 'fixed', bottom: 0, width: '100%', backgroundColor: 'white', padding: 1}} alignItems="flex-end">
          <Grid item xs={10} md={11.5}>
          <TextField
            variant="filled"
            style={{backgroundColor: grey[200], border: 'none'}}
            placeholder='Write your message here...'
            fullWidth
            multiline
            // rows={5}
            sx={{
              "& .MuiFilledInput-root": {
                backgroundColor: 'white',
                borderTopLeftRadius: "7px",
                borderTopRightRadius: "7px",
                borderColor: 'white',
                "&:before": {
                  borderColor: "white",
                },
                "&:after": {
                  borderColor: "white",
                },
              },
              "&.Mui-focused": {
                "& .MuiFilledInput-notchedOutline": {
                  borderColor: "white",
                  borderWidth: "3px",
                },
              },
            
            }}
          />
          </Grid>
          <Grid item xs={2} md={0.5} textAlign="right">
            <IconButton color="primary">
              <SendIcon />
            </IconButton>
          </Grid>

      </Grid>
    </Box>
  );
}
