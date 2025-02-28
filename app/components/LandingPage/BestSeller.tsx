import { generateImgUrl } from '@/app/lib/s3';
import { API_URL } from '@/app/utils/enum';
import {
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { Box, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BestSeller() {
  const [bestSellerItems, setBestSellerItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get(
          `${API_URL.PUBLIC}/products/best-seller`,
        );

        if (response.data.error) {
          return;
        }

        setBestSellerItems(response.data.data);
      } catch (error: any) {
        console.log('Internal Server Error: ', error);
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={4}
      p={4}
      sx={{ backgroundColor: landingPageSecondaryColor }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        sx={{ color: 'white' }}
      >
        Our Best Sellers
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        gap={3}
      >
        {bestSellerItems.map((bestSellerItem: any, index: number) => {
          return (
            <Box
              key={index}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gap={2}
              onClick={() => router.push(`/products/${bestSellerItem.id}`)}
            >
              <img
                src={
                  bestSellerItem?.image
                    ? generateImgUrl(bestSellerItem.image)
                    : '/image/landing/image_not_found.jpeg'
                }
                alt={bestSellerItem.name}
                width={250}
                height={150}
                style={{ borderRadius: 20 }}
              />
              <Typography variant="h5" sx={{ color: 'white' }}>
                {bestSellerItem.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
