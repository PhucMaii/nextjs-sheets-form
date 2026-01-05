import {
  Box,
  ClickAwayListener,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { tooltipClasses } from '@mui/material/Tooltip';
import { TooltipProps } from '@mui/material/Tooltip';
import { Tooltip } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import StatusText from '../StatusText';
import { ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '../../orders/page';
import SellIcon from '@mui/icons-material/Sell';
import { ShadowSection } from '../../reports/styled';
import { generateImgUrl } from '@/app/lib/s3';
import { grey } from '@mui/material/colors';
import Image from 'next/image';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 1000,
    fontSize: theme?.typography?.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));

const QuickViewItem = ({ item }: { item: any }) => {
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    if (item?.inventoryItem?.image) {
      setImgUrl(generateImgUrl(item.inventoryItem.image, false));
    } else {
      setImgUrl('/images/not-found.png');
    }
  }, [item?.inventoryItem?.image]);

    // const getImgUrl = async () => {
    //   const imgLink = await generateImgUrl(item.inventoryItem.image);
    //   setImgUrl(imgLink);
    // };

  return (
    <Grid container spacing={2} sx={{ width: `100%` }} alignItems="flex-start">
      <Grid item xs={3}>
        <Image
          src={imgUrl}
          alt={item?.inventoryItem?.name || item?.name}
          width={40}
          height={40}
          loading="lazy"
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1">{item?.inventoryItem?.name || item?.name}</Typography>
        {item?.inventoryItem?.sku && (
          <Typography variant="caption" sx={{ color: grey[700] }}>
            {item?.inventoryItem?.sku}
          </Typography>
        )}
      </Grid>
      <Grid item xs={3} sx={{ textAlign: `right` }}>
        <Typography variant="subtitle1" sx={{fontWeight: 'regular'}}>x {item?.quantity}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </Grid>
  );
};

const QuickViewOrderedItems = ({ order, isTable, placement = 'top-start' }: { order: Order, isTable?: boolean, placement?: TooltipProps['placement'] }) => {
  const [open, setOpen] = useState<boolean>(false);

  const totalQty = useMemo(() => {
    const totalItems = order.items.reduce((acc: number, cV: any) => {
      return acc + cV.quantity;
    }, 0);

    return totalItems;
  }, [order.items]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
        <HtmlTooltip
          open={open}
          onClose={() => setOpen(false)}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          //   onOpen={() => setOpen(true)}
          title={
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              sx={{ maxHeight: '80vh', overflowY: 'auto', cursor: 'pointer' }}
            >
              <StatusText
                text={order.status}
                type={
                  order.status === ORDER_STATUS.COMPLETED
                    ? 'success'
                    : order.status === ORDER_STATUS.DELIVERED
                      ? 'info'
                      : order.status === ORDER_STATUS.INCOMPLETED
                        ? 'warning'
                        : 'error'
                }
              />
              <ShadowSection display="flex" flexDirection="column" gap={1}>
                {order?.items &&
                  order.items.map((item: any) => (
                    <QuickViewItem key={item.id} item={item} />
                  ))}
              </ShadowSection>
            </Box>
          }
          placement={placement}
        >
          <Box
            display="flex"
            gap={1}
            alignItems="center"
            sx={{
              cursor: 'pointer',
              width: 'fit-content',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.5s scale',
              },
            }}
            onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();

                if (open) {
                    setOpen(false);
                } else {
                    setOpen(true);
                }
            }}
          >
            {!isTable ? <SellIcon color="primary" /> : <></>}
            <Typography color={!isTable ? 'primary' : ''} variant={isTable ? 'body1' : 'subtitle1'}>
              {totalQty} {isTable ? 'items' : ''}
            </Typography>
          </Box>
        </HtmlTooltip>
      </div>
    </ClickAwayListener>
  );
};

export default QuickViewOrderedItems;
