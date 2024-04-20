import { UserType } from '@/app/utils/type';
import React, { forwardRef } from 'react';
import { Order } from '../orders/page';
import { Box, Grid, Typography } from '@mui/material';
import { YYYYMMDDFormat } from '@/app/utils/time';

interface PropTypes {
    client: UserType;
    orders: Order[];
}

export const InvoicePrint = forwardRef(({ client, orders }: PropTypes, ref: any) => {
    const today = new Date();
    const todayString = YYYYMMDDFormat(today);
    return (
        <div ref={ref}>
            <Box p={3}>
                <Grid container alignItems="flex-start">
                    <Grid item xs={4} container rowGap={1}>
                        <Typography variant="h6" fontWeight="bold">Supreme Sprouts Ltd.</Typography>
                        <Typography variant="subtitle1">Unit 1 - 6420 Beresford Street</Typography>
                        <Typography variant="subtitle1">Unit 1 - 6420 Beresford Street</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                        <Typography variant="h4">STATEMENT</Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                        <Typography     variant="subtitle2" fontWeight="bold">
                            Statement Date
                        </Typography>
                        <Typography>{todayString}</Typography>
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
})