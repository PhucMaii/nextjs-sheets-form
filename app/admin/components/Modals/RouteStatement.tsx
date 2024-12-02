import { Box, Button, Checkbox, Divider, Modal, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import SelectDateRange from '../SelectDateRange';
import { days } from '@/app/lib/constant';
import { grey } from '@mui/material/colors';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { MultipleInvoicePrint } from '../Printing/MultipleInvoicePrint';
import { useReactToPrint } from 'react-to-print';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';

interface IProps extends ModalProps {
    currentDateRange: any;
}

export default function RouteStatement({open, onClose, currentDateRange}: IProps) {
    const [clientOrders, setClientOrders] = useState<any>([]);
    const [dateRange, setDateRange] = useState<any>(currentDateRange);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedDay, setSelectedDay] = useState<string>(() => {
        const today = new Date();
        return days[today.getDay()];
    });
    const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
    const routeInvoicePrintRef: any = useRef();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [routes, _mutate, isValidating] = SWRFetchData(`${API_URL.ADMIN}/routes?day=${selectedDay}&startDate=${dateRange[0]}&endDate=${dateRange[1]}`);
  
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
    }, [routes, selectedRouteIds]);

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
                }
            });

            return userOrders;   
        });

        setClientOrders(formattedClientOrders);
    }

    const handlePrintInvoices = useReactToPrint({
        content: () => routeInvoicePrintRef.current,
      });


    const handleSelectRoute = (routeId: number) => {
        if (selectedRouteIds.includes(routeId)) {
            setSelectedRouteIds(selectedRouteIds.filter((id: number) => id !== routeId));
        } else {
            setSelectedRouteIds([...selectedRouteIds, routeId]);
        }
    }

  return (
    <>
    <div style={{display: 'none'}}>
        <MultipleInvoicePrint clientOrders={clientOrders} endDate={dateRange[1]} ref={routeInvoicePrintRef} />
    </div>
    <Modal open={open} onClose={onClose}>
        <BoxModal display="flex" flexDirection="column" gap={2} maxHeight="80vh" overflow="scroll">
            <ModalHead 
                heading="Route Statement"
                buttonLabel='PRINT'
                onClick={handlePrintInvoices}
                buttonProps={{}}
                onClose={onClose}
                // onlyHeading
            />

            <Divider />

            <Box display="flex" alignItems="center" justifyContent="flex-end">
                <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
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
            {
                days.map((day: string, index: number) => {
                    return (
                        <Button
                            sx={{
                              backgroundColor: selectedDay === day ? 'primary.lightest' : '',
                              color: selectedDay === day ? 'primary.main' : 'grey',
                            }}
                            onClick={() => setSelectedDay(day)}
                            key={index}
                        >
                            <Typography fontWeight="bold">{day.slice(0, 3)}</Typography>
                        </Button>
                    )
                })
            }
            </Box>

            {isLoading ? <LoadingComponent /> : <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" justifyContent="center">
                {
                    routes && routes?.data?.map((route: any, index: number) => {
                        return (
                            <Box display="flex" alignItems="center" gap={1} key={index}>
                                <Checkbox checked={selectedRouteIds.includes(route.id)} onChange={() => handleSelectRoute(route.id)} />
                                <Typography>{route.name} - {route.driver.name}</Typography>
                            </Box>
                        )
                    })
                }
            </Box>}
        </BoxModal>
    </Modal>
    </>
  )
}
