import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ShadowSection } from '../reports/styled';
import { generateMonthRange } from '@/app/utils/time';
import { SearchIcon } from 'lucide-react';
import SelectDateRange from '../components/Select/SelectDateRange';
import PayrollTable from '../components/Tables/PayrollTable';
import AddPayroll from '../components/Modals/add/AddPayroll';

export default function Payroll() {
  const [isOpenAddPayroll, setIsOpenAddPayroll] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<any[]>(generateMonthRange());
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  return (
    <>
      <AddPayroll open={isOpenAddPayroll} onClose={() => setIsOpenAddPayroll(false)} />
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
                height: 'fit-content'
              }} 
              variant="contained" 
              color="primary"  
              size="small"
              onClick={() => setIsOpenAddPayroll(true)}
            >
              + Create Payroll
            </Button>

          </Box>

          <PayrollTable data={[]} />
        </ShadowSection>
      </Box>
    </>
  );
}
