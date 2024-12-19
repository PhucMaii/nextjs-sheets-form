import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { blueGrey, green } from '@mui/material/colors';
import MenuIcon from '@mui/icons-material/Menu';
import {
  landingPageGreyColor,
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { ListItemButtonStyled } from '@/app/admin/components/Sidebar/styled';
import { CircleUserIcon, HomeIcon, ShoppingBagIcon } from 'lucide-react';

const tabs = [
  {
    label: 'Home',
    href: '/',
    icon: HomeIcon,
  },
  {
    label: 'About',
    href: '/about',
    icon: CircleUserIcon,
  },
  {
    label: 'Products',
    href: '/products',
    icon: ShoppingBagIcon,
  },
];
const drawerWidth = 250;
export default function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('');

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
      display="flex"
      alignItems="center"
      px={4}
      py={4}
      justifyContent="space-between"
    >
      <Logo />
      {/* The logo of the website */}
      <Box display="flex" alignItems="center" gap={4}>
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
                py: 2,
                borderRadius: 2,
                ':hover': { cursor: 'pointer', backgroundColor: blueGrey[50] },
              }}
            >
              {tab.label}
            </Typography>
          );
        })}
      </Box>
      <Button
        variant="contained"
        sx={{
          backgroundColor: landingPagePrimaryColor,
          ':hover': { backgroundColor: landingPageSecondaryColor },
          px: 2,
          py: 1,
          borderRadius: 2,
        }}
      >
        Book an appointment
      </Button>
    </Box>
  );
}
