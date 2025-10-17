import React from 'react';
import {
  Fade,
  Paper,
  alpha,
  Box,
  Stack,
  Typography,
  CardContent,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  Water as WaterIcon,
} from '@mui/icons-material';
import { Program, ZoneWater } from './types';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { ShowNotificationType } from '@/hooks/useNotification';
import { usePrograms } from '@/hooks/db-tables/usePrograms';
import { IZone } from '@/hooks/useHydrawiseAPI';

interface ProgramCardProps {
  program: Program;
  zones: IZone[];
  showNotification: ShowNotificationType;
  refetchPrograms: () => void;
}

const ProgramCard = ({
  program,
  zones,
  showNotification,
  refetchPrograms,
}: ProgramCardProps) => {
  const router = useRouter();
  const { companyId }: any = useParams();
  const theme = useTheme();
  const { activateProgram, stopProgram } = usePrograms(companyId, []);
  const getProgressPercentage = (program: Program) => {
    if (!program.remainingDays) return 100;
    return ((program.days - program.remainingDays) / program.days) * 100;
  };

  const getStatusColor = (program: Program) => {
    if (!program.isActive) return 'default';
    if (program.remainingDays === 0) return 'success';
    if (program.remainingDays && program.remainingDays <= 3) return 'warning';
    return 'primary';
  };

  const handleActivateProgram = async (programId: string) => {
    try {
      const response = await activateProgram(programId);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      refetchPrograms();

      showNotification('success', 'Program activated successfully');
    } catch (error: any) {
      console.log('Error activating program: ', error);
      showNotification('error', 'Error activating program: ' + error);
    }
  };

  const handleStopProgram = async (programId: string) => {
    try {
      const response = await stopProgram(programId);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      refetchPrograms();
      showNotification('success', 'Program stopped successfully');
    } catch (error: any) {
      console.log('Error stopping program: ', error);
      showNotification('error', 'Error stopping program: ' + error);
    }
  };

  return (
    <Fade in timeout={400}>
      <Paper
        elevation={0}
        onClick={() =>
          router.push(`/admin/${companyId}/farm/program/${program.id}`)
        }
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${alpha(program.isActive ? theme.palette.primary.main : theme.palette.grey[300], 0.2)}`,
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha(program.isActive ? theme.palette.primary.main : theme.palette.grey[500], 0.15)}`,
            borderColor: alpha(
              program.isActive
                ? theme.palette.primary.main
                : theme.palette.grey[400],
              0.4,
            ),
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: program.isActive
              ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              : theme.palette.grey[300],
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3, pt: 4 }}>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={3}
          >
            <Box flex={1}>
              <Stack direction="row" alignItems="center" gap={1} mb={1}>
                <WaterIcon
                  sx={{
                    color: program.isActive
                      ? theme.palette.primary.main
                      : theme.palette.grey[400],
                    fontSize: 20,
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="text.primary"
                  sx={{
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                  }}
                >
                  {program.name}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip
                title={program.isActive ? 'Pause Program' : 'Activate Program'}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    program.isActive
                      ? handleStopProgram(program.id.toString())
                      : handleActivateProgram(program.id.toString());
                  }}
                  sx={{
                    backgroundColor: program.isActive
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.grey[500], 0.1),
                    color: program.isActive
                      ? theme.palette.primary.main
                      : theme.palette.grey[600],
                    '&:hover': {
                      backgroundColor: program.isActive
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.grey[500], 0.2),
                    },
                  }}
                >
                  {program.isActive ? (
                    <PauseIcon fontSize="small" />
                  ) : (
                    <PlayIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              {/* <Tooltip title="Edit Program">
                <IconButton
                  size="small"
                  onClick={() => handleEditProgram(program.id)}
                  sx={{
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.info.main, 0.2),
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Program">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteProgram(program.id)}
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip> */}
            </Stack>
          </Stack>

          {/* Status and Progress */}
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Chip
              label={program.isActive ? 'Active' : 'Inactive'}
              color={getStatusColor(program)}
              size="small"
              icon={program.isActive ? <PlayIcon /> : <PauseIcon />}
              sx={{
                fontWeight: 500,
                '& .MuiChip-icon': {
                  fontSize: '1rem',
                },
              }}
            />
            {program.remainingDays !== undefined && (
              <Chip
                label={`${program.remainingDays} days left`}
                variant="outlined"
                size="small"
                icon={<TimerIcon />}
                sx={{
                  borderColor: alpha(theme.palette.warning.main, 0.3),
                  color: theme.palette.warning.dark,
                  '& .MuiChip-icon': {
                    fontSize: '1rem',
                  },
                }}
              />
            )}
          </Stack>

          {/* Progress Bar */}
          {program.remainingDays !== undefined && (
            <Box mb={3}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Progress
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {program.days - program.remainingDays} / {program.days} days
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage(program)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.grey[300], 0.3),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  },
                }}
              />
            </Box>
          )}

          {/* Next Scheduled Run */}
          {program.nextScheduledRun && (
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <CalendarIcon
                fontSize="small"
                sx={{
                  color: alpha(theme.palette.info.main, 0.7),
                  fontSize: '1.1rem',
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Next run:{' '}
                {format(program.nextScheduledRun, 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Stack>
          )}

          {/* Zones */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <LocationIcon
                fontSize="small"
                sx={{
                  color: alpha(theme.palette.primary.main, 0.7),
                  fontSize: '1.1rem',
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={500}
              >
                Zones ({program.zoneWaterPrograms.length})
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              {program.zoneWaterPrograms.map((zone: ZoneWater, index) => (
                <Chip
                  key={index}
                  label={
                    zones.find(
                      (z: any) => z.relay_id === zone.zoneProgram.zoneId,
                    )?.name || zone.zoneProgram.zoneId
                  }
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.dark,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* <Box display="flex" justifyContent="flex-end">
            <Tooltip title="Delete Program">
              <IconButton
                size="small"
                onClick={() => handleDeleteProgram(program.id)}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box> */}
        </CardContent>
      </Paper>
    </Fade>
  );
};

export default ProgramCard;
