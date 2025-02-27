/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  Box,
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, {
  Fragment,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { adminTabs, tabs } from '../../../lib/constant';
import { ListItemButtonStyled } from './styled';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { blueGrey } from '@mui/material/colors';
import { ComponentToPrint } from '../Printing/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import { Order } from '../../orders/page';
import { pusherClient } from '@/app/pusher';
import { primary } from '@/theme/color';
import { MaintenanceContext } from '@/app/context/MaintenanceProvider';
import { generateMonthRange, generateRecommendDate } from '@/app/utils/time';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import StatusText from '../StatusText';
import { LoadingButton } from '@mui/lab';
import { SWRFetchData } from '@/app/utils/db';
import ErrorIcon from '@mui/icons-material/Error';

interface PropTypes {
  children: ReactNode;
  noMargin?: boolean;
  overflow?: string;
}

const drawerWidth = 250;
export default function Sidebar({ children, noMargin, overflow }: PropTypes) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const router = useRouter();
  const pathname: any = usePathname();
  const { isMaintenance, setIsMaintenance } = useContext(MaintenanceContext);
  const url = process.env.NEXT_PUBLIC_WEB_URL;

  const recommendDateRange = generateMonthRange();

  const [bugOrders] = SWRFetchData(
    `${API_URL.ADMIN}/orders/invalid-orders?startDate=${recommendDateRange[0]}&endDate=${recommendDateRange[1]}`,
  );

  const singlePrintRef: any = useRef();
  const allPrintRef: any = useRef();

  console.log(bugOrders, 'bug orders');

  // Subscribe admin whenever they logged in
  useEffect(() => {
    pusherClient?.subscribe('admin');
    pusherClient?.subscribe('override-order');
    pusherClient?.subscribe('void-order');

    pusherClient?.bind('incoming-order', (order: Order) => {
      setSingleOrder(order);
    });

    return () => {
      pusherClient?.unsubscribe('admin');
      pusherClient?.unsubscribe('override-order');
      pusherClient?.unsubscribe('void-order');
    };
  }, []);

  useEffect(() => {
    handleSinglePrint();
  }, [singleOrder]);

  const handleSinglePrint = useReactToPrint({
    content: () => singlePrintRef.current,
  });

  const handleAllPrint = useReactToPrint({
    content: () => allPrintRef.current,
  });

  useEffect(() => {
    setCurrentTab(pathname);
  }, [pathname]);

  // const onFetchInvalidOrders = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await axios.get(
  //       `${API_URL.ADMIN}/orders/invalid-orders`,
  //     );

  //     if (response.data.error) {
  //       console.error('Error fetching invalid orders:', response.data.error);
  //     } else {
  //       setInvalidOrders(response.data.data);
  //     }

  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching invalid orders:', error);
  //     setIsLoading(false);
  //   }
  // };

  const handleChangeTab = (path: string) => {
    console.log('handleChangeTab called with path:', path);
    console.log('router object:', router);
    router.push(path);
  };

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const renderIncorrectOrders = (order: Order) => {
    return (
      <Box display="flex" flexDirection="column" rowGap={2}>
        <Typography></Typography>
      </Box>
    );
  };

  const content = (
    <>
      {/* <Box display="flex" justifyContent="center" my={2}>
      <FormControlLabel
            value="start"
            control={<Switch color="primary" checked={isMaintenance} onChange={(e: any) => setIsMaintenance(e.target.checked)} />}
            label="Under Maintenance"
            labelPlacement="bottom"
          />
    </Box> */}
      <Toolbar sx={{ mt: 6 }}>
        <img
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
          alt="Supreme Sprouts Logo"
          src="/supremesproutsIcon.png"
        />
      </Toolbar>

      {/* <Toolbar sx={{ mt: 6 }}>
        <LoadingButton
          loading={isLoading}
          onClick={onFetchInvalidOrders}
          variant="outlined"
        >
          Check Invalid Orders
        </LoadingButton>
      </Toolbar> */}
      <List
        sx={{ width: '100%', maxWidth: 300, bgcolor: 'background', mt: 4 }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        {bugOrders && bugOrders?.data?.length > 0 && (
          <Toolbar sx={{ mt: 2 }}>
            <Box display="flex" flexDirection="column" rowGap={2}>
              {bugOrders?.data.map((order: any, index: number) => {
                return (
                  <StatusText
                    key={index}
                    type="error"
                    // text={`Order ID: ${order.id} - Client: ${order.user.clientName}`}
                    icon={<ErrorIcon />}
                    renderText={() => {
                      return (
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-start"
                        >
                          <Typography fontWeight="bold" flexWrap={'wrap'}>
                            Error: {order?.errorType}
                          </Typography>
                          <Typography>Id: {order.id}</Typography>
                          <Typography>Date: {order.deliveryDate}</Typography>
                          <Typography>{order.user.clientName}</Typography>
                        </Box>
                      );
                    }}
                  />
                );
              })}
            </Box>
          </Toolbar>
        )}
        <Box display="flex" flexDirection="column" rowGap={2}>
          {Object.keys(adminTabs).map((section: string, index: number) => {
            const sectionKey = section as keyof typeof adminTabs;
            return (
              <Fragment key={index}>
                <Typography
                  variant="subtitle2"
                  color={blueGrey[500]}
                  sx={{ width: '80%', margin: 'auto' }}
                >
                  {section}
                </Typography>
                {adminTabs[sectionKey].map((tab: any, index: number) => {
                  return (
                    <ListItemButtonStyled
                      $textColor={primary.main}
                      $bgColor={primary.lightest}
                      $currentTab={currentTab === tab.path}
                      key={index}
                      onClick={() => handleChangeTab(tab.path)}
                    >
                      <ListItemIcon>
                        {tab.icon && (
                          <tab.icon
                            sx={{
                              color:
                                currentTab === tab.path
                                  ? primary.main
                                  : blueGrey[600],
                            }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={tab.name} />
                    </ListItemButtonStyled>
                  );
                })}
                <Divider />
              </Fragment>
            );
          })}
        </Box>
      </List>

      <Box sx={{ m: 2, mt: 4 }}>
        <Button
          onClick={() =>
            signOut({
              callbackUrl: `https://www.supremesprouts.com/auth/login`,
            })
          }
          variant="outlined"
          fullWidth
        >
          Sign out
        </Button>
      </Box>
    </>
  );

  const printComponents = (
    <>
      <div style={{ display: 'none' }}>
        <ComponentToPrint order={singleOrder} ref={singlePrintRef} />
      </div>
    </>
  );

  if (mdDown) {
    return (
      <>
        <IconButton onClick={() => setIsNavOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Box display="flex">
          <Drawer
            sx={{
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: 'none',
              },
            }}
            variant="temporary"
            anchor="left"
            open={isNavOpen}
            onClose={() => setIsNavOpen(false)}
          >
            {content}
          </Drawer>
          <Box width="100%">
            <Box
              display="flex"
              width="100%"
              flexDirection="column"
              gap={2}
              p={2}
              sx={{ overflowX: 'hidden', maxWidth: '100vw' }}
            >
              {printComponents}
              {children}
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box display="flex">
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {content}
        </Drawer>
        <Box
          display="flex"
          width="100%"
          overflow={overflow ? overflow : 'hidden'}
          flexDirection="column"
          m={noMargin ? 0 : 2}
          gap={2}
        >
          {printComponents}
          {children}
        </Box>
      </Box>
    </>
  );
}
