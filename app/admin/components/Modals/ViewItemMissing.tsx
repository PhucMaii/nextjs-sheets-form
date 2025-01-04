import {
  Box,
  Divider,
  Grid,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import { LoadingButton } from '@mui/lab';
import useLocalStorage from '@/hooks/useLocalStorage';
import { IInventoryItem } from '@/app/utils/type';
import { getTodayDate } from '@/pages/api/utils/date';

interface IProps extends ModalProps {
  inventoryItem: IInventoryItem;
  quantity: number;
}

export default function ViewItemMissing({
  open,
  onClose,
  inventoryItem,
  quantity,
}: IProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updatedQuantity, setUpdatedQuantity] = useState<number>(0);

  console.log(inventoryItem, 'INVENTORY ITEM');
  const todayDate = getTodayDate();

  const [localStorageItem, setLocalStorageItem] = useLocalStorage(
    inventoryItem?.name || '',
    { preOrderQuantity: 0, ...todayDate },
  );

  const numberOfNeeded = useMemo(() => {
    if (quantity > 0) {
      return 0;
    }

    return quantity + localStorageItem.preOrderQuantity < 0
      ? Math.abs(quantity + localStorageItem.preOrderQuantity)
      : 0;
  }, [quantity, localStorageItem]);

  useEffect(() => {
    if (localStorageItem) {
      setUpdatedQuantity(localStorageItem.preOrderQuantity);
    }
  }, [localStorageItem]);

  const handleSave = () => {
    const updatedTime = getTodayDate();
    setLocalStorageItem({
      preOrderQuantity: updatedQuantity,
      ...updatedTime,
    });
    setIsEditing(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <Typography textAlign="center">Your pre order</Typography>
        <Grid container alignItems="center">
          <Grid item xs={5} textAlign="right">
            {isEditing ? (
              <IconButton>
                <IconButton size="medium">
                  <EditOffIcon
                    fontSize="medium"
                    onClick={() => setIsEditing(!isEditing)}
                  />
                </IconButton>
              </IconButton>
            ) : null}
          </Grid>
          <Grid item xs={2} textAlign="center">
            {isEditing ? (
              <TextField
                type="number"
                value={updatedQuantity}
                onChange={(e) => setUpdatedQuantity(Number(e.target.value))}
                variant="outlined"
                sx={{
                  maxWidth: '12ch', // optional, to set a minimum width
                }}
              />
            ) : (
              <Typography variant="h5" fontWeight="bold">
                {updatedQuantity}
              </Typography>
            )}
          </Grid>
          <Grid item xs={5}>
            {isEditing ? (
              <LoadingButton onClick={handleSave}>Save</LoadingButton>
            ) : (
              <IconButton
                color="primary"
                onClick={() => setIsEditing((prevState) => !prevState)}
              >
                <EditIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>

        <Typography textAlign="center">
          Created at: {localStorageItem.date} {localStorageItem.time}{' '}
        </Typography>

        <Divider sx={{ my: 2 }} />
        <Box
          display="flex"
          alignItems="flex-end"
          justifyContent="flex-end"
          gap={1}
        >
          <Typography textAlign="center" variant="h4" fontWeight="bold">
            Need: {numberOfNeeded}
          </Typography>
          <Typography fontWeight="bold">bags</Typography>
        </Box>
      </BoxModal>
    </Modal>
  );
}
