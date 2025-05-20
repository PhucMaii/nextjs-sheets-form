import { API_URL } from '@/app/utils/enum';
import { maxWidth } from '@/constant/landingPage';
import { Box, Divider, Grid, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ProductListing from '../ProductListingPage/ProductListing';

import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import '../../../styles/swiper.css';
import { IItem, IPromotion } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';

export default function BestSeller() {
  const [bestSeller, setBestSeller] = useState<IItem[]>([]);
  const [promotion, setPromotion] = useState<IPromotion | null>(null);
  // const [weeklySpecials, setWeeklySpecials] = useState<IItemPreference[]>([]);

  // FETCH BEST SELLERS AND POROMOTIONS
  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    const fetchBestSellersAndSpecials = async () => {
      try {
        const response = await axios.get(
          `${API_URL.PUBLIC}/products/best-seller`,
        );

        if (response.data.error) {
          return;
        }

        setBestSeller(response.data.bestSellerItems);
        setPromotion(response.data.promotion);
      } catch (error: any) {
        console.log('Internal Server Error: ', error);
      }
    };

    fetchBestSellersAndSpecials();
  }, []);

  return (
    <>
      {NotificationComp}
      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        px={6}
        py={8}
        sx={{ backgroundColor: 'white' }}
      >
        <Grid
          container
          spacing={4}
          // display="flex"
          justifyContent="center"
          // flexWrap="wrap"
          sx={{
            maxWidth: maxWidth,
            mx: 'auto',
          }}
        >
          <Grid item xs={12}>
            <Typography variant="h3" fontWeight="medium">
              Shop our Best Sellers 📈
            </Typography>
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={50}
              slidesPerView={5}
              // style={{ padding: '20px' }}
            >
              {bestSeller &&
                bestSeller?.map((item: any, index: number) => {
                  return (
                    <SwiperSlide>
                      <ProductListing
                        key={index}
                        product={item}
                          // containerStyle={{
                          //   backgroundColor: 'white',
                          //   height: '100%',
                          // }}
                        showNotification={showNotification}
                      />
                    </SwiperSlide>
                  );
                })}
            </Swiper>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h3" fontWeight="medium">
              {promotion?.title} 💸
            </Typography>
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              navigation
              pagination={{ clickable: true }}
              spaceBetween={50}
              slidesPerView={5}
              style={{ padding: '20px' }}
            >
              {promotion?.websiteItems &&
                promotion?.websiteItems?.map((item: any, index: number) => {
                  return (
                    <SwiperSlide>
                      <ProductListing
                        key={index}
                        product={item}
                        // containerStyle={{
                        //   backgroundColor: 'white',
                        //   height: '100%',
                        // }}
                        showNotification={showNotification}
                      />
                    </SwiperSlide>
                  );
                })}
            </Swiper>
            {/* </Box */}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
