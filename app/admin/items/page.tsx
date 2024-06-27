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
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import useDebounce from '@/hooks/useDebounce';
import { ShadowSection } from '../reports/styled';
import { SplashScreen } from '@/app/HOC/AuthenGuard';
import axios from 'axios';
import useSubCategories from '@/hooks/fetch/useSubCategories';
import AddItem from '../components/Modals/add/AddItem';
import DeleteModal from '../components/Modals/delete/DeleteModal';
import EditCategory from '../components/Modals/edit/EditCategory';
import { Reorder } from 'framer-motion';
import Item from '../components/Reorder/Item';
import { LoadingButton } from '@mui/lab';

export default function ItemPage() {
  const [baseItems, setBaseItems] = useState<IItem[]>([]);
  const [isAddItem, setIsAddItem] = useState<boolean>(false);
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] =
    useState<boolean>(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditCategory, setIsEditCategory] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [items, setItems] = useState<IItem[]>([]);
  const [isSavingArrangement, setIsSavingArrangement] =
    useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const { categories, mutate } = useCategories();
  const { subCategories, isLoading } = useSubCategories();
  const [currentCategory, setCurrentCategory] = useState<ICategory>(
    categories[0],
  );

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (categories.length > 0 && !currentCategory) {
      setCurrentCategory(categories[0]);
    }

    if (categories.length > 0 && currentCategory) {
      let targetIndex = 0;
      categories.forEach((category: Category, index: number) => {
        if (category.id === currentCategory.id) {
          targetIndex = index;
          return;
        }
      });
      setCurrentCategory(categories[targetIndex]);
    }
  }, [categories]);

  useEffect(() => {
    if (categories.length > 0 && currentCategory) {
      fetchItems();
    }
  }, [categories, currentCategory]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newItems = baseItems.filter((item: IItem) => {
        if (
          item.name.toLowerCase().includes(debouncedKeywords.toLowerCase()) ||
          item.price == parseInt(debouncedKeywords) ||
          item?.subCategory?.name
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
      setItems(newItems);
    } else {
      setItems(baseItems);
    }
  }, [debouncedKeywords]);

  const checkIsNewItemValid = (newItem: IItem) => {
    if (
      newItem.name.trim() === '' ||
      newItem.price < 0 ||
      !newItem.categoryId
    ) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Your input data is invalid',
      });
      return false;
    }
    return true;
  };

  const fetchItems = async () => {
    setIsFetching(true);
    const itemData = await fetchData(
      `${API_URL.ITEM}?categoryId=${currentCategory.id}`,
      setNotification,
    );
    setItems(itemData);
    setBaseItems(itemData);
    setIsFetching(false);
  };

  const handleAddItem = async (newItem: IItem) => {
    try {
      const isNewItemValid = checkIsNewItemValid(newItem);
      if (!isNewItemValid) {
        return;
      }
      const response = await axios.post(API_URL.ITEM, { newItem });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleAddItemUI(response.data.data);

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
      return;
    }
  };

  const handleAddItemUI = (newItem: IItem) => {
    setItems([...items, newItem]);
    setBaseItems([...items, newItem]);
  };

  const handleDeleteCategory = async (targetObj: any) => {
    try {
      const response = await axios.delete(API_URL.CATEGORIES, {
        data: { categoryId: targetObj?.id },
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      mutate();
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
    setBaseItems(newItems);
  };

  const handleUpdateCategoryName = async (newName: string) => {
    if (newName.trim() === '') {
      setNotification({
        on: true,
        type: 'error',
        message: 'Item Name Must Not Be Blank',
      });
      return;
    }
    try {
      const response = await axios.put(API_URL.CATEGORIES, {
        updatedCategory: {
          id: currentCategory.id,
          name: newName,
        },
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      mutate();

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
    setBaseItems(newItems);
  };

  const saveItemArrangement = async () => {
    try {
      setIsSavingArrangement(true);
      const newListWithId = items.map((item: IItem, index: number) => {
        const newOrderId = baseItems[index].id;
        return { ...item, id: newOrderId };
      });

      const updatedIdList = newListWithId.map((item: IItem) => item.id);

      const response = await axios.put(`${API_URL.ITEM}/reArrangement`, {
        removedItemIdList: updatedIdList,
        updatedItemList: newListWithId,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsSavingArrangement(false);
        return;
      }

      await fetchItems();

      setIsSavingArrangement(false);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('There was an error in rearrangement: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error in rearrangement: ' + error,
      });
      setIsSavingArrangement(false);
    }
  };

  const switchCurrentCategory = (newCategory: Category) => {
    setCurrentCategory(newCategory);
  };

  return (
    <Sidebar noMargin>
      <AddItem
        open={isAddItem}
        onClose={() => setIsAddItem(false)}
        subCategories={subCategories}
        categoryId={currentCategory?.id}
        addItem={handleAddItem}
      />
      <DeleteModal
        targetObj={currentCategory}
        handleDelete={handleDeleteCategory}
        open={isDeleteModalOpen}
        handleCloseModal={() => setIsDeleteModalOpen(false)}
      />
      <EditCategory
        open={isEditCategory}
        onClose={() => setIsEditCategory(false)}
        updateCategory={handleUpdateCategoryName}
        currentName={currentCategory?.name}
      />
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
              <IconButton onClick={() => setIsEditCategory(true)}>
                <EditIcon />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={2} textAlign="right">
            <Button
              disabled={!currentCategory}
              fullWidth
              color="error"
              variant="outlined"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
        <ShadowSection sx={{ mt: 2 }}>
          <Grid container alignItems="center" spacing={1}>
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
              <IconButton size="large" onClick={() => setIsAddItem(true)}>
                <AddBoxIcon fontSize="large" color="primary" />
              </IconButton>
            </Grid>
            <Grid item xs={12} textAlign="right">
              <LoadingButton
                loading={isSavingArrangement}
                onClick={saveItemArrangement}
              >
                Save Arrangement
              </LoadingButton>
            </Grid>
          </Grid>
          {isFetching || isLoading ? (
            <SplashScreen />
          ) : (
            <Reorder.Group
              values={items}
              onReorder={setItems}
              style={{ padding: 0 }}
            >
              {items.map((item: IItem) => {
                return (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    style={{ listStyle: 'none' }}
                    transition={{
                      type: 'spring',
                      damping: 10,
                      stiffness: 300,
                      mass: 0.5,
                    }}
                  >
                    <Item
                      item={item}
                      handleUpdateItem={handleUpdateItem}
                      handleDeleteItem={handleDeleteItem}
                      setNotification={setNotification}
                      subCategories={subCategories}
                    />
                    <Divider />
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          )}
        </ShadowSection>
      </CategorySidebar>
    </Sidebar>
  );
}
