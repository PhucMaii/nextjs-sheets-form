import { AlertColor, Box, Divider, TextField, Typography } from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import InventoryItemSearch from '../Autocomplete/InventoryItemSearch';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { ICustomAmount } from '@/app/utils/type';
import useEditUnit from '@/hooks/unit/useEditUnit';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  onClose: () => void;
  orderId?: number;
  onUpdateUI?: any;
  setItemList?: any;
}

const CustomLinkInventory = ({
  showNotification,
  onClose,
  orderId,
  setItemList,
  onUpdateUI,
}: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
  });
  const [customAmount, setCustomAmount] = useState<ICustomAmount>({
    name: '',
    price: 0,
    quantity: 1,
    units: [],
    inventoryUnit: null,
    isCustomAmount: true,
  });

  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  const { units, selectedUnit, AddUnitModal, EditUnitModal, UnitDisplay } =
    useEditUnit(
      customAmount.units,
      customAmount.inventoryUnit,
      showNotification,
      false,
    );

  useEffect(() => {
    if (promptedItem.id !== -1) {
      let units =
        promptedItem?.vendorItem?.flatMap((item: any) => item.unit) || [];

      units = Array.from(
        new Map(units?.map((unit: any) => [unit.ratio, unit])).values(),
      );

      setCustomAmount((prevState: ICustomAmount) => ({
        ...prevState,
        name: promptedItem.name,
        quantity: 1,
        units,
        inventoryItem: promptedItem,
        inventoryItemId: promptedItem?.id,
      }));
    }
  }, [promptedItem.id]);

  useEffect(() => {
    if (selectedUnit) {
      setCustomAmount((prevState: ICustomAmount) => ({
        ...prevState,
        price: selectedUnit.unitPrice,
        inventoryUnit: selectedUnit,
        inventoryUnitId: selectedUnit?.id,
      }));
    }
  }, [selectedUnit]);

  // useEffect(() => {
  //     setCustomAmount((prevState: any) => ({
  //       ...prevState,
  //       inventoryUnit: selectedUnit,
  //       inventoryUnitId: selectedUnit?.id,
  //     }))
  // }, [selectedUnit]);

  console.log(customAmount, 'custom amount');

  const onAddCustomAmountDB = async () => {
    if (!orderId) {
      showNotification('error', 'Please select an order');
      return;
    }

    if (!customAmount.inventoryItem || !customAmount.inventoryItemId) {
      showNotification('error', 'Please select an inventory item');
      return;
    }

    if (!customAmount.inventoryUnit) {
      showNotification('error', 'Please select an inventory unit');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL.ADMIN}/custom-amount/link-inventory`,
        {
          orderId,
          customAmount: {
            ...customAmount,
            inventoryUnit: {
              ...selectedUnit,
              vendorItemId: units[0].vendorItemId,
            },
            units,
          },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      if (onUpdateUI) {
        onUpdateUI(response.data.data);
      }

      //   setItems((prevState: any) => {
      //     return [...prevState, response.data.data];
      //   });
      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
      setIsLoading(false);
    }
  };

  const addCustomAmount = async () => {
    try {
      if (setItemList) {
        setItemList((prevState: any) => [
          {
            ...customAmount,
            id: 0,
            availability: true,
            totalPrice: customAmount.price,
            inventoryUnit: {
              ...selectedUnit,
              vendorItemId: units[0].vendorItemId,
            },
            units,
          },
          ...prevState,
        ]);
        onClose();
        return;
      }

      await onAddCustomAmountDB();
      onClose();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2}>
        {AddUnitModal}
        {EditUnitModal}
        <Divider sx={{ my: 1 }}>Link inventory</Divider>
        <Typography>Inventory item</Typography>
        <InventoryItemSearch
          promptedItem={promptedItem}
          setPromptedItem={setPromptedItem}
          displayItems={inventoryItems?.data || []}
        />

        <Typography>Unit</Typography>
        {UnitDisplay}

        <Divider sx={{ my: 1 }}>Custom amount</Divider>

        <Typography>Name</Typography>
        <TextField
          label="Name"
          value={customAmount.name}
          onChange={(e) =>
            setCustomAmount({ ...customAmount, name: e.target.value })
          }
          placeholder="Enter name..."
        />

        <Typography>Price</Typography>
        <TextField
          label="Price"
          type="number"
          value={customAmount.price}
          onChange={(e) =>
            setCustomAmount({ ...customAmount, price: +e.target.value })
          }
          placeholder="Enter price..."
        />

        <Typography>Quantity</Typography>
        <TextField
          label="Quantity"
          type="number"
          value={customAmount.quantity}
          onChange={(e) =>
            setCustomAmount({ ...customAmount, quantity: +e.target.value })
          }
          placeholder="Enter quantity..."
        />

        <LoadingButton
          onClick={addCustomAmount}
          loading={isLoading}
          variant="contained"
        >
          Add Custom Amount
        </LoadingButton>
      </Box>
    </>
  );
};

export default memo(CustomLinkInventory, (prev, next) => {
  return (
    JSON.stringify(prev.showNotification) ===
    JSON.stringify(next.showNotification)
  );
});
