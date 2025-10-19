import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  useTheme,
  alpha,
  Button,
  Skeleton,
} from '@mui/material';
import { Water as WaterIcon, Add as AddIcon } from '@mui/icons-material';
import useBundleProgram from '@/hooks/db-tables/useBundleProgram';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { IBundleProgram } from '@/app/utils/type';
import { useHydrawiseAPI } from '@/hooks/useHydrawiseAPI';
import BundleProgramCard from './BundleProgramCard';

export default function BundlePrograms() {
  const theme = useTheme();
  const router = useRouter();
  const { companyId }: any = useParams();
  const { getBundlePrograms } = useBundleProgram(companyId);
  const { zones } = useHydrawiseAPI(companyId);

  const { data: bundlePrograms, isLoading } = useQuery({
    queryKey: ['bundlePrograms'],
    queryFn: async () => {
      const data = await getBundlePrograms();
      return data;
    },
    enabled: !!companyId,
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
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
                Bundle Programs
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ opacity: 0.8 }}
              >
                Manage your irrigation program bundles and schedules
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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
            onClick={() =>
              router.push(`/admin/${companyId}/farm/bundle-program/create`)
            }
          >
            Create Bundle
          </Button>
        </Stack>
      </Paper>

      {isLoading ? (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={4}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
          <Grid item xs={12} sm={6} lg={4}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
        </Grid>
      ) : bundlePrograms && bundlePrograms.length > 0 ? (
        <Grid container spacing={3}>
          {bundlePrograms &&
            bundlePrograms?.map((bundleProgram: IBundleProgram) => (
              <Grid item xs={12} sm={6} lg={4} key={bundleProgram.id}>
                <BundleProgramCard
                  bundleProgram={bundleProgram}
                  zones={zones}
                />
              </Grid>
            ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No bundle programs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first bundle program to get started with automated
            irrigation
          </Typography>
        </Box>
      )}

      {/* Bundle Programs Grid */}
    </Box>
  );
}
