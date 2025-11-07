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
import { User, Calendar, Clock, Trash2, ChevronDown } from 'lucide-react';
import { IInventoryReport } from '@/app/utils/type';
import dayjs from 'dayjs';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

interface IProps {
  report: IInventoryReport;
  handleDeleteReport: (reportId: number) => void;
}
export default function ReportCard({ report, handleDeleteReport }: IProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Accordion
      key={report.id}
      expanded={isExpanded}
      onChange={() => setIsExpanded(!isExpanded)}
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
              <Box display="flex" alignItems="center" gap={0.75} mt={0.25}>
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
                    <IconButton size="small">
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
          {(report.inventoryCounts || []).map((item) => (
            <Paper
              key={item.inventoryItemId}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: alpha('#3B82F6', 0.05),
                border: '1px solid',
                borderColor: alpha('#000', 0.06),
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
}
