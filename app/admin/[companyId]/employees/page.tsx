'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Typography } from '@mui/material';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { blueGrey } from '@mui/material/colors';
import { ShadowSection } from '../reports/styled';
import DriverTable from '../components/Tables/DriverTable';
import AddDriver from '../components/Modals/add/AddDriver';
import useNotification from '@/hooks/useNotification';
import { useParams } from 'next/navigation';

export default function DriverManagement() {
  const { companyId }: any = useParams();
  const [isOpenAddDriver, setIsOpenAddDriver] = useState<boolean>(false);

  // Custom Hooks
  const { showNotification, NotificationComp } = useNotification();

  // Data Fetching
  const [drivers, mutateDrivers] = SWRFetchData(
    getAdminApiUrl(companyId, '/drivers'),
  );

  return (
    <Sidebar>
      <AddDriver
        open={isOpenAddDriver}
        onClose={() => setIsOpenAddDriver(false)}
        showNotification={showNotification}
        mutateDrivers={mutateDrivers}
      />
      {NotificationComp}
      <Typography variant="h5" color={blueGrey[800]}>
        Employees
      </Typography>

      <ShadowSection>
        <Box display="flex" justifyContent="flex-end" m={1}>
          <Button onClick={() => setIsOpenAddDriver(true)} variant="contained">
            + New Employee
          </Button>
        </Box>
        <DriverTable
          drivers={drivers?.data || []}
          showNotification={showNotification}
          mutateDrivers={mutateDrivers}
        />
      </ShadowSection>
    </Sidebar>
  );
}
