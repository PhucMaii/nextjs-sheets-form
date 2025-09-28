import { Box, Typography } from '@mui/material'
import React from 'react'

export default function ReassignmentBanner({ordersLength}: {ordersLength: number}) {
  return (
    <Box
      width="100%"
      sx={{
        backgroundColor: 'primary.lightest',
        p: 2,
      }}
    >
        <Typography
          variant="body2"
          fontWeight="semibold"
          sx={{ color: 'primary.main' }}
        >
            📦 {ordersLength} order{ordersLength > 1 ? 's' : ''} reassigned to you. Please check your orders.
        </Typography>
    </Box>
  )
}