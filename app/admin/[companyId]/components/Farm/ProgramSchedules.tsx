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
  Avatar,
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  ViewWeek as ViewWeekIcon,
  Today as TodayIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Water as WaterIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
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
} from 'date-fns';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePrograms } from '@/hooks/db-tables/usePrograms';
import { Program, ZoneWater } from './types';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';
import ProgramMonthView from './View/ProgramMonthView';
import ProgramWeekView from './View/ProgramWeekView';
import ProgramDayView from './View/ProgramDayView';
import TimeInputModal from '../Modals/edit/SingleFieldUpdate';

type ViewType = 'month' | 'week' | 'day';

interface ScheduleItem {
  id: string;
  programId: number;
  date: Date;
  time: string;
  status: 'scheduled' | 'active' | 'finished' | 'cancelled';
}

const defaultTime = '09:00';

export default function ProgramSchedules() {
  const theme = useTheme();
  const { companyId }: any = useParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { zones } = useHydrawiseAPI(companyId);
  const { getPrograms } = usePrograms(companyId);

  const { data: programs } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const data = await getPrograms();
      return data.map((program: Program) => ({
        ...program,
        zoneWaterPrograms: program.zoneWaterPrograms.map(
          (zoneProgram: ZoneWater) => ({
            ...zoneProgram,
            hydrawiseZone: zones.find(
              (zone: any) => zone.relay_id === zoneProgram.zoneProgram.zoneId,
            ),
          }),
        ),
      }));
    },
    enabled: zones.length > 0,
  });

  const [displayedPrograms, setDisplayedPrograms] = useState<Program[]>(
    programs || [],
  );
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [draggedProgram, setDraggedProgram] = useState<string | null>(null);
  const [isTimeInputModalOpen, setIsTimeInputModalOpen] = useState<{
    open: boolean;
    targetId: string | null;
  }>({
    open: false,
    targetId: null,
  });

  const times = Array.from({ length: 96 }, (_, i) => {
    const time = `${Math.floor(i / 4) < 10 ? '0' + Math.floor(i / 4) : Math.floor(i / 4)}:${(i % 4) * 15 === 0 ? '00' : (i % 4) * 15}`;
    return {
      id: time,
      time: time,
    };
  });

  useEffect(() => {
    if (programs) {
      setDisplayedPrograms(programs || []);
    }
  }, [programs]);

  const sortedSchedules = useMemo(
    () =>
      schedules.sort((a, b) => {
        return (
          new Date(`${format(a.date, 'yyyy-MM-dd')} ${a.time}`).getTime() -
          new Date(`${format(b.date, 'yyyy-MM-dd')} ${b.time}`).getTime()
        );
      }),
    [schedules],
  );

  const getProgramById = (id: string | number) =>
    programs?.find((p: Program) => p.id === Number(id));

  const getSchedulesForDate = (date: Date) => {
    return sortedSchedules.filter((schedule) => isSameDay(schedule.date, date));
  };

  const getSchedulesForTimeSlot = (date: Date, time: string) => {
    return sortedSchedules.filter(
      (schedule) => isSameDay(schedule.date, date) && schedule.time === time,
    );
  };

  const getProgramColor = (id: string) => {
    const program = getProgramById(id);
    return program?.zoneWaterPrograms.length > 10 ? '#4CAF50' : '#2196F3';
  };

  // const getProgramZones = (id: string) => {
  //   const program = getProgramById(id);
  //   return program?.zoneWaterPrograms.map((zone: ZoneProgram) => {
  //     console.log('zone', zone);
  //     return zone?.hydrawiseZone?.name
  //   }).join(', ');
  // };

  const handleDragStart = (result: any) => {
    if (result.source.droppableId.startsWith('program-')) {
      const programId = result.source.droppableId.replace('program-', '');
      setDraggedProgram(programId);
    } else {
      const schedule = schedules.find((s) => s.id === result.draggableId);
      if (schedule) {
        const program = getProgramById(schedule.programId);
        setDraggedProgram(program?.id || null);
      }
    }
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggedProgram(null);

    if (!result.destination) return;

    const { droppableId } = result.destination;
    if (!droppableId || droppableId === 'program-list') return;
    const [dateStr, time] = droppableId.split('|');
    const targetDate = new Date(dateStr);

    let scheduleId: any = null;

    if (result.source.droppableId.startsWith('program-')) {
      // Adding new schedule
      scheduleId = `s${Date.now()}`;
      const programId = result.draggableId.replace('program-', '');
      const newSchedule: ScheduleItem = {
        id: scheduleId,
        programId: Number(programId),
        date: targetDate,
        time: time || defaultTime,
        status: 'scheduled',
      };

      setSchedules((prev) => [...prev, newSchedule]);

      // Only ask for time if the schedule is new
      setIsTimeInputModalOpen({
        open: true,
        targetId: scheduleId,
      });
    } else {
      // Moving existing schedule
      scheduleId = result.draggableId;
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? { ...schedule, date: targetDate, time: time || schedule.time }
            : schedule,
        ),
      );
    }
  };

  console.log('schedules', schedules);
  const removeSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              status: schedule.status === 'active' ? 'scheduled' : 'active',
            }
          : schedule,
      ),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <PlayIcon fontSize="small" />;
      case 'finished':
        return <TimerIcon fontSize="small" />;
      case 'cancelled':
        return <PauseIcon fontSize="small" />;
      default:
        return <ScheduleIcon fontSize="small" />;
    }
  };

  const handleUpdateTime = (id: string | number, value: any) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, time: value } : schedule,
      ),
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <TimeInputModal
        open={isTimeInputModalOpen.open}
        onClose={() =>
          setIsTimeInputModalOpen({
            open: false,
            targetId: null,
          })
        }
        updatedField={isTimeInputModalOpen.targetId || ''}
        title="Edit Time"
        label="Time"
        menuList={times}
        renderField={'time'}
        defaultValue={defaultTime}
        handleUpdate={handleUpdateTime as any}
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
            <Button
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
            </Button>
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

        {/* Available Programs */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.5)}, ${alpha(theme.palette.grey[100], 0.2)})`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
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
                          <Paper
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: `2px solid ${alpha(getProgramColor(program.id), 0.3)}`,
                              backgroundColor: alpha(
                                getProgramColor(program.id),
                                0.1,
                              ),
                              minWidth: 220,
                              cursor: 'grab',
                              transition:
                                'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(getProgramColor(program.id), 0.3)}`,
                                borderColor: getProgramColor(program.id),
                                backgroundColor: alpha(
                                  getProgramColor(program.id),
                                  0.15,
                                ),
                              },
                              '&:active': {
                                cursor: 'grabbing',
                                transform: 'translateY(0px)',
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                            >
                              <Avatar
                                sx={{
                                  backgroundColor: alpha(
                                    getProgramColor(program.id),
                                    0.2,
                                  ),
                                  color: getProgramColor(program.id),
                                  border: `2px solid ${alpha(getProgramColor(program.id), 0.3)}`,
                                }}
                              >
                                <WaterIcon />
                              </Avatar>
                              <Box flex={1}>
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  color={getProgramColor(program.id)}
                                >
                                  {program.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {program.zoneWaterPrograms.length} zones
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: getProgramColor(program.id),
                                  opacity: 0.6,
                                }}
                              />
                            </Stack>
                            {/* {provided.placeholder} */}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Stack>
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
          {viewType === 'month' && (
            <ProgramMonthView
              currentDate={currentDate}
              theme={theme}
              getSchedulesForDate={getSchedulesForDate}
              getProgramById={getProgramById}
              getProgramColor={getProgramColor}
            />
          )}
          {viewType === 'week' && (
            <ProgramWeekView
              currentDate={currentDate}
              getSchedulesForTimeSlot={getSchedulesForTimeSlot}
              getProgramById={getProgramById}
              getProgramColor={getProgramColor}
            />
          )}
          {viewType === 'day' && (
            <ProgramDayView
              currentDate={currentDate}
              getSchedulesForDate={getSchedulesForDate}
              getSchedulesForTimeSlot={getSchedulesForTimeSlot}
              getProgramById={getProgramById}
              getProgramColor={getProgramColor}
              toggleScheduleStatus={toggleScheduleStatus}
              removeSchedule={removeSchedule}
              getStatusIcon={getStatusIcon}
            />
          )}

          {/* Drag Overlay */}
          {draggedProgram && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `2px dashed ${theme.palette.primary.main}`,
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
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <WaterIcon
                    sx={{ color: theme.palette.primary.main, fontSize: 32 }}
                  />
                  <Box>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      Dragging Program
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Drop on any date to schedule
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
