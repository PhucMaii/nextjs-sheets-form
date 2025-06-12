'use client';
import React, { Fragment, useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar/Sidebar';
import { ICategory, IItem } from '@/app/utils/type';
import { getAdminApiUrl } from '@/app/utils/enum';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { fetchApi } from '@/app/utils/db';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import useDebounce from '@/hooks/useDebounce';
import { ShadowSection } from '../../../reports/styled';
import axios from 'axios';
import AddItem from '../../../components/Modals/add/AddItem';
import DeleteModal from '../../../components/Modals/delete/DeleteModal';
import EditCategory from '../../../components/Modals/edit/EditCategory';
import Item from '../../../components/Reorder/Item';
import { UPDATE_OPTION } from '../../../components/Modals/edit/EditItem';
import { blueGrey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import PasteItemsModal from '../../../components/Modals/PasteItemsModal';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import CategoryClients from '../../../components/CategoryClients';
import InfoIcon from '@mui/icons-material/Info';
import { generateCurrentTime } from '@/app/utils/time';
import AddCategory from '../../../components/Modals/add/AddCategory';
import PreViewExport from '../../../components/Modals/PreViewExport';
import { useRouter, useParams } from 'next/navigation';

export default function ItemPage() {
  const { companyId, categoryId }: any = useParams();
  const [baseItems, setBaseItems] = useState<IItem[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [items, setItems] = useState<IItem[]>([]);
  // const [isSavingArrangement, setIsSavingArrangement] =
  //   useState<boolean>(false);
  const [isOpenAddCategory, setIsOpenAddCategory] = useState<boolean>(false);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const [open, setOpen] = useMultipleBoolean({
    isAddItemOpen: false,
    isSidebarOpen: true,
    isPasteModalOpen: false,
    isDeleteModalOpen: false,
    isEditCategoryOpen: false,
    isShowingClients: false,
    isPreViewExport: false,
  });

  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();

  // Data Fetching
  // const [categories, mutateCategories] = SWRFetchData(
  //   getAdminApiUrl(companyId, '/categories'),
  // );
  const [currentCategory, setCurrentCategory] = useState<ICategory | null>(null);
    // categories?.data.find(
    //   (category: ICategory) => category.id === Number(categoryId),
    // )
  // );
  // const [itemsResponse, mutateItems, isInitializing] = SWRFetchData(
  //   currentCategory
  //     ? getAdminApiUrl(companyId, `/items?categoryId=${categoryId}`)
  //     : '',
  // );

  const debouncedKeywords = useDebounce(searchKeywords, 1000);


  // useEffect(() => {
  //   if (categories?.data.length > 0 && !currentCategory) {
  //     const selectedCategory =
  //       categories?.data.find(
  //         (category: ICategory) => category.id === Number(categoryId),
  //       ) || categories?.data[0];
  //     setCurrentCategory(selectedCategory);
  //   }
  // }, [categories]);

  useEffect(() => {
    fetchCurrentCategory();
  }, []);

  // useEffect(() => {
  //   if (
  //     itemsResponse &&
  //     currentCategory &&
  //     !isInitializing
  //   ) {
  //     initializeItems();
  //     setSearchKeywords('');
  //   } else if (!itemsResponse && isInitializing) {
  //     setIsFetching(true);
  //   }
  // }, [currentCategory,]);

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

  const fetchCurrentCategory = async () => {
    const data = await fetchApi(getAdminApiUrl(companyId, `/categories?categoryId=${categoryId}`));
    setCurrentCategory(data);
    setItems(data.items);
    setBaseItems(data.items);
    // setSearchKeywords('');
    setIsFetching(false);
  };

  // const initializeItems = () => {
  //   setItems(itemsResponse?.data);
  //   setBaseItems(itemsResponse?.data);
  //   setIsFetching(false);
  // };

  const handleAddItem = async (
    newItem: IItem,
    selectedCategoryIds: number[],
  ) => {
    try {
      const isNewItemValid = checkIsNewItemValid(newItem);
      if (!isNewItemValid) {
        return;
      }

      const createdAt = generateCurrentTime();
      const response = await axios.post(getAdminApiUrl(companyId, '/items'), {
        newItem,
        createdAt,
        categoryIds: selectedCategoryIds,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      // mutateItems();
      fetchCurrentCategory();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleDeleteCategory = async (targetObj: any) => {
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, '/categories'),
        {
          data: { categoryId: targetObj?.id },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // mutateCategories();

      router.push(`/admin/${companyId}/items`);
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleDeleteItem = async (targetItem: IItem) => {
    try {
      const response = await axios.delete(getAdminApiUrl(companyId, '/items'), {
        data: { removedId: targetItem.id },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic UI Update
      handleDeleteItemUI(targetItem);

      // Update Real Data
      // mutateItems();
      await fetchCurrentCategory();
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
      const response = await axios.put(
        getAdminApiUrl(companyId, '/categories'),
        {
          updatedCategory: {
            id: currentCategory?.id,
            name: newName,
          },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // mutateCategories();
      await fetchCurrentCategory();

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
      const response = await axios.put(getAdminApiUrl(companyId, '/items'), {
        updatedItem,
        updateOption,
        updatedFields,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      // mutateItems();
      await fetchCurrentCategory();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  // const switchCurrentCategory = (newCategory: Category) => {
  //   setCurrentCategory(newCategory);
  // };

  // return (
  //   <Sidebar noMargin>
  //     <Typography>Hello world</Typography>
  //   </Sidebar>
  // )

  return (
    <Sidebar noMargin>
      <AddCategory
        showNotification={showNotification}
        // mutateCategories={mutateCategories}
        open={isOpenAddCategory}
        onClose={() => setIsOpenAddCategory(false)}
      />
      <CategoryClients
        open={open.isShowingClients}
        onClose={() => setOpen('isShowingClients', false)}
        clients={currentCategory?.users || []}
      />
      <PreViewExport
        open={open.isPreViewExport}
        onClose={() => setOpen('isPreViewExport', false)}
        items={items}
      />
      <AddItem
        open={open.isAddItemOpen}
        onClose={() => setOpen('isAddItemOpen', false)}
        categoryId={currentCategory?.id || 0}
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
        currentName={currentCategory?.name || ''}
      />

      {/* <div style={{ display: 'none' }}>
        <ExportCategory
          category={currentCategory}
          clientName="John Doe"
          ref={exportCategoryRef}
        />
      </div> */}
      {NotificationComp}
      <PasteItemsModal
        currentCategoryId={currentCategory?.id || 0}
        open={open.isPasteModalOpen}
        onClose={() => setOpen('isPasteModalOpen', false)}
        showNotification={showNotification}
      />
      {isFetching ? (
        <Skeleton variant="rectangular" height={50} />
      ) : (
        <Grid container alignItems="center">
          <Grid item xs={12} md={10}>
            <Box display="flex" gap={1} alignItems="center">
              <IconButton onClick={() => router.back()}>
                <ArrowBackIosNewIcon />
              </IconButton>
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
          <Grid
            item
            xs={12}
            md={2}
            textAlign="right"
            display="flex"
            gap={1}
            alignItems="center"
          >
            <Button
              variant="outlined"
              onClick={() =>
                router.push(
                  `/admin/${companyId}/items/export/${currentCategory?.id}`,
                )
              }
            >
              Export
            </Button>
            <Button
              disabled={!currentCategory}
              color="error"
              variant="outlined"
              onClick={() => setOpen('isDeleteModalOpen', true)}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
      )}
      <ShadowSection sx={{ mt: 2, mx: 1 }}>
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
          {/* <Grid item xs={12} textAlign="right">
              <LoadingButton
                loading={isSavingArrangement}
                onClick={saveItemArrangement}
                disabled={
                  baseItems.length === 0 || items.length !== baseItems.length
                }
              >
                Save Arrangement
              </LoadingButton>
            </Grid> */}
        </Grid>
        {isFetching ? (
          <Skeleton variant="rectangular" height={200} />
        ) : (
          // <Reorder.Group
          //   values={items}
          //   onReorder={setItems}
          //   style={{ padding: 0 }}
          // >
          <Box mt={2}>
            {items.map((item: IItem) => {
              return (
                // <Reorder.Item
                //   key={item.id}
                //   value={item}
                //   style={{ listStyle: 'none' }}
                //   transition={{
                //     type: 'spring',
                //     damping: 10,
                //     stiffness: 300,
                //     mass: 0.5,
                //   }}
                // >
                <Fragment key={item.id}>
                  <Item
                    item={item}
                    handleUpdateItem={handleUpdateItem}
                    handleDeleteItem={handleDeleteItem}
                    showNotification={showNotification}
                  />
                  <Divider />
                </Fragment>
                // </Reorder.Item>
              );
            })}
          </Box>
        )}
      </ShadowSection>
      {/* </CategorySidebar> */}
    </Sidebar>
  );
}
