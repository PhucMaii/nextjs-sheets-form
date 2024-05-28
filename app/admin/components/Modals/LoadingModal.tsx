import { SplashScreen } from '@/app/HOC/AuthenGuard';
import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Modal,
  Typography,
} from '@mui/material';
import React from 'react';

interface PropTypes {
  open: boolean;
  progress?: number;
}

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function LoadingModal({ open, progress }: PropTypes) {
  return (
    <Modal open={open}>
      {progress ? (
        <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
          <CircularProgressWithLabel value={progress} />
        </div>
      ) : (
        <SplashScreen />
      )}
    </Modal>
  );
}
