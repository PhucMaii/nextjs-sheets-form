import React, { useState } from 'react';
import { IInventoryCount, IInventoryItem } from '@/app/utils/type';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Badge,
  alpha,
  Divider,
  Stack,
  Paper,
  Chip,
  Collapse,
  Button,
} from '@mui/material';
import { FileText } from 'lucide-react';
import { Edit2, X } from 'lucide-react';
import { LoadingButton } from '@mui/lab';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface IProps {
  currentReportItems: IInventoryCount[];
  handleSubmitReport: () => Promise<void>;
  inventoryItems: IInventoryItem[];
  handleItemClick: (item: IInventoryItem) => void;
  handleRemoveItem: (itemId: number) => void;
  handleClearReport: () => void;
}

export default function SubmitReportSection({
  currentReportItems,
  handleSubmitReport,
  inventoryItems,
  handleItemClick,
  handleRemoveItem,
  handleClearReport,
}: IProps) {
  const [isCurrentReportExpanded, setIsCurrentReportExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await handleSubmitReport();
    setIsSubmitting(false);
  };

  return (
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
            <LoadingButton
              loading={isSubmitting}
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
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
            </LoadingButton>
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
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  flex={1}
                  minWidth={0}
                >
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
                    onClick={() => handleRemoveItem(reportItem.inventoryItemId)}
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
  );
}
