import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Avatar,
  Typography,
  Chip,
  IconButton,
  alpha,
  Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  User,
  Calendar,
  Clock,
  Trash2,
  ChevronDown,
  ClipboardCheck,
  Truck,
} from 'lucide-react';
import { IInventoryReport } from '@/app/utils/type';
import { InventoryReportType } from '@prisma/client';
import dayjs from 'dayjs';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

interface IProps {
  report: IInventoryReport;
  handleDeleteReport: (reportId: number) => void;
}
export default function ReportCard({ report, handleDeleteReport }: IProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isDriverReturn = report.type === InventoryReportType.DRIVER_RETURN;

  // Color scheme based on report type
  const typeConfig = isDriverReturn
    ? {
        primaryColor: '#F97316', // Orange
        bgColor: alpha('#F97316', 0.1),
        borderColor: alpha('#F97316', 0.3),
        chipColor: '#F97316',
        label: 'Driver Return',
        icon: Truck,
      }
    : {
        primaryColor: '#3B82F6', // Blue
        bgColor: alpha('#3B82F6', 0.1),
        borderColor: alpha('#3B82F6', 0.3),
        chipColor: '#3B82F6',
        label: 'Stocktake',
        icon: ClipboardCheck,
      };

  const TypeIcon = typeConfig.icon;

  return (
    <Accordion
      key={report.id}
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
      sx={{
        borderRadius: 2,
        border: '2px solid',
        borderColor: typeConfig.borderColor,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          margin: 0,
        },
        '&:hover': {
          borderColor: typeConfig.primaryColor,
          boxShadow: `0 2px 8px ${alpha(typeConfig.primaryColor, 0.15)}`,
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
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: typeConfig.bgColor,
                  color: typeConfig.primaryColor,
                  border: `2px solid ${typeConfig.primaryColor}`,
                }}
              >
                <TypeIcon size={18} />
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: typeConfig.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}
              >
                <User size={8} color="white" />
              </Box>
            </Box>
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.25}>
                <Typography variant="body2" fontWeight={600}>
                  {report.createdBy}
                </Typography>
                <Chip
                  label={typeConfig.label}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    bgcolor: typeConfig.bgColor,
                    color: typeConfig.primaryColor,
                    border: `1px solid ${typeConfig.primaryColor}`,
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </Box>
              <Box display="flex" alignItems="center" gap={0.75} flexWrap="wrap">
                <Typography variant="caption" fontWeight="bold">
                  #{report.id} •
                </Typography>
                <Calendar size={12} color="#999" />
                <Typography variant="caption" color="text.secondary">
                  {dayjs(report.queryDate).format('MMM D, YYYY')}
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
                  {dayjs(report.createdAt).format('HH:mm')}
                </Typography>
                {report?.note && (
                  <Tooltip title={report.note}>
                    <IconButton size="small" sx={{ ml: -0.5 }}>
                      <TextSnippetIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={`${report.inventoryCounts?.length || 0} items`}
              size="small"
              variant="outlined"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                borderColor: typeConfig.primaryColor,
                color: typeConfig.primaryColor,
              }}
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
          {(report.inventoryCounts || []).map((item) => (
            <Paper
              key={item.inventoryItemId}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: typeConfig.bgColor,
                border: '1px solid',
                borderColor: alpha(typeConfig.primaryColor, 0.2),
              }}
              elevation={0}
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
                  variant="outlined"
                  sx={{
                    height: 24,
                    fontSize: '0.7rem',
                    borderColor: typeConfig.primaryColor,
                    color: typeConfig.primaryColor,
                  }}
                />
              </Box>
            </Paper>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
