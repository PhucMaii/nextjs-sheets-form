import React from 'react';
import { Modal, Box, Typography, Divider, AlertColor } from '@mui/material';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from './type';
import { IPOItem } from '@/app/utils/type';

interface IProps extends ModalProps {
  poItems: IPOItem[];
  onConfirm: () => void | Promise<void>;
  showNotification: (type: AlertColor, message: string) => void;
  isLoading?: boolean;
}

export default function ConfirmStockInModal({
  open,
  onClose,
  poItems,
  onConfirm,
  showNotification,
  isLoading = false,
}: IProps) {
  // Filter items that have receivedQty > 0
  const itemsToStockIn = React.useMemo(() => {
    return poItems.filter((item) => (item?.receivedQty || 0) > 0);
  }, [poItems]);

  const handleConfirm = async () => {
    try {
      if (itemsToStockIn.length === 0) {
        showNotification('warning', 'No items selected to stock in');
        return;
      }

      await onConfirm();
    } catch (error: any) {
      console.error('Error confirming stock in: ', error);
      showNotification('error', error?.message || 'Something went wrong');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="90vh" overflow="auto">
        <ModalHead
          heading="Confirm Stock In"
          buttonLabel="Confirm Stock In"
          onClick={handleConfirm}
          buttonProps={{
            loading: isLoading,
            color: 'primary',
          }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            py: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            Please confirm the items you want to stock in below section.
          </Typography>

          {itemsToStockIn.length > 0 && (
            <Box
              sx={{
                backgroundColor: 'grey.50',
                borderRadius: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.secondary',
                  mb: 1.5,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Items to Stock In:
              </Typography>

              <Box
                display="flex"
                flexDirection="column"
                gap={1.5}
                component="ul"
                sx={{
                  m: 0,
                  pl: 3,
                }}
              >
                {itemsToStockIn.map((item) => {
                  const quantity = item.receivedQty;
                  const itemName = item.inventoryItem.name;

                  return (
                    <Box
                      key={item.id}
                      component="li"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.primary',
                          fontWeight: 600,
                        }}
                      >
                        {quantity} {item.inventoryUnit.unit}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {itemName}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            Note: Items will be stocked into the system. You can create a
            transaction later.
          </Typography>
        </Box>
      </BoxModal>
    </Modal>
  );
}
