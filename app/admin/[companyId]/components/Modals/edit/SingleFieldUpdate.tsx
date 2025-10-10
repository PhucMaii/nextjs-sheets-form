import {
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { LoadingButton } from '@mui/lab';

export interface SingleFieldUpdateProps {
  title: string;
  label: string;
  handleUpdate?: (key: string, value: any) => Promise<void>;
  menuList: any;
  open: boolean;
  onClose?: any;
  updatedField: string;
  renderField?: string;
  defaultValue?: any;
}

const SingleFieldUpdate = ({
  open,
  onClose,
  title,
  handleUpdate,
  menuList,
  label,
  updatedField,
  renderField,
  defaultValue,
}: SingleFieldUpdateProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [value, setValue] = useState<any>('');

  useEffect(() => {
    if (!open) {
      setValue('');
    }
  }, [open]);
 
  useEffect(() => {
    if (defaultValue && open) {
      setValue(defaultValue);
    }
  }, [defaultValue, open]);

  const handleSavingUpdate = async () => {
    if (!handleUpdate) {
      return;
    }
    try {
      setIsLoading(true);
      await handleUpdate(updatedField, value);
      onClose();
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to save update: ', error);
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{title}</Typography>
          <LoadingButton
            variant="contained"
            disabled={value === ''}
            loading={isLoading}
            onClick={handleSavingUpdate}
          >
            UPDATE
          </LoadingButton>
        </Box>
        <Divider />
        <Typography variant="h6">{label}</Typography>
        <Select value={value} onChange={(e) => setValue(e.target.value)}>
          <MenuItem value="">-- Choose --</MenuItem>
          {menuList.length > 0 &&
            menuList.map((menuItem: any, index: number) => {
              return (
                <MenuItem
                  key={index}
                  value={renderField ? menuItem.id : menuItem}
                >
                  {renderField ? menuItem[renderField] : menuItem}
                </MenuItem>
              );
            })}
        </Select>
      </BoxModal>
    </Modal>
  );
};

export default memo(SingleFieldUpdate);
