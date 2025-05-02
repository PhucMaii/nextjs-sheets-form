import {
  AlertColor,
  Box,
  Divider,
  Modal,
  Typography,
} from '@mui/material';
import React from 'react';
import { BoxModal } from '../Modals/styled';
import { IFifo } from '@/app/utils/type';
import BatchQuantity from './BatchQuantity';
import ErrorComponent from '../ErrorComponent';
import { ModalProps } from '../Modals/type';

interface IProps extends ModalProps {
  fifoList: IFifo[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function BatchQuantityModal({
  fifoList,
  showNotification,
  open,
  onClose,
}: IProps) {
  // const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      {/* <IconButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        size="small"
      >
        <EditIcon fontSize="small" />
      </IconButton> */}
      <Modal open={open} onClose={onClose}>
        <BoxModal
          maxHeight="80vh"
          overflow="scroll"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
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
