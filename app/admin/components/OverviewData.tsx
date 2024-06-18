import React from 'react'
import OverviewCard from '../components/OverviewCard/OverviewCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LoopIcon from '@mui/icons-material/Loop';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { blue } from '@mui/material/colors';
import { Grid } from '@mui/material';

interface IProps {
    overviewData: any;
}

export default function OverviewData({
    overviewData,
}: IProps) {

  return (
    <>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<ReceiptLongIcon sx={{ color: blue[800], fontSize: 50 }} />}
          text="Total Orders"
          backgroundColor={blue[800]}
          iconBackground={blue[50]}
          textColor="white"
          value={overviewData?.numberOfOrders || 0}
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
          value={overviewData?.ongoingOrders || 0}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <OverviewCard
          icon={<MoneyOffIcon sx={{ color: blue[800], fontSize: 50 }} />}
          text="Unpaid Amount"
          backgroundColor={blue[800]}
          iconBackground={blue[50]}
          textColor="white"
          value={overviewData?.unpaidAmount?.toFixed(2) || 0}
        />
      </Grid>
    </>
  );
}
