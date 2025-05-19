import { Box, Divider, Modal, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import useSelectDate from '@/hooks/useSelectDate';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl, ORDER_STATUS } from '@/app/utils/enum';
import { grey } from '@mui/material/colors';
import SelectRoute from './SelectRoute';
import SelectOrder from './SelectOrder';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  currentDate: string;
  codData: any;
  setCodData: any;
  showNotification: any;
}

export default function AddTempCOD({
  open,
  onClose,
  codData,
  setCodData,
  currentDate,
  showNotification,
}: IProps) {
  const { companyId }: any = useParams();

  const { date, SelectDate } = useSelectDate('', true);
  const [currentTab, setCurrentTab] = useState<number>(0);

  const [orders] = SWRFetchData(
    getAdminApiUrl(companyId, `/orders?date=${date}&status=${ORDER_STATUS.NONE}`),
  );

  return (
    <Modal open={open}>
      <BoxModal>
        <ModalHead
          heading="Add Temporary COD"
          buttonLabel="ADD"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
          onlyHeading
        />

        <Divider sx={{ my: 2 }} />

        <Tabs
          variant="fullWidth"
          value={currentTab}
          onChange={(e, value) => setCurrentTab(value)}
          style={{ borderBottom: `1px solid ${grey[300]}` }}
        >
          <Tab label="Routes" aria-controls={`tabpanel-0`} value={0} />
          <Tab label="Orders" aria-controls={`tabpanel-1`} value={1} />
        </Tabs>

        <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
          <Typography variant="subtitle1">Date</Typography>
          {SelectDate}
        </Box>
        {currentTab === 0 ? (
          <SelectRoute
            date={date}
            orders={orders?.data || []}
            currentDate={currentDate}
            showNotification={showNotification}
            onClose={onClose}
            codData={codData}
            setCodData={setCodData}
          />
        ) : (
          <SelectOrder
            orders={orders?.data || []}
            codData={codData}
            setCodData={setCodData}
            showNotification={showNotification}
            date={date}
            currentDate={currentDate}
            onClose={onClose}
          />
        )}
      </BoxModal>
    </Modal>
  );
}
