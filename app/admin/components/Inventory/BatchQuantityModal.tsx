import {
  AlertColor,
  Box,
  Divider,
  IconButton,
  Modal,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../Modals/styled';
import { IFifo } from '@/app/utils/type';
import BatchQuantity from './BatchQuantity';
import ErrorComponent from '../ErrorComponent';
import EditIcon from '@mui/icons-material/Edit';

interface IProps {
  fifoList: IFifo[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function BatchQuantityModal({
  fifoList,
  showNotification,
}: IProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <IconButton onClick={() => setOpen(true)} size="small">
        <EditIcon fontSize="small" />
      </IconButton>
      <Modal open={open} onClose={() => setOpen(false)}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <Typography>Batch Quantity</Typography>

          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            alignItems="center"
            justifyContent="center"
          >
            {fifoList.length > 0 ? (
              fifoList.map((fifo: IFifo, index: number) => {
                return (
                  <>
                    <BatchQuantity
                      key={fifo.id}
                      fifo={fifo}
                      showNotification={showNotification}
                      fifoList={fifoList}
                      fifoIndex={index}
                    />
                    <Divider flexItem sx={{ my: 1 }} />
                  </>
                );
              })
            ) : (
              <ErrorComponent errorText="No Batch Found" />
            )}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
