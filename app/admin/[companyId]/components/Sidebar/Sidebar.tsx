/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
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
import { adminTabs } from '../../../../lib/constant';
import { ListItemButtonStyled } from './styled';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { blueGrey } from '@mui/material/colors';
import { ComponentToPrint } from '../Printing/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import { Order } from '../../orders/page';
import { pusherClient } from '@/app/pusher';
import { primary } from '@/theme/color';
import { UserContext } from '@/app/context/UserContextAPI';
import { EMPLOYEE_ROLE } from '@/app/utils/enum';

interface PropTypes {
  children: ReactNode;
  noMargin?: boolean;
  overflow?: string;
}

const drawerWidth = 210;
export default function Sidebar({ children, noMargin, overflow }: PropTypes) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const router = useRouter();
  const pathname: any = usePathname();
  const { user } = useContext(UserContext);
  const { companyId }: any = useParams();

  const singlePrintRef: any = useRef();
  const allPrintRef: any = useRef();

  // Subscribe admin whenever they logged in
  useEffect(() => {
    pusherClient?.subscribe(`admin-${companyId}`);
    pusherClient?.subscribe(`override-order-${companyId}`);
    pusherClient?.subscribe(`void-order-${companyId}`);

    pusherClient?.bind('incoming-order', (order: Order) => {
      setSingleOrder(order);
    });

    return () => {
      pusherClient?.unsubscribe(`admin-${companyId}`);
      pusherClient?.unsubscribe(`override-order-${companyId}`);
      pusherClient?.unsubscribe(`void-order-${companyId}`);
    };
  }, []);

  useEffect(() => {
    handleSinglePrint();
  }, [singleOrder]);

  const handleSinglePrint = useReactToPrint({
    content: () => singlePrintRef.current,
  });

  useEffect(() => {
    // Check if user has access to the page
    if (user?.role === EMPLOYEE_ROLE.ADMIN) {
      // Get the first 3 parts of the pathname
      const pathPage = pathname.split('/').slice(0, 4).join('/');
      console.log(pathPage);

      const targetPage = Object.values(adminTabs)
        .flat()
        .find(
          (tab: any) => tab.path.replace('[companyId]', companyId) === pathPage,
        );

        const pageAccess = user?.adminPages.find(
          (page: any) => page.pageId === targetPage?.id,
        );

      if (pageAccess) {
        setCurrentTab(pathname);
      } else {
        signOut({
          callbackUrl: `https://www.supremesprouts.com/auth/login`,
        });
      }
    } else {
      setCurrentTab(pathname);
    }
  }, [pathname, user, companyId]);

  const handleChangeTab = (path: string) => {
    router.push(path.replace('[companyId]', companyId));
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
        {/* {bugOrders && bugOrders?.data?.length > 0 && (
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
        )} */}
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
                  // If user is admin, check if they have access to the page
                  if (user?.role === 'admin') {
                    const pageAccess = user?.adminPages.find(
                      (page: any) => page.pageId === tab.id,
                    );

                    // console.log(pageAccess);

                    if (!pageAccess) {
                      return null;
                    }
                  }

                  return (
                    <ListItemButtonStyled
                      $textColor={primary.main}
                      $bgColor={primary.lightest}
                      $currentTab={
                        currentTab ===
                        tab.path.replace('[companyId]', companyId)
                      }
                      key={index}
                      onClick={() => handleChangeTab(tab.path)}
                    >
                      <ListItemIcon>
                        {tab.icon && (
                          <tab.icon
                            sx={{
                              color:
                                currentTab ===
                                tab.path.replace('[companyId]', companyId)
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
