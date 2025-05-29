'use client';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { ShadowSection } from '../../admin/[companyId]/reports/styled';
import { blueGrey, grey } from '@mui/material/colors';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { UserContext } from '../../context/UserContextAPI';
import useNotification from '@/hooks/useNotification';

export default function StatementPage() {
  const [currentMonthOrders, setCurrentMonthOrders] = useState<any[]>([]);
  const [prevStatements, setPrevStatements] = useState<any>({});
  const [debtData, setDebtData] = useState<any>(null);
  const [loading, setLoading] = useState<any>({
    month: null,
    isLoading: false,
  });

  const { showNotification, NotificationComp } = useNotification({
    vertical: 'top',
    horizontal: 'right',
  });

  const { user } = useContext(UserContext);

  const lastMonth = useMemo(() => {
    if (currentMonthOrders.length === 0) {
      return null;
    }

    const month = currentMonthOrders[0].deliveryDate.split('/')[0];
    const year = currentMonthOrders[0].deliveryDate.split('/')[2];

    const totalPrice = currentMonthOrders.reduce((acc: number, order: any) => {
      return acc + order.totalPrice;
    }, 0);

    return { title: `${month}/${year}`, totalPrice };
  }, [currentMonthOrders]);

  console.log(prevStatements);

  const sortedLatestGroupOrders = useMemo(() => {
    if (!prevStatements) {
      return [];
    }

    return Object.keys(prevStatements).sort((mmyyA: string, mmyyB: string) => {
      const [monthA, yearA] = mmyyA.split('/');
      const [monthB, yearB] = mmyyB.split('/');

      const monthAInt = parseInt(monthA);
      const monthBInt = parseInt(monthB);

      const yearAInt = parseInt(yearA);
      const yearBInt = parseInt(yearB);

      if (yearAInt > yearBInt) {
        return -1;
      }

      if (yearAInt === yearBInt) {
        if (monthAInt > monthBInt) {
          return -1;
        }

        if (monthAInt <= monthBInt) {
          return 0;
        }
      }

      return 0;
    });
  }, [prevStatements]);

  useEffect(() => {
    fetchThisMonthStatements();
  });

  const fetchThisMonthStatements = async () => {
    try {
      const response = await axios.get('/api/statements');

      // console.log(response.data.data);

      if (response.data.error) {
        console.error('Error fetching statements:', response.data.error);
        return;
      }

      setCurrentMonthOrders(response.data.currentMonthOrders);
      setPrevStatements(response.data.previousGroupMonthOrders);
      setDebtData({
        debt: response.data.debtData,
        sortDebt: response.data.sortDebt,
      });
    } catch (error) {
      console.error('Error fetching statements:', error);
    }
  };
  const downloadPDF = async (
    orders: any,
    fileName: string,
    // isOldInvoice: boolean = false,
  ) => {
    setLoading({
      month: fileName,
      isLoading: true,
    });
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: user,
        orders: orders,
        debtData: debtData?.debt,
        sortDebtKeys: debtData?.sortDebt,
        isOldInvoice: true,
      }), // pass whatever data you need
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    setLoading({
      month: null,
      isLoading: false,
    });
    showNotification('success', 'Statement downloaded successfully');
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Typography variant="h5">Statements</Typography>

      <ShadowSection display="flex" flexDirection="column" gap={1}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'semibold', color: blueGrey[800] }}
        >
          Last Month
        </Typography>
        <Grid container alignItems="center">
          <Grid item xs={3}>
            <Typography>{lastMonth?.title}</Typography>
          </Grid>
          <Grid item xs={4}>
            {currentMonthOrders?.length || 0} orders
          </Grid>
          <Grid item xs={4}>
            ${lastMonth?.totalPrice || 0}
          </Grid>
          <Grid item xs={1}>
            {/* <PDFDownloadLink
              document={
                <InvoiceDocument
                  client={currentMonthOrders[0].user}
                  orders={currentMonthOrders}
                  sortDebtKeys={debtData?.sortDebt}
                  debtData={debtData?.debt}
                />
              }
              fileName='invoice.pdf'
            > */}
            <IconButton
              color="primary"
              onClick={() =>
                downloadPDF(currentMonthOrders, `${lastMonth?.title}`)
              }
            >
              {loading.isLoading && loading.month === lastMonth?.title ? (
                <CircularProgress color="inherit" size={16} />
              ) : (
                <DownloadIcon />
              )}
            </IconButton>
            {/* </PDFDownloadLink> */}
          </Grid>
        </Grid>
      </ShadowSection>

      <ShadowSection sx={{ mt: 2, mb: 6 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'semibold', color: blueGrey[800] }}
        >
          Previous Months
        </Typography>

        <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
          {sortedLatestGroupOrders.map((monthYear, index) => {
            return (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  width: '100%',
                  borderRadius: 1,
                  border: `1px solid ${grey[200]}`,
                }}
                key={index}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <PictureAsPdfIcon />
                  <Typography>{monthYear}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>
                    {prevStatements[monthYear].length} orders
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      downloadPDF(prevStatements[monthYear], monthYear)
                    }
                  >
                    {loading.isLoading && loading.month === monthYear ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : (
                      <DownloadIcon />
                    )}
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
}
