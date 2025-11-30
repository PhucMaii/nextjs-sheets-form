import {
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  Typography,
  IconButton,
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
import { formatCurrency } from '@/app/utils/number';
import dayjs from 'dayjs';
import { ICheque, IFile } from '@/app/utils/type';

interface IProps {
  file: ICheque;
  handleViewFile: (file: IFile) => void;
  handleDownloadFile: (file: IFile) => void;
}

export default function Cheque({
  file,
  handleViewFile,
  handleDownloadFile,
}: IProps) {
  const accentColor = info.main;
  const bgColor = info.lightest;

  console.log(file, 'file.fileKeyFront');

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: `1px solid ${alpha(neutral[300], 0.5)}`,
          transition: 'all 0.2s ease-in-out',
          overflow: 'hidden',
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
                    {file.expense.date
                      ? dayjs(file.expense.date).format('MMM DD, YYYY')
                      : 'No date'}
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
                    Payment Method
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[700] }}>
                    {file.expense.paymentMethod?.name || 'N/A'}
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
                Cheque File
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
                    Created by
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[700] }}>
                    {file.createdBy}
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
                    Created at
                  </Typography>
                  <Typography variant="body2" sx={{ color: neutral[700] }}>
                    {file.createdAt
                      ? dayjs(file.createdAt).format('MMM DD, YYYY')
                      : 'No date'}
                  </Typography>
                </Box>
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
    </Grid>
  );
}
