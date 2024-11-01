'use client';
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import { Box, Divider, Tab, Tabs, Typography } from '@mui/material'
import { blueGrey, grey } from '@mui/material/colors';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StockChart from '../components/Charts/StockChart';
import { ShadowSection } from '../reports/styled';
import StockItems from '../components/Inventory/StockItems';
import OrderStock from '../components/Inventory/OrderStock';

export default function InventoryPage() {
    const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <Sidebar>
        <Typography variant="h5" color={blueGrey[800]}>Inventory</Typography>
        <Divider sx={{my: 2}} />

        <Box display="flex" alignItems="center" gap={4} >
            <Box p={2}>
                <Box display="flex" gap={2} flexDirection="column">
                    <Box display="flex" gap={1} alignItems="center">
                        <MonetizationOnIcon sx={{fontSize: 30}} color="primary"/>
                        <Typography variant="subtitle2" fontWeight="bold" color={grey[500]}>TOTAL ASSET VALUE</Typography>
                    </Box>

                    <Typography variant="h3">$10,000,000</Typography>
                </Box>
            </Box>

            <Divider orientation='vertical' />

            <Box display="flex" gap={2} flexDirection="column">
                <Typography variant="h6" fontWeight="bold" >42 Products</Typography>
                <StockChart />
            </Box>
        </Box>

        <Tabs sx={{borderBottom: 1, borderColor: 'divider'}} value={tabIndex} onChange={(e, index) => setTabIndex(index)}>
            <Tab label="Inventory" value={0} />
            <Tab label="Order Stock" value={1} />
        </Tabs>

        <ShadowSection>
            {
                tabIndex === 0 ? (<StockItems />) : (<OrderStock />)
            }
        </ShadowSection>

    </Sidebar>
  )
}
