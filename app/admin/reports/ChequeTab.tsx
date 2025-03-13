import {
  Box,
  Button,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import UploadChequeModal from '../components/Modals/UploadChequeModal';
import { UserType } from '@/app/utils/type';
import { months } from '@/app/lib/constant';
import { UploadIcon } from 'lucide-react';

interface IProps {
  client: UserType | null;
}

export default function ChequeTab({ client }: IProps) {
  const [isUploadChequeOpen, setIsUploadChequeOpen] = useState<boolean>(false);

  return (
    <>
      <UploadChequeModal
        open={isUploadChequeOpen}
        onClose={() => setIsUploadChequeOpen(false)}
        showNotification={() => {}}
        clientId={client?.clientId || ''}
        year={new Date().getFullYear().toString()}
        month={months[new Date().getMonth()]}
      />
      <TextField
        fullWidth
        placeholder="Search cheque by cheque number or date"
        variant="filled"
      />
      <Box width="100%" display="flex" justifyContent="flex-end" mt={2}>
        <Button onClick={() => setIsUploadChequeOpen(true)}>
          <Box display="flex" alignItems="center" gap={1}>
            <UploadIcon />
            <Typography fontWeight="medium">Upload Cheque</Typography>
          </Box>
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Cheque Number</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>For</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
      </Table>
    </>
  );
}
