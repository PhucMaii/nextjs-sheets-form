import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  CardContent,
  Chip,
  IconButton,
  Grid,
  LinearProgress,
  Tooltip,
  useTheme,
  Fade,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Timer as TimerIcon,
  Water as WaterIcon,
} from '@mui/icons-material';
import { Program, ZoneWater } from './types';
import { format } from 'date-fns';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useQuery } from '@tanstack/react-query';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';
import ProgramCard from './ProgramCard';

export default function Programs() {
  const router = useRouter();
  const { companyId }: any = useParams();

  const { data: fetchedPrograms, isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/water-program'),
      );
      return response.data.data;
    },
  });

  const { zones } = useHydrawiseAPI(companyId);

  const [programs, setPrograms] = useState<Program[]>(fetchedPrograms || []);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    setPrograms(fetchedPrograms || []);
  }, [fetchedPrograms]);

  const activePrograms = useMemo(
    () => programs.filter((p) => p.isActive),
    [programs],
  );
  const inactivePrograms = useMemo(
    () => programs.filter((p) => !p.isActive),
    [programs],
  );

  const handleToggleActive = (programId: string) => {
    setPrograms((prev) =>
      prev.map((program) =>
        program.id === programId
          ? { ...program, isActive: !program.isActive }
          : program,
      ),
    );
  };

  const handleDeleteProgram = (programId: string) => {
    setPrograms((prev) => prev.filter((program) => program.id !== programId));
  };

  const handleEditProgram = (programId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit program:', programId);
  };

  const handleAddProgram = () => {
    // Navigate to create program page
    router.push(`/admin/${companyId}/farm/program/create`);
  };

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

  // const ProgramCard = ({ program }: { program: Program }) => (
  //   <Fade in timeout={400}>
  //     <Paper
  //       elevation={0}
  //       sx={{
  //         height: '100%',
  //         display: 'flex',
  //         flexDirection: 'column',
  //         border: `1px solid ${alpha(program.isActive ? theme.palette.primary.main : theme.palette.grey[300], 0.2)}`,
  //         borderRadius: 3,
  //         overflow: 'hidden',
  //         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  //         position: 'relative',
  //         '&:hover': {
  //           transform: 'translateY(-2px)',
  //           boxShadow: `0 8px 25px ${alpha(program.isActive ? theme.palette.primary.main : theme.palette.grey[500], 0.15)}`,
  //           borderColor: alpha(
  //             program.isActive
  //               ? theme.palette.primary.main
  //               : theme.palette.grey[400],
  //             0.4,
  //           ),
  //         },
  //         '&::before': {
  //           content: '""',
  //           position: 'absolute',
  //           top: 0,
  //           left: 0,
  //           right: 0,
  //           height: 4,
  //           background: program.isActive
  //             ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
  //             : theme.palette.grey[300],
  //         },
  //       }}
  //     >
  //       <CardContent sx={{ flexGrow: 1, p: 3, pt: 4 }}>
  //         {/* Header */}
  //         <Stack
  //           direction="row"
  //           justifyContent="space-between"
  //           alignItems="flex-start"
  //           mb={3}
  //         >
  //           <Box flex={1}>
  //             <Stack direction="row" alignItems="center" gap={1} mb={1}>
  //               <WaterIcon
  //                 sx={{
  //                   color: program.isActive
  //                     ? theme.palette.primary.main
  //                     : theme.palette.grey[400],
  //                   fontSize: 20,
  //                 }}
  //               />
  //               <Typography
  //                 variant="h6"
  //                 fontWeight={600}
  //                 color="text.primary"
  //                 sx={{
  //                   fontSize: '1.1rem',
  //                   lineHeight: 1.3,
  //                 }}
  //               >
  //                 {program.name}
  //               </Typography>
  //             </Stack>
  //           </Box>
  //           <Stack direction="row" spacing={0.5}>
  //             <Tooltip
  //               title={program.isActive ? 'Pause Program' : 'Activate Program'}
  //             >
  //               <IconButton
  //                 size="small"
  //                 onClick={() => handleToggleActive(program.id)}
  //                 sx={{
  //                   backgroundColor: program.isActive
  //                     ? alpha(theme.palette.primary.main, 0.1)
  //                     : alpha(theme.palette.grey[500], 0.1),
  //                   color: program.isActive
  //                     ? theme.palette.primary.main
  //                     : theme.palette.grey[600],
  //                   '&:hover': {
  //                     backgroundColor: program.isActive
  //                       ? alpha(theme.palette.primary.main, 0.2)
  //                       : alpha(theme.palette.grey[500], 0.2),
  //                   },
  //                 }}
  //               >
  //                 {program.isActive ? (
  //                   <PauseIcon fontSize="small" />
  //                 ) : (
  //                   <PlayIcon fontSize="small" />
  //                 )}
  //               </IconButton>
  //             </Tooltip>
  //             <Tooltip title="Edit Program">
  //               <IconButton
  //                 size="small"
  //                 onClick={() => handleEditProgram(program.id)}
  //                 sx={{
  //                   backgroundColor: alpha(theme.palette.info.main, 0.1),
  //                   color: theme.palette.info.main,
  //                   '&:hover': {
  //                     backgroundColor: alpha(theme.palette.info.main, 0.2),
  //                   },
  //                 }}
  //               >
  //                 <EditIcon fontSize="small" />
  //               </IconButton>
  //             </Tooltip>
  //             <Tooltip title="Delete Program">
  //               <IconButton
  //                 size="small"
  //                 onClick={() => handleDeleteProgram(program.id)}
  //                 sx={{
  //                   backgroundColor: alpha(theme.palette.error.main, 0.1),
  //                   color: theme.palette.error.main,
  //                   '&:hover': {
  //                     backgroundColor: alpha(theme.palette.error.main, 0.2),
  //                   },
  //                 }}
  //               >
  //                 <DeleteIcon fontSize="small" />
  //               </IconButton>
  //             </Tooltip>
  //           </Stack>
  //         </Stack>

  //         {/* Status and Progress */}
  //         <Stack direction="row" alignItems="center" spacing={2} mb={3}>
  //           <Chip
  //             label={program.isActive ? 'Active' : 'Inactive'}
  //             color={getStatusColor(program)}
  //             size="small"
  //             icon={program.isActive ? <PlayIcon /> : <PauseIcon />}
  //             sx={{
  //               fontWeight: 500,
  //               '& .MuiChip-icon': {
  //                 fontSize: '1rem',
  //               },
  //             }}
  //           />
  //           {program.remainingDays !== undefined && (
  //             <Chip
  //               label={`${program.remainingDays} days left`}
  //               variant="outlined"
  //               size="small"
  //               icon={<TimerIcon />}
  //               sx={{
  //                 borderColor: alpha(theme.palette.warning.main, 0.3),
  //                 color: theme.palette.warning.dark,
  //                 '& .MuiChip-icon': {
  //                   fontSize: '1rem',
  //                 },
  //               }}
  //             />
  //           )}
  //         </Stack>

  //         {/* Progress Bar */}
  //         {program.remainingDays !== undefined && (
  //           <Box mb={3}>
  //             <Stack
  //               direction="row"
  //               justifyContent="space-between"
  //               alignItems="center"
  //               mb={1.5}
  //             >
  //               <Typography
  //                 variant="body2"
  //                 color="text.secondary"
  //                 fontWeight={500}
  //               >
  //                 Progress
  //               </Typography>
  //               <Typography
  //                 variant="body2"
  //                 fontWeight={600}
  //                 color="text.primary"
  //               >
  //                 {program.days - program.remainingDays} / {program.days} days
  //               </Typography>
  //             </Stack>
  //             <LinearProgress
  //               variant="determinate"
  //               value={getProgressPercentage(program)}
  //               sx={{
  //                 height: 6,
  //                 borderRadius: 3,
  //                 backgroundColor: alpha(theme.palette.grey[300], 0.3),
  //                 '& .MuiLinearProgress-bar': {
  //                   borderRadius: 3,
  //                   background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  //                 },
  //               }}
  //             />
  //           </Box>
  //         )}

  //         {/* Next Scheduled Run */}
  //         {program.nextScheduledRun && (
  //           <Stack direction="row" alignItems="center" spacing={1} mb={3}>
  //             <CalendarIcon
  //               fontSize="small"
  //               sx={{
  //                 color: alpha(theme.palette.info.main, 0.7),
  //                 fontSize: '1.1rem',
  //               }}
  //             />
  //             <Typography
  //               variant="body2"
  //               color="text.secondary"
  //               fontWeight={500}
  //             >
  //               Next run:{' '}
  //               {format(program.nextScheduledRun, 'MMM dd, yyyy HH:mm')}
  //             </Typography>
  //           </Stack>
  //         )}

  //         {/* Zones */}
  //         <Box>
  //           <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
  //             <LocationIcon
  //               fontSize="small"
  //               sx={{
  //                 color: alpha(theme.palette.primary.main, 0.7),
  //                 fontSize: '1.1rem',
  //               }}
  //             />
  //             <Typography
  //               variant="body2"
  //               color="text.secondary"
  //               fontWeight={500}
  //             >
  //               Zones ({program.zoneWaterPrograms.length})
  //             </Typography>
  //           </Stack>
  //           <Stack direction="row" flexWrap="wrap" gap={0.8}>
  //             {program.zoneWaterPrograms.map((zone: ZoneWater, index) => (
  //               <Chip
  //                 key={index}
  //                 label={
  //                   zones.find(
  //                     (z: any) => z.relay_id === zone.zoneProgram.zoneId,
  //                   )?.name || zone.zoneProgram.zoneId
  //                 }
  //                 size="small"
  //                 variant="outlined"
  //                 sx={{
  //                   fontSize: '0.75rem',
  //                   fontWeight: 500,
  //                   borderColor: alpha(theme.palette.primary.main, 0.3),
  //                   color: theme.palette.primary.dark,
  //                   '&:hover': {
  //                     backgroundColor: alpha(theme.palette.primary.main, 0.1),
  //                   },
  //                 }}
  //               />
  //             ))}
  //           </Stack>
  //         </Box>
  //       </CardContent>
  //     </Paper>
  //   </Fade>
  // );

  const renderProgramsSection = (
    title: string,
    programs: Program[],
    color: string,
  ) => (
    <Box mb={5}>
      <Stack direction="row" alignItems="center" spacing={2} mb={4}>
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.05)})`,
            border: `1px solid ${alpha(color, 0.2)}`,
          }}
        >
          <ScheduleIcon
            sx={{
              color: color,
              fontSize: 24,
            }}
          />
        </Paper>
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {programs.length} {programs.length === 1 ? 'program' : 'programs'}{' '}
            available
          </Typography>
        </Box>
        <Box flex={1} />
        <Chip
          label={programs.length}
          size="small"
          sx={{
            backgroundColor: alpha(color, 0.1),
            color: color,
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        />
      </Stack>
      {programs.length > 0 ? (
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid item xs={12} sm={6} lg={4} key={program.id}>
              <ProgramCard
                program={program}
                setPrograms={setPrograms}
                zones={zones}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 4,
            border: `2px dashed ${alpha(theme.palette.grey[300], 0.5)}`,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.grey[50], 0.5),
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: alpha(theme.palette.grey[400], 0.7),
              backgroundColor: alpha(theme.palette.grey[50], 0.8),
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.grey[200], 0.5),
              mb: 2,
            }}
          >
            <ScheduleIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          </Box>
          <Typography
            variant="h6"
            color="text.secondary"
            fontWeight={500}
            gutterBottom
          >
            No {title.toLowerCase()} programs
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ opacity: 0.8 }}
          >
            Create your first program to get started with automated irrigation
          </Typography>
        </Paper>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
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
              <WaterIcon sx={{ color: 'white', fontSize: 28 }} />
            </Paper>
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                color="text.primary"
                gutterBottom
              >
                Irrigation Programs
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ opacity: 0.8 }}
              >
                Manage and monitor your automated irrigation systems
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProgram}
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
            Create Program
          </Button>
        </Stack>
      </Paper>

      {/* Error State */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500,
            },
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.grey[50], 0.5),
          }}
        >
          <CircularProgress
            size={48}
            sx={{
              color: theme.palette.primary.main,
              mb: 2,
            }}
          />
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Loading programs...
          </Typography>
        </Paper>
      )}

      {/* Programs Sections */}
      {!isLoading && (
        <>
          {renderProgramsSection(
            'Active Programs',
            activePrograms,
            theme.palette.success.main,
          )}
          {renderProgramsSection(
            'Inactive Programs',
            inactivePrograms,
            theme.palette.grey[500],
          )}
        </>
      )}
    </Box>
  );
}
