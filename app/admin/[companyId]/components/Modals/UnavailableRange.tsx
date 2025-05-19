import {
  AlertColor,
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import DateRange from './DateRangeModal';
import { generateCurrentTime, generateMonthRange } from '@/app/utils/time';
import AddIcon from '@mui/icons-material/Add';
import { SWRFetchData } from '@/app/utils/db';
import { IDayRange, UserType } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import DayRange from '../DayRange';
import { USER_ROLE } from '@/app/utils/enum';

interface IProps extends ModalProps {
  currentUser: UserType;
  showNotification: (type: AlertColor, message: string) => void;
}

const apiURL = `/api/unavailable_days`;
export default function UnavailableRange({
  open,
  onClose,
  currentUser,
  showNotification,
}: IProps) {
  const [newDateRange, setNewDateRange] = useState<any>(() =>
    generateMonthRange(),
  );
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState<boolean>(false);
  const [targetRange, setTargetRange] = useState<any>(null);
  const [updatedDateRange, setUpdatedDateRange] = useState<any>(null);

  const [unavailableRanges, mutateRange] = SWRFetchData(
    `${apiURL}?userId=${currentUser.id}`,
  );

  useEffect(() => {
    if (!isEditing) {
      setIsSaving(false);
    }
  }, [isEditing]);

  const initializeEdit = (updatedRange: IDayRange) => {
    setIsEditing(true);
    setTargetRange(updatedRange);
    setUpdatedDateRange([
      new Date(updatedRange.startDate),
      new Date(updatedRange.endDate),
    ]);
  };

  const handleAddRange = async () => {
    if (!newDateRange) {
      showNotification('error', 'No Day Range Selected');
      return;
    }
    try {
      setIsAdding(true);

      const createdAt = generateCurrentTime();
      const response = await axios.post(apiURL, {
        startDate: newDateRange[0],
        endDate: newDateRange[1],
        userId: currentUser.id,
        createdAt,
        role: USER_ROLE.ADMIN,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
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

  const handleDeleteRange = async (deletedRange: any) => {
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
    setIsSaving(true);
    try {
      const response = await axios.put(apiURL, {
        updatedRangeId: updatedRange.id,
        startDate: updatedDateRange[0],
        endDate: updatedDateRange[1],
        userId: currentUser.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsEditing(false);
        setTargetRange(null);
        setUpdatedDateRange(null);
        return;
      }

      mutateRange();

      showNotification('success', response.data.message);
      setIsEditing(false);
      setTargetRange(null);
      setUpdatedDateRange(null);
      setIsSaving(false);
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
    <>
      <DateRange
        open={isSelectRangeOpen}
        onClose={() => setIsSelectRangeOpen(false)}
        dateRange={isEditing ? updatedDateRange : newDateRange}
        setDateRange={isEditing ? setUpdatedDateRange : setNewDateRange}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          overflow="auto"
          maxHeight="80vh"
        >
          <Typography variant="h4">Set Unavailable Days</Typography>
          <Divider />

          {/* Add Date Range */}
          <Typography variant="subtitle1">Add Range:</Typography>
          <Grid container alignItems="center" gap={1}>
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
          <Divider />

          {/* Display Unavailable Range */}
          <Typography variant="subtitle1">Unavailable Range:</Typography>
          {unavailableRanges && unavailableRanges?.data.length > 0 ? (
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
                  handleDeleteRange={handleDeleteRange}
                  setIsSelectRangeOpen={setIsSelectRangeOpen}
                />
              );
            })
          ) : (
            <ErrorComponent errorText="No Unavailable Range Found" />
          )}
        </BoxModal>
      </Modal>
    </>
  );
}
