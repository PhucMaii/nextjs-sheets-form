import { AlertColor, Box, Divider, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import FileUpload from '../FileUpload';
import StatusText from '../StatusText';
import { generateImgUrl } from '@/app/lib/s3';

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
  const [cheques, setCheques] = useState<any[]>([]);

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

        <Box display="flex" flexDirection="column" gap={1} mb={2}>
          <Typography variant="h6" fontWeight="regular">
            For:{' '}
            <strong>
              {month} {year}
            </strong>
          </Typography>
          <Typography variant="h6" fontWeight="regular">
            Client Id: <strong>{clientId}</strong>
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="h6" fontWeight="regular">
              Statement:
            </Typography>
            <StatusText text="Printed" type="success" />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="regular">
              Cheques:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {cheques.map((cheque, index) => (
                <img
                  key={index}
                  src={generateImgUrl(cheque)}
                  alt="cheque"
                  style={{ width: '100px', height: '100px' }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <FileUpload
          showNotification={showNotification}
          fileName={`${month}-${year}-${clientId}`}
          uploadLocation={`cheques/${year}/${month}`}
          onUploadImageUI={(fileKey: string) => {
            setCheques([...cheques, fileKey]);
          }}
        />
      </BoxModal>
    </Modal>
  );
}
