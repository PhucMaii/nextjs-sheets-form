/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import {
  Alert,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { blue, blueGrey } from '@mui/material/colors';
import { clientTabs } from '@/app/lib/constant';
import { ListItemButtonStyled } from '@/app/admin/components/Sidebar/styled';
import LogoutIcon from '@mui/icons-material/Logout';
import { UserContext } from '@/app/context/UserContextAPI';
import CloseIcon from '@mui/icons-material/Close';
import EmailAlert from '../EmailAlert';
import SnackbarPopup from '../Snackbar/SnackbarPopup';
import { Notification } from '@/app/utils/type';
import { generateRecommendDate } from '@/app/utils/time';
import { Order } from '@/app/admin/orders/page';

interface PropTypes {
  children: ReactNode;
}

const drawerWidth = 250;
export default function Sidebar({ children }: PropTypes) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });

  const router = useRouter();
  const pathname: any = usePathname();

  const [userData] = useContext(UserContext);
  const orderDate = generateRecommendDate();
  const [isOpenSnackbar, setIsOpenSnackbar] = useState<boolean>(
    !userData?.email,
  );

  const url = process.env.NEXT_PUBLIC_WEB_URL;

  useEffect(() => {
    setCurrentTab(pathname);
  }, [pathname]);

  const handleChangeTab = (path: string) => {
    router.push(path);
  };

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const content = (
    <>
      <SnackbarPopup
        open={notification.on}
        onClose={() => setNotification({ ...notification, on: false })}
        type={notification.type}
        message={notification.message}
      />
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
          {clientTabs.map((tab, index) => (
            <ListItemButtonStyled
              $currentTab={currentTab === tab.path}
              key={index}
              onClick={() => handleChangeTab(tab.path)}
            >
              <ListItemIcon>
                {tab.icon && <tab.icon sx={{ color: blueGrey[800] }} />}
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

  if (smDown) {
    return (
      <>
        <Box sx={{ p: 2, pb: 8 }}>{children}</Box>
        {isOpenSnackbar && (
          <Snackbar
            open={isOpenSnackbar}
            onClose={() => setIsOpenSnackbar(false)}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setIsOpenSnackbar(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            <div>
              <EmailAlert
                setIsOpenSnackbar={setIsOpenSnackbar}
                setNotification={setNotification}
              />
            </div>
          </Snackbar>
        )}
        <Paper sx={{ position: 'fixed', bottom: '0 !important' }} elevation={3}>
          <BottomNavigation
            sx={{ width: '100vw !important' }}
            value={currentTab}
            onChange={(e, newValue) => {
              console.log(newValue, 'new value');
              setCurrentTab(newValue);
            }}
          >
            {clientTabs.map((tab, index) => {
              return (
                <BottomNavigationAction
                  key={index}
                  label={tab.name}
                  value={tab.path}
                  onClick={() => handleChangeTab(tab.path)}
                  icon={
                    <tab.icon
                      sx={{
                        color: `${
                          currentTab === tab.path ? blue[700] : blueGrey[800]
                        }`,
                      }}
                    />
                  }
                />
              );
            })}
            <BottomNavigationAction
              label="Sign out"
              onClick={() =>
                signOut({
                  callbackUrl: `https://www.supremesprouts.com/auth/login`,
                })
              }
              icon={<LogoutIcon sx={{ color: blueGrey[800] }} />}
            />
          </BottomNavigation>
        </Paper>
      </>
    );
  }

  if (mdDown) {
    return (
      <>
        <IconButton onClick={() => setIsNavOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Box display="flex">
          <Drawer
            sx={{
              width: drawerWidth,
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
            {isOpenSnackbar && (
              <EmailAlert
                setIsOpenSnackbar={setIsOpenSnackbar}
                setNotification={setNotification}
              />
            )}
            <Box
              display="flex"
              width="100%"
              flexDirection="column"
              m={2}
              gap={2}
            >
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
        <Box width="100%">
          {isOpenSnackbar && (
            <EmailAlert
              setIsOpenSnackbar={setIsOpenSnackbar}
              setNotification={setNotification}
            />
          )}
          <Box display="flex" width="100%" flexDirection="column" m={2} gap={2}>
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
