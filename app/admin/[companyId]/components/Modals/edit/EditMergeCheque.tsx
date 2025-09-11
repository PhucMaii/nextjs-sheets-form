import { Box, Divider, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';
import DisplayFile from '../DisplayFile';
import { IMergeCheque } from '@/app/utils/type';
import dayjs from 'dayjs';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  cheque: IMergeCheque;
  showNotification: ShowNotificationType;
  mutateMergeCheques: () => void;
}

export default function EditMergeCheque({
  open,
  onClose,
  cheque,
  showNotification,
  mutateMergeCheques,
}: IProps) {
  const { companyId }: any = useParams();
  const [chequeFile, setChequeFile] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [chequeData, setChequeData] = useState({
    chequeNumber: '',
    amount: 0,
  });

  useEffect(() => {
    if (!cheque) return;
    setChequeFile(cheque?.fileKeyFront);
    setChequeData({
      chequeNumber: cheque.chequeNumber,
      amount: cheque.amount,
    });
  }, [cheque]);

  const handleSaveCheque = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/cheque/merge-cheque'),
        {
          updatedCheque: {
            fileKeyFront: chequeFile,
            chequeNumber: chequeData.chequeNumber,
            amount: chequeData.amount,
          },
          id: cheque.id,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      mutateMergeCheques();
      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'Fail to update merge cheque');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit Merge Cheque"
          buttonLabel="Save"
          onClick={handleSaveCheque}
          buttonProps={{ loading: isSaving }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography>Cheque File</Typography>
          {chequeFile && <DisplayFile fileKey={chequeFile} isCheque />}
          <PresignedFileUpload
            location={`cheques/vendor/${cheque.vendor?.name || 'temp'}/${dayjs(cheque.startDate).format('MM-DD-YYYY')}to${dayjs(cheque.endDate).format('MM-DD-YYYY')}`}
            isCheque={true}
            maxFiles={1}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedFileTypes={['image/*', 'application/pdf']}
            onUploadComplete={(files) => {
              setChequeFile(files[0].fileKey);
            }}
            onUploadError={(error) => {
              showNotification('error', error);
            }}
            className="mb-4"
          />

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Cheque Number</Typography>
            <TextField
              value={chequeData.chequeNumber}
              onChange={(e) => {
                setChequeData({
                  ...chequeData,
                  chequeNumber: e.target.value,
                });
              }}
              type="number"
              variant="outlined"
              size="small"
              fullWidth
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Amount ($)</Typography>
            <TextField
              label="Amount ($)"
              placeholder="Amount will be auto-calculated from selected transactions"
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
              helperText="Amount is automatically calculated from selected transactions"
            />
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
