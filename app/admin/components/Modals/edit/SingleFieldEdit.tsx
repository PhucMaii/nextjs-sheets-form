import {
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';

interface IProps {
  open: boolean;
  onClose: any;
  handleUpdate: any;
  title: string;
  inputLabel: string;
  menuList?: any[];
  renderField?: string;
  defaultValue?: any;
}

export default function SingleFieldEdit({
  open,
  onClose,
  handleUpdate,
  title,
  inputLabel,
  renderField,
  menuList,
  defaultValue,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [value, setValue] = useState<any>(defaultValue ? defaultValue : null);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      console.log('access here', value);
      await handleUpdate(value);
      console.log('DONE');

      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error.response.data.error);
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading={title}
          buttonLabel="UPDATE"
          onClick={handleSubmit}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        {menuList && renderField ? (
          <FormControl fullWidth>
            <InputLabel htmlFor="select">{inputLabel}</InputLabel>
            <Select
              fullWidth
              id="select"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              label={inputLabel}
            >
              {menuList.length > 0 &&
                menuList.map((item: any, index: number) => {
                  return (
                    <MenuItem value={item.id} key={index}>
                      {item[renderField]}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        ) : (
          <FormControl fullWidth>
            <InputLabel htmlFor="text-field">{inputLabel}</InputLabel>
            <TextField
              fullWidth
              id="text-field"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              variant="outlined"
              label={inputLabel}
            />
          </FormControl>
        )}
      </BoxModal>
    </Modal>
  );
}
