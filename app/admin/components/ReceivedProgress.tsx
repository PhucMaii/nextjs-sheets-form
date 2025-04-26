import { Box } from '@mui/material';

const ReceivedProgress = ({ receivedQty, rejectedQty, orderedQty }: any) => {
  // const xsDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: 10,
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: '#e0e0e0', // fallback background for unfilled part
      }}
    >
      {/* Received portion */}
      <Box
        sx={{
          width: `${(receivedQty / orderedQty) * 100}%`,
          backgroundColor: '#4caf50', // green for received
          transition: 'width 0.3s ease',
        }}
      />

      {/* Rejected portion */}
      <Box
        sx={{
          width: `${(rejectedQty / orderedQty) * 100}%`,
          backgroundColor: '#f44336', // red for rejected
          transition: 'width 0.3s ease',
        }}
      />
    </Box>
  );
};

export default ReceivedProgress;
