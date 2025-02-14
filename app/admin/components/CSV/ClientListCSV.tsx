import { UserContext } from '@/app/context/UserContextAPI';
import { USER_ROLE } from '@/app/utils/enum';
import { UserType } from '@/app/utils/type';
import { Box, Button, Typography } from '@mui/material';
import { DownloadIcon } from 'lucide-react';
import React, { memo, useContext } from 'react';
import { CSVLink } from 'react-csv';

interface IProps {
  clientData: UserType[];
  style?: any;
}

const ClientListCSV = ({ clientData, style }: IProps) => {
  const { user } = useContext(UserContext);

  const headers = [
    { label: 'Client Id', key: 'clientId' },
    { label: 'Name', key: 'clientName' },
    { label: 'Category', key: 'category.name' },
    { label: 'Type', key: 'type' },
    { label: 'Payment Type', key: 'preference.paymentType' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'contactNumber' },
    { label: 'Address', key: 'deliveryAddress' },
    { label: 'Created At', key: 'createdAt' },
  ];

  if (user?.role !== USER_ROLE.SUPER_ADMIN) {
    return null;
  }

  return (
    <CSVLink data={clientData} headers={headers} aria-disabled={true}>
      <Button
        disabled={user?.role !== USER_ROLE.SUPER_ADMIN}
        size="small"
        {...style}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <DownloadIcon />
          <Typography sx={{ fontSize: 15 }} fontWeight="bold">
            Download CSV
          </Typography>
        </Box>
      </Button>
    </CSVLink>
  );
};

export default memo(ClientListCSV, (prev, next) => {
  return Object.is(prev.clientData, next.clientData);
});
