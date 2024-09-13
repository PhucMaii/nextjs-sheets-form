'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { blueGrey } from '@mui/material/colors';
import { ShadowSection } from '../reports/styled';
import DriverTable from '../components/Tables/DriverTable';
import ErrorComponent from '../components/ErrorComponent';
import { Notification } from '@/app/utils/type';
import NotificationPopup from '../components/Notification';
import AddDriver from '../components/Modals/add/AddDriver';

export default function DriverManagement() {
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [isOpenAddDriver, setIsOpenAddDriver] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const [drivers, mutateDrivers] = SWRFetchData(`${API_URL.ADMIN}/drivers`);

  return (
    <Sidebar>
      <AddDriver
        open={isOpenAddDriver}
        onClose={() => setIsOpenAddDriver(false)}
        setNotification={setNotification}
        mutateDrivers={mutateDrivers}
      />
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <Typography variant="h5" color={blueGrey[800]}>
        Driver Management
      </Typography>

      <ShadowSection>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="driver-management-tabs"
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="fullWidth"
          >
            <Tab
              label={`All Drivers (${drivers?.data?.length || 0})`}
              aria-controls={`tabpanel-0`}
              value={0}
            />
            <Tab label="Today Route" aria-controls={`tabpanel-0`} value={1} />
          </Tabs>
        </Box>

        {tabIndex === 0 ? (
          <>
            <Box display="flex" justifyContent="flex-end" m={1}>
              <Button
                onClick={() => setIsOpenAddDriver(true)}
                variant="contained"
              >
                New Driver
              </Button>
            </Box>
            <DriverTable
              drivers={drivers?.data || []}
              setNotification={setNotification}
              mutateDrivers={mutateDrivers}
            />
          </>
        ) : (
          <ErrorComponent errorText="Coming Soon" />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
