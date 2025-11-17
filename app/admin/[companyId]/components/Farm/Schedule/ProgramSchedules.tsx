import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  ViewWeek as ViewWeekIcon,
  Today as TodayIcon,
  Water as WaterIcon,
  FolderCopy as FolderCopyIcon,
  Schedule as ScheduleIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  CopyAll as CopyAllIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  endOfDay,
  startOfDay,
  subWeeks,
} from 'date-fns';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePrograms } from '@/hooks/db-tables/usePrograms';
import { Program, ZoneWater } from '../types';
import ProgramMonthView from '../View/ProgramMonthView';
import ProgramWeekView from '../View/ProgramWeekView';
import ProgramDayView from '../View/ProgramDayView';
import TimeInputModal from '../../Modals/edit/SingleFieldUpdate';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { ShowNotificationType } from '@/hooks/useNotification';
import { WaterStatus } from '@prisma/client';
import { LoadingButton } from '@mui/lab';
import { times } from '@/app/lib/constant';
import SmallProgramCard from '../SmallProgramCard';
import SmallBundleProgramCard from '../SmallBundleProgramCard';
import { getProgramById } from '@/app/utils/programs';
import ConfirmModal from '../../Modals/ConfirmModal';

type ViewType = 'month' | 'week' | 'day';
interface ScheduleItem {
  id: string;
  programId: number;
  name?: string;
  date: string;
  time: string;
  status: WaterStatus;
  zoneWaterPrograms?: ZoneWater[];
  waterProgram?: Program;
}

export const defaultScheduleTime = '09:00';

interface IProps {
  showNotification: ShowNotificationType;
}

