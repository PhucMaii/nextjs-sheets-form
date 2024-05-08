import { UpdateOption } from '@/pages/api/admin/orderedItems/PUT';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';

interface PropTypes {
  updateOption: UpdateOption;
  setUpdateOption: Dispatch<SetStateAction<UpdateOption>>;
}

export default function UpdateChoiceSelection({
  updateOption,
  setUpdateOption,
}: PropTypes) {
  return (
    <RadioGroup
      row
      value={updateOption}
      onChange={(e) => setUpdateOption(e.target.value as UpdateOption)}
    >
      <FormControlLabel
        value={UpdateOption.NONE}
        control={<Radio />}
        label="Only for this time"
      />
      <FormControlLabel
        value={UpdateOption.CREATE}
        control={<Radio />}
        label="Create new category"
      />
      <FormControlLabel
        value={UpdateOption.UPDATE}
        control={<Radio />}
        label="Update the category"
      />
    </RadioGroup>
  );
}
