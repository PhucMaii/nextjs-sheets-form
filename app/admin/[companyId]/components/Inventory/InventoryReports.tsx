'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  alpha,
  Paper,
  Stack,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MessageSquare,
  Search,
  Package,
  ChevronDown,
  Save,
  Filter,
  Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import { InventoryReportType } from '@prisma/client';
import dayjs from 'dayjs';
import ItemSelector from './ItemSelector';
import CountInputDialog from './CountInputDialog';
import {
  IInventoryCount,
  IInventoryItem,
  IInventoryReport,
} from '@/app/utils/type';
import { generateMonthRange, YYYYMMDDFormat } from '@/app/utils/time';
import SelectDateRange from '../Select/SelectDateRange';
import ReportCard from './ReportCard';
import SubmitReportSection from './SubmitReportSection';
import ConfirmModal from '../Modals/ConfirmModal';
import { blueGrey } from '@mui/material/colors';
import useSelectDate from '@/hooks/useSelectDate';

interface IProps {
  showNotification: (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
  ) => void;
}

export default function InventoryReports({ showNotification }: IProps) {
  const { companyId }: any = useParams();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentReportItems, setCurrentReportItems] = useState<
    IInventoryCount[]
  >([]);
  const [dateRange, setDateRange] = useState<any>(generateMonthRange());
  const [deleteReportProps, setDeleteReportProps] = useState<any>({
    open: false,
    reportId: null,
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedItemsForCount, setSelectedItemsForCount] = useState<
    Set<number>
  >(new Set());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reportTypeFilter, setReportTypeFilter] = useState<
    InventoryReportType | 'ALL'
  >('ALL');
  const [reportTypeFilterMenuAnchor, setReportTypeFilterMenuAnchor] =
    useState<null | HTMLElement>(null);
  const openReportTypeFilterMenu = Boolean(reportTypeFilterMenuAnchor);

  // DatePicker for report date selection (defaults to today)
  const todayDateString = YYYYMMDDFormat(new Date());
  const reportDateHook = useSelectDate(
    todayDateString,
    false,
    false,
    false,
    true
  );
  const ReportDatePicker = reportDateHook.SelectDate;
  // reportDateHook.date is available for future use when backend supports custom report dates

  const { data: reports, refetch: refetchReports } = useQuery({
    queryKey: ['inventory-reports', dateRange],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/inventory-report?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
        ),
      );
      return response.data.data || [];
    },
    enabled: !!companyId,
  });

  const { data: inventoryItems, refetch: refetchInventoryItems } = useQuery({
    queryKey: ['inventory-items', isEditMode],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/inventory?${isEditMode ? '' : 'isAllowedToCount=true'}`,
        ),
      );
      return response.data.data;
    },
  });

  useEffect(() => {
    if (inventoryItems) {
      const allowedItems = new Set<number>();
      (inventoryItems || []).forEach((item: any) => {
        if (item?.isAllowedToCount) {
          allowedItems.add(item.id);
        }
      });
      setSelectedItemsForCount(allowedItems);
    }
  }, [inventoryItems]);

  // Initialize selected items based on isAllowedToCount when entering edit mode
  useEffect(() => {
    if (isEditMode && inventoryItems) {
      const allowedItems = new Set<number>();
      (inventoryItems || []).forEach((item: any) => {
        if (item.isAllowedToCount) {
          allowedItems.add(item.id);
        }
      });
      setSelectedItemsForCount(allowedItems);
    }
  }, [isEditMode, inventoryItems]);

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

  // Filter reports based on type
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    if (reportTypeFilter === 'ALL') {
      return reports;
    }
    return reports.filter(
      (report: IInventoryReport) => report.type === reportTypeFilter,
    );
  }, [reports, reportTypeFilter]);

  // Group reports by date
  const reportsByDate = useMemo(() => {
    if (!filteredReports || filteredReports.length === 0) return [];

    const grouped: Record<string, IInventoryReport[]> = {};

    filteredReports.forEach((report: IInventoryReport) => {
      const dateKey = dayjs(report.queryDate).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(report);
    });

    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      return dayjs(b).valueOf() - dayjs(a).valueOf();
    });

    // Sort reports within each date by creation time (newest first)
    sortedDates.forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => {
        return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
      });
    });

    return sortedDates.map((dateKey) => ({
      date: dateKey,
      reports: grouped[dateKey],
    }));
  }, [filteredReports]);

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

  const handleSubmitReport = async () => {
    if (currentReportItems?.length === 0) {
      showNotification('warning', 'Please add at least one item to the report');
      return;
    }

    try {
      const res = await axios.post(
        getAdminApiUrl(companyId, '/inventory-report'),
        {
          report: {
            companyId: companyId,
            note: '',
            inventoryCounts: currentReportItems,
            queryDate: reportDateHook.date,
          },
        },
      );

      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      await refetchReports();
      showNotification('success', res.data.message);
      setCurrentReportItems([]);
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      showNotification('error', 'Failed to submit report');
    }
  };

  const handleClearReport = () => {
    setCurrentReportItems([]);
    showNotification('info', 'Report cleared');
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      const res = await axios.delete(
        getAdminApiUrl(companyId, `/inventory-report?reportId=${reportId}`),
      );
      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      await refetchReports();
      showNotification('success', res.data.message);
      setDeleteReportProps({ open: false, reportId: 0 });
    } catch (error: any) {
      console.error('Failed to delete report:', error);
      showNotification('error', 'Failed to delete report');
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setIsSearchExpanded(true);
    }
  };

  const handleToggleItemSelection = (itemId: number) => {
    const newSelection = new Set(selectedItemsForCount);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItemsForCount(newSelection);
  };

  const handleSelectAll = () => {
    if (filteredItems.length === 0) return;
    const allSelected = filteredItems.every((item: any) =>
      selectedItemsForCount.has(item.id),
    );
    const newSelection = new Set<number>();
    if (!allSelected) {
      filteredItems.forEach((item: any) => {
        newSelection.add(item.id);
      });
    }
    setSelectedItemsForCount(newSelection);
  };

  const handleSubmitCountPermissions = async () => {
    if (selectedItemsForCount.size === 0) {
      showNotification('warning', 'Please select at least one item');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get all items that should be updated
      // const allItemIds = (inventoryItems || []).map((item: any) => item.id);
      const itemsToAllow = Array.from(selectedItemsForCount);
      // const itemsToDisallow = allItemIds.filter(
      //   (id: number) => !selectedItemsForCount.has(id),
      // );

      // Update items that should be allowed
      if (itemsToAllow.length > 0) {
        await axios.put(
          getAdminApiUrl(companyId, '/inventory/save-allowed-count'),
          {
            itemIds: itemsToAllow,
          },
        );
      }

      await refetchInventoryItems();
      showNotification(
        'success',
        `Successfully updated count permissions for ${itemsToAllow.length} item(s)`,
      );
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Failed to update count permissions:', error);
      showNotification(
        'error',
        error.response?.data?.error || 'Failed to update count permissions',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchReportType = (type: InventoryReportType | 'ALL') => {
    setReportTypeFilter(type);
    setReportTypeFilterMenuAnchor(null);
  };

  const renderReportTypeFilter = () => {
    return (
      <>
        <IconButton
          onClick={(e) => setReportTypeFilterMenuAnchor(e.currentTarget)}
        >
          <Filter size={16} color="#999" />
        </IconButton>
        <Menu
          anchorEl={reportTypeFilterMenuAnchor}
          open={openReportTypeFilterMenu}
          onClose={() => setReportTypeFilterMenuAnchor(null)}
        >
          <MenuItem
            value="ALL"
            onClick={() => handleSwitchReportType('ALL')}
            sx={{
              bgcolor:
                reportTypeFilter === 'ALL'
                  ? alpha(blueGrey[500], 0.1)
                  : 'transparent',
            }}
          >
            All
          </MenuItem>
          <MenuItem
            value={InventoryReportType.COUNT}
            onClick={() => handleSwitchReportType(InventoryReportType.COUNT)}
            sx={{
              bgcolor:
                reportTypeFilter === InventoryReportType.COUNT
                  ? alpha(blueGrey[500], 0.1)
                  : 'transparent',
            }}
          >
            Stocktake
          </MenuItem>
          <MenuItem
            value={InventoryReportType.DRIVER_RETURN}
            onClick={() =>
              handleSwitchReportType(InventoryReportType.DRIVER_RETURN)
            }
            sx={{
              bgcolor:
                reportTypeFilter === InventoryReportType.DRIVER_RETURN
                  ? alpha(blueGrey[500], 0.1)
                  : 'transparent',
            }}
          >
            Driver Return
          </MenuItem>
        </Menu>
      </>
    );
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
                {isEditMode
                  ? 'Select Items for Counting'
                  : 'Add Items to Report'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredItems.length} items available
                {isEditMode &&
                  ` • ${selectedItemsForCount.size} selected for counting`}
              </Typography>
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={isEditMode}
                    onChange={handleToggleEditMode}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    {isEditMode ? 'Edit Mode On' : 'Edit Mode Off'}
                  </Typography>
                }
              />
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

          {isEditMode && filteredItems.length > 0 && (
            <Box mb={2}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleSelectAll}
                sx={{ mb: 1 }}
              >
                {filteredItems.every((item: any) =>
                  selectedItemsForCount.has(item.id),
                )
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </Box>
          )}

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
              if (isEditMode) {
                const isSelectedForCount = selectedItemsForCount.has(item.id);
                return (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.5,
                      border: isSelectedForCount
                        ? '2px solid #3B82F6'
                        : '1px solid #E5E7EB',
                      borderRadius: 1.5,
                      transition: 'all 0.2s ease',
                      bgcolor: isSelectedForCount
                        ? alpha('#3B82F6', 0.05)
                        : 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: '#3B82F6',
                        bgcolor: alpha('#3B82F6', 0.05),
                      },
                    }}
                    onClick={() => handleToggleItemSelection(item.id)}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Checkbox
                        checked={isSelectedForCount}
                        onChange={() => handleToggleItemSelection(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        color="primary"
                      />
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
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          noWrap
                        >
                          {item.sku || 'No SKU'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              }

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

          {isEditMode && (
            <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Save size={16} />
                  )
                }
                onClick={handleSubmitCountPermissions}
                disabled={isSubmitting || selectedItemsForCount.size === 0}
                sx={{
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                {isSubmitting
                  ? 'Saving...'
                  : `Save Count Permissions (${selectedItemsForCount.size} selected)`}
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Compact Current Report Section - Sticky when has items */}
      {currentReportItems.length > 0 && (
        <Box>
          <Box mb={1.5}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              Report Date
            </Typography>
            <Box sx={{ maxWidth: 300 }}>
              {ReportDatePicker}
            </Box>
          </Box>
          <SubmitReportSection
            currentReportItems={currentReportItems}
            handleSubmitReport={handleSubmitReport}
            inventoryItems={inventoryItems}
            handleItemClick={handleItemClick}
            handleRemoveItem={handleRemoveItem}
            handleClearReport={handleClearReport}
          />
        </Box>
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
            Reports ({filteredReports?.length || 0})
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {renderReportTypeFilter()}
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Box>
        </Box>

        {!reports || reports.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: alpha('#000', 0.02),
            }}
            elevation={0}
          >
            <MessageSquare size={32} style={{ marginBottom: 12 }} />
            <Typography variant="subtitle1" color="text.secondary">
              No reports yet. Create your first inventory count report above.
            </Typography>
          </Paper>
        ) : filteredReports.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: alpha('#000', 0.02),
            }}
            elevation={0}
          >
            <Filter size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <Typography variant="subtitle1" color="text.secondary">
              No reports match the selected filter.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2.5}>
            {reportsByDate.map((dateGroup) => {
              const isToday = dayjs(dateGroup.date).isSame(dayjs(), 'day');
              const isYesterday = dayjs(dateGroup.date).isSame(
                dayjs().subtract(1, 'day'),
                'day',
              );
              const dateLabel = isToday
                ? 'Today'
                : isYesterday
                  ? 'Yesterday'
                  : dayjs(dateGroup.date).format('MMMM D, YYYY');

              return (
                <Box key={dateGroup.date}>
                  {/* Date Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mb: 1.5,
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      backgroundColor: 'background.paper',
                      py: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        // bgcolor: alpha('#3B82F6', 0.08),
                        // border: '1px solid',
                        border: '1px solid',
                        borderColor: blueGrey[100],
                      }}
                    >
                      <Calendar size={14} color={blueGrey[500]} />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        // sx={{ color: '#3B82F6' }}
                      >
                        {dateLabel}
                      </Typography>
                      <Box
                        sx={{
                          ml: 0.5,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 1,
                          bgcolor: alpha('#3B82F6', 0.15),
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{ color: '#3B82F6', fontSize: '0.65rem' }}
                        >
                          {dateGroup.reports.length}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        height: 1,
                        bgcolor: alpha('#000', 0.08),
                      }}
                    />
                  </Box>

                  {/* Reports for this date */}
                  <Stack spacing={1}>
                    {dateGroup.reports.map((report: IInventoryReport) => {
                      return (
                        <ReportCard
                          key={report.id}
                          report={report}
                          handleDeleteReport={(reportId: number) =>
                            setDeleteReportProps({
                              open: true,
                              reportId: reportId,
                            })
                          }
                          showNotification={showNotification}
                          refetchReport={() => refetchReports()}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <CountInputDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        handleSaveCount={handleSaveCount}
        currentReportItems={currentReportItems}
      />
      {deleteReportProps.reportId && (
        <ConfirmModal
          open={deleteReportProps.open}
          onClose={() => setDeleteReportProps({ open: false, reportId: null })}
          title={`Are you sure to delete report #${deleteReportProps.reportId}?`}
          handleSubmit={() => handleDeleteReport(deleteReportProps.reportId)}
          showNotification={showNotification}
          color="error"
          buttonLabel="Yes, I'm sure"
        />
      )}
    </Box>
  );
}
