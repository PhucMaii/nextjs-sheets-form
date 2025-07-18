import {
  AlertColor,
  Box,
  Button,
  createFilterOptions,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { BoxModal } from '../styled';
import { IExpense } from '@/app/utils/type';
import ModalHead from '@/app/lib/ModalHead';
import { USER_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { errorColor } from '@/theme/color';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddVendor from '../add/AddVendor';
import useSelectDate from '@/hooks/useSelectDate';
import { generateCurrentTime } from '@/app/utils/time';
import axios from 'axios';
import { compareTwoArrays } from '@/app/utils/array';
import VendorItemSearch from '../../Autocomplete/VendorItemSearch';
import AddIcon from '@mui/icons-material/Add';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import EditUnit from './EditUnit';
import UnitRadio from '../../Radio/UnitRadio';
// import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';
// import { gstRate, pstRate } from '@/app/lib/constant';
import { ModalProps } from '../type';
import { gstRate, pstRate } from '@/app/lib/constant';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  stockPurchased: IExpense;
  showNotification: (type: AlertColor, message: string) => void;
}

export const filter = createFilterOptions<any>();

const EditStockPurchased = ({
  open,
  onClose,
  stockPurchased,
  showNotification,
}: IProps) => {
  const { companyId }: any = useParams();

  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openBooleans, onChangeOpen] = useMultipleBoolean({
    isOpenAddVendor: false,
    isOpenAddUnit: false,
    disabledCloseAddUnit: false,
  });
  const [editUnit, setEditUnit] = useState<any>({
    isOpen: false,
    unit: null,
  });
  // const [affectQuantity, setAffectQuantity] = useState<any>({
  //   checked: false,
  //   disabled: false,
  // });
  const [updatedExpense, setUpdatedExpense] = useState<any>(null);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
    vendorId: -1,
    quantity: 0,
    unitPrice: 0,
    unit: {
      unit: 'bags',
      ratio: 1,
      unitPrice: 0,
    },
  });
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [vendorItems, setVendorItems] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<number>(-1);

  const [paymentMethods] = SWRFetchData(
    getAdminApiUrl(companyId, '/paymentMethods'),
  );
  const [allVendorItems] = SWRFetchData(
    getAdminApiUrl(companyId, '/vendorItems'),
  );
  const [vendors] = SWRFetchData(getAdminApiUrl(companyId, '/vendors'));
  const [adminsAndDriversRes] = SWRFetchData(
    getAdminApiUrl(companyId, '/adminsAndDrivers'),
  );

  const { date, SelectDate } = useSelectDate(stockPurchased?.date, true);

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
    if (adminsAndDriversRes) {
      setAdminsAndDrivers(adminsAndDriversRes?.data);
    }
  }, [adminsAndDriversRes]);

  // const fetchAdminsAndDrivers = async () => {
  //   const user: any = getAdminsAndDrivers(showNotification);
  //   setAdminsAndDrivers(user);
  // };

  // useEffect(() => {
  //   if (open) {
  //     fetchAdminsAndDrivers();
  //   }
  // }, [open]);

  useEffect(() => {
    if (purchasedItems.length > 0) {
      calculateNewAmount();
    }
  }, [purchasedItems]);

  // useEffect(() => {
  //   if (updatedExpense) {
  //     const newSubtotal = updatedExpense?.subTotal - updatedExpense?.discount;
  //     const newGST = Math.round(newSubtotal * gstRate * 100) / 100;
  //     const newPst = Math.round(newSubtotal * pstRate * 100) / 100;
  //     setUpdatedExpense((prevState: any) => ({
  //       ...prevState,
  //       amount: newSubtotal + newGST + newPst,
  //       GST: newGST,
  //       PST: newPst,
  //     }));
  //   }
  // }, [updatedExpense?.discount]);

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
  }, [selectedVendorId, vendors]);

  useEffect(() => {
    if (stockPurchased) {
      setUpdatedExpense(stockPurchased);

      if (stockPurchased?.vendors) {
        setSelectedVendorId(stockPurchased.vendors[0].vendorId);
      }
    }

    const initializeItems = () => {
      if (!stockPurchased?.orderedItems) {
        setPurchasedItems([]);
        return;
      }

      const newItems = stockPurchased.orderedItems.map((item: any) => {
        const vendorItem = allVendorItems?.data?.find((i: any) => {
          return i.inventoryItem.name == item.name;
        });

        return {
          ...item,
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          unit: item.inventoryUnit,
          units: vendorItem?.unit,
          vendorId: item.vendorId,
          vendorItemId: vendorItem?.id,
          vendorItem,
          inventoryItemId: item.inventoryItemId,
          inventoryItem: vendorItem?.inventoryItem,
        };
      });

      setPurchasedItems(newItems);
    };

    if (allVendorItems) {
      initializeItems();
    }
  }, [stockPurchased, vendorItems, allVendorItems]);

  // useEffect(() => {
  //   if (stockPurchased?.orderedItems) {
  //     if (purchasedItems.some((item: any) => item.id < 1)) {
  //       setAffectQuantity({
  //         ...affectQuantity,
  //         checked: true,
  //         disabled: true,
  //       })
  //     } else {
  //       setAffectQuantity({
  //         ...affectQuantity,
  //         disabled: false,
  //       });
  //     }
  //   }
  // }, [purchasedItems]);
  // const fetchAdminsAndDrivers = async () => {
  //   const users: any = await getAdminsAndDrivers(showNotification);
  //   setAdminsAndDrivers(users);
  // };
  const addPromptedItem = () => {
    if (promptedItem.id === -1) {
      showNotification('error', 'Please select item');
      return;
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

    const vendorItemExisted = allVendorItems?.data?.find((item: any) => {
      return item.inventoryItem.name === promptedItem.name;
    });

    setPurchasedItems([
      ...purchasedItems,
      {
        ...promptedItem,
        inventoryItem: vendorItemExisted.inventoryItem,
        id: -1,
        vendorItemId: promptedItem.id,
        unitPrice: promptedItem.unit.unitPrice,
      },
    ]);
    setPromptedItem({
      id: -1,
      quantity: 0,
      unitPrice: 0,
      name: '',
      vendorId: selectedVendorId,
    });
  };

  const calculateNewAmount = () => {
    // Discount percent is the discount percentage of the subtotal + discount
    const discountPercent =
      updatedExpense?.discountPercent ||
      Math.round(
        (updatedExpense?.discount / (updatedExpense?.subTotal + updatedExpense?.discount)) * 100 * 100,
      ) / 100;
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

      acc.subTotal += item.unitPrice * item.quantity;

      if (item?.inventoryItem?.hasPST) {
        acc.PST +=
          item.unitPrice *
          item.quantity *
          pstRate *
          (1 - discountPercent / 100);
      }

      if (item?.inventoryItem?.hasGST) {
        acc.GST +=
          item.unitPrice *
          item.quantity *
          gstRate *
          (1 - discountPercent / 100);
      }

      return acc;
    }, {});

    console.log({
      discountPercent,
      subTotal: updatedExpense?.subTotal,
      PST: updatedExpense?.PST,
      GST: updatedExpense?.GST,
      discount: updatedExpense?.discount,
      total,
    }, 'discountPercent');

    // setTotalAmount(newAmount);
    if (purchasedItems.some((item: any) => !item.inventoryItemId)) {
      setUpdatedExpense((prevState: any) => ({
        ...prevState,
        amount:
          Math.round(
            (parseFloat(total.subTotal.toFixed(2)) +
              (stockPurchased?.PST || 0) +
              (stockPurchased?.GST || 0) -
              (prevState?.discount || 0)) *
              100,
          ) / 100,
        subTotal: parseFloat(total.subTotal.toFixed(2)),
        GST: stockPurchased?.GST || 0,
        PST: stockPurchased?.PST || 0,
        discount: parseFloat(prevState?.discount?.toFixed(2)),
        discountPercent: discountPercent,
      }));
      return;
    }

    setUpdatedExpense((prevState: any) => ({
      ...prevState,
      amount:
        Math.round(
          (parseFloat(total.subTotal.toFixed(2)) +
            (stockPurchased?.PST || 0) +
            (stockPurchased?.GST || 0) -
            (prevState?.discount || 0)) *
            100,
        ) / 100,
      subTotal: parseFloat(total.subTotal.toFixed(2)),
      GST: parseFloat(total.GST.toFixed(2)),
      PST: parseFloat(total.PST.toFixed(2)),
      discount: parseFloat(prevState?.discount?.toFixed(2)),
      discountPercent: discountPercent,
    }));
  };

  const handleOnChangeUnitPrice = (e: any) => {
    const newUnitPrice = +e.target.value;

    // Update units immutably
    const newUnits = promptedItem?.units?.map(
      (unit: any) =>
        unit.ratio === promptedItem?.unit?.ratio
          ? { ...unit, unitPrice: newUnitPrice } // Replace the matching unit
          : unit, // Keep the other units unchanged
    );

    // Update state
    setPromptedItem({
      ...promptedItem,
      unit: { ...promptedItem.unit, unitPrice: newUnitPrice },
      units: newUnits,
    });
  };

  const calculateTaxWithDiscount = (discountPercent: number) => {
    const gstItems = purchasedItems.filter(
      (item: any) => item?.inventoryItem?.hasGST,
    );
    const pstItems = purchasedItems.filter(
      (item: any) => item?.inventoryItem?.hasPST,
    );

    const gstItemsTotalWithDiscount =
      gstItems.reduce((acc: any, item: any) => {
        return acc + item.unit.unitPrice * item.quantity;
      }, 0) *
      (1 - discountPercent / 100);

    const pstItemsTotalWithDiscount =
      pstItems.reduce((acc: any, item: any) => {
        return acc + item.unit.unitPrice * item.quantity;
      }, 0) *
      (1 - discountPercent / 100);

    const gstTotal =
      Math.round(gstItemsTotalWithDiscount * gstRate * 100) / 100;
    const pstTotal =
      Math.round(pstItemsTotalWithDiscount * pstRate * 100) / 100;

    return {
      gstTotal,
      pstTotal,
    };
  };

  const onChangeDiscount = (value: number, isPercent: boolean) => {
    if (isPercent) {
      const { gstTotal, pstTotal } = calculateTaxWithDiscount(value);
      const discount =
        Math.round((value / 100) * updatedExpense.subTotal * 100) / 100;
      setUpdatedExpense((prevState: any) => ({
        ...prevState,
        discount: discount,
        discountPercent: value,
        GST: gstTotal,
        PST: pstTotal,
        amount:
          Math.round(
            (updatedExpense.subTotal - discount + gstTotal + pstTotal) * 100,
          ) / 100,
      }));
    } else {
      const { gstTotal, pstTotal } = calculateTaxWithDiscount(value);

      const discountPercent =
        Math.round((value / updatedExpense.subTotal) * 100 * 100) / 100;
      setUpdatedExpense((prevState: any) => ({
        ...prevState,
        discount: value,
        discountPercent: discountPercent,
        GST: gstTotal,
        PST: pstTotal,
        amount:
          Math.round(
            (updatedExpense.subTotal + gstTotal + pstTotal - value) * 100,
          ) / 100,
      }));
    }
  };

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

            const newUnits = item.units.map((unit: any) => {
              if (unit.ratio === item.unit.ratio) {
                return { ...unit, unitPrice: +e.target.value };
              }

              return unit;
            });

            return {
              ...item,
              unitPrice: +e.target.value,
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
            unitPrice: +e.target.value,
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

      // setIsLoading(false);
      // return;
      const createdAt = generateCurrentTime();
      const response = await axios.put(
        getAdminApiUrl(companyId, '/inventory/expenses'),
        {
          id: updatedExpense.id,
          date,
          amount: updatedExpense.amount,
          PST: updatedExpense?.PST || 0,
          GST: updatedExpense?.GST || 0,
          subTotal: updatedExpense?.subTotal || 0,
          description: updatedExpense.description,
          paymentMethodId: updatedExpense.paymentMethodId,
          spentBy: updatedExpense.spentBy,
          invoice: updatedExpense.invoice,
          discount: updatedExpense?.discount || 0,
          oldItems: isUpdatePurchasedItems ? [] : stockPurchased?.orderedItems,
          updatedItems: isUpdatePurchasedItems ? [] : purchasedItems, // prevent update items if client does not update
          updatedAt: createdAt,
          isAffectQuantity: true,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Fail to update expense: ' + error.response.data.error,
      );
      setIsLoading(false);
      return;
    }
  };

  const selectPromptedItem = (newValue: any) => {
    if (newValue?.inputValue) {
      showNotification('error', 'Not Allowed To Create New Item in Edit Mode');
      return;
    }

    // New Item Add
    if (newValue?.inputValue) {
      setPromptedItem({
        ...promptedItem,
        id: -1,
        unitPrice: 0,
        unit: { unit: 'bags', ratio: 1, unitPrice: 0 },
        units: [],
        name: newValue.inputValue,
        vendorId: selectedVendorId,
      });
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
        inventoryItem: newValue?.inventoryItem,
      });
    }
  };

  const removeItem = (id: number) => {
    const newItemList = purchasedItems.filter((item: any) => {
      return item.id !== id;
    });

    setPurchasedItems(newItemList);
  };

  const removeUnit = (removedUnit: any) => {
    if (removedUnit.ratio === 1) {
      showNotification('error', 'Inventory Item Required Ratio of 1');
      return;
    }

    const newUnits = promptedItem?.units?.filter((item: any) => {
      return removedUnit.unit !== item.unit && removedUnit.ratio !== item.ratio;
    });

    if (
      promptedItem.unit.ratio === removedUnit.ratio &&
      promptedItem.unit.unit === removedUnit.unit
    ) {
      setPromptedItem({
        ...promptedItem,
        units: newUnits,
        unit: newUnits[0],
      });
    } else {
      setPromptedItem({
        ...promptedItem,
        units: newUnits,
      });
    }
  };

  const updateUnit = (updatedUnit: any, updatedIndex: number) => {
    if (promptedItem?.units?.length === 1) {
      if (updatedUnit.ratio !== 1) {
        showNotification('error', 'Inventory Item Required Ratio of 1');
        return;
      }
    }

    const unitRatioExist = promptedItem?.units?.find(
      (unit: any, index: number) => {
        return updatedUnit.ratio === unit.ratio && index !== updatedIndex;
      },
    );

    if (unitRatioExist) {
      showNotification('error', 'Unit ratio already exists');
      return;
    }

    const unitNameExist = promptedItem?.units?.find(
      (unit: any, index: number) => {
        return updatedUnit.unit === unit.unit && index !== updatedIndex;
      },
    );

    if (unitNameExist) {
      showNotification('error', 'Unit name already exists');
      return;
    }

    const newUnits = promptedItem?.units?.map((unit: any, index: number) => {
      if (index === updatedIndex) {
        return updatedUnit;
      }

      return unit;
    });

    setEditUnit({
      unit: null,
      open: false,
    });

    setPromptedItem({
      ...promptedItem,
      units: newUnits,
      unit: updatedUnit,
    });
  };

  return (
    <>
      <AddVendor
        showNotification={showNotification}
        open={openBooleans.isOpenAddVendor}
        onClose={() => onChangeOpen('isOpenAddVendor', false)}
      />
      <EditUnit
        open={editUnit.open}
        onClose={() =>
          setEditUnit((prevEditUnit: any) => ({ ...prevEditUnit, open: false }))
        }
        unit={editUnit.unit}
        updateUnit={(updatedUnit: any) =>
          updateUnit(updatedUnit, editUnit.unitIndex)
        }
      />
      {/* <Button onClick={() => onChangeOpen('isOpen', true)}>Edit</Button> */}
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <ModalHead
            heading="Edit Stock Purchased"
            buttonLabel="EDIT"
            onClick={handleSubmit}
            buttonProps={{ loading: isLoading }}
            onClose={onClose}
          />

          <Divider sx={{ my: 2 }} />

          {/* <Box display="flex" width="100%" justifyContent="flex-end" my={2}>
            <FormControlLabel control={<Switch checked={affectQuantity.checked} onChange={(e) => setAffectQuantity((prevState: any) => ({...prevState, checked: e.target.checked}))} />} label="Affect Quantity" labelPlacement='start' disabled={affectQuantity.disabled}/>
          </Box> */}
          <Box display="flex" flexDirection="column" gap={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
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
                    disabled={purchasedItems.length > 0}
                  >
                    <MenuItem value={-1} disabled>
                      -- Choose a vendor --
                    </MenuItem>
                    <MenuItem
                      onClick={() => onChangeOpen('isOpenAddVendor', true)}
                    >
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
              <Grid item xs={12}>
                <VendorItemSearch
                  promptedItem={promptedItem}
                  handleSelectPromptedItem={selectPromptedItem}
                  role={USER_ROLE.ADMIN}
                  displayItems={vendorItems}
                  disabledItems={purchasedItems.map((item: any) => {
                    return item.vendorItemId;
                  })}
                />
              </Grid>
              {promptedItem?.units && promptedItem?.units.length > 0 && (
                <Grid item xs={12}>
                  <FormControl>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormLabel id="unit">Units</FormLabel>
                      <IconButton
                        onClick={() => onChangeOpen('isOpenAddUnit', true)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <UnitRadio
                      units={promptedItem.units}
                      onChange={(e: any) =>
                        setPromptedItem({
                          ...promptedItem,
                          unit: JSON.parse(e.target.value),
                        })
                      }
                      value={JSON.stringify(promptedItem.unit)}
                      removeUnit={removeUnit}
                      setEditUnit={setEditUnit}
                    />
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Unit Price"
                  type="number"
                  value={promptedItem?.unit?.unitPrice}
                  onChange={handleOnChangeUnitPrice}
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
                // const disabledItem = item?.fifo?._count?.orderedItems > 1;
                return (
                  <Grid container spacing={1} key={index}>
                    <Grid item xs={12} fontWeight="bold">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {item?.inventoryItem?.sku
                            ? `${item?.inventoryItem?.sku} | ${item?.inventoryItem?.name}`
                            : item?.inventoryItem?.name
                              ? item?.inventoryItem?.name
                              : item?.name}
                        </Typography>
                        <IconButton
                          onClick={() => removeItem(item.id)}
                          // disabled={disabledItem}
                        >
                          <RemoveCircleIcon
                            sx={{
                              color: errorColor,
                              // color: disabledItem ? grey[500] : errorColor,
                            }}
                          />
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
                          // disabled={disabledItem}
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
                          // disabled={disabledItem}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}

            <Divider sx={{ my: 2 }}>Bill</Divider>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="h6">Discount ($)</Typography>
                  <TextField
                    placeholder="Discount"
                    fullWidth
                    type="number"
                    value={updatedExpense?.discount || 0}
                    onChange={(e) => onChangeDiscount(+e.target.value, false)}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="h6">Discount (%)</Typography>
                  <TextField
                    placeholder="Discount (%)"
                    fullWidth
                    type="number"
                    value={updatedExpense?.discountPercent || 0}
                    onChange={(e) => onChangeDiscount(+e.target.value, true)}
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
                    value={updatedExpense?.subTotal || 0}
                    onChange={(e) =>
                      setUpdatedExpense((prevState: any) => ({
                        ...prevState,
                        subTotal: +e.target.value,
                      }))
                    }
                  />
                </Box>
              </Grid>
              {/* <Grid item xs={6}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="h6">GST (5%)</Typography>
                  <TextField
                    disabled
                    placeholder="Enter epxense GST..."
                    fullWidth
                    type="number"
                    value={updatedExpense?.GST || stockPurchased?.GST || 0}
                    onChange={(e) =>
                      setUpdatedExpense((prevState: any) => ({
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
                    value={updatedExpense?.PST || 0}
                    onChange={(e) =>
                      setUpdatedExpense((prevState: any) => ({
                        ...prevState,
                        PST: +e.target.value,
                      }))
                    }
                  />
                </Box>
              </Grid> */}
              {updatedExpense?.GST || updatedExpense?.PST ? (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">
                      GST (5%): ${updatedExpense?.GST || 0}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography variant="h6">
                      PST (7%): ${updatedExpense?.PST || 0}
                    </Typography>
                  </Box>
                </Grid>
              ) : null}
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="h6">Amount</Typography>
                  <TextField
                    disabled
                    placeholder="Enter epxense amount..."
                    fullWidth
                    type="number"
                    value={updatedExpense?.amount || 0}
                    onChange={(e) =>
                      setUpdatedExpense((prevState: any) => ({
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
                value={updatedExpense?.invoice}
                onChange={(e) =>
                  setUpdatedExpense({
                    ...updatedExpense,
                    invoice: e.target.value,
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
                  paymentMethods?.data.map((item: any, index: number) => {
                    return (
                      <MenuItem key={index} value={item.id}>
                        {item.name}
                      </MenuItem>
                    );
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
                {adminsAndDrivers &&
                  adminsAndDrivers?.length > 0 &&
                  adminsAndDrivers?.map((person: string) => {
                    return (
                      <MenuItem key={person} value={person}>
                        {person}
                      </MenuItem>
                    );
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
};

export default memo(EditStockPurchased, (prev, next) => {
  return (
    prev.showNotification === next.showNotification &&
    prev.stockPurchased === next.stockPurchased
  );
});
