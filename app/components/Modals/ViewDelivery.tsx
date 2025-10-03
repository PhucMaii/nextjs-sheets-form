import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { generateImgUrl } from '@/app/lib/s3';
import { formatTime } from '@/app/utils/time';
import { formatDate } from '@/app/utils/time';
import { Box, IconButton, Modal, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface PropTypes extends ModalProps {
  order: Order;
  isDisableCloseOnClickOutside?: boolean;
}

export default function ViewDelivery({ open, onClose, order, isDisableCloseOnClickOutside = false }: PropTypes) {
    const [imageUrl, setImageUrl] = useState<string>('');

    // Helper: check if two dates are the same day (local time)
    function isToday(date: Date): boolean {
        const now = new Date()
        return (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate()
        )
    }

    const deliveredAtRaw = order?.delivery?.deliveredAt
    const deliveredAtDate = deliveredAtRaw ? new Date(deliveredAtRaw) : null
    const deliveredToday = deliveredAtDate ? isToday(deliveredAtDate) : false

    useEffect(() => {
        if (order?.delivery?.medias?.length > 0) {
            setImageUrl(generateImgUrl(order?.delivery?.medias[0]?.fileKey, false));
            console.log('url', imageUrl); 
        } else {
            setImageUrl('/images/not-found.png');
        }
    }, [order?.delivery?.medias]);
  return (
    <Modal open={open} onClose={isDisableCloseOnClickOutside ? () => {} : onClose}>
      <BoxModal maxHeight="80vh" overflow="auto">
        <Box display="flex" justifyContent="flex-end">
            <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="h6" fontSize={40} textAlign="center">
          🚚
        </Typography>
        {deliveredAtDate && (
          <Typography variant="subtitle1" textAlign="center">
            {deliveredToday
              ? `Your order has been delivered today at ${formatTime(deliveredAtDate)}`
              : `Your order has been delivered on ${formatDate(deliveredAtDate)} at ${formatTime(deliveredAtDate)}`}
          </Typography>
        )}
        <Box display="flex" justifyContent="center" alignItems="center">
          <Image
            src={imageUrl || '/images/not-found.png'}
            alt="delivery"
            width={300}
            height={300}
            style={{
              objectFit: 'contain',
            }}
          />
        </Box>
      </BoxModal>
    </Modal>
  );
}
