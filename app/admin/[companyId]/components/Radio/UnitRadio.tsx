import {
  Box,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
} from '@mui/material';
import React from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import { IInventoryUnit } from '@/app/utils/type';
import { USER_ROLE } from '@/app/utils/enum';

interface IProps {
  units: IInventoryUnit[];
  onChange?: any;
  value?: any;
  removeUnit?: any;
  setEditUnit?: any;
  isShowPrice?: boolean;
  role?: USER_ROLE;
  idValue?: boolean;
}

export default function UnitRadio({
  units,
  onChange,
  value,
  removeUnit,
  setEditUnit,
  isShowPrice,
  role,
  idValue,
}: IProps) {
  return (
    <RadioGroup row name="unit" value={value} onChange={onChange}>
      {units.map((unit: any, index: number) => {
        return (
          <Box display="flex" alignItems="center" mx={2}>
            <FormControlLabel
              key={index}
              value={idValue ? Number(unit.id) : JSON.stringify(unit)}
              control={<Radio />}
              label={`${isShowPrice ? `($${unit?.unitPrice})` : ''} 1:${unit.ratio} - ${unit.unit}`}
              disabled={!value}
            />

            {removeUnit && (
              <IconButton
                onClick={() => removeUnit(unit)}
                size="small"
                disabled={role === USER_ROLE.DRIVER}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            )}
            {setEditUnit && (
              <IconButton
                onClick={() =>
                  setEditUnit((prevState: any) => ({
                    ...prevState,
                    unit: unit,
                    open: true,
                    unitIndex: index,
                    vendorId: unit?.vendorId,
                  }))
                }
                disabled={role === USER_ROLE.DRIVER}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        );
      })}
    </RadioGroup>
  );
}
