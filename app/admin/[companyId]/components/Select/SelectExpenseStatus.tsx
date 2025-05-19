import { MenuItem, Select } from '@mui/material';
import React from 'react';
import StatusText from '../StatusText';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { transactionStatusList } from '@/app/lib/constant';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface IProps {
  value: any;
  onChange: any;
}

export default function SelectExpenseStatus({ value, onChange }: IProps) {
  return (
    <Select
      value={value}
      onChange={onChange}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {transactionStatusList.map((status: TRANSACTION_STATUS) => {
        return (
          <MenuItem key={status} value={status}>
            <StatusText
              text={status.toUpperCase()}
              type={status === TRANSACTION_STATUS.PAID ? 'success' : 'error'}
              icon={
                status === TRANSACTION_STATUS.PAID ? (
                  <CheckIcon color="success" />
                ) : (
                  <CloseIcon color="error" />
                )
              }
            />
          </MenuItem>
        );
      })}
    </Select>
  );
}
