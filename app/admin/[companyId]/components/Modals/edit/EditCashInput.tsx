import {
  AlertColor,
  Box,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IBoard } from '@/app/utils/type';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  board: IBoard;
}

export default function EditCashInput({
  open,
  onClose,
  showNotification,
  board,
}: IProps) {
  const { companyId }: any = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedBoard, setUpdatedBoard] = useState<IBoard>(board);

  useEffect(() => {
    if (board) {
      setUpdatedBoard(board);
    }
  }, [board]);

  const handleUpdateField = async () => {
    try {
      setIsLoading(true);
      // await handleUpdate(value);
      const response = await axios.put(getAdminApiUrl(companyId, '/cod'), {
        id: updatedBoard.id,
        updatedBoard: {
          date: updatedBoard.date,
          driverId: updatedBoard.driverId,
          cash: updatedBoard.cash,
        },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to save update: ', error);
      showNotification('error', 'Fail to save update: ' + error);
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit Cash Input"
          buttonLabel="Update"
          onClick={handleUpdateField}
          onClose={onClose}
          buttonProps={{ loading: isLoading }}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6">Cash</Typography>
          <TextField
            variant="outlined"
            type={'number'}
            fullWidth
            value={updatedBoard.cash}
            onChange={(e) =>
              setUpdatedBoard({ ...updatedBoard, cash: +e.target.value })
            }
          />
        </Box>
      </BoxModal>
    </Modal>
  );
}
