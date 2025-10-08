'use client';
import React, { useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { Box, Chip, Grid, IconButton, Typography } from '@mui/material';
import BackButton from '../../../components/BackButton';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon } from '@mui/icons-material';
import { useParams } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import ProgramInfo from '../../../components/Farm/ProgramInfo';
import { CreateProgramForm } from '../create/page';
import ZonePrograms from '../../../components/Farm/ZonePrograms';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';

const ProgramDetailsPage = () => {
  const { id, companyId }: any = useParams();
  const { NotificationComp } = useNotification();
  const { zones: availableZones, isLoading: isLoadingZones } =
    useHydrawiseAPI(companyId);

  const [formData, setFormData] = useState<CreateProgramForm>({
    name: '',
    days: 1,
    zonePrograms: [],
  });

  return (
    <Sidebar>
      {NotificationComp}
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
              Edit Water Program
            </Typography>
            <Chip
              size="small"
              label={`Program ID: ${id}`}
            />
          </Box>
        </Box>

        <LoadingButton
          loading={false}
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => {}}
          disabled={false}
        >
          Save Program
        </LoadingButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <ProgramInfo formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid item xs={12} md={8}>
          <ZonePrograms
            formData={formData}
            setFormData={setFormData}
            availableZones={availableZones}
            isLoadingZones={isLoadingZones}
          />
        </Grid>
      </Grid>
    </Sidebar>
  );
};

export default ProgramDetailsPage;
