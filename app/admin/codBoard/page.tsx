'use client';
import React from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import { Box, Button, Typography } from '@mui/material'
import { ShadowSection } from '../reports/styled'
import { blueGrey } from '@mui/material/colors';
import useSelectDate from '@/hooks/useSelectDate';
import CODBoardSummary from '../components/CODBoardSummary';
import AddIcon from '@mui/icons-material/Add';

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
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" color={blueGrey[800]}>Boards</Typography>
                <Button variant="outlined">
                    <Box display="flex" alignItems="center" gap={1}>
                        <AddIcon />
                        <Typography variant="body2" fontWeight={600}>New Board</Typography>
                    </Box>
                </Button>
            </Box>

            <Box display="flex" flexDirection="column" gap={1} mt={2}>
                <CODBoardSummary />
                <CODBoardSummary />
                <CODBoardSummary />

            </Box>
        </Box>
    </Sidebar>
  )
}
