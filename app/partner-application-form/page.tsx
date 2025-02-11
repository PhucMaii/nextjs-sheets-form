'use client';
import React, { useState } from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import { Box, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

export default function PartnerApplicationForm() {
  const [clientInfo, setClientInfo] = useState<any>({
    name: '',
    email: '',
    contactNumber: '',
    deliveryAddress: '',
  });

  return (
    <NavbarWrapper setIsOpenSignUp={() => {}}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          justifyContent="center"
        >
          <Typography textAlign="center" variant="h3">
            Welcome To Supreme Sprouts! 👋
          </Typography>
          <Typography textAlign="center" variant="h5" fontWeight="normal">
            Here Is Your First Step To Grow Your Business
          </Typography>
          <Typography textAlign="center" variant="h5" fontWeight="bold">
            Create Your Account
          </Typography>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Company Name</Typography>
            <TextField
              size="small"
              type="text"
              placeholder="Please enter your company name..."
              value={clientInfo.name}
              onChange={(e: any) =>
                setClientInfo((prevState: any) => ({
                  ...prevState,
                  name: e.target.value,
                }))
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Email</Typography>
            <TextField
              size="small"
              type="text"
              placeholder="Please enter your email..."
              value={clientInfo.email}
              onChange={(e: any) =>
                setClientInfo((prevState: any) => ({
                  ...prevState,
                  email: e.target.value,
                }))
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Contact Number</Typography>
            <TextField
              size="small"
              type="number"
              placeholder="Please enter your contact number..."
              value={clientInfo.contactNumber}
              onChange={(e: any) =>
                setClientInfo((prevState: any) => ({
                  ...prevState,
                  contactNumber: e.target.value,
                }))
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Address</Typography>
            <TextField
              size="small"
              type="text"
              placeholder="Please enter you address..."
              value={clientInfo.deliveryAddress}
              onChange={(e: any) =>
                setClientInfo((prevState: any) => ({
                  ...prevState,
                  deliveryAddress: e.target.value,
                }))
              }
            />
          </Box>

          <Typography sx={{ color: grey[600] }}>
            * We are excited to have you on board! Please note that our team
            will reach out to you within 24 hours to assist you. Thank you. *
          </Typography>

          <LoadingButton
            onClick={handleSendRequest}
            loading={isLoading}
            variant="contained"
          >
            Submit
          </LoadingButton>
        </Box>
      </Box>
    </NavbarWrapper>
  );
}
