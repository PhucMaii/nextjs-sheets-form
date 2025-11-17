import React, { Dispatch, SetStateAction, useMemo, useEffect } from 'react';
import { Paper, Typography, Divider, Box, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatDuration } from '@/app/utils/time';
import { CreateProgramForm } from '../../../farm/program/create/page';
import { ColorPicker, useColor } from 'react-color-palette';
import ScheduleCard from '../Schedule/ScheduleCard';
import { WaterStatus } from '@prisma/client';

interface ProgramInfoProps {
  formData: CreateProgramForm;
  setFormData: Dispatch<SetStateAction<CreateProgramForm>>;
}

const ProgramInfo = ({ formData, setFormData }: ProgramInfoProps) => {
  const theme = useTheme();
  const [color, setColor] = useColor(formData.hexColor || '#2196F3');

  useEffect(() => {
    if (formData.hexColor && color.hex !== formData.hexColor) {
      const hex = formData.hexColor;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      setColor({
        hex: formData.hexColor,
        rgb: {
          r,
          g,
          b,
          a: 1,
        },
        hsv: {
          h: 0,
          s: 0,
          v: 0,
          a: 1,
        },
      });
    }
  }, [formData.hexColor, color.hex, setColor]);

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
        <Box display="flex" flexDirection="row" gap={2}>
          <ScheduleCard
            provided={{}}
            snapshot={{}}
            schedule={{
              id: 0,
              programId: 0,
              status: WaterStatus.SCHEDULED,
              date: new Date().toISOString(),
              time: '00:00',
              createdAt: new Date().toISOString(),
              createdBy: 'system',
              companyId: 1,
            }}
            isSelected={false}
            program={{
              id: 'preview-color',
              name: 'Preview Color',
              duration: 300,
              zoneWaterPrograms: [],
              hexColor: formData.hexColor || '#2196F3',
            }}
            showNotification={() => {}}
            refetchSchedules={() => {}}
            removeSchedule={() => {}}
            handleSave={async () => {}}
            setSchedules={() => {}}
            handleSelectProgram={() => {}}
          />
        </Box>
        <ColorPicker
          height={100}
          color={color}
          onChange={(newColor: any) => {
            setColor(newColor);
            setFormData((prev: CreateProgramForm) => ({
              ...prev,
              hexColor: newColor.hex,
            }));
          }}
          hideInput={['hsv', 'rgb']}
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
