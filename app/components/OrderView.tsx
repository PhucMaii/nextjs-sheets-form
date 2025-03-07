import {
  Box,
  Button,
  Divider,
  Fab,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IItem } from '../utils/type';
import { infoBackground, primary } from '@/theme/color';
import { blue, blueGrey, grey } from '@mui/material/colors';
import { ShadowSection } from '../admin/reports/styled';
import { generateOrderTotalPrice } from '@/pages/api/admin/orderedItems/PUT';
import { SearchIcon, Trash2 } from 'lucide-react';
import ErrorComponent from '../admin/components/ErrorComponent';
import useDebounce from '@/hooks/useDebounce';
import { handleSearch } from '../utils/search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { LoadingButton } from '@mui/lab';
import {
  disableChristmasAndNewYear,
  formatDateChanged,
  generateMinDate,
  generateRecommendDate,
} from '../utils/time';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Order } from '../admin/orders/page';
import { API_URL, USER_ROLE } from '../utils/enum';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import AddCustomAmount from '../admin/components/Modals/add/AddCustomAmount';
import { ItemTypeButton } from '../admin/components/Inventory/StockItems';
import SingleFieldEdit from '../admin/components/Modals/edit/SingleFieldEdit';
import { convertItemArrayToMap } from '../utils/item';

export const ItemButton = ({
  item,
  onClick,
  style,
  containerStyle,
  ref,
}: {
  item: IItem;
  onClick?: any;
  style?: any;
  containerStyle?: any;
  ref?: any;
}) => {
  return (
    <Button
      key={item.id}
      sx={{ width: '100%', height: '100%', ...style }}
      onClick={onClick}
      ref={ref}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap={2}
        alignItems="flex-start"
        sx={{
          p: 1,
          backgroundColor: blue[50],
          borderRadius: 1,
          width: '100%',
          height: '100%',
          border: `1px solid ${grey[200]}`,
          color: blueGrey[800],
          ...containerStyle,
        }}
      >
        <Typography fontWeight="bold" textAlign="left">
          {item.name}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontWeight="bold">${item.price?.toFixed(2)}</Typography>
          {item.isShowDiscount && item.prevPrice && (
            <Typography
              fontWeight="bold"
              sx={{ textDecoration: 'line-through' }}
              color="error"
            >
              ${item.prevPrice.toFixed(2)}
            </Typography>
          )}
        </Box>
      </Box>
    </Button>
  );
};

export enum ORDER_USAGE_PURPOSE {
  ORDER = 'order',
  ITEM = 'item',
}

interface IProps {
  items: IItem[];
  defaultDeliveryDate?: string;
  defaultOrderedItems?: IItem[];
  defaultOrder?: Order;
  purpose?: ORDER_USAGE_PURPOSE; // If null, means for order
  onSubmit: (order: Order) => Promise<void>;
  isModal?: boolean;
  isPreOrder?: boolean;
  clientName?: string;
  role?: USER_ROLE;
}

