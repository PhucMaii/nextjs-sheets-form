import {
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
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import { ShowNotificationType } from '@/hooks/useNotification';
import useInventoryItems from '@/hooks/autocomplete/useInventoryItems';
import { IProductLoss } from '@/app/utils/type';
import { YYYYMMDDFormat } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import { API_URL, LOSS_REPORT_TYPE } from '@/app/utils/enum';
import UnitRadio from '../../Radio/UnitRadio';
import useEmployee from '@/hooks/select/useEmployee';
import FileUpload from '../../FileUpload';
import DisplayFile from '../DisplayFile';
import axios from 'axios';

interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
}

export default function AddProductLoss({
  open,
  onClose,
  showNotification,
  refresh,
}: IProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [productLoss, setProductLoss] = useState<IProductLoss | any>({
    quantityLost: 0,
    lossType: '-- Choose Loss Type --',
    description: null,
    totalCost: 0,
  });

  const { selectedInventoryItem, renderInventoryItemSearch } =
    useInventoryItems();
  const { selectedEmployee, renderEmployeeSearch } = useEmployee();

  const today = YYYYMMDDFormat(new Date());
  const { date, SelectDate } = useSelectDate(today, true, true);

  useEffect(() => {
    if (selectedInventoryItem) {
      setProductLoss({
        ...productLoss,
        inventoryUnitId: selectedInventoryItem.unit.id,
        inventoryUnit: selectedInventoryItem.unit,
      });
    }
  }, [selectedInventoryItem]);

  useEffect(() => {
    if (productLoss.quantityLost && productLoss.inventoryUnit) {
      setProductLoss({
        ...productLoss,
        totalCost: productLoss.quantityLost * productLoss.inventoryUnit.unitPrice,
      });
    }
  }, [productLoss.quantityLost, productLoss.inventoryUnit]);

  const handleReportLoss = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_URL.ADMIN}/product-loss`,
        {
          productLoss: {
            ...productLoss,
            inventoryItemId: selectedInventoryItem.id,
            reportedDate: date,
            reportedBy: selectedEmployee,
          },
          fileKeys: [productLoss.fileKey],
        }
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', 'Product loss reported successfully');
      await refresh();
      onClose();
    } catch (error: any) {
      console.log('Something went wrong: ', error);
      showNotification('error', error?.response?.data?.error || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Report Loss"
          buttonLabel="Report"
          onClick={handleReportLoss}
          buttonProps={{ loading: isSubmitting }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2} alignItems="center">
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Item</Typography>
            {renderInventoryItemSearch()}
          </Grid>

          {selectedInventoryItem && (
            <Grid item xs={12}>
              <Typography>Choose a unit</Typography>
              <UnitRadio
                units={selectedInventoryItem?.units}
                value={productLoss.inventoryUnit}
                onChange={(e: any) =>
                  setProductLoss({
                    ...productLoss,
                    inventoryUnitId: JSON.parse(e.target.value).id,
                    inventoryUnit: JSON.parse(e.target.value),
                  })
                }
                isShowPrice
              />
            </Grid>
          )}
          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Quantity</Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={productLoss.quantityLost}
              onChange={(e) =>
                setProductLoss({ ...productLoss, quantityLost: +e.target.value })
              }
            />
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Total Cost</Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="number"
              value={productLoss.totalCost}
              onChange={(e) =>
                setProductLoss({ ...productLoss, totalCost: e.target.value })
              }
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Loss Type</Typography>
            <Select
              fullWidth
              variant="outlined"
              size="small"
              value={productLoss.lossType}
              onChange={(e) =>
                setProductLoss({ ...productLoss, lossType: e.target.value })
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
            <Typography>Reported By</Typography>
            {renderEmployeeSearch()}
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Reported Date</Typography>
            {SelectDate}
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Description</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Product is damaged, expired, etc."
              size="small"
              value={productLoss.description}
              onChange={(e) =>
                setProductLoss({
                  ...productLoss,
                  description: e.target.value,
                })
              }
              multiline
              rows={3}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Evidence Images</Typography>
            {productLoss.fileKey ? (
              <DisplayFile fileKey={productLoss.fileKey} alt="product loss" />
            ) : (
              <FileUpload
                showNotification={showNotification}
                fileName={productLoss.fileName}
                onUploadImageUI={(fileKey: string) => {
                  setProductLoss({
                    ...productLoss,
                    fileKey: fileKey,
                  });
                }}
                uploadLocation={`/product-loss/${productLoss.inventoryItemId}`}
              />
            )}
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
