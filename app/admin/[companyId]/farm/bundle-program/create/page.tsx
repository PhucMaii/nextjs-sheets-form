'use client';
import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { SaveAs as SaveAsIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { grey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import { usePrograms } from '@/hooks/db-tables/usePrograms';
import useBundleProgram from '@/hooks/db-tables/useBundleProgram';
import SchedulePrograms from '../../../components/Farm/Bundle/SchedulePrograms';
import InputNameSection from '../../../components/Farm/Bundle/InputNameSection';

export default function CreateBundleProgram() {
  const { companyId }: any = useParams();

  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();
  const { getPrograms } = usePrograms(companyId, []);
  const { createBundleProgram } = useBundleProgram(companyId);

  // Data Fetching
  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const data = await getPrograms();
      return data;
    },
  });

  const [daySchedules, setDaySchedules] = useState<any[]>([]);
  const [name, setName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const sortedDaySchedules = useMemo(() => {
    const sortedSchedulePrograms = daySchedules.map((daySchedule: any) => {
      if (daySchedule.programs.length > 0) {
        const sortedPrograms = daySchedule.programs.sort((a: any, b: any) => {
          const aDate = new Date(`2025-01-01 ${a.time}`);
          const bDate = new Date(`2025-01-01 ${b.time}`);
          return aDate.getTime() - bDate.getTime();
        });
        return { ...daySchedule, programs: sortedPrograms };
      }
      return { ...daySchedule, programs: [] };
    });
    return sortedSchedulePrograms;
  }, [daySchedules]);

  const handleCreateBundleProgram = async () => {
    if (!name) {
      showNotification('error', 'Please enter a name for the bundle program');
      return;
    }
    if (daySchedules.length === 0) {
      showNotification(
        'error',
        'Please add at least one day to the bundle program',
      );
      return;
    }

    if (
      daySchedules.some((daySchedule: any) => daySchedule.programs.length === 0)
    ) {
      showNotification('error', 'Please add at least one program to each day');
      return;
    }

    setIsCreating(true);
    try {
      const response = await createBundleProgram(name, sortedDaySchedules);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      showNotification('success', response.data.message);
      router.push(`/admin/${companyId}/farm?tab=bundles`);
    } catch (error: any) {
      console.log('Failed to create bundle program: ', error);
      showNotification(
        'error',
        error.message || 'Failed to create bundle program',
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box
            // elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'white',
              // background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.02)})`,
              border: `1px solid ${grey[200]}`,
            }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Create Bundle Program
            </Typography>
            <LoadingButton
              variant="contained"
              color="primary"
              startIcon={<SaveAsIcon />}
              onClick={handleCreateBundleProgram}
              loading={isCreating}
            >
              Create Bundle
            </LoadingButton>
          </Box>

          {/* Bundle Program Name */}
          <InputNameSection name={name} setName={setName} />

          {/* Schedule Programs */}
          <SchedulePrograms
            sortedDaySchedules={sortedDaySchedules}
            setDaySchedules={setDaySchedules}
            programs={programs}
            daySchedules={daySchedules}
          />
        </Box>
    </Sidebar>
  );
}
