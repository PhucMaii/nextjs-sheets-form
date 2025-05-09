import { Divider, Modal } from '@mui/material';
import React from 'react';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import useImageGallery from '@/hooks/useImageGallery';

const EditItemImage = ({
  open,
  onClose,
  image,
  onUpdateImg,
}: {
  open: boolean;
  onClose: () => void;
  image: string;
  onUpdateImg: (img: string) => void;
}) => {
  const { selectedImage, renderImageGallery } = useImageGallery(
    image,
    '100%',
    'products',
  );
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit Item Image"
          buttonLabel="Save"
          onClick={() => {
            onUpdateImg(selectedImage);
            onClose();
          }}
          onClose={onClose}
          buttonProps={{
            variant: 'contained',
            color: 'primary',
          }}
        />

        <Divider sx={{ my: 2 }} />

        {renderImageGallery()}
      </BoxModal>
    </Modal>
  );
};

export default EditItemImage;
