import ModalHead from '@/app/lib/ModalHead';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Modal,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import StatusText from '../StatusText';
import { IRoutes, Item } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import { Order } from '../../orders/page';
import { UserRoute } from '@prisma/client';
import { AllPrint } from '../Printing/AllPrint';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import _ from 'lodash';
import { ManifestPrint } from '../Printing/ManifestPrint';
import { groupBy } from '@/app/utils/array';

interface PropTypes extends ModalProps {
  routes: IRoutes[];
  orderList: Order[];
}

enum BILL_PRINT_OPTION {
  NONE = 'none',
  BY_ROUTE = 'byRoute',
}

export default function BillPrintModal({
  open,
  onClose,
  routes,
  orderList,
}: PropTypes) {
  const [billPrintOption, setBillPrintOption] = useState<BILL_PRINT_OPTION>(
    BILL_PRINT_OPTION.NONE,
  );
  const [itemManifest, setItemManifest] = useState<any>({});
  const [selectedRoutes, setSelectedRoutes] = useState<IRoutes[]>([]);
  const [orderPrint, setOrderPrint] = useState<any>([]);
  const billPrint: any = useRef();
  const manifestPrint: any = useRef();

  useEffect(() => {
    if (routes.length > 0) {
      getClientRoutes();
    }
  }, [orderList, routes, selectedRoutes]);

  useEffect(() => {
    if (orderPrint.length > 0) {
      getItemsManifest();
    }
  }, [orderPrint]);

  // useEffect(() => {
  //   if (Object.keys(itemManifest).length > 0) {
  //     handlePrintManifest();
  //   }
  // }, [itemManifest])

  const handleSelectRoute = (e: any, targetRoute: IRoutes) => {
    const isRouteExisted = selectedRoutes.find((route: IRoutes) => {
      return route.id === targetRoute.id;
    });

    if (isRouteExisted) {
      const newSelectedRoutes = selectedRoutes.filter((route: IRoutes) => {
        return route.id !== targetRoute.id;
      });
      delete itemManifest[targetRoute.id];
      setSelectedRoutes(newSelectedRoutes);
    } else {
      setSelectedRoutes((prevRoutes) => [...prevRoutes, targetRoute]);
    }
  };

  const handleBillPrint = useReactToPrint({
    content: () => billPrint.current,
  });

  const handlePrintManifest = useReactToPrint({
    content: () => manifestPrint.current,
  });

  const handleSelectAll = () => {
    if (selectedRoutes.length === routes.length) {
      setItemManifest({});
      setSelectedRoutes([]);
    } else {
      setSelectedRoutes(routes);
    }
  };

  // O(n^3) need to optimize this
  const getClientRoutes = (): any => {
    const clientRoutes = orderList.map((order: Order): any => {
      // Filter user routes to get only routes related to current given list of routes
      const relatedRoutes = order.user?.routes?.filter((route: UserRoute): any => {
          const relatedRoute = selectedRoutes.find(
            (baseRoute: IRoutes) => baseRoute.id === route.routeId,
          );
          return !!relatedRoute;
        })
        .map((route: UserRoute): any => ({
          // map to attach order information
          routeId: route.routeId,
          ...order,
        }));
      return relatedRoutes;
    });
    const orderByRoutes = _.orderBy(clientRoutes.flat(), ['routeId'], ['asc']);
    setOrderPrint(orderByRoutes);
  };

  const getItemsManifest = () => {
    const items = orderPrint.map((order: Order) => {
      return order?.items.map((item: any) => {
        if (item.name.includes('BEAN')) {
          return {
            ...item,
            subCategory: order.subCategory,
            routeId: order.routeId,
          };
        } else {
          return { ...item, routeId: order.routeId };
        }
      });
    });

    // If order print is undefined
    if (!items[0]) {
      return;
    }

    // Group items by route
    const groupItemRoutes: any = groupBy(
      items.flat(),
      ({ routeId }: any) => routeId,
    );

    for (const itemRoute in groupItemRoutes) {
      const manifestItem = groupItemRoutes[itemRoute].reduce(
        (acc: any, item: Item) => {
          const { name, subCategory } = item;

          let itemKey = name;
          if (subCategory) {
            itemKey = `${name}-${subCategory.name}`;
          }

          if (!acc[itemKey]) {
            acc[itemKey] = 0;
          }

          acc[itemKey] = acc[itemKey] + item.quantity;
          return acc;
        },
        {},
      );

      setItemManifest((prevManifest: any) => ({
        ...prevManifest,
        [itemRoute]: manifestItem,
      }));
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <div style={{ display: 'none' }}>
          <AllPrint
            orders={
              billPrintOption === BILL_PRINT_OPTION.NONE
                ? orderList
                : orderPrint
            }
            ref={billPrint}
          />
        </div>
        <div style={{ display: 'none' }}>
          <ManifestPrint
            manifest={itemManifest}
            routes={routes}
            ref={manifestPrint}
          />
        </div>
        <ModalHead
          heading="Print Bill"
          buttonLabel="Print"
          onClick={handleBillPrint}
          buttonProps={{}}
        />
        <RadioGroup
          row
          value={billPrintOption}
          onChange={(e) =>
            setBillPrintOption(e.target.value as BILL_PRINT_OPTION)
          }
        >
          <FormControlLabel
            value={BILL_PRINT_OPTION.NONE}
            control={<Radio />}
            label="Print by id"
          />
          <FormControlLabel
            value={BILL_PRINT_OPTION.BY_ROUTE}
            control={<Radio />}
            label="Print by route"
          />
        </RadioGroup>
        <Divider />
        <Box display="flex" justifyContent="right">
          <Button
            onClick={handlePrintManifest}
            disabled={
              billPrintOption === BILL_PRINT_OPTION.NONE ||
              selectedRoutes.length === 0
            }
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              <PrintIcon />
              <Typography>Manifest</Typography>
            </Box>
          </Button>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="center">
          {billPrintOption === BILL_PRINT_OPTION.NONE ? (
            <StatusText type="info" text="HIT the button to print bill" />
          ) : billPrintOption === BILL_PRINT_OPTION.BY_ROUTE ? (
            <FormGroup>
              {routes && routes.length > 0 ? (
                <>
                  <FormControlLabel
                    label="All"
                    control={
                      <Checkbox
                        checked={selectedRoutes.length === routes.length}
                        onChange={handleSelectAll}
                      />
                    }
                  />
                  <Box display="flex" flexDirection="column" ml={3}>
                    {routes.map((route: IRoutes) => {
                      const isChecked = selectedRoutes.some(
                        (baseRoute: IRoutes) => route.id === baseRoute.id,
                      );
                      return (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={(e: any) => handleSelectRoute(e, route)}
                            />
                          }
                          label={`${route.name} - ${route?.driver?.name}`}
                        />
                      );
                    })}
                  </Box>
                </>
              ) : (
                <ErrorComponent errorText="No Routes Found" />
              )}
            </FormGroup>
          ) : (
            ''
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
