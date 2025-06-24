import DisplayFile from '@/app/admin/[companyId]/components/Modals/DisplayFile';
import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';
import { ORDER_STATUS } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { ShowNotificationType } from '@/hooks/useNotification';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { XIcon } from 'lucide-react';
import React, { useState } from 'react';

interface IProps extends ModalProps {
  order: Order;
  onConfirm: (
    orderId: number,
    updatedStatus: ORDER_STATUS,
    fileKey: string | null,
  ) => Promise<void>;
  updatedStatus: ORDER_STATUS;
  showNotification: ShowNotificationType;
}

const ConfirmDelivery = ({
  open,
  onClose,
  order,
  onConfirm,
  updatedStatus,
  showNotification,
}: IProps) => {
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState({
    confirm: false,
    confirmWithImg: false,
    isLoading: false,
  });

  const today = new Date();
  const formattedDate = YYYYMMDDFormat(today);

  // useEffect(() => {
  //   if (fileKey) {
  //     handleConfirm(fileKey);
  //   }
  // }, [fileKey]);

  const handleConfirm = async (fileKey: string | null = null) => {
    if (!fileKey) {
      showNotification('error', 'Please upload the proof');
      return;
    }
    setIsLoading({
      confirm: fileKey ? false : true,
      confirmWithImg: fileKey ? true : false,
      isLoading: true,
    });
    await onConfirm(order.id, updatedStatus, fileKey);
    onClose();
    setIsLoading({
      confirm: false,
      confirmWithImg: false,
      isLoading: false,
    });
  };

  // const handleYesWithImg = () => {
  //   console.log('Button clicked, attempting to open file dialog...');
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click();
  //   } else {
  //     console.error('File input ref is null');
  //   }
  // };
  // const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   console.log('File selected:', e.target.files);
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setFileKey(file.name);
  //     console.log('File set:', file.name);
  //   }
  // };

  const handleUploadSuccess = (
    uploadedFiles: Array<{ fileKey: string; fileName: string }>,
  ) => {
    console.log('File uploaded:', uploadedFiles);
    setFileKey(uploadedFiles[0].fileKey);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          mb={2}
        >
          {/* <Button>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton>
                <CameraIcon />
              </IconButton>
              <Typography variant="body1" fontWeight={600}>
                Upload Photo Proof
              </Typography>
            </Box>
          </Button> */}
          <IconButton onClick={onClose}>
            <XIcon />
          </IconButton>
        </Box>

        {fileKey && <DisplayFile fileKey={fileKey} />}
        <Typography variant="subtitle2">
          Upload Proof
        </Typography>
        <PresignedFileUpload
          location={`delivery-proof/${formattedDate}/${order.id}`}
          onUploadComplete={handleUploadSuccess}
        />
        {/* <Button variant="outlined" color="primary" onClick={handleUploadProof} fullWidth>
          <Box display="flex" alignItems="center" gap={1}>
            <CameraIcon />
            <Typography variant="subtitle2" fontWeight={600}>
              Upload Proof
            </Typography>
          </Box>
        </Button> */}

        <Typography variant="h6" fontWeight={600} textAlign="center">
          {updatedStatus === ORDER_STATUS.COMPLETED
            ? 'Have you delivered and collect money for this order '
            : 'Have you delivered this order '}
          ?
        </Typography>

        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={1}
          mt={2}
          width="100%"
        >
          <Button
            disabled={isLoading.isLoading}
            fullWidth
            variant={'outlined'}
            color={
              updatedStatus === ORDER_STATUS.COMPLETED ? 'success' : 'primary'
            }
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            disabled={isLoading.isLoading}
            fullWidth
            variant="contained"
            color={
              updatedStatus === ORDER_STATUS.COMPLETED ? 'success' : 'primary'
            }
            onClick={() => handleConfirm(fileKey)}
          >
            {isLoading.confirmWithImg ? 'Confirming...' : 'Confirm'}
          </Button>
        </Box>
      </BoxModal>
    </Modal>
  );
};

export default ConfirmDelivery;
