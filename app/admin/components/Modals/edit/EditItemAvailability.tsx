'use client';
import { Box, IconButton, Modal, Switch, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { ShadowSection } from '@/app/admin/reports/styled';
import { IItem, Notification } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import LoadingModal from '../LoadingModal';
import CloseIcon from '@mui/icons-material/Close';
import { primaryColor } from '@/app/theme/color';

interface IProps {
    item: IItem;
    handleUpdateItem: (targetItem: IItem) => Promise<void>;
    setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function EditItemAvailability({
    item,
    handleUpdateItem,
    setNotification
}: IProps) {
    const [availability, setAvailability] = useState<boolean>(item.availability);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        if (item) {
            setAvailability(item.availability);
        }
    }, [item]);

    const handleUpdateItemThisCategory = async () => {
        setIsUpdating(true);
        await handleUpdateItem({ ...item, availability });
        setIsUpdating(false);
        setIsOpen(false);
    }

    const handleUpdateAllItemAvailability = async () => {
        setIsUpdating(true);
        try {
            const response = await axios.put(`${API_URL.ITEM}/availability`, {item, availability});

            if (response.data.error) {
                setNotification({
                    on: true,
                    type: 'error',
                    message: response.data.error
                });
                setIsUpdating(false);
                setAvailability(!availability);
                setIsOpen(false);
                return;
            }

            setNotification({
                on: true,
                type: 'success',
                message: response.data.message
            });
            setIsOpen(false);
            setIsUpdating(false);
        } catch (error: any) {
            console.log('There was an error: ', error);
            setNotification({
                on: true,
                type: 'error',
                message: error.response.data.error
            });
            setAvailability(!availability);
            setIsUpdating(false);
            setIsOpen(false);
        }
    }

  return (
    <>
      <LoadingModal open={isUpdating} />
      <Switch
        checked={availability}
        onChange={() => setAvailability(!availability)}
        onClick={() => setIsOpen(true)}
      />
      <Modal open={isOpen}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          overflow="auto"
          maxHeight="80vh"
        >
          <Box display="flex" justifyContent="flex-end">
            <IconButton
              onClick={() => {
                setAvailability(!availability);
                setIsOpen(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <ShadowSection
              onClick={handleUpdateItemThisCategory}
              sx={{
                backgroundColor: `${primaryColor} !important`,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Update Current Category Only
              </Typography>
              <Typography variant="body2">
                This option only affect item in current category only and won't
                affect other item with same name in other category.
              </Typography>
            </ShadowSection>
            <ShadowSection
              onClick={handleUpdateAllItemAvailability}
              sx={{
                backgroundColor: `${primaryColor} !important`,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Update All Items Same Name
              </Typography>
              <Typography variant="body2">
                This option will affect all <strong>{item.name}</strong> in the
                database, no matter which category they are assigned.
              </Typography>
            </ShadowSection>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
