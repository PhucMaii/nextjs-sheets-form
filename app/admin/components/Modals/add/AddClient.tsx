import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import {
  AlertColor,
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import AutoCompleteAddress from '../../AutoCompleteAddress';
import { Category } from '@prisma/client';
import { orderTypes, paymentTypes } from '@/app/lib/constant';
import StatusText from '../../StatusText';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import axios from 'axios';
import { UserType } from '@/app/utils/type';
import ModalHead from '@/app/lib/ModalHead';
import AddCategory from './AddCategory';
import AddIcon from '@mui/icons-material/Add';
import moment from 'moment';

interface PropTypes extends ModalProps {
  categories: Category[];
  mutateCategories: any;
  showNotification: (type: AlertColor, message: string) => void;
  handleAddClientUI: (newClient: UserType) => void;
  mutateClients: any;
}

export default function AddClient({
  open,
  onClose,
  categories,
  mutateCategories,
  // subCategories,
  showNotification,
  handleAddClientUI,
  mutateClients,
}: PropTypes) {
  const [categoryList, setCategoryList] = useState<any>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<any>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newClient, setNewClient] = useState<any>({
    clientId: '',
    clientName: '',
    contactNumber: '',
    categoryId: -1,
    category: { name: '', id: -1 },
    preference: { orderType: '', paymentType: '' },
    role: USER_ROLE.CLIENT,
  });
  const [isOpenAddCategory, setIsOpenAdCategory] = useState<boolean>(false);

  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  const handleOnChangeClient = (key: string, value: any) => {
    if (key === 'category') {
      const targetCategory = categories.find(
        (category: any) => category.name === value,
      );

      // Target category not found = new category -> value is the category object
      if (!targetCategory) {
        setNewClient({
          ...newClient,
          category: value,
          categoryId: value.id,
        });
      } else {
        setNewClient({
          ...newClient,
          category: targetCategory,
          categoryId: targetCategory.id,
        });
      }
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
      newClient.preference.orderType !== '' &&
      newClient.preference.paymentType !== '' &&
      Boolean(deliveryAddress?.description)
    );
  };

  const handleAddClient = async () => {
    const isFormValid = handleCheckAllInput();
    if (!isFormValid) {
      showNotification('error', 'Please fill out all fields');
      return;
    }
    try {
      setIsAdding(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { category, ...submittedData } = newClient;

      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      const response = await axios.post(API_URL.CLIENTS, {
        ...submittedData,
        deliveryAddress: deliveryAddress.description,
        createdAt: `${timeString} ${dateString}`,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsAdding(false);
        return;
      }

      // Optimistic UI Update
      handleAddClientUI(response.data.data);

      // Update Real Data
      mutateClients();

      showNotification('success', response.data.message);
      setIsAdding(false);
    } catch (error: any) {
      console.log('Fail to add client: ', error);
      setIsAdding(false);
      showNotification('error', 'Fail to add client: ' + error);
    }
  };
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <AddCategory
          open={isOpenAddCategory}
          onClose={() => setIsOpenAdCategory(false)}
          showNotification={showNotification}
          handleOnChangeClient={handleOnChangeClient}
          mutateCategories={mutateCategories}
        />
        <ModalHead
          heading="Add Client"
          buttonLabel="Add"
          buttonProps={{ loading: isAdding }}
          onClick={handleAddClient}
          onClose={onClose}
        />
        <Divider />
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          overflow="auto"
          maxHeight="80vh"
        >
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
                onChange={(e) =>
                  handleOnChangeClient('clientId', e.target.value)
                }
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
                size="small"
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
                <Box display="flex" flexDirection="row" alignItems="center">
                  <Typography variant="h6">Category</Typography>
                  <IconButton
                    color="primary"
                    onClick={() => setIsOpenAdCategory(true)}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Select
                  size="small"
                  // key={newClient.categoryId}
                  value={newClient?.category?.name} // Serialize the object
                  onChange={(e) =>
                    handleOnChangeClient('category', e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value={JSON.stringify({ name: '', id: -1 })}>
                    -- Choose a category --
                  </MenuItem>
                  {/* <MenuItem value={JSON.stringify({ name: '', id: -1 })} onClick={() => setIsOpenAdCategory(true)}>
                    Create new category +
                  </MenuItem> */}
                  {categoryList.length > 0 &&
                    categoryList.map((category: Category) => (
                      <MenuItem key={category.id} value={category.name}>
                        {category.name}
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
                  size="small"
                >
                  <MenuItem value="">-- Choose an order type --</MenuItem>
                  {orderTypes &&
                    orderTypes.map((orderType: any, index: number) => (
                      <MenuItem key={index} value={orderType.text}>
                        <StatusText
                          text={orderType.text}
                          type={orderType.type}
                        />
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
                  size="small"
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
        </Box>
      </BoxModal>
    </Modal>
  );
}
