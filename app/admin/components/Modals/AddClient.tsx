import React, { Dispatch, SetStateAction, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import {
  Box,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AutoCompleteAddress from '../AutoCompleteAddress';
import { Category, SubCategory } from '@prisma/client';
import { orderTypes, paymentTypes } from '@/app/lib/constant';
import StatusText from '../StatusText';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import axios from 'axios';
import { Notification, UserType } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';

interface PropTypes extends ModalProps {
  categories: Category[];
  subCategories: SubCategory[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  handleAddClientUI: (newClient: UserType) => void;
}

export default function AddClient({
  open,
  onClose,
  categories,
  subCategories,
  setNotification,
  handleAddClientUI,
}: PropTypes) {
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newClient, setNewClient] = useState<any>({
    clientId: '',
    clientName: '',
    contactNumber: '',
    categoryId: -1,
    category: { name: '', id: -1 },
    subCategoryId: -1,
    subCategory: { name: '', id: -1 },
    preference: { orderType: '', paymentType: '' },
    role: USER_ROLE.CLIENT,
  });

  const handleOnChangeClient = (key: string, value: any) => {
    if (key === 'category') {
      setNewClient({
        ...newClient,
        category: value,
        categoryId: value.id,
      });
    } else if (key === 'subCategory') {
      setNewClient({
        ...newClient,
        subCategory: value,
        subCategoryId: value.id,
      });
    } else {
      setNewClient({ ...newClient, [key]: value });
    }
  };

  const handleCheckAllInput = () => {
    return (
      newClient.clientId.trim() !== '' &&
      newClient.clientName.trim() !== '' &&
      newClient.contactNumber.trim() !== '' &&
      newClient.categoryId > 0 &&
      newClient.subCategoryId > 0 &&
      newClient.preference.orderType !== '' &&
      newClient.preference.paymentType !== '' &&
      Boolean(deliveryAddress?.description)
    );
  };

  const handleAddClient = async () => {
    const isFormValid = handleCheckAllInput();
    if (!isFormValid) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please fill out all fields',
      });
      return;
    }
    try {
      setIsAdding(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { subCategory, category, ...submittedData } = newClient;
      const response = await axios.post(API_URL.CLIENTS, {
        ...submittedData,
        deliveryAddress: deliveryAddress.description,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsAdding(false);
        return;
      }

      handleAddClientUI(response.data.data);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsAdding(false);
    } catch (error: any) {
      console.log('Fail to add client: ', error);
      setIsAdding(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to add client: ' + error,
      });
    }
  };
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Add Client</Typography>
          <LoadingButton
            variant="contained"
            loading={isAdding}
            onClick={handleAddClient}
          >
            ADD
          </LoadingButton>
        </Box>
        <Divider />
        <Typography variant="h5" fontWeight="bold">
          General Information
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Client Id:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Client Id"
              value={newClient.clientId}
              onChange={(e) => handleOnChangeClient('clientId', e.target.value)}
              placeholder="Enter client id"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Client Name:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Client Name"
              value={newClient.clientName}
              onChange={(e) =>
                handleOnChangeClient('clientName', e.target.value)
              }
              placeholder="Enter client name"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Contact Number:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Contact Number"
              value={newClient.contactNumber}
              onChange={(e) =>
                handleOnChangeClient('contactNumber', e.target.value)
              }
              placeholder="Enter contact number"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Delivery Address:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <AutoCompleteAddress
              onDataReceived={(data) => setDeliveryAddress(data)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Role:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Select
              value={newClient.role}
              onChange={(e) => handleOnChangeClient('role', e.target.value)}
              fullWidth
            >
              <MenuItem value={USER_ROLE.CLIENT}>Client</MenuItem>
              <MenuItem value={USER_ROLE.ADMIN}>Admin</MenuItem>
            </Select>
          </Grid>
        </Grid>
        <Typography sx={{ mt: 2 }} variant="h5" fontWeight="bold">
          User Preference
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Category:</Typography>
              <Select
                value={JSON.stringify(newClient.category)} // Serialize the object
                onChange={(e) =>
                  handleOnChangeClient('category', JSON.parse(e.target.value))
                }
                fullWidth
              >
                <MenuItem value={JSON.stringify({ name: '', id: -1 })}>
                  -- Choose a category --
                </MenuItem>
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
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Subcategory:</Typography>
              <Select
                value={JSON.stringify(newClient.subCategory)} // Serialize the object
                onChange={(e) =>
                  handleOnChangeClient(
                    'subCategory',
                    JSON.parse(e.target.value),
                  )
                }
                fullWidth
              >
                <MenuItem value={JSON.stringify({ name: '', id: -1 })}>
                  -- Choose a subcategory --
                </MenuItem>
                {subCategories &&
                  subCategories.map((subCategory: SubCategory) => (
                    <MenuItem
                      key={subCategory.id}
                      value={JSON.stringify(subCategory)}
                    >
                      {subCategory.name}
                    </MenuItem>
                  ))}
              </Select>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Order Type:</Typography>
              <Select
                value={newClient.preference.orderType}
                onChange={(e) =>
                  handleOnChangeClient('preference', {
                    ...newClient.preference,
                    orderType: e.target.value,
                  })
                }
                placeholder="-- Choose an order type --"
                fullWidth
              >
                <MenuItem value="">-- Choose an order type --</MenuItem>
                {orderTypes &&
                  orderTypes.map((orderType: any, index: number) => (
                    <MenuItem key={index} value={orderType.text}>
                      <StatusText text={orderType.text} type={orderType.type} />
                    </MenuItem>
                  ))}
              </Select>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Payment Type:</Typography>
              <Select
                value={newClient.preference.paymentType}
                onChange={(e) =>
                  handleOnChangeClient('preference', {
                    ...newClient.preference,
                    paymentType: e.target.value,
                  })
                }
                fullWidth
                placeholder="-- Choose a payment type --"
              >
                <MenuItem value="">-- Choose a payment type --</MenuItem>
                {paymentTypes &&
                  paymentTypes.map((paymentType: any, index: number) => (
                    <MenuItem key={index} value={paymentType}>
                      {paymentType}
                    </MenuItem>
                  ))}
              </Select>
            </Box>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
