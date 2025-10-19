import { alpha, Box, Stack, Typography } from '@mui/material';
import {
  format,
  isSameMonth,
  isToday,
  isWeekend,
  endOfMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ShowNotificationType } from '@/hooks/useNotification';
import ScheduleCard from '../Schedule/ScheduleCard';
import { getProgramById } from '@/app/utils/programs';
import { Program } from '../types';

interface IProps {
  currentDate: Date;
  theme: any;
  getSchedulesForDate: (date: Date) => any[];
  showNotification: ShowNotificationType;
  refetchSchedules: () => void;
  programs: Program[];
  removeSchedule: (id: string) => void;
  handleSave: () => Promise<void>;
  setSchedules: any;
  draggedBundleProgram?: any;
  hoveredDate?: Date | null;
  setHoveredDate?: (date: Date | null) => void;
  isDateOccupiedByBundle?: (date: Date, bundleProgram: any, startDate: Date) => boolean;
}

const ProgramMonthView = ({
  currentDate,
  theme,
  getSchedulesForDate,
  showNotification,
  refetchSchedules,
  removeSchedule,
  handleSave,
  setSchedules,
  draggedBundleProgram,
  hoveredDate,
  setHoveredDate,
  isDateOccupiedByBundle,
}: IProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      {/* Calendar Header */}
      <Box sx={{ display: 'flex' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Box
            key={day}
            sx={{
              flex: 1,
              p: 2,
              textAlign: 'center',
              backgroundColor: theme.palette.grey[100],
              borderRight:
                day !== 'Sat' ? `1px solid ${theme.palette.grey[300]}` : 'none',
              borderBottom: `1px solid ${theme.palette.grey[300]}`,
            }}
          >
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Body */}
      <Box>
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
          <Box key={weekIndex} sx={{ display: 'flex' }}>
            {days
              .slice(weekIndex * 7, (weekIndex + 1) * 7)
              .map((day, dayIndex) => {
                const daySchedules = getSchedulesForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const isWeekendDay = isWeekend(day);
                
                // Check if this day would be occupied by the dragged bundle program
                const isOccupiedByBundle = draggedBundleProgram && hoveredDate && 
                  isDateOccupiedByBundle ? isDateOccupiedByBundle(day, draggedBundleProgram, hoveredDate) : false;

                return (
                  <Droppable
                    key={day.toISOString()}
                    droppableId={day.toISOString()}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        onMouseEnter={() => {
                          if (draggedBundleProgram && setHoveredDate) {
                            setHoveredDate(day);
                          }
                        }}
                        onMouseLeave={() => {
                          if (draggedBundleProgram && setHoveredDate) {
                            setHoveredDate(null);
                          }
                        }}
                        sx={{
                          flex: 1,
                          minHeight: 120,
                          p: 1,
                          borderRight:
                            dayIndex < 6
                              ? `1px solid ${theme.palette.grey[300]}`
                              : 'none',
                          borderBottom:
                            weekIndex < Math.ceil(days.length / 7) - 1
                              ? `1px solid ${theme.palette.grey[300]}`
                              : 'none',
                          backgroundColor: isOccupiedByBundle
                            ? alpha(theme.palette.primary.dark, 0.2)
                            : isCurrentDay
                              ? alpha(theme.palette.primary.main, 0.1)
                              : isWeekendDay
                                ? alpha(theme.palette.grey[50], 0.5)
                                : 'white',
                          opacity: isCurrentMonth ? 1 : 0.4,
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: isOccupiedByBundle
                              ? alpha(theme.palette.primary.dark, 0.3)
                              : isCurrentDay
                                ? alpha(theme.palette.primary.main, 0.15)
                                : alpha(theme.palette.primary.main, 0.05),
                          },
                          ...(snapshot.isDraggingOver && {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1,
                            ),
                            border: `2px dashed ${theme.palette.primary.main}`,
                          }),
                          ...(isOccupiedByBundle && {
                            border: `2px solid ${theme.palette.primary.dark}`,
                            boxShadow: `0 0 8px ${alpha(theme.palette.primary.dark, 0.3)}`,
                          }),
                        }}
                      >
                        {/* Date Number */}
                        <Box sx={{ mb: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight={isCurrentDay ? 700 : 500}
                            color={
                              isCurrentDay
                                ? 'primary'
                                : isCurrentMonth
                                  ? 'text.primary'
                                  : 'text.secondary'
                            }
                            sx={{ fontSize: '0.875rem' }}
                          >
                            {format(day, 'd')}
                          </Typography>
                        </Box>

                        {/* Events/Programs */}
                        <Stack spacing={0.5}>
                          {daySchedules
                            .slice(0, 3)
                            .map((schedule, scheduleIndex) => {
                              const program: any = getProgramById(
                                schedule.id,
                                daySchedules,
                              );
                              if (!program) return null;

                              return (
                                <Draggable
                                  key={schedule.id}
                                  draggableId={schedule.id}
                                  index={scheduleIndex}
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
                                    />
                                  )}
                                </Draggable>
                              );
                            })}
                          {daySchedules.length > 3 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.6rem',
                                textAlign: 'center',
                                py: 0.5,
                                backgroundColor: alpha(
                                  theme.palette.grey[300],
                                  0.3,
                                ),
                                borderRadius: 0.5,
                              }}
                            >
                              +{daySchedules.length - 3} more
                            </Typography>
                          )}
                        </Stack>

                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                );
              })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProgramMonthView;
