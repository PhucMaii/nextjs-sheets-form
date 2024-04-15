import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
import { ModalProps } from './type';
import {
  Autocomplete,
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from './styled';
import { LoadingButton } from '@mui/lab';
import { Item, Notification, UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../ErrorComponent';

interface PropTypes extends ModalProps {
  clientList: UserType[];
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function AddOrder({
  open,
  onClose,
  clientList,
  setNotification,
}: PropTypes) {
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [itemList, setItemList] = useState<Item[]>([]);

  useEffect(() => {
    if (clientValue) {
      fetchClientItems();
    } else {
        setItemList([]);
    }
  }, [clientValue]);

  const fetchClientItems = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(
        `${API_URL.CLIENTS}/items?categoryId=${clientValue?.categoryId}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      const quantitySetUp = response.data.data.map((item: Item) => {
        return {...item, quantity: 0}
      })

      setItemList(quantitySetUp);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client items: ', error);
      setIsFetching(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        sx={{ width: '600px' }}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Add Order</Typography>
          <LoadingButton
            variant="contained"
            loadingIndicator="Saving..."
            // loading={isLoading}
            // onClick={handleUpdatePrice}
          >
            Save
          </LoadingButton>
        </Box>
        <Divider />
        <Box overflow="auto" maxHeight="70vh">
          <Grid
            container
            alignItems="center"
            columnSpacing={2}
            rowGap={2}
            mt={2}
          >
            <Grid item xs={12}>
              Client Name
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={clientList as UserType[]}
                getOptionLabel={(option) =>
                  `${option.clientName} - ${option.clientId}`
                }
                renderInput={(params) => (
                  <TextField {...params} label="Client" />
                )}
                value={clientValue}
                onChange={(e, newValue) => setClientValue(newValue)}
              />
            </Grid>
            <Grid item xs={12}>
                <Divider textAlign="center">Items</Divider>
            </Grid>
            {isFetching ? (
                <Box 
                    display="flex" 
                    justifyContent="center" 
                    alignItems="center"
                    sx={{width: '100%'}}
                >
                    <LoadingComponent color="blue" />
                </Box>
            ) : itemList.length === 0 ? (
              <ErrorComponent errorText="User Has No Items" />
            ) : (
              itemList.map((item: Item, index: number) => {
                return (
                  <Fragment key={index}>
                    <Grid item xs={6}>
                      {item.name} - ${item.price.toFixed(2)}
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        value={item.quantity}
                        // onChange={(e) => handleItemOnChange(e, item)}
                        type="number"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </Fragment>
                );
              })
            )}
          </Grid>
        </Box>
      </BoxModal>
    </Modal>
  );
}
