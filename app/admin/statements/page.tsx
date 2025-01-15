'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Tab, Tabs, TextField, Typography, useMediaQuery } from '@mui/material';
import SelectMonth from '../components/Select/SelectMonth';
import { ShadowSection } from '../reports/styled';
import { grey } from '@mui/material/colors';
import { days, months } from '@/app/lib/constant';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import ClientStatementsTable from '../components/Tables/ClientStatementTable';
import useNotification from '@/hooks/useNotification';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { ClientStatementType } from '@/pages/api/admin/routes/GET';
import useDebounce from '@/hooks/useDebounce';
import ErrorComponent from '../components/ErrorComponent';
import { MultipleInvoicePrint } from '../components/Printing/MultipleInvoicePrint';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';

export default function StatementsPage() {
  const [displayClients, setDisplayClients] = useState<ClientStatementType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>(
    () => days[new Date().getDay()],
  );
  const [selectedMonth, setSelectedMonth] = useState<any>(() => new Date());
  const [selectedRouteId, setSelectedRouteId] = useState<number>(-1);
  const [selectedClients, setSelectedClients] = useState<ClientStatementType[]>([]);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const { showNotification, NotificationComp } = useNotification();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const multipleInvoicePrintRef: any = useRef();

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [routes, _mutate, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/routes?day=${selectedDay}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  console.log(selectedClients, 'selectedClients');

  useEffect(() => {
    if (routes && !isValidating) {
      setIsLoading(false);
      setSelectedRouteId(Number(Object.keys(routes?.formattedClientOrders)[0]));
    } else {
      setIsLoading(true);
    }
  }, [routes]);

  useEffect(() => {
    if (selectedRouteId !== -1 && routes) {
      setDisplayClients(routes?.formattedClientOrders[selectedRouteId]);
    } else {
      setDisplayClients([]);
    }
  }, [selectedRouteId]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newDisplayClients = routes?.formattedClientOrders[selectedRouteId].filter((client: ClientStatementType) => {
        return (
          client.client.clientName.toLowerCase().includes(debouncedKeywords.toLowerCase()) ||
          client.client.clientId.toLowerCase().includes(debouncedKeywords.toLowerCase())
        );
      });
      setDisplayClients(newDisplayClients || []);
    } else {
      setDisplayClients(routes?.formattedClientOrders[selectedRouteId] || []);
    }
  }, [debouncedKeywords, routes]);

  useEffect(() => {
    setSelectedClients([]);
  }, [selectedDay, selectedMonth, selectedRouteId]);

  const printInvoice = useReactToPrint({
    content: () => multipleInvoicePrintRef.current,
  })

  const switchRoute = (newValue: number) => {
    setSelectedRouteId(newValue);
  };

  return (
    <Sidebar>
      {NotificationComp}
      <div style={{ display: 'none' }}>
        <MultipleInvoicePrint
          clientOrders={selectedClients}
          endDate={dateRange[1]}
          ref={multipleInvoicePrintRef}
        />
      </div>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Statements</Typography>
        <SelectMonth
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
      </Box>

      <ShadowSection display="flex" flexDirection="column" gap={2}>
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

        {/* <Select
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
        </Select> */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="basic tabs"
            value={selectedRouteId}
            onChange={(e: any, newValue: number) => switchRoute(newValue)}
            variant={mdDown ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"  
          >
            {/* <Tab label="All" onClick={() => setSelectedRouteId(-1)} /> */}
            {isLoading ? <Typography>Loading...</Typography> : routes?.data &&
              routes?.data?.map((route: any, index: number) => {
                return (
                  <Tab
                    key={index}
                    label={`${route.name} - ${route.driver.name}`}
                    value={route.id}
                  />
                );
            })}
          </Tabs>
        </Box>

        <TextField 
          fullWidth
          label="Search clients"
          variant="filled"
          placeholder="Search clients by name or client id"
          value={searchKeywords}
          onChange={(e: any) => setSearchKeywords(e.target.value)}
        />

        <Box display="flex" justifyContent="flex-end">
          <Button variant="outlined" onClick={printInvoice}>
            <Box display="flex" gap={1}>
              <PrintIcon />
              <Typography>
                {months[selectedMonth.getMonth()].slice(0, 3)} Statements
              </Typography>
            </Box>
          </Button>
        </Box>

        {isLoading ? <LoadingComponent /> : selectedRouteId !== -1 ? <ClientStatementsTable
          routeClients={displayClients}
          dateRange={dateRange}
          showNotification={showNotification}
          selectedClients={selectedClients}
          setSelectedClients={setSelectedClients}
        /> : <ErrorComponent errorText="Please select a route" />}
      </ShadowSection>
    </Sidebar>
  );
}
