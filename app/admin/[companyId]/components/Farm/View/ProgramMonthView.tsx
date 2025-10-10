import { alpha, Box, IconButton, Stack, Typography } from '@mui/material';
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
import TimeInputModal from '../../Modals/edit/SingleFieldUpdate';
import { useState } from 'react';
import { times } from '@/app/lib/constant';
import { defaultScheduleTime } from '../ProgramSchedules';
import { DragIndicator as DragHandleIcon } from '@mui/icons-material';

interface IProps {
  currentDate: Date;
  theme: any;
  getSchedulesForDate: (date: Date) => any[];
  getProgramById: (id: string) => any[];
  getProgramColor: (id: string) => string;
}

const ProgramMonthView = ({
  currentDate,
  theme,
  getSchedulesForDate,
  getProgramById,
  getProgramColor,
}: IProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const [isTimeInputModalOpen, setIsTimeInputModalOpen] = useState<{
    open: boolean;
    targetId: string | null;
  }>({
    open: false,
    targetId: null,
  });

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <TimeInputModal
        open={isTimeInputModalOpen.open}
        onClose={() => setIsTimeInputModalOpen({ open: false, targetId: null })}
        updatedField={isTimeInputModalOpen.targetId || ''}
        title="Edit Time"
        label="Time"
        menuList={times}
        renderField={'time'}
        defaultValue={defaultScheduleTime}
      />
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

                return (
                  <Droppable
                    key={day.toISOString()}
                    droppableId={day.toISOString()}
                  >
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
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
                          backgroundColor: isCurrentDay
                            ? alpha(theme.palette.primary.main, 0.1)
                            : isWeekendDay
                              ? alpha(theme.palette.grey[50], 0.5)
                              : 'white',
                          opacity: isCurrentMonth ? 1 : 0.4,
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: isCurrentDay
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
                                schedule.programId,
                              );
                              if (!program) return null;

                              return (
                                <Draggable
                                  key={schedule.id}
                                  draggableId={schedule.id}
                                  index={scheduleIndex}
                                >
                                  {(provided, snapshot) => (
                                    <Box
                                      ref={provided.innerRef}
                                      onClick={() =>
                                        setIsTimeInputModalOpen({
                                          open: true,
                                          targetId: schedule.id,
                                        })
                                      }
                                      {...provided.dragHandleProps}
                                      sx={{
                                        p: 0.5,
                                        borderRadius: 0.5,
                                        backgroundColor: alpha(
                                          getProgramColor(program.id),
                                          0.2,
                                        ),
                                        border: `1px solid ${alpha(getProgramColor(program.id), 0.4)}`,
                                        borderLeft: `3px solid ${getProgramColor(program.id)}`,
                                        opacity: snapshot.isDragging ? 0.5 : 1,
                                        cursor: 'grab',
                                        '&:active': {
                                          cursor: 'grabbing',
                                        },
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                          backgroundColor: alpha(
                                            getProgramColor(program.id),
                                            0.3,
                                          ),
                                        },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                      }}
                                    >
                                      <Box>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            color: getProgramColor(program.id),
                                            display: 'block',
                                            lineHeight: 1.2,
                                          }}
                                        >
                                          {schedule.time}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            fontSize: '0.6rem',
                                            color: getProgramColor(program.id),
                                            display: 'block',
                                            lineHeight: 1.2,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {program.name}
                                        </Typography>
                                      </Box>
                                      <IconButton
                                        {...provided.dragHandleProps}
                                        size="small"
                                      >
                                        <DragHandleIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
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
