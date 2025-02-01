import AutoCompleteAddress from '@/app/admin/components/AutoCompleteAddress';
import { deliveryCities, homeLat, homeLng } from '@/app/lib/constant';
import { calculateDistance } from '@/app/utils/googleMaps';
import { calculateShippingFee } from '@/app/utils/shipping';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import { generateLatLng } from '@/pages/api/admin/clients/POST';
import { updateCartAsync } from '@/state/cart/cartSlice';
import { AppDispatch, RootState } from '@/state/store';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function OrderSummary() {
  const [address, setAddress] = useState<any>({
    address: '',
    city: 'Burnaby',
    province: 'BC',
    postalCode: '',
    lat: 0,
    lng: 0,
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [receiveType, setReceiveType] = useState<string>('Ship');

  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();

  // useEffect(() => {
  //   if (!address.fullName) {
  //     dispatch(
  //       updateCartAsync({
  //         cartId: cart.id,
  //         updatedData: {
  //           shippingFee: 0,
  //         },
  //     }))
  //     return;
  //   }
  // }, [address]);

  const onCalculateShippingFee = async () => {
    try {
      setIsLoading(true);
      const latLng: any = await generateLatLng(address.fullName);
      // const getAddressInfo = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${providedAddress}&key=${process.env.NEXT_PUBLIC_MAPS_KEY}`);

      const distance = calculateDistance(
        latLng.latitude,
        latLng.longitude,
        homeLat,
        homeLng,
      );

      const shippingFee = calculateShippingFee(distance);

      dispatch(
        updateCartAsync({
          cartId: cart.id,
          updatedData: {
            shippingFee,
          },
        }),
      );
    } catch (error: any) {
      console.log('Fail to calculate shipping fee', error);
    } finally {
      setIsLoading(false);
    }
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
  }, []);

  const renderAddressInput = () => {
    return (
      <Grid container spacing={2} mt={2}>
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
            * We currently offer shipping only within British Columbia (BC), Canada.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <LoadingButton
            loading={isLoading}
            onClick={onCalculateShippingFee}
            variant="contained"
            fullWidth
          >
            Calculate Shipping Fee
          </LoadingButton>
        </Grid>
      </Grid>
    );
  };

  const renderDisplayTotal = () => {
    return (
      <Box display="flex" flexDirection="column" gap={2} mt={4}>
        {cart && cart?.discount > 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>Discount: </Typography>
            <Typography>${cart.discount.toFixed(2)} </Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>Subtotal: </Typography>
          <Typography>${cart?.subtotal?.toFixed(2)} </Typography>
        </Box>
        {cart?.shippingFee > 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>Shipping Fee: </Typography>
            <Typography>${cart?.shippingFee?.toFixed(2)} </Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>PST (7%): </Typography>
          <Typography>${cart?.PST?.toFixed(2)} </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>GST (5%): </Typography>
          <Typography>${cart?.GST?.toFixed(2)} </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Total: </Typography>
          <Typography variant="h5">${cart?.totalPrice?.toFixed(2)} </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Typography
        textAlign="center"
        variant="h5"
        fontWeight="bold"
        sx={{ color: landingPagePrimaryColor }}
      >
        Order Summary
      </Typography>

      <FormGroup
        row
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          width: '100%',
          mt: 2,
        }}
      >
        <FormControlLabel
          control={
            <Radio
              checked={receiveType === 'Ship'}
              onClick={() => setReceiveType('Ship')}
            />
          }
          label="Ship"
        />

        <FormControlLabel
          control={
            <Radio
              checked={receiveType === 'Pick up'}
              onClick={() => setReceiveType('Pick up')}
            />
          }
          label="Pick up"
        />
      </FormGroup>

      {renderAddressInput()}

      {renderDisplayTotal()}
    </>
  );
}
