'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import NotificationPopup from '../components/Notification';
import { ICategory, IItem, Notification } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import useCategories from '@/hooks/fetch/useCategories';
import { Category } from '@prisma/client';
import CategorySidebar from '../components/Sidebar/CategorySidebar';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';
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
import ItemsTable from '../components/Tables/ItemsTable';
import { ShadowSection } from '../reports/styled';
import { SplashScreen } from '@/app/HOC/AuthenGuard';
import axios from 'axios';
import useSubCategories from '@/hooks/fetch/useSubCategories';

export default function ItemPage() {
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] =
    useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [items, setItems] = useState<IItem[]>([]);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const { categories } = useCategories();
  const { subCategories, isLoading } = useSubCategories();
  const [currentCategory, setCurrentCategory] = useState<ICategory>(
    categories[0],
  );

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (categories.length > 0 && currentCategory) {
      fetchItems();
    }
  }, [categories, currentCategory]);

  const fetchItems = async () => {
    setIsFetching(true);
    const itemData = await fetchData(
      `${API_URL.ITEM}?categoryId=${currentCategory.id}`,
      setNotification,
    );
    setItems(itemData);
    setIsFetching(false);
  };

  const handleDeleteItem = async (targetItem: IItem) => {
    try {
      const response = await axios.delete(API_URL.ITEM, {
        data: { removedId: targetItem.id },
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleDeleteItemUI(targetItem);

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
    }
  };

  const handleDeleteItemUI = (targetItem: IItem) => {
    const newItems = items.filter((item: IItem) => {
      return item.id !== targetItem.id;
    });

    setItems(newItems);
  };

  const handleUpdateItem = async (updatedItem: IItem) => {
    try {
      const response = await axios.put(API_URL.ITEM, {
        updatedItem,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleUpdateItemUI(response.data.data);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
    }
  };

  const handleUpdateItemUI = (updatedItem: IItem) => {
    const newItems = items.map((item: IItem) => {
      if (item.id === updatedItem.id) {
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const switchCurrentCategory = (newCategory: Category) => {
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
        handleChangeTab={switchCurrentCategory}
        isNavOpen={isCategorySidebarOpen}
        setIsNavOpen={setIsCategorySidebarOpen}
      >
        <Grid container alignItems="center">
          <Grid item xs={12} md={10}>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h6">
                {currentCategory?.name} ( {currentCategory?.users?.length}{' '}
                clients )
              </Typography>
              <IconButton>
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
        <ShadowSection sx={{ mt: 2 }}>
          <Grid container alignItems="center" columnSpacing={1}>
            <Grid item xs={12} md={11}>
              <TextField
                fullWidth
                variant="standard"
                label="Search items"
                placeholder="Search by name, price, or subcategory"
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                sx={{ borderRadius: 4 }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <IconButton size="large">
                <AddBoxIcon fontSize="large" color="primary" />
              </IconButton>
            </Grid>
          </Grid>
          {isFetching || isLoading ? (
            <SplashScreen />
          ) : (
            <ItemsTable
              items={items}
              handleDeleteItem={handleDeleteItem}
              subCategories={subCategories}
              handleUpdateItem={handleUpdateItem}
            />
          )}
        </ShadowSection>
      </CategorySidebar>
    </Sidebar>
  );
}
