import { Box, Divider, MenuItem, Modal, Select, Typography } from '@mui/material';
import React, { memo, useState } from 'react';
import { BoxModal } from './styled';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';
import { infoColor } from '@/app/theme/color';

export interface SingleFieldUpdateProps {
    title: string;
    label: string;
    handleUpdate?: (key: string, value: any) => Promise<void>;
    menuList: any;
    open: boolean;
    onClose?: any;
    updatedField: string;
}

const SingleFieldUpdate = ({
    open,
    onClose,
    title,
    handleUpdate,
    menuList,
    label,
    updatedField
}: SingleFieldUpdateProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [value, setValue] = useState<any>('');
    
    const handleSavingUpdate = async () => {
        if (!handleUpdate) {
            return;
        }
        try {
            setIsLoading(true);
            await handleUpdate(updatedField, value);
            setIsLoading(false);
        } catch (error: any) {
            console.log('Fail to save update: ', error);
            setIsLoading(false);
        }
    }
    
  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal 
            display="flex"
            flexDirection="column"
            gap={2}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{title}</Typography>
          <LoadingButtonStyles
            variant="contained"
            disabled={value === ''}
            loading={isLoading}
            onClick={handleSavingUpdate}
            color={infoColor}
          >
            UPDATE
          </LoadingButtonStyles>
        </Box>
        <Divider />
        <Typography variant="h6">{label}</Typography>
        <Select value={value} onChange={(e) => setValue(e.target.value)}>
            <MenuItem value=''>-- Choose --</MenuItem>
            {
                menuList.length > 0 && menuList.map((menuItem: any, index: number) => {
                    return (
                        <MenuItem key={index} value={menuItem}>
                            {menuItem}
                        </MenuItem>
                    )
                })
            }
        </Select>
        </BoxModal>
    </Modal>
  )
}

export default memo(SingleFieldUpdate)