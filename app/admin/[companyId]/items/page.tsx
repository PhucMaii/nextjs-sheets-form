'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  OutlinedInput,
  Skeleton,
  Typography,
} from '@mui/material';
import { FoldersIcon, SearchIcon } from 'lucide-react';
import useInventoryItems from '@/hooks/autocomplete/useInventoryItems';
import { useCategory } from '@/hooks/autocomplete/useCategory';
import Sidebar from '../components/Sidebar/Sidebar';
import CategoryTable from '../components/Tables/CategoryTable';
import { ShadowSection } from '../reports/styled';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useDebounce from '@/hooks/useDebounce';
import { ICategory } from '@/app/utils/type';
import AddCategory from '../components/Modals/add/AddCategory';
import useNotification from '@/hooks/useNotification';

const ItemPage = () => {
  const router = useRouter();
  const { companyId }: any = useParams();
  const { selectedInventoryItem, renderInventoryItemSearch } =
    useInventoryItems();
  const { categories, fetchCategories, selectedCategory, renderCategorySearch, isLoading } =
    useCategory(false, selectedInventoryItem?.listingCategories || []);

  const { showNotification, NotificationComp } = useNotification();

  const [displayCategories, setDisplayCategories] = useState<ICategory[]>([]);
  const [isOpenAddCategory, setIsOpenAddCategory] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedSearchKeywords = useDebounce(searchKeywords, 500);

  useEffect(() => {
    if (debouncedSearchKeywords) {
      const filteredCategories = categories.filter((category) =>
        category.name
          .toLowerCase()
          .includes(debouncedSearchKeywords.toLowerCase()),
      );
      setDisplayCategories(filteredCategories);
    } else if (categories.length > 0) {
      setDisplayCategories(categories);
    }
  }, [debouncedSearchKeywords, categories]);

  const handleQuickSearch = () => {
    if (!selectedCategory?.items || !selectedInventoryItem) return;

    const sellingItem = selectedCategory?.items.find(
      (item: any) => item.inventoryItemId === selectedInventoryItem?.id,
    );

    if (sellingItem) {
      router.push(`/admin/${companyId}/items/${sellingItem.id}`);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <AddCategory 
        open={isOpenAddCategory}
        onClose={() => setIsOpenAddCategory(false)}
        showNotification={showNotification}
        // mutateCategories={fetchCategories}
        isNavigateToCategory
      />
      <Typography variant="h5">Items</Typography>

      <ShadowSection>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="subtitle1">Quick Search</Typography>
          <SearchIcon style={{ width: 16, height: 16 }} />
        </Box>
        <Divider sx={{ my: 1 }} />

        <Grid container spacing={1} alignItems="center">
          <Grid item xs={6} md={5}>
            {renderInventoryItemSearch()}
          </Grid>
          <Grid item xs={6} md={5}>
            {renderCategorySearch()}
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              onClick={handleQuickSearch}
              disabled={!selectedCategory?.items || !selectedInventoryItem}
              variant="contained"
              color="primary"
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </ShadowSection>

      <ShadowSection>
        <Box display="flex" gap={1} alignItems="center" justifyContent="space-between">
          <Box display="flex" gap={1} alignItems="center">
            <Typography variant="subtitle1">Categories</Typography>
            <FoldersIcon style={{ width: 16, height: 16 }} />
          </Box>

          <Button variant="outlined" color="primary" onClick={() => setIsOpenAddCategory(true)}>
            + Add Category
          </Button>

        </Box>
        <Divider sx={{ my: 1 }} />

        {isLoading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : (
          <Box>
            <OutlinedInput
              placeholder="Search"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              fullWidth
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon style={{ width: 16, height: 16 }} />
                </InputAdornment>
              }
            />
            <CategoryTable categories={displayCategories} />
          </Box>
        )}
      </ShadowSection>
    </Sidebar>
  );
};

export default ItemPage;
