'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Receipt,
  People,
  Assessment,
  Search,
  Visibility,
  CalendarToday,
  AttachMoney,
  Person,
  Description,
  DateRange,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

// Import theme colors
import { primary, success, error, warning, info, neutral } from '@/theme/color';

// Import existing components and utilities
import Sidebar from '../components/Sidebar/Sidebar';
import useNotification from '@/hooks/useNotification';
import useDebounce from '@/hooks/useDebounce';
import { formatCurrency, formatNumberWith2Decimal } from '@/app/utils/number';
import KPICard from '../components/Overview/KPICard';

// Types
interface CreditReport {
  id: number;
  userId: number;
  orderId: number;
  reason: string;
  createdAt: string;
  createdBy: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  user: {
    clientName: string;
    contactNumber: string;
  };
  items: CreditItem[];
}

interface CreditItem {
  id: number;
  inventoryItemId: number;
  orderedItemId: number;
  actualPrice: number;
  priceDifference: number;
  quantity: number;
  itemName: string;
  unit: string;
}

interface CreditOverview {
  totalLoss: number;
  totalCredits: number;
  uniqueClients: number;
  averageCreditsPerMonth: number;
  monthlyTrend: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
}

// Theme colors configuration
const themeColors = {
  primary: {
    main: primary.main,
    light: primary.light,
    dark: primary.dark,
    gradient: `linear-gradient(135deg, ${primary.main} 0%, ${primary.dark} 100%)`,
    background: primary.lightest,
  },
  success: {
    main: success.main,
    light: success.light,
    dark: success.dark,
    gradient: `linear-gradient(135deg, ${success.main} 0%, ${success.dark} 100%)`,
    background: success.lightest,
  },
  error: {
    main: error.main,
    light: error.light,
    dark: error.dark,
    gradient: `linear-gradient(135deg, ${error.main} 0%, ${error.dark} 100%)`,
    background: error.lightest,
  },
  warning: {
    main: warning.main,
    light: warning.light,
    dark: warning.dark,
    gradient: `linear-gradient(135deg, ${warning.main} 0%, ${warning.dark} 100%)`,
    background: warning.lightest,
  },
  info: {
    main: info.main,
    light: info.light,
    dark: info.dark,
    gradient: `linear-gradient(135deg, ${info.main} 0%, ${info.dark} 100%)`,
    background: info.lightest,
  },
  neutral: {
    main: neutral[500],
    light: neutral[200],
    dark: neutral[700],
    background: neutral[50],
  },
};

// // KPI Card Component
// interface KPICardProps {
//   title: string;
//   value: string | number;
//   subtitle?: string;
//   icon: React.ReactElement;
//   color: keyof typeof themeColors;
//   trend?: {
//     value: number;
//     isPositive: boolean;
//     label: string;
//   };
// }

// function KPICard({ title, value, subtitle, icon, color, trend }: KPICardProps) {
//   const colorConfig = themeColors[color];

//   return (
//     <Card
//       elevation={0}
//       sx={{
//         height: '100%',
//         background: `linear-gradient(135deg, ${colorConfig.background} 0%, #ffffff 100%)`,
//         border: `1px solid ${alpha(colorConfig.main, 0.12)}`,
//         borderRadius: 3,
//         transition: 'all 0.3s ease-in-out',
//         '&:hover': {
//           boxShadow: `0 10px 15px -3px ${alpha(colorConfig.main, 0.1)}, 0 4px 6px -2px ${alpha(colorConfig.main, 0.05)}`,
//           transform: 'translateY(-2px)',
//         },
//       }}
//     >
//       <CardContent sx={{ p: 3 }}>
//         <Box display="flex" alignItems="center" gap={2} mb={2}>
//           <Box
//             sx={{
//               p: 1.5,
//               borderRadius: 2,
//               background: `linear-gradient(135deg, ${colorConfig.main} 0%, ${colorConfig.dark} 100%)`,
//               color: 'white',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               boxShadow: `0 4px 6px -1px ${alpha(colorConfig.main, 0.25)}`,
//             }}
//           >
//             {icon}
//           </Box>
//           <Box flex={1}>
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               fontWeight="medium"
//             >
//               {title}
//             </Typography>
//             <Typography variant="h4" fontWeight="bold" color={colorConfig.dark}>
//               {value}
//             </Typography>
//             {subtitle && (
//               <Typography variant="body2" color="text.secondary">
//                 {subtitle}
//               </Typography>
//             )}
//           </Box>
//         </Box>
//         {trend && (
//           <Box display="flex" alignItems="center" gap={1}>
//             <Box
//               display="flex"
//               alignItems="center"
//               gap={0.5}
//               color={trend.isPositive ? success.main : error.main}
//             >
//               {trend.isPositive ? (
//                 <TrendingDown sx={{ transform: 'rotate(180deg)' }} />
//               ) : (
//                 <TrendingDown />
//               )}
//               <Typography variant="body2" fontWeight="medium">
//                 {trend.value}%
//               </Typography>
//             </Box>
//             <Typography variant="body2" color="text.secondary">
//               {trend.label}
//             </Typography>
//           </Box>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// Credit Item Details Modal
interface CreditItemDetailsModalProps {
  open: boolean;
  onClose: () => void;
  items: CreditItem[];
  creditId: number;
}

