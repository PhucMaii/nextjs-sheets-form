import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  TextField,
  Button,
  Stack,
  Paper,
} from '@mui/material';
import { IInventoryCount, IInventoryItem } from '@/app/utils/type';
import { alpha } from '@mui/material/styles';
import { primary } from '@/theme/color';
import { LoadingButton } from '@mui/lab';
import { SendIcon, DeleteIcon } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';

interface IProps {
  showReportDrawer: boolean;
  setShowReportDrawer: (showReportDrawer: boolean) => void;
  currentReportItems: IInventoryCount[];
  inventoryItems: IInventoryItem[];
  handleRemoveItem: (itemId: number) => void;
  handleClearReport: () => void;
  handleSubmitReport: () => void;
  isSubmitting: boolean;
  note: string;
  setNote: (note: string) => void;
  isMobile: boolean;
  reportDatePicker: JSX.Element;
}

export default function InventoryReportDialog({
  showReportDrawer,
  setShowReportDrawer,
  currentReportItems,
  inventoryItems,
  handleRemoveItem,
  handleClearReport,
  handleSubmitReport,
  isSubmitting,
  note,
  setNote,
  isMobile,
  reportDatePicker,
}: IProps) {
  return (
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            Current Report
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={`${currentReportItems.length} items`}
              size="small"
              color="primary"
            />
            <IconButton onClick={() => setShowReportDrawer(false)} size="small">
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
          <Box mb={2}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              Report Date
            </Typography>
            {reportDatePicker}
          </Box>
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
  );
}
