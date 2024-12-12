import { IFifo } from '@/app/utils/type';
import { AlertColor, Box, Grid, IconButton, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import DeleteModal from '../Modals/delete/DeleteModal';
import EditOffIcon from '@mui/icons-material/EditOff';

interface IProps {
    fifoIndex: number;
    fifoList: IFifo[];
    fifo: IFifo;
    showNotification: (type: AlertColor, message: string) => void
}

export default function BatchQuantity({ fifoList, fifo, fifoIndex, showNotification }: IProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedQuantity, setUpdatedQuantity] = useState<number>(fifo.quantity);

  const [targetFifo] = SWRFetchData(`${API_URL.ADMIN}/inventory/fifo?id=${fifo.id}`);

  useEffect(() => {
    if (fifo) {
      setUpdatedQuantity(fifo.quantity);
    }
  }, [fifo]);

  const handleDeleteFifo = async (fifo: IFifo) => {
    console.log('fifo: ', fifo);
    let nextFifoId = -1;
    if (fifo?.orderedItems?.length > 0) {
      if (fifoIndex + 1 >= fifoList.length) {
        showNotification('error', 'Cannot delete the last fifo has item affected');
        return;
      }

      nextFifoId = fifoList[fifoIndex + 1].id;
    }
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/inventory/fifo?id=${fifo.id}&nextFifoId=${nextFifoId}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
    }
  }

  const handleUpdateQuantity = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL.ADMIN}/inventory/fifo`, {
        fifoId: fifo.id,
        updatedQuantity,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsEditing(false);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
    }
  }

  return (
    <Box display="flex" flexDirection="column" gap={1} alignItems="center" justifyContent="center">
        <Typography variant="subtitle1">{fifo.vendorItem?.vendor?.name}</Typography>
        <Grid container alignItems="center">
          <Grid item xs={3} />

          <Grid item xs={6} textAlign="center">
          {
            isEditing ? (
              <Box display="flex" alignItems="center" gap={1}>
              <IconButton size="medium">
                <EditOffIcon fontSize="medium" onClick={() => setIsEditing(!isEditing)} />
              </IconButton>
               <TextField 
                 type="number"
                 value={updatedQuantity}
                 onChange={(e) => setUpdatedQuantity(Number(e.target.value))}
                 variant="outlined"
                 sx={{
                   maxWidth: '12ch', // optional, to set a minimum width
                 }}
               />
            </Box>
            ) : (
                <Typography variant="h5" fontWeight="bold">
                  {fifo.quantity}
                </Typography> 
            )
          }
          </Grid>
          <Grid item xs={3}>
            {
              isEditing ? (

                  <LoadingButton
                    variant="contained"
                    loading={isLoading}
                    onClick={handleUpdateQuantity}
                    sx={{mx: 1}}
                  >
                    Save
                  </LoadingButton>
              ) : (
                <Box display="flex" alignItems="center">
                  {/* <IconButton color="error" size="medium" onClick={() => setIsEditing(!isEditing)}>
                    <DeleteIcon fontSize="medium" />
                  </IconButton> */}
                  <DeleteModal 
                    targetObj={targetFifo?.data}
                    handleDelete={handleDeleteFifo}
                    includedIconButton
                  />
                  <IconButton color="primary" size="medium" onClick={() => setIsEditing(!isEditing)}>
                    <EditIcon fontSize="medium" />
                  </IconButton>
                </Box>
              )
            }
          </Grid>
        </Grid>
        <Typography variant="body1" sx={{background: 'red', color: 'white', px: 1, py: 0.5, borderRadius: 4}}>
          {targetFifo?.data?.orderedItems?.length }
        </Typography>
        <Typography variant="body1">
            Created at: {fifo.createdAt}
        </Typography>
    </Box>
  )
}
