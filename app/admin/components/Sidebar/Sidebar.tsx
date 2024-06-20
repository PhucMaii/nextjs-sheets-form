/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
} from '@mui/material';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { tabs } from '../../../lib/constant';
import { ListItemButtonStyled } from './styled';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { blueGrey } from '@mui/material/colors';
import { ComponentToPrint } from '../Printing/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import { Order } from '../../orders/page';
import { pusherClient } from '@/app/pusher';
import { primaryColor } from '@/app/theme/color';

interface PropTypes {
  children: ReactNode;
  noMargin?: boolean;
}

const drawerWidth = 250;
export default function Sidebar({ children, noMargin }: PropTypes) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const router = useRouter();
  const pathname: any = usePathname();
  const url = process.env.NEXT_PUBLIC_WEB_URL;

  const singlePrintRef: any = useRef();
  const allPrintRef: any = useRef();

  // Subscribe admin whenever they logged in
  useEffect(() => {
    pusherClient.subscribe('admin');
    pusherClient.subscribe('override-order');
    pusherClient.subscribe('void-order');

    pusherClient.bind('incoming-order', (order: Order) => {
      setSingleOrder(order);
    });

    return () => {
      pusherClient.unsubscribe('admin');
      pusherClient.unsubscribe('override-order');
      pusherClient.unsubscribe('void-order');
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

  const handleChangeTab = (path: string) => {
    router.push(path);
  };

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const handleOnDataReceived = (data: any) => {
    if (data.length > 1) {
      setOrders(data);
    } else {
      setSingleOrder(data);
    }
  };

  const content = (
    <>
      <Toolbar sx={{ mt: 4 }}>
        <img
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
          alt="Supreme Sprouts Logo"
          src="/supremesproutsIcon.png"
        />
      </Toolbar>

      <List
        sx={{ width: '100%', maxWidth: 300, bgcolor: 'background', mt: 2 }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <Box display="flex" flexDirection="column" rowGap={2}>
          {tabs.map((tab, index) => (
            <ListItemButtonStyled
              $textColor="white"
              $bgColor={primaryColor}
              $currentTab={currentTab === tab.path}
              key={index}
              onClick={() => handleChangeTab(tab.path)}
            >
              <ListItemIcon>
                {tab.icon && (
                  <tab.icon
                    sx={{
                      color: currentTab === tab.path ? 'white' : blueGrey[800],
                    }}
                  />
                )}
              </ListItemIcon>
              <ListItemText primary={tab.name} />
            </ListItemButtonStyled>
          ))}
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
          <Box
            display="flex"
            width="100%"
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
