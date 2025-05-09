import { Box, Modal, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import TrackInventoryRecordTable from '../Tables/TrackInventoryRecordTable';
import { SWRFetchData } from '@/app/utils/db';
import { ACTION, getAdminApiUrl } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../ErrorComponent';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {}

export default function TrackInventoryRecord({ open, onClose }: IProps) {
  const { companyId }: any = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabIdx, setTabIdx] = useState<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [actionRecords, _mutate, isValidating] = SWRFetchData(
    `${getAdminApiUrl(companyId, `/actions?name=${tabIdx === 0 ? ACTION.TRACK_INVENTORY : ACTION.RECORD_INVENTORY}`)}`,
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
      <BoxModal maxHeight="80vh" overflow="scroll" width="800px">
        <Box sx={{ borderBottom: 1, color: 'divider', mb: 2 }}>
          <Tabs
            variant="fullWidth"
            value={tabIdx}
            onChange={(_e: any, value: number) => setTabIdx(value)}
          >
            <Tab label="Track Inventory Record" value={0} />
            <Tab label="Left Inventory Record" value={1} />
          </Tabs>
        </Box>
        <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
          {tabIdx === 0 ? 'Track Inventory Record' : 'Left Inventory Record'}
        </Typography>

        {isLoading ? (
          <LoadingComponent />
        ) : actionRecords?.data?.length === 0 ? (
          <ErrorComponent errorText="Actions Not Available Yet" />
        ) : (
          <TrackInventoryRecordTable actionData={actionRecords?.data || []} />
        )}
      </BoxModal>
    </Modal>
  );
}