const OrderView = ({
  items,
  purpose,
  onSubmit,
  isModal,
  isPreOrder,
  defaultDeliveryDate,
  defaultOrderedItems,
  defaultOrder,
  clientName,
  role,
}: IProps) => {
  const [displayItems, setDisplayItems] = useState<IItem[]>(items);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderedItems, setOrderedItems] = useState<IItem[]>(
    defaultOrderedItems || [],
  );
  const [isOpenAddCustomAmount, setIsOpenAddCustomAmount] =
    useState<boolean>(false);
  const [isUpdatingAvoidInventory, setIsUpdatingAvoidInventory] =
    useState<boolean>(false);
  const [isAffectInventory, setIsAffectInventory] = useState<boolean>(
    defaultOrder?.isAffectInventory || false,
  );
  const [order, setOrder] = useState<any | null>({
    id: defaultOrder?.id || -1,
    subTotal: 0,
    totalPrice: 0,
    PST: 0,
    GST: 0,
    note: defaultOrder?.note || '',
    deliveryDate:
      defaultOrder?.deliveryDate ||
      defaultDeliveryDate ||
      generateRecommendDate(),
  });
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const [selectedItemType, setSelectedItemType] = useState<string>('All');
  const [singleFieldProps, setSingleFieldProps] = useState<any>({
    open: false,
    item: null,
    defaultValue: 1,
  });
  const [tabIdx, setTabIdx] = useState<number>(0);

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const minDate = generateMinDate();

  const { NotificationComp, showNotification } = useNotification();

  // Because the item id is not the same as ordered item id when it comes to edit item
  const comparedField = purpose === ORDER_USAGE_PURPOSE.ITEM ? 'name' : 'id';

  const itemTypes = useMemo(() => {
    const typesObj = convertItemArrayToMap(items);

    return typesObj;
  }, [items]);

  const orderDiscount = useMemo(() => {
    if (!orderedItems || orderedItems.length === 0) return 0;
    const discountItems = orderedItems.filter(
      (item: any) => item.isShowDiscount && item.prevPrice,
    );
    const discount = discountItems.reduce((acc: number, item: any) => {
      return acc + (item.prevPrice - item.price) * item.quantity;
    }, 0);

    return discount;
  }, [orderedItems]);

  const totalQuantity = useMemo(() => {
    if (!orderedItems || orderedItems.length === 0) return 0;

    return orderedItems.reduce(
      (total, item) => total + (item?.quantity || 0),
      0,
    );
  }, [orderedItems]);

  //   useEffect(() => {
  //     if (defaultOrderedItems) {
  //       setOrderedItems(defaultOrderedItems);
  //     }
  //   }, [defaultOrderedItems]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newItems = handleSearch(debouncedKeywords, items, ['name']);
      setDisplayItems(newItems);
    } else {
      setDisplayItems(items);
    }
  }, [debouncedKeywords, items]);

  useEffect(() => {
    if (selectedItemType !== 'All') {
      const newItems = items.filter(
        (i) => i?.inventoryItem?.type?.name === selectedItemType,
      );
      setDisplayItems(newItems);
    } else {
      setDisplayItems(items);
    }
  }, [selectedItemType]);

  useEffect(() => {
    // Update order whenever the orderedItems change
    const newSubtotal = generateOrderTotalPrice(orderedItems);
    setOrder({
      ...order,
      subTotal: newSubtotal?.subTotal || 0,
      totalPrice: newSubtotal?.totalPrice || 0,
      PST: newSubtotal?.PST || 0,
      GST: newSubtotal?.GST || 0,
    });
  }, [orderedItems]);

  const onAvoidInventory = async (e: any) => {
    if (order.id < 1) return;

    setIsUpdatingAvoidInventory(true);
    try {
      setIsAffectInventory(e.target.checked);
      const response = await axios.put(
        `${API_URL.ADMIN}/orders/isAffectInventory`,
        {
          id: order.id,
          isAffectInventory: e.target.checked,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsUpdatingAvoidInventory(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsUpdatingAvoidInventory(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error.response.data.error);
      showNotification(
        'error',
        'Internal Server Error: ' + error.response.data.error,
      );
      setIsUpdatingAvoidInventory(false);
    }
  };

  const onAddItem = (quantity: number) => {
    if (quantity % 1 !== 0) {
      showNotification('error', 'Quantity must be an whole number');
      return;
    }

    if (quantity < 1) {
      showNotification('error', 'Quantity must be greater than 0');
      return;
    }

    const item = singleFieldProps.item;
    // Check if item is already in orderedItems
    const existingItem = orderedItems.find(
      (i) => i[comparedField] === item[comparedField],
    );

    if (existingItem) {
      const newOrderedItems = orderedItems.map((i) => {
        if (i[comparedField] === item[comparedField]) {
          return {
            ...i,
            quantity: Number(quantity),
          };
        }
        return i;
      });

      setOrderedItems(newOrderedItems);
    } else {
      // Add item to orderedItems
      setOrderedItems([
        ...orderedItems,
        { ...item, quantity: Number(quantity) },
      ]);
    }

    setSingleFieldProps({
      open: false,
      item: null,
      defaultValue: 1,
    });
  };

  // const onEditItemQuantity = (item: IItem, quantity: number) => {
  //   const newItems = orderedItems.map((i) => {
  //     if (i[comparedField] === item[comparedField]) {
  //       return {
  //         ...i,
  //         quantity: quantity,
  //       };
  //     }
  //     return i;
  //   });
  //   setOrderedItems(newItems);
  // };

  const onDateChange = (e: any) => {
    const formattedDate = formatDateChanged(e);
    setOrder({
      ...order,
      deliveryDate: formattedDate,
    });
  };

  const onIncrementQuantity = (item: IItem) => {
    const newItems = orderedItems.map((i) => {
      if (i[comparedField] === item[comparedField]) {
        return {
          ...i,
          quantity: (i?.quantity || 0) + 1,
        };
      }
      return i;
    });
    setOrderedItems(newItems);
  };

  const onDecrementQuantity = (item: IItem) => {
    if (item.quantity && item?.quantity <= 1) {
      onRemoveItem(item);
      return;
    }

    const newItems = orderedItems.map((i) => {
      if (i[comparedField] === item[comparedField]) {
        return {
          ...i,
          quantity: (i?.quantity || 0) - 1,
        };
      }
      return i;
    });
    setOrderedItems(newItems);
  };

  const onRemoveItem = (item: IItem) => {
    const newItems = orderedItems.filter((i) => i.id !== item.id);
    setOrderedItems(newItems);
  };

  const onSubmitOrder = async () => {
    const isItemsValid = orderedItems.every((i: any) => i.quantity > 0);

    if (!isItemsValid) {
      showNotification('error', 'Items quantity must be greater than 0');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ ...order, items: orderedItems });
      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsLoading(false);
    }
  };

  const onEditOrderedItemPrice = (item: IItem, price: number) => {
    const newItems = orderedItems.map((i) => {
      if (i[comparedField] === item[comparedField]) {
        return {
          ...i,
          price: price,
        };
      }
      return i;
    });
    setOrderedItems(newItems);
  };

  const renderByItems = () => {
    return (
      <>
        {displayItems.length > 0 &&
          displayItems.map((item: IItem) => {
            return (
              <Grid
                item
                xs={isModal ? 12 : 6}
                sm={isModal ? 6 : 4}
                md={isModal ? 6 : 3}
              >
                <ItemButton
                  item={item}
                  onClick={() =>
                    setSingleFieldProps({
                      open: true,
                      item,
                      defaultValue: 1,
                    })
                  }
                  containerStyle={{
                    backgroundColor:
                      item?.inventoryItem?.color || infoBackground,
                  }}
                />
              </Grid>
            );
          })}
      </>
    );
  };

  const renderItemsByType = () => {
    return (
      <>
        {itemTypes?.sortedKeysByPriority &&
          itemTypes?.sortedKeysByPriority?.length > 0 &&
          itemTypes?.sortedKeysByPriority?.map((type: string) => {
            return (
              <Fragment key={type}>
                <Grid item xs={12} mt={2}>
                  <Typography variant="h6">{type}</Typography>
                </Grid>

                {itemTypes.typesObj[type].map((item: IItem, index: number) => {
                  return (
                    <Grid
                      data-tour={index === 0 ? 'third-step' : ''}
                      item
                      xs={isModal ? 12 : 6}
                      sm={isModal ? 6 : 4}
                      md={isModal ? 6 : 3}
                    >
                      <ItemButton
                        item={item}
                        onClick={() =>
                          setSingleFieldProps({
                            open: true,
                            item,
                            defaultValue: 1,
                          })
                        }
                        containerStyle={{
                          backgroundColor:
                            item?.inventoryItem?.color || infoBackground,
                        }}
                      />
                    </Grid>
                  );
                })}
              </Fragment>
            );
          })}

        {/* <Fragment>
          <Grid item xs={12} mt={2}>
            <Typography variant="h6">Others</Typography>
          </Grid>

          {itemTypes?.sortedKeysByPriority?.includes('Others') &&
            itemTypes?.typesObj['Others'] &&
            itemTypes?.typesObj['Others']?.length > 0 &&
            itemTypes?.typesObj['Others'].map((item: IItem) => {
              return (
                <Grid item xs={6} sm={isModal ? 6 : 4} md={isModal ? 6 : 3}>
                  <ItemButton
                    item={item}
                    onClick={() =>
                      setSingleFieldProps({
                        open: true,
                        item,
                        defaultValue: 1,
                      })
                    }
                    containerStyle={{
                      backgroundColor:
                        item?.inventoryItem?.color || infoBackground,
                    }}
                  />
                </Grid>
              );
            })}
        </Fragment> */}
      </>
    );
  };

  const renderPlaceOrdeButton = useCallback(() => {
    return (
      <Box
        sx={{ position: 'sticky', bottom: 0, width: '100%' }}
        data-tour="fifth-step"
      >
        <LoadingButton
          loading={isLoading}
          onClick={onSubmitOrder}
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={orderedItems.length === 0}
        >
          {purpose === ORDER_USAGE_PURPOSE.ITEM ? 'Save' : 'Place Order'}
        </LoadingButton>
      </Box>
    );
  }, [onSubmitOrder, isLoading]);

  const renderDisplayItems = () => {
    return (
      <ShadowSection width="100%">
        {/* Item types */}
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          overflow="auto"
          gap={0.5}
          whiteSpace="nowrap"
        >
          <ItemTypeButton
            data-tour="first-step"
            style={{ minWidth: 'auto' }}
            type="All"
            isSelected={selectedItemType === 'All'}
            onClick={() => setSelectedItemType('All')}
            mode="edit"
          />
          {itemTypes?.sortedKeysByPriority &&
            itemTypes.sortedKeysByPriority.map(
              (itemType: string, index: number) => {
                return (
                  <ItemTypeButton
                    key={index}
                    type={itemType}
                    isSelected={itemType === selectedItemType}
                    onClick={() => setSelectedItemType(itemType)}
                    style={{ minWidth: 'auto' }}
                    mode="view"
                  />
                );
              },
            )}
        </Box>

        {/* Search bar */}
        <OutlinedInput
          fullWidth
          data-tour="second-step"
          //   label="Search item"
          placeholder="Bean sprouts..."
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />

        <Typography variant="h6" sx={{ mt: 2 }}>
          {selectedItemType} Items
        </Typography>
        <Grid container mt={2}>
          {selectedItemType === 'All' && !debouncedKeywords
            ? renderItemsByType()
            : renderByItems()}

          {/* Only admin can add custom amount at order mode, neither edit mode nor pre order mode allowed to create custom amount */}
          {role === USER_ROLE.ADMIN &&
            purpose === ORDER_USAGE_PURPOSE.ORDER &&
            !isPreOrder && (
              <Grid item xs={6} sm={isModal ? 6 : 4} md={isModal ? 6 : 3}>
                <Button onClick={() => setIsOpenAddCustomAmount(true)}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                    gap={2}
                    alignItems="flex-start"
                    sx={{
                      p: 1,
                      backgroundColor: blueGrey[50],
                      borderRadius: 1,
                      width: '100%',
                      height: '100%',
                      color: blueGrey[800],
                    }}
                  >
                    <Typography fontWeight="bold" textAlign="left">
                      + Add Custom Amount
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            )}
        </Grid>
        {smDown && renderPlaceOrdeButton()}
      </ShadowSection>
    );
  };

  const renderMyOrder = () => {
    return (
      <ShadowSection
        display="flex"
        flexDirection="column"
        gap={1}
        sx={{ position: 'sticky', top: 0, width: '100%' }}
        data-tour="fourth-step"
      >
        {/* Only admin can affect inventory for an order in edit mode */}
        {role === USER_ROLE.ADMIN &&
          purpose === ORDER_USAGE_PURPOSE.ITEM &&
          !isPreOrder && (
            <FormControlLabel
              control={
                <Switch
                  checked={isAffectInventory}
                  onChange={onAvoidInventory}
                />
              }
              label={
                isUpdatingAvoidInventory ? 'Updating...' : 'Affect Inventory'
              }
            />
          )}

        <Typography variant="h6" textAlign="center">
          {clientName ? `${clientName}'s` : 'My'} Order
        </Typography>

        {orderedItems.length > 0 ? (
          orderedItems.map((item: IItem) => {
            return (
              <Box
                key={item.id}
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                sx={{
                  p: 1,
                  backgroundColor: primary.lightest,
                  borderRadius: 1,
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  justifyContent="space-between"
                >
                  <Typography fontWeight="bold">{item.name}</Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onRemoveItem(item)}
                  >
                    <Trash2 />
                  </IconButton>
                </Box>

                <Box
                  display="flex"
                  alignItems={smDown || isModal ? 'flex-start' : 'center'}
                  justifyContent="space-between"
                  flexDirection={smDown || isModal ? 'column' : 'row'}
                  gap={2}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {role === USER_ROLE.ADMIN ? (
                      <OutlinedInput
                        size="small"
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          onEditOrderedItemPrice(item, +e.target.value)
                        }
                        startAdornment={
                          <InputAdornment position="start">
                            <AttachMoneyIcon fontSize="small" />
                          </InputAdornment>
                        }
                      />
                    ) : (
                      <Typography fontWeight="bold">
                        ${item.price.toFixed(2)}
                      </Typography>
                    )}
                    {item.isShowDiscount && item.prevPrice && (
                      <Typography
                        fontWeight="bold"
                        sx={{ textDecoration: 'line-through' }}
                        color="error"
                      >
                        ${item.prevPrice.toFixed(2)}
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Fab
                      size="small"
                      sx={{
                        width: 30,
                        minHeight: 30,
                        height: 30,
                        boxShadow: 'none',
                      }}
                      color="primary"
                      onClick={() => onDecrementQuantity(item)}
                    >
                      -
                    </Fab>
                    <Typography fontWeight="bold">{item.quantity}</Typography>
                    {/* <OutlinedInput
                      size="small"
                      type="number"
                      value={item.quantity}
                      inputProps={{ min: 1 }}
                      onChange={(e) =>
                        onEditItemQuantity(item, +e.target.value)
                      }
                      slotProps={{
                        input: {
                          sx: { textAlign: 'center' },
                        },
                      }}
                      sx={{
                        width: 'auto',
                        maxWidth: 100,
                        textAlign: 'center',
                      }}
                    /> */}
                    <Fab
                      size="small"
                      sx={{
                        width: 30,
                        minHeight: 30,
                        height: 30,
                        boxShadow: 'none',
                      }}
                      color="primary"
                      onClick={() => onIncrementQuantity(item)}
                    >
                      +
                    </Fab>
                  </Box>
                </Box>
              </Box>
            );
          })
        ) : (
          <ErrorComponent errorText="Your order is empty" />
        )}

        {!isPreOrder && renderDateAndNoteInput()}
        {renderTotal()}
        {renderPlaceOrdeButton()}
      </ShadowSection>
    );
  };

  const renderDateAndNoteInput = () => {
    return (
      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6" textAlign="center">
            Delivery Date
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast={role === USER_ROLE.CLIENT}
              minDate={role === USER_ROLE.CLIENT ? minDate : null}
              value={dayjs(order.deliveryDate)}
              onChange={onDateChange}
              sx={{ width: '100%' }}
              shouldDisableDate={disableChristmasAndNewYear}
              disabled={(role === USER_ROLE.CLIENT || role === USER_ROLE.DRIVER) && purpose === ORDER_USAGE_PURPOSE.ITEM}
            />
          </LocalizationProvider>
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6" textAlign="center">
            Note
          </Typography>
          <TextField
            label="Note"
            multiline
            rows={2}
            variant="outlined"
            placeholder="Leave us a note here..."
            value={order.note}
            onChange={(e) => setOrder({ ...order, note: e.target.value })}
            disabled={role === USER_ROLE.DRIVER && purpose === ORDER_USAGE_PURPOSE.ITEM}
          />
        </Box>
      </Box>
    );
  };

  const renderTotal = () => {
    return (
      <Grid container spacing={1} mt={2}>
        <Grid item xs={12} mt={4} textAlign="center">
          <Typography fontWeight="bold" variant="h6" textAlign="center">
            TOTAL
          </Typography>
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>Number of items</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">{totalQuantity} items</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {orderDiscount && orderDiscount > 0 ? (
          <>
            <Grid item xs={4} textAlign="left" ml={2}>
              <Typography>Discount ($)</Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Typography fontWeight="bold">
                -${orderDiscount?.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </>
        ) : null}
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>Subtotal</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            ${order?.subTotal?.toFixed(2) || order?.totalPrice?.toFixed(2) || 0}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>GST (5%)</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            ${order?.GST?.toFixed(2) || 0}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>PST (7%)</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            ${order?.PST?.toFixed(2) || 0}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>Total</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            ${order?.totalPrice?.toFixed(2)}
          </Typography>
        </Grid>
        {/* <Grid item xs={12}> */}
        {/* </Grid> */}
      </Grid>
    );
  };

  if (smDown) {
    return (
      <>
        <AddCustomAmount
          open={isOpenAddCustomAmount}
          onClose={() => setIsOpenAddCustomAmount(false)}
          setItemList={setOrderedItems}
          // addCustomAmount={addCustomAmount}
          showNotification={showNotification}
        />
        <SingleFieldEdit
          title={`How many ${singleFieldProps?.item?.name}?`}
          inputLabel="Quantity"
          open={singleFieldProps.open}
          handleUpdate={onAddItem}
          onClose={() => setSingleFieldProps({ open: false, defaultValue: 1 })}
          defaultValue={singleFieldProps.defaultValue}
          buttonLabel="Add"
          inputProps={{
            type: 'number',
            inputProps: {
              min: 1,
            },
          }}
        />
        {NotificationComp}
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          width="100%"
          overflow="auto"
        >
          <Box sx={{ borderColor: 'divider', borderBottom: 1 }}>
            <Tabs
              value={tabIdx}
              variant="fullWidth"
              onChange={(e, value) => setTabIdx(value)}
            >
              <Tab label="Menu" value={0} />
              <Tab
                data-tour="fourth-step"
                label={`Order (${totalQuantity})`}
                value={1}
              />
            </Tabs>
          </Box>

          {tabIdx === 0 && renderDisplayItems()}
          {tabIdx === 1 && renderMyOrder()}
        </Box>
      </>
    );
  }

  return (
    <>
      <AddCustomAmount
        open={isOpenAddCustomAmount}
        onClose={() => setIsOpenAddCustomAmount(false)}
        setItemList={setOrderedItems}
        // addCustomAmount={addCustomAmount}
        showNotification={showNotification}
      />
      <SingleFieldEdit
        title={`How many ${singleFieldProps?.item?.name}?`}
        inputLabel="Quantity"
        open={singleFieldProps.open}
        handleUpdate={onAddItem}
        onClose={() => setSingleFieldProps({ open: false, defaultValue: 1 })}
        defaultValue={singleFieldProps.defaultValue}
        buttonLabel="Add"
        inputProps={{
          type: 'number',
          inputProps: {
            min: 1,
          },
        }}
      />
      {NotificationComp}
      <Grid container spacing={2} width="100%">
        <Grid item xs={12} sm={isModal ? 7 : 8}>
          {renderDisplayItems()}
        </Grid>

        <Grid item xs={12} sm={isModal ? 5 : 4}>
          {renderMyOrder()}
        </Grid>
      </Grid>
    </>
  );
};

export default OrderView;
