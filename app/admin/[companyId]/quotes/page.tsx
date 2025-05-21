'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Grid,
  Typography,
} from '@mui/material';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import PercentIcon from '@mui/icons-material/Percent';
import { ShadowSection } from '../reports/styled';
import SearchInput from '../components/SearchInput';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { useRouter } from 'next/navigation';

export default function QuoteClientPage() {
  const [dateRange, setDateRange] = useState<any>(generateMonthRange());
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const router = useRouter();

  return (
    <Sidebar>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Quotes</Typography>
        <SelectDateRange
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </Box>

      {/* Overview Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard text="Total Quotes" value="10" icon={<PercentIcon />} />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard text="Total Quotes" value="10" icon={<PercentIcon />} />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <OverviewCard text="Total Quotes" value="10" icon={<PercentIcon />} />
        </Grid>
      </Grid>

      {/* Quotes Table Section */}
      <ShadowSection>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={10.5} lg={11}>
            <SearchInput
              value={searchKeywords}
              onChange={(value: any) => setSearchKeywords(value)}
              label="Search"
              name="search"
              placeholder="Search"
            />
          </Grid>

          <Grid item xs={1.5} lg={1}>
            <Button fullWidth variant="contained" color="primary" onClick={() => router.push('/admin/quotes/create')}>
              + Create Quote
            </Button>
          </Grid>
        </Grid>
      </ShadowSection>
    </Sidebar>
  );
}
