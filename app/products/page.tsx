'use client';
import React, { useMemo, useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import Navbar from '../components/LandingPage/Navbar';
import ProductHeader from '../components/ProductListingPage/ProductHeader';
import { SWRFetchData } from '../utils/db';
import { API_URL } from '../utils/enum';
import { IItemPreference, IProductType } from '../utils/type';
import { grey } from '@mui/material/colors';
import { landingPageSecondaryColor } from '@/constant/landingPage';
import * as LucideIcons from 'lucide-react';
import ProductListing from '../components/ProductListingPage/ProductListing';

export default function ProductPage() {
  const [selectedType, setSelectedType] = useState<
    IProductType | any
  >({ id: 0, name: 'All' });

  const [allItemPreferences] = SWRFetchData(`${API_URL.PUBLIC}/products`)
  const [types] = SWRFetchData(`${API_URL.PUBLIC}/types`);

  const filteredItems: any = useMemo(() => {
    if (selectedType?.id !== 0) {
      return [];
    }


    const bestSeller = allItemPreferences?.data?.filter((item: IItemPreference) => item.isBestSeller);
    const nonBestSeller = allItemPreferences?.data?.filter((item: IItemPreference) => !item.isBestSeller);

    return {
      bestSeller,
      nonBestSeller,
    };
  }, [allItemPreferences, selectedType]);

  return (
    <Box sx={{pb: 2}}>
      <Navbar />
      <Box display="flex" flexDirection="column" gap={2} py={3} px={6}>
        <ProductHeader />
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={2}
        sx={{ maxWidth: '100%', overflowX: 'auto', px: 6, py: 2 }}
      >
        <Button
          onClick={() => setSelectedType({ id: 0, name: 'All' })}
          variant="contained"
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor:
              selectedType?.id === 0 ? landingPageSecondaryColor : grey[200],
            color: selectedType?.id === 0 ? 'white' : 'black',
            '&:hover': {
              backgroundColor:
                selectedType?.id === 0 ? landingPageSecondaryColor : grey[300],
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <LucideIcons.ShoppingBasketIcon />
            <Typography>All</Typography>
          </Box>
        </Button>
        {types?.data?.map((type: any, index: number) => {
          const IconComponent: any = type?.icon ? LucideIcons[type.icon as keyof typeof LucideIcons] : () => <></>;
          return (
            <Button
              key={index}
              onClick={() => setSelectedType(type)}
              variant="contained"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor:
                  selectedType?.id === type.id
                    ? landingPageSecondaryColor
                    : grey[200],
                color: selectedType?.id === type.id ? 'white' : 'black',
                '&:hover': {
                  backgroundColor:
                    selectedType?.id === type.id
                      ? landingPageSecondaryColor
                      : grey[300],
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <IconComponent />
                <Typography>{type.name}</Typography>
              </Box>
            </Button>
          );
        })}
      </Box>

      {/* Product Display */}
      <Grid container columnSpacing={2} rowGap={2} width="100%" sx={{my: 2}}>
        {
          selectedType?.id === 0 ? (
            <>
            <Grid item xs={12}>
              <Typography variant="h5" fontWeight="bold" sx={{px: 6}}>Best Sellers</Typography>
            </Grid>
              {filteredItems?.bestSeller?.map((product: IItemPreference, index: number) => {
                return (
                  <Grid item xs={12} md={4} lg={3} xl={2} key={index}>
                    <ProductListing product={product} />
                  </Grid>
                );
              })}
              <Grid item xs={12}>
              <Typography variant="h5" fontWeight="bold" sx={{px: 6, mt: 2}}>Top Notch Quality Item</Typography> 
            </Grid>
                {filteredItems?.nonBestSeller?.map((product: IItemPreference, index: number) => {
                return (
                  <Grid item xs={12} md={4} lg={3} xl={2} key={index}>
                    <ProductListing product={product} />
                  </Grid>
                );
              })}
            </>
          ) : (
              selectedType.itemPreferences.map((product: IItemPreference, index: number) => {
                return (
                  <Grid item xs={12} sm={4} md={2} key={index}>
                    <ProductListing product={product} />
                  </Grid>
                );
              })
            
          )
        }
      </Grid>
    </Box>
  );
}
