import { Box, Button, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { blueGrey, green } from '@mui/material/colors';
import {
  landingPageGreyColor,
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';

const tabs = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Products',
    href: '/products',
  },
];

export default function Navbar() {
  const [selectedTab, setSelectedTab] = useState<string>('');

  useEffect(() => {
    setSelectedTab(window.location.pathname);
  }, [window.location.pathname]);

  return (
    <Box
      display="flex"
      alignItems="center"
      px={4}
      py={4}
      justifyContent="space-between"
    >
      <Logo />
      <Box display="flex" alignItems="center" gap={6}>
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
