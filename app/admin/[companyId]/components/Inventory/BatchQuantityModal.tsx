import { AlertColor, Box, Divider, Modal, Typography } from '@mui/material';
import React from 'react';
import { BoxModal } from '../Modals/styled';
import { IFifo } from '@/app/utils/type';
import BatchQuantity from './BatchQuantity';
import ErrorComponent from '../ErrorComponent';
import { ModalProps } from '../Modals/type';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';

interface IProps extends ModalProps {
  // fifoList: IFifo[];
  showNotification: (type: AlertColor, message: string) => void;
  inventoryItemId: number;
}

export default function BatchQuantityModal({
  // fifoList,
  showNotification,
  open,
  onClose,
  inventoryItemId,
}: IProps) {
  const { companyId }: any = useParams();
  // const [open, setOpen] = useState<boolean>(false);

  const { data: fifoList, refetch: refetchFifoList, isLoading } = useQuery({
    queryKey: ['fifo', inventoryItemId],
    queryFn: async () => {
      const res = await axios.get(
        getAdminApiUrl(
          companyId,
          `/inventory/fifo?inventoryItemId=${inventoryItemId}`,
        ),
      );
      console.log(res.data, 'res.data');
      return res.data?.data || [];
    },
  });

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
            {fifoList && fifoList?.length > 0 ? (
              fifoList.map((fifo: IFifo, index: number) => {
                return (
                  <>
                    <BatchQuantity
                      key={fifo.id}
                      fifo={fifo}
                      showNotification={showNotification}
                      fifoList={fifoList}
                      fifoIndex={index}
                      refetchFifoList={refetchFifoList}
                    />
                    <Divider flexItem sx={{ my: 1 }} />
                  </>
                );
              })
            ) : (
              <ErrorComponent
                errorText={isLoading ? 'Fetching Batch...' : 'No Batch Found'}
              />
            )}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
