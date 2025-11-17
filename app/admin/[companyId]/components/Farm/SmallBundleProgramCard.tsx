import { alpha } from '@mui/material/styles';
import { Avatar, Box, Paper, Stack, Typography, Chip } from '@mui/material';
import React from 'react';
import {
  FolderCopy as FolderCopyIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { theme } from '@/theme';

interface BundleProgram {
  id: number;
  name: string;
  dayPrograms: Array<{
    id: number;
    day: number;
    time: string;
    program: {
      id: number;
      name: string;
      zoneWaterPrograms: any[];
    };
  }>;
}

interface IProps {
  provided: any;
  bundleProgram: BundleProgram;
  isSmall?: boolean;
  onClick?: () => void;
}

export default function SmallBundleProgramCard({
  provided,
  bundleProgram,
  isSmall = false,
  onClick,
}: IProps) {

  // Calculate the total duration and unique days
  const totalDays = Math.max(...bundleProgram.dayPrograms.map((dp) => dp.day));
  const totalPrograms = bundleProgram.dayPrograms.length;

  // Get a consistent color for bundle programs
  const bundleColor = theme.palette.primary.dark;

  return (
    <>
      <Paper
        ref={provided.innerRef}
        {...provided.dragHandleProps}
        {...provided.draggableProps}
        elevation={0}
        onClick={onClick}
        sx={{
          p: 2,
          borderRadius: 2,
          border: `2px solid ${alpha(bundleColor, 0.3)}`,
          backgroundColor: alpha(bundleColor, 0.1),
          minWidth: isSmall ? 180 : 240,
          cursor: 'grab',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${alpha(bundleColor, 0.3)}`,
            borderColor: bundleColor,
            backgroundColor: alpha(bundleColor, 0.15),
          },
          '&:active': {
            cursor: 'grabbing',
            transform: 'translateY(0px)',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              backgroundColor: alpha(bundleColor, 0.2),
              color: bundleColor,
              border: `2px solid ${alpha(bundleColor, 0.3)}`,
            }}
          >
            <FolderCopyIcon />
          </Avatar>
          <Box flex={1}>
            <Typography
              variant="body1"
              fontWeight={600}
              color={bundleColor}
              sx={{ mb: 0.5 }}
            >
              {bundleProgram.name}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                label={`${totalDays} days`}
                size="small"
                sx={{
                  backgroundColor: alpha(bundleColor, 0.1),
                  color: bundleColor,
                  fontSize: '0.75rem',
                  height: 20,
                  '& .MuiChip-icon': {
                    fontSize: 14,
                  },
                }}
              />
              <Chip
                label={`${totalPrograms} programs`}
                size="small"
                sx={{
                  backgroundColor: alpha(bundleColor, 0.1),
                  color: bundleColor,
                  fontSize: '0.75rem',
                  height: 20,
                }}
              />
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              Drag to schedule from start date
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </>
  );
}
