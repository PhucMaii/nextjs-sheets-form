import {
    Autocomplete,
  Box,
  Chip,
  Divider,
  FormControl,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {}

export default function AddPromotion({ open, onClose }: IProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Promotion"
          buttonLabel="ADD"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <FormControl fullWidth>
            <Typography>Title</Typography>
            <OutlinedInput placeholder="Enter promotion title..." />
          </FormControl>

          <FormControl fullWidth>
            <Typography>Promoted Product</Typography>
            {/* <Select
              multiple
              value={selectedIds}
              onChange={(e) => setSelectedIds(e.target.value as string[])}
              input={<OutlinedInput />}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
              renderValue={(selected) => (
                <Box>
                  {selected?.map((name: string) => {
                    const itemName = name.split(' - ')[1];

                    return <Chip key={name} label={itemName} />;
                  })}
                </Box>
              )}
            >
              {inventoryItems?.data &&
                inventoryItems?.data.map((item: any) => (
                  <MenuItem key={item.id} value={`${item.id} - ${item.name}`}>
                    {item.name}
                  </MenuItem>
                ))}
            </Select> */}
            <Autocomplete 
                
            />
          </FormControl>
        </Box>
      </BoxModal>
    </Modal>
  );
}
