import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { XIcon } from 'lucide-react';
import React from 'react';

interface IProps extends ModalProps {
  order: Order;
}

const ConfirmDelivery = ({ open, onClose, order }: IProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          mb={2}
        >
          {/* <Button>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton>
                <CameraIcon />
              </IconButton>
              <Typography variant="body1" fontWeight={600}>
                Upload Photo Proof
              </Typography>
            </Box>
          </Button> */}
          <IconButton onClick={onClose}>
            <XIcon />
          </IconButton>
        </Box>

        <Typography variant="h6" fontWeight={600}>
          Have you delivered order for {order.clientName}?
        </Typography>

        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={1}
          mt={2}
          width="100%"
        >
          <Button fullWidth variant="outlined" color="primary">
            Yes
          </Button>

          <Button fullWidth variant="contained" color="primary">
            <input type="file" hidden />
            Yes, With Image
          </Button>
        </Box>
      </BoxModal>
    </Modal>
  );
};

export default ConfirmDelivery;
