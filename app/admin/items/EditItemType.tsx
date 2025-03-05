import {
  Grid,
  Button,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import { BoxModal } from '../components/Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import { grey } from '@mui/material/colors';
// import { Sortable } from './ItemsGrid';
import { ICategory, IItem } from '@/app/utils/type';
import { ItemButton } from '@/app/components/OrderView';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { infoBackground } from '@/theme/color';

function Sortable({ item }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <Grid
      item
      xs={6}
      sm={4}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
    >
      <ItemButton
        item={item}
        containerStyle={{
          backgroundColor: item?.inventoryItem?.color || infoBackground,
        }}
      />
    </Grid>
  );
}
const EditItemType = ({
  items,
  showNotification,
  category,
  type,
}: {
  items: IItem[];
  showNotification: any;
  category: ICategory;
  type: any;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sortedItems, setSortedItems] = useState<IItem[]>(items);
  const [priority, setPriority] = useState<number>(0);

  useEffect(() => {
    setSortedItems(items || []);
  }, [items]);

  useEffect(() => {
    console.log({ category, type });
    if (category.itemType_category && type?.id) {
      const itemTypeCategory = category?.itemType_category.find(
        (typeCategory) => typeCategory.itemTypeId === type.id,
      );

      setPriority(itemTypeCategory?.priority || 0);
    }
  }, [category, type]);

  const onDragEnd = ({ active, over }: any) => {
    console.log('drag end', { active, over });
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedItems.findIndex(
      (item: IItem) => item.id === active.id,
    );
    const newIndex = sortedItems.findIndex(
      (item: IItem) => item.id === over.id,
    );

    const newSortedItems = arrayMove(sortedItems, oldIndex, newIndex);

    setSortedItems(newSortedItems);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const newListWithId = sortedItems.map((item: IItem, index: number) => {
        const newPlacementId = items[index].id;
        return { ...item, id: newPlacementId };
      });

      const updatedIdList = newListWithId.map((item: IItem) => item.id);

      const response = await axios.put(
        `${API_URL.ITEM}/reArrangement-priority`,
        {
          removedItemIdList: updatedIdList,
          updatedItemList: newListWithId,
          priority,
          typeId: items[0]?.inventoryItem?.typeId,
          categoryId: category.id,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);

        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.error('There was an error: ', error);
      showNotification('error', error.response.data.error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        sx={{ width: 'fit-content' }}
        onClick={() => setOpen(true)}
        variant="outlined"
      >
        Edit
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <BoxModal>
          <ModalHead
            heading="Edit Item Type"
            buttonLabel="EDIT"
            onClose={() => setOpen(false)}
            onClick={handleSave}
            buttonProps={{ loading: isLoading }}
          />

          <Divider sx={{ my: 2 }} />

          {type?.name !== 'Others' && (
            <>
              <Typography
                variant="h6"
                fontWeight="regular"
                sx={{ color: grey[800] }}
              >
                Priority
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                // label="Priority"
                type="number"
                sx={{ mt: 1 }}
                size="small"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />

              <Divider sx={{ my: 2 }}>Items Arrangment</Divider>
            </>
          )}

          <DndContext onDragEnd={onDragEnd} collisionDetection={closestCenter}>
            <Grid
              container
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                listStyle: 'none',
              }}
            >
              <SortableContext
                items={sortedItems.map((item: any) => item.id)}
                strategy={horizontalListSortingStrategy}
              >
                {sortedItems.map((item, index) => (
                  <Sortable key={item.id} item={item} index={index} />
                ))}
              </SortableContext>
            </Grid>
          </DndContext>
        </BoxModal>
      </Modal>
    </>
  );
};

// export default EditItemType;

export default memo(EditItemType, (prev, next) => {
  return Object.is(prev.items, next.items);
});
