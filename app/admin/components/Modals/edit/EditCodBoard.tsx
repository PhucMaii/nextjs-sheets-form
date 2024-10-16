import {
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import { IBoard } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import axios from 'axios';

interface IProps extends ModalProps {
  codBoard: IBoard;
  showNotification: any;
  mutateBoard: any;
}

export default function EditCodBoard({
  open,
  onClose,
  codBoard,
  showNotification,
  mutateBoard,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedBoard, setUpdatedBoard] = useState<IBoard>(codBoard);
  const { date, SelectDate } = useSelectDate(codBoard.date, true);

  const [drivers] = SWRFetchData(`${API_URL.ADMIN}/drivers?date=${date}`);

  const handleUpdateBoard = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/cod`, {
        updatedBoard,
      });
      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      mutateBoard();
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error.response.data.error);
      setIsLoading(false);
      return;
    }
  };

  const onChangeUpdatedBoard = (field: string, value: any) => {
    setUpdatedBoard({
      ...updatedBoard,
      [field]: value,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit C.O.D Board"
          buttonLabel="EDIT"
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
          onClick={handleUpdateBoard}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Date</Typography>
            {SelectDate}
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Cash</Typography>
            <TextField
              placeholder="Enter cash received..."
              value={updatedBoard?.cash || 0}
              onChange={(e) => onChangeUpdatedBoard('cash', +e.target.value)}
              type="number"
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Driver</Typography>
            <Select
              value={updatedBoard?.driverId || ''}
              onChange={(e: any) =>
                onChangeUpdatedBoard('driverId', +e.target.value)
              }
              fullWidth
            >
              <MenuItem value={-1}>-- Choose a driver --</MenuItem>
              {drivers &&
                drivers?.data.map((driver: any) => {
                  return (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  );
                })}
            </Select>
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
