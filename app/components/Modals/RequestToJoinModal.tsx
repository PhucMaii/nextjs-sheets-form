import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import useNotification from '@/hooks/useNotification';
import { LoadingButton } from '@mui/lab';
import { Box, Modal, Typography, TextField } from '@mui/material';
import { grey } from '@mui/material/colors';
import axios from 'axios';
import React, { useState } from 'react';

interface IProps extends ModalProps {
}

export default function RequestToJoinModal({open, onClose}: IProps ) {
    const [clientInfo, setClientInfo] = useState<any>({
        name: '',
        email: '',
        contactNumber: '',
        deliveryAddress: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { showNotification, NotificationComp } = useNotification();

    const handleSendRequest = async () => {
        if (!clientInfo.name || !clientInfo.email || !clientInfo.contactNumber || !clientInfo.deliveryAddress) {
            showNotification('error', 'Please fill all the fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/api/signup', clientInfo);

            if (response.data.error) {
                showNotification('error', response.data.error);
                setIsLoading(false);
                return;
            }

            showNotification('success', response.data.message);
            setIsLoading(false);
        } catch (error: any) {
            console.log('Internal Server Error: ', error);
            showNotification('error', 'Internal Server Error: ' + error?.response?.data?.error || error);
            setIsLoading(false);
            return;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
        }
    }

  return (
    <>
    {NotificationComp}
    <Modal sx={{maxHeight: '80vh', overflow: 'scroll'}} open={open} onClose={onClose}>
        <BoxModal>
            <Box display="flex" flexDirection="column" gap={2} justifyContent="center">
                <Typography textAlign="center" variant="h3">Welcome To Supreme Sprouts !</Typography>
                <Typography textAlign="center" variant="h5" fontWeight="normal">
                    Here Is Your First Step To Grow Your Business
                </Typography>
                <Typography textAlign="center" variant="h5" fontWeight="bold">Create Your Account</Typography>

                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>Company Name</Typography>
                    <TextField
                        size="small"
                        type="text"
                        placeholder="Please enter your company name..."
                        value={clientInfo.name}
                        onChange={(e: any) => setClientInfo((prevState: any) => ({...prevState, name: e.target.value}))}
                    />
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>Email</Typography>
                    <TextField
                        size="small"
                        type="text"
                        placeholder="Please enter your email..."
                        value={clientInfo.email}
                        onChange={(e: any) => setClientInfo((prevState: any) => ({...prevState, email: e.target.value}))}
                    />
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>Contact Number</Typography>
                    <TextField
                        size="small"
                        type="number"
                        placeholder="Please enter your contact number..."
                        value={clientInfo.contactNumber}
                        onChange={(e: any) => setClientInfo((prevState: any) => ({...prevState, contactNumber: e.target.value}))}
                    />
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>Address</Typography>
                    <TextField
                        size="small"
                        type="text"
                        placeholder="Please enter you address..."
                        value={clientInfo.deliveryAddress}
                        onChange={(e: any) => setClientInfo((prevState: any) => ({...prevState, deliveryAddress: e.target.value}))}
                    />
                </Box>
                
                <Typography sx={{color: grey[600]}}>* We are excited to have you on board! Please note that our team will reach out to you within 24 hours to assist you. Thank you. *</Typography>

                <LoadingButton onClick={handleSendRequest} loading={isLoading} variant="contained">
                    Submit
                </LoadingButton>
            </Box>

        </BoxModal>
    </Modal>
    </>

  )
}
