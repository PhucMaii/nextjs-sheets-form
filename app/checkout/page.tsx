'use client';
import React, { useCallback, useState } from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import {
  Box,
  Divider,
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
// import useNotification from '@/hooks/useNotification';
import useDatePicker from '@/hooks/useDatePicker';
import CheckoutButton from '../admin/components/CheckoutButton';
import useNotification from '@/hooks/useNotification';

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
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>({
    clientName: '',
    email: '',
    contactNumber: '',
    contactName: '',
    deliveryAddress: '',
  });

  const {
    // cart,
    renderDisplayTotal,
    renderItemsDisplay,
    // note,
    renderNoteInput,
  }: any = useCart();

  const { renderDatePicker, deliveryDate } = useDatePicker();
  const { showNotification, NotificationComp } = useNotification();

  const onChangeField = (field: string, value: string | number) => {
    setUserInfo((prevState: any) => {
      return {
        ...prevState,
        [field]: value,
      };
    });
  };

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

    setUserInfo((prevState: any) => {
      return {
        ...prevState,
        deliveryAddress: data.description,
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
            <InputLabel htmlFor="name">Delivery Date</InputLabel>
            {renderDatePicker()}
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <InputLabel htmlFor="name">Name</InputLabel>
            <TextField
              id="name"
              placeholder="Enter your name or company name"
              value={userInfo.clientName}
              onChange={(e) => onChangeField('clientName', e.target.value)}
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <InputLabel htmlFor="name">Main Contact Name</InputLabel>
            <TextField
              id="contactName"
              placeholder="Enter your main contact name"
              value={userInfo.contactName}
              onChange={(e) => onChangeField('contactName', e.target.value)}
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
          <FormGroup>
            <InputLabel htmlFor="phone-number">Phone number</InputLabel>
            <TextField
              id="phone-number"
              placeholder="Enter your phone number"
              value={userInfo.contactNumber}
              onChange={(e) => onChangeField('contactNumber', e.target.value)}
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
        {/* <Grid item xs={12}>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            onClick={onCreateGuest}
          >
            Create Guest
          </LoadingButton>
        </Grid> */}
      </Grid>
    );
  };

  return (
    <NavbarWrapper>
      {NotificationComp}
      <Box sx={{ maxWidth: maxWidth, mx: 'auto', p: 2 }}>
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
              <Divider>Note</Divider>
              {renderNoteInput()}
              <Divider>Total</Divider>
              {renderDisplayTotal()}
              {/* <LoadingButton
                variant="contained"
                onClick={onPlaceOrder}
                fullWidth
                loading={isLoading}
                sx={{ mt: 2 }}
              >
                Checkout
              </LoadingButton> */}
              <CheckoutButton
                style={{ width: '100%', marginTop: 6 }}
                deliveryDate={deliveryDate}
                clientData={{
                  ...userInfo,
                  deliveryAddress: `${address?.address}, ${address?.city}, ${address.province} ${address?.postalCode}`,
                }}
                showNotification={showNotification}
              />
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </NavbarWrapper>
  );
}
