import { ModalProps } from '@/app/admin/components/Modals/type';
import { generateImgUrl } from '@/app/lib/s3';
import { IItemPreference } from '@/app/utils/type';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import { Box, Popover, Typography } from '@mui/material';
import { green, grey } from '@mui/material/colors';
import { useRouter } from 'next/navigation';
import React, { Dispatch, SetStateAction } from 'react';

interface IProps extends ModalProps {
  anchorEl: any;
  debouncedKeywords: string;
  searchItems: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SearchPopover({
  open,
  onClose,
  anchorEl,
  debouncedKeywords,
  searchItems,
  setOpen,
}: IProps) {
  const popoverWidth = anchorEl?.getBoundingClientRect().width || 0;
  const router = useRouter();

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onFocus={() => setOpen((prevState: boolean) => !prevState)}
      disableAutoFocus
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      sx={{
        '& .MuiPopover-paper': {
          width: popoverWidth, // Set width dynamically
          maxHeight: '50vh',
          overflowY: 'auto',
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{ width: '100%', py: 2, px: 2 }}
      >
        <Typography>
          You are looking for "<a>{debouncedKeywords}</a>"
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Typography
            variant="subtitle1"
            sx={{ color: green[800] }}
            fontWeight="regular"
          >
            Products
          </Typography>
          {searchItems?.map((item: IItemPreference, index: number) => {
            return (
              <Box
                key={index}
                onClick={() => router.push(`/products/${item.id}`)}
                display="flex"
                alignItems="center"
                gap={1}
                p={1}
                sx={{
                  pointer: 'cursor',
                  '&:hover': { backgroundColor: grey[200] },
                }}
              >
                <img
                  src={
                    item?.image
                      ? generateImgUrl(item?.image)
                      : '/images/landing/image_not_found.jpeg'
                  }
                  alt={item.inventoryItem.name}
                  width={100}
                  height={'100%'}
                  style={{ borderRadius: '20px' }}
                />
                <Typography variant="h6">{item.inventoryItem.name}</Typography>
              </Box>
            );
          })}
        </Box>

        <Box
          component="a"
          href={`/products?q=${debouncedKeywords}`}
          sx={{
            textDecoration: 'underline',
            color: landingPagePrimaryColor,
            cursor: 'pointer',
            '&:hover': {
              color: green[800],
            },
          }}
        >
          <Typography>View All</Typography>
        </Box>
      </Box>
    </Popover>
  );
}
