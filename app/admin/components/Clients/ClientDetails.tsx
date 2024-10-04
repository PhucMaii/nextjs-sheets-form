import { Box, IconButton, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SelectDateRange from '../SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL,  } from '@/app/utils/enum';
import ClientDetailsContent from './ClientDetailsContent';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps {
    clientData: any;
    onClose: () => void;
}

export default function ClientDetails({clientData, onClose}: IProps) {
    const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [orders, _mutateOrders, isValidating] = SWRFetchData(`${API_URL.ADMIN}/clients/orders?userId=${clientData.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`);

    useEffect(() => {
        if (isValidating && !orders) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    });

  return (
    <Box>
        <Box 
            display={'flex'} 
            gap={1} 
            alignItems={'center'} 
            justifyContent={'space-between'} 
            p={2}
            mb={2}
            pr={6}
            sx={{boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'}}
        >
            <IconButton onClick={onClose}>
                <ArrowBackIcon fontSize="medium" />
            </IconButton>
            <Box>
                <Typography variant="h5" color={blueGrey[800]} textAlign={'right'}>
                    {clientData.clientName}
                </Typography>
                <Typography variant="subtitle1" color={blueGrey[200]} textAlign={'right'}>
                    {clientData.clientId}
                </Typography>
            </Box>
        </Box>

        <Box display={'flex'} justifyContent={'flex-end'} m={2} px={4}>
            <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </Box>

        {isLoading ? <LoadingComponent /> : <ClientDetailsContent orders={orders?.data || []} dateRange={dateRange} />}
    </Box>
  )
}
