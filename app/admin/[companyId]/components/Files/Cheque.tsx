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
import { info, neutral, primary } from '@/theme/color';
import DisplayFile from '../Modals/DisplayFile';
import React from 'react';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { ICheque } from '@/app/utils/type';

interface IProps {
  file: ICheque;
  handleViewFile: (file: any) => void;
  handleDownloadFile: (file: any) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function Cheque({
  file,
  handleViewFile,
  handleDownloadFile,
  isSelected = false,
  onSelect,
}: IProps) {
  const accentColor = info.main;
  const bgColor = info.lightest;

  // if (!file.user) {
  //   console.log(file, 'file');
  // }

  const userFields = [
    {
      label: 'Cheque Number',
      value: file.chequeNumber,
    },
    {
      label: 'Amount',
      value: file.amount,
    },
    {
      label: 'Uploaded At',
      value: file.createdAt ? dayjs(file.createdAt).format('MMM DD, YYYY h:mm A') : 'No date',
    },
  ];
  
  const vendorFields = [
    {
      label: 'Transactions',
      value: file.transactions?.length || 0,
    },
    {
      label: 'Amount',
      value: file.amount,
    },
    {
      label: 'Uploaded At',
      value: file.createdAt ? dayjs(file.createdAt).format('MMM DD, YYYY h:mm A') : 'No date',
    },
  ];

  const renderFieldRow = (label: string, value: string | number) => {
    return (
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="caption" sx={{ color: neutral[600], fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: label === 'Amount' ? primary.main : neutral[700], fontWeight: label === 'Amount' ? 600 : 500 }}>
          {label === 'Amount' ? `$${value}` : value}
        </Typography>
      </Box>
    );
  };

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
          fileKey={file.fileKeyFront}
          alt="Cheque"
          width="100%"
          height="100%"
          isCheque={true}
          style={{
            objectFit: 'cover',
          }}
        />

        {/* Type Badge */}
        <Chip
          label="Cheque"
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
          icon={<ReceiptIcon sx={{ fontSize: 14, color: 'white' }} />}
        />

        {/* Front/Back Badge for Cheques */}
        {file.fileKeyBack && (
          <Chip
            label={file.fileKeyBack ? 'Back' : 'Front'}
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
        {file.user ? (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: neutral[900],
                mb: 1.5,
              }}
            >
              {file.user?.clientName}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1}> 
              {userFields.map((field) => (
                <Box key={field.label}>
                  {renderFieldRow(field.label, field.value as string)}
                </Box>
              ))}

            </Stack>
          </>
        ) : (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: neutral[900],
                mb: 1.5,
              }}
            >
              {file.vendor?.name}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={1}> 
              {vendorFields.map((field) => (
                <Box key={field.label}>
                  {renderFieldRow(field.label, field.value)}
                </Box>
              ))}
            </Stack>
          </>
        )}
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
