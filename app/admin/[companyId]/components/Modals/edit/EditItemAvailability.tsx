'use client';
import {
  AlertColor,
  Box,
  IconButton,
  Modal,
  Switch,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { ShadowSection } from '@/app/admin/[companyId]/reports/styled';
import { IItem } from '@/app/utils/type';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import LoadingModal from '../LoadingModal';
import CloseIcon from '@mui/icons-material/Close';
import { primaryColor } from '@/theme/color';
import styled from 'styled-components';
import { useParams } from 'next/navigation';

const ShadowSectionStyled = styled(ShadowSection)`
  &:hover {
    box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;
  }
`;

interface IProps {
  item: IItem;
  handleUpdateItem: (targetItem: IItem) => Promise<void>;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditItemAvailability({
  item,
  handleUpdateItem,
  showNotification,
}: IProps) {
  const { companyId }: any = useParams();
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
    await handleUpdateItem({ ...item, availability: !item.availability });
    setIsUpdating(false);
    setIsOpen(false);
  };

  const handleUpdateAllItemAvailability = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/items/availability'),
        {
          item,
          availability: !item.availability,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsUpdating(false);
        setAvailability(!availability);
        setIsOpen(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsOpen(false);
      setIsUpdating(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
      setAvailability(!availability);
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <LoadingModal open={isUpdating} />
      <Switch
        checked={availability}
        onChange={() => setAvailability(!availability)}
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(true);
        }}
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
            <ShadowSectionStyled
              onClick={handleUpdateItemThisCategory}
              sx={{
                backgroundColor: `${primaryColor} !important`,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Update Current Category Only
              </Typography>
              <Typography variant="body2">
                This option only affect item in current category only and
                won&aposl;t affect other item with same name in other category.
              </Typography>
            </ShadowSectionStyled>
            <ShadowSectionStyled
              onClick={handleUpdateAllItemAvailability}
              sx={{
                backgroundColor: `${primaryColor} !important`,
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Update Items In Same Inventory
              </Typography>
              <Typography variant="body2">
                This option will affect all item with same{' '}
                <strong>INVENTORY ITEM</strong> in the database, no matter which
                category they are assigned.
              </Typography>
            </ShadowSectionStyled>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
