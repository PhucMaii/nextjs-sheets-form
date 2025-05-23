import {
  AlertColor,
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import FileUpload from '../FileUpload';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { UserType } from '@/app/utils/type';
import DisplayFile from './DisplayFile';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import DateRange from './DateRangeModal';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  year: string;
  client: UserType | null;
}

export default function UploadChequeModal({
  open,
  onClose,
  showNotification,
  year,
  client,
}: IProps) {
  const { companyId }: any = useParams();
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState<boolean>(false);
  // const [updatedDateRange, setUpdatedDateRange] = useState<any>([]);
  // const [newDateRange, setNewDateRange] = useState<any>([]);

  const [cheque, setCheque] = useState<{ front: string; back: string }>({
    front: '',
    back: '',
  });
  const [chequeData, setChequeData] = useState<any>({
    chequeNumber: '',
    amount: 0,
    startDate: dayjs(new Date()).format('MM/DD/YYYY'),
    endDate: dayjs(new Date()).format('MM/DD/YYYY'),
    year,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setChequeData({
      chequeNumber: '',
      amount: 0,
      startDate: dayjs(new Date()).format('MM/DD/YYYY'),
      endDate: dayjs(new Date()).format('MM/DD/YYYY'),
      year,
    });

    setCheque({
      front: '',
      back: '',
    });
  }, [open]);
  
  const handleUpload = async () => {
    console.log(client, 'client');
    if (!client) {
      showNotification('error', 'Please select a client');
      return;
    }
    if (
      !cheque.front ||
      chequeData.amount === 0 ||
      !chequeData.startDate ||
      !chequeData.endDate ||
      !chequeData.year
    ) {
      showNotification('error', 'Please fill all required the fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(getAdminApiUrl(companyId, '/cheque'), {
        ...chequeData,
        userId: client.id,
        startDate: chequeData.startDate ? dayjs(chequeData.startDate).format('MM/DD/YYYY') : null,
        endDate: chequeData.endDate ? dayjs(chequeData.endDate).format('MM/DD/YYYY') : null,
        fileKeyFront: cheque.front,
        fileKeyBack: cheque.back,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <DateRange 
    open={isSelectRangeOpen}
    onClose={() => setIsSelectRangeOpen(false)}
    dateRange={chequeData.startDate && chequeData.endDate ? [new Date(chequeData.startDate), new Date(chequeData.endDate)] : []}
    setDateRange={(dateRange: any) => {
      setChequeData({
        ...chequeData,
        startDate: dateRange[0],
        endDate: dateRange[1],
      });
    }}
    />
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="auto">
        <ModalHead
          heading="Upload Cheque"
          buttonLabel="UPLOAD"
          onClick={handleUpload}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2} mb={2}>
          <Typography>Front of cheque</Typography>
          {cheque?.front && <DisplayFile fileKey={cheque.front} isCheque />}
          <FileUpload
            showNotification={showNotification}
            fileName={`${dayjs(chequeData.startDate).format('MM/DD/YYYY')}-${year}-${client?.clientId}_front`}
            uploadLocation={`cheques/${year}/${dayjs(chequeData.startDate).format('MM/DD/YYYY')}`}
            onUploadImageUI={(fileKey: string) => {
              setCheque({
                ...cheque,
                front: fileKey,
              });
            }}
            isCheque
          />

          <Typography>Back of cheque</Typography>
          {cheque?.back && <DisplayFile fileKey={cheque.back} isCheque />}
          <FileUpload
            showNotification={showNotification}
            fileName={`${dayjs(chequeData.endDate).format('MM/DD/YYYY')}-${year}-${client?.clientId}_back`}
            uploadLocation={`cheques/${year}/${dayjs(chequeData.endDate).format('MM/DD/YYYY')}`}
            onUploadImageUI={(fileKey: string) => {
              setCheque({
                ...cheque,
                back: fileKey,
              });
            }}
            isCheque
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
              <TextField
                fullWidth
                label="From"
                value={
                  chequeData.startDate
                    ? new Date(chequeData.startDate).toDateString()
                    : ''
                }
                onClick={() => setIsSelectRangeOpen(true)}
              />
            </Grid>
            <Grid item xs={6} textAlign="right">
              <TextField
                fullWidth
                label="To"
                value={
                  chequeData.endDate
                    ? new Date(chequeData.endDate).toDateString()
                    : ''
                }
                onClick={() => setIsSelectRangeOpen(true)}
              />
            </Grid>
            {/* <Grid item xs={6}>
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
            </Grid> */}
          </Grid>
        </Box>
      </BoxModal>
    </Modal>
    </>
  );
}
