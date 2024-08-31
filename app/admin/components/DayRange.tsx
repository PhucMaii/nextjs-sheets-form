import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Grid, TextField } from '@mui/material';
import { IDayRange } from '@/app/utils/type';

interface IProps {
  range: IDayRange;
  isDeleting: boolean;
  isEditing: boolean;
  isSaving: boolean;
  initializeEdit: any;
  updatedDateRange: any;
  targetRangeId: any;
  setIsSelectRangeOpen: any;
  handleEditRange: any;
  handleDeleteRange: any;
}

export default function DayRange({
  range,
  updatedDateRange,
  targetRangeId,
  isEditing,
  isSaving,
  isDeleting,
  setIsSelectRangeOpen,
  initializeEdit,
  handleEditRange,
  handleDeleteRange,
}: IProps) {
  return (
    <Grid container alignItems="center" gap={1}>
      <Grid item xs={4.5}>
        <TextField
          fullWidth
          label="From"
          value={
            updatedDateRange && targetRangeId === range.id && isEditing
              ? updatedDateRange[0]?.toDateString()
              : new Date(range.startDate).toDateString()
          }
          onClick={() => setIsSelectRangeOpen(true)}
          disabled={
            targetRangeId !== range.id || !isEditing || !updatedDateRange
          }
        />
      </Grid>
      <Grid item xs={4.5} textAlign="right">
        <TextField
          disabled={
            targetRangeId !== range.id || !isEditing || !updatedDateRange
          }
          fullWidth
          label="To"
          value={
            updatedDateRange && targetRangeId === range.id && isEditing
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
            {targetRangeId !== range.id || !isEditing || !updatedDateRange
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
}
