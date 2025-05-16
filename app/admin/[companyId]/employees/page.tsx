'use client';
import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl, ORDER_STATUS } from '@/app/utils/enum';
import { blueGrey } from '@mui/material/colors';
import { ShadowSection } from '../reports/styled';
import DriverTable from '../components/Tables/DriverTable';
import AddDriver from '../components/Modals/add/AddDriver';
import useSelectDate from '@/hooks/useSelectDate';
import TodayRoute from '../components/TodayRoute';
import { days } from '@/app/lib/constant';
import useNotification from '@/hooks/useNotification';
import { useParams } from 'next/navigation';

export default function DriverManagement() {
  const { companyId }: any = useParams();
  const [isOpenAddDriver, setIsOpenAddDriver] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  // Custom Hooks
  const { date, SelectDate } = useSelectDate();
  const { showNotification, NotificationComp } = useNotification();

  const dayIndex = useMemo(() => {
    const selectedDate = new Date(date);
    return selectedDate.getDay();
  }, [date]);

  // Data Fetching
  const [drivers, mutateDrivers] = SWRFetchData(
    getAdminApiUrl(companyId, '/drivers'),
  );
  const [orders] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/orders?date=${date}&status=${ORDER_STATUS.NONE}`,
    ),
  );
  const [routes] = SWRFetchData(
    getAdminApiUrl(companyId, `/routes?day=${days[dayIndex]}`),
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="driver-management-tabs"
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="fullWidth"
          >
            <Tab
              label={`All Employees (${drivers?.data?.length || 0})`}
              aria-controls={`tabpanel-0`}
              value={0}
            />
            <Tab
              label={`Today Route (${days[dayIndex].slice(0, 3)})`}
              aria-controls={`tabpanel-0`}
              value={1}
            />
          </Tabs>
        </Box>

        {tabIndex === 0 ? (
          <>
            <Box display="flex" justifyContent="flex-end" m={1}>
              <Button
                onClick={() => setIsOpenAddDriver(true)}
                variant="contained"
              >
                + New Employee
              </Button>
            </Box>
            <DriverTable
              drivers={drivers?.data || []}
              showNotification={showNotification}
              mutateDrivers={mutateDrivers}
            />
          </>
        ) : (
          <>
            <Box display="flex" justifyContent="flex-end" m={2}>
              {SelectDate}
            </Box>
            <TodayRoute
              orderData={orders?.data || []}
              routes={routes?.data || []}
              date={date}
              showNotification={showNotification}
            />
          </>
        )}
      </ShadowSection>
    </Sidebar>
  );
}
