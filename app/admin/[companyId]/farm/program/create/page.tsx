'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
} from '@mui/icons-material';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { ZoneProgram } from '../../../components/Farm/types';
import { LoadingButton } from '@mui/lab';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import ProgramInfo from '../../../components/Farm/ProgramInfo';
import ZonePrograms from '../../../components/Farm/ZonePrograms';
import BackButton from '../../../components/BackButton';

export interface CreateProgramForm {
  name: string;
  days: number;
  zonePrograms: ZoneProgram[];
}

export default function CreateWaterProgram() {
  const router = useRouter();
  const { companyId }: any = useParams();

  const [formData, setFormData] = useState<CreateProgramForm>({
    name: '',
    days: 1,
    zonePrograms: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const { zones: availableZones, isLoading: isLoadingZones } =
    useHydrawiseAPI(companyId);
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
          zoneId: zoneProgram.zoneId,
          index: index + 1,
          duration: zoneProgram.duration,
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

  return (
    <Sidebar>
      {NotificationComp}
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <BackButton noText />
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
          disabled={formData.zonePrograms.length === 0 || isLoadingZones}
        >
          Create Program
        </LoadingButton>
      </Box>

      <Grid container spacing={2}>
        {/* Basic Information */}
        <Grid item xs={12} md={4}>
          <ProgramInfo formData={formData} setFormData={setFormData} />
        </Grid>

        {/* Zone Programs */}
        <Grid item xs={12} md={8}>
          <ZonePrograms
            formData={formData}
            setFormData={setFormData}
            availableZones={availableZones}
            isLoadingZones={isLoadingZones}
          />
        </Grid>
      </Grid>
      {/* </ShadowSection> */}
    </Sidebar>
  );
}
