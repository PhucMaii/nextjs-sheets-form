import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { ShadowSection } from '../reports/styled';
import { primaryColor } from '@/app/theme/color';
import { minifyNumber } from '@/app/utils/number';
import { BSData } from '@/app/utils/type';

interface IProps {
  type: string;
  beansproutsData?: BSData;
  isMinify: boolean;
}

function CircularProgressWithLabel(props: any) {
    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          transform: `scale(4)`,
          transformOrigin: 'center center',
        }}
      >
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
            sx={{ color: primaryColor, fontSize: 5 }}
          >
            <strong>{`${Math.round(props.value)}%`}</strong>
            <br />
            Revenue
          </Typography>
        </Box>
      </Box>
    );
  }

export default function BSOverview({ type, beansproutsData, isMinify }: IProps) {
  const formattedRevenue = useMemo(() => {
    if (!beansproutsData) {
      return 0;
    }

    if (isMinify) {
      return minifyNumber(beansproutsData.revenue);
    }

    return beansproutsData.revenue;
  }, [isMinify, beansproutsData]);

  return (
    <ShadowSection>
      <Typography color={primaryColor} fontWeight="bold" variant="h6">
        {type}
      </Typography>
      <Grid container mt={2} alignItems="center">
        <Grid item xs={6}>
          <Box display="flex" flexDirection="column" gap={2}>
            <ShadowSection
              sx={{
                backgroundColor: `${primaryColor} !important`,
                color: 'white',
              }}
            >
              <Typography sx={{ fontWeight: 50 }} variant="subtitle1">
                Number of bags
              </Typography>
              <Typography fontWeight="bold" variant="h6">
                {beansproutsData?.quantity || 0} bags
              </Typography>
            </ShadowSection>
            <ShadowSection
              sx={{
                backgroundColor: `${primaryColor} !important`,
                color: 'white',
              }}
            >
              <Typography sx={{ fontWeight: 50 }} variant="subtitle1">
                Revenue ($)
              </Typography>
              <Typography fontWeight="bold" variant="h6">
                {formattedRevenue}
              </Typography>
            </ShadowSection>
          </Box>
        </Grid>
        <Grid item xs={6} textAlign="center">
          <CircularProgressWithLabel
            value={beansproutsData?.percentage || 0}
          />
        </Grid>
      </Grid>
    </ShadowSection>
  );
}
