'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { onSearchItems } from '../utils/array';
import useNotification from '@/hooks/useNotification';

export default function ProductPage() {
  const searchParams: any = useSearchParams();
  const queryParams = searchParams?.get('q');

  const [displayItems, setDisplayItems] = useState<IItemPreference[]>([]);
  const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<IProductType | any>({
    id: 0,
    name: 'All',
  });
  const [sortedBy, setSortedBy] = useState<string>('featured');
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const router = useRouter();

  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const { showNotification, NotificationComp } = useNotification();

  const [allItemPreferences] = SWRFetchData(`${API_URL.PUBLIC}/products`);
  const [types] = SWRFetchData(`${API_URL.PUBLIC}/types`);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  // On search items when query params change
  useEffect(() => {
    if (queryParams !== searchKeywords) {
      setSearchKeywords(queryParams || '');
    }

    if (queryParams) {
      const newDisplayItems = onSearchItems(displayItems || [], queryParams, [
        'inventoryItem.name',
      ]);
      setDisplayItems(newDisplayItems);
    } else {
      if (selectedType?.id === 0) {
        setDisplayItems(allItemPreferences?.data);
      } else {
        setDisplayItems(selectedType?.itemPreferences);
      }
    }
  }, [queryParams]);

  // On select type and render items from that type
  useEffect(() => {
    if (selectedType?.id === 0) {
      setDisplayItems(allItemPreferences?.data);
    } else {
      setDisplayItems(selectedType.itemPreferences);
    }
  }, [allItemPreferences, selectedType]);

  // Update query params when search keywords change
  useEffect(() => {
    if (debouncedKeywords !== queryParams) {
      onUpdateQueryParams();
    }
  }, [debouncedKeywords]);

  // On sort items
  useEffect(() => {
    if (allItemPreferences) {
      const items =
        selectedType.name === 'All'
          ? [...allItemPreferences.data]
          : [...selectedType.itemPreferences];
      if (sortedBy === 'best-sellers') {
        filterBestSellerItems(items);
      } else if (sortedBy === 'a-z' || sortedBy === 'z-a') {
        sortItemsAlphabetically(items);
      } else if (sortedBy === 'price-asc' || sortedBy === 'price-desc') {
        sortByPrice(items);
      } else {
        setDisplayItems(items);
      }
    }
  }, [sortedBy, allItemPreferences, selectedType]);

  const filterBestSellerItems = (items: IItemPreference[]) => {
    if (!allItemPreferences) {
      setDisplayItems([]);
      return;
    }

    const bestSeller = items.filter(
      (item: IItemPreference) => item.isBestSeller,
    );

    const nonBestSeller = items.filter(
      (item: IItemPreference) => !item.isBestSeller,
    );

    // Place the best seller on the top
    setDisplayItems([...bestSeller, ...nonBestSeller]);
  };

  const onUpdateQueryParams = () => {
    const current = new URLSearchParams(searchParams?.entries());

    const value = debouncedKeywords?.trim();

    if (!value) {
      current.delete('q');
    } else {
      current.set('q', value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`/products${query}`);
  };

  const sortItemsAlphabetically = (items: IItemPreference[]) => {
    if (!allItemPreferences) {
      setDisplayItems([]);
      return;
    }

    if (sortedBy === 'a-z') {
      const sortedItems = items.sort(
        (itemA: IItemPreference, itemB: IItemPreference) =>
          itemA.inventoryItem.name.localeCompare(itemB.inventoryItem.name),
      );
      setDisplayItems(sortedItems);
    } else if (sortedBy === 'z-a') {
      const sortedItems = items.sort(
        (itemA: IItemPreference, itemB: IItemPreference) =>
          itemB.inventoryItem.name.localeCompare(itemA.inventoryItem.name),
      );
      setDisplayItems(sortedItems);
    } else {
      setDisplayItems([]);
    }
  };

  const sortByPrice = (items: IItemPreference[]) => {
    if (!allItemPreferences) {
      setDisplayItems([]);
      return;
    }

    if (sortedBy === 'price-asc') {
      const sortedItems = items.sort(
        (itemA: IItemPreference, itemB: IItemPreference) =>
          itemA.price - itemB.price,
      );
      setDisplayItems(sortedItems);
    } else if (sortedBy === 'price-desc') {
      const sortedItems = items.sort(
        (itemA: IItemPreference, itemB: IItemPreference) =>
          itemB.price - itemA.price,
      );
      setDisplayItems(sortedItems);
    } else {
      setDisplayItems([]);
    }
  };

  const renderProductTypes = () => {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mt="150px"
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
          <Box
            display="flex"
            flexDirection={smDown ? 'column' : 'row'}
            alignItems="center"
            gap={1}
          >
            <LucideIcons.ShoppingBasketIcon />
            <Typography>All</Typography>
          </Box>
        </Button>
        {types?.data?.map((type: any, index: number) => {
          const IconComponent: any = type?.icon
            ? LucideIcons[type.icon as keyof typeof LucideIcons]
            : () => <></>;
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
              <Box
                display="flex"
                flexDirection={smDown ? 'column' : 'row'}
                alignItems="center"
                gap={1}
              >
                <IconComponent />
                <Typography>{type.name}</Typography>
              </Box>
            </Button>
          );
        })}
      </Box>
    );
  };

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
        <Typography variant="h3" fontWeight="bold" sx={{ color: green[800] }}>
          {selectedType?.name}
        </Typography>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap={1}
        >
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

          <FormControl sx={{ width: 'fit-content' }}>
            <InputLabel id="sort-by">Sort by</InputLabel>
            <Select
              labelId="sort-by"
              value={sortedBy}
              label="Sort by"
              onChange={(e) => setSortedBy(e.target.value)}
              size="small"
              sx={{ width: 'fit-content' }}
            >
              <MenuItem value="featured">Featured</MenuItem>
              <MenuItem value="best-sellers">Best sellers</MenuItem>
              <MenuItem value="a-z">Alphabetically: A-Z</MenuItem>
              <MenuItem value="z-a">Alphabetically: Z-A</MenuItem>
              <MenuItem value="price-asc">Price: Low to High</MenuItem>
              <MenuItem value="price-desc">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <RequestToJoinModal
        open={isOpenSignUp}
        onClose={() => setIsOpenSignUp(false)}
      />
      {NotificationComp}
      <Box
        sx={{
          pb: 2,
          backgroundColor: 'white',
          maxHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <Navbar setIsOpenSignUp={setIsOpenSignUp} />
        <Box sx={{ maxWidth: '1500px', mx: 'auto' }}>
          {renderProductTypes()}

          <Divider sx={{ my: 1 }} />

          {renderSortAndSearch()}
          {/* Product Display */}
          <Grid
            container
            columnSpacing={2}
            rowGap={4}
            width="100%"
            sx={{ my: 2, px: 4 }}
          >
            {displayItems?.length > 0 ? (
              displayItems?.map((product: IItemPreference, index: number) => {
                return (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={2}
                    key={index}
                    sx={{ height: '370px' }}
                  >
                    <ProductListing
                      product={product}
                      onClick={() => router.push(`/products/${product.id}`)}
                      showNotification={showNotification}
                    />
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <ErrorComponent errorText="No Product Available" />
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </>
  );
}
