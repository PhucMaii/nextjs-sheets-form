'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Autocomplete, Box, Grid, TextField, Typography } from '@mui/material';
import { IDayRange, UserType } from '@/app/utils/type';
import { ShadowSection } from '../reports/styled';
import { LoadingButton } from '@mui/lab';
// import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { SWRFetchData } from '@/app/utils/db';
import { USER_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { generateCurrentTime, generateMonthRange } from '@/app/utils/time';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import ErrorComponent from '../components/ErrorComponent';
import DateRange from '../components/Modals/DateRangeModal';
import DayRange from '../components/DayRange';
import { blueGrey } from '@mui/material/colors';
// import useSelectDate from '@/hooks/useSelectDate';
import useNotification from '@/hooks/useNotification';
import BlockOrders from '../components/Modals/BlockOrders';
import { useParams } from 'next/navigation';
import SelectDateRange from '../components/Select/SelectDateRange';
import useSelectDate from '@/hooks/useSelectDate';

// const apiURL = `/api/unavailable_days`;
export default function BlockingPage() {
  const { companyId }: any = useParams();

  const apiURL = '/api/unavailable_days';

  const [blockOrdersProps, setBlockOrdersProps] = useState<any>({
    open: false,
    orders: [],
  });
  const [dateRange, setDateRange] = useState<any>(generateMonthRange());
  const [updatedDateRange, setUpdatedDateRange] = useState<any>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState<boolean>(false);
  const [targetRange, setTargetRange] = useState<any>(null);
  const [newDateRange, setNewDateRange] = useState<any>(() =>
    generateMonthRange(),
  );
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Custom Hooks
  const { date: selectedDate, SelectDate } = useSelectDate();
  const { showNotification, NotificationComp } = useNotification();

  // Data Fetching
  const [clientList] = SWRFetchData(getAdminApiUrl(companyId, '/clients'));
  const [unavailableRanges, mutateRange] = SWRFetchData(
    selectedClient
      ? `${apiURL}/date-range-view?date=${selectedDate}&userId=${selectedClient?.id || 'All Clients'}&startDate=${dateRange[0]}&endDate=${dateRange[1]}&companyId=${companyId}`
      : `${apiURL}?userId=${`All Clients`}&date=${selectedDate}&companyId=${companyId}`,
  );

  // useEffect(() => {
  //   if (!unavailableRanges && isValidating) {
  //     setIsFetching(true);
  //   } else if (unavailableRanges) {
  //     setIsFetching(false);
  //   }
  // }, [selectedClient, unavailableRanges]);

  // Reset when switching
  useEffect(() => {
    setIsEditing(false);
    setTargetRange(null);
  }, [selectedClient, dateRange]);

  const initializeEdit = (updatedRange: IDayRange) => {
    setIsEditing(true);
    setTargetRange(updatedRange);
    setUpdatedDateRange([
      new Date(updatedRange.startDate),
      new Date(updatedRange.endDate),
    ]);
  };

  const onAddRange = async () => {
    if (!newDateRange) {
      showNotification('error', 'No Day Range Selected');
      return;
    }

    if (!selectedClient) {
      showNotification('error', 'Please select a client.');
      return;
    }
    try {
      setIsAdding(true);

      const createdAt = generateCurrentTime();
      const response = await axios.post(apiURL, {
        startDate: newDateRange[0],
        endDate: newDateRange[1],
        userId: selectedClient?.id,
        createdAt,
        role: USER_ROLE.ADMIN,
        companyId: Number(companyId),
      });

      // This means if error and stil return data
      if (response.data.error && response.data.data) {
        setBlockOrdersProps({
          open: true,
          orders: response.data.data,
        });
        // showNotification('error', response.data.error);
        setIsAdding(false);
        return;
      }

      mutateRange();

      showNotification('success', response.data.message);
      setIsAdding(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
      setIsAdding(false);
    }
  };

  const onDeleteRange = async (deletedRange: any) => {
    setTargetRange(deletedRange);
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${apiURL}?deletedRangeId=${deletedRange.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setTargetRange(null);
        setIsDeleting(false);
        return;
      }

      mutateRange();

      showNotification('success', response.data.message);
      setTargetRange(null);
      setIsDeleting(false);
    } catch (error: any) {
      console.log('There was an error:', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
      setTargetRange(null);
      setIsDeleting(false);
    }
  };

  const handleEditRange = async (updatedRange: IDayRange) => {
    if (!selectedClient) {
      showNotification('error', 'Please select a client');
      return;
    }
    setIsSaving(true);
    try {
      const response = await axios.put(apiURL, {
        updatedRangeId: updatedRange.id,
        startDate: updatedDateRange[0],
        endDate: updatedDateRange[1],
        userId: updatedRange.userId,
        companyId: Number(companyId),
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsEditing(false);
        setIsSaving(false);
        setTargetRange(null);
        setUpdatedDateRange(null);
        return;
      }

      mutateRange();

      showNotification('success', response.data.message);
      setIsEditing(false);
      setIsSaving(false);
      setTargetRange(null);
      setUpdatedDateRange(null);
    } catch (error: any) {
      console.log('There was an error: ' + error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
      setIsEditing(false);
      setTargetRange(null);
      setUpdatedDateRange(null);
    }
  };
  return (
    <Sidebar>
      {NotificationComp}
      <BlockOrders
        open={blockOrdersProps.open}
        onClose={() =>
          setBlockOrdersProps({
            open: false,
            orders: [],
          })
        }
        orders={blockOrdersProps.orders}
        showNotification={showNotification}
        startDate={newDateRange[0]}
        endDate={newDateRange[1]}
        role={USER_ROLE.ADMIN}
      />
      <DateRange
        open={isSelectRangeOpen}
        onClose={() => setIsSelectRangeOpen(false)}
        dateRange={isEditing ? updatedDateRange : newDateRange}
        setDateRange={isEditing ? setUpdatedDateRange : setNewDateRange}
      />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5" color={blueGrey[800]}>
          Set Unavailable Date
        </Typography>
        {selectedClient?.id ? (
          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        ) : (
          <>{SelectDate}</>
        )}
      </Box>
      <ShadowSection
        display="flex"
        flexDirection="column"
        gap={1}
        justifyContent="center"
        my={2}
      >
        <Typography variant="h6" color="grey" sx={{ mb: 2 }}>
          Client
        </Typography>
        <Autocomplete
          options={
            [
              {
                clientId: '',
                clientName: 'All Clients',
                deliveryAddress: '',
              },
              ...(clientList?.data || []),
            ] as UserType[]
          }
          getOptionLabel={(option) => {
            if (option.clientName === 'All Clients') {
              return option.clientName;
            }

            return `${option.clientName} - ${option.clientId}`;
          }}
          renderInput={(params) => <TextField {...params} label="Client" />}
          value={selectedClient}
          onChange={(e, newValue) => setSelectedClient(newValue)}
          sx={{ width: 'auto' }}
        />
      </ShadowSection>
      <ShadowSection>
        <Typography variant="subtitle1" color="grey">
          Add Range:
        </Typography>
        <Grid container alignItems="center" gap={1} mt={3} mb={4}>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label="From"
              value={newDateRange ? newDateRange[0]?.toDateString() : ''}
              onClick={() => setIsSelectRangeOpen(true)}
            />
          </Grid>
          <Grid item xs={5} textAlign="right">
            <TextField
              fullWidth
              label="To"
              value={newDateRange ? newDateRange[1]?.toDateString() : ''}
              onClick={() => setIsSelectRangeOpen(true)}
            />
          </Grid>
          <Grid item xs={1} textAlign="center">
            <LoadingButton
              loading={isAdding}
              loadingIndicator="Adding..."
              onClick={onAddRange}
              disabled={
                !selectedClient || selectedClient?.clientName === 'All Clients'
              }
            >
              <Box display="flex" alignItems="center" gap={1}>
                <AddIcon />
                <Typography variant="subtitle1">Add</Typography>
              </Box>
            </LoadingButton>
          </Grid>
        </Grid>

        <Typography variant="subtitle1" color="grey">
          Unavailable Ranges:
        </Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {unavailableRanges &&
          selectedClient?.clientName === 'All Clients' &&
          Object.keys(unavailableRanges.data).length > 0 ? (
            Object.keys(unavailableRanges.data).map(
              (targetClient: string, clientIndex: number) => {
                return (
                  <>
                    <Typography key={clientIndex} sx={{ mt: 2 }}>
                      {targetClient}
                    </Typography>
                    {unavailableRanges.data[targetClient].map(
                      (range: any, rangeIndex: number) => {
                        return (
                          <DayRange
                            key={rangeIndex}
                            range={range}
                            updatedDateRange={updatedDateRange}
                            targetRange={targetRange}
                            isEditing={isEditing}
                            isDeleting={isDeleting}
                            isSaving={isSaving}
                            initializeEdit={initializeEdit}
                            handleEditRange={handleEditRange}
                            handleDeleteRange={onDeleteRange}
                            setIsSelectRangeOpen={setIsSelectRangeOpen}
                          />
                        );
                      },
                    )}
                  </>
                );
              },
            )
          ) : unavailableRanges?.data && unavailableRanges.data.length > 0 ? (
            unavailableRanges.data.map((range: IDayRange, index: number) => {
              return (
                <DayRange
                  key={index}
                  range={range}
                  updatedDateRange={updatedDateRange}
                  targetRange={targetRange}
                  isEditing={isEditing}
                  isDeleting={isDeleting}
                  isSaving={isSaving}
                  initializeEdit={initializeEdit}
                  handleEditRange={handleEditRange}
                  handleDeleteRange={onDeleteRange}
                  setIsSelectRangeOpen={setIsSelectRangeOpen}
                />
              );
            })
          ) : (
            <ErrorComponent errorText="No Unavailable Range Found" />
          )}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
}
