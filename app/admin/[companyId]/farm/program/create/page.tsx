'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  useTheme,
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { ZoneProgram } from '../../../components/Farm/types';
import { LoadingButton } from '@mui/lab';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import ZoneProgramCard from '../../../components/Farm/ZoneProgramCard';

interface CreateProgramForm {
  name: string;
  days: number;
  zonePrograms: ZoneProgram[];
}

export default function CreateWaterProgram() {
  const router = useRouter();
  const theme = useTheme();
  const { companyId }: any = useParams();

  const [formData, setFormData] = useState<CreateProgramForm>({
    name: '',
    days: 1,
    zonePrograms: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const { zones: availableZones } = useHydrawiseAPI(companyId);
  const { showNotification, NotificationComp } = useNotification();

  const validateForm = (): { ok: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Program name is required';
    }

    if (formData.days < 1) {
      newErrors.days = 'Duration must be at least 1 day';
    }

    if (formData.zonePrograms.length === 0) {
      newErrors.zonePrograms = 'At least one zone program is required';
    }

    // Validate each zone program
    formData.zonePrograms.forEach((zoneProgram, index) => {
      if (zoneProgram.duration < 1) {
        newErrors[`zoneProgram_${index}_duration`] =
          'Duration must be at least 1 second';
      }
    });

    return {
      ok: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid.ok) {
      showNotification('error', Object.values(isValid.errors).join(', '));
      return;
    }

    try {
      setIsLoading(true);

      // Update indices based on current order
      const updatedZonePrograms = formData.zonePrograms.map(
        (zoneProgram, index) => ({
          ...zoneProgram,
          index: index + 1,
        }),
      );

      const response = await axios.post(
        getAdminApiUrl(companyId, '/water-program'),
        {
          name: formData.name,
          days: formData.days,
          zonePrograms: updatedZonePrograms,
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      showNotification('success', response.data.message);

      // Redirect back to programs page
      router.push(`/admin/${companyId}/farm`);
    } catch (error: any) {
      console.log('Failed to create program: ', error);
      showNotification('error', error.message || 'Failed to create program');
    } finally {
      setIsLoading(false);
    }
  };

  console.log('formData', formData);

  const addZoneProgram = () => {
    const newZoneProgram: ZoneProgram = {
      uid: crypto.randomUUID(),
      zoneId: availableZones[0].relay_id,
      duration: 30, // Default 30 seconds
      durationStr: '30',
      index: formData.zonePrograms.length + 1,
    };
    setFormData((prev) => ({
      ...prev,
      zonePrograms: [...prev.zonePrograms, newZoneProgram],
    }));
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(formData.zonePrograms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData((prev) => ({
      ...prev,
      zonePrograms: items,
    }));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return formData.zonePrograms.reduce(
      (total, zoneProgram) => total + zoneProgram.duration,
      0,
    );
  };

  return (
    <Sidebar>
      {NotificationComp}
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => router.back()}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              gutterBottom
            >
              Create Water Program
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set up a new water program with zone scheduling
            </Typography>
          </Box>
        </Box>

        <LoadingButton
          loading={isLoading}
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={formData.zonePrograms.length === 0}
        >
          Create Program
        </LoadingButton>
      </Box>

      <Grid container spacing={2}>
        {/* Basic Information */}
        <Grid item xs={12} md={4}>
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
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                error={!!formData.name}
                helperText={formData.name}
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
                  setFormData((prev) => ({
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
                  <strong>Total Runtime:</strong>{' '}
                  {formatDuration(getTotalDuration())}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Zone Programs */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              boxShadow: 'none',
              border: `1px solid ${theme.palette.grey[300]}`,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight={600}>
                Zone Programs
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addZoneProgram}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Add Zone
              </Button>
            </Box>

            {formData.zonePrograms.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={6}
                sx={{
                  border: `2px dashed ${theme.palette.grey[300]}`,
                  borderRadius: 2,
                  backgroundColor: theme.palette.grey[50],
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  gutterBottom
                >
                  No zones added yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Click &quot;Add Zone&quot; to start building your program
                </Typography>
              </Box>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="zone-programs">
                  {(provided: any) => (
                    <Box {...provided.droppableProps} ref={provided.innerRef}>
                      {formData.zonePrograms.map((zoneProgram, index) => (
                        <ZoneProgramCard
                          key={zoneProgram.uid}
                          zoneProgram={zoneProgram}
                          index={index}
                          availableZones={availableZones}
                          setFormData={setFormData}
                          formData={formData}
                        />
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Paper>
        </Grid>
      </Grid>
      {/* </ShadowSection> */}
    </Sidebar>
  );
}
