'use client';
import React, { useEffect, useState } from 'react';
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
import { useParams } from 'next/navigation';
import useNotification from '@/hooks/useNotification';
import { fetchApi } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import QuotesTable from '../components/Tables/QuotesTable';

export default function QuoteClientPage() {
  const { companyId }: any = useParams();
  
  const [dateRange, setDateRange] = useState<any>(generateMonthRange());
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [quotes, setQuotes] = useState<any>([]);
  
  const router = useRouter();

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const data = await fetchApi(getAdminApiUrl(companyId, `/quotes?companyId=${companyId}`));
      console.log(data);
      setQuotes(data);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      showNotification('error', 'Error fetching quotes');
    }
  }

  return (
    <Sidebar>
      {NotificationComp}
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
            <Button fullWidth variant="contained" color="primary" onClick={() => router.push(`/admin/${companyId}/quotes/create`)}>
              + Create Quote
            </Button>
          </Grid>
        </Grid>

        <QuotesTable quotes={quotes} />
      </ShadowSection>
    </Sidebar>
  );
}
