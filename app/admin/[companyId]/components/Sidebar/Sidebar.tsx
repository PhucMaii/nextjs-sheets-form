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
  Typography,
  useMediaQuery,
  Avatar,
  Collapse,
  Tooltip,
  alpha,
  Chip,
} from '@mui/material';
import React, {
  Fragment,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
  LogoutOutlined,
  Circle,
  SupervisedUserCircle,
} from '@mui/icons-material';
import { adminTabs } from '../../../../lib/constant';
import { ListItemButtonStyled } from './styled';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { blue, blueGrey, grey } from '@mui/material/colors';
import { ComponentToPrint } from '../Printing/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import { Order } from '../../orders/page';
import { pusherClient } from '@/app/pusher';
import { primary } from '@/theme/color';
import { UserContext } from '@/app/context/UserContextAPI';
import { EMPLOYEE_ROLE, getAdminApiUrl, USER_ROLE } from '@/app/utils/enum';
import Image from 'next/image';
import useLocalStorage from '@/hooks/useLocalStorage';
import ConfirmModal from '../Modals/ConfirmModal';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { DashboardMode } from '@prisma/client';
import { TruckIcon } from 'lucide-react';

interface PropTypes {
  children: ReactNode;
  noMargin?: boolean;
  overflow?: string;
}

const DRAWER_WIDTH_EXPANDED = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

