import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineContent } from '@mui/lab'
import { Typography } from '@mui/material'
import React from 'react'

export default function OrderTimeline() {
  return (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot />
        </TimelineSeparator>
        <TimelineContent>
          <Typography variant="body1">
            Order Placed
          </Typography>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  )
}
