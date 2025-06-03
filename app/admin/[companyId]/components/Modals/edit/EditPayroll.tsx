import ModalHead from '@/app/lib/ModalHead';
import { IPayroll } from '@/app/utils/type';
import {
  Modal,
  Box,
  Typography,
  Divider,
  Grid,
  OutlinedInput,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import useEmployee from '@/hooks/select/useEmployee';
import { generateMonthRange, YYYYMMDDFormat } from '@/app/utils/time';
import { LoadingButton } from '@mui/lab';
import { Trash2Icon } from 'lucide-react';
import DateRange from '../DateRangeModal';
import { ShowNotificationType } from '@/hooks/useNotification';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface IProps extends ModalProps {
  payroll: IPayroll;
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
}

export default function EditPayroll({
  open,
  onClose,
  payroll,
  showNotification,
  refresh,
}: IProps) {
  const { companyId }: any = useParams();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [payrollDateRange, setPayrollDateRange] =
    useState<any>(generateMonthRange());
  const [updatedPayroll, setUpdatedPayroll] = useState<IPayroll>(payroll);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isOpenDateRange, setIsOpenDateRange] = useState<boolean>(false);
  const { renderEmployeeSearch, selectedEmployeeData } = useEmployee(
    payroll.employee.name,
  );

  useEffect(() => {
    if (payroll) {
      setPayrollDateRange([
        new Date(payroll.startDate),
        new Date(payroll.endDate),
      ]);
      setUpdatedPayroll(payroll);
    }
  }, [payroll]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
        const response = await axios.delete(getAdminApiUrl(companyId, '/payroll', `id=${payroll.id}`));

        if (response.data.error) {
            showNotification('error', response.data.message);
            return;
        }

        await refresh();
        showNotification('success', 'Payroll deleted successfully');
        onClose();
    } catch (error: any){
        console.log('There was an error: ', error);
        showNotification('error', 'There was an error: ' + error);
    }
    finally {
        setIsDeleting(false);
    }
  }

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/payroll'), {
        id: payroll.id,
        employeeId: selectedEmployeeData?.id || payroll.employee.id,
        hours: updatedPayroll.hours,
        total: updatedPayroll.total,
        yyyymmddStartDate: YYYYMMDDFormat(payrollDateRange[0]),
        yyyymmddEndDate: YYYYMMDDFormat(payrollDateRange[1]),
      });

      if (response.data.error) {
        showNotification('error', response.data.message);
        return;
      }

      await refresh();
      showNotification('success', 'Payroll updated successfully');
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DateRange
        open={isOpenDateRange}
        onClose={() => setIsOpenDateRange(false)}
        dateRange={payrollDateRange}
        setDateRange={setPayrollDateRange}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal>
          <ModalHead
            heading="Edit Payroll"
            buttonLabel="Save"
            onClick={handleSave}
            buttonProps={{ loading: isUpdating }}
            onClose={onClose}
          />

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1} sx={{ width: '100%' }}>
            <Grid item xs={12}>
              <Typography>Employee</Typography>
              {renderEmployeeSearch()}
            </Grid>
            <Grid item xs={6}>
              <Typography>Hours</Typography>
              <OutlinedInput
                value={updatedPayroll.hours}
                onChange={(e) => {
                  setUpdatedPayroll({
                    ...updatedPayroll,
                    hours: +e.target.value,
                  });
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>Total</Typography>
              <OutlinedInput
                value={updatedPayroll.total}
                onChange={(e) => {
                  setUpdatedPayroll({
                    ...updatedPayroll,
                    total: +e.target.value,
                  });
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Typography>Start Date</Typography>
              <OutlinedInput
                value={payrollDateRange[0].toDateString()}
                readOnly
                fullWidth
                onClick={() => setIsOpenDateRange(true)}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>End Date</Typography>
              <OutlinedInput
                value={payrollDateRange[1].toDateString()}
                readOnly
                fullWidth
                onClick={() => setIsOpenDateRange(true)}
              />
            </Grid>
          </Grid>

          <LoadingButton
            fullWidth
            variant="outlined"
            color="error"
            sx={{ mt: 2 }}
            onClick={handleDelete}
            loading={isDeleting}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Trash2Icon />
              <Typography>Delete</Typography>
            </Box>
          </LoadingButton>
        </BoxModal>
      </Modal>
    </>
  );
}
