'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import SelectMonth from '../components/Select/SelectMonth';
import { ShadowSection } from '../reports/styled';
import { grey } from '@mui/material/colors';
import { days } from '@/app/lib/constant';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import ClientStatementsTable from '../components/Tables/ClientStatementTable';
import useNotification from '@/hooks/useNotification';

export default function StatementsPage() {
  const [selectedDay, setSelectedDay] = useState<string>(
    () => days[new Date().getDay()],
  );
  const [selectedMonth, setSelectedMonth] = useState<any>(() => new Date());
  const [selectedRouteId, setSelectedRouteId] = useState<number>(-1);

  const { showNotification, NotificationComp } = useNotification(); 

  const dateRange = useMemo(() => {
    const firstDayOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0,
    );

    return [firstDayOfMonth, lastDayOfMonth];
  }, [selectedMonth]);

  const [routes] = SWRFetchData(
    `${API_URL.ADMIN}/routes?day=${selectedDay}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  useEffect(() => {
    setSelectedRouteId(-1);
  }, [selectedDay, selectedMonth]);

  return (
    <Sidebar>
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Statements</Typography>
        <SelectMonth
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
      </Box>

      <ShadowSection>
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          justifyContent="center"
          width="100%"
          my={2}
          sx={{ backgroundColor: grey[100], borderRadius: 2, p: 1 }}
        >
          {days.map((day: string, index: number) => {
            return (
              <Button
                sx={{
                  backgroundColor:
                    selectedDay === day ? 'primary.lightest' : '',
                  color: selectedDay === day ? 'primary.main' : 'grey',
                }}
                onClick={() => setSelectedDay(day)}
                key={index}
              >
                <Typography fontWeight="bold">{day.slice(0, 3)}</Typography>
              </Button>
            );
          })}
        </Box>

        <Select
          fullWidth
          value={selectedRouteId}
          onChange={(e: any) => setSelectedRouteId(e.target.value)}
        >
          <MenuItem value={-1} disabled>
            -- Choose a route --
          </MenuItem>
          {routes?.data &&
            routes?.data?.map((route: any) => {
              return (
                <MenuItem key={route.id} value={route.id}>
                  {route.name} - {route.driver.name}
                </MenuItem>
              );
            })}
        </Select>

        <ClientStatementsTable
          routeClients={routes?.formattedClientOrders[selectedRouteId] || []}
          dateRange={dateRange}
          showNotification={showNotification}
        />
      </ShadowSection>
    </Sidebar>
  );
}
