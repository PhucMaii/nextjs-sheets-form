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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  Chip,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { API_URL } from '@/app/utils/enum';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import { IInventoryCount, IInventoryItem } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';
import { primary, success } from '@/theme/color';
import CountInputDialog from '@/app/admin/[companyId]/components/Inventory/CountInputDialog';
import { BorderSection } from '@/app/admin/[companyId]/reports/styled';

export default function SubmitInventoryReportPage() {
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
              Submit Inventory Report
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
                            label={defaultUnit.unit || 'N/A'}
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

      {/* Quantity Input Dialog */}
      {/* <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              {selectedItem?.name}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {selectedItem?.vendorItem?.[0]?.unit && (
            <Typography variant="caption" color="text.secondary">
              Unit: {selectedItem.vendorItem[0].unit.unit || 'N/A'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            inputRef={quantityInputRef}
            fullWidth
            type="number"
            label="Quantity"
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            placeholder="Enter quantity"
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mt: 2 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveCount();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCount}
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* Report Drawer/Bottom Sheet */}
      <Dialog
        open={showReportDrawer}
        onClose={() => setShowReportDrawer(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? '16px 16px 0 0' : 3,
            maxHeight: isMobile ? '90vh' : '80vh',
            m: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Current Report
            </Typography>
            <Box display="flex" gap={1}>
              <Chip
                label={`${currentReportItems.length} items`}
                size="small"
                color="primary"
              />
              <IconButton
                onClick={() => setShowReportDrawer(false)}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {currentReportItems.map((reportItem) => {
                const item = inventoryItems?.find(
                  (i: IInventoryItem) => i.id === reportItem.inventoryItemId,
                );
                return (
                  <Paper
                    key={reportItem.inventoryItemId}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: alpha(primary.main, 0.02),
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box flex={1}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item?.name || 'Unknown Item'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reportItem.countedQty}{' '}
                          {reportItem.inventoryUnit?.unit || ''}
                        </Typography>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleRemoveItem(reportItem.inventoryItemId)
                        }
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#d32f2f', 0.1),
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            display: 'flex',
            gap: 1,
            flexDirection: isMobile ? 'column-reverse' : 'row',
          }}
        >
          <Button
            onClick={handleClearReport}
            variant="outlined"
            color="error"
            fullWidth={isMobile}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Clear All
          </Button>
          <LoadingButton
            onClick={handleSubmitReport}
            variant="contained"
            loading={isSubmitting}
            fullWidth={isMobile}
            startIcon={<SendIcon />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: `0 4px 12px ${alpha(primary.main, 0.3)}`,
            }}
          >
            Submit Report
          </LoadingButton>
        </DialogActions>
      </Dialog>
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
