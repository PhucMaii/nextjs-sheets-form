import {
  Button,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import ModalHead from '@/app/lib/ModalHead';
import { BoxModal } from '../styled';
import { IItem } from '@/app/utils/type';
import { SubCategory } from '@prisma/client';

interface IProps {
  targetItem: IItem;
  subCategories: SubCategory[];
  handleUpdateItem: (updatedItem: IItem) => Promise<void>;
}

export default function EditItem({
  targetItem,
  subCategories,
  handleUpdateItem,
}: IProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatedItem, setUpdatedItem] = useState<IItem>(targetItem);

  useEffect(() => {
    if (Object.keys(targetItem).length > 0) {
      if (!targetItem.subCategoryId) {
        setUpdatedItem({ ...targetItem, subCategoryId: -1 });
      }
      setUpdatedItem(targetItem);
    }
  }, [targetItem]);

  const updateItem = async () => {
    const newUpdatedItem = {
      ...updatedItem,
      name: updatedItem.name.toUpperCase(),
    };
    setIsUpdating(true);
    await handleUpdateItem(newUpdatedItem);
    setIsUpdating(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Edit</Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          overflow="auto"
          maxHeight="80vh"
        >
          <ModalHead
            heading="Edit Item"
            buttonLabel="EDIT"
            onClick={updateItem}
            buttonProps={{ loading: isUpdating }}
          />
          <Divider />
          <Grid container rowGap={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Name:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                type="text"
                value={updatedItem.name}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Price:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={updatedItem.price}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, price: +e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Subcategory:</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                fullWidth
                disabled={!updatedItem.name.toLowerCase().includes('bean')}
                value={updatedItem?.subCategoryId}
                onChange={(e: any) =>
                  setUpdatedItem({
                    ...updatedItem,
                    subCategoryId: +e.target.value,
                  })
                }
              >
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
    </>
  );
}
