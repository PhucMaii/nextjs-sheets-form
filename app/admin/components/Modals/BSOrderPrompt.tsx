import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import React, { Fragment, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import { getTodayDate } from '@/pages/api/utils/date';

interface IProps extends ModalProps {
    handlePreOrderForBSKing: (preOrderForm: any) => void;
}

const bkItems = ['BEAN 10 LB', 'BEAN 5 LB', 'BEAN 1 LB'];

export default function BSOrderPrompt({open, onClose, handlePreOrderForBSKing}: IProps) {
    const [preOrderForm, setPreOrderForm] = useState<any>({});

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
                                value={preOrderForm[item] || 0}
                                onChange={(e) => {
                                    setPreOrderForm({
                                        ...preOrderForm,
                                        [item]: +e.target.value
                                    });
                                }}
                            />
                        </Fragment>
                    ))
                }
            </Box>
            
            <Button fullWidth variant="contained" onClick={() => handlePreOrderForBSKing(preOrderForm)}>Save</Button>

        </BoxModal>
    </Modal>
  )
}
