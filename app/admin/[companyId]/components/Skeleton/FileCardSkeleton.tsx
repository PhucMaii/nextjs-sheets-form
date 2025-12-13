import { Card, CardContent, Skeleton, Stack, Box } from '@mui/material';
import React from 'react';
import { alpha } from '@mui/material/styles';
import { neutral } from '@/theme/color';

// File Card Skeleton Component
const FileCardSkeleton = () => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: `1px solid ${alpha(neutral[300], 0.5)}`,
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      {/* Preview Section Skeleton */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={220}
        sx={{ bgcolor: neutral[100] }}
      />

      {/* Content Section Skeleton */}
      <CardContent sx={{ flex: 1, p: 2 }}>
        <Stack spacing={1.5}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={20} />
        </Stack>

        {/* Action Buttons Skeleton */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${alpha(neutral[300], 0.5)}`,
          }}
        >
          <Skeleton variant="rectangular" width="100%" height={36} />
          <Skeleton variant="rectangular" width={36} height={36} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileCardSkeleton;
