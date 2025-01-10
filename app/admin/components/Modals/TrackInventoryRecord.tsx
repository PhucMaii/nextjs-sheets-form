import { Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import TrackInventoryRecordTable from '../Tables/TrackInventoryRecordTable';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps extends ModalProps {}

export default function TrackInventoryRecord({ open, onClose }: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [actionRecords, _mutate, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/actions`,
  );

  useEffect(() => {
    if (isValidating && !actionRecords) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [actionRecords]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
          Track Inventory Record
        </Typography>

        {isLoading ? (
          <LoadingComponent />
        ) : (
          <TrackInventoryRecordTable actionData={actionRecords?.data || []} />
        )}
      </BoxModal>
    </Modal>
  );
}
