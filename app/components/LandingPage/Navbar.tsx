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
    label: 'Products',
    href: '/products',
    icon: ShoppingBagIcon,
  },
];
const drawerWidth = 250;

interface IProps {
  setIsOpenSignUp: any;
  cartId?: number;
}
export default function Navbar({ setIsOpenSignUp, cartId }: IProps) {
  const [cId] = useLocalStorage('cartId', cartId || '');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const router = useRouter();

  const [cart] = SWRFetchData(`${API_URL.PUBLIC}/cart?cartId=${cId}`);

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

    const qty = cart.data.items.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

    return qty;
  }, [cart]);

  useEffect(() => {
    setSelectedTab(window.location.pathname);
  }, [window.location.pathname]);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const handleChangeTab = (path: string) => {
    setSelectedTab(path);
    window.location.href = path;
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
                onClick={() => setIsOpenSignUp(true)}
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

  return (
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
          <IconButton size="large" sx={{ color: landingPagePrimaryColor }}>
            <UserIcon style={{width: 30, height: 30}} />
          </IconButton>
          <Divider orientation='vertical' flexItem />
          <IconButton sx={{ color: landingPagePrimaryColor, position: 'relative' }} onClick={() => router.push('/cart')}>
            <ShoppingCartIcon style={{width: 30, height: 30}} />
            <CartBadge 
              badgeContent={cartItemsQty}
              color='error'
              overlap="circular" 
            />
          </IconButton>
          {/* <Button
            onClick={() => router.push('/auth/login')}
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
            onClick={() => setIsOpenSignUp(true)}
          >
            Sign Up
          </Button> */}
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
                  selectedTab === tab.href ? green[700] : landingPageGreyColor,
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
      </Box>
    </Box>
  );
}
