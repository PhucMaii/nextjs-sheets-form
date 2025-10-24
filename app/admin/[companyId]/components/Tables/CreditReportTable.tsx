import { ICreditReport } from '@/app/utils/type';
import { DateRange, Person } from '@mui/icons-material';
import SellIcon from '@mui/icons-material/Sell';
import { error } from '@/theme/color';
import { formatCurrency } from '@/app/utils/number';
import {
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import CreditItemDetailsModal from '../Modals/CreditItemDetailsModal';
import { getCreditReportTypeColor } from '@/lib/statusColor';

interface IProps {
  creditReports: ICreditReport[];
}

export default function CreditReportTable({ creditReports }: IProps) {
  const [creditItemProps, setCreditItemProps] = useState<any>({
    open: false,
    creditId: 0,
    items: [],
  });

  return (
    <>
      <CreditItemDetailsModal
        open={creditItemProps.open}
        onClose={() =>
          setCreditItemProps({ open: false, creditId: 0, items: [] })
        }
        items={creditItemProps.items || []}
        creditId={creditItemProps.creditId || 0}
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Client Name</TableCell>
              <TableCell>Reported Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="center">Items</TableCell>
              <TableCell align="right">Total Loss</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {creditReports.map((credit: ICreditReport) => (
              <TableRow key={credit.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    #{credit.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" fontWeight="medium">
                      {credit.user.clientName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <DateRange fontSize="small" color="action" />
                    <Typography variant="body2">
                      {new Date(credit.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={credit.type}
                    color={getCreditReportTypeColor(credit.type)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={credit.reason}>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {credit.reason}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2">{credit.createdBy}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SellIcon />}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                    }}
                    onClick={() =>
                      setCreditItemProps({
                        open: true,
                        creditId: credit.id,
                        items: credit.creditItems,
                      })
                    }
                  >
                    {credit.creditItems.length}
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ color: error.main }}
                  >
                    {formatCurrency(credit.totalLoss)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
