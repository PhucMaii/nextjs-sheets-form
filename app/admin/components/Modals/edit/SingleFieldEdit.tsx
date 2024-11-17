import { Divider, FormControl, InputLabel, MenuItem, Modal, Select, TextField } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';

interface IProps {
    open: boolean;
    onClose: any;
    handleUpdate: any;
    title: string;
    value: any;
    inputLabel: string;
    handleOnChange: any;
    menuList?: any[];
    renderField?: string;
}

export default function SingleFieldEdit({
    open,
    onClose,
    handleUpdate,
    title,
    value,
    inputLabel,
    handleOnChange,
    renderField,
    menuList,
}: IProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            await handleUpdate();

            setIsLoading(false);
        } catch (error: any) {
            console.log('Internal Server Error: ', error.response.data.error);
        }
    }

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading={title}
                buttonLabel="UPDATE"
                onClick={handleSubmit}
                buttonProps={{loading: isLoading}}
                onClose={onClose}
            />

            <Divider sx={{my: 2}} />

            {
                menuList && renderField ? (
                    <FormControl>
                        <InputLabel htmlFor="select">{inputLabel}</InputLabel>
                        <Select id="select" value={value} onChange={handleOnChange}>
                            {
                                menuList.length > 0 && menuList.map((item: any, index: number) => {
                                    return (
                                        <MenuItem value={item.id} key={index}>{item[renderField]}</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                ) : (
                    <FormControl>
                        <InputLabel htmlFor="text-field">{inputLabel}</InputLabel>
                        <TextField 
                            id="text-field"
                            value={value}
                            onChange={handleOnChange}
                            variant="outlined"
                        />
                    </FormControl>
                )
            }
        </BoxModal>
    </Modal>
  )
}
