import { LoadingButton } from '@mui/lab';
import React from 'react';

export default function LoadingButtonStyles(props: any) {
  const { color, ...rest } = props;
  return (
    <LoadingButton
      variant="contained"
      sx={{
        backgroundColor: `${color} !important`,
        '& .css-1yt7yx7-MuiLoadingButton-loadingIndicator': {
          color: 'white', // Change the color to white
        },
      }}
      {...rest}
    >
      SAVE
    </LoadingButton>
  );
}
