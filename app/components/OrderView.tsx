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
import { IItem, IOption } from '../utils/type';
import { infoBackground, primary } from '@/theme/color';
import { blueGrey, grey, red } from '@mui/material/colors';
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
import { API_URL, TYPE, USER_ROLE } from '../utils/enum';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import AddCustomAmount from '../admin/components/Modals/add/AddCustomAmount';
import { ItemTypeButton } from '../admin/components/Inventory/StockItems';
import { SWRFetchData } from '../utils/db';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import { blackColor } from '@/theme/create-palette';
import { generateImgUrl } from '../lib/s3';
import { Discount } from '@mui/icons-material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import SetItemQuantity from './SetItemQuantity';

export const WhiteSpace = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
      }}
    />
  );
};

const OnSaleBadge = ({
  discountPrice,
  prevPrice,
  percentage, // if percentage is provided, no need to calculate percentage
}: {
  discountPrice: number;
  prevPrice: number;
  percentage?: number;
}) => {
  const discountRate = useMemo(() => {
    // if (percentage) {
    //   return percentage;
    // }
    return Math.ceil((1 - discountPrice / prevPrice) * 100);
  }, [discountPrice, prevPrice]);

  return (
    <Box
      display="flex"
      // justifyContent="center"
      alignItems="center"
      gap={0.5}
      sx={{
        // position: 'absolute',
        // top: 0,
        // right: 0,
        width: 'fit-content',
        height: 25,
        borderRadius: '5px',
        backgroundColor: red[500],
        zIndex: 50,
        padding: '5px 6px',
        flexShrink: 0,
        // boxShadow: '0 0 8px rgba(228, 13, 13, 0.92)',
        // '&::after': {
        //   content: '""',
        //   position: 'absolute',
        //   top: 0,
        //   left: 0,
        //   width: '100%',
        //   height: '100%',
        //   borderRadius: '50%',
        //   backgroundColor: red[500],
        //   opacity: 0.5,
        //   animation: 'ping 1.5s infinite',
        //   zIndex: -1,
        // },
        // '@keyframes ping': {
        //   '0%': {
        //     transform: 'scale(1)',
        //     opacity: 0.3,
        //     backgroundColor: red[500],
        //   },
        //   '50%': {
        //     transform: 'scale(1.3)',
        //     opacity: 1,
        //     // backgroundColor: red[300],
        //   },
        //   '100%': {
        //     transform: 'scale(1)',
        //     opacity: 0.3,
        //     backgroundColor: red[500],
        //   },
        // },
      }}
    >
      <Discount sx={{ fontSize: 13, color: 'white' }} />
      <Typography sx={{ fontSize: 10, fontWeight: 'medium', color: 'white', textTransform: 'none' }}>
        {percentage
          ? `Up to ${percentage?.toFixed(0)}% off`
          : `${discountRate.toFixed(0)}% off`}
      </Typography>
    </Box>
  );
};

