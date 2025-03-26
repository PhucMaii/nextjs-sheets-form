import {
  Box,
  Divider,
  FormControl,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IInventoryUnit, IOption } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import useEditUnit from '@/hooks/unit/useEditUnit';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';

interface IProps extends ModalProps {
  option: IOption;
  showNotification: ShowNotificationType;
}

export default function EditOption({
  open,
  onClose,
  option,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [units, setUnits] = useState<IInventoryUnit[]>([]);
  const [updatedOption, setUpdatedOption] = useState<IOption>(option);

  const [dbUnits] = SWRFetchData(
    option?.unit?.vendorItemId
      ? `${API_URL.ADMIN}/units?vendorItemId=${option?.unit?.vendorItemId}`
      : '',
  );

  const { selectedUnit, UnitDisplay, AddUnitModal, EditUnitModal } =
    useEditUnit(units, updatedOption.unit, showNotification);

  useEffect(() => {
    if (dbUnits) {
      setUnits(dbUnits?.data);
    }
  }, [dbUnits]);

  useEffect(() => {
    if (option) {
      setUpdatedOption(option);
    }
  }, [option]);

  const handleUpdateOption = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/options`, {
        id: updatedOption.id,
        name: updatedOption.name,
        price: updatedOption.price,
        unitId: selectedUnit?.id || updatedOption.unitId,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {AddUnitModal}
      {EditUnitModal}
      <Modal open={open} onClose={onClose}>
        <BoxModal>
          <ModalHead
            heading="Edit Option"
            buttonLabel="EDIT"
            onClick={handleUpdateOption}
            buttonProps={{loading: isLoading}}
            onClose={onClose}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth>
              <Typography>Name</Typography>
              <TextField
                placeholder="Enter option name..."
                value={updatedOption.name}
                onChange={(e) => {
                  setUpdatedOption({
                    ...option,
                    name: e.target.value,
                  });
                }}
              />
            </FormControl>

            <FormControl fullWidth>
              <Typography>Price</Typography>
              <TextField
                placeholder="Enter option price..."
                type="number"
                value={updatedOption.price}
                onChange={(e) => {
                  setUpdatedOption({
                    ...option,
                    price: Number(e.target.value),
                  });
                }}
              />
            </FormControl>

            {UnitDisplay}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
