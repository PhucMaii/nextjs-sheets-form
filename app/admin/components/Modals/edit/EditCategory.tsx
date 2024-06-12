import React from 'react';
import { ModalProps } from '../type';
import { Divider, Modal } from '@mui/material';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';

interface IProps extends ModalProps {}

export default function EditCategory({ open, onClose }: IProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <ModalHead 
            heading="Edit Category"
            buttonLabel="EDIT"
            onClick={() => {}}
            buttonProps={{}}
        />
        <Divider sx={{my: 2}} />
        
      </BoxModal>
    </Modal>
  );
}
