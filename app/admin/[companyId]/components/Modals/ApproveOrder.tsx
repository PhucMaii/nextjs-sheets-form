import { Divider, Grid, Modal, Typography } from '@mui/material'
import React, { useState } from 'react'
import { ModalProps } from './type'
import { Order } from '../../orders/page'
import { BoxModal } from './styled'
import ModalHead from '@/app/lib/ModalHead'
import useSelectDate from '@/hooks/useSelectDate'
import { ShowNotificationType } from '@/hooks/useNotification'
import axios from 'axios'
import { getAdminApiUrl } from '@/app/utils/enum'
import { useParams } from 'next/navigation'
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

interface IProps extends ModalProps {
    order: Order;
    showNotification: ShowNotificationType;
}

export default function ApproveOrder({open, onClose, order, showNotification}: IProps) {
    const { companyId }: any = useParams();

    const { date, SelectDate } = useSelectDate(order?.deliveryDate || '', true, true);
    const [isLoading, setIsLoading] = useState(false);
    const [deliveryTime, setDeliveryTime] = useState<any>(dayjs(new Date()));

    const handleApprove = async () => {
      try {
        setIsLoading(true);
        const response = await axios.post(getAdminApiUrl(companyId, '/orders/approve'), {
            order,
            deliveryDate: date,
            deliveryTime: deliveryTime.format('HH:mm'),
        });

        if (response.data.error) {
            showNotification('error', response.data.error);
            setIsLoading(false);
            return;
        }

        showNotification('success', response.data.message);
        onClose();
      } catch (error: any) {
        console.log('Internal Server Error: ', error);
        showNotification('error', 'Something went wrong: ' + error);
      } finally {
        setIsLoading(false);
      }
    }

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="90vh" overflow="auto">
        <ModalHead 
            heading="Approve Order"
            buttonLabel="Approve"
            onClick={handleApprove}
            buttonProps={{
              loading: isLoading,
            }}
            onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography>Delivery Date</Typography>
            {SelectDate}
          </Grid>
          <Grid item xs={6}>
            <Typography>Delivery Time</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker 
                sx={{ width: '100%' }}
                value={deliveryTime}
                onChange={(value) => {
                  setDeliveryTime(value);
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  )
}
