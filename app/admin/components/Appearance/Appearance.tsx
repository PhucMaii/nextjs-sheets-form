import {
  AlertColor,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IInventoryItem, IItemType } from '@/app/utils/type';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import SwitchTypeModal from '../Inventory/SwitchTypeModal';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { LoadingButton } from '@mui/lab';
import { SortableEmptyItem, SortableItem, SortableItemType } from './Sortable';

// const SortableItemType = ({
//   type,
//   children,
//   dndMode,
// }: {
//   type: IItemType;
//   children: any;
//   dndMode: boolean;
// }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: type.id, data: { type: 'container' } });

//   const style = {
//     transition,
//     transform: CSS.Translate.toString(transform),
//     boxShadow: isDragging ? 'rgba(0, 0, 0, 0.35) 0px 5px 15px' : '',
//     backgroundColor: isDragging ? grey[50] : undefined,
//     opacity: isDragging ? 0.5 : 1,
//     padding: '10px',
//     borderRadius: '15px',
//   };
//   return (
//     <div ref={setNodeRef} {...attributes} style={style}>
//       <Box
//         display="flex"
//         flexDirection="row"
//         gap={1}
//         alignItems="center"
//         justifyContent="space-between"
//       >
//         <Typography variant="h6">{type.name}</Typography>
//         {dndMode && (
//           <IconButton {...(dndMode ? listeners : {})}>
//             <DragIndicatorIcon />
//           </IconButton>
//         )}
//       </Box>
//       <Grid container mt={2}>
//         {children}
//       </Grid>
//     </div>
//   );
// };

// const SortableItem = ({
//   item,
//   dndMode,
//   onOpenSwitchType,
// }: {
//   item: any;
//   dndMode: boolean;
//   onOpenSwitchType: any;
// }) => {
//   const { attributes, listeners, setNodeRef, isDragging } = useSortable({
//     id: item.id,
//     data: { type: 'item' },
//   });

//   const style = {
//     transition: 'none',
//     // transform: CSS.Transform.toString(transform),
//     opacity: isDragging ? 0.5 : 1,
//   };

//   return (
//     <Grid
//       ref={setNodeRef}
//       {...attributes}
//       {...(dndMode ? listeners : {})}
//       style={style}
//       item
//       xs={6}
//       md={4}
//       lg={3}
//     >
//       <ItemButton
//         item={{ ...item, price: 11 } as IItem}
//         containerStyle={{
//           backgroundColor: item?.color || infoBackground,
//         }}
//         onClick={() => {
//           if (dndMode) return;
//           onOpenSwitchType(item);
//         }}
//       />
//     </Grid>
//   );
// };

interface IProps {
  types: IItemType[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function Appearance({ types, showNotification }: IProps) {
  const [activeItemId, setActiveItemId] = useState<UniqueIdentifier | null>(
    null,
  );
  const [dndMode, setDndMode] = useState<boolean>(false);
  const [itemTypes, setItemTypes] = useState<IItemType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [switchTypeProps, setSwitchTypeProps] = useState<any>({
    open: false,
    item: null,
  });

  // DND Handlers
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (types) {
      setItemTypes(types);
    }
  }, [types]);

  const findContainerOfItems = (id: UniqueIdentifier | undefined, type: string) => {
    if (type === 'container') {
      return itemTypes.find((type) => type.id === Number(id));
    }

    if (type === 'item') {
      return itemTypes.find((type) =>
        type.inventoryItems?.find((item) => item.id === Number(id)),
      );
    }
  };

  const findItem = (id: UniqueIdentifier | undefined): any => {
    const actualId = id?.toString().split(' - ')[1];

    const type = findContainerOfItems(actualId, 'item');
    if (!type) return;
    const item = type.inventoryItems.find(
      (item) => item.id === Number(actualId),
    );
    if (!item) return;

    return item;
  };

  const findType = (id: UniqueIdentifier | undefined) => {
    const actualId = id?.toString().split(' - ')[1];

    const type = findContainerOfItems(actualId, 'container');
    if (!type) return '';
    return type;
  };

  const findTypeItems = (
    id: UniqueIdentifier | undefined,
  ): IInventoryItem[] => {
    const actualId = id?.toString().split(' - ')[1];

    const type = findContainerOfItems(actualId, 'container');
    if (!type) return [];
    return type.inventoryItems;
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    const activeType = active.data.current?.type;

    setActiveItemId(`${activeType} - ${id}`);
  };

  const swapElements = (array: any[], indexA: number, indexB: number) => {
    [array[indexA], array[indexB]] = [array[indexB], array[indexA]];

    return array;
  };

  // const swapItemsInDifferentContainers = (

