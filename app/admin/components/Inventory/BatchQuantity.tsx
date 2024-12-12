import { IFifo } from '@/app/utils/type';
import { Box, IconButton, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { LoadingButton } from '@mui/lab';

interface IProps {
    fifo: IFifo;
}

export default function BatchQuantity({fifo}: IProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updatedQuantity, setUpdatedQuantity] = useState<number>(fifo.quantity);

  useEffect(() => {
    if (fifo) {
      setUpdatedQuantity(fifo.quantity);
    }
  }, [fifo]);


  return (
    <Box display="flex" flexDirection="column" gap={1} alignItems="center" justifyContent="center">
        <Typography variant="subtitle1">{fifo.vendorItem?.vendor?.name}</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {
            isEditing ? (
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
                {fifo.quantity}
              </Typography>
            )
          }
          {
            isEditing ? (
              <LoadingButton
                variant="contained"
                loading={false}
                onClick={() => {}}
              >
                Save
              </LoadingButton>
            ) : (
              <IconButton size="small" onClick={() => setIsEditing(!isEditing)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )
          }
        </Box>
        <Typography variant="body1">
            Created at: {fifo.createdAt}
        </Typography>
    </Box>
  )
}
