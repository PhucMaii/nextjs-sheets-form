import React from 'react';
import { Grid, Paper, Typography, Stack, Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material';
import { format } from 'date-fns';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Program } from '../types';
import ScheduleCard from '../Schedule/ScheduleCard';
import { ShowNotificationType } from '@/hooks/useNotification';
import { getProgramById } from '@/app/utils/programs';

interface IProps {
  currentDate: Date;
  getSchedulesForTimeSlot: (date: Date, time: string) => any[];
  programs: Program[];
  removeSchedule: (id: string) => void;
  showNotification: ShowNotificationType;
  refetchSchedules: () => void;
  handleSave: () => Promise<void>;
  setSchedules: any;
}

const ProgramDayView = ({
  currentDate,
  getSchedulesForTimeSlot,
  programs,
  showNotification,
  refetchSchedules,
  removeSchedule,
  handleSave,
  setSchedules,
}: IProps) => {
  const timeSlots = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, '0')}:00`,
  );

  const theme = useTheme();
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            textAlign: 'center',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            borderRadius: 2,
            mb: 2,
            transition: 'all 0.2s ease',
          }}
        >
          <Typography variant="h5" fontWeight={700} color="primary">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={1}>
          {timeSlots.map((time) => {
            const timeSchedules = getSchedulesForTimeSlot(currentDate, time);

            return (
              <Paper
                key={time}
                elevation={0}
                sx={{
                  p: 2,
                  border: `1px solid ${alpha(theme.palette.grey[200], 0.3)}`,
                  borderRadius: 2,
                  backgroundColor: 'white',
                }}
              >
                <Droppable droppableId={`${currentDate.toISOString()}|${time}`}>
                  {(provided) => (
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ minWidth: 60 }}
                      >
                        {time}
                      </Typography>
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          flex: 1,
                          minHeight: 40,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        {timeSchedules.map((schedule) => {
                          const program: Program | any = getProgramById(
                            schedule.programId,
                            programs,
                          );
                          if (!program) return null;

                          return (
                            <Draggable
                              key={schedule.id}
                              draggableId={schedule.id}
                              index={0}
                            >
                              {(provided, snapshot) => (
                                <ScheduleCard
                                  provided={provided}
                                  snapshot={snapshot}
                                  schedule={schedule}
                                  program={program}
                                  showNotification={showNotification}
                                  refetchSchedules={refetchSchedules}
                                  isDetailed
                                  removeSchedule={removeSchedule}
                                  handleSave={handleSave}
                                  setSchedules={setSchedules}
                                />
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </Box>
                    </Stack>
                  )}
                </Droppable>
              </Paper>
            );
          })}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ProgramDayView;
