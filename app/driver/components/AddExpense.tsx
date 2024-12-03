import { AlertColor, Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import OtherExpenses from './Expense/OtherExpenses';
import { grey } from '@mui/material/colors';
import StockPurchased from '@/app/admin/components/Expense/StockPurchased';
import {
  PAYMENT_METHOD_TYPE,
  TRANSACTION_STATUS,
  USER_ROLE,
} from '@/app/utils/enum';
import { mainPaymentMethodId } from '@/app/lib/constant';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddExpense({ showNotification }: IProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <Box>
      <Typography variant="h4" textAlign="center">
        Add Expense
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        justifyContent="center"
        width="100%"
        my={2}
        sx={{ backgroundColor: grey[100], borderRadius: 2, p: 1 }}
      >
        <Button
          sx={{
            backgroundColor: tabIndex === 0 ? 'primary.lightest' : '',
            color: tabIndex === 0 ? 'primary.main' : 'grey',
          }}
          onClick={() => setTabIndex(0)}
        >
          <Typography fontWeight="bold">Stock Purchased</Typography>
        </Button>
        <Button
          sx={{
            backgroundColor: tabIndex === 1 ? 'primary.lightest' : '',
            color: tabIndex === 1 ? 'primary.main' : 'grey',
          }}
          onClick={() => setTabIndex(1)}
        >
          <Typography fontWeight="bold">Other Expense</Typography>
        </Button>
      </Box>

      {tabIndex === 0 ? (
        <StockPurchased
          showNotification={showNotification}
          role={USER_ROLE.DRIVER}
          defaultValue={{
            paymentMethodId: mainPaymentMethodId,
          }}
          adminsAndDrivers={[]}
          paymentMethods={[
            {
              id: mainPaymentMethodId,
              name: 'Cash',
              type: PAYMENT_METHOD_TYPE.CASH,
              status: TRANSACTION_STATUS.PAID,
            },
          ]}
        />
      ) : (
        <OtherExpenses showNotification={showNotification} />
      )}
    </Box>
  );
}
