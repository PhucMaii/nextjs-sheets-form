import { AlertColor, Box, Divider, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
    showNotification: (type: AlertColor, message: string) => void
}

export default function AddExpense({open, onClose}: IProps) {
    const [newExpense, setNewExpense] = useState<any>({
        date: '',
        amount: 0,
        description: '',
        paymentMethodId: -1,
        spentBy: '',
    });
    const { date, SelectDate } = useSelectDate('', true);

    
    const fetchAdminsAndDrivers = async () => {
        try {
            const adminResponse = await axios.get(`${API_URL.ADMIN}/admins`);
            const driverResponse = await axios.get(`${API_URL.ADMIN}/drivers`); 
        } catch (error) {
            console.log(error);
        }
    }


  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading='Add Expense' 
                onClose={onClose} 
                onClick={() => {}} 
                buttonProps={{}} buttonLabel='ADD' 
            />
            
            <Divider sx={{my: 2}} />

            
            <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Date</Typography>
                    {SelectDate}
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Amount</Typography>
                    <TextField 
                        placeholder="Enter epxense amount..."
                        fullWidth
                        value={newExpense.amount}
                        type="number"
                    />
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Spent By</Typography>
                    
                </Box>
            </Box>
           
        </BoxModal>
    </Modal>
  )
}
