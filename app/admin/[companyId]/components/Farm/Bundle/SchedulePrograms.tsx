import React from 'react';
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
import { Droppable, Draggable } from '@hello-pangea/dnd';
import SmallProgramCard from '../SmallProgramCard';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Add as AddIcon } from '@mui/icons-material';
import { Trash2Icon } from 'lucide-react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

interface IProps {
  sortedDaySchedules: any[];
  setDaySchedules: any;
  programs: any[];
}

export default function SchedulePrograms({
  sortedDaySchedules,
  setDaySchedules,
  programs,
}: IProps) {
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

  return (
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
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
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
              Click &quot;Add Day&quot; to start creating your bundle schedule
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
