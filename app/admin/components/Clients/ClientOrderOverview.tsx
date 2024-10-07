import { Grid } from '@mui/material';
import React, { useMemo } from 'react';
import OverviewCard from '../OverviewCard/OverviewCard';
import { primary } from '@/theme/color';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { ORDER_STATUS } from '@/app/utils/enum';
import useFilterOrders from '@/hooks/useFilterOrders';

interface IProps {
    clientOrders: any;
    startDate: Date;
    endDate: Date;
}

export default function ClientOrderOverview({clientOrders, startDate, endDate}: IProps) {
    const dateDifference = useMemo(() => {
        const difInMs = endDate.getTime() - startDate.getTime();
        
        const diffInDays = Math.floor(difInMs / (1000 * 60 * 60 * 24)) + 1;
        
        return diffInDays;
    }, [startDate, endDate]);

    const averageOrders = useMemo(() => {
        if (dateDifference < 7 || clientOrders.length < 7) {
            return clientOrders.length;
        }

        const numberOfWeeks = Math.floor(dateDifference / 7);
        return Math.floor(clientOrders.length / numberOfWeeks);
    }, [clientOrders, startDate, endDate]);

    const totalSpend = useMemo(() => {
        return clientOrders.reduce((acc: number, order: any) => {
            return acc + order.totalPrice;
        }, 0);
    }, [clientOrders, startDate, endDate]);

    const averageSpend = useMemo(() => {
        if (dateDifference < 7 || clientOrders.length < 7) {
            return totalSpend;
        }

        const numberOfWeeks = Math.floor(dateDifference / 7);
        return Math.floor(totalSpend / numberOfWeeks);


    }, [clientOrders, startDate, endDate]);

    const paidOrders = useFilterOrders(clientOrders, [ORDER_STATUS.COMPLETED]);

    const paidAmount = useMemo(() => {
        return paidOrders.reduce((acc: number, order: any) => {
            return acc + order.totalPrice;
        }, 0);
    }, [paidOrders]);

    const unpaidOrders = useFilterOrders(clientOrders, [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED]);

    const unpaidAmount = useMemo(() => {
        return unpaidOrders.reduce((acc: number, order: any) => {
            return acc + order.totalPrice;
        }, 0);
    }, [unpaidOrders]);

  return (
    <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
            <OverviewCard
                icon={<ReceiptLongIcon fontSize='large' color={'primary'}/>}
                text="Average Orders"
                value={averageOrders}
                backgroundColor={primary.lightest}
                textColor={primary.main}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <OverviewCard 
                icon={<PriceChangeIcon fontSize='large' color={'primary'}/>}
                text="Average Spend"
                value={averageSpend}
                backgroundColor={primary.lightest}
                textColor={primary.main}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <OverviewCard 
                icon={<PaidIcon fontSize='large' color={'primary'}/>}
                text="Paid Amount"
                value={paidAmount}
                backgroundColor={primary.lightest}
                textColor={primary.main}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <OverviewCard 
                icon={<MoneyOffIcon fontSize='large' color={'primary'}/>}
                text="Unpaid Amount"
                value={unpaidAmount}
                backgroundColor={primary.lightest}
                textColor={primary.main}
            />
        </Grid>
    </Grid>

  )
}
