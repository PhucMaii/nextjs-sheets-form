import React from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import { Typography } from '@mui/material'
import { blueGrey } from '@mui/material/colors'

export default function Expense() {
  return (
    <Sidebar>
        <Typography variant="h5" fontWeight="bold" color={blueGrey[800]}>Manage Expense</Typography>
        
    </Sidebar>
  )
}
