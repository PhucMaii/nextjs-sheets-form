import { Divider, Modal, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import useImageGallery from '@/hooks/useImageGallery';
import FileUpload from '../FileUpload';

interface IProps extends ModalProps {
  initialImage: string;
  handleUploadImage: (image: string) => Promise<void>;
}

export default function UploadImgModal({
  open,
  onClose,
  initialImage,
  handleUploadImage,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { selectedImage, renderImageGallery } = useImageGallery(
    'products',
    initialImage,
    '100%',
  );

  const handleUploadImageUI = async (image: string) => {
    setIsLoading(true);
    await handleUploadImage(image);
    setIsLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Upload Image"
          buttonLabel="Upload"
          onClick={() => handleUploadImageUI(selectedImage)}
          buttonProps={{
            loading: isLoading,
          }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        {renderImageGallery()}

        <FileUpload
          showNotification={() => {}}
          fileName={''}
          onUploadImageUI={handleUploadImageUI}
          uploadLocation={''}
        />
      </BoxModal>
    </Modal>
  );
}
