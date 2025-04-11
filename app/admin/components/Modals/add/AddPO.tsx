import { Box, Divider, Grid, Modal } from '@mui/material'
import React, { useState } from 'react'
import { BoxModal } from '../styled'
import ModalHead from '@/app/lib/ModalHead'
import { IVendor } from '@/app/utils/type';

export default function AddPO({open, onClose}) {
    const [vendors, setVendors] = useState<IVendor[]>([]);
    
  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading="Add PO"
                buttonLabel="ADD"
                onClick={() => {}}
                onClose={onClose}
                buttonProps={{}}
            />

            <Divider sx={{ my: 2 }} />

            <Grid container>
                <Grid item xs={12}>

                </Grid>
            </Grid>
        </BoxModal>
    </Modal>
  )
}
