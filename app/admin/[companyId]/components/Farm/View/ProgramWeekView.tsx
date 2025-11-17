import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha, Stack } from '@mui/material';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { format, isToday } from 'date-fns';
import { startOfWeek, addDays } from 'date-fns';
import { Program } from '../types';
import { ShowNotificationType } from '@/hooks/useNotification';
import ScheduleCard from '../Schedule/ScheduleCard';

interface IProps {
  currentDate: Date;
  getSchedulesForTimeSlot: (date: Date, time: string) => any[];
  showNotification: ShowNotificationType;
  refetchSchedules: () => void;
  removeSchedule: (id: string) => void;
  handleSave: () => Promise<void>;
  setSchedules: any;
  selectedPrograms: Program[];
  handleSelectProgram: (program: Program) => void;
}

const ProgramWeekView = ({
  currentDate,
  getSchedulesForTimeSlot,
  showNotification,
  refetchSchedules,
  removeSchedule,
  handleSave,
  setSchedules,
  selectedPrograms,
  handleSelectProgram,
}: IProps) => {
  const weekStart = startOfWeek(currentDate);
  const theme = useTheme();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from(
    { length: 24 },
    (_, i) => `${i.toString().padStart(2, '0')}:00`,
  );

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Header Row */}
      <Box sx={{ display: 'flex' }}>
        {/* Time column header */}
        <Box
          sx={{
            width: 80,
            p: 2,
            textAlign: 'center',
            backgroundColor: theme.palette.grey[100],
            borderRight: `1px solid ${theme.palette.grey[300]}`,
            borderBottom: `1px solid ${theme.palette.grey[300]}`,
          }}
        >
          <Typography variant="body2" fontWeight={700} color="text.primary">
            Time
          </Typography>
        </Box>

        {/* Day headers */}
        {days.map((day) => {
          return (
            <Box
              key={day.toISOString()}
              sx={{
                flex: 1,
                p: 2,
                textAlign: 'center',
                backgroundColor: isToday(day)
                  ? alpha(theme.palette.primary.main, 0.1)
                  : theme.palette.grey[100],
                borderRight:
                  day !== days[days.length - 1]
                    ? `1px solid ${theme.palette.grey[300]}`
                    : 'none',
                borderBottom: `1px solid ${theme.palette.grey[300]}`,
                transition: 'all 0.2s ease',
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color={isToday(day) ? 'primary' : 'text.primary'}
              >
                {format(day, 'EEE')}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                color={isToday(day) ? 'primary' : 'text.primary'}
              >
                {format(day, 'd')}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Time slots rows */}
      {timeSlots.map((time, timeIndex) => (
        <Box key={time} sx={{ display: 'flex' }}>
          {/* Time column */}
          <Box
            sx={{
              width: 80,
              p: 1,
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.grey[50], 0.5),
              borderRight: `1px solid ${theme.palette.grey[300]}`,
              borderBottom:
                timeIndex < timeSlots.length - 1
                  ? `1px solid ${theme.palette.grey[300]}`
                  : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              {time}
            </Typography>
          </Box>

          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <Droppable
              key={`${day.toISOString()}-${time}`}
              droppableId={`${day.toISOString()}|${time}`}
            >
              {(provided, snapshot) => {
                const daySchedules = getSchedulesForTimeSlot(day, time);
                return (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    flex: 1,
                    minHeight: 60,
                    p: 0.5,
                    borderRight:
                      dayIndex < days.length - 1
                        ? `1px solid ${theme.palette.grey[300]}`
                        : 'none',
                    borderBottom:
                      timeIndex < timeSlots.length - 1
                        ? `1px solid ${theme.palette.grey[300]}`
                        : 'none',
                    backgroundColor: isToday(day)
                      ? alpha(theme.palette.primary.main, 0.02)
                      : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: isToday(day)
                        ? alpha(theme.palette.primary.main, 0.05)
                        : alpha(theme.palette.primary.main, 0.02),
                    },
                    ...(snapshot.isDraggingOver && {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      border: `2px dashed ${theme.palette.primary.main}`,
                    }),
                  }}
                >
                  <Stack spacing={0.5}>
                    {daySchedules.map((schedule) => {
                      // const program: Program | any = getProgramById(
                      //   schedule.id,
                      //   daySchedules,
                      // );

                      const program = schedule.waterProgram;
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
                              removeSchedule={removeSchedule}
                              handleSave={handleSave}
                              setSchedules={setSchedules}
                              handleSelectProgram={handleSelectProgram}
                              isSelected={selectedPrograms.some(
                                (p) => p.id === program.id,
                              )}
                            />
                          )}
                        </Draggable>
                      );
                    })}
                  </Stack>
                  {provided.placeholder}
                </Box>
              )}}
            </Droppable>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default ProgramWeekView;
