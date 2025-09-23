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
import SelectDateRange from '../Select/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';

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
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());

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
    queryKey: ['inventory-logs', selectedItem?.id, dateRange[0], dateRange[1]],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/inventory/logs?inventoryItemId=${selectedItem?.id}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
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
  
  const sortedDate = useMemo(() => {
    return Object.keys(groupedLogs).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedLogs]);

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
         borderRadius: 2,
         border: '1px solid #E5E7EB',
         boxShadow: 'none',
       }}
     >
       <CardContent sx={{ p: 2 }}>
         <Box display="flex" alignItems="center" gap={2} mb={2}>
           <Box
             sx={{
               width: 32,
               height: 32,
               borderRadius: 1.5,
               bgcolor: alpha('#3B82F6', 0.1),
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
             }}
           >
             <Package size={16} color="#3B82F6" />
           </Box>
           <Typography variant="subtitle1" fontWeight={600}>
             Select Item to View Logs
           </Typography>
         </Box>

         <Box display="flex" gap={2} mb={2}>
           <TextField
             fullWidth
             placeholder="Search items..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             size="small"
             InputProps={{
               startAdornment: (
                 <InputAdornment position="start">
                   <Search size={16} color="#9CA3AF" />
                 </InputAdornment>
               ),
             }}
             sx={{
               '& .MuiOutlinedInput-root': {
                 borderRadius: 1.5,
               },
             }}
           />
           {selectedItem && (
             <Button
               variant="outlined"
               size="small"
               onClick={() => setSelectedItem(null)}
               sx={{ textTransform: 'none', minWidth: 100 }}
             >
               Clear
             </Button>
           )}
         </Box>

         {isLoadingInventoryItems ? (
           <LoadingComponent />
         ) : (
           <Box
             sx={{
               display: 'grid',
               gridTemplateColumns: {
                 xs: '1fr',
                 sm: 'repeat(2, 1fr)',
                 md: 'repeat(4, 1fr)',
               },
               gap: 1.5,
               maxHeight: 200,
               overflowY: 'auto',
             }}
           >
             {filteredItems.map((item: IInventoryItem) => (
               <Box
                 key={item.id}
                 sx={{
                   p: 1.5,
                   cursor: 'pointer',
                   border:
                     selectedItem?.id === item.id
                       ? '2px solid #3B82F6'
                       : '1px solid #E5E7EB',
                   borderRadius: 1.5,
                   transition: 'all 0.2s ease',
                   bgcolor: selectedItem?.id === item.id ? alpha('#3B82F6', 0.05) : 'transparent',
                   '&:hover': {
                     borderColor: '#3B82F6',
                     bgcolor: alpha('#3B82F6', 0.05),
                   },
                 }}
                 onClick={() => setSelectedItem(item)}
               >
                 <Box display="flex" alignItems="center" gap={1.5}>
                   <Box
                     sx={{
                       width: 28,
                       height: 28,
                       borderRadius: 1,
                       bgcolor: alpha('#3B82F6', 0.1),
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       flexShrink: 0,
                     }}
                   >
                     <Package size={14} color="#3B82F6" />
                   </Box>
                   <Box flex={1} minWidth={0}>
                     <Typography variant="caption" fontWeight={600} noWrap>
                       {item.name}
                     </Typography>
                     <Typography variant="caption" color="text.secondary" display="block" noWrap>
                       {item.sku}
                     </Typography>
                   </Box>
                 </Box>
               </Box>
             ))}
           </Box>
         )}
       </CardContent>
     </Card>
   );

  const renderFilters = () => (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Filter size={16} color="#6B7280" />
          <Typography variant="subtitle2" fontWeight={600}>
            Filters
          </Typography>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value={InventoryLogType.STOCK_IN}>Stock In</MenuItem>
              <MenuItem value={InventoryLogType.RESTOCK}>Restock</MenuItem>
              <MenuItem value={InventoryLogType.SUBTRACT}>Subtract</MenuItem>
              <MenuItem value={InventoryLogType.LOST}>Lost</MenuItem>
            </Select>
          </FormControl>
          <SelectDateRange 
            dateRange={dateRange} 
            setDateRange={setDateRange}
          />
        </Box>
      </CardContent>
    </Card>
  );

   const renderLogEntry = (log: any) => {
     const config = actionConfig[log.type as keyof typeof actionConfig];
     const IconComponent = config.icon;
     const isNegative = log.type === InventoryLogType.SUBTRACT || log.type === InventoryLogType.LOST;

     return (
       <Fade in={true} timeout={300}>
         <Box
           sx={{
             display: 'flex',
             alignItems: 'center',
             gap: 2,
             p: 2,
             borderRadius: 2,
             border: '1px solid #E5E7EB',
             mb: 1,
             bgcolor: '#FFFFFF',
             transition: 'all 0.2s ease',
           }}
         >
           {/* Action Icon */}
           <Box
             sx={{
               width: 36,
               height: 36,
               borderRadius: 1.5,
               bgcolor: config.bgColor,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               flexShrink: 0,
             }}
           >
             <IconComponent size={18} color={config.color} />
           </Box>

           {/* Main Content */}
           <Box flex={1} minWidth={0}>
             <Box display="flex" alignItems="center" gap={1} mb={0.5}>
               <Typography variant="body2" fontWeight={600} color={config.color}>
                 {config.label}
               </Typography>
               <Typography variant="caption" color="text.secondary">
                 {dayjs(log.createdAt).format('HH:mm')}
               </Typography>
             </Box>
             
             <Typography variant="caption" color="text.secondary" noWrap>
               {log.log}
             </Typography>
           </Box>

           {/* Quantity Change - Most Important Info */}
           <Box textAlign="right" minWidth={80}>
             <Typography 
               variant="h6" 
               fontWeight={700}
               color={isNegative ? '#EF4444' : '#10B981'}
               sx={{ lineHeight: 1 }}
             >
               {isNegative ? '-' : '+'}{log.quantity}
             </Typography>
             <Typography variant="caption" color="text.secondary">
               {log.prevQty} → {log.afterQty}
             </Typography>
           </Box>
         </Box>
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
         {sortedDate.map((date) => {
           const logs = groupedLogs[date];
           const isExpanded = expandedDates.has(date);
           const logsArray = logs as any[];

           // Calculate summary for this date
           const stockIn = logsArray.filter((log: any) => log.type === InventoryLogType.STOCK_IN || log.type === InventoryLogType.RESTOCK).reduce((sum: number, log: any) => sum + log.quantity, 0);
           const stockOut = logsArray.filter((log: any) => log.type === InventoryLogType.SUBTRACT || log.type === InventoryLogType.LOST).reduce((sum: number, log: any) => sum + log.quantity, 0);

           return (
             <Card
               key={date}
               sx={{
                 mb: 2,
                 borderRadius: 2,
                 border: '1px solid #E5E7EB',
                 boxShadow: 'none',
                 overflow: 'hidden',
               }}
             >
               <Box
                 sx={{
                   p: 2,
                   cursor: 'pointer',
                   bgcolor: isExpanded ? alpha('#3B82F6', 0.02) : 'transparent',
                   transition: 'all 0.2s ease',
                   '&:hover': {
                     bgcolor: alpha('#3B82F6', 0.05),
                   },
                 }}
                 onClick={() => toggleDateExpansion(date)}
               >
                 <Box display="flex" alignItems="center" justifyContent="space-between">
                   <Box display="flex" alignItems="center" gap={2}>
                     <Box
                       sx={{
                         width: 32,
                         height: 32,
                         borderRadius: 1.5,
                         bgcolor: alpha('#3B82F6', 0.1),
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                       }}
                     >
                       <Calendar size={16} color="#3B82F6" />
                     </Box>
                     <Box>
                       <Typography variant="subtitle1" fontWeight={600}>
                         {dayjs(date).format('MMM DD, YYYY')}
                       </Typography>
                       <Typography variant="caption" color="text.secondary">
                         {logsArray.length} {logsArray.length === 1 ? 'entry' : 'entries'}
                       </Typography>
                     </Box>
                   </Box>

                   <Box display="flex" alignItems="center" gap={2}>
                     {/* Quick Summary */}
                     <Box display="flex" gap={1}>
                       {stockIn > 0 && (
                         <Chip
                           label={`+${stockIn}`}
                           size="small"
                           sx={{
                             bgcolor: alpha('#10B981', 0.1),
                             color: '#10B981',
                             fontWeight: 600,
                             fontSize: '0.75rem',
                             height: 24,
                           }}
                         />
                       )}
                       {stockOut > 0 && (
                         <Chip
                           label={`-${stockOut}`}
                           size="small"
                           sx={{
                             bgcolor: alpha('#EF4444', 0.1),
                             color: '#EF4444',
                             fontWeight: 600,
                             fontSize: '0.75rem',
                             height: 24,
                           }}
                         />
                       )}
                     </Box>
                     
                     <IconButton size="small">
                       {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                     </IconButton>
                   </Box>
                 </Box>
               </Box>

               <Collapse in={isExpanded}>
                 <Box sx={{ p: 2, pt: 0 }}>
                   {logsArray.map((log: any) => renderLogEntry(log))}
                 </Box>
               </Collapse>
             </Card>
           );
         })}
       </Box>
     );
  };

  const renderQuickSummary = () => {
    if (!selectedItem || !logs) return null;

    const totalStockIn = logs.filter((log: any) => log.type === InventoryLogType.STOCK_IN || log.type === InventoryLogType.RESTOCK).reduce((sum: number, log: any) => sum + log.quantity, 0);
    const totalStockOut = logs.filter((log: any) => log.type === InventoryLogType.SUBTRACT || log.type === InventoryLogType.LOST).reduce((sum: number, log: any) => sum + log.quantity, 0);
    const netChange = totalStockIn - totalStockOut;
    const latestLog = logs[0];
    const currentStock = latestLog?.afterQty || 0;

    return (
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          boxShadow: 'none',
          bgcolor: alpha('#3B82F6', 0.02),
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: alpha('#3B82F6', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Package size={16} color="#3B82F6" />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedItem.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedItem.sku}
              </Typography>
            </Box>
          </Box>

          <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700} color="#3B82F6">
                {currentStock}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current Stock
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700} color="#10B981">
                +{totalStockIn}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total In
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700} color="#EF4444">
                -{totalStockOut}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Out
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography 
                variant="h6" 
                fontWeight={700} 
                color={netChange >= 0 ? '#10B981' : '#EF4444'}
              >
                {netChange >= 0 ? '+' : ''}{netChange}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Net Change
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {renderItemSelector()}
      {selectedItem && renderQuickSummary()}
      {renderFilters()}
      {renderLogsTimeline()}
    </Box>
  );
}
