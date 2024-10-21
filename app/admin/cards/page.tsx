'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import SelectDateRange from '../components/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import PaidIcon from '@mui/icons-material/Paid';
import { CardStyled } from '../components/OverviewCard/styled';
import Image from 'next/image';
import { Nfc } from 'lucide-react';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AreaChart from '../components/Charts/AreaChart';
import { ShadowSection } from '../reports/styled';
import TransactionsTable from '../components/Tables/TransactionsTable';
import CardUsedByTable from '../components/Tables/CardUsedByTable';
import AddIcon from '@mui/icons-material/Add';
import AddPaymentMethod from '../components/Modals/add/AddPaymentMethod';
import useNotification from '@/hooks/useNotification';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, PAYMENT_METHOD_TYPE } from '@/app/utils/enum';
import { IPaymentMethod } from '@/app/utils/type';
import PaymentsIcon from '@mui/icons-material/Payments';
import ErrorComponent from '../components/ErrorComponent';

export default function CardManagement() {
  const [currentMethodId, setCurrentMethodId] = useState<number>(-1);
  const [currentMethod, setCurrentMethod] = useState<IPaymentMethod | null>(
    null,
  );
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isOpenAddNewMethod, setIsOpenAddNewMethod] = useState<boolean>(false);

  const { showNotification, NotificationComp } = useNotification();

  // Data Fetching
  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);
  const [transactions] = SWRFetchData(`${API_URL.ADMIN}/expenses?startDate=${dateRange[0]}&endDate=${dateRange[1]}&id=${currentMethodId}`);

  useEffect(() => {
    if (currentMethodId !== -1) {
      setCurrentMethod(getPaymentMethod());
    }
  }, [currentMethodId]);

  const getPaymentMethod = () => {
    if (currentMethodId === -1) {
      return null;
    }
    return paymentMethods?.data.find(
      (method: IPaymentMethod) => method.id === currentMethodId,
    );
  };

  return (
    <Sidebar>
      {NotificationComp}
      <AddPaymentMethod
        open={isOpenAddNewMethod}
        onClose={() => setIsOpenAddNewMethod(false)}
        showNotification={showNotification}
      />

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" fontWeight="bold" color={blueGrey[800]}>
              Cards
            </Typography>
            <IconButton onClick={() => setIsOpenAddNewMethod(true)}>
              <AddIcon />
            </IconButton>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Select
              value={currentMethodId}
              onChange={(e) => setCurrentMethodId(Number(e.target.value))}
            >
              <MenuItem disabled value={-1}>
                -- Choose Payment Method --
              </MenuItem>
              {paymentMethods &&
                paymentMethods.data.map((method: IPaymentMethod) => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
            </Select>
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Box>
        </Box>

        {currentMethodId === -1 ? (
          <ErrorComponent errorText="Please select payment method" />
        ) : (
          <>
            <Grid container spacing={2} sx={{ height: 200 }}>
              <Grid item xs={12} md={8}>
                <CardStyled
                  sx={{
                    width: '100%',
                    height: '100%',
                    background:
                      currentMethod?.type === PAYMENT_METHOD_TYPE.CASH
                        ? 'linear-gradient(to right, rgb(34, 197, 94), rgb(21, 128, 61))'
                        : 'radial-gradient(at right center, rgb(56, 189, 248), rgb(49, 46, 129))',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2 }}
                  >
                    <Typography variant="h5" color="white">
                      {currentMethod?.name}
                    </Typography>
                    {currentMethod?.type === PAYMENT_METHOD_TYPE.CASH ? (
                      <PaymentsIcon
                        style={{ color: 'white', width: 50, height: 50 }}
                      />
                    ) : (
                      <Image
                        src="/visa-image.png"
                        alt="expense"
                        width={150}
                        height={50}
                      />
                    )}
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    sx={{ px: 8 }}
                  >
                    {currentMethod?.type !== PAYMENT_METHOD_TYPE.CASH && (
                      <Nfc style={{ color: 'white', width: 50, height: 50 }} />
                    )}
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ p: 2 }}
                  >
                    <Typography variant="body1" color="white">
                      {currentMethod?.createdBy}
                    </Typography>
                    <Typography variant="body1" color="white">
                      {currentMethod?.createdAt}
                    </Typography>
                  </Box>
                </CardStyled>
              </Grid>
              {/* Overivew Cards */}
              <Grid container item xs={12} md={4} spacing={2}>
                <Grid item xs={12}>
                  <OverviewCard
                    textColor={blueGrey[800]}
                    backgroundColor={blueGrey[50]}
                    icon={<PaidIcon fontSize="large" color="primary" />}
                    text="Expense"
                    value="1000"
                  />
                </Grid>
                <Grid item xs={12}>
                  <OverviewCard
                    textColor={blueGrey[800]}
                    backgroundColor={blueGrey[50]}
                    icon={
                      <AccountBalanceWalletIcon
                        fontSize="large"
                        color="primary"
                      />
                    }
                    text="Transactions"
                    value="1000"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Expense Chart */}
            <ShadowSection mt={8}>
              <AreaChart timeSeries={[]} thisMonthData={[]} />
            </ShadowSection>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <ShadowSection>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={2}
                  >
                    Recent Transactions
                  </Typography>

                  {/* Recent Transactions */}
                  <TransactionsTable transactions={transactions?.data || []} />
                </ShadowSection>
              </Grid>

              <Grid item xs={12} md={4}>
                <ShadowSection>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={blueGrey[800]}
                    mb={2}
                  >
                    Who used it most?
                  </Typography>

                  {/* Who used it most */}
                  <CardUsedByTable />
                </ShadowSection>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Sidebar>
  );
}
