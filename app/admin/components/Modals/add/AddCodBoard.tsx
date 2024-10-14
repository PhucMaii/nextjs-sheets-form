import {
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import { SWRFetchData } from '@/app/utils/db';
import {
  API_URL,
  COD_STATUS,
} from '@/app/utils/enum';
import axios from 'axios';
import { getCreatedAt } from '@/app/utils/time';
import { UserContext } from '@/app/context/UserContextAPI';
import { CodBoard } from '@prisma/client';

interface IProps extends ModalProps {
  currentDate: string;
  showNotification: any;
}

export default function AddCodBoard({
  open,
  onClose,
  currentDate,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { date, setDate, SelectDate } = useSelectDate(currentDate, true);
  const [newBoard, setNewBoard] = useState<CodBoard | any>({
    driverId: -1,
    note: '',
    cash: 0,
    orders: [],
    status: COD_STATUS.IN_PROCESS,
  });

  const [drivers] = SWRFetchData(`${API_URL.ADMIN}/drivers?date=${date}`);
  const { user } = useContext(UserContext);

  useEffect(() => {
    setDate(currentDate);
  }, [currentDate]);

  const addNewBoard = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.ADMIN}/cod`, {
        date,
        note: newBoard.note,
        cash: newBoard.cash,
        driverId: newBoard.driverId,
        // orders: newBoard.orders,
        status: newBoard.status,
        createdAt: getCreatedAt(),
        createdBy: `Admin - ${user?.clientName}`,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();

      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);

      setIsLoading(false);
    }
  };

  const onChangeNewBoard = (field: string, value: any) => {
    setNewBoard({
      ...newBoard,
      [field]: value,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Board"
          buttonLabel="Add"
          onClick={addNewBoard}
          buttonProps={{loading: isLoading}}
          onClose={onClose}
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
              value={newBoard?.cash || 0}
              onChange={(e) => onChangeNewBoard('cash', +e.target.value)}
              type="number"
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Driver</Typography>
            <Select
              value={newBoard?.driverId || ''}
              onChange={(e: any) =>
                onChangeNewBoard('driverId', +e.target.value)
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

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Note</Typography>
            <TextField
              placeholder="Enter note here..."
              value={newBoard?.note || ''}
              onChange={(e) => onChangeNewBoard('note', e.target.value)}
            />
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
