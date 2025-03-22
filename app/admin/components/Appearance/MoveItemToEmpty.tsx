import { Autocomplete, Divider, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../Modals/type';
import { BoxModal } from '../Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import { IInventoryItem } from '@/app/utils/type';

interface IBody extends ModalProps {
  inventoryItems: IInventoryItem[];
  onMoveItemToEmpty: (item: IInventoryItem) => void;
}

export default function MoveItemToEmpty({
  open,
  onClose,
  inventoryItems,
  onMoveItemToEmpty,
}: IBody) {
  const [selectedItem, setSelectedItem] = useState<IInventoryItem | any>(null);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Item"
          buttonLabel="ADD"
          onClose={onClose}
          onClick={() => {
            onMoveItemToEmpty(selectedItem!);
            onClose();
          }}
          buttonProps={{}}
        />

        <Divider sx={{ my: 2 }} />

        <Autocomplete
          options={inventoryItems || []}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => <TextField {...params} label="Items" />}
          value={selectedItem}
          onChange={(e, newValue) => setSelectedItem(newValue)}
          sx={{ width: 'auto' }}
        />
      </BoxModal>
    </Modal>
  );
}
