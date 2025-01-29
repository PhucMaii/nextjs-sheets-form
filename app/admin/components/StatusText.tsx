import { USER_CATEGORIZED } from '@/app/utils/enum';
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
  text?: string;
  type: string;
  backgroundColor?: string;
  icon?: React.ReactNode;
}

interface TextColorType {
  backgroundColor: string;
  color: string;
}

export const formatClientType = (type: string) => {
  if (type === USER_CATEGORIZED.GOLD) {
    return type + '🥇';
  } else if (type === USER_CATEGORIZED.SILVER) {
    return type + '🥈';
  } else if (type === USER_CATEGORIZED.BRONZE) {
    return type + '🥉';
  } else {
    return type;
  }
};

export default function StatusText({
  text,
  type,
  icon,
  backgroundColor,
}: PropTypes) {
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
    } else if (type === 'info') {
      setTextColor({
        backgroundColor: infoBackground,
        color: infoColor,
      });
    } else if (type === 'warning') {
      setTextColor({
        backgroundColor: warningBackground,
        color: warningText,
      });
    } else if (type === 'error') {
      setTextColor({
        backgroundColor: errorBackground,
        color: errorText,
      });
    } else {
      setTextColor({
        backgroundColor: backgroundColor || '',
        color: type,
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
        {text ? text : null}
      </Typography>
    </Box>
  );
}
