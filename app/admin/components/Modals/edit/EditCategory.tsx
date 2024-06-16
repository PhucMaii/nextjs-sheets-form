import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { Divider, Grid, Modal, TextField, Typography } from '@mui/material';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';

interface IProps extends ModalProps {
  updateCategory: (newName: string) => Promise<void>;
  currentName: string;
}

export default function EditCategory({ open, onClose, currentName, updateCategory }: IProps) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>(currentName);

  useEffect(() => {
    if (currentName) {
      setNewCategoryName(currentName);
    }
  }, [currentName])

  const handleUpdateCategory = async () => {
    setIsUpdating(true);
    await updateCategory(newCategoryName);
    setIsUpdating(false);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <ModalHead 
            heading="Edit Category"
            buttonLabel="EDIT"
            onClick={handleUpdateCategory}
            buttonProps={{
              loading: isUpdating
            }}
        />
        <Divider sx={{my: 1}} />
        <Grid container rowGap={1}>
          <Grid item xs={12}>
            <Typography variant="h6">Name:</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={newCategoryName}
              onChange={(e: any) => setNewCategoryName(e.target.value)}
            />
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
