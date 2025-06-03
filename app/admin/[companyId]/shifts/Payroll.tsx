import {
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ShadowSection } from '../reports/styled';
import { generateMonthRange } from '@/app/utils/time';
import { SearchIcon } from 'lucide-react';
import SelectDateRange from '../components/Select/SelectDateRange';
import PayrollTable from '../components/Tables/PayrollTable';
import AddPayroll from '../components/Modals/add/AddPayroll';
import useNotification from '@/hooks/useNotification';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import { useParams } from 'next/navigation';

export default function Payroll() {
  const { companyId }: any = useParams();
  const [isOpenAddPayroll, setIsOpenAddPayroll] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<any[]>(generateMonthRange());
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [payrolls, setPayrolls] = useState<any[]>([]);

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      fetchPayrolls();
    }
  }, [dateRange]);

  const fetchPayrolls = async () => {
    try {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          '/payroll',
          `startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
        ),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      setPayrolls(response.data.data);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error fetching the payrolls');
    }
  };
  return (
    <>
      {NotificationComp}
      <AddPayroll
        open={isOpenAddPayroll}
        onClose={() => setIsOpenAddPayroll(false)}
        showNotification={showNotification}
        refresh={fetchPayrolls}
        dateRange={dateRange}
      />
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Payroll</Typography>
          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </Box>

        <ShadowSection display="flex" flexDirection="column" gap={1}>
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <OutlinedInput
              fullWidth
              placeholder="Search"
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon size={16} />
                </InputAdornment>
              }
              size="small"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
            <Button
              sx={{
                width: 'fit-content',
                whiteSpace: 'nowrap',
                p: 1,
                px: 2,
                height: 'fit-content',
              }}
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setIsOpenAddPayroll(true)}
            >
              + Create Payroll
            </Button>
          </Box>

          <PayrollTable
            data={payrolls}
            showNotification={showNotification}
            refresh={fetchPayrolls}
          />
        </ShadowSection>
      </Box>
    </>
  );
}
