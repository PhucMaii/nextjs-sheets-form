import { Badge, Box, IconButton, Menu, Typography } from '@mui/material';
import React, { useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ILocalNoti } from '@/hooks/useLocalStorage';
import { DropdownItemContainer } from '../orders/styled';

interface IProps {
  localNoti: any;
  setLocalNoti: any;
}

const NotiDetails = ({ title, description }: ILocalNoti) => {
  return (
    <Box display="flex" flexDirection="column" gap={2} p={5}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1">{description}</Typography>
    </Box>
  );
};

export default function NotificationBadge({ localNoti, setLocalNoti }: IProps) {
  const [notiAnchor, setNotiAnchor] = useState<any>();
  const openNotiDropdown = Boolean(notiAnchor);

  const handleCloseAnchor = () => {
    setNotiAnchor(null);
    setLocalNoti([]);
  };

  const handleOpenNoti = (e: any) => {
    setNotiAnchor(e.currentTarget);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <IconButton
        sx={{
          boxShadow:
            'rgba(245, 245, 245, 1) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset',
        }}
        onClick={handleOpenNoti}
      >
        <Badge color="error" badgeContent={localNoti.length || null}>
          <NotificationsIcon color="primary" />
        </Badge>
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={notiAnchor}
        open={openNotiDropdown}
        onClose={handleCloseAnchor}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {localNoti &&
          localNoti.length > 0 &&
          localNoti.map((noti: ILocalNoti, index: number) => {
            console.log({ noti });
            return (
              <DropdownItemContainer key={index}>
                <NotiDetails
                  title={noti.title}
                  description={noti.description}
                />
              </DropdownItemContainer>
            );
          })}
      </Menu>
    </Box>
  );
}
