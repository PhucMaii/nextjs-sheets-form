'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { ICategory, IItem } from '@/app/utils/type';
import { API_URL } from '@/app/utils/enum';
import { Category } from '@prisma/client';
import CategorySidebar from '../components/Sidebar/CategorySidebar';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { SWRFetchData } from '@/app/utils/db';
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
import { SplashScreen } from '@/HOC/AuthenGuard';
import axios from 'axios';
import AddItem from '../components/Modals/add/AddItem';
import DeleteModal from '../components/Modals/delete/DeleteModal';
import EditCategory from '../components/Modals/edit/EditCategory';
import { Reorder } from 'framer-motion';
import Item from '../components/Reorder/Item';
import { LoadingButton } from '@mui/lab';
import { UPDATE_OPTION } from '../components/Modals/edit/EditItem';
import { blueGrey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import PasteItemsModal from '../components/Modals/PasteItemsModal';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import CategoryClients from '../components/CategoryClients';
import InfoIcon from '@mui/icons-material/Info';
import { generateCurrentTime } from '@/app/utils/time';

export default function ItemPage() {
  const [baseItems, setBaseItems] = useState<IItem[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [items, setItems] = useState<IItem[]>([]);
  const [isSavingArrangement, setIsSavingArrangement] =
    useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const [open, setOpen] = useMultipleBoolean({
    isAddItemOpen: false,
    isSidebarOpen: true,
    isPasteModalOpen: false,
    isDeleteModalOpen: false,
    isEditCategoryOpen: false,
    isShowingClients: false,
  });
  const { showNotification, NotificationComp } = useNotification();

  // Data Fetching
  const [categories, mutateCategories] = SWRFetchData(API_URL.CATEGORIES);
  const [currentCategory, setCurrentCategory] = useState<ICategory>(
    categories?.data[0],
  );
  const [itemsResponse, mutateItems] = SWRFetchData(
    currentCategory ? `${API_URL.ITEM}?categoryId=${currentCategory?.id}` : '',
  );

  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (categories?.data.length > 0 && !currentCategory) {
      setCurrentCategory(categories?.data[0]);
    }

    if (categories?.data.length > 0 && currentCategory) {
      let targetIndex = 0;
      categories?.data.forEach((category: Category, index: number) => {
        if (category.id === currentCategory.id) {
          targetIndex = index;
          return;
        }
      });
      setCurrentCategory(categories?.data[targetIndex]);
    }
  }, [categories]);

  useEffect(() => {
    if (itemsResponse && categories?.data.length > 0 && currentCategory) {
      initializeItems();
      setSearchKeywords('');
    }
  }, [categories, currentCategory, itemsResponse]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newItems = baseItems.filter((item: IItem) => {
        if (
          item.name.toLowerCase().includes(debouncedKeywords.toLowerCase()) ||
          item.price.toString().includes(debouncedKeywords)
        ) {
          return true;
        }
        return false;
      });
      setItems(newItems);
    } else if (baseItems.length > 0) {
      setItems(baseItems);
    }
  }, [debouncedKeywords]);

  const checkIsNewItemValid = (newItem: IItem) => {
    if (
      newItem.name.trim() === '' ||
      newItem.price < 0 ||
      !newItem.categoryId ||
      !newItem.inventoryItemId ||
      newItem.inventoryItemId < 1
    ) {
      showNotification('error', 'Your input data is invalid');
      return false;
    }
    return true;
  };

  const initializeItems = () => {
    setItems(itemsResponse?.data);
    setBaseItems(itemsResponse?.data);
    setIsFetching(false);
  };

  const handleAddItem = async (newItem: IItem) => {
    try {
      const isNewItemValid = checkIsNewItemValid(newItem);
      if (!isNewItemValid) {
        return;
      }

      const createdAt = generateCurrentTime();
      const response = await axios.post(API_URL.ITEM, { newItem, createdAt });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      mutateItems();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleDeleteCategory = async (targetObj: any) => {
    try {
      const response = await axios.delete(API_URL.CATEGORIES, {
        data: { categoryId: targetObj?.id },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      mutateCategories();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleDeleteItem = async (targetItem: IItem) => {
    try {
      const response = await axios.delete(API_URL.ITEM, {
        data: { removedId: targetItem.id },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic UI Update
      handleDeleteItemUI(targetItem);

      // Update Real Data
      mutateItems();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
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
      showNotification('error', 'Item Name Must Not Be Blank');
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
        showNotification('error', response.data.error);
        return;
      }

      mutateCategories();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleUpdateItem = async (
    updatedItem: IItem,
    updateOption: UPDATE_OPTION = UPDATE_OPTION.CURRENT_CATEGORY,
    updatedFields: string[] = [],
  ) => {
    try {
      const response = await axios.put(API_URL.ITEM, {
        updatedItem,
        updateOption,
        updatedFields,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      mutateItems();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
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
        showNotification('error', response.data.error);

        setIsSavingArrangement(false);

        return;
      }

      mutateItems();

      setIsSavingArrangement(false);
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error in rearrangement: ', error);
      showNotification(
        'error',
        'There was an error in rearrangement: ' + error,
      );
      setIsSavingArrangement(false);
    }
  };

  const switchCurrentCategory = (newCategory: Category) => {
    setCurrentCategory(newCategory);
  };

  return (
    <Sidebar noMargin>
      <CategoryClients
        open={open.isShowingClients}
        onClose={() => setOpen('isShowingClients', false)}
        clients={currentCategory?.users || []}
      />
      <AddItem
        open={open.isAddItemOpen}
        onClose={() => setOpen('isAddItemOpen', false)}
        categoryId={currentCategory?.id}
        addItem={handleAddItem}
        showNotification={showNotification}
      />
      <DeleteModal
        targetObj={currentCategory}
        handleDelete={handleDeleteCategory}
        open={open.isDeleteModalOpen}
        handleCloseModal={() => setOpen('isDeleteModalOpen', false)}
      />
      <EditCategory
        open={open.isEditCategory}
        onClose={() => setOpen('isEditCategory', false)}
        updateCategory={handleUpdateCategoryName}
        currentName={currentCategory?.name}
      />
      {NotificationComp}
      <PasteItemsModal
        currentCategoryId={currentCategory?.id}
        open={open.isPasteModalOpen}
        onClose={() => setOpen('isPasteModalOpen', false)}
        showNotification={showNotification}
        categories={categories?.data || []}
      />
      <CategorySidebar
        currentCategory={currentCategory}
        categories={categories?.data || []}
        handleChangeTab={switchCurrentCategory}
        isNavOpen={open.isSidebarOpen}
        setIsNavOpen={setOpen}
      >
        <Grid container alignItems="center">
          <Grid item xs={12} md={10}>
            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="h6" color={blueGrey[800]}>
                {currentCategory?.name} ( {currentCategory?.users?.length}{' '}
                clients )
              </Typography>
              <IconButton onClick={() => setOpen('isShowingClients', true)}>
                <InfoIcon />
              </IconButton>
              <IconButton onClick={() => setOpen('isEditCategory', true)}>
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
              onClick={() => setOpen('isDeleteModalOpen', true)}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
        <ShadowSection sx={{ mt: 2 }}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs={12} md={10.5}>
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
            <Grid item xs={12} md={1.5}>
              <Box display="flex" alignItems="center">
                <IconButton
                  size="large"
                  onClick={() => setOpen('isPasteModalOpen', true)}
                >
                  <ContentPasteGoIcon fontSize="large" color="primary" />
                </IconButton>
                <IconButton
                  size="large"
                  onClick={() => setOpen('isAddItemOpen', true)}
                >
                  <AddBoxIcon fontSize="large" color="primary" />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={12} textAlign="right">
              <LoadingButton
                loading={isSavingArrangement}
                onClick={saveItemArrangement}
                disabled={
                  baseItems.length === 0 || items.length !== baseItems.length
                }
              >
                Save Arrangement
              </LoadingButton>
            </Grid>
          </Grid>
          {isFetching ? (
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
                      showNotification={showNotification}
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
