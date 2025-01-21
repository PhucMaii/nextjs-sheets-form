'use client';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import NavbarWrapper from '@/app/lib/NavbarWrapper'
import { generateImgUrl } from '@/app/lib/s3';
import { API_URL } from '@/app/utils/enum';
import { IItemPreference } from '@/app/utils/type';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import useNotification from '@/hooks/useNotification';
import { Box, Button, Grid, MenuItem, Select, Typography } from '@mui/material'
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function ItemPage() {
    const { itemId }: any = useParams();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [itemData, setItemData] = useState<IItemPreference | null>(null);

    const { showNotification, NotificationComp } = useNotification();

    useEffect(() => {
        fetchItemData();
    }, []);

    const fetchItemData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_URL.PUBLIC}/products/${itemId}`);

            if (response.data.error) {
                showNotification('error', response.data.error);
                setIsLoading(false)
                return;
            }

            setItemData(response.data.data);
            showNotification('success', response.data.message);
            setIsLoading(false);
        } catch (err: any) {
            showNotification(
                'error',
                `Internal Server Error: ${err?.response?.data?.error || 'An error occurred'}`,
            );
            console.log('Internal Server Error: ', err);
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <NavbarWrapper setIsOpenSignUp={() => {}}>
                <LoadingComponent />
            </NavbarWrapper>
        )
    }

  return (
    <NavbarWrapper setIsOpenSignUp={() => {}}>
        {NotificationComp}
        <Box sx={{maxWidth: '1500px', mx: 'auto'}}>
            <Grid container>
                <Grid item xs={12} md={6} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <img src={itemData?.image && generateImgUrl(itemData?.image)} alt={itemData?.inventoryItem.name} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" flexDirection="column">
                        <Typography variant="h5" fontWeight="medium" sx={{mb: 2, color: landingPagePrimaryColor}}>
                            {itemData?.inventoryItem.name}
                        </Typography>

                        <Typography variant="h3" fontWeight="bold" sx={{mb: 2, color: landingPagePrimaryColor}}>
                            ${itemData?.price}
                        </Typography>

                        <Grid container alignItems="center" columnSpacing={2}>
                            <Grid item xs={12} md={2}>
                                <Select sx={{maxHeight: '50px', overflowY: 'scroll', }}>
                                    {
                                        // Create an array from 1 to 30
                                        Array.from({length: 30}, (_, index) => index + 1).map((quantity) => (
                                            <MenuItem value={quantity} key={quantity}>
                                                {quantity}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                                {/* <TextField
                                    size="small"
                                    type="number"
                                    sx={{
                                        '&.MuiTextField-root': {
                                            backgroundColor: 'white',    
                                            borderRadius: '20px',
                                            mb: 2,
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position='start'>
                                                <RemoveIcon />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <AddIcon />
                                            </InputAdornment>
                                        )
                                    }}
                                /> */}
                            </Grid>
                            <Grid item xs={12} md={10}>
                                <Button fullWidth variant="contained" sx={{mt: 2, color: 'white', backgroundColor: landingPagePrimaryColor, borderRadius: '20px'}}>
                                    Add to Cart
                                </Button>
                            </Grid>    
                        </Grid>
                            
                    </Box>
                </Grid>
            </Grid>
        </Box>
    </NavbarWrapper>
  )
}
