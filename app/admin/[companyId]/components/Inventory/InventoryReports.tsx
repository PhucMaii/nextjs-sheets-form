'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  alpha,
  Paper,
  Stack,
  Avatar,
  Grid,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  MessageSquare,
  Search,
  Calendar,
  Clock,
  User,
  Edit2,
  Trash2,
  X,
  Package,
} from 'lucide-react';
import { generateCurrentTime } from '@/app/utils/time';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import ItemSelector from './ItemSelector';

interface IReportItem {
  inventoryItemId: string;
  itemName: string;
  count: number;
}

interface IReport {
  id: string;
  items: IReportItem[];
  createdAt: string;
  createdBy: string;
  date: string;
}

interface IMockInventoryItem {
  id: string;
  name: string;
  sku?: string;
}

interface IProps {
  showNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
  ) => void;
}

export default function InventoryReports({ showNotification }: IProps) {
  const { companyId }: any = useParams();

  const [reports, setReports] = useState<IReport[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<IMockInventoryItem | null>(
    null,
  );
  const [countInput, setCountInput] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentReportItems, setCurrentReportItems] = useState<IReportItem[]>(
    [],
  );

  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const response = await axios.get(getAdminApiUrl(companyId, '/inventory'));
      return response.data.data;
    },
  });

  // Load reports from localStorage on mount
  useEffect(() => {
    try {
      const savedReports = localStorage.getItem('inventoryReports');
      if (savedReports) {
        const parsed = JSON.parse(savedReports);
        // Ensure parsed data is an array
        if (Array.isArray(parsed)) {
          setReports(parsed);
        } else {
          setReports([]);
        }
      }
    } catch (error) {
      console.error('Failed to load reports from localStorage:', error);
      setReports([]);
    }
  }, []);

  // Save reports to localStorage whenever reports change
  useEffect(() => {
    try {
      if (reports.length > 0) {
        localStorage.setItem('inventoryReports', JSON.stringify(reports));
      }
    } catch (error) {
      console.error('Failed to save reports to localStorage:', error);
    }
  }, [reports]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
	if (!inventoryItems) return [];
    if (!searchQuery.trim()) {
      return inventoryItems || [];
    }
    const query = searchQuery.toLowerCase();
    return (inventoryItems || []).filter(
      (item: any) =>
        item.name.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // Check if item is already in current report
  const getItemCount = (itemId: string): number | null => {
    const reportItem = currentReportItems.find(
      (item) => item.inventoryItemId === itemId,
    );
    return reportItem ? reportItem.count : null;
  };

  const handleItemClick = (item: IMockInventoryItem) => {
    const existingCount = getItemCount(item.id);
    setSelectedItem(item);
    setCountInput(existingCount ? existingCount.toString() : '');
    setIsDialogOpen(true);
  };

  const handleSaveCount = () => {
    if (!selectedItem) return;

    const count = parseInt(countInput);
    if (isNaN(count) || count < 0) {
      showNotification('warning', 'Please enter a valid number');
      return;
    }

    // Update or add item to current report
    const existingIndex = currentReportItems.findIndex(
      (item) => item.inventoryItemId === selectedItem.id,
    );

    let updatedItems: IReportItem[];
    if (existingIndex >= 0) {
      // Update existing item
      updatedItems = [...currentReportItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        count,
      };
    } else {
      // Add new item
      updatedItems = [
        ...currentReportItems,
        {
          inventoryItemId: selectedItem.id,
          itemName: selectedItem.name,
          count,
        },
      ];
    }

    setCurrentReportItems(updatedItems);
    setIsDialogOpen(false);
    setSelectedItem(null);
    setCountInput('');
    showNotification('success', `Count for ${selectedItem.name} saved`);
  };

  const handleRemoveItem = (itemId: string) => {
    setCurrentReportItems(
      currentReportItems.filter((item) => item.inventoryItemId !== itemId),
    );
    showNotification('success', 'Item removed from report');
  };

  const handleSubmitReport = () => {
    if (currentReportItems.length === 0) {
      showNotification('warning', 'Please add at least one item to the report');
      return;
    }

    const now = generateCurrentTime();
    const date = new Date().toISOString().split('T')[0];

    const newReport: IReport = {
      id: Date.now().toString(),
      items: [...currentReportItems],
      createdAt: now,
      createdBy: 'Current User', // This would come from auth context
      date,
    };

    setReports([newReport, ...reports]);
    setCurrentReportItems([]);
    showNotification('success', 'Report submitted successfully');

    // Save to localStorage
    const updatedReports = [newReport, ...reports];
    localStorage.setItem('inventoryReports', JSON.stringify(updatedReports));
  };

  const handleClearReport = () => {
    setCurrentReportItems([]);
    showNotification('info', 'Report cleared');
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter((report) => report.id !== reportId));
    showNotification('success', 'Report deleted successfully');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Time';
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Search and Item Selection Section */}
      <Card
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha('#000', 0.06),
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          background: '#ffffff',
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
                Inventory Count Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search and click items to enter counts
              </Typography>
            </Box>
          </Box>

          {/* Search Input */}
          <TextField
            fullWidth
            placeholder="Search items by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#999" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          {/* Items Grid */}
          <Grid container spacing={2}>
            {(filteredItems || []).map((item: any) => {
              const itemCount = getItemCount(item.id);
              const isSelected = itemCount !== null;

              return (
                <Grid item xs={6} sm={4} md={3} key={item.id}>
					<ItemSelector
						key={item.id}
						item={item}
						isSelected={isSelected}
						onClick={() => handleItemClick(item)}
					/>
                  {/* <Button
                    fullWidth
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => handleItemClick(item)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      minHeight: 80,
                      bgcolor: isSelected
                        ? alpha('#3B82F6', 0.1)
                        : 'transparent',
                      borderColor: isSelected ? '#3B82F6' : alpha('#000', 0.12),
                      color: isSelected ? '#3B82F6' : 'text.primary',
                      '&:hover': {
                        bgcolor: isSelected
                          ? alpha('#3B82F6', 0.15)
                          : alpha('#3B82F6', 0.05),
                        borderColor: '#3B82F6',
                      },
                    }}
                  >
                    <Badge
                      badgeContent={itemCount}
                      color="primary"
                      invisible={!isSelected}
                      sx={{
                        '& .MuiBadge-badge': {
                          right: -8,
                          top: -8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: alpha('#3B82F6', 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Package size={16} color="#3B82F6" />
                      </Box>
                    </Badge>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ textAlign: 'center' }}
                    >
                      {item.name}
                    </Typography>
                    {item.sku && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {item.sku}
                      </Typography>
                    )} */}
					
                  {/* </Button> */}
                </Grid>
              );
            })}
          </Grid>

          {filteredItems.length === 0 && (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                backgroundColor: alpha('#000', 0.02),
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No items found matching &quot;{searchQuery}&quot;
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Current Report Items */}
      {currentReportItems.length > 0 && (
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: alpha('#10B981', 0.3),
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            background: alpha('#10B981', 0.02),
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight={600}>
                Current Report ({currentReportItems.length} items)
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearReport}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSubmitReport}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: '#10B981',
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  Submit Report
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              {(currentReportItems || []).map((reportItem) => (
                <Paper
                  key={reportItem.inventoryItemId}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body1" fontWeight={600}>
                      {reportItem.itemName}
                    </Typography>
                    <Chip
                      label={`Count: ${reportItem.count}`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        const item = inventoryItems.find(
                          (i: any) => i.id === reportItem.inventoryItemId,
                        );
                        if (item) handleItemClick(item);
                      }}
                      sx={{ color: '#3B82F6' }}
                    >
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleRemoveItem(reportItem.inventoryItemId)
                      }
                      sx={{ color: '#EF4444' }}
                    >
                      <X size={16} />
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Reports List */}
      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" fontWeight={600}>
            Previous Reports ({reports.length})
          </Typography>
        </Box>

        {reports.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              backgroundColor: alpha('#000', 0.02),
            }}
          >
            <MessageSquare
              size={48}
              color="#ccc"
              style={{ marginBottom: 16 }}
            />
            <Typography variant="body1" color="text.secondary">
              No reports yet. Create your first inventory count report above.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {(reports || []).map((report) => (
              <Card
                key={report.id}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: alpha('#000', 0.06),
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  background: '#ffffff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Report Header */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
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
                        <User size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {report.createdBy}
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mt={0.5}
                        >
                          <Calendar size={14} color="#999" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(report.date)}
                          </Typography>
                          <Box
                            sx={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: '#999',
                              mx: 0.5,
                            }}
                          />
                          <Clock size={14} color="#999" />
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(report.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteReport(report.id)}
                      sx={{
                        color: '#EF4444',
                        '&:hover': {
                          bgcolor: alpha('#EF4444', 0.1),
                        },
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Report Items */}
                  <Stack spacing={1}>
                    {(report.items || []).map((item) => (
                      <Paper
                        key={item.inventoryItemId}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: alpha('#3B82F6', 0.05),
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {item.itemName}
                        </Typography>
                        <Chip
                          label={`Count: ${item.count}`}
                          size="small"
                          color="primary"
                        />
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Count Input Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedItem(null);
          setCountInput('');
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Package size={24} color="#3B82F6" />
            <Typography variant="h6" fontWeight={600}>
              Enter Count
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography variant="body1" fontWeight={600}>
              {selectedItem?.name}
            </Typography>
            {selectedItem?.sku && (
              <Typography variant="caption" color="text.secondary">
                SKU: {selectedItem.sku}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Count"
              type="number"
              value={countInput}
              onChange={(e) => setCountInput(e.target.value)}
              InputProps={{
                inputProps: { min: 0 },
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveCount();
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              setSelectedItem(null);
              setCountInput('');
            }}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCount}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: '#3B82F6',
              '&:hover': { bgcolor: '#2563EB' },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
