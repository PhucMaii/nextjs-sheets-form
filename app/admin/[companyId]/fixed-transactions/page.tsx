'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, Grid } from '@mui/material';
import { Typography } from '@mui/material';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { ShadowSection } from '@/app/admin/[companyId]/reports/styled';
import FullCalendar from '@fullcalendar/react';
import interactionPlugin from '@fullcalendar/interaction'; //
import dayGridPlugin from '@fullcalendar/daygrid';
import '../../../../styles/fullCalendar.css';
import FixedTransactionDate from '@/app/admin/[companyId]/components/FixedTransactionDate';
import AddFixedTransaction from '@/app/admin/[companyId]/components/Modals/add/AddFixedTransaction';
import useNotification from '@/hooks/useNotification';
import { IFixedTransaction } from '@/app/utils/type';
import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
import EditFixedTransaction from '@/app/admin/[companyId]/components/Modals/edit/EditFixedTransaction';
import PercentIcon from '@mui/icons-material/Percent';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { useParams } from 'next/navigation';

export default function FixedTransactionsPage() {
  const { companyId }: any = useParams();

  const [addFixedTransactionProps, setAddFixedTransactionProps] = useState<any>(
    {
      open: false,
      defaultDate: null,
    },
  );
  const [dateRange, setDateRange] = useState<any>(null);
  const [editFixedTransactionProps, setEditFixedTransactionProps] =
    useState<any>({
      open: false,
      fixedTransaction: null,
    });
  const [fixedTransactions, setFixedTransactions] = useState<
    IFixedTransaction[]
  >([]);
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    if (dateRange) {
      fetchFixedTransactions();
    }
  }, [dateRange]);

  const fetchFixedTransactions = async () => {
    const data = await fetchApi(
      getAdminApiUrl(
        companyId,
        `/fixed-transactions?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
      ),
      showNotification,
    );
    setFixedTransactions(data?.fixedTransactions || []);
    setTransactions(data?.transactions || []);
    setOverview(data?.overview || null);
  };

  return (
    <Sidebar>
      {NotificationComp}
      <AddFixedTransaction
        open={addFixedTransactionProps.open}
        onClose={() =>
          setAddFixedTransactionProps({
            open: false,
            defaultDate: null,
          })
        }
        showNotification={showNotification}
        defaultDate={addFixedTransactionProps.defaultDate}
        refresh={fetchFixedTransactions}
      />

      {editFixedTransactionProps.fixedTransaction && (
        <EditFixedTransaction
          open={editFixedTransactionProps.open}
          onClose={() =>
            setEditFixedTransactionProps({
              open: false,
              fixedTransaction: null,
            })
          }
          fixedTransaction={editFixedTransactionProps.fixedTransaction}
          showNotification={showNotification}
          refresh={fetchFixedTransactions}
        />
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Fixed Transactions</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            setAddFixedTransactionProps({
              open: true,
              defaultDate: new Date(),
            })
          }
        >
          + New Transaction
        </Button>
      </Box>

      {/* Overview Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard
            text="Total Fixed Transactions"
            value={overview?.totalFixedTransactions || 0}
            icon={
              <AttachMoneyIcon
                sx={{ fontSize: '2rem', color: 'primary.main' }}
              />
            }
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard
            text="Fixed Cost to Total Expense (%)"
            value={overview?.percentageOfExpenses?.toFixed(2) || 0}
            icon={
              <PercentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
            }
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard
            text="Fixed Transactions"
            value={overview?.numberOfFixedTransactions || 0}
            icon={
              <PointOfSaleIcon
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
          // dateClick={(params) => {
          //   console.log(params);
          //   setAddFixedTransactionProps({
          //     open: true,
          //     defaultDate: params.date,
          //   });
          // }}
          dayCellContent={(params) => {
            console.log(params);
            const date = YYYYMMDDFormat(params.date);
            const dateFixedTransactions = fixedTransactions
              .filter((transaction: any) => {
                return (
                  transaction.initialDueDate === date ||
                  transaction.nextDueDate === date
                );
              })
              .map((transaction: any) => {
                return {
                  ...transaction,
                  isGrey: transaction.initialDueDate === date && params.isPast,
                };
              });

            const dateTransactions = transactions
              .filter((transaction: any) => {
                return transaction.date === date;
              })
              .map((transaction: any) => {
                return {
                  ...transaction,
                  defaultAmount: transaction.amount,
                  title:
                    transaction?.description ||
                    transaction?.fixedTransaction?.title,
                  recurrence: transaction?.fixedTransaction?.recurrence,
                };
              });

            return (
              <FixedTransactionDate
                params={params}
                fixedTransactions={dateFixedTransactions}
                transactions={dateTransactions}
                onOpenEditTransaction={(transaction: any) => {
                  setEditFixedTransactionProps({
                    open: true,
                    fixedTransaction: transaction,
                  });
                }}
                onOpenAddTransaction={(defaultDate: string) => {
                  setAddFixedTransactionProps({
                    open: true,
                    defaultDate: defaultDate,
                  });
                }}
              />
            );
          }}
        />
      </ShadowSection>
    </Sidebar>
  );
}
