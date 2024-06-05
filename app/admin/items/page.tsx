'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import NotificationPopup from '../components/Notification';
import { Notification } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import useCategories from '@/hooks/fetch/useCategories';
import { Category, Item } from '@prisma/client';
import CategorySidebar from '../components/Sidebar/CategorySidebar';
import EditIcon from '@mui/icons-material/Edit';
import { fetchData } from '@/app/utils/db';
import {
  Box,
  Button,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import useDebounce from '@/hooks/useDebounce';

export default function ItemPage() {
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] =
    useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [items, setItems] = useState<Item[]>([]);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const { categories, mutate } = useCategories();
  const [currentCategory, setCurrentCategory] = useState<Category>(
    categories[0],
  );
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (categories.length > 0 && currentCategory) {
      fetchItems();
    }
  }, [categories, currentCategory]);

  const fetchItems = async () => {
    const itemData = await fetchData(
      `${API_URL.ITEM}?categoryId=${currentCategory.id}`,
      setNotification,
    );
    setItems(itemData);
    setIsFetching(false);
  };

  const handleSwitchCurrentCategory = (newCategory: Category) => {
    setCurrentCategory(newCategory);
  };

  return (
    <Sidebar noMargin>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <CategorySidebar
        currentCategory={currentCategory}
        categories={categories}
        handleChangeTab={handleSwitchCurrentCategory}
        isNavOpen={isCategorySidebarOpen}
        setIsNavOpen={setIsCategorySidebarOpen}
      >
        <Grid container alignItems="center">
          <Grid item xs={12} md={10}>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h6">{currentCategory?.name}</Typography>
              <IconButton color="primary">
                <EditIcon />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={2} textAlign="right">
            <Button fullWidth color="error" variant="outlined">
              Delete
            </Button>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="filled"
              label="Search orders"
              placeholder="Search by invoice id, client id, client name or status"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
            />
          </Grid>
        </Grid>
      </CategorySidebar>
    </Sidebar>
  );
}
