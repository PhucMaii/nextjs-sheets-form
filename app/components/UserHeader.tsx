import { Paper, useTheme, useMediaQuery } from '@mui/material';
import React from 'react';
import { Box, Grid, Typography, Chip } from '@mui/material';

interface IProps {
    title: string;
    subtitle: string;
    chipLabel?: string;
}

export default function UserHeader({
    title,
    subtitle,
    chipLabel
}: IProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        p: isMobile ? 2.5 : 3,
        mb: isMobile ? 1.5 : 2,
        borderRadius: isMobile ? 1.5 : 2,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Box position="relative" zIndex={1}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight="300"
                sx={{
                  mb: 0.5,
                  opacity: 0.9,
                  fontSize: isMobile ? '1rem' : '1.25rem',
                }}
              >
                {title}
              </Typography>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                fontWeight="600"
                sx={{ mb: 1, fontSize: isMobile ? '1.25rem' : '1.5rem' }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Grid>
          {chipLabel && <Grid item xs={12} sm={4}>
            <Box
              display="flex"
              justifyContent={isMobile ? 'flex-start' : 'flex-end'}
              gap={1}
            >
              <Chip
                label={chipLabel}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 500,
                  backdropFilter: 'blur(10px)',
                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                  height: isMobile ? 24 : 28,
                }}
              />
            </Box>
          </Grid>}
        </Grid>
      </Box>
    </Paper>
  );
}
