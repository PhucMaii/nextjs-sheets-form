import { theme } from '@/theme';
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import React, { useMemo } from 'react';
import {
  Water as WaterIcon,
  ViewList as ViewListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { IBundleProgram, IZoneWater } from '@/app/utils/type';
import { IZone } from '@/hooks/useHydrawiseAPI';

interface IProps {
  bundleProgram: IBundleProgram;
  zones: IZone[];
}

function BundleProgramCard({ bundleProgram, zones }: IProps) {
  console.log(bundleProgram);
  const stats = useMemo(() => {
    const highestDay = bundleProgram.dayPrograms.reduce(
      (acc, dayProgram) => Math.max(acc, dayProgram.day),
      0,
    );
    const zones = bundleProgram.dayPrograms.flatMap((dayProgram) =>
      dayProgram.program.zoneWaterPrograms.map(
        (zoneProgram: IZoneWater) => zoneProgram.zoneProgram.zoneId,
      ),
    );
    return {
      programs: highestDay,
      days: highestDay,
      zones: Array.from(new Set(zones)),
    };
  }, [bundleProgram]);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${grey[200]}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(blue[500], 0.15)}`,
          borderColor: alpha(blue[500], 0.3),
        },
      }}
    >
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                sx={{
                  backgroundColor: alpha(blue[500], 0.1),
                  color: blue[500],
                  border: `2px solid ${alpha(blue[500], 0.2)}`,
                  width: 48,
                  height: 48,
                }}
              >
                <WaterIcon />
              </Avatar>
              <Typography
                variant="h6"
                fontWeight={700}
                color="text.primary"
                sx={{ lineHeight: 1.2 }}
              >
                {bundleProgram.name}
              </Typography>
            </Stack>
          </Stack>

          {/* Stats */}
          <Stack direction="row" spacing={3}>
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight={800}
                color="primary"
                sx={{ lineHeight: 1 }}
              >
                {stats.days}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Days
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight={800}
                color={theme.palette.primary.main}
                sx={{ lineHeight: 1 }}
              >
                {stats.programs}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Programs
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography
                variant="h4"
                fontWeight={800}
                color={theme.palette.secondary.main}
                sx={{ lineHeight: 1 }}
              >
                {stats.zones.length}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                Zones
              </Typography>
            </Box>
          </Stack>

          {/* Zones */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              Active Zones
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}
            >
              {stats.zones &&
                stats.zones.map((zoneId: number, index) => (
                  <Chip
                    key={index}
                    label={
                      zones.find((z: IZone) => z.relay_id === zoneId)?.name ||
                      zoneId
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.75rem',
                      height: 24,
                      borderColor: alpha(theme.palette.grey[400], 0.5),
                      color: 'text.secondary',
                    }}
                  />
                ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ opacity: 0.7 }}
        >
          Created {new Date(bundleProgram.createdAt).toLocaleDateString()}
        </Typography>
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ViewListIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: theme.palette.warning.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.warning.main, 0.1),
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardActions>
    </Card>
  );
}

export default BundleProgramCard;
