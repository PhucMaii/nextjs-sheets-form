import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Modal,
  OutlinedInput,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../admin/[companyId]/components/Modals/type';
import { BoxModal } from '../admin/[companyId]/components/Modals/styled';
import ModalHead from '../lib/ModalHead';
import { ItemButton } from './OrderView';
import { grey } from '@mui/material/colors';
import { IOption } from '../utils/type';
import { primaryColor } from '@/theme/color';

interface IProps extends ModalProps {
  item: any;
  onSubmit: (quantity: number, option?: IOption | null) => void;
}

export default function SetItemQuantity({
  open,
  onClose,
  item,
  onSubmit,
}: IProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<IOption | null>(
    item?.options[0] || null,
  );

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (item?.options) {
      setSelectedOption(item?.options[0] || null);
      setQuantity(0);
    }
  }, [item]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading={`How many ${item?.name}?`}
          buttonLabel="ADD"
          onClose={onClose}
          onClick={() => onSubmit(quantity, selectedOption)}
          buttonProps={{}}
          onlyHeading={smDown}
        />

        <Divider sx={{ my: 2 }} />

        {item?.options && (
          <Grid container>
            {item.options.map((option: any) => (
              <Grid item xs={6} md={4} lg={3} key={option.id}>
                <ItemButton
                  item={option}
                  onClick={() => setSelectedOption(option)}
                  containerStyle={{
                    backgroundColor: grey[100],
                    border: `3px solid ${selectedOption?.id === option.id ? primaryColor : 'transparent'}`,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <FormControl fullWidth sx={{ mt: 3 }}>
          <InputLabel id="quantity-label">Quantity</InputLabel>
          <OutlinedInput
            label="Quantity"
            placeholder="Quantity"
            type="number"
            value={quantity}
            onChange={(e: any) => setQuantity(e.target.value)}
            inputProps={{
              min: 1,
            }}
          />
        </FormControl>

        {smDown && (
          <Box width="100%" sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => onSubmit(quantity, selectedOption)}
            >
              Add
            </Button>
          </Box>
        )}
      </BoxModal>
    </Modal>
  );
}
