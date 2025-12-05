import {
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  Chip,
  Typography,
  IconButton,
  Checkbox,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { success, neutral, primary } from '@/theme/color';
import DisplayFile from '../Modals/DisplayFile';
import React from 'react';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { formatCurrency } from '@/app/utils/number';
import dayjs from 'dayjs';
import { IFile } from '@/app/utils/type';

interface IProps {
  file: IFile;
  handleViewFile: (file: IFile) => void;
  handleDownloadFile: (file: IFile) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function DeliveryProof({
  file,
  handleViewFile,
  handleDownloadFile,
  isSelected = false,
  onSelect,
}: IProps) {
  const accentColor = success.main;
  const bgColor = success.lightest;

  return (
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: `2px solid ${isSelected ? accentColor : alpha(neutral[300], 0.5)}`,
          transition: 'all 0.2s ease-in-out',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: isSelected ? alpha(accentColor, 0.02) : 'white',
          '&:hover': {
            borderColor: accentColor,
            boxShadow: `0 4px 20px ${alpha(accentColor, 0.15)}`,
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* File Preview Section */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 220,
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <DisplayFile
            fileKey={file.fileKey}
            alt="Delivery Proof"
            width="100%"
            height="100%"
            style={{
              objectFit: 'cover',
            }}
          />

          {/* Type Badge */}
          <Chip
            label="Delivery Proof"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: accentColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              boxShadow: `0 2px 8px ${alpha(accentColor, 0.3)}`,
            }}
            icon={
              <LocalShippingIcon sx={{ fontSize: 14, color: 'white' }} />
            }
          />

          {/* Front/Back Badge for Cheques */}
          {file.note && (
            <Chip
              label={file.note === 'front' ? 'Front' : 'Back'}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: neutral[700],
                color: 'white',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 22,
              }}
            />
          )}

          {/* Selection Checkbox Overlay */}
          {onSelect && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Checkbox
                checked={isSelected}
                sx={{
                  color: 'white',
                  backgroundColor: alpha(neutral[900], 0.6),
                  borderRadius: '50%',
                  p: 0.5,
                  '&.Mui-checked': {
                    color: 'white',
                    backgroundColor: accentColor,
                  },
                  '&:hover': {
                    backgroundColor: alpha(accentColor, 0.8),
                  },
                }}
                icon={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: '2px solid white',
                    }}
                  />
                }
                checkedIcon={
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: accentColor,
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                      }}
                    />
                  </Box>
                }
              />
            </Box>
          )}
        </Box>

        {/* Content Section */}
        <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1 }}>
          {file.expense ? (
            <>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: neutral[900],
                  mb: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                }}
              >
                {file.expense.description}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: neutral[600], fontWeight: 500 }}
                  >
                    Amount
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: neutral[900], fontWeight: 600 }}
                  >
                    {formatCurrency(file.expense.amount)}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: neutral[600], fontWeight: 500 }}
                  >
                    Date
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[700] }}>
                    {dayjs(file.expense.date).format('MMM DD, YYYY')}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: neutral[600], fontWeight: 500 }}
                  >
                    Created by
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[700] }}>
                    {file.createdBy}
                  </Typography>
                </Box>
              </Stack>
            </>
          ) : file.delivery ? (
            <>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: neutral[900],
                  mb: 1.5,
                }}
              >
                Order #{file.delivery.orderId}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: neutral[600], fontWeight: 500 }}
                  >
                    Customer
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: neutral[900], fontWeight: 600 }}
                  >
                    {file.delivery.order?.user
                      ? `${file.delivery.order?.user?.clientName} - ${file.delivery.order?.user?.clientId}`
                      : 'N/A'}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: neutral[600], fontWeight: 500 }}
                  >
                    Delivered
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[700] }}>
                    {file.delivery.deliveredAt ? dayjs(file.delivery.deliveredAt).format('MMM DD, YYYY HH:mm') : 'No record'}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{ color: neutral[600], fontWeight: 500 }}
                  >
                    Driver
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[700] }}>
                    {file.createdBy}
                  </Typography>
                </Box>
              </Stack>
            </>
          ) : null}
        </CardContent>

        {/* Actions Section */}
        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            startIcon={<VisibilityIcon />}
            onClick={() => handleViewFile(file)}
            sx={{
              textTransform: 'none',
              borderColor: neutral[300],
              color: neutral[700],
              fontWeight: 500,
              '&:hover': {
                borderColor: primary.main,
                backgroundColor: primary.lightest,
                color: primary.main,
              },
            }}
          >
            View
          </Button>
          <IconButton
            size="small"
            onClick={() => handleDownloadFile(file)}
            sx={{
              border: `1px solid ${neutral[300]}`,
              color: neutral[700],
              '&:hover': {
                borderColor: primary.main,
                backgroundColor: primary.lightest,
                color: primary.main,
              },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>
  );
}
