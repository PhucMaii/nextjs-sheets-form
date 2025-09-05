import { Box, Divider, Modal, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import GeneratePayroll from '../../GeneratePayroll';
import CreatePayroll from '../../CreatePayroll';
import { ShowNotificationType } from '@/hooks/useNotification';

interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
  dateRange: Date[];
}

export default function AddPayroll({
  open,
  onClose,
  showNotification,
  refresh,
  dateRange,
}: IProps) {
  const [tab, setTab] = useState<'from-schedule' | 'manually'>('from-schedule');

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Create Payroll"
          buttonLabel="Create"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
          onlyHeading
        />

        <Divider sx={{ my: 2 }} />

        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="fullWidth"
        >
          <Tab label="From Schedule" value="from-schedule" />
          <Tab label="Manually" value="manually" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          {tab === 'from-schedule' && (
            <GeneratePayroll
              showNotification={showNotification}
              onClose={onClose}
              refresh={refresh}
              defaultStartDate={dateRange[0]}
              defaultEndDate={dateRange[1]}
            />
          )}

          {tab === 'manually' && (
            <CreatePayroll
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              showNotification={showNotification}
              refresh={refresh}
              onClose={onClose}
            />
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
