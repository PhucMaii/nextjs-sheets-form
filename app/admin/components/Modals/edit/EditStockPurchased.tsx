import {
  AlertColor,
  Autocomplete,
  Box,
  Button,
  createFilterOptions,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { IExpense } from '@/app/utils/type';
import ModalHead from '@/app/lib/ModalHead';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';
import { units } from '@/app/lib/constant';
import { errorColor } from '@/theme/color';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddVendor from '../add/AddVendor';
import useSelectDate from '@/hooks/useSelectDate';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import axios from 'axios';
import { compareTwoArrays } from '@/app/utils/array';

interface IProps {
  stockPurchased: IExpense;
  showNotification: (type: AlertColor, message: string) => void;
}

const filter = createFilterOptions<any>();

export default function EditStockPurchased({
  stockPurchased,
  showNotification,
}: IProps) {
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenAddVendor, setIsOpenAddVendor] = useState<boolean>(false);
  const [updatedExpense, setUpdatedExpense] = useState<any>(null);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
    vendorId: -1,
    quantity: 0,
    unitPrice: 0,
    unit: 'bags',
  });
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);

  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);
  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);
  const [vendors] = SWRFetchData(`${API_URL.ADMIN}/vendors`);

  const todayString = YYYYMMDDFormat(new Date());
  const { date, SelectDate } = useSelectDate(todayString, true);

  useEffect(() => {
    const fetchAdminsAndDrivers = async () => {
      const users: any = await getAdminsAndDrivers(showNotification);
      setAdminsAndDrivers(users);
    };

    fetchAdminsAndDrivers();
  }, []);

  useEffect(() => {
    if (purchasedItems.length > 0) {
      calculateNewAmount();
    }
  }, [purchasedItems]);

  useEffect(() => {
    if (stockPurchased) {
      setUpdatedExpense(stockPurchased);
    }

    const initializeItems = () => {
      if (!stockPurchased?.orderedItems) {
        setPurchasedItems([]);
        return;
      }

      const newItems = stockPurchased.orderedItems.map((item: any) => {
        const inventoryItem = inventoryItems?.data?.find((i: any) => {
          return i.name === item.name;
        });

        return {
          inventoryItem,
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          unit: inventoryItem?.unit,
          vendorId: item.vendorId,
        };
      });

      setPurchasedItems(newItems);
    };

    initializeItems();
  }, [stockPurchased, inventoryItems]);

  const addPromptedItem = () => {
    if (promptedItem.id === -1) {
      showNotification('error', 'Please select item');
      return;
    }

    const existingItem = purchasedItems.find((item: any) => {
      return item.id === promptedItem.id;
    });

    if (existingItem) {
      showNotification('error', 'Item already added');
      return;
    }

    if (promptedItem.quantity === 0) {
      showNotification('error', 'Please enter quantity');
      return;
    }

    const inventoryItemExisted = inventoryItems?.data?.find((item: any) => {
      return item.id === promptedItem.id;
    });

    setPurchasedItems([
      ...purchasedItems,
      { ...promptedItem, inventoryItem: inventoryItemExisted },
    ]);
    setPromptedItem({
      id: -1,
      quantity: 0,
      unitPrice: 0,
      name: '',
    });
  };

  const calculateNewAmount = () => {
    const newAmount = purchasedItems.reduce((acc: number, item: any) => {
      return acc + item.unitPrice * item.quantity;
    }, 0);

    setUpdatedExpense({ ...updatedExpense, amount: newAmount });
  };

  const handleChangeItem = (e: any, targetItem: any, keyChange: string) => {
    e.preventDefault();
    const newItemList = purchasedItems.map((item: any) => {
      if (item.id === targetItem.id) {
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

  const handleSubmit = async () => {
    if (!stockPurchased?.orderedItems) {
      showNotification('error', 'Please add items');
      return;
    }
    setIsLoading(true);
    try {
      const isUpdatePurchasedItems = compareTwoArrays(
        purchasedItems,
        stockPurchased?.orderedItems,
      );

      console.log({ isUpdatePurchasedItems });

      let oldItemIds: number[] = [];
      if (!isUpdatePurchasedItems) {
        oldItemIds = stockPurchased?.orderedItems.map((item: any) => {
          return item.id;
        });
      }

      const createdAt = generateCurrentTime();
      const response = await axios.put(`${API_URL.ADMIN}/inventory/expenses`, {
        id: updatedExpense.id,
        date,
        amount: updatedExpense.amount,
        description: updatedExpense.description,
        paymentMethodId: updatedExpense.paymentMethodId,
        spentBy: updatedExpense.spentBy,
        oldItemIds,
        updatedItems: !isUpdatePurchasedItems ? purchasedItems : [], // prevent update items if client does not update
        updatedAt: createdAt,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
      setIsLoading(false);
      return;
    }
  };

  const selectPromptedItem = (newValue: any) => {
    if (newValue?.inputValue) {
      setPromptedItem({
        ...promptedItem,
        id: 0,
        unitPrice: 0,
        unit: 'bags',
        name: newValue.inputValue,
      });
    } else {
      setPromptedItem({
        ...promptedItem,
        id: newValue?.id || 0,
        unitPrice: newValue?.unitPrice || 0,
        name: newValue?.name,
        vendorId: newValue?.vendorId || -1,
        unit: newValue?.unit || 'bags',
      });
    }
  };

  const removeItem = (id: number) => {
    const newItemList = purchasedItems.filter((item: any) => {
      return item.id !== id;
    });

    setPurchasedItems(newItemList);
  };

  return (
    <>
      <AddVendor
        showNotification={showNotification}
        open={isOpenAddVendor}
        onClose={() => setIsOpenAddVendor(false)}
      />
      <Button onClick={() => setIsOpen(true)}>Edit</Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <ModalHead
            heading="Edit Stock Purchased"
            buttonLabel="EDIT"
            onClick={handleSubmit}
            buttonProps={{ loading: isLoading }}
            onClose={() => setIsOpen(false)}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={3}>
            <Grid container spacing={3}>
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
                    if (inputValue !== '' && !isExisting) {
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
                      ...(inventoryItems?.data || []),
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
                  renderInput={(params) => (
                    <TextField {...params} label="Item" />
                  )}
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
                        value={promptedItem.vendorId}
                        onChange={(e) =>
                          setPromptedItem({
                            ...promptedItem,
                            vendorId: +e.target.value,
                          })
                        }
                        fullWidth
                      >
                        <MenuItem value={-1} disabled>
                          -- Choose a vendor --
                        </MenuItem>
                        <MenuItem onClick={() => setIsOpenAddVendor(true)}>
                          + Create new vendor
                        </MenuItem>
                        {vendors &&
                          vendors?.data.map((vendor: any, index: number) => (
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
                          setPromptedItem({
                            ...promptedItem,
                            unit: e.target.value,
                          })
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
                    setPromptedItem({
                      ...promptedItem,
                      unitPrice: +e.target.value,
                    })
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
                    setPromptedItem({
                      ...promptedItem,
                      quantity: +e.target.value,
                    })
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
                        <IconButton onClick={() => removeItem(item.id)}>
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
                          onChange={(e) =>
                            handleChangeItem(e, item, 'unitPrice')
                          }
                          type="number"
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) =>
                            handleChangeItem(e, item, 'quantity')
                          }
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
              <Typography variant="h6">Amount</Typography>
              <TextField
                placeholder="Enter epxense amount..."
                fullWidth
                type="number"
                value={updatedExpense?.amount}
                onChange={(e) =>
                  setUpdatedExpense({
                    ...updatedExpense,
                    amount: +e.target.value,
                  })
                }
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Description</Typography>
              <TextField
                multiline
                placeholder="Enter description..."
                fullWidth
                value={updatedExpense?.description}
                onChange={(e) =>
                  setUpdatedExpense({
                    ...updatedExpense,
                    description: e.target.value,
                  })
                }
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Payment Method</Typography>
              <Select
                fullWidth
                value={updatedExpense?.paymentMethodId}
                onChange={(e) =>
                  setUpdatedExpense({
                    ...updatedExpense,
                    paymentMethodId: +e.target.value,
                  })
                }
              >
                <MenuItem value={-1} disabled>
                  -- Choose a method --
                </MenuItem>
                {paymentMethods &&
                  paymentMethods?.data.length > 0 &&
                  paymentMethods?.data.map((item: any) => {
                    return <MenuItem value={item.id}>{item.name}</MenuItem>;
                  })}
              </Select>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Driver</Typography>
              <Select
                fullWidth
                value={updatedExpense?.spentBy}
                onChange={(e) =>
                  setUpdatedExpense({
                    ...updatedExpense,
                    spentBy: e.target.value,
                  })
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

            {/* <LoadingButton variant="contained" onClick={handleSubmit} fullWidth loading={isLoading}>
          Submit
        </LoadingButton> */}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
