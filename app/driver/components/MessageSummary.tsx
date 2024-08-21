import { stringAvatar } from '@/app/utils/avatarProps'
import { Avatar, Box, Divider, Grid, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import React from 'react'

export default function MessageSummary() {
  return (
    <Grid container alignItems="center">
        <Grid item xs={2}>
            <Avatar {...stringAvatar('Bin Mai')}/>
        </Grid>
        <Grid item xs={7}>
            <Box display="flex" flexDirection="column" gap={0.5}>
                <Typography variant="subtitle1" fontWeight="bold">Room Name</Typography>
                <Typography variant="subtitle1" color={grey[600]}>You: Hello, World!</Typography>
            </Box>
        </Grid>
        <Grid item xs={2} textAlign="right">
            <Typography variant="body2" color={grey[600]}>Aug 28</Typography>
        </Grid>
        <Grid item xs={12} marginTop={2}>
            <Divider />
        </Grid>
    </Grid>
  )
}
