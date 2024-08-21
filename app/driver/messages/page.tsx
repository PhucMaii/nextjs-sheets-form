import React from 'react'
import Sidebar from '../components/Sidebar'
import { Box, Typography } from '@mui/material'
import MessageSummary from '../components/MessageSummary'

export default function MessagesPage() {
  return (
    <Sidebar>
        <Typography variant="h6" textAlign="center">Messages</Typography>

        <Box display="flex" flexDirection="column" gap={2} marginTop={2}>
            <MessageSummary />
            <MessageSummary />
            <MessageSummary />
            <MessageSummary />    
        </Box>
    </Sidebar>
  )
}
