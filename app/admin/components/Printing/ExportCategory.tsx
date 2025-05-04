import { Box, Typography } from '@mui/material'
import React, { forwardRef } from 'react'

const ExportCategory = forwardRef(({ category, to }: any, ref: any) => {
  return (
    <div ref={ref}>
      {/* Header */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
        <img 
          src="/images/logo.png"
          alt="Supreme Sprouts Ltd."
          width={100}
          height={100}
        />
        <Typography variant="h3">Supreme Sprouts Ltd.</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
        <Typography variant="h6">To: {to}</Typography>
        <Typography variant="h6">Export date: {new Date().toLocaleDateString()}</Typography>
      </Box>
      {/* Items */}
      
    </div>
  )
})

export default ExportCategory;