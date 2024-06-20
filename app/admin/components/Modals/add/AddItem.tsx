import {
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import { IItem } from '@/app/utils/type';
import { SubCategory } from '@prisma/client';

interface IProps extends ModalProps {
  categoryId: number;
  subCategories: SubCategory[];
  addItem: (newItem: IItem) => Promise<void>;
}

export default function AddItem({
  open,
  onClose,
  categoryId,
  subCategories,
  addItem,
}: IProps) {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<IItem>({
    id: -1,
    name: '',
    price: 0,
    categoryId,
    subCategoryId: null,
  });

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

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <ModalHead
          heading="Add Item"
          buttonLabel="ADD"
          onClick={handleAddItem}
          buttonProps={{
            loading: isAdding,
          }}
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
            <TextField
              fullWidth
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
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
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Subcategory:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Select
              fullWidth
              disabled={!newItem.name.toLowerCase().includes('bean')}
              value={newItem?.subCategoryId}
              onChange={(e: any) =>
                setNewItem({
                  ...newItem,
                  subCategoryId: +e.target.value,
                })
              }
            >
              {/* <MenuItem value={null || undefined}>N/A</MenuItem> */}
              {subCategories &&
                [...subCategories, { name: 'N/A', id: 0 }].map(
                  (subCategory: SubCategory | any) => {
                    return (
                      <MenuItem value={subCategory.id} key={subCategory.id}>
                        {subCategory.name}
                      </MenuItem>
                    );
                  },
                )}
            </Select>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