export default function Sidebar({ children, noMargin, overflow }: PropTypes) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const [role, setRole] = useLocalStorage('role', null);
  const [isOpenConfirm, setIsOpenConfirm] = useState<boolean>(false);
  const router = useRouter();
  const pathname: any = usePathname();

  const { showNotification, NotificationComp } = useNotification();

  const { user, mutate } = useContext(UserContext);

  const { companyId }: any = useParams();

  const singlePrintRef: any = useRef();
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));

  // Auto-collapse on smaller screens
  useEffect(() => {
    setIsCollapsed(lgDown);
  }, [lgDown]);

  // Auto change the greeting based on the time
  const [greeting, setGreeting] = useState<string>('');
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Auto-expand section containing current tab
  useEffect(() => {
    if (currentTab) {
      Object.keys(adminTabs).forEach((section: string) => {
        const sectionKey = section as keyof typeof adminTabs;
        const hasActiveTab = adminTabs[sectionKey].some(
          (tab: any) =>
            tab.path.replace('[companyId]', companyId) === currentTab,
        );

        if (hasActiveTab && !expandedSections.includes(section)) {
          setExpandedSections((prev) => [...prev, section]);
        }
      });
    }
  }, [currentTab]);

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
      const pathPage = pathname.split('/').slice(0, 4).join('/');
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
          callbackUrl: `https://www.supremesprouts.com/account/login`,
        });
      }
    } else {
      setCurrentTab(pathname);
    }
  }, [pathname, user, companyId]);

  const handleChangeTab = (path: string) => {
    router.push(path.replace('[companyId]', companyId));
    if (mdDown) {
      setIsNavOpen(false);
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName],
    );
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };


  const handleSwitchRole = useCallback(async () => {
    if (user?.role === USER_ROLE.DRIVER) {
      showNotification('error', 'You are not allowed to switch to driver');
      return;
    }
    await axios.put(getAdminApiUrl(user?.companyId || 1, '/switch-mode'), {
      mode: DashboardMode.driver,
    });

    await mutate();
    router.push(`/driver/overview`);
  }, [mutate]);

  const renderTopSection = () => (
    <Box>
      {/* Logo and Collapse Button Section */}
      <Box
        sx={{
          p: isCollapsed ? 2 : 3,
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha('#000', 0.06)}`,
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, textAlign: isCollapsed ? 'center' : 'left' }}>
          <Image
            style={{
              maxWidth: isCollapsed ? '36px' : '120px',
              height: 'auto',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            }}
            alt="Supreme Sprouts Logo"
            src="/supremesproutsIcon.png"
            width={120}
            height={36}
          />
        </Box>

        {/* Collapse Button */}
        {!mdDown && (
          <Tooltip
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            arrow
          >
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              sx={{
                width: 36,
                height: 36,
                border: `1px solid ${alpha('#000', 0.08)}`,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(primary.main, 0.04),
                  borderColor: alpha(primary.main, 0.2),
                },
              }}
            >
              <ChevronLeftIcon
                sx={{
                  transform: isCollapsed ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s ease',
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  const renderUserSection = () => (
    <Box
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${alpha(primary.main, 0.08)}, ${alpha(primary.main, 0.04)})`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box position="relative">
          <Avatar
            sx={{
              bgcolor: `linear-gradient(135deg, ${primary.main}, ${primary.dark})`,
              width: isCollapsed ? 36 : 48,
              height: isCollapsed ? 36 : 48,
              fontSize: isCollapsed ? '0.875rem' : '1.1rem',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha(primary.main, 0.3)}`,
            }}
          >
            {getUserInitials(user?.name || 'U')}
          </Avatar>
          <Circle
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              fontSize: 12,
              color: '#4ade80',
              bgcolor: 'background.paper',
              borderRadius: '50%',
            }}
          />
        </Box>

        {!isCollapsed && (
          <Box flex={1} minWidth={0}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              noWrap
              sx={{
                color: 'text.primary',
                fontSize: '1rem',
                lineHeight: 1.3,
              }}
            >
              {greeting}, {user?.name?.split(' ')[0]}
            </Typography>
            <Chip
              label={user?.company?.name}
              size="small"
              sx={{
                mt: 0.5,
                fontSize: '0.75rem',
                height: 20,
                bgcolor: alpha(primary.main, 0.1),
                color: primary.main,
                fontWeight: 500,
              }}
            />
            <Button
              size="small"
              sx={{ textTransform: 'none' }}
              startIcon={<TruckIcon size={16} />}
              onClick={() => setIsOpenConfirm(true)}
            >
              Switch To Driver
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );

  const renderNavigation = () => (
    <Box sx={{ flex: 1, overflow: 'auto', pt: 2 }}>
      {Object.keys(adminTabs).map((section: string, sectionIndex: number) => {
        const sectionKey = section as keyof typeof adminTabs;
        const isExpanded = expandedSections.includes(section);

        // Filter tabs based on user permissions
        const filteredTabs = adminTabs[sectionKey].filter((tab: any) => {
          if (user?.role === EMPLOYEE_ROLE.SUPER_ADMIN) {
            return true;
          }

          if (user?.role === EMPLOYEE_ROLE.ADMIN) {
            const pageAccess = user?.adminPages.find(
              (page: any) => page.pageId === tab.id,
            );
            return pageAccess;
          }
          return false;
        });

        if (filteredTabs.length === 0) return null;

        // Check if this section contains the active tab
        const hasActiveTab = filteredTabs.some(
          (tab: any) =>
            currentTab === tab.path.replace('[companyId]', companyId),
        );

        return (
          <Fragment key={sectionIndex}>
            {!isCollapsed ? (
              <Box sx={{ mb: 3 }}>
                <Box
                  onClick={() => toggleSection(section)}
                  sx={{
                    px: 3,
                    py: 1.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    mx: 2,
                    transition: 'all 0.2s ease',
                    bgcolor: hasActiveTab
                      ? alpha(primary.main, 0.04)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(primary.main, 0.06),
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color={hasActiveTab ? primary.main : 'text.secondary'}
                    sx={{
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {section}
                  </Typography>
                  {isExpanded ? (
                    <KeyboardArrowDown
                      sx={{
                        fontSize: 20,
                        color: hasActiveTab ? primary.main : 'text.secondary',
                        transition: 'color 0.2s ease',
                      }}
                    />
                  ) : (
                    <KeyboardArrowRight
                      sx={{
                        fontSize: 20,
                        color: hasActiveTab ? primary.main : 'text.secondary',
                        transition: 'color 0.2s ease',
                      }}
                    />
                  )}
                </Box>

                <Collapse in={isExpanded} timeout={300}>
                  <List dense sx={{ mt: 1, px: 2 }}>
                    {filteredTabs.map((tab: any, tabIndex: number) => {
                      const isActive =
                        currentTab ===
                        tab.path.replace('[companyId]', companyId);

                      return (
                        <Box
                          key={tabIndex}
                          sx={{
                            position: 'relative',
                            mb: 0.5,
                          }}
                        >
                          {isActive && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: -16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 4,
                                height: 24,
                                bgcolor: primary.main,
                                borderRadius: 2,
                              }}
                            />
                          )}
                          <ListItemButtonStyled
                            $textColor={primary.main}
                            $bgColor={primary.lightest}
                            $currentTab={isActive}
                            onClick={() => handleChangeTab(tab.path)}
                            sx={{
                              borderRadius: 3,
                              minHeight: 48,
                              px: 2,
                              transition: 'all 0.2s ease',
                              bgcolor: isActive
                                ? alpha(primary.main, 0.08)
                                : 'transparent',
                              '&:hover': {
                                bgcolor: isActive
                                  ? alpha(primary.main, 0.12)
                                  : alpha(primary.main, 0.04),
                                transform: 'translateX(4px)',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 44 }}>
                              {tab.icon && (
                                <tab.icon
                                  sx={{
                                    color: isActive
                                      ? primary.main
                                      : 'text.secondary',
                                    fontSize: '1.3rem',
                                    transition: 'color 0.2s ease',
                                  }}
                                />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={tab.name}
                              primaryTypographyProps={{
                                fontSize: '0.9rem',
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? primary.main : 'text.primary',
                              }}
                            />
                          </ListItemButtonStyled>
                        </Box>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            ) : (
              // Collapsed view - show all tabs as individual items with tooltips
              <List dense sx={{ px: 2, mb: 2 }}>
                {filteredTabs.map((tab: any, tabIndex: number) => {
                  const isActive =
                    currentTab === tab.path.replace('[companyId]', companyId);

                  return (
                    <Tooltip
                      key={tabIndex}
                      title={tab.name}
                      placement="right"
                      arrow
                    >
                      <Box sx={{ position: 'relative', mb: 1 }}>
                        {isActive && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 4,
                              height: 32,
                              bgcolor: primary.main,
                              borderRadius: 2,
                            }}
                          />
                        )}
                        <ListItemButtonStyled
                          $textColor={primary.main}
                          $bgColor={primary.lightest}
                          $currentTab={isActive}
                          onClick={() => handleChangeTab(tab.path)}
                          sx={{
                            borderRadius: 3,
                            minHeight: 48,
                            justifyContent: 'center',
                            bgcolor: isActive
                              ? alpha(primary.main, 0.08)
                              : 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: isActive
                                ? alpha(primary.main, 0.12)
                                : alpha(primary.main, 0.04),
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{ minWidth: 'auto', justifyContent: 'center' }}
                          >
                            {tab.icon && (
                              <tab.icon
                                sx={{
                                  color: isActive
                                    ? primary.main
                                    : 'text.secondary',
                                  fontSize: '1.3rem',
                                  transition: 'all 0.2s ease',
                                }}
                              />
                            )}
                          </ListItemIcon>
                        </ListItemButtonStyled>
                      </Box>
                    </Tooltip>
                  );
                })}
              </List>
            )}
          </Fragment>
        );
      })}
    </Box>
  );

  const renderBottomActions = () => (
    <Box
      sx={{
        p: isCollapsed ? 2 : 3,
        borderTop: `1px solid ${alpha('#000', 0.06)}`,
      }}
    >
      <Tooltip title="Sign out" placement={isCollapsed ? 'right' : 'top'} arrow>
        <Button
          onClick={() =>
            signOut({
              callbackUrl: `https://www.supremesprouts.com/account/login`,
            })
          }
          variant="outlined"
          fullWidth={!isCollapsed}
          sx={{
            minWidth: isCollapsed ? 48 : 'auto',
            height: 48,
            borderRadius: 3,
            borderColor: alpha('#000', 0.08),
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha('#ef4444', 0.04),
              borderColor: alpha('#ef4444', 0.2),
              color: '#ef4444',
            },
          }}
          startIcon={!isCollapsed ? <LogoutOutlined /> : undefined}
        >
          {isCollapsed ? <LogoutOutlined /> : 'Sign out'}
        </Button>
      </Tooltip>
    </Box>
  );

  const content = (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRight: `1px solid ${alpha('#000', 0.06)}`,
      }}
    >
      {renderTopSection()}
      {renderUserSection()}
      {renderNavigation()}
      {renderBottomActions()}
    </Box>
  );

  const printComponents = (
    <div style={{ display: 'none' }}>
      <ComponentToPrint order={singleOrder} ref={singlePrintRef} />
    </div>
  );

  // Mobile View
  if (mdDown) {
    return (
      <>
        <ConfirmModal
          open={isOpenConfirm}
          onClose={() => setIsOpenConfirm(false)}
          handleSubmit={handleSwitchRole}
          showNotification={showNotification}
          title="Are you sure to switch to driver?"
          buttonLabel="Yes, I'm sure"
        />
        <IconButton
          onClick={() => {
            setIsNavOpen(true);
            setIsCollapsed(false);
          }}
          sx={{
            position: 'fixed',
            top: 0,
            left: 2,
            '&:hover': {
              backgroundColor: alpha(primary.main, 0.04),
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          variant="temporary"
          anchor="left"
          open={isNavOpen}
          onClose={() => setIsNavOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH_EXPANDED,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            },
          }}
        >
          {content}
        </Drawer>

        <Box
          sx={{
            p: 2,
            pt: 4,
            minHeight: '100vh',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          {printComponents}
          {children}
        </Box>
      </>
    );
  }

  // Desktop View
  return (
    <Box
      sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}
    >
      {NotificationComp}
      <ConfirmModal
        open={isOpenConfirm}
        onClose={() => setIsOpenConfirm(false)}
        handleSubmit={handleSwitchRole}
        showNotification={showNotification}
        title="Are you sure to switch to driver?"
        buttonLabel="Yes, I'm sure"
      />
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '0 0 50px rgba(0,0,0,0.08)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        {content}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: noMargin ? 0 : 4,
          overflow: overflow || 'auto',
          backgroundColor: '#fafafa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {printComponents}
        {children}
      </Box>
    </Box>
  );
}
