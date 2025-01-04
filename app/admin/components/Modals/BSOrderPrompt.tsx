import { Box, Modal, TextField, Typography } from '@mui/material';
import React, { Fragment } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import { getTodayDate } from '@/pages/api/utils/date';

interface IProps extends ModalProps {
}

const bkItems = ['BEAN 10 LB', 'BEAN 5 LB', 'BEAN 1 LB'];

export default function BSOrderPrompt({open, onClose}: IProps) {
    const today = getTodayDate();

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <Typography variant="h5" textAlign="center">
                Have you pre ordered Beanspouts King for {today.date}?
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} sx={{my: 2}}>
                {
                    bkItems.map((item, index) => (
                        <Fragment key={index}>
                            <Typography variant="h6">{item}</Typography>
                            <TextField 
                                variant="outlined"
                                type="number"
                            />
                        </Fragment>
                    ))
                }
            </Box>
        </BoxModal>
    </Modal>
  )
}
