'use client';
import Image from 'next/image';
import React, { MouseEvent, useState } from 'react';
import Button from '../Button/Button';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Avatar, Divider, Menu, MenuItem } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FaceIcon from '@mui/icons-material/Face';
import LogoutIcon from '@mui/icons-material/Logout';

interface PropTypes {
  isLogin: boolean;
}

export default function Navbar({ isLogin }: PropTypes) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openUserMenu, setOpenUserMenu] = useState<boolean>(false);
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    setOpenUserMenu(true);
  };

  return (
    <div className="flex justify-between">
      <div
        className="flex gap-4 m-4 items-center cursor-pointer"
        onClick={() => router.push('/')}
      >
        <Image width={30} height={30} src="/computer-icon.png" alt="computer" />
        <h2 className="text-blue-500 font-bold text-xl">DataHabor Pro</h2>
      </div>
      <div className="m-4">
        {isLogin ? (
          <>
            <Avatar onClick={(e: any) => handleClick(e)} />
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={openUserMenu}
              onClose={() => setOpenUserMenu(false)}
              onClick={() => setOpenUserMenu(false)}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem>
                <div className="flex gap-2">
                  <FaceIcon /> Profile
                </div>
              </MenuItem>
              <MenuItem>
                <div className="flex gap-2">
                  <AdminPanelSettingsIcon /> My Account
                </div>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => signOut()}>
                <div className="flex gap-2">
                  <LogoutIcon /> Sign out
                </div>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            width="full"
            color="blue"
            label="Sign in"
            onClick={() => router.push('/auth/login')}
          />
        )}
      </div>
    </div>
  );
}
