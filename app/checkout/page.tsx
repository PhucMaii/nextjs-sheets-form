'use client';
import React, { useCallback, useState } from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import {
  Box,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { deliveryCities, maxWidth } from '../lib/constant';
import { grey } from '@mui/material/colors';
import AutoCompleteAddress from '../admin/components/AutoCompleteAddress';
import { ShadowSection } from '../admin/reports/styled';
import useCart from '@/hooks/useCart';

export default function CheckoutPage() {
  const [address, setAddress] = useState<any>({
    address: '',
    city: 'Burnaby',
    province: 'BC',
    postalCode: '',
    lat: 0,
    lng: 0,
    fullName: '',
  });
  const [userInfo, setUserInfo] = useState<any>({
    name: '',
    email: '',
    contactNumber: '',
    deliveryAddress: '',
  });

  const { renderDisplayTotal, renderItemsDisplay }: any = useCallback(() => useCart(), []);

  const onChangeField = (field: string, value: string | number) => {
    setUserInfo((prevState: any) => {
      return {
        ...prevState,
        [field]: value,
      };
    });
  }

  const onDataReceived = useCallback((data: any) => {
    if (!data) {
      return;
    }

    console.log(data, 'data');

    setAddress((prevState: any) => {
      return {
        ...prevState,
        address: `${data.terms[0]?.value} ${data.terms[1]?.value}`,
        city: `${data.terms[2]?.value}`,
        fullName: data.description,
      };
    });
  }, []);

  const renderAddressInput = () => {
    return (
      <>
        <Grid item xs={12}>
          <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel htmlFor="full-name">Search address</InputLabel>
            <AutoCompleteAddress onDataReceived={onDataReceived} />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel htmlFor="address">Street Address</InputLabel>
            <TextField
              fullWidth
              id="address"
              label="Street Address"
              variant="outlined"
              placeholder="Enter your street address"
              value={address?.address}
              onChange={(e) => {
                setAddress({ ...address, address: e.target.value });
              }}
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel id="city-label" htmlFor="city">
              City
            </InputLabel>
            <Select
              id="city"
              labelId="city-label"
              fullWidth
              value={address?.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            >
              {deliveryCities.map((city: string) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </Select>
          </FormGroup>
        </Grid>
        <Grid item xs={6}>
          <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel htmlFor="province" id="province-label">
              Province
            </InputLabel>
            <TextField
              fullWidth
              id="province"
              disabled
              label="Province"
              variant="outlined"
              placeholder="Enter your street address"
              value={address?.province}
              onChange={(e) =>
                setAddress({ ...address, province: e.target.value })
              }
            />
          </FormGroup>
        </Grid>
        <Grid item xs={6}>
          <FormGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <InputLabel htmlFor="postal-code" id="postal-code-label">
              Postal Code
            </InputLabel>
            <TextField
              fullWidth
              id="postal-code"
              label="Postal Code"
              variant="outlined"
              placeholder="Enter your postal code"
              value={address?.postalCode}
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ color: grey[500] }}>
            * We currently offer shipping only within British Columbia (BC),
            Canada.
          </Typography>
        </Grid>
      </>
    );
  };

  const renderCollectUserInfo = () => {
    return (
      <Grid
        container
        spacing={2}
        sx={{
          // border: `1px solid ${grey[300]}`,
          p: 2,
        }}
      >
        <Grid item xs={12}>
          <FormGroup>
            <InputLabel htmlFor="name">Name</InputLabel>
            <TextField
              id="name"
              placeholder="Enter your name or company name"
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <InputLabel htmlFor="email">Email address</InputLabel>
            <TextField 
              id="email" 
              placeholder="Enter your email address" 
              value={userInfo.email}
              onChange={(e) => onChangeField('email', e.target.value)}  
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <InputLabel htmlFor="phone-number">Phone number</InputLabel>
            <TextField
              id="phone-number"
              placeholder="Enter your phone number"
            />
          </FormGroup>
        </Grid>
        {/* <Grid item xs={12}>
          <FormGroup>
            <InputLabel htmlFor="phone-number">Address</InputLabel>
            <TextField
              id="phone-number"
              placeholder="Enter your phone number"
            />
          </FormGroup>
        </Grid> */}
        {renderAddressInput()}
      </Grid>
    );
  };

  return (
    <NavbarWrapper setIsOpenSignUp={() => {}}>
      <Box sx={{ maxWidth: maxWidth, mx: 'auto', pt: 2 }}>
        <Grid container spacing={2}>
          {/* Checkout info */}
          <Grid item md={8} xs={12}>
            <ShadowSection>
              <Typography variant="h6">Shipping Address</Typography>
              {renderCollectUserInfo()}
            </ShadowSection>
          </Grid>

          {/* Order Summary */}
          <Grid item md={4} xs={12}>
            <ShadowSection>
              <Typography variant="h6">Your order</Typography>
              {renderItemsDisplay()}
              {renderDisplayTotal()}
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </NavbarWrapper>
  );
}
