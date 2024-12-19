import { AlertColor, Divider, Modal } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import StockPurchased from '../../Expense/StockPurchased';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
// import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddStockPurchased({
  open,
  onClose,
  showNotification,
}: IProps) {
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);

  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);
  const [adminsAndDriversRes] = SWRFetchData(
    `${API_URL.ADMIN}/adminsAndDrivers`,
  );

  useEffect(() => {
    if (adminsAndDriversRes) {
      setAdminsAndDrivers(adminsAndDriversRes?.data);
    }
  }, [adminsAndDriversRes]);
  // useEffect(() => {
  //   const fetchAdminsAndDrivers = async () => {
  //     const users: any = await getAdminsAndDrivers(showNotification);
  //     setAdminsAndDrivers(users);
  //   };

  //   fetchAdminsAndDrivers();
  // }, []);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight={'80vh'} overflow={'scroll'}>
        <ModalHead
          heading="Add Stock Purchased"
          buttonLabel="ADD"
          onClick={() => {}}
          onlyHeading
          onClose={onClose}
          buttonProps={{}}
        />

        <Divider sx={{ my: 2 }} />

        <StockPurchased
          showNotification={showNotification}
          paymentMethods={paymentMethods?.data || []}
          adminsAndDrivers={adminsAndDrivers}
          role={USER_ROLE.ADMIN}
        />
      </BoxModal>
    </Modal>
  );
}
