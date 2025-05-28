import { Box, Divider, Typography } from '@mui/material'
import { Grid } from '@mui/material'
import { ShadowSection } from '@/app/admin/[companyId]/reports/styled'
import React from 'react'
import { grey } from '@mui/material/colors';
import { IScheduledShift } from '@/app/utils/type';
import { formatTime } from '@/app/utils/number';

interface IProps {
    shift: IScheduledShift;
}

export default function UpcomingShift({shift}: IProps) {
  return (
    <ShadowSection>
        <Grid container spacing={2}>
          <Grid
            item
            xs={8}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography variant="body1" fontWeight={600}>
              {shift.employee.name}
            </Typography>

            <Box
              display="flex"
              flexDirection="column"
              gap={0.5}
              sx={{ width: 'fit-content' }}
            >
              <Typography
                variant="body1"
                sx={{ color: grey[600] }}
                fontWeight={400}
              >
                {formatTime(shift.startedAt || '')} - {formatTime(shift?.endedAt || '')}
              </Typography>
              <Divider />
              <Typography
                variant="body1"
                sx={{ color: grey[600] }}
                fontWeight={400}
              >
                {shift.hours?.toFixed(1)} hours
              </Typography>
            </Box>
          </Grid>
          <Grid
            item
            xs={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body1" fontWeight={400}>
              {shift.role}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              Est: ${shift.cost?.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </ShadowSection>
  )
}
