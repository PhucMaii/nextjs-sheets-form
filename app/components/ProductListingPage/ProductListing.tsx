import { generateImgUrl } from '@/app/lib/s3';
import { IItem } from '@/app/utils/type';
import {
  landingPagePrimaryColor,
} from '@/constant/landingPage';
import { addItemToCartAsync } from '@/state/cart/cartSlice';
import { AppDispatch, RootState } from '@/state/store';
import { LoadingButton } from '@mui/lab';
import { AlertColor, Box, Typography } from '@mui/material';
import { green, grey, red } from '@mui/material/colors';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChooseOption from '../ChooseOption';
import { OnSaleBadge } from '../OrderView';
import Image from 'next/image';

interface IProps {
  product: IItem;
  showNotification: (type: AlertColor, message: string) => void;
  onClick?: () => void;
  // containerStyle?: any;
}

export default function ProductListing({
  product,
  onClick,
  showNotification,
  // containerStyle,
}: IProps) {
  console.log('product', product);
  const [isOpenChooseOption, setIsOpenChooseOption] = useState<boolean>(false);

  const [img, setImg] = useState<string | undefined>(undefined);
  // const [cartId, setCartId] = useLocalStorage('cartId', '');

  const cart = useSelector((state: RootState) => state.cart);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (product?.image || product?.inventoryItem?.image) {
      generateImgUrl(product?.image || product?.inventoryItem?.image).then(
        (img) => {
          setImg(img);
        },
      );
    }
  }, [product]);

  // Discount Percentage for options
  const discountPercent = useMemo(() => {
    if (product?.options && product?.options?.length > 0) {
      return product?.options?.reduce((max, option) => {
        if (option?.prevPrice && option?.isShowDiscount) {
          return Math.max(
            max,
            Math.ceil((1 - option.price / option.prevPrice) * 100),
          );
        }
        return max;
      }, 0);
    }
    return 0;
  }, [product?.options]);

  const smallestOptionPrice = useMemo(() => {
    return product?.options?.reduce((min, option) => {
      return Math.min(min, option.price);
    }, Infinity);
  }, [product?.options]);

  const onAddToCart = async (e: any, option: any = null) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      const resultAction = await dispatch(
        addItemToCartAsync({
          cartId: cart.id,
          item: {
            quantity: 1,
            item: product,
            id: product.id,
            option,
          },
        }),
      );

      if (addItemToCartAsync.fulfilled.match(resultAction)) {
        const { message } = resultAction.payload;
        showNotification('success', message);
        // setCartId(data.id);
      } else if (addItemToCartAsync.rejected.match(resultAction)) {
        const error: any = resultAction.payload || resultAction.error;
        showNotification(
          'error',
          error?.message || 'Failed to add item to cart',
        );
      }
      setIsAdding(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong. Please try again later');
      setIsAdding(false);
    }
  };

  return (
    <>
      <ChooseOption
        open={isOpenChooseOption}
        onClose={() => setIsOpenChooseOption(false)}
        options={product?.options || []}
        onAddOption={onAddToCart}
      />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        // alignItems="center"
        flexGrow={1}
        gap={1}
        sx={{
          height: '100%',
          maxWidth: '300px',
          minWidth: '200px',
          cursor: 'pointer',
          p: 2,
          borderRadius: 1,
          '&:hover': {
            border: `1px solid ${grey[300]}`,
          },
        }}
        position="relative"
        onClick={onClick}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {(discountPercent || product?.isShowDiscount) && (
          <Box position="absolute" top={30} right={20}>
            <OnSaleBadge
              discountPrice={product?.price}
              prevPrice={product?.prevPrice || 0}
              percentage={discountPercent || 0}
            />
          </Box>
        )}
        <Image
          src={img || '/images/landing/image_not_found.jpeg'}
          alt={product?.name || product?.inventoryItem?.name}
          width={200}
          height={200}
          style={{ borderRadius: '20px', width: '100%', height: 200 }}
          loading="lazy"
        />
        <Typography
          variant="h6"
          fontWeight="semibold"
          sx={{
            // textAlign: 'center',
            height: '50px',
            overflow: 'hidden',
            // textOverflow: 'ellipsis',
            whiteSpace: 'wrap',
          }}
          // sx={{ color: green[800] }}
        >
          {product?.name || product.inventoryItem.name}
        </Typography>
        <div style={{ flexGrow: 1 }} />
        <Box display="flex" alignItems="flex-end" gap={1}>
          <Typography
            variant="h5"
            fontWeight="semibold"
            sx={{
              color:
                product?.isShowDiscount && product?.prevPrice
                  ? red[600]
                  : green[900],
            }}
          >
            {!product?.availability
              ? 'N/A'
              : product?.options && product?.options?.length > 0
                ? `From $${smallestOptionPrice?.toFixed(2)}`
                : `$${product?.price?.toFixed(2) || 'N/A'}`}
          </Typography>
          {product?.isShowDiscount && product?.prevPrice && (
            <Typography
              variant="body1"
              sx={{ color: green[900], textDecoration: 'line-through' }}
            >
              ${product.prevPrice.toFixed(2)}
            </Typography>
          )}
        </Box>
        <LoadingButton
          variant="outlined"
          fullWidth
          loading={isAdding}
          onClick={(e: any) => {
            e.stopPropagation();
            if (product?.options && product?.options?.length > 0) {
              setIsOpenChooseOption(true);
            } else {
              onAddToCart(e);
            }
          }}
          disabled={!product?.availability}
          sx={{
            // backgroundColor: landingPagePrimaryColor,
            borderColor: landingPagePrimaryColor,
            alignSelf: 'flex-end',
            color: landingPagePrimaryColor,
            borderRadius: 2,
            ':hover': {
              backgroundColor: landingPagePrimaryColor,
              color: 'white',
            },
          }}
        >
          {/* If product has options, show choose option button */}
          {product?.options && product?.options?.length > 0
            ? 'Choose Option'
            : product?.availability
              ? 'Add to cart'
              : 'Out of stock'}
        </LoadingButton>
      </Box>
    </>
  );
}
