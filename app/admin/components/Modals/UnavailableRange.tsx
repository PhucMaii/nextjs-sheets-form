import {
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import DateRange from './DateRangeModal';
import { generateMonthRange } from '@/app/utils/time';
import AddIcon from '@mui/icons-material/Add';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { IDayRange, Notification, UserType } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';

interface IProps extends ModalProps {
  currentUser: UserType;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

const apiURL = `${API_URL.ADMIN}/clients/unavailable_days`;
export default function UnavailableRange({
  open,
  onClose,
  currentUser,
  setNotification,
}: IProps) {
  const [newDateRange, setNewDateRange] = useState<any>(() =>
    generateMonthRange(),
  );
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState<boolean>(false);
  const [targetRangeId, setTargetRangeId] = useState<number | null>(null);
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
    setTargetRangeId(updatedRange.id);
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
    try {
      setIsAdding(true);

      const response = await axios.post(apiURL, {
        startDate: newDateRange[0],
        endDate: newDateRange[1],
        userId: currentUser.id,
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

  const handleDeleteRange = async (deletedId: number) => {
    setTargetRangeId(deletedId);
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${apiURL}?deletedRangeId=${deletedId}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setTargetRangeId(null);
        setIsDeleting(false);
        return;
      }

      mutateRange();

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setTargetRangeId(null);
      setIsDeleting(false);
    } catch (error: any) {
      console.log('There was an error:', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
      setTargetRangeId(null);
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
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsEditing(false);
        setTargetRangeId(null);
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
      setTargetRangeId(null);
      setUpdatedDateRange(null);
    } catch (error: any) {
      console.log('There was an error: ' + error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error.response.data.error,
      });
      setIsEditing(false);
      setTargetRangeId(null);
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
              console.log({ validDate: updatedDateRange });
              return (
                <Grid container alignItems="center" gap={1} key={index}>
                  <Grid item xs={4.5}>
                    <TextField
                      fullWidth
                      label="From"
                      value={
                        updatedDateRange &&
                        targetRangeId === range.id &&
                        isEditing
                          ? updatedDateRange[0]?.toDateString()
                          : new Date(range.startDate).toDateString()
                      }
                      onClick={() => setIsSelectRangeOpen(true)}
                      disabled={
                        targetRangeId !== range.id ||
                        !isEditing ||
                        !updatedDateRange
                      }
                    />
                  </Grid>
                  <Grid item xs={4.5} textAlign="right">
                    <TextField
                      disabled={
                        targetRangeId !== range.id ||
                        !isEditing ||
                        !updatedDateRange
                      }
                      fullWidth
                      label="To"
                      value={
                        updatedDateRange &&
                        targetRangeId === range.id &&
                        isEditing
                          ? updatedDateRange[1]?.toDateString()
                          : new Date(range.endDate).toDateString()
                      }
                      onClick={() => setIsSelectRangeOpen(true)}
                    />
                  </Grid>
                  <Grid item xs={2} textAlign="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <LoadingButton
                        loading={targetRangeId === range.id && isSaving}
                        loadingIndicator="Saving..."
                        onClick={() => {
                          if (
                            targetRangeId !== range.id ||
                            !isEditing ||
                            !updatedDateRange
                          ) {
                            initializeEdit(range);
                          } else {
                            handleEditRange(range);
                          }
                        }}
                      >
                        {targetRangeId !== range.id ||
                        !isEditing ||
                        !updatedDateRange
                          ? 'EDIT'
                          : 'SAVE'}
                      </LoadingButton>
                      <LoadingButton
                        color="error"
                        onClick={() => handleDeleteRange(range.id)}
                        loading={targetRangeId === range.id && isDeleting}
                        loadingIndicator="Deleting..."
                      >
                        Delete
                      </LoadingButton>
                    </Box>
                  </Grid>
                </Grid>
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
