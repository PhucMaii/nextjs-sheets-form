'use client';
import React, { Suspense, useEffect, useState } from 'react';
import {
  Box,
  Button,
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
import { SWRFetchData } from '../utils/db';
import { API_URL } from '../utils/enum';
import { IItem, IProductType } from '../utils/type';
import { green, grey } from '@mui/material/colors';
import * as LucideIcons from 'lucide-react';
import ProductListing from '../components/ProductListingPage/ProductListing';
import useDebounce from '@/hooks/useDebounce';
import RequestToJoinModal from '@/app/components/Modals/RequestToJoinModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { onSearchItems } from '../utils/array';
import useNotification from '@/hooks/useNotification';
import './style.css';
import { maxWidth } from '../lib/constant';
import LoadingComponent from '../components/LoadingComponent/LoadingComponent';
import NavbarWrapper from '../lib/NavbarWrapper';
import ErrorComponent from '../admin/[companyId]/components/ErrorComponent';

// interface ProductPageProps {
//   typeName?: string;
// }

const ProductPage = () => {
  const searchParams: any = useSearchParams();
  const queryParams = searchParams?.get('q');
  const queryType = searchParams?.get('type');

  const [displayItems, setDisplayItems] = useState<IItem[]>([]);
  const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<IProductType | any>();
  const [sortedBy, setSortedBy] = useState<string>('featured');
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const router = useRouter();

  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const { showNotification, NotificationComp } = useNotification();

  const [allItemPreferences] = SWRFetchData(`${API_URL.PUBLIC}/products`);
  const [types] = SWRFetchData(`${API_URL.PUBLIC}/types`);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (queryType && types?.data) {
      const decodedTypeName = decodeURIComponent(queryType.replace(/\+/g, ' '));

      if (decodedTypeName === 'All') {
        setSelectedType({ id: 0, name: 'All' });
        return;
      }

      setSelectedType(
        types?.data?.find((type: any) => type.name === decodedTypeName),
      );
    } else if (!queryType && types?.data) {
      setSelectedType({ id: 0, name: 'All' });
    }
  }, [queryType, types]);

  // Update query params when search keywords change
  useEffect(() => {
    if (debouncedKeywords !== queryParams) {
      onUpdateQueryParams();
    }
  }, [debouncedKeywords]);

  // On search items when query params change
  useEffect(() => {
    if (queryParams) {
      if (queryParams !== searchKeywords) {
        setSearchKeywords(queryParams || '');
      }
      const newDisplayItems = onSearchItems(displayItems || [], queryParams, [
        'inventoryItem.name',
        'inventoryItem.type.name',
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
    // if (selectedType?.id === 0) {
    //   setDisplayItems(allItemPreferences?.data);
    // } else {
    //   // setDisplayItems(selectedType?.itemPreferences);
    //   onUpdateTypeParams();
    // }

    if (selectedType && selectedType?.name !== decodeURIComponent(queryType?.replace(/\+/g, ' '))) {
      onUpdateTypeParams();
    }
  }, [selectedType, types]);

  // On sort items
  useEffect(() => {
    if (allItemPreferences && selectedType) {
      const items =
        selectedType?.name === 'All'
          ? [...allItemPreferences.data]
          : [...selectedType.items];
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

  const filterBestSellerItems = (items: IItem[]) => {
    if (!allItemPreferences) {
      setDisplayItems([]);
      return;
    }

    // const bestSeller = items.filter(
    //   (item: IItem) => item.isBestSeller,
    // );

    // const nonBestSeller = items.filter(
    //   (item: IItem) => !item.isBestSeller,
    // );

    // Place the best seller on the top
    setDisplayItems(items);
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

  const onUpdateTypeParams = () => {
    const current = new URLSearchParams(searchParams?.entries());
    // const typeId = selectedType?.id;
    const selectedTypeName = selectedType?.name;

    if (!selectedTypeName) {
      current.delete('type');
    } else {
      current.set('type', encodeURIComponent(selectedTypeName));
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`/products${query}`);
  };

  const sortItemsAlphabetically = (items: IItem[]) => {
    if (!allItemPreferences) {
      setDisplayItems([]);
      return;
    }

    if (sortedBy === 'a-z') {
      const sortedItems = items.sort(
        (itemA: IItem, itemB: IItem) =>
          itemA.inventoryItem.name.localeCompare(itemB.inventoryItem.name),
      );
      setDisplayItems(sortedItems);
    } else if (sortedBy === 'z-a') {
      const sortedItems = items.sort(
        (itemA: IItem, itemB: IItem) =>
          itemB.inventoryItem.name.localeCompare(itemA.inventoryItem.name),
      );
      setDisplayItems(sortedItems);
    } else {
      setDisplayItems([]);
    }
  };

  const sortByPrice = (items: IItem[]) => {
    if (!allItemPreferences) {
      setDisplayItems([]);
      return;
    }

    if (sortedBy === 'price-asc') {
      const sortedItems = items.sort(
        (itemA: IItem, itemB: IItem) =>
          itemA.price - itemB.price,
      );
      setDisplayItems(sortedItems);
    } else if (sortedBy === 'price-desc') {
      const sortedItems = items.sort(
        (itemA: IItem, itemB: IItem) =>
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
        alignItems={smDown ? 'flex-end' : 'flex-start'}
        gap={2}
        sx={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
      >
        <Button
          onClick={() => setSelectedType({ id: 0, name: 'All' })}
          variant="contained"
          sx={{
            borderRadius: 2,
            minWidth: 150,
            width: 'fit-content',
            backgroundColor: 'white',
            color: selectedType?.id === 0 ? green[900] : 'black',
            boxShadow: 'none',
            '&:hover': {
              color: green[900],
              backgroundColor: 'white',
              boxShadow: 'none',
            },
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            <Box
              display="flex"
              flexDirection={smDown ? 'column' : 'row'}
              alignItems="center"
              gap={1}
            >
              <LucideIcons.ShoppingBasketIcon />
              <Typography fontWeight="medium">All</Typography>
            </Box>
            <div
              style={{
                width: selectedType?.id === 0 ? '100%' : '0%',
                height: '2px',
                backgroundColor: green[800],
                transition: 'width 0.3s ease-in-out',
              }}
            ></div>
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
                // px: 2,
                // py: 1,
                borderRadius: 2,
                width: 'fit-content',
                backgroundColor: 'white',
                color: selectedType?.id === type.id ? green[800] : 'black',
                boxShadow: 'none',
                minWidth: 200,
                '&:hover': {
                  color: green[500],
                  backgroundColor: 'white',
                  boxShadow: 'none',
                },
              }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap={1}
              >
                <Box
                  display="flex"
                  flexDirection={smDown ? 'column' : 'row'}
                  alignItems="center"
                  gap={1}
                >
                  <IconComponent />
                  <Typography fontWeight="medium">{type.name}</Typography>
                </Box>
                <div
                  style={{
                    width: selectedType?.id === type.id ? '100%' : '0%',
                    height: '2px',
                    backgroundColor: green[800],
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </Box>
            </Button>
          );
        })}
      </Box>
    );
  };

  const renderSortAndSearch = () => {
    return (
      <Grid
        container
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        width="100%"
        mt={2}
        spacing={1}
        sx={{ px: 2 }}
      >
        <Grid item xs={10}>
          <TextField
            value={searchKeywords}
            onChange={(e) => setSearchKeywords(e.target.value)}
            placeholder="Search"
            size="small"
            fullWidth
            sx={{
              backgroundColor: grey[50],
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
        </Grid>
        <Grid item xs={2} textAlign="right">
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
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="semibold" sx={{ my: 2 }}>
            {selectedType?.name}
          </Typography>
        </Grid>

        {/* </Box> */}
      </Grid>
    );
  };

  return (
    <NavbarWrapper>
      <RequestToJoinModal
        open={isOpenSignUp}
        onClose={() => setIsOpenSignUp(false)}
      />
      {NotificationComp}

      <Box
        sx={{
          backgroundColor: 'white',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            maxWidth: maxWidth,
            mx: 'auto',
            pt: 4,
          }}
        >
          {renderProductTypes()}

          {/* <Divider sx={{ my: 1 }} /> */}

          {renderSortAndSearch()}
          {/* Product Display */}
          <Grid
            container
            rowGap={4}
            width="100%"
            sx={{ 
              my: 2, 
              px: 2,
              display: "flex",
              flexWrap: "wrap"
            }}
          >
            {displayItems?.length > 0 ? (
              displayItems?.map((product: IItem, index: number) => {
                return (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2}
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "stretch"
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <ProductListing
                        product={product}
                        onClick={() => router.push(`/products/${product.id}`)}
                        showNotification={showNotification}
                        // containerStyle={{
                        //   width: "100%",
                        //   height: "100%",
                        //     display: "flex",
                        //     flexDirection: "column"
                        //   }}
                      />
                    </Box>
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
      {/* <Footer /> */}
    </NavbarWrapper>
  );
};

export default function page() {
  return (
    <Suspense
      fallback={
        <div>
          <LoadingComponent />
        </div>
      }
    >
      <ProductPage />
    </Suspense>
  );
}
