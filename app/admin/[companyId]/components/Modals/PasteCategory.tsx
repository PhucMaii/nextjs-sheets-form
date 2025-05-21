import { Divider, Modal } from '@mui/material'
import React, { useEffect } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import useCategory from '@/hooks/autocomplete/useCategory';

interface IProps extends ModalProps {
  onPaste: (category: any) => void;
}

export default function PasteCategory({
  open,
  onClose,
  onPaste
}: IProps) {
  const { renderSelectCategory, selectedCategory } = useCategory();

  useEffect(() => {
    if (selectedCategory) {
      onPaste(selectedCategory);
      onClose();
    }
  }, [selectedCategory]);

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
              heading="Paste Category"
              buttonLabel="Paste"
              onClick={() => {}}
              buttonProps={{}}
              onClose={onClose}
            />

            <Divider sx={{ my: 2 }} />

            {renderSelectCategory()}
        </BoxModal>
    </Modal>
  )
}
