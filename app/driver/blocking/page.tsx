'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { ShadowSection } from '@/app/admin/reports/styled';
import { Autocomplete, Box, Grid, TextField, Typography } from '@mui/material';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { IDayRange, Notification, UserType } from '@/app/utils/type';
import { generateMonthRange } from '@/app/utils/time';
import { LoadingButton } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import DateRange from '@/app/admin/components/Modals/DateRangeModal';
import axios from 'axios';
import NotificationPopup from '@/app/admin/components/Notification';
import DayRange from '@/app/admin/components/DayRange';
import ErrorComponent from '@/app/admin/components/ErrorComponent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

const apiURL = `/api/unavailable_days`;
export default function BlockingPage() {
  const [selectedClient, setSelectedClient] = useState<UserType | null>(null);
  const [newDateRange, setNewDateRange] = useState<any>(() =>
    generateMonthRange(),
  );
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [updatedDateRange, setUpdatedDateRange] = useState<any>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState<boolean>(false);
  // const [targetRangeId, setTargetRange] = useState<number | null>(null);
  const [targetRange, setTargetRange] = useState<any>(null);

  // Data Fetching
  const [clientList] = SWRFetchData(`${API_URL.DRIVER}/clients`);
  const [unavailableRanges, mutateRange, isValidating] = SWRFetchData(
    `${apiURL}?userId=${selectedClient?.id}`,
  );

  useEffect(() => {
    if (selectedClient && isValidating) {
      setIsFetching(true);
    } else if (unavailableRanges) {
      setIsFetching(false);
    }
  }, [selectedClient, unavailableRanges]);

  const initializeEdit = (updatedRange: IDayRange) => {
    setIsEditing(true);
    // setTargetRange(updatedRange.id);
    setTargetRange(updatedRange);
    setUpdatedDateRange([
      new Date(updatedRange.startDate),
      new Date(updatedRange.endDate),
    ]);
  };

  const handleAddRange = async () => {
    if (!newDateRange) {
      setNotification({
        on: true,
        type: 'error',
        message: 'No Day Range Selected',
      });
      return;
    }

    if (!selectedClient) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please select a client.',
      });
      return;
    }
    try {
      setIsAdding(true);

      const response = await axios.post(apiURL, {
        startDate: newDateRange[0],
        endDate: newDateRange[1],
        userId: selectedClient?.id,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsAdding(false);
        return;
      }

      mutateRange();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsAdding(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
      setIsAdding(false);
    }
  };

  const handleDeleteRange = async (deletedRange: IDayRange) => {
    // setTargetRange(deletedId);
    setTargetRange(deletedRange);
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${apiURL}?deletedRangeId=${deletedRange.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setTargetRange(null);
        setIsDeleting(false);
        return;
      }

      mutateRange();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setTargetRange(null);
      setIsDeleting(false);
    } catch (error: any) {
      console.log('There was an error:', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
      setTargetRange(null);
      setIsDeleting(false);
    }
  };

  const handleEditRange = async (updatedRange: IDayRange) => {
    if (!selectedClient) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please select a client',
      });
      return;
    }
    setIsSaving(true);
    try {
      const response = await axios.put(apiURL, {
        updatedRangeId: updatedRange.id,
        startDate: updatedDateRange[0],
        endDate: updatedDateRange[1],
        userId: selectedClient?.id,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsEditing(false);
        setIsSaving(false);
        setTargetRange(null);
        setUpdatedDateRange(null);
        return;
      }

      mutateRange();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsEditing(false);
      setIsSaving(false);
      setTargetRange(null);
      setUpdatedDateRange(null);
    } catch (error: any) {
      console.log('There was an error: ' + error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
      setIsEditing(false);
      setTargetRange(null);
      setUpdatedDateRange(null);
    }
  };

  return (
    <Sidebar>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <DateRange
        open={isSelectRangeOpen}
        onClose={() => setIsSelectRangeOpen(false)}
        dateRange={isEditing ? updatedDateRange : newDateRange}
        setDateRange={isEditing ? setUpdatedDateRange : setNewDateRange}
      />
      <Typography variant="h4" textAlign="center">
        Set Unavailable Days
      </Typography>
      <ShadowSection
        display="flex"
        flexDirection="column"
        gap={1}
        justifyContent="center"
        my={2}
      >
        <Typography variant="h6">Client</Typography>
        <Autocomplete
          options={clientList ? clientList.data : []}
          getOptionLabel={(option) => {
            return `${option.clientName} - ${option.clientId}`;
          }}
          renderInput={(params) => <TextField {...params} />}
          value={selectedClient}
          onChange={(e, newValue) => setSelectedClient(newValue)}
          sx={{ width: 'auto' }}
        />
      </ShadowSection>
      <ShadowSection>
        <Typography variant="subtitle1">Add Range:</Typography>
        <Grid container alignItems="center" gap={1} mt={2} mb={4}>
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
              onClick={handleAddRange}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <AddIcon />
                <Typography variant="subtitle1">Add</Typography>
              </Box>
            </LoadingButton>
          </Grid>
        </Grid>

        <Typography variant="subtitle1">Unavailable Ranges:</Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {isFetching ? (
            <LoadingComponent />
          ) : unavailableRanges && unavailableRanges?.data.length > 0 ? (
            unavailableRanges.data.map((range: IDayRange, index: number) => {
              return (
                <DayRange
                  key={index}
                  range={range}
                  updatedDateRange={updatedDateRange}
                  // targetRangeId={targetRangeId}
                  targetRange={targetRange}
                  isEditing={isEditing}
                  isDeleting={isDeleting}
                  isSaving={isSaving}
                  initializeEdit={initializeEdit}
                  handleEditRange={handleEditRange}
                  handleDeleteRange={handleDeleteRange}
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
