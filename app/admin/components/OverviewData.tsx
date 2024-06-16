import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import OverviewCard from '../components/OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LoopIcon from '@mui/icons-material/Loop';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { blue } from '@mui/material/colors';
import { Grid } from '@mui/material';
import { API_URL } from '@/app/utils/enum';
import { Notification } from '@/app/utils/type';
import axios from 'axios';

interface IProps {
    dateRange: any;
    setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function OverviewData({
    dateRange,
    setNotification,
}: IProps) {
    const [overviewData, setOverviewData] = useState<any>({});

    useEffect(() => {
        if (dateRange) {
          fetchOrders();
        }
    }, [dateRange])

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL.ORDER}/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`);

            if (response.data.error) {
                setNotification({
                    on: true,
                    type: 'error',
                    message: response.data.error
                })
            }

            setOverviewData(response.data.data);
        } catch (error: any) {
            console.log('There was an error: ', error);
            setNotification({
                on: true,
                type: 'error',
                message: error.response.data.error
            })
        }
    } 

  return (
    <>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<ReceiptLongIcon sx={{ color: blue[800], fontSize: 50 }} />}
          text="Total Orders"
          backgroundColor={blue[800]}
          iconBackground={blue[50]}
          textColor="white"
          value={overviewData?.numberOfOrders?.toFixed(2) || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<AttachMoneyIcon sx={{ color: blue[800], fontSize: 50 }} />}
          text="Revenue"
          backgroundColor={blue[800]}
          iconBackground={blue[50]}
          textColor="white"
          value={overviewData?.revenue?.toFixed(2) || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<LoopIcon sx={{ color: blue[800], fontSize: 50 }} />}
          text="Ongoing Orders"
          backgroundColor={blue[800]}
          iconBackground={blue[50]}
          textColor="white"
          value={overviewData?.ongoingOrders?.toFixed(2) || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<MoneyOffIcon sx={{ color: blue[800], fontSize: 50 }} />}
          text="Pending Payments"
          backgroundColor={blue[800]}
          iconBackground={blue[50]}
          textColor="white"
          value={overviewData?.unpaidAmount?.toFixed(2) || 0}
        />
      </Grid>
    </>
  );
}
