import { AlertColor, Divider, Modal } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import InventoryItemSearch from '../../Autocomplete/InventoryItemSearch';
import { IInventoryItem } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, USER_ROLE } from '@/app/utils/enum';

interface IProps extends ModalProps {
    showNotification: (type: AlertColor, message: string) => void;
}

export default function AddItemIntoType({open, onClose}: IProps) {
    const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);
    const [promptedItem, setPromptedItem] = useState<any>({
        id: -1,
        name: '',
    });

    console.log(inventoryItems, 'inventoryItems');

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading="Add Item Into Type"
                buttonLabel="ADD"
                onClick={() => {}}
                buttonProps={{}}
                onClose={onClose}
            />

            <Divider sx={{my: 2}} />

            
        </BoxModal>
    </Modal>
  )
}
