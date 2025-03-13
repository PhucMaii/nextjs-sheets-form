import {
  AlertColor,
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import FileUpload from '../FileUpload';
import { generateImgUrl } from '@/app/lib/s3';
import { months } from '@/app/lib/constant';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  year: string;
  month: string;
  clientId: string;
}

export default function UploadChequeModal({
  open,
  onClose,
  showNotification,
  year,
  month,
  clientId,
}: IProps) {
  const [cheque, setCheque] = useState<{ front: string; back: string }>({
    front: '',
    back: '',
  });

  const [chequeData, setChequeData] = useState<any>({
    chequeNumber: '',
    amount: 0,
    month,
    year,
  });

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Upload Cheque"
          buttonLabel="UPLOAD"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2} mb={2}>
          <Typography>Front of cheque</Typography>
          {cheque?.front && (
            <Box>
              <img
                src={generateImgUrl(cheque.front)}
                alt="cheque"
                style={{ width: '100px', height: '100px' }}
              />
            </Box>
          )}
          <FileUpload
            showNotification={showNotification}
            fileName={`${month}-${year}-${clientId}_front`}
            uploadLocation={`cheques/${year}/${month}`}
            onUploadImageUI={(fileKey: string) => {
              setCheque({
                ...cheque,
                front: fileKey,
              });
            }}
          />

          <Typography>Back of cheque</Typography>
          {cheque?.back && (
            <Box>
              <img
                src={generateImgUrl(cheque.back)}
                alt="cheque"
                style={{ width: '100px', height: '100px' }}
              />
            </Box>
          )}
          <FileUpload
            showNotification={showNotification}
            fileName={`${month}-${year}-${clientId}_back`}
            uploadLocation={`cheques/${year}/${month}`}
            onUploadImageUI={(fileKey: string) => {
              setCheque({
                ...cheque,
                back: fileKey,
              });
            }}
          />

          <Typography variant="h6" fontWeight="regular">
            Cheque Number
          </Typography>
          <TextField
            placeholder="Cheque Number"
            variant="outlined"
            size="small"
            value={chequeData.chequeNumber}
            onChange={(e) => {
              setChequeData({
                ...chequeData,
                chequeNumber: e.target.value,
              });
            }}
          />

          <Typography variant="h6" fontWeight="regular">
            Amount ($)
          </Typography>
          <TextField
            placeholder="Amount ($)"
            variant="outlined"
            size="small"
            type="number"
            value={chequeData.amount}
            onChange={(e) => {
              setChequeData({
                ...chequeData,
                amount: +e.target.value,
              });
            }}
          />

          <Typography variant="h6" fontWeight="regular">
            For:
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel id="month-label">Month</InputLabel>
                <Select
                  labelId="month-label"
                  label="Month"
                  placeholder="Month"
                  fullWidth
                  value={chequeData.month}
                  onChange={(e) => {
                    setChequeData({
                      ...chequeData,
                      month: e.target.value,
                    });
                  }}
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                placeholder="Year"
                variant="outlined"
                size="small"
                fullWidth
                value={chequeData.year}
                onChange={(e) => {
                  setChequeData({
                    ...chequeData,
                    year: e.target.value,
                  });
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </BoxModal>
    </Modal>
  );
}
