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

interface IProps {
  units: IInventoryUnit[];
  onChange?: any;
  value?: any;
  removeUnit?: any;
  setEditUnit?: any;
  isShowPrice?: boolean;
}

export default function UnitRadio({
  units,
  onChange,
  value,
  removeUnit,
  setEditUnit,
  isShowPrice,
}: IProps) {
  console.log(units, 'UNITS');
  return (
    <RadioGroup row name="unit" value={value} onChange={onChange}>
      {units.map((unit: any, index: number) => {
        return (
          <Box display="flex" alignItems="center" mx={2}>
            <FormControlLabel
              key={index}
              value={JSON.stringify(unit)}
              control={<Radio />}
              label={`${isShowPrice ? `($${unit?.unitPrice})` : ''} 1:${unit.ratio} - ${unit.unit}`}
              disabled={!value}
            />

            {removeUnit && (
              <IconButton onClick={() => removeUnit(unit)} size="small">
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
