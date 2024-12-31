import React, { useState } from "react";
import { BoxModal } from "../styled";
import { Box, Divider, Modal, TextField, Typography } from "@mui/material";
import { ModalProps } from "../type";
import ModalHead from "@/app/lib/ModalHead";

interface IProps extends ModalProps {
    setItemList?: any;
    addCustomAmount?: (customAmount: any) => Promise<void>;
}

export default function AddCustomAmount({open, onClose, setItemList, addCustomAmount}: IProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [customAmount, setCustomAmount] = useState<{price: number, name: string, quantity: number}>({
        name: '',
        price: 0,
        quantity: 1,
    });

    const handleAddCustomAmount = async () => {
        if (addCustomAmount) {
            setIsLoading(true);
            await addCustomAmount(customAmount);
            setIsLoading(false);
            onClose();
            return;
        }

        if (setItemList) {
            setItemList((prevState: any) => [
            {
                id: 0,
                name: customAmount.name,
                quantity: 1,
                price: customAmount.price,
                totalPrice: customAmount.price,
                availability: true
            }, ...prevState]);
            onClose();
            return;
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <BoxModal>
                <ModalHead 
                    heading="Add Custom Amount"
                    buttonLabel="ADD"
                    onClick={handleAddCustomAmount}
                    buttonProps={{loading: isLoading}}
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

                    <Typography>Name</Typography>
                    <TextField 
                        label="Name"
                        value={customAmount.name}
                        onChange={(e: any) => setCustomAmount((prevState: any) => ({...prevState, name: e.target.value}))}
                        placeholder="Enter name"
                        fullWidth
                    />

                    <Typography>Quantity</Typography>
                    <TextField 
                        label="Quantity"
                        type="number"
                        value={customAmount.quantity}
                        onChange={(e: any) => setCustomAmount((prevState: any) => ({...prevState, quantity: +e.target.value}))}
                        placeholder="Enter quantity"
                        fullWidth
                    />
                </Box>
            </BoxModal>
        </Modal>
    )
}