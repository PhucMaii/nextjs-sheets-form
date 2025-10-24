import React, { useMemo } from 'react';
import { Grid, Typography, Divider } from '@mui/material';
import { ICreditItem, IItem, UserType } from '@/app/utils/type';
import {
  BorderSection,
  ShadowSection,
} from '@/app/admin/[companyId]/reports/styled';
import { Box } from '@mui/material';
import { primary } from '@/theme/color';
import DisplayFile from '../Modals/DisplayFile';
import { grey } from '@mui/material/colors';
import ErrorComponent from '../ErrorComponent';

interface IProps {
  selectedClient: UserType;
  creditItems: ICreditItem[];
  renderOrderSearch?: () => React.ReactNode;
  selectedOrder: any;
  isDisabledSearch?: boolean;
}

export default function OrderSelection({
  selectedClient,
  creditItems,
  renderOrderSearch,
  selectedOrder,
  isDisabledSearch = false,
}: IProps) {
  const totalQuantity = useMemo(
    () =>
      selectedOrder?.items?.reduce(
        (acc: number, item: IItem) => acc + (item.quantity || 0),
        0,
      ),
    [selectedOrder],
  );

  const orderViewItems = useMemo(() => {
    const orderedItems = selectedOrder?.items?.filter((item: IItem | any) => {
      return !creditItems.some(
        (creditItem: ICreditItem | any) => creditItem.orderedItemId === item.id,
      );
    });
    return [...(orderedItems || []), ...(creditItems || [])];
  }, [selectedOrder, creditItems]);

  const orderDiscount = useMemo(
    () =>
      orderViewItems.reduce((acc: number, item: IItem | any) => {
        if (item?.orderedItem?.prevPrice || item.prevPrice > 0) {
          return (
            acc +
            ((item?.orderedItem?.prevPrice || item.prevPrice) - item.price) *
              item.quantity
          );
        }
        return acc;
      }, 0),
    [orderViewItems],
  );

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
                -${Math.abs(orderDiscount)?.toFixed(2)}
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
            $
            {selectedOrder?.subTotal?.toFixed(2) ||
              selectedOrder?.totalPrice?.toFixed(2) ||
              0}
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
            ${selectedOrder?.GST?.toFixed(2) || 0}
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
            ${selectedOrder?.PST?.toFixed(2) || 0}
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
            ${selectedOrder?.totalPrice?.toFixed(2)}
          </Typography>
        </Grid>
        {/* <Grid item xs={12}> */}
        {/* </Grid> */}
      </Grid>
    );
  };

  const renderOrderView = () => {
    return (
      <ShadowSection display="flex" flexDirection="column" gap={1}>
        {/* Only admin can affect inventory for an order in edit mode */}
        <Typography variant="h6" textAlign="center">
          {selectedClient?.clientName || 'N/A'}&apos;s Order
        </Typography>
        {isDisabledSearch && (
          <Typography variant="caption" textAlign="center">
            Order ID: {selectedOrder?.id} - {selectedOrder?.deliveryDate}
          </Typography>
        )}

        {orderViewItems.length > 0 ? (
          orderViewItems.map((item: IItem | any) => {
            return (
              <Box
                key={item.id}
                display="flex"
                flexDirection="column"
                gap={1}
                sx={{
                  p: 1,
                  backgroundColor: primary.lightest,
                  borderRadius: 1,
                }}
              >
                <DisplayFile
                  fileKey={item?.image || item?.inventoryItem?.image}
                  width="100px"
                  height="100px"
                />
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  justifyContent="space-between"
                >
                  <Typography fontWeight="bold">
                    {item.name || item.orderedItem?.name}
                  </Typography>
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
                    <Typography>${item?.price?.toFixed(2) || 0.0}</Typography>
                    {(item?.option?.isShowDiscount ||
                      item.isShowDiscount ||
                      item?.orderedItem?.isShowDiscount) &&
                      (item?.option?.prevPrice > 0 ||
                        item.prevPrice > 0 ||
                        item?.orderedItem?.prevPrice > 0) && (
                        <Typography
                          // fontWeight="bold"
                          sx={{ textDecoration: 'line-through' }}
                          color="error"
                        >
                          $
                          {item?.option?.prevPrice?.toFixed(2) ||
                            item?.prevPrice?.toFixed(2) ||
                            item?.orderedItem?.prevPrice?.toFixed(2)}
                        </Typography>
                      )}
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">
                        Qty: <strong>{item.quantity}</strong>
                      </Typography>
                    </Box>

                    <Typography variant="h6">
                      Total: $
                      {(
                        (item?.quantity || 1) *
                        (item?.price || item?.orderedItem?.price)
                      )?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })
        ) : (
          <ErrorComponent errorText="Your order is empty" />
        )}

        {renderTotal()}
      </ShadowSection>
    );
  };
  return (
    <BorderSection display="flex" flexDirection="column" gap={1}>
      {!isDisabledSearch && renderOrderSearch && renderOrderSearch()}
      {selectedOrder && renderOrderView()}
    </BorderSection>
  );
}
