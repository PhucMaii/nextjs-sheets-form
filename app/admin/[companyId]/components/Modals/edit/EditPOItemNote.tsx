import { Divider, Modal, TextField } from '@mui/material';
import React from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';

export default function EditPOItemNote({
  open,
  onClose,
  item,
  onUpdateNote,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
  onUpdateNote: (note: string) => void;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit PO Item Note"
          buttonLabel="Save"
          onClick={() => {}}
          buttonProps={{
            variant: 'contained',
            color: 'primary',
          }}
          onClose={onClose}
          onlyHeading
        />

        <Divider sx={{ my: 2 }} />

        <TextField
          label="Note"
          value={item.note}
          onChange={(e) => {
            onUpdateNote(e.target.value);
          }}
          multiline
          rows={4}
          fullWidth
        />
      </BoxModal>
    </Modal>
  );
}
