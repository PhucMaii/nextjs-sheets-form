'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { grey } from '@mui/material/colors';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import LoadingButton from '@mui/lab/LoadingButton';
import { SaveAs as SaveAsIcon } from '@mui/icons-material';
import InputNameSection from '../../../components/Farm/Bundle/InputNameSection';
import SchedulePrograms from '../../../components/Farm/Bundle/SchedulePrograms';
import useNotification from '@/hooks/useNotification';
import BackButton from '../../../components/BackButton';

export default function BundleProgramDetails() {
  const { companyId, id }: any = useParams();
  const { showNotification, NotificationComp } = useNotification();
  const router = useRouter();
  // Data Fetching
  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const data = await axios.get(getAdminApiUrl(companyId, '/water-program'));
      return data.data.data;
    },
  });

  const { data: bundleProgram, refetch: refetchBundleProgram } = useQuery({
    queryKey: ['bundleProgram', id],
    queryFn: async () => {
      const data = await axios.get(
        getAdminApiUrl(companyId, `/bundle-program?id=${id}`),
      );
      return data.data.data;
    },
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [daySchedules, setDaySchedules] = useState<any[]>([]);
  const [updatedName, setUpdatedName] = useState<string>('');

  const formatDayProgram = (dayProgram: any) => {
    return {
      ...dayProgram,
      name: dayProgram.program.name,
      zoneWaterPrograms: dayProgram.program.zoneWaterPrograms,
    };
  };

  useEffect(() => {
    if (bundleProgram) {
      const formattedDaySchedules = bundleProgram.dayPrograms.reduce(
        (acc: any, dayProgram: any) => {
          const existingDay = acc.find(
            (day: any) => day.day === dayProgram.day,
          );

          if (existingDay) {
            existingDay.programs.push({
              ...formatDayProgram(dayProgram),
            });
            return acc;
          }

          return [
            ...acc,
            {
              day: dayProgram.day,
              programs: [
                {
                  ...formatDayProgram(dayProgram),
                },
              ],
            },
          ];
        },
        [],
      );

      setDaySchedules(formattedDaySchedules);
      setUpdatedName(bundleProgram.name);
    }
  }, [bundleProgram]);

  console.log('daySchedules', daySchedules);

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

  const handleEditBundleProgram = async () => {
    setIsEditing(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, `/bundle-program`),
        {
          id: id,
          name: updatedName,
          daySchedules: sortedDaySchedules,
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      showNotification('success', response.data.message);
      refetchBundleProgram();
      // router.back();
    } catch (error: any) {
      console.log('Error editing bundle program: ', error);
      showNotification('error', 'Error editing bundle program: ' + error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Box p={3}>
        <Box
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
          <Box display="flex" alignItems="center" gap={1}>
            <BackButton />
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Edit Bundle Program
            </Typography>
            
          </Box>
          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={<SaveAsIcon />}
            onClick={handleEditBundleProgram}
            loading={isEditing}
          >
            Save Changes
          </LoadingButton>
        </Box>

        <InputNameSection name={updatedName} setName={setUpdatedName} />

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
