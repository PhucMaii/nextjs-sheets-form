'use client';
import React from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import { Box, Typography } from '@mui/material'
import { ShadowSection } from '../reports/styled'
import { blueGrey } from '@mui/material/colors';
import useSelectDate from '@/hooks/useSelectDate';
import CODBoardSummary from '../components/CODBoardSummary';

export default function CodBoard() {
    const { date, SelectDate } = useSelectDate('', true);

  return (
    <Sidebar>
        <Typography variant="h5" color={blueGrey[800]}>C.O.D Board</Typography>
        <ShadowSection>
            <Typography variant="h6" color={blueGrey[800]}>Select date</Typography>
            <Box mt={2}>
                {SelectDate}
            </Box>
        </ShadowSection>

        <Box>
            <Typography variant="h6" color={blueGrey[800]}>Boards</Typography>

            <Box display="flex" flexDirection="column" gap={1} mt={2}>
                <CODBoardSummary />
                <CODBoardSummary />
                <CODBoardSummary />

            </Box>
        </Box>
    </Sidebar>
  )
}
