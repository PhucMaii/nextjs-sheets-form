import {
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { LoadingButton } from '@mui/lab';

interface IProps {
  open: boolean;
  onClose: any;
  handleUpdate: any;
  title: string;
  inputLabel: string;
  menuList?: any[];
  renderField?: string;
  defaultValue?: any;
  buttonLabel?: string;
  inputProps?: any;
}

const SingleFieldEdit = ({
  open,
  onClose,
  handleUpdate,
  title,
  inputLabel,
  renderField,
  menuList,
  defaultValue,
  buttonLabel,
  inputProps,
}: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [value, setValue] = useState<any>(defaultValue ? defaultValue : null);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue, open]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await handleUpdate(value);

      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error.response.data.error);
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        {!smDown && (
          <ModalHead
            heading={title}
            buttonLabel={buttonLabel ? buttonLabel : 'UPDATE'}
            onClick={handleSubmit}
            buttonProps={{ loading: isLoading }}
            onClose={onClose}
          />
        )}

        {smDown && (
          <Typography variant="h4" fontWeight={500}>
            {title}
          </Typography>
        )}

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
            <OutlinedInput
              fullWidth
              id="text-field"
              value={value}
              onChange={(e: any) => setValue(e.target.value)}
              variant="outlined"
              // label={inputLabel}
              {...inputProps}
            />
          </FormControl>
        )}

        {smDown && (
          <Box display="flex" gap={1} alignItems="center" mt={2}>
            <Button onClick={onClose} fullWidth variant="outlined">
              Cancel
            </Button>
            <LoadingButton
              fullWidth
              loading={isLoading}
              variant="contained"
              onClick={handleSubmit}
            >
              {buttonLabel ? buttonLabel : 'UPDATE'}
            </LoadingButton>
          </Box>
        )}
      </BoxModal>
    </Modal>
  );
};

export default SingleFieldEdit;
