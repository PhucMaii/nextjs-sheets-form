'use client';
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { ShadowSection } from '../../reports/styled';
import OrderedItemsTable from '../../components/Tables/OrderedItemsTable';
import { ArrowBackIos } from '@mui/icons-material';
import StatusText from '../../components/StatusText';
import { grey } from '@mui/material/colors';
import OrderTimeline from '../../components/Timeline/OrderTimeline';

const page = () => {
  return (
    <Sidebar>
      <Box display="flex" gap={1} alignItems="center">
        <IconButton>
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h5">#30402</Typography>
        <StatusText type="success" text="Paid" />
        <StatusText type="warning" text="Unfulfilled" />
      </Box>

      <Grid container spacing={1}>
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ShadowSection>
            <StatusText type="warning" text="Unfulfilled" />
            <Typography variant="subtitle2" fontWeight={700}>
              Products
            </Typography>

            <OrderedItemsTable />
          </ShadowSection>

          <ShadowSection>
            <OrderTimeline />
          </ShadowSection>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <ShadowSection display="flex" flexDirection="column" gap={1}>
            <StatusText type="success" text="Paid" />
            <Typography variant="subtitle2" fontWeight={700}>
              Payment
            </Typography>

            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box
                display="flex"
                gap={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={500}>
                  Discount
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  $100
                </Typography>
              </Box>
              <Box
                display="flex"
                gap={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={500}>
                  Subtotal
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  $100
                </Typography>
              </Box>
              <Box
                display="flex"
                gap={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={500}>
                  GST
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  $100
                </Typography>
              </Box>
              <Box
                display="flex"
                gap={1}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight={500}>
                  PST
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  $100
                </Typography>
              </Box>
              <Box
                display="flex"
                gap={1}
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Typography variant="h6" fontWeight={700}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  $100
                </Typography>
              </Box>
            </Box>
          </ShadowSection>

          <ShadowSection display="flex" flexDirection="column" gap={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Customer
            </Typography>

            <Typography variant="h6" fontWeight={500}>
              John Doe
            </Typography>

            <Typography variant="h6" fontWeight={500}>
              john.doe@example.com
            </Typography>

            <Typography variant="h6" fontWeight={500}>
              +1234567890
            </Typography>

            <Typography
              variant="subtitle2"
              fontWeight={600}
              sx={{ my: 1, color: grey[600] }}
            >
              Delivery Address
            </Typography>

            <Typography variant="h6" fontWeight={500}>
              123 Main St, Anytown, USA
            </Typography>
          </ShadowSection>
        </Grid>
      </Grid>
    </Sidebar>
  );
};

export default page;
