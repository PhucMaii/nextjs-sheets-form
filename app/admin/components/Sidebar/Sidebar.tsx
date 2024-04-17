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
import React, { ReactNode, useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { tabs } from '../../lib/constant';
import { ListItemButtonStyled } from './styled';
import { usePathname, useRouter } from 'next/navigation';
import AuthenGuard from '@/app/HOC/AuthenGuard';
import { signOut } from 'next-auth/react';
import { blueGrey } from '@mui/material/colors';

interface PropTypes {
  children: ReactNode;
}

const drawerWidth = 250;
export default function Sidebar({ children }: PropTypes) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname: any = usePathname();
  const url = process.env.NEXT_PUBLIC_WEB_URL;

  useEffect(() => {
    setCurrentTab(pathname);
  }, [pathname]);

  const handleChangeTab = (path: string) => {
    router.push(path);
  };

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const content = (
    <>
      <Toolbar sx={{ mt: 4 }}>
        <img
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
          alt="Blue Logo"
          src="/logo.jpg"
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
            signOut({ callbackUrl: `https://www.supremesprouts.com/auth/login` })
          }
          variant="outlined"
          fullWidth
        >
          Sign out
        </Button>
      </Box>
    </>
  );

  if (mdDown) {
    return (
      <AuthenGuard>
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
          <Box display="flex" width="100%" flexDirection="column" m={2} gap={2}>
            {children}
          </Box>
        </Box>
      </AuthenGuard>
    );
  }

  return (
    <AuthenGuard>
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
        <Box display="flex" width="100%" flexDirection="column" m={2} gap={2}>
          {children}
        </Box>
      </Box>
    </AuthenGuard>
  );
}
