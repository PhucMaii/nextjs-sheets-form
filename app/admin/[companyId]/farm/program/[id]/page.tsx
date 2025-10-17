'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import BackButton from '../../../components/BackButton';
import { LoadingButton } from '@mui/lab';
import { Save as SaveIcon } from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import ProgramInfo from '../../../components/Farm/ProgramInfo';
import { CreateProgramForm } from '../create/page';
import ZonePrograms from '../../../components/Farm/Programs/ZonePrograms';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useQuery } from '@tanstack/react-query';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { Trash2Icon } from 'lucide-react';
import ConfirmModal from '../../../components/Modals/ConfirmModal';

const ProgramDetailsPage = () => {
  const router = useRouter();
  const { id, companyId }: any = useParams();
  const { NotificationComp, showNotification } = useNotification();
  const { zones: availableZones, isLoading: isLoadingZones } =
    useHydrawiseAPI(companyId);

  const { data: program, isLoading: isLoadingProgram } = useQuery({
    queryKey: ['program', id],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/water-program?id=${id}`),
      );
      return response.data.data;
    },
  });

  const [formData, setFormData] = useState<CreateProgramForm>({
    name: program?.name || '',
    days: 1,
    zonePrograms: program?.zoneWaterPrograms || [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false);
  useEffect(() => {
    if (program) {
      setFormData({
        name: program?.name || '',
        days: program?.days || 1,
        zonePrograms:
          program?.zoneWaterPrograms.map((zoneProgram: any) => ({
            zoneId: zoneProgram.zoneProgram.zoneId,
            duration: zoneProgram.zoneProgram.duration,
            index: zoneProgram.zoneProgram.index,
            id: zoneProgram.zoneProgram.id,
          })) || [],
      });
    }
  }, [program]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        getAdminApiUrl(companyId, `/water-program`),
        {
          id: id,
          name: formData.name,
          days: formData.days,
          zonePrograms: formData.zonePrograms,
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      showNotification('success', response.data.message);
      router.back();
    } catch (error: any) {
      console.log('Error submitting program: ', error);
      showNotification('error', 'Error submitting program: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/water-program?id=${id}`),
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      showNotification('success', response.data.message);
      router.back();
    } catch (error: any) {
      console.log('Error deleting program: ', error);
      showNotification('error', 'Error deleting program: ' + error);
    }
  };

  return (
    <Sidebar>
      <ConfirmModal
        title="Are you sure to delete this program?"
        handleSubmit={handleDelete}
        showNotification={showNotification}
        open={isOpenConfirmModal}
        onClose={() => setIsOpenConfirmModal(false)}
        color="error"
      />
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
            <Chip size="small" label={`Program ID: ${id}`} />
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={false}
          >
            Save Program
          </LoadingButton>

          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2Icon size={16} />}
            onClick={() => setIsOpenConfirmModal(true)}
            disabled={false}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {isLoadingProgram ? (
        <LoadingComponent />
      ) : (
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
      )}
    </Sidebar>
  );
};

export default ProgramDetailsPage;
