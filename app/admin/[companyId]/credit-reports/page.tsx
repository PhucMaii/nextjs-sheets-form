'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Receipt,
  People,
  Assessment,
  Search,
  CalendarToday,
  AttachMoney,
  Add,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Import theme colors
import { error } from '@/theme/color';

// Import existing components and utilities
import Sidebar from '../components/Sidebar/Sidebar';
import useNotification from '@/hooks/useNotification';
import useDebounce from '@/hooks/useDebounce';
import { formatCurrency, formatNumberWith2Decimal } from '@/app/utils/number';
import KPICard from '../components/Overview/KPICard';
import { ShadowSection } from '../reports/styled';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { ICreditReport } from '@/app/utils/type';
import CreditReportTable from '../components/Tables/CreditReportTable';

// Main Component
export default function CreditPage() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification, NotificationComp } = useNotification();

  // State management
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const debouncedSearchKeywords = useDebounce(searchKeywords, 500);

  // Data Fetching
  const { data: creditReports, refetch: refetchCreditReports } = useQuery({
    queryKey: ['creditReports', companyId, selectedYear],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/credit-reports?year=${selectedYear}`),
      );
      return response.data.data;
    },
  });

  // Generate year options (current year ± 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }, []);

  // Filter credits based on search
  const filteredCredits = useMemo(() => {
    if (!creditReports) return [];
    if (!debouncedSearchKeywords) return creditReports;

    const searchLower = debouncedSearchKeywords.toLowerCase();
    return creditReports.filter((credit: ICreditReport) => {
      const searchableFields = [
        credit.user.clientName,
        credit.reason,
        credit.type,
        credit.id.toString(),
      ];

      return searchableFields.some((field) =>
        field?.toLowerCase().includes(searchLower),
      );
    });
  }, [creditReports, debouncedSearchKeywords]);

  const overview = useMemo(() => {
    if (!creditReports)
      return {
        totalLoss: 0,
        totalCredits: 0,
        uniqueClients: 0,
        averageCreditsPerMonth: 0,
      };

    return {
      totalLoss: creditReports.reduce(
        (acc: number, credit: ICreditReport) => acc + credit.totalLoss,
        0,
      ),
      totalCredits: creditReports.length,
      uniqueClients: creditReports.reduce(
        (acc: number, credit: ICreditReport) => acc + credit.user.id,
        0,
      ),
      averageCreditsPerMonth:
        creditReports.reduce(
          (acc: number, credit: ICreditReport) => acc + credit.createdAt,
          0,
        ) / creditReports.length,
    };
  }, [creditReports]);

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // Update URL parameters
    const params = new URLSearchParams(window.location.search);
    params.set('year', year.toString());
    router.replace(`/admin/${companyId}/credit-reports?${params.toString()}`, {
      scroll: false,
    });
  };

  // Loading state - simulate loading for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Simulate 1 second loading

    return () => clearTimeout(timer);
  }, [selectedYear]);

  // URL parameter handling
  useEffect(() => {
    const urlYear = searchParams?.get('year');
    if (urlYear) {
      setSelectedYear(parseInt(urlYear));
    }
  }, [searchParams]);

  return (
    <Sidebar>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <ShadowSection
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          mb={4}
        >
          <Box display="flex" gap={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${error.main} 0%, ${error.dark} 100%)`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 6px -1px ${alpha(error.main, 0.25)}`,
              }}
            >
              <Receipt fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" color={error.dark}>
                Credit Reports
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track and manage customer credit reports
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() =>
              router.push(`/admin/${companyId}/credit-reports/create`)
            }
          >
            Create Credit Report
          </Button>
        </ShadowSection>

        {/* Year Selector */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Select Year</InputLabel>
            <Select
              value={selectedYear}
              label="Select Year"
              onChange={(e) => handleYearChange(e.target.value as number)}
              startAdornment={
                <InputAdornment position="start">
                  <CalendarToday fontSize="small" />
                </InputAdornment>
              }
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Overview Section */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Loss"
              value={formatCurrency(overview.totalLoss)}
              subtitle="Total credit amount"
              icon={<AttachMoney />}
              color="error"
              variant="gradient"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Credits"
              value={overview.totalCredits}
              subtitle="Number of credit reports"
              icon={<Receipt />}
              color="primary"
              variant="gradient"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Unique Clients"
              value={overview.uniqueClients}
              subtitle="Clients with credits"
              icon={<People />}
              color="info"
              variant="gradient"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Avg Credits/Month"
              value={formatNumberWith2Decimal(overview.averageCreditsPerMonth)}
              subtitle="Monthly average"
              icon={<Assessment />}
              color="warning"
              variant="gradient"
            />
          </Grid>
        </Grid>

        {/* Credits Table */}
        <ShadowSection>
          <CardContent sx={{ p: 0 }}>
            <Typography variant="h6" fontWeight="bold">
              Credit Reports ({filteredCredits.length})
            </Typography>
            <Divider sx={{ my: 2 }} />
            <TextField
              size="small"
              placeholder="Search credits..."
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              fullWidth
              sx={{ m: 2 }}
            />

            {isLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={8}
              >
                <CircularProgress />
              </Box>
            ) : filteredCredits.length === 0 ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={8}
              >
                <Alert severity="info" sx={{ maxWidth: 400 }}>
                  No credit reports found for the selected year.
                </Alert>
              </Box>
            ) : (
              <CreditReportTable
                creditReports={filteredCredits}
                showNotification={showNotification}
                refetchCreditReports={refetchCreditReports}
              />
            )}
          </CardContent>
        </ShadowSection>
        {/* Notification Component */}
        {NotificationComp}
      </Box>
    </Sidebar>
  );
}
