import { Box, Typography } from '@mui/material';

export default function ProductLossOverview({
    text,
    value,
    icon,
    backgroundColorIcon,
}: {
    text: string;
    value: number | string;
    icon: React.ReactNode;
    backgroundColorIcon: string;
}) {

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Box
        sx={{
          backgroundColor: backgroundColorIcon,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight="normal">
          {text}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
