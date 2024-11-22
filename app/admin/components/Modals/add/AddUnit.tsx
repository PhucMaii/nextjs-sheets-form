import { Box, Divider, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import UnitSearch from '../../Autocomplete/UnitSearch';
import { units } from '@/app/lib/constant';
import { USER_ROLE } from '@/app/utils/enum';

interface IProps extends ModalProps {
    vendorItemId: number;
    onClick: any;
}

export default function AddUnit({open, onClose, vendorItemId, onClick}: IProps) {
    const [newUnit, setNewUnit] = useState<any>({
        id: 0,
        unit: 'bags',
        unitPrice: 0,
        ratio: 1,
        vendorItemId
    });

    const selectNewUnit = (_e: any, newValue: any) => {
        // New Item Add
        if (newValue?.inputValue) {
          setNewUnit({
            ...newUnit,
            unit: newValue.inputValue,
          });
        } else { // Existing Item Add
          setNewUnit({
            ...newUnit,
            unit: newValue,
          });
        }
      };

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal>
            <ModalHead 
                heading="Add Unit"
                buttonLabel="ADD"
                onClick={() => onClick(newUnit)}
                buttonProps={{}}
                onClose={onClose}
            />

            <Divider sx={{my: 2}} />

            <Box display="flex" flexDirection="column" gap={3}>

                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Unit</Typography>
                    <UnitSearch 
                        value={newUnit.unit}
                        handleSelectPromptedItem={selectNewUnit}
                        displayItems={units}
                        role={USER_ROLE.ADMIN}
                    />
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Unit Price</Typography>
                    <TextField
                        placeholder='Enter unit price...'
                        type="number"
                        value={newUnit.unitPrice}
                        onChange={(e) => setNewUnit({...newUnit, unitPrice: +e.target.value})}
                        fullWidth
                    />
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="h6">Ratio</Typography>
                    <TextField
                        placeholder='Enter ratio...'
                        type="number"
                        value={newUnit.ratio}
                        onChange={(e) => setNewUnit({...newUnit, ratio: +e.target.value})}
                        fullWidth
                    />
                </Box>
            </Box>


        </BoxModal>
    </Modal>
  )
}