function CreditItemDetailsModal({
  open,
  onClose,
  items,
  creditId,
}: CreditItemDetailsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Receipt color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Credit Items Details
          </Typography>
          <Chip
            label={`Credit #${creditId}`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit</TableCell>
                <TableCell align="right">Actual Price</TableCell>
                <TableCell align="right">Price Difference</TableCell>
                <TableCell align="right">Total Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.itemName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{item.unit}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.actualPrice)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: error.main }}>
                    {formatCurrency(item.priceDifference)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 'bold', color: error.main }}
                  >
                    {formatCurrency(item.priceDifference * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Component
export default function CreditPage() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { NotificationComp } = useNotification();

  // State management
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedCredit, setSelectedCredit] = useState<CreditReport | null>(
    null,
  );
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const debouncedSearchKeywords = useDebounce(searchKeywords, 500);

  // Generate year options (current year ± 5 years)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }, []);

  // Mock data
  const mockCredits: CreditReport[] = [
    {
      id: 1001,
      userId: 1,
      orderId: 5001,
      reason: 'Quality issue with fresh produce delivery',
      createdAt: '2024-01-15T10:30:00Z',
      createdBy: 'Sarah Johnson',
      status: 'Approved',
      totalAmount: 45.5,
      itemCount: 3,
      user: {
        clientName: 'John Smith',
        contactNumber: '555-0123',
      },
      items: [
        {
          id: 1,
          inventoryItemId: 101,
          orderedItemId: 201,
          actualPrice: 12.99,
          priceDifference: 12.99,
          quantity: 2,
          itemName: 'Organic Tomatoes',
          unit: 'lb',
        },
        {
          id: 2,
          inventoryItemId: 102,
          orderedItemId: 202,
          actualPrice: 8.5,
          priceDifference: 8.5,
          quantity: 1,
          itemName: 'Fresh Lettuce',
          unit: 'head',
        },
        {
          id: 3,
          inventoryItemId: 103,
          orderedItemId: 203,
          actualPrice: 11.52,
          priceDifference: 11.52,
          quantity: 1,
          itemName: 'Bell Peppers',
          unit: 'lb',
        },
      ],
    },
    {
      id: 1002,
      userId: 2,
      orderId: 5002,
      reason: 'Pricing error on bulk order discount',
      createdAt: '2024-01-18T14:20:00Z',
      createdBy: 'Mike Chen',
      status: 'Pending',
      totalAmount: 125.75,
      itemCount: 5,
      user: {
        clientName: 'Emily Davis',
        contactNumber: '555-0456',
      },
      items: [
        {
          id: 4,
          inventoryItemId: 104,
          orderedItemId: 204,
          actualPrice: 15.99,
          priceDifference: 5.0,
          quantity: 10,
          itemName: 'Organic Carrots',
          unit: 'lb',
        },
        {
          id: 5,
          inventoryItemId: 105,
          orderedItemId: 205,
          actualPrice: 22.5,
          priceDifference: 7.5,
          quantity: 5,
          itemName: 'Premium Potatoes',
          unit: 'lb',
        },
      ],
    },
    {
      id: 1003,
      userId: 3,
      orderId: 5003,
      reason: 'Delivery delay caused product spoilage',
      createdAt: '2024-01-20T09:15:00Z',
      createdBy: 'Lisa Wang',
      status: 'Approved',
      totalAmount: 78.25,
      itemCount: 2,
      user: {
        clientName: 'Robert Wilson',
        contactNumber: '555-0789',
      },
      items: [
        {
          id: 6,
          inventoryItemId: 106,
          orderedItemId: 206,
          actualPrice: 18.75,
          priceDifference: 18.75,
          quantity: 2,
          itemName: 'Fresh Berries',
          unit: 'container',
        },
        {
          id: 7,
          inventoryItemId: 107,
          orderedItemId: 207,
          actualPrice: 40.75,
          priceDifference: 40.75,
          quantity: 1,
          itemName: 'Mixed Greens',
          unit: 'bag',
        },
      ],
    },
    {
      id: 1004,
      userId: 4,
      orderId: 5004,
      reason: 'Customer satisfaction - product not as described',
      createdAt: '2024-01-22T16:45:00Z',
      createdBy: 'David Brown',
      status: 'Rejected',
      totalAmount: 32.4,
      itemCount: 1,
      user: {
        clientName: 'Maria Garcia',
        contactNumber: '555-0321',
      },
      items: [
        {
          id: 8,
          inventoryItemId: 108,
          orderedItemId: 208,
          actualPrice: 32.4,
          priceDifference: 32.4,
          quantity: 1,
          itemName: 'Organic Spinach',
          unit: 'bunch',
        },
      ],
    },
    {
      id: 1005,
      userId: 5,
      orderId: 5005,
      reason: 'Quality issue with meat products',
      createdAt: '2024-01-25T11:30:00Z',
      createdBy: 'Sarah Johnson',
      status: 'Approved',
      totalAmount: 89.9,
      itemCount: 3,
      user: {
        clientName: 'James Taylor',
        contactNumber: '555-0654',
      },
      items: [
        {
          id: 9,
          inventoryItemId: 109,
          orderedItemId: 209,
          actualPrice: 24.99,
          priceDifference: 24.99,
          quantity: 2,
          itemName: 'Grass-Fed Beef',
          unit: 'lb',
        },
        {
          id: 10,
          inventoryItemId: 110,
          orderedItemId: 210,
          actualPrice: 19.96,
          priceDifference: 19.96,
          quantity: 1,
          itemName: 'Free-Range Chicken',
          unit: 'lb',
        },
        {
          id: 11,
          inventoryItemId: 111,
          orderedItemId: 211,
          actualPrice: 44.95,
          priceDifference: 44.95,
          quantity: 1,
          itemName: 'Organic Salmon',
          unit: 'lb',
        },
      ],
    },
    {
      id: 1006,
      userId: 6,
      orderId: 5006,
      reason: 'Pricing error on seasonal discount',
      createdAt: '2024-01-28T13:20:00Z',
      createdBy: 'Mike Chen',
      status: 'Pending',
      totalAmount: 156.8,
      itemCount: 4,
      user: {
        clientName: 'Jennifer Lee',
        contactNumber: '555-0987',
      },
      items: [
        {
          id: 12,
          inventoryItemId: 112,
          orderedItemId: 212,
          actualPrice: 12.5,
          priceDifference: 3.75,
          quantity: 8,
          itemName: 'Winter Squash',
          unit: 'lb',
        },
        {
          id: 13,
          inventoryItemId: 113,
          orderedItemId: 213,
          actualPrice: 18.99,
          priceDifference: 5.7,
          quantity: 6,
          itemName: 'Sweet Potatoes',
          unit: 'lb',
        },
        {
          id: 14,
          inventoryItemId: 114,
          orderedItemId: 214,
          actualPrice: 25.0,
          priceDifference: 7.5,
          quantity: 4,
          itemName: 'Pumpkin',
          unit: 'lb',
        },
        {
          id: 15,
          inventoryItemId: 115,
          orderedItemId: 215,
          actualPrice: 35.2,
          priceDifference: 10.56,
          quantity: 2,
          itemName: 'Butternut Squash',
          unit: 'lb',
        },
      ],
    },
    {
      id: 1007,
      userId: 7,
      orderId: 5007,
      reason: 'Delivery issue - wrong address',
      createdAt: '2024-01-30T08:45:00Z',
      createdBy: 'Lisa Wang',
      status: 'Approved',
      totalAmount: 67.3,
      itemCount: 2,
      user: {
        clientName: 'Michael Anderson',
        contactNumber: '555-1357',
      },
      items: [
        {
          id: 16,
          inventoryItemId: 116,
          orderedItemId: 216,
          actualPrice: 28.65,
          priceDifference: 28.65,
          quantity: 1,
          itemName: 'Fresh Herbs Bundle',
          unit: 'bundle',
        },
        {
          id: 17,
          inventoryItemId: 117,
          orderedItemId: 217,
          actualPrice: 38.65,
          priceDifference: 38.65,
          quantity: 1,
          itemName: 'Artisan Bread',
          unit: 'loaf',
        },
      ],
    },
    {
      id: 1008,
      userId: 8,
      orderId: 5008,
      reason: 'Quality issue with dairy products',
      createdAt: '2024-02-02T15:10:00Z',
      createdBy: 'David Brown',
      status: 'Approved',
      totalAmount: 42.15,
      itemCount: 3,
      user: {
        clientName: 'Susan Martinez',
        contactNumber: '555-2468',
      },
      items: [
        {
          id: 18,
          inventoryItemId: 118,
          orderedItemId: 218,
          actualPrice: 8.99,
          priceDifference: 8.99,
          quantity: 2,
          itemName: 'Organic Milk',
          unit: 'gallon',
        },
        {
          id: 19,
          inventoryItemId: 119,
          orderedItemId: 219,
          actualPrice: 12.5,
          priceDifference: 12.5,
          quantity: 1,
          itemName: 'Greek Yogurt',
          unit: 'container',
        },
        {
          id: 20,
          inventoryItemId: 120,
          orderedItemId: 220,
          actualPrice: 20.66,
          priceDifference: 20.66,
          quantity: 1,
          itemName: 'Artisan Cheese',
          unit: 'lb',
        },
      ],
    },
  ];

  const mockOverview: CreditOverview = {
    totalLoss: 637.25,
    totalCredits: 8,
    uniqueClients: 8,
    averageCreditsPerMonth: 4.2,
    monthlyTrend: [
      { month: 'Jan', count: 6, amount: 456.75 },
      { month: 'Feb', count: 2, amount: 180.5 },
      { month: 'Mar', count: 0, amount: 0 },
      { month: 'Apr', count: 0, amount: 0 },
      { month: 'May', count: 0, amount: 0 },
      { month: 'Jun', count: 0, amount: 0 },
      { month: 'Jul', count: 0, amount: 0 },
      { month: 'Aug', count: 0, amount: 0 },
      { month: 'Sep', count: 0, amount: 0 },
      { month: 'Oct', count: 0, amount: 0 },
      { month: 'Nov', count: 0, amount: 0 },
      { month: 'Dec', count: 0, amount: 0 },
    ],
  };

  // Process data - filter by selected year
  const credits: CreditReport[] = useMemo(() => {
    return mockCredits.filter((credit) => {
      const creditYear = new Date(credit.createdAt).getFullYear();
      return creditYear === selectedYear;
    });
  }, [selectedYear]);

  const overview: CreditOverview = mockOverview;

  // Filter credits based on search
  const filteredCredits = useMemo(() => {
    if (!debouncedSearchKeywords) return credits;

    const searchLower = debouncedSearchKeywords.toLowerCase();
    return credits.filter((credit) => {
      const searchableFields = [
        credit.user.clientName,
        credit.reason,
        credit.createdBy,
        credit.id.toString(),
      ];

      return searchableFields.some((field) =>
        field?.toLowerCase().includes(searchLower),
      );
    });
  }, [credits, debouncedSearchKeywords]);

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

  // Handle item details view
  const handleViewItemDetails = (credit: CreditReport) => {
    setSelectedCredit(credit);
    setIsItemDetailsOpen(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get credit type color
  const getCreditTypeColor = (reason: string) => {
    const reasonLower = reason.toLowerCase();
    if (reasonLower.includes('quality')) return 'error';
    if (reasonLower.includes('pricing')) return 'warning';
    if (reasonLower.includes('delivery')) return 'info';
    return 'default';
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
        <Box display="flex" alignItems="center" gap={2} mb={4}>
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
              Credit Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage customer credits and refunds
            </Typography>
          </Box>
        </Box>

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
            sx={{ minWidth: 300 }}
          />
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
              trend={{
                value: -5.2,
                isPositive: false,
                label: 'vs last year',
              }}
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
              trend={{
                value: 12.5,
                isPositive: true,
                label: 'vs last year',
              }}
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
              trend={{
                value: 8.3,
                isPositive: true,
                label: 'vs last year',
              }}
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
              trend={{
                value: -2.1,
                isPositive: false,
                label: 'vs last year',
              }}
			  variant="gradient"
            />
          </Grid>
        </Grid>

        {/* Credits Table */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${alpha(neutral[300], 0.5)}`,
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 3,
                borderBottom: `1px solid ${alpha(neutral[200], 0.5)}`,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Credit Reports ({filteredCredits.length})
              </Typography>
            </Box>

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
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Client Name</TableCell>
                      <TableCell>Reported Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell align="center">Items</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCredits.map((credit) => (
                      <TableRow key={credit.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            #{credit.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: themeColors.primary.main,
                                fontSize: '0.875rem',
                              }}
                            >
                              {credit.user.clientName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {credit.user.clientName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {credit.user.contactNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <DateRange fontSize="small" color="action" />
                            <Typography variant="body2">
                              {new Date(credit.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={credit.reason.split(' ')[0]}
                            color={getCreditTypeColor(credit.reason) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={credit.reason}>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {credit.reason}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body2">
                              {credit.createdBy}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewItemDetails(credit)}
                            startIcon={<Visibility />}
                            sx={{
                              minWidth: 'auto',
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                            }}
                          >
                            {credit.itemCount}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ color: error.main }}
                          >
                            {formatCurrency(credit.totalAmount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={credit.status}
                            color={getStatusColor(credit.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="primary">
                            <Description />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Credit Item Details Modal */}
        <CreditItemDetailsModal
          open={isItemDetailsOpen}
          onClose={() => setIsItemDetailsOpen(false)}
          items={selectedCredit?.items || []}
          creditId={selectedCredit?.id || 0}
        />

        {/* Notification Component */}
        {NotificationComp}
      </Box>
    </Sidebar>
  );
}
