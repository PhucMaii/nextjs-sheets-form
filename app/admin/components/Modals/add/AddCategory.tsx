import { Divider, Modal, TextField } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { Notification } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
    setNotification: Dispatch<SetStateAction<Notification>>;
    handleOnChangeClient: any;
    mutateCategories: any;
}

export default function AddCategory({
    open,
    onClose,
    setNotification,
    handleOnChangeClient,
    mutateCategories
}: IProps) {
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [newCategoryName, setNewCategoryName] = useState<string>('');

    const handleCreateNewCategory = async () => {
        setIsCreating(true);
        try {
            const response = await axios.post(API_URL.CATEGORIES, {categoryName: newCategoryName});

            if (response.data.error) {
                setNotification({
                    on: true,
                    type: 'error',
                    message: response.data.error
                })
                setIsCreating(false);
                return;
            }

            handleOnChangeClient('category', response.data.data);
            mutateCategories();

            setNotification({
                on: true,
                type: 'success',
                message: response.data.message
            });
            setIsCreating(false);
        } catch (error: any) {
            console.log('Internal Server Error: ', error);
            setNotification({
                on: true,
                type: 'error',
                message: 'Internal Server Error: ' + error.response.data.error
            });
            setIsCreating(false);
        }
    }

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal display="flex" flexDirection="column" gap={2} maxWidth='80vh' overflow="auto">
            <ModalHead 
                heading="New Category"
                buttonLabel='Create'
                buttonProps={{loading: isCreating}}
                onClick={handleCreateNewCategory}
                onClose={onClose}
            />
            <Divider />

            <TextField 
                label="Name"
                value={newCategoryName}
                onChange={(e: any) => setNewCategoryName(e.target.value)}
                fullWidth
            />
        </BoxModal>
    </Modal>
  )
}
