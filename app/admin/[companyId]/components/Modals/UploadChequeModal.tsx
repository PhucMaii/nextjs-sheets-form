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
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { UserType } from '@/app/utils/type';
import DisplayFile from './DisplayFile';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import DateRange from './DateRangeModal';
import { generateMonthRange } from '@/app/utils/time';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';

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

  const [cheque, setCheque] = useState<{ front: string; back: string }>({
    front: '',
    back: '',
  });
  const [chequeData, setChequeData] = useState<any>({
    chequeNumber: '',
    amount: 0,
    year,
  });
  const [dateRange, setDateRange] = useState<Date[]>(generateMonthRange());
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
    if (!client) {
      showNotification('error', 'Please select a client');
      return;
    }

    if (
      !cheque.front ||
      chequeData.amount === 0 ||
      !chequeData.startDate ||
      !chequeData.endDate
    ) {
      showNotification('error', 'Please fill all required the fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(getAdminApiUrl(companyId, '/cheque'), {
        ...chequeData,
        userId: client.id,
        startDate: dateRange[0]
          ? dayjs(dateRange[0]).format('MM/DD/YYYY')
          : null,
        endDate: dateRange[1] ? dayjs(dateRange[1]).format('MM/DD/YYYY') : null,
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

  const handleFrontUploadComplete = (uploadedFiles: Array<{ fileKey: string; fileName: string }>) => {
    if (uploadedFiles.length > 0) {
      setCheque(prev => ({
        ...prev,
        front: uploadedFiles[0].fileKey,
      }));
      showNotification('success', 'Front cheque uploaded successfully');
    }
  };

  const handleBackUploadComplete = (uploadedFiles: Array<{ fileKey: string; fileName: string }>) => {
    if (uploadedFiles.length > 0) {
      setCheque(prev => ({
        ...prev,
        back: uploadedFiles[0].fileKey,
      }));
      showNotification('success', 'Back cheque uploaded successfully');
    }
  };

  const handleUploadError = (error: string) => {
    showNotification('error', error);
  };

  return (
    <>
      <DateRange
        open={isSelectRangeOpen}
        onClose={() => setIsSelectRangeOpen(false)}
        dateRange={dateRange}
        setDateRange={setDateRange}
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
            <PresignedFileUpload
              location={`cheques/${year}/${client?.clientId}/${dayjs(chequeData.startDate).format('MM-DD-YYYY')}`}
              isCheque={true}
              maxFiles={1}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={['image/*', 'application/pdf']}
              onUploadComplete={handleFrontUploadComplete}
              onUploadError={handleUploadError}
              className="mb-4"
            />

            <Typography>Back of cheque</Typography>
            {cheque?.back && <DisplayFile fileKey={cheque.back} isCheque />}
            <PresignedFileUpload
              location={`cheques/${year}/${client?.clientId}/${dayjs(chequeData.endDate).format('MM-DD-YYYY')}`}
              isCheque={true}
              maxFiles={1}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={['image/*', 'application/pdf']}
              onUploadComplete={handleBackUploadComplete}
              onUploadError={handleUploadError}
              className="mb-4"
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
                  value={dateRange[0] ? dateRange[0].toDateString() : ''}
                  onClick={() => setIsSelectRangeOpen(true)}
                />
              </Grid>
              <Grid item xs={6} textAlign="right">
                <TextField
                  fullWidth
                  label="To"
                  value={dateRange[1] ? dateRange[1].toDateString() : ''}
                  onClick={() => setIsSelectRangeOpen(true)}
                />
              </Grid>
            </Grid>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
