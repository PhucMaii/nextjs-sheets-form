import { ICreditReport } from '@/app/utils/type';
import { DateRange, Person } from '@mui/icons-material';
import SellIcon from '@mui/icons-material/Sell';
import { error } from '@/theme/color';
import { formatCurrency } from '@/app/utils/number';
import {
  Box,
  Button,
  Chip,
  IconButton,
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
import { useParams, useRouter } from 'next/navigation';
import { Trash2Icon } from 'lucide-react';
import ConfirmModal from '../Modals/ConfirmModal';
import { ShowNotificationType } from '@/hooks/useNotification';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';

interface IProps {
  creditReports: ICreditReport[];
  showNotification: ShowNotificationType;
  refetchCreditReports: any;
}

export default function CreditReportTable({
  creditReports,
  showNotification,
  refetchCreditReports,
}: IProps) {
  const { companyId }: any = useParams();
  const router = useRouter();

  const [deleteProps, setDeleteProps] = useState<any>({
    open: false,
    creditId: 0,
  });
  const [creditItemProps, setCreditItemProps] = useState<any>({
    open: false,
    creditId: 0,
    items: [],
  });

  const handleDeleteCreditReport = async (creditId: number) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/credit-reports?id=${creditId}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await refetchCreditReports();
      showNotification('success', response.data.message);
      setDeleteProps({ open: false, creditId: 0 });
    } catch (error: any) {
      console.log('Fail to delete credit report: ' + error);
      showNotification('error', 'Fail to delete credit report: ' + error);
    }
  };

  return (
    <>
      <ConfirmModal
        open={deleteProps.open}
        onClose={() => setDeleteProps({ open: false, creditId: 0 })}
        title="Are you sure to delete this credit report?"
        handleSubmit={() => handleDeleteCreditReport(deleteProps.creditId)}
        showNotification={showNotification}
        color="error"
        buttonLabel="Yes, I'm sure"
      />
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
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {creditReports.map((credit: ICreditReport) => (
              <TableRow
                key={credit.id}
                hover
                onClick={() =>
                  router.push(`/admin/${companyId}/credit-reports/${credit.id}`)
                }
              >
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
                      {new Date(credit.reportedDate).toLocaleDateString()}
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
                    onClick={(e: any) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setCreditItemProps({
                        open: true,
                        creditId: credit.id,
                        items: credit.creditItems,
                      });
                    }}
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
                <TableCell align="center">
                  <IconButton
                    onClick={(e: any) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDeleteProps({ open: true, creditId: credit.id });
                    }}
                    color="error"
                  >
                    <Trash2Icon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
