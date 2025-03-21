import { IItemType } from '@/app/utils/type';
import { landingPagePrimaryColor, maxWidth } from '@/constant/landingPage';
import { Box, Grid, Popover, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import ProductListing from '../ProductListingPage/ProductListing';
import useNotification from '@/hooks/useNotification';

interface IProps {
  open: boolean;
  //   setOpen: Dispatch<SetStateAction<boolean>>;
  anchorEl: any;
  itemType: IItemType;
  onClose: () => void;
}

export default function ItemTypePopover({
  open,
  //   setOpen,
  anchorEl,
  itemType,
  onClose,
}: IProps) {
  const popoverWidth = anchorEl?.getBoundingClientRect().width || 0;

  const { showNotification, NotificationComp } = useNotification();

  return (
    <>
      {NotificationComp}
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        //   disableAutoFocus

        // anchorOrigin={{
        //   vertical: 'bottom',
        //   horizontal: 'left',
        // }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          '& .MuiPopover-paper': {
            width: '100vw', // Set width dynamically
            // maxHeight: '50vh',
            height: '50vh',
            marginTop: '52px',
            overflowY: 'auto',
            borderColor: landingPagePrimaryColor,
          },
          '&:focus': {
            borderColor: landingPagePrimaryColor,
          },
        }}
        onMouseLeave={onClose}
        // onMouseOut={onClose}
      >
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          sx={{ maxWidth: maxWidth, mx: 'auto', py: 2, px: 2 }}
        >
          <Typography variant="h6">{itemType?.name}</Typography>

          <Grid container spacing={1}>
            {itemType?.itemPreferences?.map((item: any, index: number) => {
              return (
                <Grid key={index} item xs={6} md={4} lg={3}>
                  <ProductListing
                    product={item}
                    showNotification={showNotification}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Popover>
    </>
  );
}
