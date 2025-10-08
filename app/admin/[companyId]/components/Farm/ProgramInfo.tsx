import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { Paper, Typography, Divider, Box, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CreateProgramForm } from '../../farm/program/create/page';

interface ProgramInfoProps {
  formData: CreateProgramForm;
  setFormData: Dispatch<SetStateAction<CreateProgramForm>>;
}

const ProgramInfo = ({ formData, setFormData }: ProgramInfoProps) => {
  const theme = useTheme();

  const totalDuration = useMemo(() => formData.zonePrograms.reduce(
    (total, zoneProgram) => total + zoneProgram.duration,
    0,
  ), [formData.zonePrograms]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper
      sx={{
        p: 3,
        height: 'fit-content',
        boxShadow: 'none',
        border: `1px solid ${theme.palette.grey[200]}`,
      }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Program Details
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box display="flex" flexDirection="column" gap={3}>
        <TextField
          fullWidth
          label="Program Name"
          placeholder="Enter program name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev: CreateProgramForm) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        <TextField
          fullWidth
          label="Duration (days)"
          type="number"
          value={formData.days}
          onChange={(e) =>
            setFormData((prev: CreateProgramForm) => ({
              ...prev,
              days: Math.max(1, parseInt(e.target.value) || 1),
            }))
          }
          error={formData.days < 1}
          helperText={
            formData.days < 1 ? 'Duration must be at least 1 day' : null
          }
          inputProps={{ min: 1 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {/* Summary */}
        <Box
          sx={{
            p: 2,
            border: `1px solid ${theme.palette.grey[200]}`,
            borderRadius: 2,
            backgroundColor: theme.palette.grey[50],
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Program Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Name:</strong> {formData.name || 'Unnamed Program'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Duration:</strong> {formData.days} day
            {formData.days !== 1 ? 's' : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Zones:</strong> {formData.zonePrograms.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Total Runtime:</strong> {formatDuration(totalDuration)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProgramInfo;
