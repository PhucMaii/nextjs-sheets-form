/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import {
  AlertColor,
  Autocomplete,
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
} from '@mui/material';
import { BoxModal } from '../styled';
import { IItem, UserType } from '@/app/utils/type';
import axios from 'axios';
import {
  API_URL,
  FLAG_ORDER_TYPE,
  USER_CATEGORIZED,
  USER_ROLE,
  getAdminApiUrl,
} from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent';
import { generateRecommendDate } from '@/app/utils/time';
import OrderOnVacationModal from '../OrderOnVacationModal';
import ModalHead from '@/app/lib/ModalHead';
import ConfirmModal from '../ConfirmModal';
import AddCustomAmount from './AddCustomAmount';
import { SWRFetchData } from '@/app/utils/db';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { useParams } from 'next/navigation';

interface PropTypes extends ModalProps {
  clientList: UserType[];
  showNotification: (type: AlertColor, message: string) => void;
  currentDate?: string;
  createScheduledOrder?: (userId: number, items: IItem[]) => Promise<void>;
}

export default function AddOrder({
  open,
  onClose,
  clientList,
  showNotification,
  currentDate,
  createScheduledOrder,
}: PropTypes) {
  const { companyId }: any = useParams();
  const [cachedOrder, setCachedOrder] = useState<any | null>(null);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    currentDate || generateRecommendDate(),
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isOrderOnVacationOpen, setIsOrderOnVacationOpen] =
    useState<boolean>(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false);
  const [isOpenAddCustomAmount, setIsOpenAddCustomAmount] =
    useState<boolean>(false);

  const [baseItems, setBaseItems] = useState<IItem[]>([]);

  const [clientItems, _mutate, isValidating] = SWRFetchData(
    clientValue
      ? `${getAdminApiUrl(companyId, '/clients')}/items?categoryId=${clientValue?.categoryId}`
      : '',
  );

  useEffect(() => {
    if (!clientItems && isValidating) {
      setIsFetching(true);
      setBaseItems([]);
    } else {
      setIsFetching(false);
      initializeItems();
    }
  }, [clientItems, clientValue]);

  useEffect(() => {
    if (currentDate) {
      setDeliveryDate(currentDate);
    }
  }, [currentDate]);

  const addOrder = async (
    order: Order,
    isCheckUnavailableRange: boolean = true,
    isForceOrder: boolean = false,
  ) => {
    if (!order.items || order.items.length === 0) {
      showNotification('error', 'Please select at least one item');
      return;
    }
    try {
      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate: order.deliveryDate,
        note: order.note,
        isCheckUnavailableRange,
        items: order.items,
        createdBy: USER_ROLE.ADMIN,
        isForceOrder,
      };

      const response = await axios.post(
        `${API_URL.IMPORT_SHEETS}?userId=${clientValue?.id}`,
        submittedData,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (response.data.warning) {
        if (response.data.flag === FLAG_ORDER_TYPE.ALREADY_ORDER) {
          // showNotification('warning', response.data.warning);
          setCachedOrder(submittedData);
          setIsOpenConfirmModal(true);
          return;
        } else if (response.data.flag === FLAG_ORDER_TYPE.VACATION_ORDER) {
          setCachedOrder({
            ...submittedData,
            startDate: response.data.data.unavailableRange[0],
            endDate: response.data.data.unavailableRange[1],
          });
          setIsOrderOnVacationOpen(true);
          return;
        } else {
          return response;
        }
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log(error);
      showNotification(
        'error',
        'Fail to create order: ' + error.response.data.error,
      );
      return;
    }
  };

  const handleCreateScheduledOrder = async (order: Order) => {
    if (!createScheduledOrder) {
      return;
    }

    if (!clientValue) {
      showNotification('error', 'Please select a client');
      return;
    }

    try {
      await createScheduledOrder(clientValue?.id, order.items);
    } catch (error: any) {
      console.log('There was an error: ', error);
    }
  };

  const initializeItems = () => {
    if (clientItems) {
      const quantitySetUp = clientItems.data.map((item: IItem) => {
        return {
          ...item,
          quantity: 0,
          totalPrice: 0,
        };
      });
      console.log(quantitySetUp, 'QUANTITY SET UP');

      setBaseItems(quantitySetUp);
    }
  };

  return (
    <>
      <AddCustomAmount
        open={isOpenAddCustomAmount}
        onClose={() => setIsOpenAddCustomAmount(false)}
        setItemList={setBaseItems}
        showNotification={showNotification}
      />
      <ConfirmModal
        open={isOpenConfirmModal}
        onClose={() => setIsOpenConfirmModal(false)}
        handleSubmit={async () => {
          await addOrder(cachedOrder, true, true);
          onClose();
        }}
        title="This client already order for selected date, are you sure to create new order?"
        showNotification={showNotification}
      />
      {isOrderOnVacationOpen && (
        <OrderOnVacationModal
          open={isOrderOnVacationOpen}
          onClose={() => setIsOrderOnVacationOpen(false)}
          clientName={clientValue?.clientName || ''}
          startDate={new Date(cachedOrder.startDate)}
          endDate={new Date(cachedOrder.endDate)}
          handleContinueOrder={async () =>
            await addOrder(cachedOrder, false, true)
          }
        />
      )}
      <Modal open={open} onClose={onClose}>
        <BoxModal
          style={{ padding: 0, margin: 0 }}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModalHead
            heading="Add Order"
            buttonLabel="Add"
            buttonProps={{}}
            onClick={() => {}}
            onlyHeading
            onClose={onClose}
            containerStyle={{ margin: '20px' }}
          />
          <Divider />
          <Box overflow="auto" maxHeight="70vh">
            <Grid
              container
              alignItems="center"
              columnSpacing={2}
              rowGap={2}
              mt={2}
              // style={{ margin: '20px' }}
              sx={{ p: '20px' }}
            >
              <Grid item xs={12}>
                Client Name
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  fullWidth
                  options={clientList as UserType[]}
                  getOptionLabel={(option) =>
                    `${option.clientName} - ${option.clientId}`
                  }
                  getOptionDisabled={(client: UserType) => {
                    return client?.type === USER_CATEGORIZED.INACTIVE;
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Client" />
                  )}
                  value={clientValue}
                  onChange={(e, newValue) => {
                    e.stopPropagation();
                    setClientValue(newValue);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider textAlign="center">Items</Divider>
              </Grid>
              {isFetching ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ width: '100%' }}
                >
                  <LoadingComponent />
                </Box>
              ) : baseItems.length === 0 ? (
                <ErrorComponent errorText="User Has No Items" />
              ) : (
                <OrderView
                  items={baseItems}
                  purpose={ORDER_USAGE_PURPOSE.ORDER}
                  isModal
                  onSubmit={async (order: Order) => {
                    if (createScheduledOrder) {
                      await handleCreateScheduledOrder(order);
                    } else {
                      await addOrder(order);
                    }
                  }}
                  isPreOrder={createScheduledOrder !== undefined}
                  defaultDeliveryDate={deliveryDate}
                  clientName={clientValue?.clientName}
                  role={USER_ROLE.ADMIN}
                />
              )}
            </Grid>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
