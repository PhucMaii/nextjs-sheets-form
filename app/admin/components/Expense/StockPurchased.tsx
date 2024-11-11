import { SWRFetchData } from '@/app/utils/db';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import {
  AlertColor,
  Autocomplete,
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
import { createFilterOptions } from '@mui/material/Autocomplete';
import AddVendor from '../Modals/add/AddVendor';
import { mainPaymentMethodId, units } from '@/app/lib/constant';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  paymentMethods: any;
  adminsAndDrivers: string[];
  codBoardId?: number;
  role: USER_ROLE;
  defaultValue?: any;
}

const filter = createFilterOptions<any>();

export default function StockPurchased({
  showNotification,
  paymentMethods,
  adminsAndDrivers,
  codBoardId,
  role,
  defaultValue,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenAddVendor, setIsOpenAddVendor] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState<any>({
    amount: 0,
    description: '',
    paymentMethodId: -1,
    spentBy: '-- Choose who spent --',
    invoice: '',
    ...(defaultValue ? defaultValue : {}),
  });
  const [vendorItems, setVendorItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
    vendorId: -1,
    quantity: 0,
    unitPrice: 0,
    unit: 'bags',
  });
  const [selectedVendorId, setSelectedVendorId] = useState<number>(-1);

  const todayString = YYYYMMDDFormat(new Date());
  const { date, SelectDate } = useSelectDate(todayString, true);

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
    if (purchasedItems.length > 0) {
      calculateNewAmount();
      // generateDescription();
    } else {
      setNewExpense({ ...newExpense, amount: 0, description: '' });
      setTotalAmount(0);
    }
  }, [purchasedItems]);

  useEffect(() => {
    if (selectedVendorId !== -1) {
      setPromptedItem({ ...promptedItem, vendorId: selectedVendorId });
      // setVendorItems(() => {

      // })

      if (vendors) {
        const targetVendor = vendors?.data.find((vendor: any) => {
          return vendor.id === selectedVendorId;
        });

        if (targetVendor) {
          setVendorItems(targetVendor?.inventoryItems);
        }
      }
    }
  }, [selectedVendorId]);

  const selectPromptedItem = (newValue: any) => {
    if (newValue?.inputValue) {
      setPromptedItem({
        ...promptedItem,
        id: 0,
        unitPrice: 0,
        unit: 'bags',
        name: newValue.inputValue,
        vendorId: selectedVendorId,
      });
    } else {
      setPromptedItem({
        ...promptedItem,
        id: newValue?.id || 0,
        unitPrice: newValue?.unitPrice || 0,
        name: newValue?.name,
        vendorId: selectedVendorId,
        unit: newValue?.unit || 'bags',
      });
    }
  };

  const addPromptedItem = () => {
    if (promptedItem.id === -1) {
      showNotification('error', 'Please select item');
      return;
    }

    if (role === USER_ROLE.DRIVER) {
      const existingItemInVendor = vendorItems.find((item: any) => {
        return item.name === promptedItem.name;
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

    setPurchasedItems([...purchasedItems, promptedItem]);
    setPromptedItem({
      id: -1,
      quantity: 0,
      unitPrice: 0,
      name: '',
      vendorId: selectedVendorId,
      unit: 'bags',
    });
  };

  const calculateNewAmount = () => {
    const newAmount = purchasedItems.reduce((acc: number, item: any) => {
      return acc + item.unitPrice * item.quantity;
    }, 0);

    setTotalAmount(newAmount);
  };

  // const generateDescription = () => {
  //   const itemNames = purchasedItems
  //     .map((item: any) => {
  //       return `${item.quantity} ${item.unit} ${item.name}`;
  //     })
  //     .join(', ');

  //   setNewExpense({ ...newExpense, description: itemNames });
  // };
  const handleChangeItem = (e: any, targetItem: any, keyChange: string) => {
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
            return { ...item, unitPrice: +e.target.value, totalPrice };
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
          return { ...item, unitPrice: +e.target.value, totalPrice };
        }
        return item;
      }

      return item;
    });

    setPurchasedItems(newItemList);
  };
  // TODO: /api/inventory/expense to add expense for stock purchased
  const handleSubmit = async () => {
    if (purchasedItems.length === 0) {
      showNotification('error', 'Please add items');
      return;
    }

    if (totalAmount === 0) {
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
          amount: totalAmount,
          description: newExpense.description,
          paymentMethodId: newExpense.paymentMethodId,
          spentBy: newExpense.spentBy,
          invoice: newExpense.invoice,
          createdAt,
          codBoardId: codBoardId,
          items: purchasedItems,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setPurchasedItems([]);
      setTotalAmount(0);
      setNewExpense({
        ...newExpense,
        amount: 0,
        description: '',
        paymentMethodId: role === USER_ROLE.ADMIN ? -1 : mainPaymentMethodId,
        spentBy: '-- Choose who spent --',
        invoice: '',
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
        <AddVendor
          showNotification={showNotification}
          open={isOpenAddVendor}
          onClose={() => setIsOpenAddVendor(false)}
        />
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
              >
                <MenuItem value={-1} disabled>
                  -- Choose a vendor --
                </MenuItem>
                {role === USER_ROLE.ADMIN && (
                  <MenuItem onClick={() => setIsOpenAddVendor(true)}>
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
            <Autocomplete
              value={promptedItem.name}
              onChange={(event, newValue) => {
                selectPromptedItem(newValue);
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some(
                  (option) => inputValue === option.name,
                );
                if (
                  role === USER_ROLE.ADMIN &&
                  inputValue !== '' &&
                  !isExisting
                ) {
                  filtered.push({
                    inputValue,
                    title: `Add "${inputValue}"`,
                  });
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="free-solo-with-text-demo"
              options={
                [
                  { id: -1, name: '-- Choose an item --' },
                  ...(vendorItems || []),
                ] || []
              }
              getOptionLabel={(option) => {
                // Check if the option has a custom title (for new item suggestion)
                if (option.title) {
                  return option.title;
                }
                // Regular option
                return option.name || '';
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    {option.title || option.name}
                  </li>
                );
              }}
              sx={{ width: '100%' }}
              freeSolo
              renderInput={(params) => <TextField {...params} label="Item" />}
            />
          </Grid>

          {promptedItem.id === 0 && (
            <>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="vendor">Vendor</InputLabel>
                  <Select
                    id="vendor"
                    label="Vendor"
                    value={selectedVendorId}
                    onChange={(e) =>
                      setSelectedVendorId(e.target.value as number)
                    }
                    fullWidth
                    disabled
                  >
                    <MenuItem value={-1} disabled>
                      -- Choose a vendor --
                    </MenuItem>
                    <MenuItem onClick={() => setIsOpenAddVendor(true)}>
                      + Create new vendor
                    </MenuItem>
                    {sortedVendors.length > 0 &&
                      sortedVendors.map((vendor: any, index: number) => (
                        <MenuItem key={index} value={vendor.id}>
                          {vendor.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel id="unit">Unit</InputLabel>
                  <Select
                    value={promptedItem.unit}
                    onChange={(e) =>
                      setPromptedItem({ ...promptedItem, unit: e.target.value })
                    }
                    fullWidth
                    id="unit"
                    label="Unit"
                  >
                    {units.map((unit, index) => (
                      <MenuItem key={index} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Unit Price"
              type="number"
              value={promptedItem.unitPrice}
              onChange={(e: any) =>
                setPromptedItem({ ...promptedItem, unitPrice: +e.target.value })
              }
              disabled={role === USER_ROLE.DRIVER}
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
              <Grid container spacing={1} key={index}>
                <Grid item xs={12} fontWeight="bold">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <IconButton onClick={() => removeItem(item.name)}>
                      <RemoveCircleIcon sx={{ color: errorColor }} />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item container columnSpacing={2}>
                  <Grid item xs={6} textAlign="right">
                    <TextField
                      fullWidth
                      label="Unit Price ($)"
                      value={item.unitPrice}
                      onChange={(e) => handleChangeItem(e, item, 'unitPrice')}
                      type="number"
                      inputProps={{ min: 0 }}
                      disabled={role === USER_ROLE.DRIVER}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleChangeItem(e, item, 'quantity')}
                      type="number"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            );
          })}

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
          <Typography variant="h6">Amount</Typography>
          <TextField
            placeholder="Enter epxense amount..."
            fullWidth
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(+e.target.value)}
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
            onChange={(e) =>
              setNewExpense({ ...newExpense, paymentMethodId: +e.target.value })
            }
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
            <Typography variant="h6">Driver</Typography>
            <Select
              fullWidth
              value={newExpense.spentBy}
              onChange={(e) =>
                setNewExpense({ ...newExpense, spentBy: e.target.value })
              }
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
