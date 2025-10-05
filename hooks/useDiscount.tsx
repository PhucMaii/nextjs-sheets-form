import { Order } from '@/app/admin/[companyId]/orders/page';
import { IItem } from '@/app/utils/type';
import { Typography } from '@mui/material';
import React, { useMemo } from 'react';

export const useDiscount = (items: IItem[], order: Order) => {
  const discountPrice = useMemo(() => {
    if (!items || items.length === 0) {
      return 0;
    }

    const isDiscount = items.some(
      (item: any) => item?.isShowDiscount && item?.prevPrice && item?.prevPrice > 0,
    );

    if (!isDiscount) {
      return 0;
    }

    const discount = items.reduce((acc: number, item: any) => {
      if (item?.isShowDiscount && item?.prevPrice && item?.prevPrice > 0) {
        return acc + item?.prevPrice * item.quantity;
      }

      return acc + item.totalPrice;
    }, 0);

    return discount + (order?.GST || 0) + (order?.PST || 0);
  }, [items]);

  const DiscountText = (
    <Typography sx={{ textDecoration: 'line-through' }} color="error">
      ${discountPrice.toFixed(2)}
    </Typography>
  );

  return {
    discountPrice,
    DiscountText,
  };
};
