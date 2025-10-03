import React from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import { Typography } from '@mui/material'
import { blueGrey } from '@mui/material/colors'

export default function Farm() {
  return (
    <Sidebar>
      <Typography variant="h5" color={blueGrey[800]}>
        Farm
      </Typography>
    </Sidebar>
  )
}