export const ItemButton = ({
  item,
  onClick,
  style,
  containerStyle,
  ref,
  disabled,
  flexColOnDiscount,
  onRemove,
}: {
  item: IItem;
  onClick?: any;
  style?: any;
  containerStyle?: any;
  ref?: any;
  disabled?: boolean;
  flexColOnDiscount?: boolean;
  onRemove?: any;
}) => {
  const options = useMemo(() => {
    if (!item?.options || item?.options.length === 0) return null;
    const lowestPriceOption = item?.options.sort(
      (a, b) => a.price - b.price,
    )[0];

    const highestDiscountPercent: any = item?.options
      ?.map((option) => {
        if (option?.prevPrice && option?.isShowDiscount) {
          return (1 - option.price / option.prevPrice) * 100;
        } else {
          return null;
        }
      })
      .filter((percentage) => percentage !== null);

    const highestDiscount =
      highestDiscountPercent.length > 0
        ? Math.max(highestDiscountPercent)
        : undefined;

    return {
      options: item?.options,
      lowestPrice: lowestPriceOption?.price,
      highestDiscount,
    };
  }, [item]);

  return (
    <Button
      key={item.id}
      sx={{ posiion: 'relative', width: '100%', height: '100%', ...style }}
      onClick={onClick}
      ref={ref}
      disabled={disabled || item?.availability === false}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap={2}
        alignItems="flex-start"
        sx={{
          position: 'relative',
          p: 1,
          // backgroundColor: blue[50],
          color:
            disabled || item?.availability === false ? grey[400] : blackColor,
          borderRadius: 1,
          width: '100%',
          height: '100%',
          border: `1px solid ${grey[200]}`,
          // color:
          //   disabled || item?.availability === false
          //     ? grey[400]
          //     : blueGrey[800],
          ...(!item?.image && containerStyle),
        }}
      >
        {item?.image && (
          <img
            src={generateImgUrl(item?.image)}
            alt="img"
            style={{
              position: 'absolute',
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              borderRadius: 'inherit',
              inset: 0, // Make the image stretch to fill the container
              zIndex: 0,
              opacity: 0.5,
              // brightness
              // filter: 'brightness(80%)',
            }}
          />
        )}
        <Box
          display="flex"
          // alignItems="flex-start"
          flexDirection={'column'}
          // justifyContent={flexColOnDiscount ? '' : 'space-between'}
          gap={1}
          width="100%"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontWeight="bold" textAlign="left" sx={{ zIndex: 1 }}>
              {item.name}
            </Typography>
            {onRemove && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item);
                }}
                color="error"
              >
                <RemoveCircleIcon />
              </IconButton>
            )}
          </Box>
          {((item?.isShowDiscount && item?.prevPrice) ||
            options?.highestDiscount) && (
            // <Box display="flex" justifyContent="flex-end" sx={{width: '100%'}}>
            <OnSaleBadge
              discountPrice={item.price}
              prevPrice={item?.prevPrice || 0}
              percentage={options?.highestDiscount}
            />

            // </Box>
          )}
        </Box>
        <Box
          display="flex"
          alignItems="center"
          flexDirection={flexColOnDiscount ? 'column' : 'row'}
          gap={1}
          sx={{ zIndex: 1 }}
        >
          <Typography fontWeight="bold" sx={{ textTransform: 'none' }}>
            {options?.lowestPrice
              ? `From $${options.lowestPrice.toFixed(2)}`
              : `$${item.price?.toFixed(2) || 'N/A'}`}
          </Typography>
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
  const [editItemQuantity, setEditItemQuantity] = useState<IItem | null>(null);
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
    defaultValue: 0,
  });
  const [tabIdx, setTabIdx] = useState<number>(0);

  const [appearance] = SWRFetchData('/api/appearance');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const minDate = generateMinDate();

  const { NotificationComp, showNotification } = useNotification();

  // Because the item id is not the same as ordered item id when it comes to edit item
  const comparedField = purpose === ORDER_USAGE_PURPOSE.ITEM ? 'name' : 'id';

  const itemTypes = useMemo(() => {
    // const typesObj = convertItemArrayToMap(items);
    const newTypes = { ...(appearance?.itemTypes || {}) };

    // Check if user allowed to view that item or not by comparing with provided items
    Object.keys(newTypes).forEach((key: string) => {
      newTypes[key] = newTypes[key].map((item: any) => {
        const actualId = Number(item.id?.toString().split(' - ')[1]);
        const existingItem = items.find((i) => i.inventoryItemId === actualId);
        if (existingItem) {
          return {
            ...item,
            ...existingItem,
          };
        }
        return {
          ...item,
          disabled: true,
        };
      });
    });

    console.log(newTypes, 'new Types');

    return newTypes;
  }, [items, appearance]);

  const promotions = useMemo(() => {
    const newPromotions = { ...(appearance?.promotions || {}) };

    if (Object.keys(newPromotions).length === 0) {
      return {};
    }

    Object.keys(newPromotions).forEach((key: string) => {
      newPromotions[key] = newPromotions[key].map((item: any) => {
        const actualId = Number(item.id?.toString().split(' - ')[1]);
        const existingItem = items.find((i) => i.inventoryItemId === actualId);
        if (existingItem) {
          return {
            ...item,
            ...existingItem,
          };
        }
        return {
          ...item,
          disabled: true,
        };
      });
    });

    return newPromotions;
  }, [appearance]);

  const xsDown = useMediaQuery((theme: any) => theme.breakpoints.down('xs'));

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

  useEffect(() => {
    setOrderedItems(defaultOrderedItems || []);
  }, [clientName, defaultOrderedItems]);

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
      setDisplayItems(itemTypes[selectedItemType]);
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

  // Handle the input of order items
  const onAddItem = (quantity: number, option: IOption | null = null) => {
    if (quantity % 1 !== 0) {
      showNotification('error', 'Quantity must be a whole number');
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

    console.log(option, 'ITEM OPTION');
    if (existingItem) {
      const newOrderedItems = orderedItems.map((i) => {
        if (i[comparedField] === item[comparedField]) {
          return {
            ...i,
            option: option,
            price: option?.price || item.price,
            inventoryUnit: option?.unit || item.inventoryUnit,
            inventoryUnitId: option?.unitId || item.inventoryUnitId,
            prevPrice: option?.prevPrice || item?.prevPrice,
            isShowDiscount:
              option?.isShowDiscount || item?.isShowDiscount || false,
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
        {
          ...item,
          option: option,
          price: option?.price || item.price,
          inventoryUnit: option?.unit || item.inventoryUnit,
          inventoryUnitId: option?.unitId || item.inventoryUnitId,
          prevPrice: option?.prevPrice || item?.prevPrice,
          isShowDiscount:
            option?.isShowDiscount || item?.isShowDiscount || false,
          quantity: Number(quantity),
        },
      ]);
    }

    setSingleFieldProps({
      open: false,
      item: null,
      defaultValue: 0,
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
    if (!orderedItems.length && !isPreOrder) {
      showNotification('error', 'Order must have at least one item');
      return;
    }

    if (orderedItems.length > 0) {
      const isItemsValid = orderedItems.every((i: any) => i.quantity > 0);

      if (!isItemsValid) {
        showNotification('error', 'Items quantity must be greater than 0');
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSubmit({ ...order, items: orderedItems });
      setOrderedItems([]);
      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsLoading(false);
    } finally {
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

  const renderByItemType = () => {
    return (
      <>
        {displayItems.length > 0 &&
          displayItems.map((item: IItem | any) => {
            return (
              <Grid
                item
                xs={6}
                // sm={4}
                // md={3}
                // lg={3}
                sx={{ width: xsDown ? '50px' : '100%' }}
              >
                {item.name === 'Empty' ? (
                  <WhiteSpace />
                ) : (
                  <ItemButton
                    item={item}
                    onClick={() =>
                      setSingleFieldProps({
                        open: true,
                        item,
                        defaultValue: 0,
                      })
                    }
                    style={{ width: xsDown ? '50px' : '100%' }}
                    containerStyle={{
                      backgroundColor: item?.disabled
                        ? grey[100]
                        : item?.inventoryItem?.color
                          ? item?.inventoryItem?.color
                          : infoBackground,
                    }}
                    disabled={item?.disabled || order?.type === TYPE.LOCKED}
                    flexColOnDiscount={isModal && smDown}
                  />
                )}
              </Grid>
            );
          })}
      </>
    );
  };

  const renderAllItems = (containers: any, type: string = 'itemTypes') => {
    return (
      <>
        {Object.keys(containers).length > 0 &&
          Object.keys(containers)?.map((typeName: string) => {
            return (
              <Fragment key={typeName}>
                <Grid item xs={12} mt={2}>
                  <Typography
                    variant="h6"
                    sx={
                      type === 'promotion'
                        ? {
                            // px: 2,
                            py: 2,
                            color: '#ff4081',
                            animation: 'flash 1s infinite ease-in-out',
                            '@keyframes flash': {
                              '0%, 100%': {
                                opacity: 1,
                              },
                              '50%': {
                                opacity: 0.8,
                              },
                            },
                          }
                        : {}
                    }
                  >
                    {typeName} {type === 'promotion' && '🎉'}
                  </Typography>
                </Grid>

                {containers[typeName].map(
                  (item: IItem | any, index: number) => {
                    return (
                      <Grid
                        data-tour={index === 0 ? 'third-step' : ''}
                        item
                        xs={6}
                        // sm={4}
                        // md={3}
                        // lg={3}
                        sx={{ width: xsDown ? '50px' : '100%' }}
                      >
                        {item.name === 'Empty' ? (
                          <WhiteSpace />
                        ) : (
                          <ItemButton
                            item={item}
                            onClick={() =>
                              setSingleFieldProps({
                                open: true,
                                item,
                                defaultValue: 0,
                              })
                            }
                            style={{ width: xsDown ? '50px' : '100%' }}
                            containerStyle={{
                              backgroundColor: item?.disabled
                                ? grey[100]
                                : item?.inventoryItem?.color
                                  ? item?.inventoryItem?.color
                                  : infoBackground,
                            }}
                            disabled={item?.disabled}
                            flexColOnDiscount={isModal && smDown}
                          />
                        )}
                      </Grid>
                    );
                  },
                )}
              </Fragment>
            );
          })}
      </>
    );
  };

  const renderPlaceOrdeButton = useCallback(() => {
    return (
      <Box
        // sx={{ position: 'sticky', bottom: 0, width: '100%' }}
        data-tour="fifth-step"
      >
        <LoadingButton
          loading={isLoading}
          onClick={onSubmitOrder}
          fullWidth
          variant="contained"
          sx={{ mt: 2, py: 2 }}
          disabled={
            (orderedItems.length === 0 && !isPreOrder) ||
            defaultOrder?.type === TYPE.LOCKED
          }
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
          sx={{ overflowY: 'auto' }}
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
          {Object.keys(itemTypes).length > 0 &&
            Object.keys(itemTypes).map((itemType: string, index: number) => {
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
            })}
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
        <Grid
          container
          mt={2}
          maxWidth="100%"
          maxHeight="100vh"
          sx={{ overflowY: 'auto' }}
        >
          {selectedItemType === 'All' &&
            !debouncedKeywords &&
            renderAllItems(promotions, 'promotion')}

          {selectedItemType === 'All' && !debouncedKeywords
            ? renderAllItems(itemTypes)
            : renderByItemType()}

          {/* Only admin can add custom amount at order mode, neither edit mode nor pre order mode allowed to create custom amount */}
          {role === USER_ROLE.ADMIN && !isPreOrder && (
            <Grid item xs={6} sm={isModal ? 6 : 4} md={isModal ? 6 : 3}>
              <Button
                onClick={() => setIsOpenAddCustomAmount(true)}
                disabled={defaultOrder?.type === TYPE.LOCKED}
              >
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
        {/* {smDown && renderPlaceOrdeButton()} */}
      </ShadowSection>
    );
  };

  const renderMyOrder = () => {
    return (
      <ShadowSection
        display="flex"
        flexDirection="column"
        gap={1}
        // sx={{
        //   position: 'sticky',
        //   top: 0,
        //   width: '100%',
        //   // mb: isModal && smDown ? 4 : 0,
        //   overflowY: 'auto',
        //   maxHeight: '100vh',
        // }}
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
          orderedItems.map((item: IItem | any) => {
            return (
              <Box
                key={item.id}
                display="flex"
                flexDirection="column"
                // justifyContent="space-between"
                gap={1}
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
                {item?.option && (
                  <Typography sx={{ color: grey[700] }}>
                    {item.option.name}
                  </Typography>
                )}

                <Box
                  display="flex"
                  alignItems="flex-start"
                  // justifyContent="space-between"
                  flexDirection="column"
                  gap={2}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {role !== USER_ROLE.CLIENT ? (
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
                      <Typography>${item.price.toFixed(2)}</Typography>
                    )}
                    {item.isShowDiscount && item.prevPrice && (
                      <Typography
                        // fontWeight="bold"
                        sx={{ textDecoration: 'line-through' }}
                        color="error"
                      >
                        ${item.prevPrice.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    {!smDown || editItemQuantity?.id === item.id ? (
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
                          disabled={defaultOrder?.type === TYPE.LOCKED}
                        >
                          -
                        </Fab>
                        <Typography fontWeight="bold">
                          {item.quantity}
                        </Typography>
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
                          disabled={defaultOrder?.type === TYPE.LOCKED}
                        >
                          +
                        </Fab>

                        {smDown && (
                          <IconButton
                            color="primary"
                            onClick={() => setEditItemQuantity(null)}
                          >
                            <EditOffIcon />
                          </IconButton>
                        )}
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="h6">
                          Qty: <strong>{item.quantity}</strong>
                        </Typography>
                        <IconButton color="primary" disabled={defaultOrder?.type === TYPE.LOCKED}>
                          <EditIcon onClick={() => setEditItemQuantity(item)} />
                        </IconButton>
                      </Box>
                    )}

                    <Typography variant="h6">
                      Total: $
                      {((item?.quantity || 1) * item?.price)?.toFixed(2)}
                    </Typography>
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
        {!smDown && renderPlaceOrdeButton()}
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
              disabled={
                (role === USER_ROLE.CLIENT || role === USER_ROLE.DRIVER) &&
                purpose === ORDER_USAGE_PURPOSE.ITEM
              }
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
            disabled={
              role === USER_ROLE.DRIVER && purpose === ORDER_USAGE_PURPOSE.ITEM
            }
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
        {/* <SingleFieldEdit
          title={`How many ${singleFieldProps?.item?.name}?`}
          inputLabel="Quantity"
          open={singleFieldProps.open}
          handleUpdate={onAddItem}
          onClose={() => setSingleFieldProps({ open: false, defaultValue: 0 })}
          defaultValue={singleFieldProps?.defaultValue || 0}
          buttonLabel="Add"
          inputProps={{
            type: 'number',
            inputProps: {
              min: 1,
            },
          }}
        /> */}
        <SetItemQuantity
          open={singleFieldProps.open}
          onClose={() => setSingleFieldProps({ open: false, defaultValue: 0 })}
          item={singleFieldProps.item}
          onSubmit={onAddItem}
        />
        {NotificationComp}
        <Box display="flex" flexDirection="column" gap={2} width="100%">
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

          {/* <Box maxHeight="100vh" overflow="scroll"> */}
          {tabIdx === 0 && renderDisplayItems()}
          {tabIdx === 1 && renderMyOrder()}

          <Box
            pb={isModal ? 0 : 8}
            sx={{ position: 'sticky', bottom: 0, zIndex: 50 }}
          >
            {renderPlaceOrdeButton()}
          </Box>
          {/* </Box> */}
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

      {/* Custom Quantity */}
      {/* <SingleFieldEdit
        title={`How many ${singleFieldProps?.item?.name}?`}
        inputLabel="Quantity"
        open={singleFieldProps.open}
        handleUpdate={onAddItem}
        onClose={() => setSingleFieldProps({ open: false, defaultValue: 0 })}
        defaultValue={singleFieldProps.defaultValue}
        buttonLabel="Add"
        inputProps={{
          type: 'number',
          inputProps: {
            min: 1,
          },
        }}
      /> */}
      <SetItemQuantity
        open={singleFieldProps.open}
        onClose={() => setSingleFieldProps({ open: false, defaultValue: 0 })}
        item={singleFieldProps.item}
        onSubmit={onAddItem}
      />
      {NotificationComp}
      <Grid container spacing={2} width="100%">
        <Grid item xs={12} sm={7}>
          {renderDisplayItems()}
        </Grid>

        <Grid item xs={12} sm={5}>
          {renderMyOrder()}
        </Grid>
      </Grid>
    </>
  );
};

export default OrderView;
