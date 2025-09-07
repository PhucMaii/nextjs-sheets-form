import { Box, Divider, Modal, TextField, Typography } from '@mui/material';
import React, { memo, useContext, useState } from 'react';
import { BoxModal } from './styled';
import { ModalProps } from './type';
import { UserType } from '@/app/utils/type';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import { ShowNotificationType } from '@/hooks/useNotification';
import { useCategory } from '@/hooks/autocomplete/useCategory';
import { GuestContext } from '@/app/context/GuestProvider';

interface IProps extends ModalProps {
  client: UserType;
  showNotification: ShowNotificationType;
}

const ApproveGuest = ({ open, onClose, client, showNotification }: IProps) => {
  const { companyId }: any = useParams();
  const { getGuests } = useContext(GuestContext);
  const [clientId, setClientId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { renderCategorySearch, selectedCategory } = useCategory(true, []);

  const onApproveGuest = async () => {
    if (!clientId || clientId.trim() === '') {
      showNotification('error', 'Please enter new client id');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/clients/approve-guest'),
        {
          id: client.id,
          newClientId: clientId,
          categoryId: selectedCategory?.id,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      await getGuests();
      showNotification('success', response.data.message);
      setIsLoading(false);
      onClose();
    } catch (error: any) {
      console.log('Fail to approve guest: ', error);
      showNotification('error', 'Fail to approve guest: ' + error);
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading={`Approve ${client.clientName}`}
          buttonLabel="APPROVE"
          onClick={onApproveGuest}
          buttonProps={{
            color: 'success',
            loading: isLoading,
          }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Client Id</Typography>
          <TextField
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter new client id..."
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
          <Typography>Category</Typography>
          {renderCategorySearch()}
        </Box>
      </BoxModal>
    </Modal>
  );
};

export default memo(ApproveGuest, (prev, next) => {
  return Object.is(prev.client, next.client) && prev.open === next.open;
});
