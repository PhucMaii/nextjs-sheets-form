import { Box, Typography } from '@mui/material'
import { red } from '@mui/material/colors'
import Image from 'next/image'
import React from 'react'

export default function HolidayText() {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{backgroundColor: red[700], p: 1.5, borderRadius: 2}}>
        <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant='h6' sx={{color: 'white'}} fontWeight="bold">
                Wishing you a joyous holiday season!🎄🎄🎄
            </Typography>  
            <Typography sx={{color: 'white'}}>
                Our office will be closed on Dec 25th and Jan 1st
            </Typography>    
        </Box>
        <Image src="/images/holiday/christmas.jpeg" alt="holiday" width={100} height={100} style={{borderRadius: 20}}/>
    </Box>
  )
}
