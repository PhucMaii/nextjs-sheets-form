'use client';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
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
    individualInvoice: null,
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
    isOldInvoice: boolean = true,
  ) => {
    setLoading({
      month: fileName,
      isLoading: true,
      individualInvoice: null,
    });

    try {
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
          isOldInvoice,
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      showNotification('success', 'Statement downloaded successfully');
    } catch (error) {
      console.error('Error downloading statement:', error);
      showNotification('error', 'Failed to download statement');
    } finally {
      setLoading({
        month: null,
        isLoading: false,
        individualInvoice: null,
      });
    }
  };

  const donwloadInvoices = async (orders: any, fileName: string) => {
    setLoading({
      month: null,
      isLoading: false,
      invoices: fileName,
    });

    try {
      const response = await fetch('/api/generate-pdf/order-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders,
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      showNotification('success', 'Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showNotification('error', 'Failed to download invoice');
    } finally {
      setLoading({
        month: null,
        isLoading: false,
        invoices: null,
      });
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', color: blueGrey[800], mb: 1 }}
        >
          Statements & Invoices
        </Typography>
        <Typography variant="body1" sx={{ color: grey[600] }}>
          Download your monthly statements or individual invoices
        </Typography>
      </Box>

      {/* Current Month Statement */}
      {lastMonth && (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <DescriptionIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'semibold', color: blueGrey[800] }}
                >
                  Current Month Statement
                </Typography>
                <Typography variant="body2" sx={{ color: grey[600] }}>
                  {lastMonth.title} • {currentMonthOrders?.length || 0} orders
                </Typography>
              </Box>
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                alignItems: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                  ${lastMonth?.totalPrice?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant="body2" sx={{ color: grey[600] }}>
                  Total amount for {lastMonth.title}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={
                  loading.isLoading && loading.month === lastMonth?.title ? (
                    <CircularProgress color="inherit" size={16} />
                  ) : (
                    <DownloadIcon />
                  )
                }
                onClick={() =>
                  downloadPDF(
                    currentMonthOrders,
                    `Statement-${lastMonth?.title}`,
                  )
                }
                disabled={loading.isLoading}
                sx={{
                  minWidth: { xs: '100%', sm: 160 },
                }}
              >
                Statement
              </Button>
            </Box>

            {/* Individual Invoices Section */}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <ReceiptIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: 'semibold', color: blueGrey[800] }}
              >
                Individual Invoices
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: grey[600], mb: 2 }}>
              Download individual invoices for each order in {lastMonth.title}
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  // Download all individual invoices for current month
                  donwloadInvoices(currentMonthOrders, `Invoices-${lastMonth?.title}`);
                }}
                disabled={loading.isLoading || loading.invoices === `Invoices-${lastMonth?.title}`}
                sx={{
                  alignSelf: 'flex-start',
                  minWidth: 160,
                }}
                fullWidth
              >
                Invoices
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Previous Months */}
      {sortedLatestGroupOrders.length > 0 && (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'semibold', color: blueGrey[800], mb: 2 }}
            >
              Previous Months
            </Typography>

            <Stack spacing={2}>
              {sortedLatestGroupOrders.map((monthYear, index) => {
                const orders = prevStatements[monthYear];
                const totalAmount = orders.reduce(
                  (acc: number, order: any) => acc + order.totalPrice,
                  0,
                );

                return (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${grey[200]}`,
                      '&:hover': { bgcolor: grey[50] },
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        mb: 1,
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 2, sm: 0 },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <PictureAsPdfIcon sx={{ color: blueGrey[600] }} />
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'medium' }}
                          >
                            {monthYear}
                          </Typography>
                          <Typography variant="body2" sx={{ color: grey[600] }}>
                            {orders.length} orders • ${totalAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{width: '100%'}} display="flex" gap={1} alignItems="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={
                            loading.isLoading && loading.month === monthYear ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DownloadIcon />
                            )
                          }
                          onClick={() =>
                            downloadPDF(orders, `Statement-${monthYear}`)
                          }
                          disabled={loading.isLoading}
                          fullWidth
                        >
                          Statement
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => donwloadInvoices(orders, `Invoices-${monthYear}`)}
                          disabled={loading.isLoading || loading.invoices === `Invoices-${monthYear}`}
                          fullWidth
                        >
                          Invoices
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Sidebar>
  );
}
