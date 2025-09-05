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
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import PayrollCSV from '../components/CSV/PayrollCSV';
import { IPayroll } from '@/app/utils/type';
import ConvertPayroll from '../components/Modals/ConvertPayroll';

export default function Payroll() {
  const { companyId }: any = useParams();
  const [isOpenAddPayroll, setIsOpenAddPayroll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // last month in default
  const [dateRange, setDateRange] = useState<any[]>(generateMonthRange(undefined, -1));
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [selectedPayrolls, setSelectedPayrolls] = useState<IPayroll[]>([]);
  const [isOpenConvertPayroll, setIsOpenConvertPayroll] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      fetchPayrolls();
    }
  }, [dateRange]);

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      <ConvertPayroll 
        open={isOpenConvertPayroll}
        onClose={() => setIsOpenConvertPayroll(false)}
        payrolls={selectedPayrolls}
        showNotification={showNotification}
        refetchPayrolls={fetchPayrolls}
      />
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Payroll</Typography>
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              disabled={selectedPayrolls.length === 0}
              onClick={() => setIsOpenConvertPayroll(true)}
            >
              Convert to Transaction
            </Button>
            <PayrollCSV payrolls={selectedPayrolls || []} />
          </Box>
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

          <Box
            display="flex"
            flexDirection="row"
            gap={1}
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%' }}
          >
            <SelectDateRange
              variant="standard"
              dateRange={dateRange}
              setDateRange={setDateRange}
              navigation
            />
          </Box>

          {isLoading ? (
            <LoadingComponent />
          ) : (
            <PayrollTable
              data={payrolls}
              showNotification={showNotification}
              refresh={fetchPayrolls}
              selectedPayrolls={selectedPayrolls}
              setSelectedPayrolls={setSelectedPayrolls}
            />
          )}
        </ShadowSection>
      </Box>
    </>
  );
}
