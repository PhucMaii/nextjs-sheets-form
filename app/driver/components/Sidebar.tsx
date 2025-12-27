'use client';
import {
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
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { blue, blueGrey } from '@mui/material/colors';
import { driverTabs, driverPrimaryTabs } from '@/app/lib/constant';
import { ListItemButtonStyled } from '@/app/admin/[companyId]/components/Sidebar/styled';
import LogoutIcon from '@mui/icons-material/Logout';
import { primary } from '@/theme/color';
import ShiftModal, { ShiftType } from './Modals/ShiftModal';
import { IShiftSession } from '@/app/utils/type';
import { API_URL, getAdminApiUrl, USER_ROLE } from '@/app/utils/enum';
import ShiftBanner from './ShiftBanner';
import { AccessTime, SupervisedUserCircle } from '@mui/icons-material';
// import useLocalStorage from '@/hooks/useLocalStorage';
import SwitchRole from './Modals/SwitchRole';
import NotificationRequest from '@/app/components/NotificationRequest';
// import axios from 'axios';
import PushReSubscriber from '@/app/components/PushResubscriber';
// import axios from 'axios';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import ConfirmModal from '@/app/admin/[companyId]/components/Modals/ConfirmModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import { UserContext } from '@/app/context/UserContextAPI';
import { DashboardMode } from '@prisma/client';

interface IProps {
  children: ReactNode;
}

const drawerWidth = 250;
export default function Sidebar({ children }: IProps) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [shiftModalProps, setShiftModalProps] = useState<any>({
    open: false,
    type: null,
  });
  const [isOpenSwitchRole, setIsOpenSwitchRole] = useState<boolean>(false);
  const [shiftSession, setShiftSession] = useState<IShiftSession | null>(null);
  const [isOpenConfirm, setIsOpenConfirm] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [role, setRole] = useLocalStorage('role', null);
  const { user, mutate } = useContext(UserContext);

  // const [isAsked, setIsAsked, isInitialized] = useLocalStorage(
  //   'isAskedClockIn',
  //   false,
  // );

  const { showNotification, NotificationComp } = useNotification();

  // const [todaySession] = SWRFetchData(`${API_URL.DRIVER}/shift/today`);
  const { data: todaySession, refetch: refetchTodaySession } = useQuery({
    queryKey: ['todaySession'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL.DRIVER}/shift/today`);
      return response.data;
    },
  });

  const router = useRouter();
  const pathname: any = usePathname();

  const isForceToClockIn =
    todaySession?.data?.length === 0 &&
    todaySession?.isWorkingDay &&
    pathname === '/driver/orders';

  useEffect(() => {
    setCurrentTab(pathname);
  }, [pathname]);

  useEffect(() => {
    if (todaySession) {
      // Has shift session
      if (todaySession?.data?.length > 0) {
        const currentShift = todaySession.data.find(
          (shift: IShiftSession) => shift.isActive,
        );
        setShiftSession(currentShift);
        setShiftModalProps({ open: false, type: null });
        // No shift session and is working day => Force to clock in
      } else if (
        todaySession?.data?.length === 0 &&
        todaySession?.isWorkingDay
      ) {
        setShiftSession(null);
        setShiftModalProps({ open: true, type: ShiftType.CLOCK_IN });
      }
    }
  }, [todaySession]);

  const handleChangeTab = (path: string) => {
    router.push(path);
  };

  // const sendNotification = async () => {
  //   try {
  //     // if (Notification.permission === 'granted') {
  //     //   new Notification('Supreme Sprouts', {
  //     //     body: 'You have been clocked in',
  //     //   })
  //     // };
  //     await axios.post('/api/push-notification/alert-clock-in');
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const confirmAllowNotification = async () => {
    try {
      const response = await axios.post(`/api/push-notification/confirm-allow`);

      if (response.data.error) {
        showNotification('error', response.data.error);
      }
    } catch (error) {
      console.log('Fail to confirm allow notification: ', error);
      showNotification('error', 'Fail to confirm allow notification: ' + error);
    }
  };

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const renderSwitchRole = () => {
    if (
      user?.role === USER_ROLE.ADMIN ||
      user?.role === USER_ROLE.SUPER_ADMIN
    ) {
      return (
        <Button
          onClick={() => setIsOpenConfirm(true)}
          startIcon={<SupervisedUserCircle />}
        >
          Switch To Admin
        </Button>
      );
    }

    return null;
  };

  const handleSwitchRole = useCallback(async () => {
    if (user?.role === USER_ROLE.DRIVER) {
      showNotification('error', 'You are not allowed to switch to admin');
      return;
    }

    await axios.put(getAdminApiUrl(user?.companyId || 1, '/switch-mode'), {
      mode: DashboardMode.auto,
    });

    await mutate();
    router.push(`/admin/${user?.companyId}/orders`);
  }, [mutate]);

  const content = (
    <>
      <Toolbar sx={{ mt: 4 }}>
        <Image
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
          alt="Supreme Sprouts Logo"
          src="/supremesproutsIcon.png"
          width={100}
          height={100}
        />
      </Toolbar>

      <List
        sx={{ width: '100%', maxWidth: 300, bgcolor: 'background', mt: 2 }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <Box display="flex" flexDirection="column" rowGap={2}>
          {driverTabs.map((tab, index) => (
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
                        currentTab === tab.path ? primary.main : blueGrey[600],
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
              callbackUrl: `https://www.supremesprouts.com/account/login`,
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
        {NotificationComp}
        <PushReSubscriber />
        <NotificationRequest />
        <ConfirmModal
          open={isOpenConfirm}
          onClose={() => setIsOpenConfirm(false)}
          handleSubmit={handleSwitchRole}
          showNotification={showNotification}
          title="Are you sure to switch to admin?"
          buttonLabel="Yes, I'm sure"
        />

        {shiftSession ? (
          <ShiftBanner
            shift={shiftSession}
            onOpenShiftModal={() =>
              setShiftModalProps({ open: true, type: ShiftType.CLOCK_OUT })
            }
            onOpenSwitchRole={() => setIsOpenSwitchRole(true)}
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={1}
          >
            <IconButton onClick={confirmAllowNotification}>
              <CircleNotificationsIcon />
            </IconButton>
            <Button
              onClick={() =>
                setShiftModalProps({ open: true, type: ShiftType.CLOCK_IN })
              }
            >
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime fontSize="small" />
                <Typography variant="body2" sx={{ textTransform: 'none' }}>
                  Clock In
                </Typography>
              </Box>
            </Button>
          </Box>
        )}
        <ShiftModal
          open={shiftModalProps.open}
          onClose={() => setShiftModalProps({ open: false, type: null })}
          type={shiftModalProps.type}
          shift={shiftSession}
          isDisabledClose={isForceToClockIn}
          refetch={refetchTodaySession}
        />
        <SwitchRole
          open={isOpenSwitchRole}
          onClose={() => setIsOpenSwitchRole(false)}
        />
        <Box sx={{ pb: 8, m: 1 }}>
          {/* <Button onClick={sendNotification}>Send notification</Button> */}
          {renderSwitchRole()}
          {children}
        </Box>
        <Paper
          sx={{ position: 'fixed', bottom: '0 !important', zIndex: 100 }}
          elevation={3}
        >
          <BottomNavigation
            sx={{ width: '100vw !important' }}
            value={currentTab}
            onChange={(e, newValue) => {
              setCurrentTab(newValue);
            }}
          >
            {driverPrimaryTabs.map((tab, index) => {
              return (
                <BottomNavigationAction
                  sx={{ minWidth: '30px' }}
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
                      fontSize="small"
                    />
                  }
                />
              );
            })}
            <BottomNavigationAction
              // label="Sign out"
              onClick={() =>
                signOut({
                  callbackUrl: `https://www.supremesprouts.com/account/login`,
                })
              }
              value={'/account/login'}
              sx={{ minWidth: '30px' }}
              icon={
                <LogoutIcon sx={{ color: blueGrey[800] }} fontSize="small" />
              }
            />
          </BottomNavigation>
        </Paper>
      </>
    );
  }

  if (mdDown) {
    return (
      <>
        {NotificationComp}
        <ConfirmModal
          open={isOpenConfirm}
          onClose={() => setIsOpenConfirm(false)}
          handleSubmit={handleSwitchRole}
          showNotification={showNotification}
          title="Are you sure to switch to admin?"
          buttonLabel="Yes, I'm sure"
        />
        <NotificationRequest />

        {shiftSession ? (
          <ShiftBanner
            shift={shiftSession}
            onOpenShiftModal={() =>
              setShiftModalProps({ open: true, type: ShiftType.CLOCK_OUT })
            }
            onOpenSwitchRole={() => setIsOpenSwitchRole(true)}
          />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <Button
              onClick={() =>
                setShiftModalProps({ open: true, type: ShiftType.CLOCK_IN })
              }
            >
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTime fontSize="small" />
                <Typography variant="body2" sx={{ textTransform: 'none' }}>
                  Clock In
                </Typography>
              </Box>
            </Button>
          </Box>
        )}
        <ShiftModal
          open={shiftModalProps.open}
          onClose={() => setShiftModalProps({ open: false, type: null })}
          type={shiftModalProps.type}
          shift={shiftSession}
          isDisabledClose={isForceToClockIn}
          refetch={refetchTodaySession}
        />
        <SwitchRole
          open={isOpenSwitchRole}
          onClose={() => setIsOpenSwitchRole(false)}
        />
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
            <Box
              display="flex"
              width="100%"
              flexDirection="column"
              p={2}
              gap={2}
            >
              {renderSwitchRole()}
              {children}
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <NotificationRequest />
      <ConfirmModal
        open={isOpenConfirm}
        onClose={() => setIsOpenConfirm(false)}
        handleSubmit={handleSwitchRole}
        showNotification={showNotification}
        title="Are you sure to switch to admin?"
        buttonLabel="Yes, I'm sure"
      />
      {shiftSession ? (
        <ShiftBanner
          shift={shiftSession}
          onOpenShiftModal={() =>
            setShiftModalProps({ open: true, type: ShiftType.CLOCK_OUT })
          }
          onOpenSwitchRole={() => setIsOpenSwitchRole(true)}
        />
      ) : (
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <Button
            onClick={() =>
              setShiftModalProps({ open: true, type: ShiftType.CLOCK_IN })
            }
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime fontSize="small" />
              <Typography variant="body2" sx={{ textTransform: 'none' }}>
                Clock In
              </Typography>
            </Box>
          </Button>
        </Box>
      )}
      <ShiftModal
        open={shiftModalProps.open}
        onClose={() => setShiftModalProps({ open: false, type: null })}
        type={shiftModalProps.type}
        shift={shiftSession}
        isDisabledClose={isForceToClockIn}
        refetch={refetchTodaySession}
      />
      <SwitchRole
        open={isOpenSwitchRole}
        onClose={() => setIsOpenSwitchRole(false)}
      />
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
          <Box display="flex" width="100%" flexDirection="column" m={1} gap={2}>
            {renderSwitchRole()}
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
