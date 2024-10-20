'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/SelectDateRange';
import { ShadowSection } from '../reports/styled';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import TransactionsTable from '../components/Tables/TransactionsTable';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DropdownItemContainer } from '../orders/styled';
import { primaryColor } from '@/theme/color';
import AddIcon from '@mui/icons-material/Add';
import AddExpense from '../components/Modals/add/AddExpense';
import useNotification from '@/hooks/useNotification';

export default function Transactions() {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [currentMethodId, setCurrentMethodId] = useState<number>(-1);
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isOpenAddExpense, setIsOpenAddExpense] = useState<boolean>(false);

  const { showNotification, NotificationComp} = useNotification();

  // Data Fetching
  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);

  const actions = (
    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
      <Button
        variant="outlined"
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowDownwardIcon fontSize="small" />
          <Typography fontWeight="medium">Actions</Typography>
        </Box>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={actionButtonAnchor}
        open={openDropdown}
        onClose={() => setActionButtonAnchor(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
              setIsOpenAddExpense(true);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <AddIcon sx={{ color: primaryColor }} />
            <Typography>Add Expense</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Sidebar>
      {NotificationComp}
      <AddExpense open={isOpenAddExpense} onClose={() => setIsOpenAddExpense(false)} showNotification={showNotification} />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="bold" color={blueGrey[800]}>
          Transactions
        </Typography>

        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>

      <ShadowSection>
        <Typography variant="h6" fontWeight="bold" color={blueGrey[800]}>
          Payment Method
        </Typography>
        <Select
          sx={{ mt: 2 }}
          value={currentMethodId}
          onChange={(e) => setCurrentMethodId(Number(e.target.value))}
          fullWidth
        >
          <MenuItem value={-1}>All</MenuItem>
          {paymentMethods &&
            paymentMethods.data.map((method: any) => (
              <MenuItem key={method.id} value={method.id}>
                {method.name}
              </MenuItem>
            ))}
        </Select>
      </ShadowSection>

      <ShadowSection>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={8} md={10}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search Transaction..."
              variant="filled"
            />
          </Grid>
          <Grid item xs={4} md={2} textAlign="center">
            {actions}
          </Grid>
        </Grid>
        <TransactionsTable />
      </ShadowSection>
    </Sidebar>
  );
}
