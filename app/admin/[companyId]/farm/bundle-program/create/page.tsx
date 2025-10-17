'use client';
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  Paper,
  Stack,
  useTheme,
  alpha,
  Chip,
  Avatar,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import SmallProgramCard from '../../../components/Farm/SmallProgramCard';
import TimeInputModal from '../../../components/Modals/edit/SingleFieldUpdate';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  SaveAs as SaveAsIcon,
} from '@mui/icons-material';
import { getProgramById } from '@/app/utils/programs';
import { times } from '@/app/lib/constant';
import { LoadingButton } from '@mui/lab';
import { Trash2Icon } from 'lucide-react';
import { grey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import { usePrograms } from '@/hooks/db-tables/usePrograms';
import useBundleProgram from '@/hooks/db-tables/useBundleProgram';

export default function CreateBundleProgram() {
  const { companyId }: any = useParams();

  const router = useRouter();
  const theme = useTheme();
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

  const handleAddDay = () => {
    setDaySchedules([
      ...daySchedules,
      { day: daySchedules.length + 1, programs: [] },
    ]);
  };

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

  const handleDeleteDay = (day: number) => {
    setDaySchedules((prev: any) =>
      prev.filter((schedule: any) => schedule.day !== day),
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
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                >
                  <DriveFileRenameOutlineIcon />
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  Bundle Program Details
                </Typography>
              </Stack>
              <TextField
                fullWidth
                placeholder="Enter bundle program name"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DriveFileRenameOutlineIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
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
              // background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.5)}, ${alpha(theme.palette.grey[100], 0.2)})`,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                  }}
                >
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Available Programs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Drag programs to schedule them for specific days
                  </Typography>
                </Box>
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

              <Droppable droppableId="program-list" isDropDisabled={true}>
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 2,
                      minHeight: 120,
                      p: 2,
                      borderRadius: 2,
                      border: `2px dashed ${alpha(theme.palette.grey[300], 0.5)}`,
                      backgroundColor: alpha(theme.palette.grey[50], 0.3),
                    }}
                  >
                    {programs?.map((program: any, index: number) => (
                      <Draggable
                        key={program.id}
                        draggableId={'program-' + program.id}
                        index={index}
                      >
                        {(provided) => (
                          <SmallProgramCard
                            provided={provided}
                            key={program.id}
                            program={program}
                            programs={programs}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Stack>
          </Paper>

          {/* Schedule Programs */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.grey[200], 0.5)}`,
            }}
          >
            <Stack spacing={3}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Schedule Programs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Organize programs by days in your bundle
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddDay}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
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
                  Add Day
                </Button>
              </Stack>

              {/* Day Columns */}
              {sortedDaySchedules.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 2,
                    '&::-webkit-scrollbar': {
                      height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: alpha(theme.palette.grey[200], 0.3),
                      borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: alpha(theme.palette.grey[400], 0.5),
                      borderRadius: 4,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.grey[600], 0.7),
                      },
                    },
                  }}
                >
                  {sortedDaySchedules.map((daySchedule, dayIndex: any) => (
                    <Droppable
                      droppableId={'day-' + daySchedule.day}
                      key={daySchedule.day}
                    >
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          elevation={0}
                          sx={{
                            minWidth: 280,
                            maxWidth: 280,
                            borderRadius: 3,
                            border: `2px solid ${
                              snapshot.isDraggingOver
                                ? theme.palette.primary.main
                                : alpha(theme.palette.grey[200], 0.5)
                            }`,
                            backgroundColor: snapshot.isDraggingOver
                              ? alpha(theme.palette.primary.main, 0.05)
                              : 'white',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.3,
                              ),
                              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2, pb: 1 }}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="flex-start"
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                mb={2}
                              >
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: alpha(
                                      theme.palette.primary.main,
                                      0.1,
                                    ),
                                    color: theme.palette.primary.main,
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {dayIndex + 1}
                                </Avatar>
                                <Typography variant="h6" fontWeight={600}>
                                  Day {dayIndex + 1}
                                </Typography>
                              </Stack>

                              <IconButton
                                color="error"
                                onClick={() => handleDeleteDay(daySchedule.day)}
                              >
                                <Trash2Icon size={16} />
                              </IconButton>
                            </Box>

                            <Chip
                              label={`${daySchedule.programs.length} programs`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.info.main,
                                  0.1,
                                ),
                                color: theme.palette.info.main,
                                fontWeight: 500,
                                mb: 2,
                              }}
                            />
                          </CardContent>

                          <Box sx={{ px: 2, pb: 2 }}>
                            <Stack spacing={1} sx={{ minHeight: 200 }}>
                              {daySchedule.programs.map(
                                (program: any, programIndex: number) => (
                                  <Draggable
                                    draggableId={`${daySchedule.day}-${program.time}-${program.id}`}
                                    index={dayIndex * 100 + programIndex}
                                    key={`${daySchedule.day}-${program.time}-${program.id}`}
                                  >
                                    {(draggableProvided: any) => {
                                      return (
                                        <SmallProgramCard
                                          provided={draggableProvided}
                                          key={program.id}
                                          programs={programs}
                                          program={program}
                                          isSmall
                                        />
                                      );
                                    }}
                                  </Draggable>
                                ),
                              )}
                              {provided.placeholder}
                            </Stack>
                          </Box>
                          {provided.placeholder}
                        </Card>
                      )}
                    </Droppable>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 6,
                    border: `2px dashed ${alpha(theme.palette.grey[300], 0.5)}`,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.grey[50], 0.3),
                  }}
                >
                  <CalendarIcon
                    sx={{
                      fontSize: 48,
                      color: theme.palette.grey[400],
                      mb: 2,
                    }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No days scheduled yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click &quot;Add Day&quot; to start creating your bundle
                    schedule
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Box>
      </DragDropContext>
    </Sidebar>
  );
}
