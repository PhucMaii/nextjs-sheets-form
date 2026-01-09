'use client';
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Box,
  Typography,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  useMediaQuery,
  Button,
  Stack,
  IconButton,
  InputAdornment,
  Fab,
  Badge,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { API_URL } from '@/app/utils/enum';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import { IInventoryCount, IInventoryItem } from '@/app/utils/type';
import { alpha } from '@mui/material/styles';
import { primary, success } from '@/theme/color';
import CountInputDialog from '@/app/admin/[companyId]/components/Inventory/CountInputDialog';
import { BorderSection } from '@/app/admin/[companyId]/reports/styled';
import InventoryReportDialog from '../components/Modals/InventoryReportDialog';
import { useSearchParams } from 'next/navigation';
import { InventoryReportType } from '@prisma/client';
import useSelectDate from '@/hooks/useSelectDate';
import { YYYYMMDDFormat } from '@/app/utils/time';

export default function SubmitInventoryReportPage() {
  const searchParams: any = useSearchParams();
  const reportType = searchParams?.get('reportType') as InventoryReportType;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentReportItems, setCurrentReportItems] = useState<
    IInventoryCount[]
  >([]);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showReportDrawer, setShowReportDrawer] = useState<boolean>(false);
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));
  const { showNotification, NotificationComp } = useNotification();

  // DatePicker for report date selection (defaults to today)
  const todayDateString = YYYYMMDDFormat(new Date());
  const reportDateHook = useSelectDate(
    todayDateString,
    true,
    false,
    false,
    true,
  );

  const { data: inventoryItems } = useQuery({
    queryKey: ['driver-inventory-items'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL.DRIVER}/inventory`);
      return response.data.data;
    },
  });

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

  const handleSaveCount = (countInput: number, selectedUnit: any) => {
    if (!selectedItem) return;

    const existingIndex = currentReportItems.findIndex(
      (reportItem) => reportItem.inventoryItemId === selectedItem.id,
    );

    let updatedItems: IInventoryCount[];
    if (existingIndex >= 0) {
      updatedItems = [...currentReportItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        countedQty: countInput,
      };
    } else {
      updatedItems = [
        ...currentReportItems,
        {
          inventoryItemId: selectedItem.id,
          inventoryUnitId: selectedUnit.id,
          countedQty: countInput,
          inventoryItem: selectedItem,
          inventoryUnit: selectedUnit,
          id: Date.now(),
          reportId: Date.now(),
        },
      ];
    }

    setCurrentReportItems(updatedItems);
    setIsDialogOpen(false);
    setSelectedItem(null);
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

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL.DRIVER}/inventory-report`, {
        report: {
          note: note,
          type: reportType,
          queryDate: reportDateHook.date,
          inventoryCounts: currentReportItems.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            inventoryUnitId: item.inventoryUnitId,
            countedQty: item.countedQty,
          })),
        },
      });

      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      showNotification(
        'success',
        res.data.message || 'Report submitted successfully',
      );
      setCurrentReportItems([]);
      setNote('');
      setShowReportDrawer(false);
    } catch (error: any) {
      console.log(
        'Something went wrong while submitting inventory report',
        error,
      );
      showNotification('error', 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearReport = () => {
    setCurrentReportItems([]);
    setNote('');
    showNotification('info', 'Report cleared');
  };

  return (
    <Sidebar>
      {NotificationComp}
      {/* Sticky Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          color: 'text.primary',
          top: isMobile ? 0 : 0,
          zIndex: 1100,
          p: 2,
          borderRadius: 2,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: '56px !important', sm: '64px !important' },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              fontWeight={700}
              color="primary.main"
              noWrap
            >
              {reportType === InventoryReportType.COUNT
                ? 'Submit Inventory Report'
                : 'Submit Driver Return'}
            </Typography>
            {currentReportItems.length > 0 && (
              <Badge
                badgeContent={currentReportItems.length}
                color="primary"
                sx={{ mr: 1 }}
              >
                <IconButton
                  color="primary"
                  onClick={() => setShowReportDrawer(true)}
                  sx={{
                    backgroundColor: alpha(primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(primary.main, 0.2),
                    },
                  }}
                >
                  <CheckCircleIcon />
                </IconButton>
              </Badge>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2 }, pt: 2, pb: 12 }}> */}
      {/* Search */}
      <Paper
        elevation={0}
        sx={{
          p: isMobile ? 1.5 : 2,
          my: 1,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          px: 2,
          pb: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
            },
          }}
        />

        {/* Items List */}
        <Box mb={2}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1.5}
          >
            <Typography
              variant="subtitle1"
              fontWeight={600}
              color="text.primary"
            >
              Items
            </Typography>
            <Chip
              label={filteredItems?.length || 0}
              size="small"
              sx={{
                backgroundColor: alpha(primary.main, 0.1),
                color: primary.main,
                fontWeight: 600,
              }}
            />
          </Box>
          <Stack spacing={isMobile ? 1.5 : 2}>
            {filteredItems?.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  backgroundColor: alpha('#000', 0.02),
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {searchQuery
                    ? 'No items found matching your search'
                    : 'No items available'}
                </Typography>
              </Paper>
            ) : (
              filteredItems?.map((item: IInventoryItem) => {
                const currentCount = getItemCount(item.id);
                const defaultUnit = item.vendorItem?.[0]?.unit;
                const hasCount = currentCount !== null;

                return (
                  <BorderSection
                    key={item.id}
                    sx={{
                      p: isMobile ? 2 : 2.5,
                      borderRadius: 3,
                    }}
                    $isHighlighted={hasCount}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={2}
                    >
                      <Box flex={1} minWidth={0}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          mb={0.5}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="text.primary"
                            noWrap
                          >
                            {item.name}
                          </Typography>
                          {hasCount && (
                            <CheckCircleIcon
                              sx={{
                                color: success.main,
                                fontSize: 18,
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>
                        {defaultUnit && (
                          <Chip
                            label={item.sku || 'N/A'}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              borderColor: 'divider',
                            }}
                          />
                        )}
                        {hasCount && (
                          <Typography
                            variant="caption"
                            color="primary.main"
                            fontWeight={600}
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            Count: {currentCount} {defaultUnit?.unit || ''}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        variant={hasCount ? 'contained' : 'outlined'}
                        size={isMobile ? 'medium' : 'large'}
                        onClick={() => handleItemClick(item)}
                        startIcon={hasCount ? <EditIcon /> : <AddIcon />}
                        sx={{
                          minWidth: isMobile ? 100 : 120,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {hasCount ? 'Edit' : 'Add'}
                      </Button>
                    </Box>
                  </BorderSection>
                );
              })
            )}
          </Stack>
        </Box>
        {/* </Container> */}

        {/* Floating Action Button for Submit */}
        {currentReportItems.length > 0 && !showReportDrawer && (
          <Fab
            color="primary"
            aria-label="submit report"
            sx={{
              position: 'fixed',
              bottom: isMobile ? 80 : 24,
              right: isMobile ? 16 : 24,
              zIndex: 1000,
              boxShadow: `0 4px 20px ${alpha(primary.main, 0.4)}`,
            }}
            onClick={() => setShowReportDrawer(true)}
          >
            <Badge badgeContent={currentReportItems.length} color="error">
              <SendIcon />
            </Badge>
          </Fab>
        )}
      </Paper>

      {/* Report Drawer/Bottom Sheet */}
      <InventoryReportDialog
        showReportDrawer={showReportDrawer}
        setShowReportDrawer={setShowReportDrawer}
        currentReportItems={currentReportItems}
        inventoryItems={inventoryItems}
        handleRemoveItem={handleRemoveItem}
        handleClearReport={handleClearReport}
        handleSubmitReport={handleSubmitReport}
        isSubmitting={isSubmitting}
        note={note}
        setNote={setNote}
        isMobile={isMobile}
        reportDatePicker={reportDateHook.SelectDate}
      />
      <CountInputDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        handleSaveCount={handleSaveCount}
        currentReportItems={currentReportItems}
      />
    </Sidebar>
  );
}
