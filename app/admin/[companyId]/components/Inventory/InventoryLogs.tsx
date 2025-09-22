'use client';
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
  alpha,
  Fade,
  Collapse,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  Minus,
  Edit,
  Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import dayjs from 'dayjs';
import { InventoryLogType } from '@prisma/client';

// Action type configurations
const actionConfig = {
  STOCK_IN: {
    label: 'Stock In',
    color: '#10B981',
    icon: Plus,
    bgColor: '#ECFDF5',
  },
  SUBTRACT: {
    label: 'Stock Out',
    color: '#EF4444',
    icon: Minus,
    bgColor: '#FEF2F2',
  },
  LOST: {
    label: 'Lost',
    color: '#EF4444',
    icon: Minus,
    bgColor: '#FEF2F2',
  },
  RESTOCK: {
    label: 'Restock',
    color: '#F59E0B',
    icon: Edit,
    bgColor: '#FFFBEB',
  },
};

// // Helper functions
// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     weekday: 'long',
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });
// };

const groupLogsByDate = (logs: any[]) => {
  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.createdAt).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {});

  // Sort logs within each date by timestamp (newest first)
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  return grouped;
};

export default function InventoryLogs() {
  const { companyId }: any = useParams();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const { data: inventoryItems, isLoading: isLoadingInventoryItems } = useQuery(
    {
      queryKey: ['inventory-items'],
      queryFn: async () => {
        const response = await axios.get(
          getAdminApiUrl(companyId, '/inventory'),
        );
        return response.data.data;
      },
    },
  );

  // Data Fetching
  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['inventory-logs', selectedItem?.id],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/inventory/logs?inventoryItemId=${selectedItem?.id}`,
        ),
      );
      return response.data.data;
    },
    enabled: !!selectedItem?.id,
  });

  // Group filtered logs by date
  const groupedLogs = useMemo(() => {
    let filteredLogs = logs;
    if (typeFilter !== 'all') {
      filteredLogs = filteredLogs?.filter(
        (log: any) => log.type === typeFilter,
      );
    }
    return groupLogsByDate(filteredLogs || []);
  }, [logs, typeFilter]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm || !inventoryItems) return inventoryItems || [];

    return inventoryItems.filter(
      (item: any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.sku?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, inventoryItems]);

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const getItemById = (itemId: number) => {
    return inventoryItems?.find((item: any) => item.id === itemId);
  };

  const renderItemSelector = () => (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: alpha('#3B82F6', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={20} color="#3B82F6" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Select Item to View Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose an item to track its inventory history
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          placeholder="Search items by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#9CA3AF" />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {isLoadingInventoryItems ? (
          <LoadingComponent />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {filteredItems.map((item: IInventoryItem) => (
              <Card
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border:
                    selectedItem?.id === item.id
                      ? '2px solid #3B82F6'
                      : '1px solid #E5E7EB',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  // boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                  '&:hover': {
                    borderColor: '#3B82F6',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                  },
                }}
                onClick={() => setSelectedItem(item)}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: alpha('#3B82F6', 0.1),
                      color: '#3B82F6',
                    }}
                  >
                    <Package size={20} />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.sku}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}

        {selectedItem && (
          <Box mt={2}>
            <Button
              variant="outlined"
              onClick={() => setSelectedItem(null)}
              sx={{ textTransform: 'none' }}
            >
              Clear Selection
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderFilters = () => (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Filter size={20} color="#6B7280" />
          <Typography variant="subtitle1" fontWeight={600}>
            Filters
          </Typography>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Log Type</InputLabel>
            <Select
              value={typeFilter}
              label="Log Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Logs</MenuItem>
              <MenuItem value={InventoryLogType.STOCK_IN}>Stock In</MenuItem>
              <MenuItem value={InventoryLogType.RESTOCK}>Restock</MenuItem>
              <MenuItem value={InventoryLogType.SUBTRACT}>Subtract</MenuItem>
              <MenuItem value={InventoryLogType.LOST}>Lost</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );

  const renderLogEntry = (log: any) => {
    const item = getItemById(log.itemId);
    const config = actionConfig[log.type as keyof typeof actionConfig];
    const IconComponent = config.icon;

    return (
      <Fade in={true} timeout={300}>
        <Card
          sx={{
            mb: 2,
            borderRadius: 2,
            border: '1px solid #E5E7EB',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="flex-start" gap={3}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: config.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconComponent size={24} color={config.color} />
              </Box>

              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {config.label}
                  </Typography>
                  <Chip
                    label={config.label}
                    size="small"
                    sx={{
                      bgcolor: config.bgColor,
                      color: config.color,
                      fontWeight: 500,
                    }}
                  />
                  {!selectedItem && (
                    <Chip
                      label={item?.name}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  )}
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {log.log}
                </Typography>

                <Box
                  display="grid"
                  gridTemplateColumns={{
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)',
                  }}
                  gap={2}
                  mb={2}
                >
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Quantity Change
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {log.type === InventoryLogType.SUBTRACT ||
                      log.type === InventoryLogType.LOST
                        ? '-'
                        : '+'}
                      {log.quantity}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Previous Quantity
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {log.prevQty}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      New Quantity
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={config.color}
                    >
                      {log.afterQty}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {log.createdAt}
                    </Typography>
                  </Box>
                </Box>

                {/* <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <User size={16} color="#6B7280" />
                    <Typography variant="caption" color="text.secondary">
                      {log.user} ({log.userRole})
                    </Typography>
                  </Box>
                </Box> */}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const renderLogsTimeline = () => {
    if (isLoadingLogs) {
      return <LoadingComponent />;
    }

    if (logs?.length === 0) {
      return (
        <Card sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <Package size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            No logs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedItem
              ? `No logs available for ${selectedItem.name}`
              : 'Select an item to view its inventory logs'}
          </Typography>
        </Card>
      );
    }

    return (
      <Box>
        {Object.entries(groupedLogs).map(([date, logs]) => {
          const isExpanded = expandedDates.has(date);
          const logsArray = logs as any[];

          return (
            <Card
              key={date}
              sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 3,
                    borderBottom: '1px solid #E5E7EB',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleDateExpansion(date)}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: alpha('#3B82F6', 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Calendar size={20} color="#3B82F6" />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {dayjs(date).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {logsArray.length}{' '}
                          {logsArray.length === 1 ? 'entry' : 'entries'}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton>
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={isExpanded}>
                  <Box sx={{ p: 3 }}>
                    {logsArray.map((log: any) => renderLogEntry(log))}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      {renderItemSelector()}
      {renderFilters()}
      {renderLogsTimeline()}
    </Box>
  );
}
