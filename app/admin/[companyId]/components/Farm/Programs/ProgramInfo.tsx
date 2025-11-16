import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { Paper, Typography, Divider, Box, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDuration } from '@/app/utils/time';
import { CreateProgramForm } from '../../../farm/program/create/page';
// import { ColorPicker, useColor } from 'react-color-palette';

interface ProgramInfoProps {
  formData: CreateProgramForm;
  setFormData: Dispatch<SetStateAction<CreateProgramForm>>;
}

const ProgramInfo = ({ formData, setFormData }: ProgramInfoProps) => {
  const theme = useTheme();
  // const [color] = useColor(formData.hexColor || '#2196F3');

  const totalDuration = useMemo(
    () =>
      formData.zonePrograms.reduce(
        (total: number, zoneProgram: any) => total + zoneProgram.duration,
        0,
      ),
    [formData.zonePrograms],
  );

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

        <Typography variant="subtitle2" fontWeight={600}>
          Program Color
        </Typography>
          {/* Show color preview */}
          {/* <Box display="flex" flexDirection="row" gap={2}>
            <Box width={20} height={20} bgcolor={color.hex} borderRadius={1} />
          </Box> */}
        {/* <ColorPicker
          height={100}
          color={color}
          onChange={(color: any) =>
            setFormData((prev: CreateProgramForm) => ({
              ...prev,
              hexColor: color.hex,
            }))
          }
          // hideAlpha
          hideInput={['hsv', 'rgb']}
        /> */}

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
