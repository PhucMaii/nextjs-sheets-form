import { Divider, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import { IItem } from '@/app/utils/type';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import RelevantPreOrdersTable from '../Tables/RelevantPreOrdersTable';
import { LoadingButton } from '@mui/lab';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps extends ModalProps {
  item: IItem;
  onAcknowledge: any;
  selectedCategoryIds: number[];
}

export default function AddOptionWarning({
  open,
  onClose,
  item,
  onAcknowledge,
  selectedCategoryIds,
}: IProps) {
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [relevantItemPreOrders, setRelevantItemPreOrders] = useState<any>([]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [preOrderItems, mutate, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/scheduledOrders/by-item-name?itemName=${item?.name}&selectedCategoryIds=${selectedCategoryIds.join(',')}`,
  );

  useEffect(() => {
    if (isValidating && !preOrderItems) {
      setIsInitializing(true);
    }

    if (preOrderItems) {
      setRelevantItemPreOrders(preOrderItems?.data);
      setIsInitializing(false);
    }
  }, [preOrderItems]);

  const onSubmit = async () => {
    setIsLoading(true);
    await onAcknowledge();
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Option Warning"
          buttonLabel=""
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
          onlyHeading
        />

        <Divider sx={{ my: 2 }} />

        {isInitializing ? (
          <>
            <LoadingComponent />
          </>
        ) : (
          <>
            <Typography fontWeight="semibold">
              * Please note that {relevantItemPreOrders?.length || 0} pre-order
              items will be changed to <strong>${item?.price}</strong> and will be
              automatically assigned to this option
            </Typography>

            <Typography sx={{ mt: 2 }}>Relevant Pre Orders</Typography>
            <RelevantPreOrdersTable
              relevantItemPreOrders={relevantItemPreOrders}
            />
          </>
        )}

        <LoadingButton
          onClick={() => {
            onSubmit();
          }}
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          loading={isLoading}
          disabled={isInitializing}
        >
          I acknowledge
        </LoadingButton>
      </BoxModal>
    </Modal>
  );
}
