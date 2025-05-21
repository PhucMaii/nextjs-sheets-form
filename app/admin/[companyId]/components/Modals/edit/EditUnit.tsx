import { Box, Divider, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import UnitSearch from '../../Autocomplete/UnitSearch';
import { IInventoryUnit } from '@/app/utils/type';
import { USER_ROLE } from '@/app/utils/enum';
import { units } from '@/app/lib/constant';

interface IProps extends ModalProps {
  unit: IInventoryUnit;
  updateUnit: any;
}

export default function EditUnit({ open, onClose, unit, updateUnit }: IProps) {
  const [updatedUnit, setUpdatedUnit] = useState<any>({ ...unit });

  useEffect(() => {
    setUpdatedUnit({ ...unit });
  }, [unit]);

  const selectUpdatedUnit = (newValue: any) => {
    // New Item Add
    if (newValue?.inputValue) {
      setUpdatedUnit({
        ...updatedUnit,
        unit: newValue.inputValue,
      });
    } else {
      // Existing Item Add
      setUpdatedUnit({
        ...updatedUnit,
        unit: newValue,
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit Unit"
          buttonLabel="EDIT"
          onClose={onClose}
          onClick={() => updateUnit(updatedUnit)}
          buttonProps={{}}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Unit</Typography>
            <UnitSearch
              value={updatedUnit.unit}
              handleSelectPromptedItem={selectUpdatedUnit}
              displayItems={units}
              role={USER_ROLE.ADMIN}
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Ratio</Typography>
            <TextField
              placeholder="Enter ratio..."
              type="number"
              value={updatedUnit.ratio}
              inputProps={{ min: 1 }}
              onChange={(e) =>
                setUpdatedUnit({ ...updatedUnit, ratio: +e.target.value })
              }
              fullWidth
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Unit Price</Typography>
            <TextField
              placeholder="Enter unit price..."
              type="number"
              value={updatedUnit.unitPrice}
              onChange={(e) =>
                setUpdatedUnit({ ...updatedUnit, unitPrice: +e.target.value })
              }
              fullWidth
            />
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
