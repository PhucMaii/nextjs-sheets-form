import ModalHead from '@/app/lib/ModalHead'
import { Box, Checkbox, FormControlLabel, FormGroup, Modal, Radio, RadioGroup } from '@mui/material'
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import StatusText from '../StatusText';
import { IRoutes } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import { Order } from '../../orders/page';
import { UserRoute } from '@prisma/client';

interface PropTypes extends ModalProps {
    routes: IRoutes[];
    orderList: Order[];
}

enum BILL_PRINT_OPTION {
    NONE="none",
    BY_ROUTE="byRoute"
}

export default function BillPrintModal({
    open,
    onClose,
    routes,
    orderList
}: PropTypes) {
    const [billPrintOption, setBillPrintOption] = useState<BILL_PRINT_OPTION>(BILL_PRINT_OPTION.NONE);
    const [selectedRoutes, setSelectedRoutes] = useState<IRoutes[]>([]);

    useEffect(() => {
        getClientRoutes();
    }, [])

    const handleSelectRoute = (e: any, targetRoute: IRoutes) => {
        const isRouteExisted = selectedRoutes.find((route: IRoutes) => {
            return route.id === targetRoute.id
        });

        if (isRouteExisted) {
            const newSelectedRoutes = selectedRoutes.filter((route: IRoutes) => {
                return route.id !== targetRoute.id
            });
            setSelectedRoutes(newSelectedRoutes);
        } else {
            setSelectedRoutes(prevRoutes => [...prevRoutes, targetRoute]);
        }
    }

    // O(n^3) need to optimize this
    const getClientRoutes = () => {
        const clientRoutes = orderList.map((order: Order) => {
            // Filter user routes to get only routes related to current given list of routes
            const relatedRoutes = order.user.routes.filter((route: UserRoute) => {
                const relatedRoute = routes.find((baseRoute: IRoutes) => baseRoute.id === route.routeId);
                if (relatedRoute) {
                    return {orderId: order.id, routes: relatedRoute.id}
                } else {
                    return {orderId: order.id, routes: null}
                }
            })
            return relatedRoutes;
        })
        console.log({clientRoutes, routes}, 'client routes');
        return clientRoutes;
    }

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <ModalHead
          heading="Print Bill"
          buttonLabel="Print"
          onClick={() => {}}
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
          {
            billPrintOption === BILL_PRINT_OPTION.NONE ? (
                <StatusText type="info" text="HIT the button to print bill" />
            ) : billPrintOption === BILL_PRINT_OPTION.BY_ROUTE ? (
                <FormGroup>
                {/* <FormControlLabel control={<Checkbox />} label="Label" />
                <FormControlLabel control={<Checkbox />} label="Required" />
                <FormControlLabel control={<Checkbox />} label="Disabled" /> */}
                {
                    routes && routes.length > 0 ? routes.map((route: IRoutes) => {
                        const isChecked = selectedRoutes.some((baseRoute: IRoutes) => route.id === baseRoute.id);
                        return (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={(e: any) =>
                                  handleSelectRoute(e, route)
                                }
                              />
                            }
                            label={`${route.name} - ${route?.driver?.name}`}
                          />
                        );
                    }) : (
                        <ErrorComponent errorText='No Routes Found' />
                    )
                }
              </FormGroup>
            ) : ''
          }
        </Box>
      </BoxModal>
    </Modal>
  );
}
