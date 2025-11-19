import React, { useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  Avatar,
  Box,
  Button,
  IconButton,
  Chip,
} from '@mui/material';
import { theme } from '@/theme';
import { alpha } from '@mui/material/styles';
import {
  Droppable,
  Draggable,
  DropResult,
  DragDropContext,
} from '@hello-pangea/dnd';
import SmallProgramCard from '../SmallProgramCard';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Add as AddIcon } from '@mui/icons-material';
import { Trash2Icon } from 'lucide-react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TimeInputModal from '../../Modals/edit/SingleFieldUpdate';
import { times } from '@/app/lib/constant';
import {
  getProgramById,
  getProgramByIdAndSchedules,
} from '@/app/utils/programs';
import ProgramsSection from './ProgramsSection';
import { ShowNotificationType } from '@/hooks/useNotification';

interface IProps {
  daySchedules: any[];
  sortedDaySchedules: any[];
  setDaySchedules: any;
  programs: any[];
  showNotification: ShowNotificationType;
}

export default function SchedulePrograms({
  daySchedules,
  sortedDaySchedules,
  setDaySchedules,
  programs,
  showNotification,
}: IProps) {
  const [isTimeInputModalOpen, setIsTimeInputModalOpen] = useState<{
    open: boolean;
    targetId: string | null;
    day: number | null;
    defaultValue: string | null;
  }>({
    open: false,
    targetId: null,
    day: null,
    defaultValue: null,
  });

  const handleAddDay = () => {
    setDaySchedules((prev: any[]) => [
      ...prev,
      { day: prev.length + 1, programs: [] },
    ]);
  };

  const handleDeleteDay = (day: number) => {
    setDaySchedules((prev: any[]) =>
      prev.filter((schedule: any) => schedule.day !== day),
    );
  };

  const handleUpdateTime = (id: string, value: string) => {
    setDaySchedules((prev: any) =>
      prev.map((schedule: any) => {
        if (schedule.day === isTimeInputModalOpen.day) {
          const programs = schedule.programs.map((program: any) => {
            if (program.id.toString() === id) {
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
        defaultValue: '09:00',
      });
    } else if (result.source.droppableId.startsWith('day-')) {
      // Switch program between days
      const sourceDay = result.source.droppableId.replace('day-', '');
      const programId = result.draggableId.split('-')[2];
      const time = result.draggableId.split('-')[1];
      const sourceDaySchedule = daySchedules.find(
        (daySchedule: any) => daySchedule.day === Number(sourceDay),
      );
      const program = sourceDaySchedule?.programs.find(
        (p: any) => p.id.toString() === programId,
      );
      console.log({ program });
      if (!program) return;

      setDaySchedules((prev: any) => {
        return prev.map((daySchedule: any) => {
          if (daySchedule.day === Number(sourceDay)) {
            const newPrograms = daySchedule.programs.filter(
              (p: any) => p.id.toString() !== program.id.toString(),
            );
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

  const handleDeleteProgram = (id: string) => {
    setDaySchedules((prev: any) =>
      prev.map((daySchedule: any) => ({
        ...daySchedule,
        programs: daySchedule.programs.filter((p: any) => p.id !== id),
      })),
    );
  };

  console.log({ daySchedules });

  const handleCopyProgram = (id: string) => {
    const program = getProgramByIdAndSchedules(id, daySchedules);
    if (!program?.program) return;

    setDaySchedules((prev: any) => {
      return prev.map((daySchedule: any) => {
        if (daySchedule.day === program?.daySchedule?.day) {
          return {
            ...daySchedule,
            programs: [
              ...daySchedule.programs,
              {
                ...program.program,
                time: program.program.time,
                id: `s${Date.now()}`,
                programId: program?.program?.programId,
              },
            ],
          };
        }
        return daySchedule;
      });
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <TimeInputModal
        open={isTimeInputModalOpen.open}
        onClose={() =>
          setIsTimeInputModalOpen({
            open: false,
            targetId: null,
            day: null,
            defaultValue: null,
          })
        }
        title="Select Time"
        label="Time"
        menuList={times}
        defaultValue={isTimeInputModalOpen.defaultValue || '09:00'}
        renderField={'time'}
        updatedField={isTimeInputModalOpen.targetId?.toString() || ''}
        handleUpdate={handleUpdateTime}
      />
      {/* Available Programs */}
      <ProgramsSection
        programs={programs}
        showNotification={showNotification}
      />
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
                        minWidth: 320,
                        maxWidth: 320,
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
                          borderColor: alpha(theme.palette.primary.main, 0.3),
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
                                      handleDelete={() =>
                                        handleDeleteProgram(program.id)
                                      }
                                      showNotification={showNotification}
                                      provided={draggableProvided}
                                      key={program.id}
                                      program={program}
                                      isSmall
                                      onClick={() =>
                                        setIsTimeInputModalOpen({
                                          open: true,
                                          targetId: program.id.toString(),
                                          day: daySchedule.day,
                                          defaultValue: program.time,
                                        })
                                      }
                                      handleCopy={() =>
                                        handleCopyProgram(program.id)
                                      }
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
                Click &quot;Add Day&quot; to start creating your bundle schedule
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </DragDropContext>
  );
}
