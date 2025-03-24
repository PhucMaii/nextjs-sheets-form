import {
  Badge,
  badgeClasses,
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  styled,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import Logo from './Logo';
import { blueGrey, green } from '@mui/material/colors';
import MenuIcon from '@mui/icons-material/Menu';
import {
  landingPageGreyColor,
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { ListItemButtonStyled } from '@/app/admin/components/Sidebar/styled';
import { HomeIcon, ShoppingBagIcon, ShoppingCartIcon, UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Searchbar from './Search/Searchbar';
import useLocalStorage from '@/hooks/useLocalStorage';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { CartItem } from '@prisma/client';
import { useDispatch, useSelector } from 'react-redux';
import { updateCart } from '@/state/cart/cartSlice';
import axios from 'axios';
import { RootState } from '@/state/store';
import { updateUser } from '@/state/user/userSlice';
import { IItemType } from '@/app/utils/type';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ItemTypePopover from './ItemTypePopover';

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;

const tabs = [
  {
    label: 'Home',
    href: '/',
    icon: HomeIcon,
  },
  // {
  //   label: 'About',
  //   href: '/about',
  //   icon: CircleUserIcon,
  // },
  {
    label: 'Shop',
    href: '/products',
    icon: ShoppingBagIcon,
  },
];
const drawerWidth = 250;

export default function Navbar() {
  // const [cId, setCId] = useLocalStorage('cartId', cartId || '');
  const [itemTypes, setItemTypes] = useState<IItemType[]>([]);
  const [guestSession, setGuestSession, isInitialized] = useLocalStorage(
    'guest-session',
    {},
  );
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [itemTypePopoverProps, setItemTypePopoverProps] = useState<any>({
    open: false,
    anchorEl: null,
    itemType: {} as IItemType,
    setOpen: (props: any) =>
      setItemTypePopoverProps({
        open: props.open,
        anchorEl: props.anchorEl,
        itemType: props.itemType,
        setOpen: props.setOpen,
      }),
  });

  const router = useRouter();

  // Dispatch to update cart whenever the cart changes
  const dispatch = useDispatch();
  const cartState = useSelector((state: RootState) => state.cart);

  const [cart] = SWRFetchData(
    cartState.id !== -1
      ? `${API_URL.PUBLIC}/cart?cartId=${cartState.id}`
      : `${API_URL.PUBLIC}/cart?guestSessionId=${guestSession.sessionId}&guestSessionSignature=${guestSession.signature}`,
  );

  // const {showNotification, NotificationComp} = useNotification();

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const cartItemsQty = useMemo(() => {
    if (!cart) {
      return 0;
    }

    if (!cart?.data?.items) {
      return 0;
    }

    if (cart?.data?.items.length === 0) {
      return 0;
    }

    const qty = cart.data.items.reduce(
      (acc: number, item: CartItem) => acc + item.quantity,
      0,
    );

    return qty;
  }, [cart]);

  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        const response = await axios.get(`${API_URL.PUBLIC}/types`);
        setItemTypes(response.data.data.slice(0, 5));
      } catch (error: any) {
        console.log('Internal Server Error: ', error);
      }
    };

    fetchItemTypes();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      fetchGuestSessionId();
    }
  }, [guestSession]);

  useEffect(() => {
    if (cart?.data) {
      if (cart.guestSessionId && cart.guestSessionSignature) {
        setGuestSession({
          sessionId: cart.guestSessionId,
          signature: cart.guestSessionSignature,
        });
      }

      dispatch(updateCart(cart.data));
    }
  }, [cart]);

  // useEffect(() => {
  //   const retrieveIpAddress = async () => {
  //     try {
  //       const newIpAddress: any = await getIpAddress();
  //       setIpAddress(newIpAddress);
  //     } catch (error: any) {
  //       console.log('Internal Server Error: ', error);
  //     }
  //   };

  //   retrieveIpAddress();
  // }, []);

  useEffect(() => {
    setSelectedTab(window.location.pathname);
  }, [window.location.pathname]);

  const handleChangeTab = (path: string) => {
    setSelectedTab(path);
    window.location.href = path;
  };

  const fetchGuestSessionId = async () => {
    try {
      // Check if a guest session ID already exists in local storage
      if (Object.keys(guestSession).length > 0) {
        // If yes -> Check if this session id already been a guest in db
        const response = await axios.get(
          `${API_URL.PUBLIC}/guest?guestSessionId=${guestSession.sessionId}`,
        );

        if (response.data.error) {
          throw new Error('Something went wrong. ', response.data.error);
        }

        if (response.data.data) {
          dispatch(updateUser(response.data.data));
        }

        return; // Exit if a session ID already exists
      }

      const response = await axios.post(`${API_URL.PUBLIC}/guest-session`);

      if (response.data.error) {
        throw new Error('Something went wrong. ', response.data.error);
      }

      setGuestSession({
        sessionId: response.data.guestSessionId,
        signature: response.data.guestSessionSignature,
      });
    } catch (error: any) {
      console.error(
        'Something went wrong. Fail to fetch guest session id: ',
        error,
      );
    }
  };

  const proceedToApplicationForm = () => {
    router.push('/account/login');
  };

  if (mdDown) {
    return (
      <>
        <Grid
          container
          alignItems="center"
          columnSpacing={1}
          sx={{ backgroundColor: 'white', my: 1, px: 2 }}
        >
          <Grid item xs={12}>
            <Logo />
          </Grid>
          <Grid item xs={1}>
            <IconButton onClick={() => setIsNavOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Grid>
          <Grid item xs={11}>
            <Searchbar width="100%" />
          </Grid>
        </Grid>
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
            <Toolbar sx={{ mt: 6 }}>
              <img
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '20px',
                }}
                alt="Supreme Sprouts Logo"
                src="/supremesproutsIcon.png"
              />
            </Toolbar>

            <List
              sx={{
                width: '100%',
                maxWidth: 300,
                bgcolor: 'background',
                mt: 4,
              }}
              component="nav"
              aria-labelledby="nested-list-subheader"
            >
              {tabs.map((tab: any, index: any) => {
                return (
                  <ListItemButtonStyled
                    $textColor={landingPagePrimaryColor}
                    $bgColor={green[50]}
                    $currentTab={selectedTab === tab.href}
                    key={index}
                    onClick={() => handleChangeTab(tab.href)}
                  >
                    <ListItemIcon>
                      {tab.icon && (
                        <tab.icon
                          style={{
                            color:
                              selectedTab === tab.href
                                ? landingPagePrimaryColor
                                : blueGrey[600],
                          }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={tab.label} />
                  </ListItemButtonStyled>
                );
              })}

              {itemTypes?.map((itemType: any, index: any) => {
                return (
                  <ListItemButtonStyled
                    $textColor={landingPagePrimaryColor}
                    $bgColor={green[50]}
                    $currentTab={selectedTab === itemType.href}
                    key={index}
                    onClick={() => handleChangeTab(itemType.href)}
                  >
                    <ListItemText primary={itemType.name} />
                  </ListItemButtonStyled>
                );
              })}
            </List>

            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              sx={{ m: 2, mt: 4 }}
            >
              <Button
                onClick={() => {}}
                fullWidth
                sx={{ color: landingPageSecondaryColor }}
              >
                Sign in
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: landingPagePrimaryColor,
                  ':hover': { backgroundColor: landingPageSecondaryColor },
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                }}
                onClick={proceedToApplicationForm}
              >
                Sign up
              </Button>
            </Box>
          </Drawer>
          {/* <Box width="100%">
            <Box
              display="flex"
              width="100%"
              flexDirection="column"
              gap={2}
              m={2}
              sx={{ overflowX: 'hidden' }}
            >
              {children}
            </Box>
          </Box> */}
        </Box>
      </>
    );
  }

  // const handleMouseLeave = () => {
  //   const timeout = setTimeout(() => {
  //     setItemTypePopoverProps({ open: false, anchorEl: null, itemType: null });
  //   }, 300); // Adjust delay if necessary
  //   setPopoverTimeout(timeout);
  // };

  // let popoverTimeout: any;
  return (
    <>
      <ItemTypePopover
        open={itemTypePopoverProps.open}
        // set Open={itemTypePopoverProps.setOpen}
        anchorEl={itemTypePopoverProps.anchorEl}
        itemType={itemTypePopoverProps.itemType}
        onClose={() =>
          setItemTypePopoverProps({
            open: false,
            anchorEl: null,
            itemType: null,
          })
        }
        
      />
      <Box
        px={4}
        position="fixed"
        width="100%"
        // height="120px"
        py={1}
        top={0}
        sx={{
          backgroundColor: 'white',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
          zIndex: 100,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          px={4}
          justifyContent="space-between"
        >
          <Logo />
          <Searchbar width="50%" />
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={proceedToApplicationForm}
              size="large"
              sx={{
                color: landingPagePrimaryColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <UserIcon style={{ width: 30, height: 30 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', height: 0 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: landingPagePrimaryColor,
                    fontWeight: 'bold',
                    mt: 2,
                  }}
                >
                  Log in
                </Typography>
              </Box>
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <IconButton
              sx={{ color: landingPagePrimaryColor }}
              onClick={() => router.push('/cart')}
            >
              <ShoppingCartIcon style={{ width: 30, height: 30 }} />
              <CartBadge
                badgeContent={cartItemsQty}
                color="error"
                overlap="circular"
              />
            </IconButton>
          </Box>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={4}
          width="100%"
        >
          {/* The links to the other pages */}
          {tabs.map((tab: any) => {
            return (
              <Typography
                variant="h6"
                key={tab.label}
                onClick={() => {
                  window.location.href = tab.href;
                  // setSelectedTab(tab.href);
                }}
                sx={{
                  backgroundColor:
                    selectedTab === tab.href ? green[50] : 'transparent',
                  color:
                    selectedTab === tab.href
                      ? green[700]
                      : landingPageGreyColor,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  ':hover': {
                    cursor: 'pointer',
                    backgroundColor: blueGrey[50],
                  },
                }}
              >
                {tab.label}
              </Typography>
            );
          })}

          {itemTypes?.map((itemType: any, index: any) => {
            return (
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  px: 3,
                  py: 1,
                  backgroundColor:
                    selectedTab === itemType.href ? green[50] : 'transparent',
                  ':hover': {
                    cursor: 'pointer',
                    backgroundColor: blueGrey[50],
                  },
                  borderRadius: 2,
                }}
                onMouseOver={(e: any) => {
                  setItemTypePopoverProps({
                    open: true,
                    anchorEl: e.currentTarget,
                    itemType,
                  });
                }}
                // onMouseLeave={() => {
                //   popoverTimeout = setTimeout(() => {
                //     setItemTypePopoverProps({
                //       open: false,
                //       anchorEl: null,
                //       itemType: null,
                //     });
                //   }, 300); // Adjust delay time if necessary
                // }}
              
              >
                {/* <ItemTypePopover
                  open={itemTypePopoverProps.open}
                  // set Open={itemTypePopoverProps.setOpen}
                  anchorEl={itemTypePopoverProps.anchorEl}
                  itemType={itemTypePopoverProps.itemType}
                  onClose={() =>
                    setItemTypePopoverProps({
                      open: false,
                      anchorEl: null,
                      itemType: null,
                    })
                  }
                  onMouseEnter={() => {
                    setItemTypePopoverProps((prev) => ({
                      ...prev,
                      open: true,
                    }));
                  }}
                  onMouseLeave={() =>
                    setItemTypePopoverProps({
                      open: false,
                      anchorEl: null,
                      itemType: null,
                    })
                  }
                /> */}
                <Typography
                  variant="h6"
                  key={index}
                  onClick={() => {
                    router.push(`/products?type=${encodeURIComponent(itemType.name)}`);
                    // setSelectedTab(itemType.href);
                  }}
                  sx={{
                    color:
                      selectedTab === itemType.href
                        ? green[700]
                        : landingPageGreyColor,
                  }}
                  // onMouseOver={(e: any) => {
                  //   setItemTypePopoverProps({
                  //     open: true,
                  //     anchorEl: e.currentTarget,
                  //     itemType,
                  //   });
                  // }}
                  // onMouseLeave={(e: any) => {
                  //   setItemTypePopoverProps({
                  //     open: false,
                  //     anchorEl: null,
                  //     itemType: null,
                  //   });
                  // }}
                >
                  {itemType.name}
                </Typography>
                <KeyboardArrowDownIcon />
              </Box>
            );
          })}
        </Box>
      </Box>
    </>
  );
}
