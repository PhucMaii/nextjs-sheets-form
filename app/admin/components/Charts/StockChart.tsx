import { Box, Typography } from '@mui/material'
import { green, red, yellow } from '@mui/material/colors';
import React from 'react'

const chartWidth = 300;
export default function StockChart() {
    // On Stock: 20
    // Low Stock: 8
    // Out of Stock: 12
    // Total: 42


  return (
    <Box display="flex" flexDirection="column" gap={1}>
        
        <Box sx={{minWidth: chartWidth}} display="flex" gap={0.5}>
            {/* on stock box */}
            <Box sx={{width: (20 / 42) * 300, backgroundColor: green[700], height: 10, borderRadius: 2}} />

            {/* low stock box */}
            <Box sx={{width: (8 / 42) * 300, backgroundColor: yellow[800], height: 10, borderRadius: 2}} />

            {/* out of stock box */}
            <Box sx={{width: (12 / 42) * 300, backgroundColor: red[700], height: 10, borderRadius: 2}} />
        </Box>

        <Box display="flex" gap={3}>
            <Box display="flex" alignItems="center" gap={1}>
                <Box width={10} height={10} bgcolor={green[700]} borderRadius={2}></Box>
                <Typography variant="body2">On Stock: 20</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
                <Box width={10} height={10} bgcolor={yellow[800]} borderRadius={2}></Box>
                <Typography variant="body2">Low Stock: 8</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
                <Box width={10} height={10} bgcolor={red[700]} borderRadius={2}></Box>
                <Typography variant="body2">Out of stock: 12</Typography>
            </Box>
        </Box>

    </Box>
  )
}