export default function ProgramSchedules({ showNotification }: IProps) {
  const theme = useTheme();
  const { companyId }: any = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  // const { zones } = useHydrawiseAPI(companyId);
  const { getPrograms } = usePrograms(companyId, []);

  const { data: bundlePrograms } = useQuery({
    queryKey: ['bundlePrograms'],
    queryFn: async () => {
      const data = await axios.get(
        getAdminApiUrl(companyId, '/bundle-program'),
      );
      return data.data.data;
    },
    enabled: !!companyId,
  });

  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const data = await getPrograms();
      return data.map((program: Program) => ({
        ...program,
        zoneWaterPrograms: program.zoneWaterPrograms.map(
          (zoneProgram: ZoneWater) => ({
            ...zoneProgram,
            // hydrawiseZone: zones.find(
            //   (zone: any) => zone.relay_id === zoneProgram.zoneProgram.zoneId,
            // ),
          }),
        ),
      }));
    },
    // enabled: zones.length > 0,
  });

  const [displayedPrograms, setDisplayedPrograms] = useState<Program[]>(
    programs || [],
  );
  const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);
  const [isConfirmDelete, setIsConfirmDelete] = useState<boolean>(false);
  const [viewType, setViewType] = useState<ViewType>('month');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [draggedProgram, setDraggedProgram] = useState<string | null>(null);
  const [draggedBundleProgram, setDraggedBundleProgram] = useState<any | null>(
    null,
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showAvailablePrograms, setShowAvailablePrograms] =
    useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isCopyingPrevPeriod, setIsCopyingPrevPeriod] =
    useState<boolean>(false);
  const [isTimeInputModalOpen, setIsTimeInputModalOpen] = useState<{
    open: boolean;
    targetId: string | null;
    defaultValue: string | null;
  }>({
    open: false,
    targetId: null,
    defaultValue: null,
  });

  const handleSelectProgram = (program: Program) => {
    const isSelected = selectedPrograms.some((p) => p.id === program.id);
    if (isSelected) {
      setSelectedPrograms((prev) => prev.filter((p) => p.id !== program.id));
    } else {
      setSelectedPrograms((prev) => [...prev, program]);
    }
  };
  const getStartAndEndDate = () => {
    if (viewType === 'month') {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      return { startDate, endDate };
    } else if (viewType === 'week') {
      const startDate = startOfWeek(currentDate);
      const endDate = endOfWeek(currentDate);
      return { startDate, endDate };
    } else if (viewType === 'day') {
      const startDate = startOfDay(currentDate);
      const endDate = endOfDay(currentDate);
      return { startDate, endDate };
    }

    return { startDate: new Date(), endDate: new Date() };
  };

  const { data: dbSchedules, refetch: refetchSchedules } = useQuery({
    queryKey: ['schedules', currentDate],
    queryFn: async () => {
      const { startDate, endDate } = getStartAndEndDate();
      const data = await axios.get(
        getAdminApiUrl(
          companyId,
          `/water-program/schedule?startDate=${startDate}&endDate=${endDate}`,
        ),
      );
      return data.data.data;
    },
  });

  useEffect(() => {
    if (programs) {
      setDisplayedPrograms(programs || []);
    }
  }, [programs]);

  useEffect(() => {
    if (dbSchedules) {
      const formattedSchedules = dbSchedules.map((schedule: any) => ({
        ...schedule,
        id: schedule.id.toString(),
      }));
      setSchedules(formattedSchedules || []);
    }
  }, [dbSchedules]);

  // useEffect(() => {
  //   if (schedules.length > 0) {
  //     triggerSync(schedules);
  //   }
  // }, [schedules, triggerSync]);

  const sortedSchedules = useMemo(() => {
    return [...schedules].sort((a, b) => {
      const aDate = new Date(`${a.date} ${a.time}`);
      const bDate = new Date(`${b.date} ${b.time}`);
      return aDate.getTime() - bDate.getTime();
    });
  }, [schedules]);

  // const getProgramById = (id: string | number) =>
  //   programs?.find((p: Program) => Number(p.id) === Number(id));

  const getSchedulesForDate = (date: Date) => {
    return sortedSchedules.filter((schedule) => isSameDay(schedule.date, date));
  };

  const getSchedulesForTimeSlot = (date: Date, time: string) => {
    return sortedSchedules.filter(
      (schedule) =>
        isSameDay(schedule.date, date) &&
        schedule.time.split(':')[0] === time.split(':')[0],
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { startDate, endDate } = getStartAndEndDate();
      const response = await axios.put(
        getAdminApiUrl(companyId, '/water-program/schedule'),
        {
          updatedSchedules: schedules,
          startDate,
          endDate,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      refetchSchedules();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggedProgram(null);
    setDraggedBundleProgram(null);

    if (!result.destination) return;

    const { droppableId } = result.destination;
    if (
      !droppableId ||
      droppableId === 'program-list' ||
      droppableId === 'bundle-program-list'
    )
      return;
    const [dateStr, time] = droppableId.split('|');
    const targetDate = new Date(dateStr);

    let scheduleId: any = null;

    if (result.source.droppableId.startsWith('program-')) {
      // Adding new schedule
      scheduleId = `s${Date.now()}`;
      const programId = result.draggableId.replace('program-', '');
      const program = getProgramById(programId, displayedPrograms);
      const newSchedule: ScheduleItem = {
        id: scheduleId,
        programId: Number(programId),
        name: program?.name || '',
        date: format(targetDate, 'MM/dd/yyyy'),
        time: time || defaultScheduleTime,
        status: WaterStatus.SCHEDULED,
        zoneWaterPrograms: program?.zoneWaterPrograms || [],
        waterProgram: program,
      };

      setSchedules((prev) => {
        const newSchedules = [...prev, newSchedule];
        // triggerSync(newSchedules);
        return newSchedules;
      });

      // Only ask for time if the schedule is new
      setIsTimeInputModalOpen({
        open: true,
        targetId: scheduleId,
        defaultValue: time || defaultScheduleTime,
      });
    } else if (result.source.droppableId.startsWith('bundle-program-')) {
      // Adding bundle program schedules
      const bundleProgramId = result.draggableId.replace('bundle-program-', '');
      const bundleProgram = bundlePrograms?.find(
        (bp: any) => bp.id.toString() === bundleProgramId,
      );

      if (bundleProgram) {
        const newSchedules: ScheduleItem[] = bundleProgram.dayPrograms.map(
          (dayProgram: any, index: number) => {
            const scheduleDate = addDays(targetDate, dayProgram.day - 1);
            return {
              id: `s${Date.now()}_${index}`,
              programId: dayProgram.program.id,
              name: dayProgram.program.name,
              date: format(scheduleDate, 'MM/dd/yyyy'),
              time: dayProgram.time,
              status: WaterStatus.SCHEDULED,
              zoneWaterPrograms: dayProgram.program.zoneWaterPrograms || [],
              waterProgram: dayProgram.program,
            };
          },
        );

        setSchedules((prev) => {
          const updatedSchedules = [...prev, ...newSchedules];
          // triggerSync(updatedSchedules);
          return updatedSchedules;
        });
      }
    } else {
      // Moving existing schedule
      scheduleId = result.draggableId;
      setSchedules((prev) => {
        const updatedSchedules = prev.map((schedule) =>
          schedule.id === scheduleId
            ? {
                ...schedule,
                date: format(targetDate, 'MM/dd/yyyy'),
                time: time || schedule.time,
                waterProgram: schedule.waterProgram,
              }
            : schedule,
        );
        // triggerSync(updatedSchedules);
        return updatedSchedules;
      });
    }
  };

  const handleUpdateTime = (id: string | number, value: any) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, time: value } : schedule,
      ),
    );
  };

  const handleDragStart = (result: any) => {
    if (result.draggableId.startsWith('bundle-program-')) {
      const bundleProgramId = result.draggableId.replace('bundle-program-', '');
      const bundleProgram = bundlePrograms?.find(
        (bp: any) => bp.id.toString() === bundleProgramId,
      );
      setDraggedBundleProgram(bundleProgram);
    } else {
      setDraggedProgram(result.draggableId);
    }
  };

  const getBundleDuration = (bundleProgram: any) => {
    if (!bundleProgram?.dayPrograms) return 0;
    return Math.max(...bundleProgram.dayPrograms.map((dp: any) => dp.day));
  };

  const getBundleOccupiedDates = (bundleProgram: any, startDate: Date) => {
    if (!bundleProgram?.dayPrograms) return [];
    return bundleProgram.dayPrograms.map((dp: any) =>
      addDays(startDate, dp.day - 1),
    );
  };

  const isDateOccupiedByBundle = (
    date: Date,
    bundleProgram: any,
    startDate: Date,
  ) => {
    if (!bundleProgram || !startDate) return false;
    const occupiedDates = getBundleOccupiedDates(bundleProgram, startDate);
    return occupiedDates.some((occupiedDate: Date) =>
      isSameDay(occupiedDate, date),
    );
  };

  const handleCopyPrevPeriod = async () => {
    setIsCopyingPrevPeriod(true);
    try {
      let prevPeriodStartDate = null;
      let prevPeriodEndDate = null;
      if (viewType === 'month') {
        prevPeriodStartDate = format(
          startOfMonth(subMonths(currentDate, 1)),
          'MM/dd/yyyy',
        );
        prevPeriodEndDate = format(
          endOfMonth(subMonths(currentDate, 1)),
          'MM/dd/yyyy',
        );
      } else if (viewType === 'week') {
        prevPeriodStartDate = format(
          startOfWeek(subWeeks(currentDate, 1)),
          'MM/dd/yyyy',
        );
        prevPeriodEndDate = format(
          endOfWeek(subWeeks(currentDate, 1)),
          'MM/dd/yyyy',
        );
      }

      const response = await axios.post(
        getAdminApiUrl(companyId, '/water-program/schedule/copy-prev-period'),
        {
          prevPeriodStartDate,
          prevPeriodEndDate,
          type: viewType,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      refetchSchedules();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsCopyingPrevPeriod(false);
    }
  };

  const handleDeleteSelectedPrograms = async () => {
    try {
      const programIds = selectedPrograms.map((program) => program.id);
      const response = await axios.delete(
        getAdminApiUrl(
          companyId,
          `/water-program/schedule/delete-multiple-programs?programIds=${programIds.join(',')}`,
        ),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await refetchSchedules();
      setSelectedPrograms([]);
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TimeInputModal
        open={isTimeInputModalOpen.open}
        onClose={() =>
          setIsTimeInputModalOpen({
            open: false,
            targetId: null,
            defaultValue: null,
          })
        }
        updatedField={isTimeInputModalOpen.targetId || ''}
        title="Edit Time"
        label="Time"
        menuList={times}
        renderField={'time'}
        defaultValue={isTimeInputModalOpen.defaultValue || defaultScheduleTime}
        handleUpdate={handleUpdateTime as any}
      />

      <ConfirmModal
        open={isConfirmDelete}
        onClose={() => setIsConfirmDelete(false)}
        handleSubmit={handleDeleteSelectedPrograms}
        title={`Are you sure to delete ${selectedPrograms.length} schedules?`}
        buttonLabel="Delete"
        showNotification={showNotification}
        color="error"
      />
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.02)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <ScheduleIcon sx={{ color: 'white', fontSize: 28 }} />
              </Paper>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="text.primary"
                  gutterBottom
                >
                  Program Schedules
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ opacity: 0.8 }}
                >
                  Manage and schedule your irrigation programs
                </Typography>
              </Box>
            </Stack>
            {/* <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAddDialogOpen(true)}
              size="large"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Add Schedule
            </Button> */}
          </Stack>
        </Paper>

        {/* View Controls */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1}>
              <Button
                variant={viewType === 'month' ? 'contained' : 'outlined'}
                startIcon={<CalendarMonthIcon />}
                onClick={() => setViewType('month')}
                size="small"
              >
                Month
              </Button>
              <Button
                variant={viewType === 'week' ? 'contained' : 'outlined'}
                startIcon={<ViewWeekIcon />}
                onClick={() => setViewType('week')}
                size="small"
              >
                Week
              </Button>
              <Button
                variant={viewType === 'day' ? 'contained' : 'outlined'}
                startIcon={<TodayIcon />}
                onClick={() => setViewType('day')}
                size="small"
              >
                Day
              </Button>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() =>
                  setCurrentDate(
                    viewType === 'month'
                      ? subMonths(currentDate, 1)
                      : subDays(currentDate, viewType === 'week' ? 7 : 1),
                  )
                }
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ minWidth: 200, textAlign: 'center' }}
              >
                {viewType === 'month'
                  ? format(currentDate, 'MMMM yyyy')
                  : viewType === 'week'
                    ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
                    : format(currentDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
              <IconButton
                onClick={() =>
                  setCurrentDate(
                    viewType === 'month'
                      ? addMonths(currentDate, 1)
                      : addDays(currentDate, viewType === 'week' ? 7 : 1),
                  )
                }
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>

        {/* Available Bundle Programs */}
        {viewType === 'month' && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              backgroundColor: 'white',
              border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.05)}, ${alpha(theme.palette.primary.light, 0.02)})`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <FolderCopyIcon sx={{ color: theme.palette.primary.dark }} />
              <Typography variant="h6" fontWeight={600}>
                Available Bundle Programs
              </Typography>
              <Chip
                label="Drag to schedule from start date"
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.dark, 0.1),
                  color: theme.palette.primary.dark,
                  fontWeight: 500,
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Droppable droppableId="bundle-program-list">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    {bundlePrograms &&
                      bundlePrograms.map(
                        (bundleProgram: any, index: number) => (
                          <Draggable
                            key={bundleProgram.id}
                            draggableId={`bundle-program-${bundleProgram.id}`}
                            index={index}
                          >
                            {(provided) => (
                              <SmallBundleProgramCard
                                provided={provided}
                                bundleProgram={bundleProgram}
                              />
                            )}
                          </Draggable>
                        ),
                      )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Stack>
          </Paper>
        )}

        {/* Available Programs */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            backgroundColor: 'white',
            border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.5)}, ${alpha(theme.palette.grey[100], 0.2)})`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={showAvailablePrograms ? 2 : 0}
            sx={{ cursor: 'pointer' }}
            onClick={() => setShowAvailablePrograms(!showAvailablePrograms)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <WaterIcon sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" fontWeight={600}>
                Available Programs
              </Typography>
              <Chip
                label="Drag to schedule"
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  fontWeight: 500,
                }}
              />
            </Stack>
            <IconButton
              size="small"
              sx={{
                color: theme.palette.primary.main,
                transition: 'transform 0.2s ease',
                transform: showAvailablePrograms
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Stack>

          {showAvailablePrograms && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Droppable droppableId="program-list">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    {programs &&
                      displayedPrograms.map((program: any, index: number) => (
                        <Draggable
                          key={program.id}
                          draggableId={`program-${program.id}`}
                          index={index}
                          // isDragDisabled
                        >
                          {(provided) => (
                            <SmallProgramCard
                              provided={provided}
                              program={program}
                              showNotification={showNotification}
                            />
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Stack>
          )}
        </Paper>

        {/* Calendar View */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            backgroundColor: 'white',
            position: 'relative',
          }}
        >
          <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
            <Box>
              {selectedPrograms.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setIsConfirmDelete(true)}
                >
                  Delete {selectedPrograms.length} schedules
                </Button>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              {(viewType === 'month' || viewType === 'week') && (
                <LoadingButton
                  onClick={handleCopyPrevPeriod}
                  loading={isCopyingPrevPeriod}
                  variant="outlined"
                  startIcon={<CopyAllIcon />}
                >
                  Copy Last{' '}
                  {viewType === 'month'
                    ? 'Month'
                    : viewType === 'week'
                      ? 'Week'
                      : ''}
                </LoadingButton>
              )}
              <LoadingButton
                variant="contained"
                onClick={handleSave}
                loading={isSaving}
                startIcon={<SaveIcon />}
              >
                Save
              </LoadingButton>
            </Box>
          </Box>

          {viewType === 'month' && (
            <ProgramMonthView
              currentDate={currentDate}
              theme={theme}
              getSchedulesForDate={getSchedulesForDate}
              showNotification={showNotification}
              refetchSchedules={refetchSchedules}
              // programs={displayedPrograms}
              removeSchedule={deleteSchedule}
              handleSave={handleSave}
              setSchedules={setSchedules}
              draggedBundleProgram={draggedBundleProgram}
              hoveredDate={hoveredDate}
              setHoveredDate={setHoveredDate}
              isDateOccupiedByBundle={isDateOccupiedByBundle}
              selectedPrograms={selectedPrograms}
              handleSelectProgram={handleSelectProgram}
            />
          )}
          {viewType === 'week' && (
            <ProgramWeekView
              currentDate={currentDate}
              getSchedulesForTimeSlot={getSchedulesForTimeSlot}
              showNotification={showNotification}
              refetchSchedules={refetchSchedules}
              removeSchedule={deleteSchedule}
              handleSave={handleSave}
              setSchedules={setSchedules}
              selectedPrograms={selectedPrograms}
              handleSelectProgram={handleSelectProgram}
            />
          )}
          {viewType === 'day' && (
            <ProgramDayView
              currentDate={currentDate}
              getSchedulesForTimeSlot={getSchedulesForTimeSlot}
              removeSchedule={deleteSchedule}
              showNotification={showNotification}
              refetchSchedules={refetchSchedules}
              // programs={displayedPrograms}
              handleSave={handleSave}
              setSchedules={setSchedules}
              selectedPrograms={selectedPrograms}
              handleSelectProgram={handleSelectProgram}
            />
          )}

          {/* Drag Overlay */}
          {(draggedProgram || draggedBundleProgram) && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: alpha(
                  draggedBundleProgram
                    ? theme.palette.primary.dark
                    : theme.palette.primary.main,
                  0.05,
                ),
                border: `2px dashed ${
                  draggedBundleProgram
                    ? theme.palette.primary.dark
                    : theme.palette.primary.main
                }`,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                pointerEvents: 'none',
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: 'white',
                  border: `2px solid ${
                    draggedBundleProgram
                      ? theme.palette.primary.dark
                      : theme.palette.primary.main
                  }`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  {draggedBundleProgram ? (
                    <FolderCopyIcon
                      sx={{
                        color: theme.palette.primary.dark,
                        fontSize: 32,
                      }}
                    />
                  ) : (
                    <WaterIcon
                      sx={{ color: theme.palette.primary.main, fontSize: 32 }}
                    />
                  )}
                  <Box>
                    <Typography variant="h6" fontWeight={600} color={'primary'}>
                      {draggedBundleProgram
                        ? 'Dragging Bundle Program'
                        : 'Dragging Program'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {draggedBundleProgram
                        ? `Will schedule ${draggedBundleProgram.dayPrograms.length} programs over ${getBundleDuration(draggedBundleProgram)} days`
                        : 'Drop on any date to schedule'}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          )}
        </Paper>
      </Box>
    </DragDropContext>
  );
}
