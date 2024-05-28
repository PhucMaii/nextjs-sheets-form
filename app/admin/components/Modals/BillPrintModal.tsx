import ModalHead from '@/app/lib/ModalHead';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Modal,
  Radio,
  RadioGroup,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import StatusText from '../StatusText';
import { IRoutes } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import { Order } from '../../orders/page';
import { UserRoute } from '@prisma/client';
import { AllPrint } from '../Printing/AllPrint';
import { useReactToPrint } from 'react-to-print';
import _ from 'lodash';

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
  const [selectedRoutes, setSelectedRoutes] = useState<IRoutes[]>([]);
  const [orderPrint, setOrderPrint] = useState<any>([]);
  const billPrint: any = useRef();

  useEffect(() => {
    if (routes) {
      getClientRoutes();
    }
  }, [orderList, routes, selectedRoutes]);

  const handleSelectRoute = (e: any, targetRoute: IRoutes) => {
    const isRouteExisted = selectedRoutes.find((route: IRoutes) => {
      return route.id === targetRoute.id;
    });

    if (isRouteExisted) {
      const newSelectedRoutes = selectedRoutes.filter((route: IRoutes) => {
        return route.id !== targetRoute.id;
      });
      setSelectedRoutes(newSelectedRoutes);
    } else {
      setSelectedRoutes((prevRoutes) => [...prevRoutes, targetRoute]);
    }
  };

  const handleBillPrint = useReactToPrint({
    content: () => billPrint.current,
  });

  const handleSelectAll = () => {
    if (selectedRoutes.length === routes.length) {
      setSelectedRoutes([]);
    } else {
      setSelectedRoutes(routes);
    }
  };

  // O(n^3) need to optimize this
  const getClientRoutes = (): any => {
    const clientRoutes = orderList.map((order: Order): any => {
      // Filter user routes to get only routes related to current given list of routes
      const relatedRoutes = order.user.routes
        .filter((route: UserRoute): any => {
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
