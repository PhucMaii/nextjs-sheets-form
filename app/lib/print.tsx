import { Typography } from '@mui/material';

import { Box } from '@mui/material';

export const header = (order: any = null) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ width: '100%' }}
    >
      {order && (
        <Typography variant="h6" fontWeight="bold">
          {order.isReplacement
            ? 'REPLACEMENT ORDER'
            : order.isVoid
              ? 'VOID ORDER'
              : ''}
        </Typography>
      )}
      <Typography textAlign="center" variant="h4" fontWeight="bold">
        SUPREME SPROUTS LTD
      </Typography>
      <Typography textAlign="center" variant="h5">
        1-6420 Beresford Street, Burnaby, BC, V5E 1B3
      </Typography>
      <Typography variant="h5">
        778 789 1060
        <br />
        709 989 6000
      </Typography>
    </Box>
  );
};
