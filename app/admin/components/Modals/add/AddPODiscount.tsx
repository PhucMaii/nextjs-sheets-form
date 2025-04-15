import { Divider, Modal, TextField } from '@mui/material'
import React, { useState } from 'react'
import { BoxModal } from '../styled'
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';

interface IProps extends ModalProps {
    addDiscount: (discount: number) => void
}

export default function AddPODiscount({open, onClose, addDiscount}: IProps) {
    const [discount, setDiscount] = useState<number>(0);

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading="Add PO Discount"
                buttonLabel="ADD"
                onClick={() => addDiscount(discount)}
                onClose={onClose}
                buttonProps={{}}
            />

            <Divider sx={{ my: 2 }} />

            <TextField
                label="Discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(+e.target.value)}
                fullWidth
            />
        </BoxModal>
    </Modal>
  )
}
