import { IQuote } from '@/app/utils/type';
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import React from 'react';
import StatusText from '../StatusText';
import { QUOTE_STATUS } from '@/app/utils/enum';
import { grey } from '@mui/material/colors';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface IProps {
  quotes: IQuote[];
}

const QuotesTable = ({ quotes }: IProps) => {
  const router = useRouter();
  const { companyId } = useParams() as any;
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Quote ID</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Note</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {quotes.map((quote) => (
            <TableRow
              key={quote.id}
              sx={{
                '&:hover': { backgroundColor: grey[100] },
              }}
              onClick={() => router.push(`/admin/${companyId}/quotes/${quote.id}`)}
            >
              <TableCell>{quote.id}</TableCell>
              <TableCell>{quote.user.clientName}</TableCell>
              <TableCell>{quote.user.email}</TableCell>
              <TableCell>{quote.note}</TableCell>
              <TableCell>{quote.createdAt}</TableCell>
              <TableCell>
                <StatusText
                  type={
                    quote.status === QUOTE_STATUS.DRAFT
                      ? 'warning'
                      : quote.status === QUOTE_STATUS.SENT
                        ? 'info'
                        : quote.status === QUOTE_STATUS.CONVERTED
                          ? 'success'
                          : quote.status === QUOTE_STATUS.REJECTED
                            ? 'error'
                            : 'info'
                  }
                  text={quote.status}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QuotesTable;
