import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Chip,
  Grid,
  useTheme,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Water as WaterIcon,
} from '@mui/icons-material';
import { Program } from '../types';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useQuery } from '@tanstack/react-query';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';
import ProgramCard from './ProgramCard';
import { ShowNotificationType } from '@/hooks/useNotification';

interface IProps {
  showNotification: ShowNotificationType;
}

export default function Programs({ showNotification }: IProps) {
  const router = useRouter();
  const { companyId }: any = useParams();

  const {
    data: fetchedPrograms,
    isLoading,
    refetch: refetchPrograms,
  } = useQuery({
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

  const handleAddProgram = () => {
    // Navigate to create program page
    router.push(`/admin/${companyId}/farm/program/create`);
  };

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
                zones={zones}
                showNotification={showNotification}
                refetchPrograms={refetchPrograms}
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
