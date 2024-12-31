import React, { useState } from "react";
import { BoxModal } from "../styled";
import { Box, Divider, Modal, TextField, Typography } from "@mui/material";
import { ModalProps } from "../type";
import ModalHead from "@/app/lib/ModalHead";

interface IProps extends ModalProps {
    setItemList: any;
}

export default function AddCustomAmount({open, onClose, setItemList}: IProps) {
    const [customAmount, setCustomAmount] = useState<{price: number, description: string}>({
        price: 0,
        description: ''
    });

    const handleAddCustomAmount = () => {
        setItemList((prevState: any) => [
        {
            id: 0,
            name: customAmount.description,
            quantity: 1,
            price: customAmount.price,
            totalPrice: customAmount.price,
            availability: true
        }, ...prevState]);
        
        onClose();
    }

    return (
        <Modal open={open} onClose={onClose}>
            <BoxModal>
                <ModalHead 
                    heading="Add Custom Amount"
                    buttonLabel="ADD"
                    onClick={handleAddCustomAmount}
                    buttonProps={{}}
                    onClose={onClose}
                />

                <Divider sx={{my: 2}} />

                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography>Price</Typography>
                    <TextField 
                        label="Price"
                        type="number"
                        value={customAmount.price}
                        onChange={(e: any) => setCustomAmount((prevState: any) => ({...prevState, price: +e.target.value}))}
                        placeholder="Enter price"
                        fullWidth
                    />

                    <Typography>Description</Typography>
                    <TextField 
                        label="Description"
                        value={customAmount.description}
                        onChange={(e: any) => setCustomAmount((prevState: any) => ({...prevState, description: e.target.value}))}
                        placeholder="Enter description"
                        fullWidth
                    />
                </Box>
            </BoxModal>
        </Modal>
    )
}