'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Grid } from '@mui/material';
import { Typography } from '@mui/material';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ShadowSection } from '../reports/styled';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction'; //
import dayGridPlugin from '@fullcalendar/daygrid';
import '../../../styles/fullCalendar.css';
import FixedTransactionDate from '../components/FixedTransactionDate';
import AddFixedTransaction from '../components/Modals/add/AddFixedTransaction';
import useNotification from '@/hooks/useNotification';
import { IFixedTransaction } from '@/app/utils/type';
import { fetchApi } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
export default function FixedTransactionsPage() {
  const [isOpenAddFixedTransaction, setIsOpenAddFixedTransaction] =
    useState<boolean>(false);
  const [fixedTransactions, setFixedTransactions] = useState<
    IFixedTransaction[]
  >([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<any>(null);

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    if (dateRange) {
      fetchFixedTransactions();
    }
  }, [dateRange]);

  const fetchFixedTransactions = async () => {
    const data = await fetchApi(
      `${API_URL.ADMIN}/fixed-transactions?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
      showNotification,
    );
    setFixedTransactions(data?.fixedTransactions || []);
    setTransactions(data?.transactions || []);
  };

  return (
    <Sidebar>
      {NotificationComp}
      <AddFixedTransaction
        open={isOpenAddFixedTransaction}
        onClose={() => setIsOpenAddFixedTransaction(false)}
        showNotification={showNotification}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Fixed Transactions</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsOpenAddFixedTransaction(true)}
        >
          + New Transaction
        </Button>
      </Box>

      {/* Overview Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard
            text="Total Fixed Transactions"
            value={10}
            icon={
              <AttachMoneyIcon
                sx={{ fontSize: '2rem', color: 'primary.main' }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard
            text="Total Fixed Transactions"
            value={10}
            icon={
              <AttachMoneyIcon
                sx={{ fontSize: '2rem', color: 'primary.main' }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard
            text="Total Fixed Transactions"
            value={10}
            icon={
              <AttachMoneyIcon
                sx={{ fontSize: '2rem', color: 'primary.main' }}
              />
            }
          />
        </Grid>
      </Grid>

      <ShadowSection>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          datesSet={(arg) => {
            const viewStart = new Date(arg.view.currentStart);

            const firstDayOfMonth = new Date(
              viewStart.getFullYear(),
              viewStart.getMonth(),
              1,
            );
            const lastDayOfMonth = new Date(
              viewStart.getFullYear(),
              viewStart.getMonth() + 1,
              0,
            );

            setDateRange([firstDayOfMonth, lastDayOfMonth]);
          }}
          // events={[
          //     { title: 'event 1', date: '2025-05-01' },
          //     { title: 'event 2', date: '2025-05-02' }
          //   ]}
          dateClick={(params) => {
            console.log(params);
          }}
          dayCellContent={(params) => {
            const date = YYYYMMDDFormat(params.date);
            const dateFixedTransactions = fixedTransactions.filter(
              (transaction: any) => {
                return (
                  transaction.initialDueDate === date ||
                  transaction.nextDueDate === date
                );
              },
            );

            const dateTransactions = transactions.filter((transaction: any) => {
              return transaction.date === date;
            });

            return (
              <FixedTransactionDate
                params={params}
                fixedTransactions={dateFixedTransactions}
                transactions={dateTransactions}
              />
            );
          }}
        />
      </ShadowSection>
    </Sidebar>
  );
}
