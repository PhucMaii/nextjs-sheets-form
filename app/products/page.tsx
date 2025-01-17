'use client';
import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, useMediaQuery } from '@mui/material';
import Navbar from '../components/LandingPage/Navbar';
import { SWRFetchData } from '../utils/db';
import { API_URL } from '../utils/enum';
import { IItemPreference, IProductType } from '../utils/type';
import { green, grey } from '@mui/material/colors';
import { landingPageSecondaryColor } from '@/constant/landingPage';
import * as LucideIcons from 'lucide-react';
import ProductListing from '../components/ProductListingPage/ProductListing';
import useDebounce from '@/hooks/useDebounce';
import ErrorComponent from '../admin/components/ErrorComponent';
import RequestToJoinModal from '../components/Modals/RequestToJoinModal';
// import NavbarWrapper from '../lib/NavbarWrapper';

export default function ProductPage() {
  // const [bestSellerItems, setBestSellerItems] = useState<IItemPreference[]>([]);
  const [displayItems, setDisplayItems] = useState<IItemPreference[]>([]);
  const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<
    IProductType | any
  >({ id: 0, name: 'All' });
  const [sortedBy, setSortedBy] = useState<string>('name');
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const [allItemPreferences] = SWRFetchData(`${API_URL.PUBLIC}/products`)
  const [types] = SWRFetchData(`${API_URL.PUBLIC}/types`);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (selectedType?.id === 0) {
      // const bestSeller = allItemPreferences?.data?.filter(
      //   (item: IItemPreference) => item.isBestSeller
      // );
      const nonBestSeller = allItemPreferences?.data?.filter(
        (item: IItemPreference) => !item.isBestSeller
      );

      // setBestSellerItems(bestSeller);
      setDisplayItems(nonBestSeller);
    } else {
      // setBestSellerItems([]);
      setDisplayItems(selectedType.itemPreferences);
    }
  }, [allItemPreferences, selectedType]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newDisplayItems = (selectedType?.id === 0 ? allItemPreferences?.data : selectedType?.itemPreferences)?.filter(
        (item: IItemPreference) => {
          return (
            item.inventoryItem.name.toLowerCase().includes(debouncedKeywords.toLowerCase()) || 
            item.description.toLowerCase().includes(debouncedKeywords.toLowerCase())
          )}
          );
      // const bestSeller = newDisplayItems?.filter(
      //   (item: IItemPreference) => item.isBestSeller
      // )
      const nonBestSeller = newDisplayItems?.filter(
        (item: IItemPreference) => !item.isBestSeller
      )
      // setBestSellerItems(bestSeller);
      setDisplayItems(nonBestSeller);
    } else {
      if (selectedType?.id === 0) {
        // const bestSeller = allItemPreferences?.data?.filter(
        //   (item: IItemPreference) => item.isBestSeller
        // )
        const nonBestSeller = allItemPreferences?.data?.filter(
          (item: IItemPreference) => !item.isBestSeller
        )
        // setBestSellerItems(bestSeller);
        setDisplayItems(nonBestSeller);
      } else {
        // setBestSellerItems([]);
        setDisplayItems(selectedType?.itemPreferences);
      }
    }
    
    }, [debouncedKeywords]);

  
  const renderProductTypes = () => {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mt="80px"
        sx={{ overflowX: 'auto', whiteSpace: 'nowrap', px: 6, py: 2 }}
      >
        <Button
          onClick={() => setSelectedType({ id: 0, name: 'All' })}
          variant="contained"
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            minWidth: 150,
            backgroundColor:
              selectedType?.id === 0 ? landingPageSecondaryColor : grey[200],
            color: selectedType?.id === 0 ? 'white' : 'black',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor:
                selectedType?.id === 0 ? landingPageSecondaryColor : grey[300],
            },
          }}
        >
          <Box display="flex" flexDirection={smDown ? 'column' : 'row'} alignItems="center" gap={1} >
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
                width: 'fit-content',
                backgroundColor:
                  selectedType?.id === type.id
                    ? landingPageSecondaryColor
                    : grey[200],
                color: selectedType?.id === type.id ? 'white' : 'black',
                boxShadow: 'none',
                minWidth: 150,
                '&:hover': {
                  backgroundColor:
                    selectedType?.id === type.id
                      ? landingPageSecondaryColor
                      : grey[300],
                },
              }}
            >
              <Box display="flex" flexDirection={smDown ? 'column' : 'row'} alignItems="center" gap={1}>
                <IconComponent />
                <Typography>{type.name}</Typography>
              </Box>
            </Button>
          );
        })}
      </Box>
    )
  }

  const renderSortAndSearch = () => {
    return (
      <Box 
        display="flex" 
        flexWrap="wrap" 
        alignItems="center" 
        justifyContent="space-between" 
        px={6}
        mt={2}
      >
        <Typography variant="h3" fontWeight="bold" sx={{color: green[800]}}>
          ALL
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
          <TextField 
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="Search"
            size="small"
            sx={{
              maxWidth: '500px', 
              backgroundColor: grey[200], 
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2, // Applies border radius to the input's outline
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LucideIcons.SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{width: 'fit-content'}}>
            <InputLabel id="sort-by">Sort by</InputLabel>
            <Select
              labelId="sort-by"
              value={sortedBy}
              label="Sort by"
              onChange={(e) => setSortedBy(e.target.value)}
              size="small"
              sx={{width: 'fit-content'}}
            >
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    )
  }

  return (
    <>
    <RequestToJoinModal open={isOpenSignUp} onClose={() => setIsOpenSignUp(false)} />
    <Box sx={{pb: 2, backgroundColor: 'white', height: '100%'}}>
      <Navbar setIsOpenSignUp={setIsOpenSignUp} />
      {renderProductTypes()}

      <Divider sx={{my: 1}} />

      {renderSortAndSearch()}
      {/* Product Display */}
      <Grid container columnSpacing={2} rowGap={4} width="100%" sx={{my: 2, px: 4}}>
        {
          displayItems?.length > 0 ? displayItems?.map((product: IItemPreference, index: number) => {
            return (
              <Grid item xs={6} sm={4} md={2} key={index} sx={{height: '370px'}}>
                <ProductListing product={product} />
              </Grid>
            );
          }) : (
            <Grid item xs={12}>
              <ErrorComponent errorText='No Product Available' />
            </Grid>
          )
        }
      </Grid>
    </Box>
    </>
  );
}
