import { landingPagePrimaryColor, landingPageSecondaryColor } from '@/constant/landingPage'
import { Box, Button, Grid, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import Image from 'next/image'
import React from 'react'

export default function Header() {
  return (
    <Grid container alignItems="center" px={4} mt={2}>
        <Grid item xs={12} md={6}>
            <Box display="flex" flexDirection="column" gap={2}>
                <Typography variant="h2" fontWeight="bold">
                    Freshness You Can Trust, Prices You'll Love
                </Typography>
                <Typography variant="h5" fontWeight="normal" sx={{color: grey[600], lineHeight: 1.5}}>
                    Delivering farm-fresh produce with unmatched quality at competitive prices, tailored for your business needs.
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button variant="contained" sx={{width: 'fit-content', fontSize: 'large', backgroundColor: landingPagePrimaryColor, px: 3, py: 2, ":hover": {backgroundColor: landingPageSecondaryColor}}}>
                        Join Us Today
                    </Button>
                    <Button variant="outlined" sx={{width: 'fit-content', fontSize: 'large', color: landingPagePrimaryColor, px: 3, py: 2, ":hover": {backgroundColor: landingPageSecondaryColor, color: 'white'}}}>
                        Learn More
                    </Button>
                </Box>
            </Box>
        </Grid>
        <Grid item xs={12} md={6} textAlign="center">
            <Image src="/images/landing/person_delivery.jpeg" alt="header" width={300} height={400} style={{borderRadius: 50}} priority={true} sizes="100vw" />
        </Grid>
    </Grid>
  )
}
