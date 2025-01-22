'use client';
import React from 'react'
import NavbarWrapper from '../lib/NavbarWrapper'
import { Box, Button, Grid, Typography } from '@mui/material'
import { landingPagePrimaryColor } from '@/constant/landingPage';
import { ShadowSection } from '../admin/reports/styled';

export default function CartPage() {
    const renderDisplayCartItems = () => {
        return (
            // Header of the table
            <Grid container rowGap={4} columnSpacing={2} alignItems="center">
                <Grid item xs={6}>
                    <Typography fontWeight="bold">Product</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography fontWeight="bold">Price</Typography>
                </Grid>
                <Grid item xs={2} >
                    <Typography fontWeight="bold">Quantity</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography fontWeight="bold">Total Price</Typography>
                </Grid>

                {/* Body of the table */}
                <Grid item xs={6}>
                    <Box display="flex" gap={2} alignItems="center">
                        <img style={{width: '150px', height: '100%', objectFit: 'contain'}} src="https://media.istockphoto.com/id/953466314/photo/mung-bean-sprouts-isolated-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=MUOVjJpE6C7wNJhEog0R9RQ1YKi9VoItCbzI_Hzyj70=" alt="" />
                        <Typography variant="h6">BEAN 5 LB</Typography>
                    </Box>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="h6" fontWeight="bold">$5.50</Typography>
                </Grid>
                <Grid item xs={2} textAlign="center">
                    <Box display="flex" gap={1} alignItems="center">
                        <Button variant="outlined" sx={{borderRadius: 1, width: '30px', height: '30px', p: 0, minWidth: 0, border: '1px solid black'}}>
                            -
                        </Button>
                        <Typography variant="h6" fontWeight="normal">2</Typography>
                        <Button variant="outlined" sx={{borderRadius: 1, width: '30px', height: '30px', p: 0, minWidth: 0, border: '1px solid black'}}>
                            +
                        </Button>

                    </Box>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="h6" fontWeight="bold" sx={{color: landingPagePrimaryColor}}>$11.00</Typography>
                </Grid>
            </Grid>
        )
    }


  return (
    <NavbarWrapper setIsOpenSignUp={() => {}}>
        <Grid container sx={{maxWidth: '1500px', mx: 'auto', p: 4}}>
            <Grid item xs={12} md={8}>
                <Typography variant="h5" fontWeight="bold" sx={{color: landingPagePrimaryColor}}>
                    Your cart
                </Typography>
                <ShadowSection sx={{mt: 2}}>
                    {/* <Grid container>
                        <Grid item xs={4}>
                            <Typography fontWeight="bold">Product</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography fontWeight="bold">Price</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography fontWeight="bold">Quantity</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography fontWeight="bold">Total Price</Typography>
                        </Grid>
                    </Grid> */}
                    {renderDisplayCartItems()}
                </ShadowSection>
            </Grid>
        </Grid>
    </NavbarWrapper>
  )
}
