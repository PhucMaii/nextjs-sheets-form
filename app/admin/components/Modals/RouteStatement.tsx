import {
  Box,
  Button,
  Checkbox,
  Divider,
  Modal,
  Typography,
} from '@mui/material';
import React, {
  Fragment,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import SelectDateRange from '../Select/SelectDateRange';
import { days } from '@/app/lib/constant';
import { grey } from '@mui/material/colors';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { MultipleInvoicePrint } from '../Printing/MultipleInvoicePrint';
import { useReactToPrint } from 'react-to-print';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import useLocalStorage from '@/hooks/useLocalStorage';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

interface IProps extends ModalProps {
  currentDateRange: any;
}

const RouteStatement = ({ open, onClose, currentDateRange }: IProps) => {
  const [clientOrders, setClientOrders] = useState<any>([]);
  const [selectedClientStatement, setSelectedClientStatement] = useState<any>(
    [],
  );
  const [dateRange, setDateRange] = useState<any>(currentDateRange);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const today = new Date();
    return days[today.getDay()];
  });
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
  const routeInvoicePrintRef: any = useRef();

  const [clientAlreadyPrintList, setClientAlreadyPrintList] = useLocalStorage(
    'clientAlreadyPrintList',
    [],
  );

  console.log('ROUTE STATEMENT RE RENDER', dateRange);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [routes, _mutate, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/routes?day=${selectedDay}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  const allClientChecked = useMemo(() => {
    const clientAlreadyPrint = clientOrders.filter((client: any) =>
      clientAlreadyPrintList.includes(client.client.id),
    );

    return (
      selectedClientStatement.length ===
      clientOrders.length - clientAlreadyPrint.length
    );
  }, [selectedClientStatement, clientOrders, clientAlreadyPrintList]);

  useEffect(() => {
    if (currentDateRange) {
      setDateRange(currentDateRange);
    }
  }, [currentDateRange]);

  useEffect(() => {
    if (!routes && isValidating) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }

    if (routes) {
      initializeClientOrders();
    }

    setSelectedClientStatement([]);
  }, [routes, selectedRouteIds]);

  // useEffect(() => {
  // }, [routes]);

  const initializeClientOrders = () => {
    if (!routes) {
      return;
    }

    const formattedClientOrders = routes?.data?.flatMap((route: any) => {
      if (!selectedRouteIds.includes(route.id)) {
        return [];
      }
      const userOrders = route.clients.map((client: any) => {
        return {
          client: client.user,
          orders: client.user.Orders,
          route: route,
        };
      });

      return userOrders;
    });

    setClientOrders(formattedClientOrders);

    setSelectedClientStatement(
      formattedClientOrders.filter(
        (client: any) => !clientAlreadyPrintList.includes(client.client.id),
      ),
    );
  };

  const handlePrintInvoices = useReactToPrint({
    content: () => routeInvoicePrintRef.current,
  });

  const handleSelectRoute = (routeId: number) => {
    if (selectedRouteIds.includes(routeId)) {
      setSelectedRouteIds(
        selectedRouteIds.filter((id: number) => id !== routeId),
      );
    } else {
      setSelectedRouteIds([...selectedRouteIds, routeId]);
    }
  };

  const handleSelectClient = (e: any, client: any) => {
    e.preventDefault();
    if (e.target.checked) {
      setSelectedClientStatement([...selectedClientStatement, client]);
    } else {
      setSelectedClientStatement(
        selectedClientStatement.filter(
          (order: any) => order?.client?.id !== client?.client?.id,
        ),
      );
    }
  };

  const handleSelectAllClient = () => {
    if (allClientChecked) {
      setSelectedClientStatement([]);
    } else {
      setSelectedClientStatement(
        clientOrders.filter(
          (client: any) => !clientAlreadyPrintList.includes(client.client.id),
        ),
      );
    }
  };

  return (
    <>
      <div style={{ display: 'none' }}>
        <MultipleInvoicePrint
          clientOrders={selectedClientStatement}
          endDate={dateRange[1]}
          ref={routeInvoicePrintRef}
        />
      </div>
      <Modal open={open} onClose={onClose}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          maxHeight="80vh"
          overflow="scroll"
        >
          <ModalHead
            heading="Route Statement"
            buttonLabel="PRINT"
            onClick={() => {
              handlePrintInvoices();
              // Push selected clients just printed to local storage
              const clientAlreadyPrint = [
                ...clientAlreadyPrintList,
                ...selectedClientStatement.map(
                  (client: any) => client.client.id,
                ),
              ];
              setClientAlreadyPrintList(clientAlreadyPrint);
              setSelectedClientStatement([]);
            }}
            buttonProps={{}}
            onClose={onClose}
            // onlyHeading
          />

          <Divider />

          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
          >
            <Typography fontWeight="bold" variant="h6">
              Statement Date Range:
            </Typography>
            <SelectDateRange
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={2}
            justifyContent="center"
            width="100%"
            my={2}
            sx={{ backgroundColor: grey[100], borderRadius: 2, p: 1 }}
          >
            {days.map((day: string, index: number) => {
              return (
                <Button
                  sx={{
                    backgroundColor:
                      selectedDay === day ? 'primary.lightest' : '',
                    color: selectedDay === day ? 'primary.main' : 'grey',
                  }}
                  onClick={() => setSelectedDay(day)}
                  key={index}
                >
                  <Typography fontWeight="bold">{day.slice(0, 3)}</Typography>
                </Button>
              );
            })}
          </Box>

          {isLoading ? (
            <LoadingComponent />
          ) : (
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              alignItems="center"
              justifyContent="center"
            >
              {routes &&
                routes?.data?.map((route: any, index: number) => {
                  return (
                    <Box display="flex" alignItems="center" gap={1} key={index}>
                      <Checkbox
                        checked={selectedRouteIds.includes(route.id)}
                        onChange={() => handleSelectRoute(route.id)}
                      />
                      <Typography>
                        {route.name} - {route.driver.name}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center">
                <Checkbox
                  disabled={clientOrders?.length === 0}
                  checked={allClientChecked}
                  onChange={handleSelectAllClient}
                />
                <Typography variant="subtitle1">All</Typography>
              </Box>
              <Button>
                <Box display="flex" gap={1} alignItems="center">
                  <CleaningServicesIcon />
                  <Typography
                    sx={{ fontWeight: 'bold' }}
                    onClick={() => setClientAlreadyPrintList([])}
                  >
                    Clear Memory
                  </Typography>
                </Box>
              </Button>
            </Box>
            {clientOrders &&
              clientOrders.map((clientOrder: any, index: number) => {
                return (
                  <Fragment key={index}>
                    {clientOrder.route.id !==
                    clientOrders[index - 1]?.route?.id ? (
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        {clientOrder?.route?.name} -{' '}
                        {clientOrder?.route?.driver?.name}
                      </Typography>
                    ) : null}
                    <Box display="flex" alignItems="center" gap={1}>
                      <Checkbox
                        disabled={clientAlreadyPrintList?.includes(
                          clientOrder.client.id,
                        )}
                        checked={selectedClientStatement.some(
                          (order: any) =>
                            order.client.id === clientOrder.client.id,
                        )}
                        onChange={(e) => handleSelectClient(e, clientOrder)}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: clientAlreadyPrintList?.includes(
                            clientOrder.client.id,
                          )
                            ? grey[500]
                            : 'black',
                        }}
                      >
                        {clientOrder.client.clientName}
                      </Typography>
                    </Box>
                    <Divider />
                  </Fragment>
                );
              })}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(RouteStatement, (prev: IProps, next: IProps) => {
  return (
    Object.is(prev.currentDateRange, next.currentDateRange) &&
    prev.open === next.open
  );
});
