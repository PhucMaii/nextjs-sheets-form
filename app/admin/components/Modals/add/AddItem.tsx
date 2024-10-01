import {
  Autocomplete,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import { IItem } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';

interface IProps extends ModalProps {
  categoryId: number;
  addItem: (newItem: IItem) => Promise<void>;
}

export default function AddItem({
  open,
  onClose,
  categoryId,
  addItem,
}: IProps) {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<IItem>({
    id: -1,
    name: '',
    price: 0,
    categoryId,
    // subCategoryId: null,
    availability: true,
  });
  const [itemNames, setItemNames] = useState<string[]>([]);

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchItemNames();
  }, []);

  useEffect(() => {
    if (categoryId) {
      setNewItem({ ...newItem, categoryId });
    }
  }, [categoryId]);

  const handleAddItem = async () => {
    const updatedNewItem = { ...newItem, name: newItem.name.toUpperCase() };
    setIsAdding(true);
    await addItem(updatedNewItem);
    setIsAdding(false);
  };

  const fetchItemNames = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/items/names`);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      setItemNames(response.data.data);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        {NotificationComp}
        <ModalHead
          heading="Add Item"
          buttonLabel="ADD"
          onClick={handleAddItem}
          buttonProps={{
            loading: isAdding,
          }}
          onClose={onClose}
        />
        <Divider sx={{ my: 2 }} />
        <Grid
          container
          overflow="auto"
          maxHeight="80vh"
          alignItems="center"
          rowGap={2}
        >
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Name:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* <TextField
              fullWidth
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            /> */}
            <Autocomplete
              options={itemNames || []}
              getOptionLabel={(option) => option}
              renderInput={(params) => <TextField {...params} label="Item" />}
              value={newItem.name}
              onChange={(e, newValue) =>
                setNewItem({ ...newItem, name: newValue || '' })
              }
              onInputChange={(e, newInputValue) =>
                setNewItem({ ...newItem, name: newInputValue })
              }
              sx={{ width: 'auto' }}
              freeSolo
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Price:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: +e.target.value })
              }
              type="number"
            />
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
