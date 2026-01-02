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
  useMediaQuery,
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

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

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
        expandIcon={<ChevronDown size={smDown ? 20 : 18} />}
        sx={{
          minHeight: smDown ? 72 : 56,
          px: smDown ? 1.5 : 2,
          py: smDown ? 1 : 0,
          '&.Mui-expanded': {
            minHeight: smDown ? 72 : 56,
          },
          '& .MuiAccordionSummary-content': {
            my: smDown ? 0.5 : 1,
            '&.Mui-expanded': {
              my: smDown ? 0.5 : 1,
            },
          },
        }}
      >
        <Box
          display="flex"
          flexDirection={smDown ? 'column' : 'row'}
          alignItems={smDown ? 'flex-start' : 'center'}
          justifyContent="space-between"
          width="100%"
          pr={smDown ? 0 : 2}
          gap={smDown ? 1 : 0}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={smDown ? 1 : 1.5}
            flex={1}
            width={smDown ? '100%' : 'auto'}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Avatar
                sx={{
                  width: smDown ? 44 : 36,
                  height: smDown ? 44 : 36,
                  bgcolor: typeConfig.bgColor,
                  color: typeConfig.primaryColor,
                  border: `2px solid ${typeConfig.primaryColor}`,
                }}
              >
                <TypeIcon size={smDown ? 22 : 18} />
              </Avatar>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: smDown ? -3 : -2,
                  right: smDown ? -3 : -2,
                  width: smDown ? 18 : 16,
                  height: smDown ? 18 : 16,
                  borderRadius: '50%',
                  bgcolor: typeConfig.primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}
              >
                <User size={smDown ? 10 : 8} color="white" />
              </Box>
            </Box>
            <Box flex={1} minWidth={0} width={smDown ? '100%' : 'auto'}>
              <Box
                display="flex"
                alignItems="center"
                gap={smDown ? 0.75 : 1}
                mb={smDown ? 0.5 : 0.25}
                flexWrap="wrap"
              >
                <Typography
                  variant={smDown ? 'body1' : 'body2'}
                  fontWeight={600}
                  sx={{
                    fontSize: smDown ? '0.95rem' : undefined,
                  }}
                >
                  {report.createdBy}
                </Typography>
                <Chip
                  label={typeConfig.label}
                  size="small"
                  sx={{
                    height: smDown ? 24 : 20,
                    fontSize: smDown ? '0.7rem' : '0.65rem',
                    fontWeight: 600,
                    bgcolor: typeConfig.bgColor,
                    color: typeConfig.primaryColor,
                    border: `1px solid ${typeConfig.primaryColor}`,
                    '& .MuiChip-label': {
                      px: smDown ? 1.25 : 1,
                    },
                  }}
                />
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={smDown ? 0.5 : 0.75}
                flexWrap="wrap"
              >
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  sx={{
                    fontSize: smDown ? '0.75rem' : undefined,
                  }}
                >
                  #{report.id} •
                </Typography>
                <Calendar size={smDown ? 14 : 12} color="#999" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: smDown ? '0.75rem' : undefined,
                  }}
                >
                  {dayjs(report.queryDate).format(
                    smDown ? 'MMM D' : 'MMM D, YYYY',
                  )}
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
                <Clock size={smDown ? 14 : 12} color="#999" />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: smDown ? '0.75rem' : undefined,
                  }}
                >
                  {dayjs(report.createdAt).format('HH:mm')}
                </Typography>
                {report?.note && (
                  <Tooltip title={report.note}>
                    <IconButton
                      size="small"
                      sx={{
                        ml: -0.5,
                        minWidth: smDown ? 40 : 'auto',
                        minHeight: smDown ? 40 : 'auto',
                      }}
                    >
                      <TextSnippetIcon fontSize={smDown ? 'medium' : 'small'} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            gap={smDown ? 0.75 : 1}
            width={smDown ? '100%' : 'auto'}
            justifyContent={smDown ? 'space-between' : 'flex-end'}
            mt={smDown ? 0.5 : 0}
          >
            <Chip
              label={`${report.inventoryCounts?.length || 0} items`}
              size="small"
              variant="outlined"
              sx={{
                height: smDown ? 28 : 24,
                fontSize: smDown ? '0.75rem' : '0.7rem',
                borderColor: typeConfig.primaryColor,
                color: typeConfig.primaryColor,
                '& .MuiChip-label': {
                  px: smDown ? 1.5 : 1,
                },
              }}
            />
            <IconButton
              size={smDown ? 'medium' : 'small'}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteReport(report.id);
              }}
              sx={{
                color: '#EF4444',
                p: smDown ? 1 : 0.5,
                minWidth: smDown ? 44 : 'auto',
                minHeight: smDown ? 44 : 'auto',
                '&:hover': {
                  bgcolor: alpha('#EF4444', 0.1),
                },
              }}
            >
              <Trash2 size={smDown ? 18 : 14} />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: smDown ? 1.5 : 2,
          pb: smDown ? 2.5 : 2,
          pt: smDown ? 1.5 : 0,
        }}
      >
        <Stack spacing={smDown ? 1 : 0.75}>
          {(report.inventoryCounts || []).map((item) => (
            <Paper
              key={item.inventoryItemId}
              sx={{
                p: smDown ? 2 : 1.5,
                borderRadius: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: smDown ? 1.5 : 2,
                justifyContent: 'space-between',
                alignItems: smDown ? 'flex-start' : 'center',
                backgroundColor: typeConfig.bgColor,
                border: '1px solid',
                borderColor: alpha(typeConfig.primaryColor, 0.2),
              }}
              elevation={0}
            >
              <Typography
                variant={smDown ? 'body1' : 'body2'}
                fontWeight={600}
                sx={{
                  flex: 1,
                  fontSize: smDown ? '0.95rem' : undefined,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
                noWrap={!smDown}
              >
                {item.inventoryItem.name}
              </Typography>
              <Box
                display="flex"
                gap={0.75}
                width={smDown ? '100%' : 'auto'}
                justifyContent={smDown ? 'flex-start' : 'flex-end'}
              >
                <Chip
                  label={`${item.countedQty} ${item.inventoryUnit.unit}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: smDown ? 28 : 24,
                    fontSize: smDown ? '0.75rem' : '0.7rem',
                    borderColor: typeConfig.primaryColor,
                    color: typeConfig.primaryColor,
                    '& .MuiChip-label': {
                      px: smDown ? 1.5 : 1,
                    },
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
