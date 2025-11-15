import { IPurchaseOrder } from '@/app/utils/type';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import StatusText from '../StatusText';
import { PO_STATUS, getAdminApiUrl } from '@/app/utils/enum';
import { grey } from '@mui/material/colors';
import { useParams, useRouter } from 'next/navigation';
import { handleUpdatePOStatus } from '@/app/utils/purchase-orders';
import { LoadingButton } from '@mui/lab';
import { ShowNotificationType } from '@/hooks/useNotification';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';

export default function POTable({
  poList,
  showNotification,
}: {
  poList: IPurchaseOrder[] | any;
  showNotification: ShowNotificationType;
}) {
  const { companyId }: any = useParams();

  const [loading, setLoading] = useState<any>({
    id: null,
    loading: false,
    action: null,
  });

  const [deleteModal, setDeleteModal] = useState<any>({
    open: false,
    id: null,
    targetObj: null,
  });

  const router = useRouter();

  const updateStatus = async (e: any, id: number, status: PO_STATUS) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading({
      id,
      loading: true,
      action: status === PO_STATUS.CANCELLED ? 'cancelPO' : 'markAsOrdered',
    });
    const response = await handleUpdatePOStatus(companyId, id, status);
    setLoading({ id, loading: false, action: null });

    if (response) {
      showNotification('success', 'Purchase order marked as ordered');
    } else {
      showNotification('error', 'Failed to mark purchase order as ordered');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/purchase-orders?id=${id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Purchase order deleted successfully');
      setDeleteModal({ open: false, id: null, targetObj: null });
    } catch (error: any) {
      console.log('Internal Server Error', error);
      showNotification('error', 'Failed to delete purchase order');
    }
  };

  return (
    <>
      <DeleteModal
        open={deleteModal.open}
        handleCloseModal={() => setDeleteModal({ open: false, id: null })}
        handleDelete={(_e: any, id: number) => handleDelete(id)}
        targetObj={deleteModal.id}
        showTargetObj={deleteModal.targetObj?.poNumber}
      />
      <TableContainer component={Paper} sx={{ overflow: 'scroll' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>PO Number</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Received</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Est. Arrival</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {poList.map((po: IPurchaseOrder | any) => (
              <TableRow
                key={po.poNumber}
                sx={{
                  '&:hover': {
                    backgroundColor: grey[100],
                  },
                }}
                onClick={() =>
                  router.push(`/admin/${companyId}/purchase-orders/${po.id}`)
                }
              >
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    #{po.poNumber}
                    {po?.note && (
                      <Tooltip title={po?.note}>
                        <TextSnippetIcon
                          fontSize="small"
                          sx={{ color: grey[500] }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{po.vendor.name}</TableCell>
                <TableCell>
                  <StatusText
                    text={po.status}
                    type={
                      (po.status === PO_STATUS.DRAFT || po.status === PO_STATUS.PRE_APPROVED)
                        ? 'warning'
                        : po.status === PO_STATUS.ORDERED
                          ? 'info'
                          : po.status === PO_STATUS.RECEIVED
                            ? 'success'
                            : 'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  {po?.receivedItems || 0} of {po?.totalItems || 0}
                </TableCell>
                <TableCell>${po?.totalCost?.toFixed(2) || 0}</TableCell>
                <TableCell>{po.estArrival}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      color="error"
                      onClick={(e: any) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteModal({
                          open: true,
                          id: po.id,
                          targetObj: po,
                        });
                      }}
                    >
                      Delete
                    </Button>
                    {po?.status !== PO_STATUS.CANCELLED && (
                      <LoadingButton
                        variant="outlined"
                        color="error"
                        loading={
                          loading.id === po.id &&
                          loading.action === 'cancelPO' &&
                          loading.loading
                        }
                        onClick={(e: any) =>
                          updateStatus(e, po.id, PO_STATUS.CANCELLED)
                        }
                      >
                        Cancel
                      </LoadingButton>
                    )}
                    {po?.status === PO_STATUS.DRAFT ||
                      (po?.status === PO_STATUS.CANCELLED && (
                        <LoadingButton
                          variant="outlined"
                          color="primary"
                          loading={
                            loading.id === po.id &&
                            loading.action === 'markAsOrdered' &&
                            loading.loading
                          }
                          onClick={(e: any) => {
                            updateStatus(e, po.id, PO_STATUS.ORDERED);
                          }}
                        >
                          {po.status === PO_STATUS.ORDERED
                            ? 'Mark as Received'
                            : 'Mark as Ordered'}
                        </LoadingButton>
                      ))}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
