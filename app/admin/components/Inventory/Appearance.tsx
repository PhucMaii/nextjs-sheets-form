import { Box, Button, Grid, Typography } from '@mui/material';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { convertInventoryItemArrayToMap } from '@/app/utils/item';
import { IInventoryItem, IItemType } from '@/app/utils/type';
import { ItemButton } from '@/app/components/OrderView';
import { infoBackground } from '@/theme/color';
import {
  closestCenter,
  closestCorners,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { grey } from '@mui/material/colors';

const SortableItemType = ({ type, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: type.id, data: { type: 'container' } });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
    backgroundColor: isDragging ? grey[50] : undefined,
  };
  return (
    <div ref={setNodeRef} {...attributes} style={style}>
      <Box
        display="flex"
        flexDirection="row"
        gap={1}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h6">{type.name}</Typography>
        <Button {...listeners}>Drag handler</Button>
      </Box>
      <Grid container mt={2}>
        {children}
      </Grid>
    </div>
  );
};

const SortableItem = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id, data: { type: 'item' } });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  return (
    <Grid
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      item
      xs={6}
      md={4}
      lg={3}
      mt={2}
    >
      <ItemButton
        item={{ ...item, price: 11 }}
        containerStyle={{
          backgroundColor: item?.color || infoBackground,
        }}
      />
    </Grid>
  );
};

interface IProps {
  types: IItemType[];
}

export default function Appearance({ types }: IProps) {
  const [itemTypes, setItemTypes] = useState<IItemType[]>(types);
  const [activeItemId, setActiveItemId] = useState<UniqueIdentifier | null>(
    null,
  );
  // const [currentTypeId, setCurrentTypeId] = useState<UniqueIdentifier | null>(
  //   null,
  // );
  // const [typeName, setTypeName] = useState<string>('');
  // const [itemName, setItemName] = useState<string>('');

  // DND Handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (types) {
      setItemTypes(types);
    }
  }, [types]);

  // const typeFormattedItems = useMemo(() => {
  //   const result = convertInventoryItemArrayToMap(inventoryItems);

  //   return result;
  // }, [inventoryItems]);

  const findValueOfItems = (id: UniqueIdentifier | undefined, type: string) => {
    if (type === 'container') {
      return types.find((type) => type.id === id);
    }

    if (type === 'item') {
      return types.find((type) =>
        type.inventoryItems?.find((item) => item.id === id),
      );
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;

    setActiveItemId(id);
  };

  const onDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      // Find the active container and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'item');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the active and over container index
      const activeContainerIndex = types.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = types.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find the index of the active item and over item
      const activeItemIndex = activeContainer.inventoryItems.findIndex(
        (item) => item.id === active.id,
      );
      const overItemIndex = overContainer.inventoryItems.findIndex(
        (item) => item.id === over.id,
      );

      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        const newItems = [...types];
        newItems[activeContainerIndex].inventoryItems = arrayMove(
          newItems[activeContainerIndex].inventoryItems,
          activeItemIndex,
          overItemIndex,
        );

        setItemTypes(newItems);
      } else {
        // In different container
        const newItems = [...types];
        const [removeItem] = newItems[
          activeContainerIndex
        ].inventoryItems.splice(activeItemIndex, 1);
        newItems[overContainerIndex].inventoryItems.splice(
          overItemIndex,
          0,
          removeItem,
        );
        setItemTypes(newItems);
      }
    }

    // Handling Item Drop into a container
    if (active && over && active.id !== over.id) {
      // find the active and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'container');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the index of the active and over container
      const activeContainerIndex = types.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = types.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find he index of the active item in the active container
      const activeItemIndex = activeContainer.inventoryItems.findIndex(
        (item) => item.id === active.id,
      );

      // Remove the active item from the active container and ad it to the over container
      const newItems = [...types];
      const [removedItem] = newItems[
        activeContainerIndex
      ].inventoryItems.splice(activeItemIndex, 1);
      newItems[overContainerIndex].inventoryItems.push(removedItem);
      setItemTypes(newItems);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Handle Container Sorting
    if (active && over && active.id !== over.id) {
      const activeContainerIndex = types.findIndex(
        (type) => type.id === active.id,
      );
      const overContainerIndex = types.findIndex((type) => type.id === over.id);

      // Swap the active and over container
      let newItems = [...types];
      newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex);
      setItemTypes(newItems);
    }

    // Handle Item Sorting
    if (active && over && active.id !== over.id) {
      // Find the active container and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'item');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the index of the active and over container
      const activeContainerIndex = types.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = types.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find he index of the active item and over item
      const activeItemIndex = activeContainer.inventoryItems.findIndex(
        (item) => item.id === active.id,
      );
      const overItemIndex = overContainer.inventoryItems.findIndex(
        (item) => item.id === over.id,
      );

      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        const newItems = [...types];
        newItems[activeContainerIndex].inventoryItems = arrayMove(
          newItems[activeContainerIndex].inventoryItems,
          activeItemIndex,
          overItemIndex,
        );

        setItemTypes(newItems);
      } else {
        // In different container
        const newItems = [...types];
        const [removedItem] = newItems[
          activeContainerIndex
        ].inventoryItems.splice(activeItemIndex, 1);

        newItems[overContainerIndex].inventoryItems.splice(
          overItemIndex,
          0,
          removedItem,
        );

        setItemTypes(newItems);
      }
    }

    // Handling Item Drop into a container
    if (active && over && active.id !== over.id) {
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'container');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the index of the active and over container
      const activeContainerIndex = types.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = types.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find the index of the active item
      const activeItemIndex = activeContainer.inventoryItems.findIndex(
        (item) => item.id === active.id,
      );

      const newItems = [...types];
      const [removedItem] = newItems[
        activeContainerIndex
      ].inventoryItems.splice(activeItemIndex, 1);

      newItems[overContainerIndex].inventoryItems.push(removedItem);

      setItemTypes(newItems);
    }
    setActiveItemId(null);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        collisionDetection={closestCorners}
      >
        <SortableContext
          items={itemTypes?.map((type) => type.id) as UniqueIdentifier[]}
        >
          {itemTypes?.map((type, typeIndex: number) => {
            return (
              <SortableItemType key={typeIndex} type={type}>
                {/* <Grid item xs={12} mt={2}>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="h6">{type}</Typography>
                    </Box>
                  </Grid> */}
                <SortableContext
                  items={
                    type?.inventoryItems?.map(
                      (item) => item.id,
                    ) as UniqueIdentifier[]
                  }
                >
                  {type?.inventoryItems?.map((item: any) => (
                    <SortableItem key={item.id} item={item} />
                  ))}
                </SortableContext>
              </SortableItemType>
            );
          })}

          {/* {typeFormattedItems?.sortedKeysByPriority?.includes('Others') &&
            typeFormattedItems?.typesObj['Others']?.length > 0 && (
              <>
                <Grid item xs={12} mt={2}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="h6">Others</Typography>
                  </Box>
                </Grid>
                {typeFormattedItems?.typesObj['Others']?.map((item: any) => (
                  <Grid item xs={6} sm={4} md={3}>
                    <ItemButton
                      key={item.id}
                      item={{ ...item, price: 11 }}
                      containerStyle={{
                        backgroundColor: item?.color || infoBackground,
                      }}
                    />
                  </Grid>
                ))}
              </>
            )} */}
        </SortableContext>
        {/* <DragOverlay>
          {
            activeItemId && activeItemId
          }
        </DragOverlay> */}
      </DndContext>
    </Box>
  );
}
