import { Box, Divider, MenuItem, Modal, Select, TextField, Typography } from '@mui/material'
import ModalHead from '@/app/lib/ModalHead'
import { BoxModal } from './styled'
import React, { useState } from 'react'
import { ModalProps } from './type'
import { Order } from '../../orders/page'
import { rejectOrderReasons } from '@/app/lib/constant'
import axios from 'axios'
import { getAdminApiUrl } from '@/app/utils/enum'
import { useParams } from 'next/navigation'
import { ShowNotificationType } from '@/hooks/useNotification'

interface IProps extends ModalProps {
    order: Order;
    showNotification: ShowNotificationType;
}

export default function RejectOrder({
    open,
    onClose,
    order,
    showNotification,
}: IProps) {
    const { companyId }: any = useParams();

    const [reason, setReason] = useState<string>('-- Select Reason --');
    const [note, setNote] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleReject = async () => {
        try {
            setIsLoading(true);
            const response = await axios.post(getAdminApiUrl(companyId, '/orders/reject'), {
                order,
                reason,
                note,
            });

            if (response.data.error) {
                showNotification('error', response.data.error);
                setIsLoading(false);
                return;
            }

            showNotification('success', response.data.message);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }
    
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
            heading="Reject Order"
            buttonLabel="Reject"
            onClick={handleReject}
            buttonProps={{
                loading: isLoading,
            }}
            onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="h6">Reason:</Typography>
                <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                    <MenuItem disabled value="-- Select Reason --">-- Select Reason --</MenuItem>
                    {
                        rejectOrderReasons.map((reason) => (
                            <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                        ))
                    }
                </Select>
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
                <Typography>Note:</Typography>
                <TextField 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    multiline
                    rows={4}
                    placeholder="Enter note"
                />
            </Box>
        </Box>
      </BoxModal>
    </Modal>
  )
}
