 import React, { useState } from 'react';
import { BoxModal } from '../styled';
import { AlertColor, Box, Divider, Modal, Tab, Tabs } from '@mui/material';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import CustomAmount from '../../CustomAmount/CustomAmount';
import CustomLinkInventory from '../../CustomAmount/CustomLinkInventory';

interface IProps extends ModalProps {
  setItemList?: any;
  onUpdateUI?: (customAmount: any) => void;
  // addCustomAmount?: (customAmount: ICustomAmount) => Promise<void>;
  orderId?: number;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddCustomAmount({
  open,
  onClose,
  setItemList,
  // addCustomAmount,
  showNotification,
  onUpdateUI,
  orderId,
}: IProps) {
  const [tabIdx, setTabIdx] = useState<number>(0);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [customAmount, setCustomAmount] = useState<{
  //   price: number;
  //   name: string;
  //   quantity: number;
  // }>({
  //   name: '',
  //   price: 0,
  //   quantity: 1,
  // });

  // const onAddCustomAmount = async () => {
  //   if (customAmount.price <= 0 || !customAmount.name) {
  //     showNotification('error', 'Please fill all the fields');
  //     return;
  //   }

  //   if (addCustomAmount) {
  //     setIsLoading(true);
  //     await addCustomAmount(customAmount);
  //     setIsLoading(false);
  //     onClose();
  //     return;
  //   }

  //   if (setItemList) {
  //     setItemList((prevState: any) => [
  //       {
  //         id: 0,
  //         name: customAmount.name,
  //         quantity: customAmount.quantity,
  //         price: customAmount.price,
  //         totalPrice: customAmount.price,
  //         availability: true,
  //       },
  //       ...prevState,
  //     ]);
  //     onClose();
  //     return;
  //   }
  // };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Add Custom Amount"
          buttonLabel="ADD"
          onClick={() => {}}
          onlyHeading
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            variant="fullWidth"
            value={tabIdx}
            onChange={(e, value) => setTabIdx(value)}
          >
            <Tab label="Link Inventory" value={0} />
            <Tab label="Custom Amount" value={1} />
          </Tabs>
        </Box>

        {tabIdx === 0 ? (
          <CustomLinkInventory
            showNotification={showNotification}
            onClose={onClose}
            orderId={orderId}
            setItemList={setItemList}
            onUpdateUI={onUpdateUI}
          />
        ) : (
          <CustomAmount
            showNotification={showNotification}
            onClose={onClose}
            // onAddCustomAmount={addCustomAmount}
            setItemList={setItemList}
            orderId={orderId}
            onUpdateUI={onUpdateUI}
          />
        )}
      </BoxModal>
    </Modal>
  );
}
