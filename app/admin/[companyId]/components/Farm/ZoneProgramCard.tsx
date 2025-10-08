import React, { useMemo, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
} from '@mui/material';
import { DragIndicator as DragIcon } from '@mui/icons-material';
import { ZoneProgram } from './types';
import { Delete as DeleteIcon } from '@mui/icons-material';

function ZoneProgramCard({
  zoneProgram,
  index,
  availableZones,
  setFormData,
  formData,
}: {
  zoneProgram: ZoneProgram;
  index: number;
  availableZones: any;
  setFormData: any;
  formData: any;
}) {
  const [durationHelperText, setDurationHelperText] = useState<string>('');
  const selectedZone = useMemo(
    () =>
      availableZones.find((zone: any) => zone.relay_id === zoneProgram.zoneId),
    [availableZones, zoneProgram.zoneId],
  );

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const removeZoneProgram = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      zonePrograms: prev.zonePrograms.filter(
        (_: any, i: number) => i !== index,
      ),
    }));
  };

  const updateZoneProgram = (
    index: number,
    field: keyof ZoneProgram,
    value: any,
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      zonePrograms: prev.zonePrograms.map((zoneProgram: any, i: number) =>
        i === index ? { ...zoneProgram, [field]: value } : zoneProgram,
      ),
    }));
  };

  // const commitDuration = (idx: number) => {
  //   setFormData((prev: any) => ({
  //     ...prev,
  //     zonePrograms: prev.zonePrograms.map((zp: any, i: number) => {
  //       if (i !== idx) return zp;
  //       const n = Math.max(1, parseInt(zp.durationStr || '0', 10) || 0);
  //       return { ...zp, duration: n, durationStr: String(n) };
  //     }),
  //   }));
  // };

  return (
    <Draggable
      key={zoneProgram.uid}
      draggableId={zoneProgram.uid || ''}
      index={index}
    >
      {(provided: any, snapshot: any) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            mb: 2,
            opacity: snapshot.isDragging ? 0.8 : 1,
            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
            transition: 'all 0.2s ease-in-out',
            // border: `1px solid ${grey[300]}`,
            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px;',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                {...provided.dragHandleProps}
                sx={{
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                <DragIcon color="action" />
              </Box>

              <Box flex={1}>
                <Typography variant="h6" gutterBottom>
                  Step {index + 1}: {selectedZone?.name}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Zone</InputLabel>
                      <Select
                        value={zoneProgram.zoneId}
                        onChange={(e) =>
                          updateZoneProgram(
                            index,
                            'zoneId',
                            e.target.value as string,
                          )
                        }
                        label="Zone"
                      >
                        {availableZones.map((zone: any) => (
                          <MenuItem key={zone.relay_id} value={zone.relay_id}>
                            {zone.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Duration (seconds)"
                      type="number"
                      value={zoneProgram.duration}
                      onChange={(e) => {
                        setDurationHelperText(
                          `Duration: ${formatDuration(parseInt(e.target.value))}`,
                        );
                        updateZoneProgram(
                          index,
                          'duration',
                          +e.target.value,
                        );
                      }}
                      // onBlur={() => commitDuration(index)}
                      error={formData.zonePrograms[index].duration < 1}
                      helperText={
                        formData.zonePrograms[index].duration < 1
                          ? 'Duration must be at least 1 second'
                          : durationHelperText
                      }
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <IconButton
                color="error"
                onClick={() => removeZoneProgram(index)}
                sx={{ ml: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}

export default ZoneProgramCard;
