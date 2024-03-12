'use client';
import { Box, Drawer, List, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import { tabs } from '../../lib/constant';
import Button from '@/app/components/Button';
import { ListItemButtonStyled } from './styled';
import { usePathname, useRouter } from 'next/navigation';

interface PropTypes {
    children: ReactNode
}

export default function Sidebar({ children }: PropTypes) {
  const [currentTab, setCurrentTab] = useState<string>('');
  const router = useRouter();
  const pathname: any = usePathname();

  useEffect(() => {
    setCurrentTab(pathname);
  }, [pathname])

  const handleChangeTab = (path: string) => {
    router.push(path);
  } 

    const content = (
        <>
          <Toolbar sx={{ mt: 4 }}>
            <img
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
              alt='Blue Logo'
              src='/logo.jpg'
            />
          </Toolbar>
    
          <List
            sx={{ width: '100%', maxWidth: 300, bgcolor: 'background', mt: 2 }}
            component='nav'
            aria-labelledby='nested-list-subheader'
          >
            <Box display='flex' flexDirection='column' rowGap={2}>
              {tabs.map((tab, index) => (
                <ListItemButtonStyled
                  $currentTab={currentTab === tab.path}
                  key={index}
                  onClick={() => handleChangeTab(tab.path)}
                >
                  <ListItemIcon>
                    {tab.icon && <tab.icon sx={{ color: 'black' }} />}
                  </ListItemIcon>
                  <ListItemText primary={tab.name} />
                </ListItemButtonStyled>
              ))}
            </Box>
          </List>

          <Box sx={{ m: 2, mt: 4 }}>
            <Button 
                label="Sign out"
                color="blue"
                width="full"
            />
          </Box>
        </>
      );
  return (
        <Box display='flex'>
        <Drawer
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
                boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
              width: 300,
              boxSizing: 'border-box',
              borderRight: 'none',
            },
          }}
          variant='permanent'
          anchor='left'
        >
          {content}
        </Drawer>
        {children}
    </Box>
  )
}