  // )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    if (
      activeType === 'item' &&
      overType &&
      overType === 'item' &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active container and over container
      const activeContainer = findContainerOfItems(active.id, 'item');
      const overContainer = findContainerOfItems(over.id, 'item');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the active and over container index
      const activeContainerIndex = itemTypes.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = itemTypes.findIndex(
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
        const newItems = [...itemTypes];
        newItems[activeContainerIndex].inventoryItems = swapElements(
          newItems[activeContainerIndex].inventoryItems,
          activeItemIndex,
          overItemIndex,
        );

        setItemTypes(newItems);
      } else {
        const newItems = [...itemTypes]
        // const activeItem = newItems[activeContainerIndex].inventoryItems[activeItemIndex];
        const overItem = newItems[overContainerIndex].inventoryItems[overItemIndex];
        
        // Replace active item with over item in active container
        const [removeItem] = newItems[
          activeContainerIndex
        ].inventoryItems.splice(activeItemIndex, 1, overItem);

        // Replace over item with active item in over container
        newItems[overContainerIndex].inventoryItems.splice(
          overItemIndex,
          1,
          removeItem,
        );
        setItemTypes(newItems);
      }
    }

    // Handling item drop into an empty item
    if (
      activeType === 'item' &&
      overType &&
      overType === 'empty' &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active container and over container
      const activeContainer = findContainerOfItems(active.id, 'item');
      const overContainer = findContainerOfItems(over.id, 'item');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the active and over container index
      const activeContainerIndex = itemTypes.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = itemTypes.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find the index of the active item and over item
      const activeItemIndex = activeContainer.inventoryItems.findIndex(
        (item) => item.id === active.id,
      );
      const overItemIndex = overContainer.inventoryItems.findIndex(
        (item) => item.id === over.id,
      );

      // If in the same container
      if (activeContainerIndex === overContainerIndex) {
        // Swap item and empty
        const newItems = [...itemTypes];
        newItems[activeContainerIndex].inventoryItems = swapElements(
          newItems[activeContainerIndex].inventoryItems,
          activeItemIndex,
          overItemIndex,
        );

        setItemTypes(newItems);
      } else {
        const newItems = [...itemTypes];
        // Replace item with empty in the active
        const [removeItem] = newItems[
          activeContainerIndex
        ].inventoryItems.splice(activeItemIndex, 1, {
          id: activeItemIndex * activeContainer.id + 1000000,
          name: 'Empty',
          dataType: 'Empty',
          typeId: activeContainer.id,
        } as any);

        // Replace the empty with item
        newItems[overContainerIndex].inventoryItems.splice(
          overItemIndex,
          1,
          removeItem
        );
        setItemTypes(newItems);
      }
    }

    // Handling Item Drop into a container
    if (
      activeType === 'item' &&
      overType &&
      overType === 'container' &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // find the active and over container
      const activeContainer = findContainerOfItems(active.id, 'item');
      const overContainer = findContainerOfItems(over.id, 'container');

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the index of the active and over container
      const activeContainerIndex = itemTypes.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = itemTypes.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find the index of the active item in the active container
      const activeItemIndex = activeContainer.inventoryItems.findIndex(
        (item) => item.id === active.id,
      );

      // Replace the active item from the active container with empty item and ad it to the over container
      const newItems = [...itemTypes];
      const [removedItem] = newItems[
        activeContainerIndex
      ].inventoryItems.splice(activeItemIndex, 1, {
        id: activeItemIndex * activeContainer.id + 1000000,
        name: 'Empty',
        dataType: 'Empty',
      } as any);
      newItems[overContainerIndex].inventoryItems.push(removedItem);
      setItemTypes(newItems);
    }

    if (
      activeType === 'container' &&
      overType &&
      overType === 'container' &&
      active &&
      over &&
      active.id !== over.id
    ) {
      const activeContainerIndex = itemTypes.findIndex(
        (type) => type.id === active.id,
      );
      const overContainerIndex = itemTypes.findIndex(
        (type) => type.id === over.id,
      );

      // Swap the active and over container
      let newItems = [...itemTypes];
      newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex);
      setItemTypes(newItems);
    }
    setActiveItemId(null);
  };

  const onOpenSwitchType = (item: IInventoryItem) => {
    setSwitchTypeProps({ open: true, item });
  };

  const handleSaveArrangement = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/appearance`, {
        itemTypes,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SwitchTypeModal
        open={switchTypeProps.open}
        onClose={() => setSwitchTypeProps({ open: false, type: null })}
        types={itemTypes}
        showNotification={showNotification}
        item={switchTypeProps.item}
      />
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={dndMode}
                onChange={(e) => setDndMode(e.target.checked)}
              />
            }
            label="Drag and Drop Mode"
          />
          {dndMode && (
            <LoadingButton
              loading={isLoading}
              onClick={handleSaveArrangement}
              variant="contained"
            >
              Save Arrangement
            </LoadingButton>
          )}
        </Box>
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          // onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          collisionDetection={closestCorners}
        >
          <SortableContext
            items={itemTypes?.map((type) => type.id) as UniqueIdentifier[]}
          >
            {itemTypes?.map((type, typeIndex: number) => {
              return (
                <SortableItemType key={typeIndex} type={type} dndMode={dndMode}>
                  <SortableContext
                    items={
                      type?.inventoryItems?.map(
                        (item) => item.id,
                      ) as UniqueIdentifier[]
                    }
                  >
                    {type?.inventoryItems?.map((item: any) => {
                      if (item?.name === 'Empty') {
                        return <SortableEmptyItem item={item} />;
                      }

                      return (
                        <SortableItem
                          key={item.id}
                          item={item}
                          dndMode={dndMode}
                          onOpenSwitchType={() => onOpenSwitchType(item)}
                        />
                      );
                    })}
                  </SortableContext>
                </SortableItemType>
              );
            })}
          </SortableContext>
          <DragOverlay>
            {activeItemId && activeItemId.toString().includes('item') && (
              <SortableItem
                item={findItem(activeItemId)}
                dndMode={dndMode}
                onOpenSwitchType={() =>
                  onOpenSwitchType(findItem(activeItemId))
                }
              />
            )}

            {activeItemId && activeItemId.toString().includes('container') && (
              <SortableItemType
                type={findType(activeItemId) as any}
                dndMode={dndMode}
              >
                {findTypeItems(activeItemId).length > 0 &&
                  findTypeItems(activeItemId)?.map((item: any) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      dndMode={dndMode}
                      onOpenSwitchType={() => onOpenSwitchType(item)}
                    />
                  ))}
              </SortableItemType>
            )}
          </DragOverlay>
        </DndContext>
      </Box>
    </>
  );
}
