'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import SelectMonth from '../components/Select/SelectMonth';
import { ShadowSection } from '../reports/styled';
import { blueGrey, grey } from '@mui/material/colors';
import { days, months } from '@/app/lib/constant';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import ClientStatementsTable from '../components/Tables/ClientStatementTable';
import useNotification from '@/hooks/useNotification';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import useDebounce from '@/hooks/useDebounce';
import ErrorComponent from '../components/ErrorComponent';
import { MultipleInvoicePrint } from '../components/Printing/MultipleInvoicePrint';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import axios from 'axios';
import ConfirmModal from '../components/Modals/ConfirmModal';
import { getTodayDate } from '@/pages/api/utils/date';
import { useParams } from 'next/navigation';
import { ClientStatementType } from '@/pages/api/admin/[companyId]/routes/GET';
import { useQuery } from '@tanstack/react-query';

export default function StatementsPage() {
  const { companyId }: any = useParams();
  const [displayClients, setDisplayClients] = useState<ClientStatementType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenConfirmModal, setIsOpenConfimModal] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<any>(() => new Date());
  const [selectedRouteId, setSelectedRouteId] = useState<number>(-1);
  const [selectedClients, setSelectedClients] = useState<ClientStatementType[]>(
    [],
  );

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
    getAdminApiUrl(
      companyId,
      `/routes?day=${selectedDay}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
    ),
  );

  const [clientStatements] = SWRFetchData(
    getAdminApiUrl(
      companyId,
      `/clientStatements?month=${months[selectedMonth.getMonth()]}`,
    ),
  );

  const { data: groupedRoutesWithClients } = useQuery({
    queryKey: ['groupedRoutesWithClients'],
    queryFn: async () => {
      const response = await axios.get(getAdminApiUrl(companyId, `/routes/for-statements-printing?startDate=${dateRange[0]}&endDate=${dateRange[1]}`));
      return response.data.data;
    },
  });

  useEffect(() => {
    const today = getTodayDate();
    const date = new Date(today.date);
    const dayIndex = date.getDay();
    setSelectedDay(days[dayIndex]);
  }, []);

  useEffect(() => {
    if (routes && !isValidating) {
      setIsLoading(false);
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
    if (debouncedKeywords && routes?.formattedClientOrders[selectedRouteId]) {
      const newDisplayClients = routes?.formattedClientOrders[
        selectedRouteId
      ]?.filter((client: ClientStatementType) => {
        return (
          client.client.clientName
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase()) ||
          client.client.clientId
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase())
        );
      });
      setDisplayClients(newDisplayClients || []);
    } else {
      setDisplayClients(routes?.formattedClientOrders[selectedRouteId] || []);
    }
  }, [debouncedKeywords, routes]);

  useEffect(() => {
    if (routes) {
      setSelectedRouteId(Number(Object.keys(routes?.formattedClientOrders)[0]));
    }
  }, [selectedDay, selectedMonth]);

  useEffect(() => {
    setSelectedClients([]);
  }, [selectedDay, selectedMonth, selectedRouteId]);

  const printInvoice = useReactToPrint({
    content: () => multipleInvoicePrintRef.current,
  });

  const clearClientStatement = async () => {
    try {
      const clients =
        selectedClients.length > 0 ? selectedClients : displayClients;

      if (clients.length === 0) {
        showNotification('success', 'No clients need to be cleared');
        return;
      }
      const response = await axios.put(
        getAdminApiUrl(companyId, '/clientStatements'),
        {
          month: months[selectedMonth.getMonth()],
          clientIds: clients.map(
            (client: ClientStatementType) => client.client.id,
          ),
          isPrinted: false,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  const switchRoute = (newValue: number) => {
    setSelectedRouteId(newValue);
  };

  const handlePrintInvoice = async () => {
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/clientStatements'),
        {
          month: months[selectedMonth.getMonth()],
          clientIds: selectedClients.map(
            (client: ClientStatementType) => client.client.id,
          ),
          isPrinted: true,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      printInvoice();
      setSelectedClients([]);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <ConfirmModal
        open={isOpenConfirmModal}
        onClose={() => setIsOpenConfimModal(false)}
        title="Are you sure to clear memory of current route?"
        buttonLabel="Clear"
        handleSubmit={clearClientStatement}
        showNotification={showNotification}
      />
      {selectedClients.length > 0 && (
        <div style={{ display: 'none' }}>
          <MultipleInvoicePrint
            clientOrders={selectedClients}
            endDate={dateRange[1]}
            ref={multipleInvoicePrintRef}
          />
        </div>
      )}
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            aria-label="basic tabs"
            value={selectedRouteId}
            onChange={(e: any, newValue: number) => switchRoute(newValue)}
            variant={mdDown ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
          >
            {/* <Tab label="All" onClick={() => setSelectedRouteId(-1)} /> */}
            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              routes?.data &&
              routes?.data?.map((route: any, index: number) => {
                return (
                  <Tab
                    key={index}
                    label={`${route.name} - ${route?.employee?.name}`}
                    value={route.id}
                  />
                );
              })
            )}
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

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h6"
              sx={{
                backgroundColor: blueGrey[800],
                color: 'white',
                width: 'fit-content',
                padding: 1,
                borderRadius: 2,
              }}
            >
              Total: {displayClients.length}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              onClick={() => setIsOpenConfimModal(true)}
              disabled={isLoading || selectedRouteId === -1}
            >
              Clear
            </Button>
            <Button
              variant="outlined"
              onClick={handlePrintInvoice}
              disabled={
                isLoading ||
                selectedClients.length === 0 ||
                selectedRouteId === -1
              }
            >
              <Box display="flex" gap={1}>
                <PrintIcon />
                <Typography>
                  {months[selectedMonth.getMonth()].slice(0, 3)} Statements
                </Typography>
              </Box>
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <LoadingComponent />
        ) : selectedRouteId !== -1 ? (
          <ClientStatementsTable
            routeClients={displayClients}
            dateRange={dateRange}
            showNotification={showNotification}
            selectedClients={selectedClients}
            setSelectedClients={setSelectedClients}
            clientStatements={clientStatements?.data || []}
          />
        ) : (
          <ErrorComponent errorText="Please select a route" />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
