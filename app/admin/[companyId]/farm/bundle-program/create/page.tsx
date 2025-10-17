'use client';
import { Box, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import TimeInputModal from '../../../components/Modals/edit/SingleFieldUpdate';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { SaveAs as SaveAsIcon } from '@mui/icons-material';
import { getProgramById } from '@/app/utils/programs';
import { times } from '@/app/lib/constant';
import { LoadingButton } from '@mui/lab';
import { grey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import { usePrograms } from '@/hooks/db-tables/usePrograms';
import useBundleProgram from '@/hooks/db-tables/useBundleProgram';
import SchedulePrograms from '../../../components/Farm/Bundle/SchedulePrograms';
import ProgramsSection from '../../../components/Farm/Bundle/ProgramsSection';
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
  const [isTimeInputModalOpen, setIsTimeInputModalOpen] = useState<{
    open: boolean;
    targetId: string | null;
    day: number | null;
  }>({
    open: false,
    targetId: null,
    day: null,
  });

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { droppableId } = result.destination;
    // const { droppableId: sourceDroppableId } = result.source;
    console.log(result.source.droppableId, 'result.source.droppableId');
    if (!droppableId || droppableId === 'program-list') return;

    // If the program is dropped back into the same day
    if (droppableId === result.source.droppableId) return;

    const destDay = droppableId.replace('day-', '');
    if (result.source.droppableId.startsWith('program-')) {
      // Adding new program to day schedule
      const programId = result.draggableId.replace('program-', '');
      const program = getProgramById(programId, programs);
      if (!program) return;

      const scheduleId = Date.now().toString();
      setDaySchedules((prev: any) => {
        return prev.map((daySchedule: any) => {
          if (daySchedule.day === Number(destDay)) {
            return {
              ...daySchedule,
              programs: [
                ...daySchedule.programs,
                { ...program, time: '09:00', id: scheduleId, programId },
              ],
            };
          }
          return daySchedule;
        });
      });

      setIsTimeInputModalOpen({
        open: true,
        targetId: scheduleId,
        day: Number(destDay),
      });
    } else if (result.source.droppableId.startsWith('day-')) {
      // Switch program between days
      const sourceDay = result.source.droppableId.replace('day-', '');
      const programId = result.draggableId.split('-')[2];
      console.log(programId, 'programId');
      const time = result.draggableId.split('-')[1];
      const sourceDaySchedule = daySchedules.find(
        (daySchedule: any) => daySchedule.day === Number(sourceDay),
      );
      const program = sourceDaySchedule?.programs.find(
        (p: any) => p.id === programId,
      );
      console.log(program, 'program');
      if (!program) return;

      setDaySchedules((prev: any) => {
        return prev.map((daySchedule: any) => {
          if (daySchedule.day === Number(sourceDay)) {
            const newPrograms = daySchedule.programs.filter(
              (p: any) => p.id !== program.id,
            );
            console.log(newPrograms, 'newPrograms');
            return {
              ...daySchedule,
              programs: newPrograms,
            };
          }

          if (daySchedule.day === Number(destDay)) {
            return {
              ...daySchedule,
              programs: [...daySchedule.programs, { ...program, time }],
            };
          }
          return daySchedule;
        });
      });
    }
  };

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

  const handleUpdateTime = (id: string, value: string) => {
    setDaySchedules((prev: any) =>
      prev.map((schedule: any) => {
        if (schedule.day === isTimeInputModalOpen.day) {
          const programs = schedule.programs.map((program: any) => {
            if (program.id === id) {
              return { ...program, time: value };
            }
            return program;
          });
          return { ...schedule, programs };
        }
        return schedule;
      }),
    );
  };

  return (
    <Sidebar>
      {NotificationComp}
      <TimeInputModal
        open={isTimeInputModalOpen.open}
        onClose={() =>
          setIsTimeInputModalOpen({
            open: false,
            targetId: null,
            day: null,
          })
        }
        title="Select Time"
        label="Time"
        menuList={times}
        defaultValue={'09:00'}
        renderField={'time'}
        updatedField={isTimeInputModalOpen.targetId?.toString() || ''}
        handleUpdate={handleUpdateTime}
      />
      <DragDropContext onDragEnd={onDragEnd}>
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

          {/* Available Programs */}
          <ProgramsSection programs={programs} />

          {/* Schedule Programs */}
          <SchedulePrograms
            sortedDaySchedules={sortedDaySchedules}
            setDaySchedules={setDaySchedules}
            programs={programs}
          />
        </Box>
      </DragDropContext>
    </Sidebar>
  );
}
