import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import useNotification from '@/hooks/useNotification';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import ErrorComponent from '../ErrorComponent';
import Item from '../Reorder/Item';
import { UPDATE_OPTION } from '../Modals/edit/EditItem';
import axios from 'axios';
import { IItem } from '@/app/utils/type';
import { ShadowSection } from '../../reports/styled';
import useDebounce from '@/hooks/useDebounce';
import AddItem from '../Modals/add/AddItem';
import { websiteItemCategory } from '@/app/lib/constant';
import { generateCurrentTime } from '@/app/utils/time';
export default function WebsiteItems() {
  const [displayItems, setDisplayItems] = useState<IItem[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const [open, setOpen] = useMultipleBoolean({
    addItem: false,
  });

  const { showNotification, NotificationComp } = useNotification();

  const [items] = SWRFetchData(`${API_URL.ADMIN}/website/items`);

  const debouncedKeywords = useDebounce(searchKeywords, 500);

  useEffect(() => {
    if (items) {
      setDisplayItems(items.data);
    }
  }, [items]);

  useEffect(() => {
    if (!items) return;
    if (debouncedKeywords) {
      const filteredItems = items.data.filter((item: IItem) => item.name.toLowerCase().includes(debouncedKeywords.toLowerCase()));
      setDisplayItems(filteredItems);
    } else {
      setDisplayItems(items.data);
    }
  }, [debouncedKeywords, items]);

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

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  const handleAddItem = async (newItem: IItem, selectedCategories: any[]) => {
    try {
      const createdAt = generateCurrentTime();
      const response = await axios.post(API_URL.ITEM, {
        newItem,
        createdAt,
        categoryIds: selectedCategories,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      } 

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    }
  };

  return (
    <Box sx={{ pb: 2 }}>
      {NotificationComp}
      <AddItem
        open={open.addItem}
        onClose={() => setOpen('addItem', false)}
        showNotification={showNotification}
        categoryId={websiteItemCategory}
        addItem={handleAddItem}
      />
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="bold">
          Items
        </Typography>

        <Button
          variant="contained"
          onClick={() => setOpen('addItem', true)}
        >
          + New Item
        </Button>
      </Box>

      {/* Category Listing */}
      <ShadowSection mt={2}>
        <TextField 
          label="Search"
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
          fullWidth
          variant="standard"
        />

        <Box display="flex" flexDirection="column" mt={3}>
          {displayItems ? (
            displayItems?.map((item: IItem) => {
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
            })
          ) : (
            <ErrorComponent errorText="No categories found" />
          )}
        </Box>
      </ShadowSection>
    </Box>
  );
}
