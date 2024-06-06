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
import React, { useRef, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import StatusText from '../StatusText';
import { IRoutes } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import { Order } from '../../orders/page';
import { AllPrint } from '../Printing/AllPrint';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { ManifestPrint } from '../Printing/ManifestPrint';
import useManifest from '@/hooks/useManifest';

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
  const billPrint: any = useRef();
  const manifestPrint: any = useRef();
  const { orderPrint, itemManifest, setItemManifest, nonVoidOrders } =
    useManifest(orderList, routes, selectedRoutes);

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

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <div style={{ display: 'none' }}>
          <AllPrint
            orders={
              billPrintOption === BILL_PRINT_OPTION.NONE
                ? nonVoidOrders
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
            color="info"
            variant="outlined"
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
                          key={route.id}
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
