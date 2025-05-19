import {
  Box,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import { IProductLoss } from '@/app/utils/type';
import { LOSS_REPORT_TYPE, getAdminApiUrl } from '@/app/utils/enum';
import useEmployee from '@/hooks/select/useEmployee';
import useSelectDate from '@/hooks/useSelectDate';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import { Trash2Icon } from 'lucide-react';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  productLoss: IProductLoss;
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
}

export default function EditProductLoss({
  open,
  onClose,
  productLoss,
  showNotification,
  refresh,
}: IProps) {
  const { companyId }: any = useParams();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [updatedProductLoss, setUpdatedProductLoss] =
    useState<IProductLoss>(productLoss);

  const { selectedEmployee, renderEmployeeSearch } = useEmployee(
    productLoss.reportedBy,
  );
  const { date, SelectDate } = useSelectDate(
    productLoss.reportedDate,
    true,
    true,
  );

  useEffect(() => {
    if (productLoss) {
      setUpdatedProductLoss(productLoss);
    }
  }, [productLoss]);

  useEffect(() => {
    if (updatedProductLoss.quantityLost && updatedProductLoss.inventoryUnit) {
      setUpdatedProductLoss({
        ...updatedProductLoss,
        totalCost:
          updatedProductLoss.quantityLost *
          updatedProductLoss.inventoryUnit.unitPrice,
      });
    }
  }, [updatedProductLoss.quantityLost]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/product-loss?id=${productLoss.id}`),
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await refresh();

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('Something went wrong', error);
      showNotification('error', 'Something went wrong');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/product-loss'),
        {
          id: updatedProductLoss.id,
          updatedProductLoss: {
            ...updatedProductLoss,
            reportedBy: selectedEmployee,
            reportedDate: date,
          },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await refresh();

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('Something went wrong', error);
      showNotification('error', 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit Product Loss"
          buttonLabel="Save"
          onClick={handleSave}
          buttonProps={{
            loading: isSaving,
          }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Item:</Typography>
            <Typography variant="h5">
              {productLoss?.inventoryItem?.name}
            </Typography>
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Quantity:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={updatedProductLoss.quantityLost}
              onChange={(e) =>
                setUpdatedProductLoss({
                  ...updatedProductLoss,
                  quantityLost: +e.target.value,
                })
              }
            />
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Total Cost:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={updatedProductLoss.totalCost}
              onChange={(e) =>
                setUpdatedProductLoss({
                  ...updatedProductLoss,
                  totalCost: +e.target.value,
                })
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Loss Type:</Typography>
            <Select
              fullWidth
              variant="outlined"
              size="small"
              value={updatedProductLoss.lossType}
              onChange={(e) =>
                setUpdatedProductLoss({
                  ...updatedProductLoss,
                  lossType: e.target.value,
                })
              }
            >
              <MenuItem disabled value={'-- Choose Loss Type --'}>
                -- Choose Loss Type --
              </MenuItem>
              {Object.values(LOSS_REPORT_TYPE).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Reported By:</Typography>
            {renderEmployeeSearch()}
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Reported Date:</Typography>
            {SelectDate}
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Description:</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Product is damaged, expired, etc."
              size="small"
              value={updatedProductLoss.description}
              onChange={(e) =>
                setUpdatedProductLoss({
                  ...updatedProductLoss,
                  description: e.target.value,
                })
              }
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <LoadingButton
          variant="outlined"
          color="error"
          loading={isDeleting}
          onClick={handleDelete}
          sx={{ mt: 3 }}
          fullWidth
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Trash2Icon size={16} />
            <Typography variant="body2" fontWeight="semibold">
              Delete Product Loss
            </Typography>
          </Box>
        </LoadingButton>
      </BoxModal>
    </Modal>
  );
}
