import ModalHead from '@/app/lib/ModalHead';
import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Menu,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
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
import { SummaryManifest } from '../Printing/SummaryManifest';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DropdownItemContainer } from '../../orders/styled';

interface PropTypes extends ModalProps {
  routes: IRoutes[];
  orderList: Order[];
  day: string;
  showNotification: (type: AlertColor, message: string) => void;
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
  day,
  showNotification,
}: PropTypes) {
  const [manifestAnchor, setManifestAnchor] = useState<HTMLElement | null>(
    null,
  );
  const openManifest = Boolean(manifestAnchor);
  const [billPrintOption, setBillPrintOption] = useState<BILL_PRINT_OPTION>(
    BILL_PRINT_OPTION.NONE,
  );
  const [selectedRoutes, setSelectedRoutes] = useState<IRoutes[]>([]);
  const billPrint: any = useRef();
  const manifestPrint: any = useRef();
  const summaryManifest: any = useRef();
  const {
    orderPrint,
    itemManifest,
    setItemManifest,
    nonVoidOrders,
    isLoading,
  } = useManifest(orderList, selectedRoutes, day, showNotification);

  useEffect(() => {
    setSelectedRoutes([]);
  }, [day]);

  const handleCloseAnchor = () => {
    setManifestAnchor(null);
  };

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

  const handlePrintManifestDetails = useReactToPrint({
    content: () => manifestPrint.current,
  });

  const handlePrintManifestSummary = useReactToPrint({
    content: () => summaryManifest.current,
  });

  const handleSelectAll = () => {
    if (selectedRoutes.length === routes.length) {
      setItemManifest({});
      setSelectedRoutes([]);
    } else {
      setSelectedRoutes(routes);
    }
  };

  const manifestPrintButton = (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      gap={2}
      width="100%"
    >
      <Button
        aria-controls={openManifest ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openManifest ? 'true' : undefined}
        disabled={selectedRoutes.length === 0 || isLoading}
        onClick={(e) => setManifestAnchor(e.currentTarget)}
        endIcon={<ArrowDownwardIcon />}
        variant="outlined"
      >
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <PrintIcon />
          <Typography>Manifest</Typography>
        </Box>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={manifestAnchor}
        open={openManifest}
        onClose={handleCloseAnchor}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handlePrintManifestSummary}>
          <DropdownItemContainer display="flex" gap={2}>
            <Typography>Summary</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem onClick={handlePrintManifestDetails}>
          <DropdownItemContainer display="flex" gap={2}>
            <Typography>Details</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

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
            currentDate={day}
            ref={manifestPrint}
          />
        </div>
        <div style={{ display: 'none' }}>
          <SummaryManifest
            manifest={itemManifest}
            routes={routes}
            ref={summaryManifest}
            currentDate={day}
          />
        </div>
        <ModalHead
          heading="Print Bill"
          buttonLabel="Print"
          onClick={handleBillPrint}
          buttonProps={{ disabled: isLoading }}
          onClose={onClose}
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
          {/* <Button
            onClick={handlePrintManifestDetails}
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
          </Button> */}
          {manifestPrintButton}
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
