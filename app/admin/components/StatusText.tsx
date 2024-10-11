import {
  errorBackground,
  errorText,
  infoBackground,
  infoColor,
  successBackground,
  successText,
  warningBackground,
  warningText,
} from '@/theme/color';
import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

export enum COLOR_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info',
  DEFAULT = 'default',
}

interface PropTypes {
  text: string;
  type: string;
  icon?: React.ReactNode;
}

interface TextColorType {
  backgroundColor: string;
  color: string;
}

export default function StatusText({ text, type, icon }: PropTypes) {
  const [textColor, setTextColor] = useState<TextColorType>({
    backgroundColor: '',
    color: '',
  });

  useEffect(() => {
    getColor();
  }, [type]);

  const getColor = () => {
    if (type === 'success') {
      setTextColor({
        backgroundColor: successBackground,
        color: successText,
      });
    }
    if (type === 'info') {
      setTextColor({
        backgroundColor: infoBackground,
        color: infoColor,
      });
    }
    if (type === 'warning') {
      setTextColor({
        backgroundColor: warningBackground,
        color: warningText,
      });
    }
    if (type === 'error') {
      setTextColor({
        backgroundColor: errorBackground,
        color: errorText,
      });
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        ...textColor,
        borderRadius: 2,
        textAlign: 'center',
        py: '5px',
        px: '10px',
        width: 'fit-content',
      }}
    >
      {icon}
      <Typography
      // sx={{
      //   ...textColor,
      //   borderRadius: 2,
      //   textAlign: 'center',
      //   py: '5px',
      //   px: '10px',
      //   width: 'fit-content',
      // }}
      >
        {text}
      </Typography>
    </Box>
  );
}
