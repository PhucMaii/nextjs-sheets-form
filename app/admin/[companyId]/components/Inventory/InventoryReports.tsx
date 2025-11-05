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
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  Badge,
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
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { generateCurrentTime } from '@/app/utils/time';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import ItemSelector from './ItemSelector';
import CountInputDialog from './CountInputDialog';
import { IInventoryCount, IInventoryItem, IInventoryReport } from '@/app/utils/type';
import { InventoryReportType } from '@prisma/client';

interface IProps {
  showNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
  ) => void;
}

export default function InventoryReports({ showNotification }: IProps) {
  const { companyId }: any = useParams();

  const [reports, setReports] = useState<IInventoryReport[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentReportItems, setCurrentReportItems] = useState<IInventoryCount[]>(
    [],
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [isCurrentReportExpanded, setIsCurrentReportExpanded] = useState<boolean>(false);
  const [expandedReports, setExpandedReports] = useState<Set<number>>(new Set());

  // const { data: inventoryReports } = useQuery({
  //   queryKey: ['inventory-reports'],
  //   queryFn: async () => {
  //     const response = await axios.get(getAdminApiUrl(companyId, '/inventory-report'));
  //     return response.data.data;
  //   },
  //   enabled: !!companyId,
  // });

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
  }, [searchQuery, inventoryItems]);

  // Check if item is already in current report
  const getItemCount = (itemId: number): number | null => {
    const reportItem = currentReportItems.find(
      (item) => item.inventoryItemId === itemId,
    );
    return reportItem ? reportItem.countedQty : null;
  };

  const handleItemClick = (item: IInventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleSaveCount = (countInput: number, inventoryUnit: any) => {
    if (!selectedItem) return;

    if (isNaN(countInput) || countInput < 0) {
      showNotification('warning', 'Please enter a valid number');
      return;
    }

    // Update or add item to current report
    const existingIndex = currentReportItems.findIndex(
      (item) => item.inventoryItemId === selectedItem.id,
    );

    let updatedItems: IInventoryCount[];
    if (existingIndex >= 0) {
      // Update existing item
      updatedItems = [...currentReportItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        countedQty: countInput,
      };
    } else {
      // Add new item
      updatedItems = [
        ...currentReportItems,
        {
          inventoryItemId: selectedItem.id,
          inventoryUnitId: inventoryUnit.id,
          countedQty: countInput,
          inventoryItem: selectedItem,
          inventoryUnit: inventoryUnit,
          id: Date.now(),
          reportId: Date.now(),
        },
      ];
    }

    setCurrentReportItems(updatedItems);
    setIsDialogOpen(false);
    setSelectedItem(null);
    showNotification('success', `Count for ${selectedItem.name} saved`);
  };

  const handleRemoveItem = (itemId: number) => {
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

    const newReport: IInventoryReport = {
      id: Date.now(),
      inventoryCount: [...currentReportItems],
      createdAt: now,
      createdBy: 'Current User', // This would come from auth context
      queryDate: date,
      companyId: companyId,
      note: 'Inventory count report',
      type: InventoryReportType.COUNT,
    };

    setReports([...reports, newReport]);
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

  const handleDeleteReport = (reportId: number) => {
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

  const toggleReportExpanded = (reportId: number) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  return (
    <Box display="flex" flexDirection="column" gap={1.5}>
      {/* Compact Search Section - Collapsible */}
      <Accordion
        expanded={isSearchExpanded}
        onChange={() => setIsSearchExpanded(!isSearchExpanded)}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha('#000', 0.06),
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            margin: 0,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ChevronDown size={18} />}
          sx={{
            minHeight: 56,
            px: 2,
            '&.Mui-expanded': {
              minHeight: 56,
            },
            '& .MuiAccordionSummary-content': {
              my: 1.5,
              '&.Mui-expanded': {
                my: 1.5,
              },
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} width="100%">
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
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                Add Items to Report
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredItems.length} items available
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search items by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#999" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 1,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {(filteredItems || []).map((item: any) => {
              const itemCount = getItemCount(item.id);
              const isSelected = itemCount !== null;

              return (
                <ItemSelector
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  onClick={() => handleItemClick(item)}
                  itemCount={itemCount}
                />
              );
            })}
          </Box>

          {filteredItems.length === 0 && (
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                borderRadius: 1.5,
                backgroundColor: alpha('#000', 0.02),
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No items found matching &quot;{searchQuery}&quot;
              </Typography>
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Compact Current Report Section - Sticky when has items */}
      {currentReportItems.length > 0 && (
        <Card
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha('#10B981', 0.3),
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
            background: alpha('#10B981', 0.03),
            position: 'sticky',
            top: 16,
            zIndex: 10,
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              onClick={() => setIsCurrentReportExpanded(!isCurrentReportExpanded)}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Badge badgeContent={currentReportItems.length} color="primary">
                  <FileText size={18} color="#10B981" />
                </Badge>
                <Typography variant="subtitle2" fontWeight={600}>
                  Current Report ({currentReportItems.length} items)
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCurrentReportExpanded(!isCurrentReportExpanded);
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  {isCurrentReportExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </IconButton>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearReport();
                  }}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    px: 1.5,
                    minWidth: 'auto',
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubmitReport();
                  }}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    bgcolor: '#10B981',
                    '&:hover': { bgcolor: '#059669' },
                    px: 2,
                    minWidth: 'auto',
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>

            <Collapse in={isCurrentReportExpanded}>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={0.75}>
                {(currentReportItems || []).map((reportItem) => (
                  <Paper
                    key={reportItem.inventoryItemId}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} flex={1} minWidth={0}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{ flex: 1 }}
                      >
                        {reportItem.inventoryItem.name}
                      </Typography>
                      <Chip
                        label={reportItem.countedQty}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 24, fontSize: '0.75rem' }}
                      />
                    </Box>
                    <Box display="flex" gap={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const item = inventoryItems?.find(
                            (i: any) => i.id === reportItem.inventoryItemId,
                          );
                          if (item) handleItemClick(item);
                        }}
                        sx={{
                          color: '#3B82F6',
                          p: 0.5,
                          '&:hover': { bgcolor: alpha('#3B82F6', 0.1) },
                        }}
                      >
                        <Edit2 size={14} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleRemoveItem(reportItem.inventoryItemId)
                        }
                        sx={{
                          color: '#EF4444',
                          p: 0.5,
                          '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
                        }}
                      >
                        <X size={14} />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Collapse>
          </CardContent>
        </Card>
      )}

      {/* Compact Reports List */}
      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1.5}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Reports ({reports.length})
          </Typography>
        </Box>

        {reports.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: alpha('#000', 0.02),
            }}
          >
            <MessageSquare
              size={32}
              color="#ccc"
              style={{ marginBottom: 12 }}
            />
            <Typography variant="body2" color="text.secondary">
              No reports yet. Create your first inventory count report above.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {(reports || []).map((report) => {
              const isExpanded = expandedReports.has(report.id);
              return (
                <Accordion
                  key={report.id}
                  expanded={isExpanded}
                  onChange={() => toggleReportExpanded(report.id)}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha('#000', 0.06),
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      margin: 0,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ChevronDown size={18} />}
                    sx={{
                      minHeight: 56,
                      px: 2,
                      '&.Mui-expanded': {
                        minHeight: 56,
                      },
                      '& .MuiAccordionSummary-content': {
                        my: 1,
                        '&.Mui-expanded': {
                          my: 1,
                        },
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      width="100%"
                      pr={2}
                    >
                      <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha('#3B82F6', 0.1),
                            color: '#3B82F6',
                          }}
                        >
                          <User size={16} />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {report.createdBy}
                          </Typography>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={0.75}
                            mt={0.25}
                          >
                            <Calendar size={12} color="#999" />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(report.queryDate)}
                            </Typography>
                            <Box
                              sx={{
                                width: 3,
                                height: 3,
                                borderRadius: '50%',
                                bgcolor: '#999',
                                mx: 0.5,
                              }}
                            />
                            <Clock size={12} color="#999" />
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(report.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`${report.inventoryCount?.length || 0} items`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(report.id);
                          }}
                          sx={{
                            color: '#EF4444',
                            p: 0.5,
                            '&:hover': {
                              bgcolor: alpha('#EF4444', 0.1),
                            },
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Stack spacing={0.75}>
                      {(report.inventoryCount || []).map((item) => (
                        <Paper
                          key={item.inventoryItemId}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: alpha('#3B82F6', 0.05),
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ flex: 1 }}
                            noWrap
                          >
                            {item.inventoryItem.name}
                          </Typography>
                          <Box display="flex" gap={0.75}>
                            <Chip
                              label={`${item.countedQty} ${item.inventoryUnit.unit}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 24, fontSize: '0.7rem' }}
                            />
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Count Input Dialog */}
      {/* <Dialog
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
      </Dialog> */}
      <CountInputDialog 
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        handleSaveCount={handleSaveCount}
        currentReportItems={currentReportItems}
      />
    </Box>
  );
}
