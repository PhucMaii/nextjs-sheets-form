import ModalHead from '@/app/lib/ModalHead';
import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import StatusText from '../StatusText';
import { IRoutes } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import { Order } from '../../orders/page';
import { MemoizedAllPrint } from '../Printing/AllPrint';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import { ManifestPrint } from '../Printing/ManifestPrint';
import useManifest from '@/hooks/useManifest';
import { NewManifestPrint } from '../Printing/NewManifestPrint';
import { SummaryManifest } from '../Printing/SummaryManifest';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DropdownItemContainer } from '../../orders/styled';
import ArticleIcon from '@mui/icons-material/Article';

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

const BillPrintModal = ({
  open,
  onClose,
  routes,
  orderList,
  day,
  showNotification,
}: PropTypes) => {
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
  const newManifestPrint: any = useRef();
  const summaryManifest: any = useRef();
  const {
    orderPrint,
    itemManifest,
    setItemManifest,
    nonVoidOrders,
    isLoading,
    manifestData,
  } = useManifest(orderList, selectedRoutes, day, showNotification);

  const routesLength = useMemo(() => {
    if (manifestData.itemManifest['-1'] && manifestData.itemManifest['-2']) {
      return routes.length + 2;
    } else if (
      manifestData.itemManifest['-1'] ||
      manifestData.itemManifest['-2']
    ) {
      return routes.length + 1;
    } else {
      return routes.length;
    }
  }, [routes, manifestData]);

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

  const handleAddNoteToManifest = (note: string, routeId: string) => {
    const newManifest = { ...itemManifest };
    const targetRouteManifest = newManifest[routeId];
    if (targetRouteManifest) {
      targetRouteManifest.notes = [...targetRouteManifest.notes, note];
    }
    setItemManifest(newManifest);
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

  const handleNewManifestPrint = useReactToPrint({
    content: () => newManifestPrint.current,
  });

  const handleSelectAll = () => {
    if (selectedRoutes.length === routesLength) {
      setItemManifest({});
      setSelectedRoutes([]);
    } else {
      const newSelectRoutes: any = [...routes];
      if (manifestData.itemManifest['-1']) {
        newSelectRoutes.push({ id: '-1', name: 'No Route Orders' });
      }

      if (manifestData.itemManifest['-2']) {
        newSelectRoutes.push({ id: '-2', name: 'All Summary' });
      }

      setSelectedRoutes(newSelectRoutes);
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
        <MenuItem onClick={handleNewManifestPrint}>
          <DropdownItemContainer display="flex" gap={2}>
            <Typography>Details (New)</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <div style={{ display: 'none' }}>
          <MemoizedAllPrint
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
          <NewManifestPrint
            manifest={itemManifest}
            routes={routes}
            currentDate={day}
            ref={newManifestPrint}
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
                        checked={selectedRoutes.length === routesLength}
                        onChange={handleSelectAll}
                      />
                    }
                  />
                  <Box display="flex" flexDirection="column" ml={3}>
                    {Object.keys(manifestData.itemManifest).includes('-2') &&
                      manifestData.itemManifest[-2] && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedRoutes.some(
                                (baseRoute: IRoutes) =>
                                  manifestData.itemManifest['-2'].route.id ===
                                  baseRoute.id,
                              )}
                              onChange={(e: any) =>
                                handleSelectRoute(
                                  e,
                                  manifestData.itemManifest['-2'].route,
                                )
                              }
                            />
                          }
                          label={manifestData.itemManifest['-2'].route.name}
                        />
                      )}
                    {routes.map((route: IRoutes) => {
                      if (route.id == -1) return null;
                      const isChecked = selectedRoutes.some(
                        (baseRoute: IRoutes) => route.id === baseRoute.id,
                      );
                      return (
                        <Box key={route.id}>

                        <FormControlLabel
                          key={route.id}
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={(e: any) => handleSelectRoute(e, route)}
                            />
                          }
                          label={`${route.name} - ${route?.employee?.name}`}
                        />

                        <IconButton onClick={() => handleAddNoteToManifest(route.id)}>
                          <ArticleIcon />
                        </IconButton>
                        </Box>
                      );
                    })}

                    {Object.keys(manifestData.itemManifest).includes('-1') &&
                      manifestData.itemManifest[-1] && (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedRoutes.some(
                                (baseRoute: IRoutes) =>
                                  manifestData.itemManifest['-1'].route.id ===
                                  baseRoute.id,
                              )}
                              onChange={(e: any) =>
                                handleSelectRoute(
                                  e,
                                  manifestData.itemManifest['-1'].route,
                                )
                              }
                            />
                          }
                          label={manifestData.itemManifest['-1'].route.name}
                        />
                      )}
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
};

export default memo(BillPrintModal, (prev: PropTypes, next: PropTypes) => {
  return (
    Object.is(prev.orderList, next.orderList) &&
    Object.is(prev.routes, next.routes) &&
    prev.day === next.day &&
    prev.open === next.open
  );
});
