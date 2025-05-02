import { SWRFetchData } from '@/app/utils/db';
import { API_URL, TRANSACTION_STATUS, USER_ROLE } from '@/app/utils/enum';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import {
  AlertColor,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import React, { useEffect, useMemo, useState } from 'react';
import { errorColor } from '@/theme/color';
import AddVendor from '../Modals/add/AddVendor';
import { gstRate, mainPaymentMethodId, pstRate } from '@/app/lib/constant';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import VendorItemSearch from '../Autocomplete/VendorItemSearch';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import useEditUnit from '@/hooks/unit/useEditUnit';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  paymentMethods: any;
  adminsAndDrivers: string[];
  codBoardId?: number;
  role: USER_ROLE;
  defaultValue?: any;
}

export default function StockPurchased({
  showNotification,
  paymentMethods,
  adminsAndDrivers,
  codBoardId,
  role,
  defaultValue,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, onChangeOpen] = useMultipleBoolean({
    isOpenAddVendor: false,
    isOpenAddUnit: false,
    disabledCloseAddUnit: false,
  });
  const [newExpense, setNewExpense] = useState<any>({
    subTotal: 0,
    GST: 0,
    PST: 0,
    amount: 0,
    discount: 0,
    description: '',
    paymentMethodId: -1,
    spentBy: '-- Choose who spent --',
    invoice: '',
    status: TRANSACTION_STATUS.UNPAID,
    ...(defaultValue ? defaultValue : {}),
  });
  const [vendorItems, setVendorItems] = useState<any[]>([]);
  // const [totalAmount, setTotalAmount] = useState<number>(0);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
    vendorId: -1,
    quantity: 0,
    unitPrice: 0,
    unit: {
      id: -1,
      unitPrice: 0,
      ratio: 1,
    },
    units: [],
  });
  const [selectedVendorId, setSelectedVendorId] = useState<number>(-1);

  const todayString = YYYYMMDDFormat(new Date());
  const { date, SelectDate } = useSelectDate(todayString, true);
  const {
    units,
    selectedUnit,
    AddUnitModal,
    EditUnitModal,
    UnitDisplay,
    onChangeAddUnitBoolean,
    setSelectedUnit,
    setUnits,
  } = useEditUnit(
    promptedItem.units,
    promptedItem.unit,
    showNotification,
    false,
    role,
  );

  // console.log(promptedItem?.units, 'promptedItem?.units');

  // const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);
  const [vendors] = SWRFetchData(
    role === USER_ROLE.ADMIN
      ? `${API_URL.ADMIN}/vendors`
      : `${API_URL.DRIVER}/vendors`,
  );

  const sortedVendors = useMemo(() => {
    if (!vendors?.data) {
      return [];
    }

    const vendorsSorted = [...vendors.data].sort((a: any, b: any) => {
      return a?.name?.localeCompare(b?.name);
    });

    return vendorsSorted;
  }, [vendors]);

  useEffect(() => {
    setNewExpense((prevState: any) => ({
      ...prevState,
      amount:
        prevState.subTotal + prevState.GST + prevState.PST - prevState.discount,
    }));
  }, [newExpense.discount]);

  useEffect(() => {
    if (purchasedItems.length > 0) {
      calculateNewAmount();
      // generateDescription();
    } else {
      setNewExpense({
        ...newExpense,
        amount: 0,
        subTotal: 0,
        GST: 0,
        PST: 0,
        discount: 0,
        description: '',
      });
      // setTotalAmount(0);
    }
  }, [purchasedItems]);

  useEffect(() => {
    if (selectedVendorId !== -1) {
      setPromptedItem({ ...promptedItem, vendorId: selectedVendorId });

      if (vendors) {
        const targetVendor = vendors?.data.find((vendor: any) => {
          return vendor.id === selectedVendorId;
        });

        if (targetVendor) {
          setVendorItems(targetVendor?.vendorItem);
        }
      }
    }
  }, [selectedVendorId]);

  // useEffect(() => {
  //   setPromptedItem((prevState: any) => ({
  //     ...prevState,
  //     unit: units[0],
  //     units: units,
  //   }));
  // }, [units]);

  // useEffect(() => {
  //   if (selectedUnit) {
  //     setPromptedItem((prevState: any) => ({
  //       ...prevState,
  //       unit: selectedUnit,
  //     }));
  //   }
  // }, [selectedUnit]);

  const onChangeUnitPrice = (e: any) => {
    const newUnitPrice = +e.target.value;

    // Update units immutably
    const newUnits = units?.map(
      (unit: any) =>
        unit.ratio === selectedUnit?.ratio
          ? { ...unit, unitPrice: newUnitPrice } // Replace the matching unit
          : unit, // Keep the other units unchanged
    );

    // Update state
    // setPromptedItem({
    //   ...promptedItem,
    //   unit: { ...selectedUnit, unitPrice: newUnitPrice },
    //   units: newUnits,
    // });
    setSelectedUnit((prevState: any) => ({
      ...prevState,
      unitPrice: newUnitPrice,
    }));
    setUnits(newUnits);
  };

  const selectPromptedItem = (newValue: any) => {
    // New Item Add
    if (newValue?.inputValue) {
      setPromptedItem({
        ...promptedItem,
        id: 0,
        unitPrice: 0,
        unit: { unit: 'bags', ratio: 1, unitPrice: 0 },
        units: [],
        name: newValue.inputValue,
        vendorId: selectedVendorId,
        quantity: 0,
      });

      onChangeAddUnitBoolean('open', true);
      onChangeAddUnitBoolean('disabledClose', true);
    } else {
      // Existing Item Add
      setPromptedItem({
        ...promptedItem,
        id: newValue?.id || 0,
        name: newValue?.inventoryItem?.name,
        vendorId: selectedVendorId,
        inventoryItemId: newValue?.inventoryItemId,
        unit: newValue?.unit[0],
        units: newValue?.unit || [],
        quantity: 0,
        inventoryItem: newValue?.inventoryItem,
      });
    }
  };

  const addPromptedItem = () => {
    if (promptedItem.id === -1) {
      showNotification('error', 'Please select item');
      return;
    }

    if (!promptedItem?.unit) {
      showNotification('error', 'Please select inventory unit');
      return;
    }

    if (role === USER_ROLE.DRIVER) {
      const existingItemInVendor = vendorItems.find((item: any) => {
        return item.inventoryItem.name === promptedItem.name;
      });

      if (!existingItemInVendor) {
        showNotification('error', 'Item not found in vendor');
        return;
      }
    }

    const existingItem = purchasedItems.find((item: any) => {
      return item.name === promptedItem.name;
    });

    if (existingItem) {
      showNotification('error', 'Item already added');
      return;
    }

    if (promptedItem.quantity === 0) {
      showNotification('error', 'Please enter quantity');
      return;
    }

    setPurchasedItems([
      ...purchasedItems,
      {
        ...promptedItem,
        unit: selectedUnit,
        units: units,
      },
    ]);
    setPromptedItem({
      id: -1,
      quantity: 0,
      name: '',
      vendorId: selectedVendorId,
      unit: {
        id: -1,
        unitPrice: 0,
        ratio: 1,
      },
      units: [],
    });
  };

  const calculateNewAmount = () => {
    // const newAmount = purchasedItems.reduce((acc: number, item: any) => {
    //   return acc + item.unit.unitPrice * item.quantity;
    // }, 0);
    const total = purchasedItems.reduce((acc: any, item: any) => {
      if (!acc?.subTotal) {
        acc.subTotal = 0;
      }

      if (!acc?.PST) {
        acc.PST = 0;
      }

      if (!acc?.GST) {
        acc.GST = 0;
      }

      acc.subTotal += item.unit.unitPrice * item.quantity;

      if (item?.inventoryItem?.hasPST) {
        acc.PST += item.unit.unitPrice * item.quantity * pstRate;
      }

      if (item?.inventoryItem?.hasGST) {
        acc.GST += item.unit.unitPrice * item.quantity * gstRate;
      }

      return acc;
    }, {});

    console.log(total, 'total');
    // setTotalAmount(newAmount);
    setNewExpense((prevState: any) => ({
      ...prevState,
      amount:
        parseFloat(total.subTotal.toFixed(2)) +
        parseFloat(total.PST.toFixed(2)) +
        parseFloat(total.GST.toFixed(2)) -
        parseFloat(newExpense.discount.toFixed(2)),
      subTotal: parseFloat(total.subTotal.toFixed(2)),
      GST: parseFloat(total.GST.toFixed(2)),
      PST: parseFloat(total.PST.toFixed(2)),
      discount: parseFloat(newExpense.discount.toFixed(2)),
    }));
  };

  const onChangeItem = (e: any, targetItem: any, keyChange: string) => {
    e.preventDefault();
    const newItemList = purchasedItems.map((item: any) => {
      // If it is a new item
      if (targetItem.id < 1) {
        if (item.name === targetItem.name) {
          if (keyChange === 'quantity') {
            const totalPrice = item.price * +e.target.value;
            return { ...item, quantity: +e.target.value, totalPrice };
          }
          if (keyChange === 'unitPrice') {
            const totalPrice = item.quantity * +e.target.value;

            const newUnits = item.units.map((unit: any) => {
              if (unit.ratio === item.unit.ratio) {
                return { ...unit, unitPrice: +e.target.value };
              }

              return unit;
            });

            return {
              ...item,
              unit: { ...item.unit, unitPrice: +e.target.value },
              totalPrice,
              units: newUnits,
            };
          }

          if (keyChange === 'unit') {
            return { ...item, unit: { ...item.unit, unit: e.target.value } };
          }
          return item;
        }
      } else if (item.id === targetItem.id) {
        if (keyChange === 'quantity') {
          const totalPrice = item.price * +e.target.value;
          return { ...item, quantity: +e.target.value, totalPrice };
        }
        if (keyChange === 'unitPrice') {
          const totalPrice = item.quantity * +e.target.value;

          const newUnits = item.units.map((unit: any) => {
            if (unit.ratio === item.unit.ratio) {
              return { ...unit, unitPrice: +e.target.value };
            }

            return unit;
          });

          return {
            ...item,
            unit: { ...item.unit, unitPrice: +e.target.value },
            totalPrice,
            units: newUnits,
          };
        }

        if (keyChange === 'unit') {
          return { ...item, unit: { ...item.unit, unit: e.target.value } };
        }
        return item;
      }

      return item;
    });

    setPurchasedItems(newItemList);
  };

  const handleSubmit = async () => {
    if (purchasedItems.length === 0) {
      showNotification('error', 'Please add items');
      return;
    }

    if (newExpense.amount === 0) {
      showNotification('error', 'Please enter amount');
      return;
    }

    if (
      newExpense.spentBy === '-- Choose who spent --' &&
      role === USER_ROLE.ADMIN
    ) {
      showNotification('error', 'Please select who spent');
      return;
    }

    if (newExpense.paymentMethodId === -1) {
      showNotification('error', 'Please add payment method');
      return;
    }

    setIsLoading(true);
    try {
      const createdAt = generateCurrentTime();

      const response = await axios.post(
        `${role === USER_ROLE.ADMIN ? API_URL.ADMIN : API_URL.DRIVER}/inventory/expenses`,
        {
          date,
          amount: newExpense.amount,
          PST: newExpense.PST,
          GST: newExpense.GST,
          subTotal: newExpense.subTotal,
          description: newExpense.description,
          paymentMethodId: newExpense.paymentMethodId,
          spentBy: newExpense.spentBy,
          invoice: newExpense.invoice,
          status: newExpense.status,
          createdAt,
          codBoardId: codBoardId,
          items: purchasedItems,
          discount: newExpense.discount,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setPurchasedItems([]);
      // setTotalAmount(0);
      setNewExpense({
        ...newExpense,
        amount: 0,
        subTotal: 0,
        GST: 0,
        PST: 0,
        description: '',
        paymentMethodId: role === USER_ROLE.ADMIN ? -1 : mainPaymentMethodId,
        spentBy: '-- Choose who spent --',
        invoice: '',
        status: TRANSACTION_STATUS.UNPAID,
        ...(defaultValue ? defaultValue : {}),
      });
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Fail to add expense: ' + error.response.data.error,
      );

      setIsLoading(false);
    }
  };

  const removeItem = (name: string) => {
    const newItemList = purchasedItems.filter((item: any) => {
      return item.name !== name;
    });

    setPurchasedItems(newItemList);
  };

  return (
    <>
      {role === USER_ROLE.ADMIN && (
        <>
          <AddVendor
            showNotification={showNotification}
            open={open.isOpenAddVendor}
            onClose={() => onChangeOpen('isOpenAddVendor', false)}
          />
          {AddUnitModal}
          {EditUnitModal}
        </>
      )}
      <Box display="flex" flexDirection="column" gap={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="vendor">Vendor</InputLabel>
              <Select
                id="vendor"
                label="Vendor"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value as number)}
                fullWidth
                disabled={
                  purchasedItems.length > 0 &&
                  purchasedItems[0].vendorId === selectedVendorId
                }
                size="small"
              >
                <MenuItem value={-1} disabled>
                  -- Choose a vendor --
                </MenuItem>
                {role === USER_ROLE.ADMIN && (
                  <MenuItem
                    onClick={() => onChangeOpen('isOpenAddVendor', true)}
                  >
                    + Create new vendor
                  </MenuItem>
                )}
                {sortedVendors.length > 0 &&
                  sortedVendors.map((vendor: any, index: number) => (
                    <MenuItem key={index} value={vendor.id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <VendorItemSearch
              promptedItem={promptedItem}
              handleSelectPromptedItem={selectPromptedItem}
              role={role}
              displayItems={vendorItems}
              disabled={selectedVendorId === -1}
            />
          </Grid>
          {units && units.length > 0 && (
            <Grid item xs={12}>
              {UnitDisplay}
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Unit Price"
              type="number"
              value={selectedUnit?.unitPrice || 0}
              onChange={onChangeUnitPrice}
              disabled={
                role === USER_ROLE.DRIVER ||
                selectedVendorId === -1 ||
                !promptedItem.name
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={promptedItem.quantity}
              onChange={(e: any) =>
                setPromptedItem({ ...promptedItem, quantity: +e.target.value })
              }
              disabled={selectedVendorId === -1 || !promptedItem.name}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" fullWidth onClick={addPromptedItem}>
              Add
            </Button>
          </Grid>
        </Grid>

        {purchasedItems.length > 0 &&
          purchasedItems.map((item: any, index) => {
            return (
              <Grid container spacing={2} key={index}>
                <Grid item xs={12} fontWeight="bold">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {item?.sku ? `${item?.sku} | ${item?.name}` : item?.name}
                    </Typography>
                    <IconButton onClick={() => removeItem(item.name)}>
                      <RemoveCircleIcon sx={{ color: errorColor }} />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item container columnSpacing={2}>
                  <Grid item xs={6} textAlign="right">
                    <TextField
                      label="Unit Price ($)"
                      value={item?.unit?.unitPrice}
                      onChange={(e) => onChangeItem(e, item, 'unitPrice')}
                      type="number"
                      inputProps={{ min: 0 }}
                      disabled={role === USER_ROLE.DRIVER}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => onChangeItem(e, item, 'quantity')}
                      type="number"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            );
          })}

        <Divider sx={{ my: 2 }}>Bill</Divider>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Discount</Typography>
              <TextField
                fullWidth
                type="number"
                value={newExpense.discount}
                onChange={(e) =>
                  setNewExpense((prevState: any) => ({
                    ...prevState,
                    discount: +e.target.value,
                  }))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Subtotal</Typography>
              <TextField
                disabled
                placeholder="Enter epxense subtotal..."
                fullWidth
                type="number"
                value={newExpense.subTotal}
                onChange={(e) =>
                  setNewExpense((prevState: any) => ({
                    ...prevState,
                    subTotal: +e.target.value,
                  }))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">GST (5%)</Typography>
              <TextField
                disabled
                placeholder="Enter epxense GST..."
                fullWidth
                type="number"
                value={newExpense.GST}
                onChange={(e) =>
                  setNewExpense((prevState: any) => ({
                    ...prevState,
                    GST: +e.target.value,
                  }))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">PST (7%)</Typography>
              <TextField
                disabled
                placeholder="Enter epxense PST..."
                fullWidth
                type="number"
                value={newExpense.PST}
                onChange={(e) =>
                  setNewExpense((prevState: any) => ({
                    ...prevState,
                    PST: +e.target.value,
                  }))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Amount</Typography>
              <TextField
                disabled
                placeholder="Enter epxense amount..."
                fullWidth
                type="number"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense((prevState: any) => ({
                    ...prevState,
                    amount: +e.target.value,
                  }))
                }
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }}>Expense Information</Divider>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Date</Typography>
          {SelectDate}
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Invoice Number</Typography>
          <TextField
            placeholder="Enter invoice number..."
            fullWidth
            value={newExpense.invoice}
            onChange={(e) =>
              setNewExpense({ ...newExpense, invoice: e.target.value })
            }
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Description</Typography>
          <TextField
            multiline
            placeholder="Enter description..."
            fullWidth
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Payment Method</Typography>
          <Select
            fullWidth
            value={newExpense.paymentMethodId}
            onChange={(e) => {
              if (+e.target.value === mainPaymentMethodId) {
                setNewExpense({
                  ...newExpense,
                  paymentMethodId: +e.target.value,
                  status: TRANSACTION_STATUS.PAID,
                });
              } else {
                setNewExpense({
                  ...newExpense,
                  paymentMethodId: +e.target.value,
                });
              }
            }}
            size="small"
          >
            <MenuItem value={-1} disabled>
              -- Choose a method --
            </MenuItem>
            {paymentMethods.length > 0 &&
              paymentMethods.map((item: any) => {
                return (
                  <MenuItem
                    value={item.id}
                    disabled={
                      role !== USER_ROLE.ADMIN &&
                      role !== USER_ROLE.SUPER_ADMIN &&
                      item.id === mainPaymentMethodId
                    }
                  >
                    {item.name}
                  </MenuItem>
                );
              })}
          </Select>
        </Box>

        {role === USER_ROLE.ADMIN && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">Driver</Typography>
            </Box>
            <Select
              fullWidth
              value={newExpense.spentBy}
              onChange={(e) =>
                setNewExpense({ ...newExpense, spentBy: e.target.value })
              }
              size="small"
            >
              <MenuItem value={'-- Choose who spent --'} disabled>
                -- Choose who spent --
              </MenuItem>
              {adminsAndDrivers.length > 0 &&
                adminsAndDrivers.map((person: string) => {
                  return <MenuItem value={person}>{person}</MenuItem>;
                })}
            </Select>
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6">Status</Typography>
          <SelectExpenseStatus
            value={newExpense.status}
            onChange={(e: any) =>
              setNewExpense({ ...newExpense, status: e.target.value })
            }
          />
        </Box>

        <LoadingButton
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          loading={isLoading}
        >
          Submit
        </LoadingButton>
      </Box>
    </>
  );
}
