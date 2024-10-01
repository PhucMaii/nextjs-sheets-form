import React, { memo, useEffect, useState } from 'react';
import {
  AlertColor,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from '../styled';
import { UserType } from '@/app/utils/type';
import { Category } from '@prisma/client';
import AutoCompleteAddress from '../../AutoCompleteAddress';
import { LoadingButton } from '@mui/lab';
import UnavailableRange from '../UnavailableRange';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface PropTypes {
  client: UserType;
  categories: Category[];
  handleUpdateClient: (userId: number, updatedData: any) => void;
  showNotification: (type: AlertColor, message: string) => void;
}

const EditClient = ({
  client,
  categories,
  handleUpdateClient,
  showNotification,
}: PropTypes) => {
  const [deliveryAddress, setDeliveryAddress] = useState<any>({
    description: client.deliveryAddress,
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUnavailableRangeOpen, setIsUnavailableRangeOpen] =
    useState<boolean>(false);
  const [updatedClient, setUpdatedClient] = useState<UserType>(client);

  const handleOnChangeClient = (key: string, value: any) => {
    if (key === 'category') {
      setUpdatedClient({
        ...updatedClient,
        category: value,
        categoryId: value.id,
      });
    } else {
      setUpdatedClient({ ...updatedClient, [key]: value });
    }
  };

  useEffect(() => {
    if (client?.clientId === '00100') {
      console.log(isOpen, client.clientId);
    }
  }, [client]);

  return (
    <>
      <UnavailableRange
        currentUser={client}
        open={isUnavailableRangeOpen}
        onClose={() => setIsUnavailableRangeOpen(false)}
        showNotification={showNotification}
      />
      <Button
        onClick={(e: any) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        Edit
      </Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal display="flex" flexDirection="column" gap={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4">Edit Client</Typography>
            <LoadingButton
              variant="contained"
              onClick={() =>
                handleUpdateClient(client.id, {
                  clientId: updatedClient.clientId,
                  clientName: updatedClient.clientName,
                  deliveryAddress: deliveryAddress.description,
                  contactNumber: updatedClient.contactNumber,
                  categoryId: updatedClient.categoryId,
                })
              }
            >
              SAVE
            </LoadingButton>
          </Box>
          <Divider />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} textAlign="right">
              <Button
                variant="outlined"
                onClick={() => setIsUnavailableRangeOpen(true)}
              >
                <Box display="flex" gap={1} alignItems="center">
                  <ScheduleIcon />
                  <Typography variant="subtitle1">
                    Set Unavailable Days
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Client Id:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Client Id"
                value={updatedClient.clientId}
                onChange={(e) =>
                  handleOnChangeClient('clientId', e.target.value)
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Client Name:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Client Name"
                fullWidth
                value={updatedClient.clientName}
                onChange={(e) =>
                  handleOnChangeClient('clientName', e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Category:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                value={JSON.stringify(updatedClient.category)} // Serialize the object
                onChange={(e) =>
                  handleOnChangeClient('category', JSON.parse(e.target.value))
                }
                fullWidth
              >
                {categories &&
                  categories.map((category: Category) => (
                    <MenuItem
                      key={category.id}
                      value={JSON.stringify(category)}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Contact Number:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Contact Number"
                fullWidth
                value={updatedClient.contactNumber}
                onChange={(e) =>
                  handleOnChangeClient('contactNumber', e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Delivery Address:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <AutoCompleteAddress
                onDataReceived={(data) => setDeliveryAddress(data)}
                initialValue={deliveryAddress}
              />
            </Grid>
          </Grid>
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(EditClient);
