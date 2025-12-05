import {
  AlertColor,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { IInventoryItem, IItemType, IPromotion } from '@/app/utils/type';
import {
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
import SwitchTypeAndAppearanceModal from '../Inventory/SwitchTypeAndAppearanceModal';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { LoadingButton } from '@mui/lab';
import { SortableEmptyItem, SortableItem, SortableItemType } from './Sortable';
import SingleFieldEdit from '../Modals/edit/SingleFieldEdit';
import MoveItemToEmpty from './MoveItemToEmpty';
import { SWRFetchData } from '@/app/utils/db';
import InsertPromotion from '../Modals/add/InsertPromotion';
import { itemsEachRow } from '@/app/lib/constant';
import { ROW_ACTION } from '@/pages/api/admin/[companyId]/appearance/rows';
import { useParams } from 'next/navigation';

enum SORT_CATEGORY {
  TYPE = 'type',
  PROMOTION = 'promotion',
}

interface IProps {
  types: IItemType[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function Appearance({ types, showNotification }: IProps) {
  const { companyId }: any = useParams();

  const [activeItemId, setActiveItemId] = useState<UniqueIdentifier | null>(
    null,
  );
  const [addRowProps, setAddRowProps] = useState<any>({
    open: false,
    type: null,
  });
  const [dndMode, setDndMode] = useState<boolean>(false);
  const [itemTypes, setItemTypes] = useState<IItemType[] | any[]>([]);
  const [isOpenAddPromotion, setIsOpenAddPromotion] = useState<boolean>(false);
  const [promotionList, setPromotionList] = useState<IPromotion[]>([]);
  const [moveItemProps, setMoveItemProps] = useState<any>({
    open: false,
    emptyItem: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [switchTypeProps, setSwitchTypeProps] = useState<any>({
    open: false,
    item: null,
  });

  const [promotions] = SWRFetchData(getAdminApiUrl(companyId, '/promotions'));

  // DND Handlers
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (types && !dndMode) {
      console.log('run type');
      setItemTypes(types);
    }
  }, [types]);

  useEffect(() => {
    if (promotions && !dndMode) {
      console.log('run type');
      setPromotionList(promotions?.data);
    }
  }, [promotions]);

  const inventoryItems = useMemo(() => {
    return itemTypes
      .flatMap((type) => type.inventoryItems)
      .filter(
        (item) => item.name !== 'Empty' && !item.id.includes('promotion'),
      );
  }, [itemTypes]);

  const findContainerOfItems = (
    id: UniqueIdentifier | undefined,
    type: string,
    category: SORT_CATEGORY,
  ) => {
    const container =
      category === SORT_CATEGORY.TYPE ? itemTypes : promotionList;
    const itemFields =
      category === SORT_CATEGORY.TYPE ? 'inventoryItems' : 'items';

    if (type === 'container') {
      return container.find((type) => type.id === id);
    }

    // console.log(container, 'container');

    if (type === 'item') {
      return container.find((cont: any) => {
        // console.log(cont[itemFields], 'cont[itemFields]');
        return cont[itemFields]?.find((item: any) => item.id === id);
      });
    }
  };

  const findItem = (
    id: UniqueIdentifier | undefined,
    category: SORT_CATEGORY = SORT_CATEGORY.TYPE,
  ): any => {
    const itemFields =
      category === SORT_CATEGORY.TYPE ? 'inventoryItems' : 'items';

    // const actualId = id?.toString().split(' - ')[1];

    const type: any = findContainerOfItems(id, 'item', category);
    if (!type) return;
    const item = type[itemFields].find((item: any) => item.id === id);
    if (!item) return;

    return item;
  };

  const findType = (
    id: UniqueIdentifier | undefined,
    category: SORT_CATEGORY = SORT_CATEGORY.TYPE,
  ) => {
    // const actualId = id?.toString().split(' - ')[1];

    const type = findContainerOfItems(id, 'container', category);
    if (!type) return '';
    return type;
  };

  const findTypeItems = (
    id: UniqueIdentifier | undefined,
    category: SORT_CATEGORY = SORT_CATEGORY.TYPE,
  ): IInventoryItem[] => {
    const itemFields =
      category === SORT_CATEGORY.TYPE ? 'inventoryItems' : 'items';

    // const actualId = id?.toString().split(' - ')[1];

    const type: any = findContainerOfItems(id, 'container', category);
    if (!type) return [];
    return type[itemFields];
  };

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    // const activeType = active.data.current?.type;

    setActiveItemId(id);
  };

  const swapElements = (array: any[], indexA: number, indexB: number) => {
    [array[indexA], array[indexB]] = [array[indexB], array[indexA]];
    console.log(array, 'array');

    return array;
  };

  // const swapItemsInDifferentContainers = (

  // )

  const onDragEnd = (
    event: DragEndEvent,
    category: SORT_CATEGORY = SORT_CATEGORY.TYPE,
  ) => {
    const { active, over } = event as any;
    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    const container =
      category === SORT_CATEGORY.TYPE ? itemTypes : promotionList;
    const itemFields =
      category === SORT_CATEGORY.TYPE ? 'inventoryItems' : 'items';
    const updateFn =
      category === SORT_CATEGORY.TYPE ? setItemTypes : setPromotionList;

    // Handle user throw the promotion off the page
    if (!over && active.id.includes('promotion')) {
      onRemoveOffPromotion(active.id);
    }

    // Swap items
    if (
      activeType === 'item' &&
      overType &&
      overType === 'item' &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active container and over container
      const activeContainer: any = findContainerOfItems(
        active.id,
        'item',
        category,
      );
      const overContainer: any = findContainerOfItems(
        over.id,
        'item',
        category,
      );

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the active and over container index
      const activeContainerIndex = container.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = container.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find the index of the active item and over item
      const activeItemIndex = activeContainer[itemFields].findIndex(
        (item: any) => item.id === active.id,
      );
      const overItemIndex = overContainer[itemFields].findIndex(
        (item: any) => item.id === over.id,
      );

      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        const newItems: any = [...container];
        newItems[activeContainerIndex][itemFields] = swapElements(
          newItems[activeContainerIndex][itemFields],
          activeItemIndex,
          overItemIndex,
        );

        updateFn(newItems);
      } else {
        if (
          (!activeContainer.id.includes('promotion') &&
            !overContainer.id.includes('promotion')) ||
          (activeContainer.id.includes('promotion') &&
            overContainer.id.includes('promotion'))
        ) {
          const newItems: any = [...container];
          // const activeItem = newItems[activeContainerIndex].inventoryItems[activeItemIndex];
          const overItem =
            newItems[overContainerIndex][itemFields][overItemIndex];

          const activeItem =
            newItems[activeContainerIndex][itemFields][activeItemIndex];

          // Replace active item with over item in active container
          newItems[activeContainerIndex][itemFields].splice(
            activeItemIndex,
            1,
            overItem,
          );

          // Replace over item with active item in over container
          newItems[overContainerIndex][itemFields].splice(
            overItemIndex,
            1,
            activeItem,
          );
          updateFn(newItems);
        }
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
      const activeContainer: any = findContainerOfItems(
        active.id,
        'item',
        category,
      );
      const overContainer: any = findContainerOfItems(
        over.id,
        'item',
        category,
      );

      // If the active or over container is undefined, return
      if (!activeContainer || !overContainer) {
        return;
      }

      // Find the active and over container index
      const activeContainerIndex = container.findIndex(
        (type) => type.id === activeContainer.id,
      );
      const overContainerIndex = container.findIndex(
        (type) => type.id === overContainer.id,
      );

      // Find the index of the active item and over item
      const activeItemIndex = activeContainer[itemFields].findIndex(
        (item: any) => item.id === active.id,
      );
      const overItemIndex = overContainer[itemFields].findIndex(
        (item: any) => item.id === over.id,
      );

      // If in the same container
      if (activeContainerIndex === overContainerIndex) {
        // Swap item and empty
        const newItems: any = [...container];
        newItems[activeContainerIndex][itemFields] = swapElements(
          newItems[activeContainerIndex][itemFields],
          activeItemIndex,
          overItemIndex,
        );

        updateFn(newItems);
      } else {
        // If in same either promotion container or same regular container
        if (
          (!activeContainer.id.includes('promotion') &&
            !overContainer.id.includes('promotion')) ||
          (activeContainer.id.includes('promotion') &&
            overContainer.id.includes('promotion'))
        ) {
          const newItems: any = [...container];
          const overItem =
            newItems[overContainerIndex][itemFields][overItemIndex];
          // Replace item with empty in the active
          const [removeItem] = newItems[activeContainerIndex][
            itemFields
          ].splice(activeItemIndex, 1, overItem);

          // Replace the empty with item
          newItems[overContainerIndex][itemFields].splice(
            overItemIndex,
            1,
            removeItem,
          );
          updateFn(newItems);
        }

        // Handling regular item dropped into promotion container
        // Duplicate the item and add promotion prefix to the id
        if (
          !activeContainer.id.includes('promotion') &&
          overContainer.id.includes('promotion')
        ) {
          const activeItem =
            container[activeContainerIndex][itemFields][activeItemIndex];
          const promotionsContainer = itemTypes.filter((type) =>
            type.id.includes('promotion'),
          );

          const existingItemIndex = promotionsContainer.findIndex(
            (type) =>
              type.inventoryItems.findIndex(
                (i: any) => i.name === activeItem.name,
              ) !== -1,
          );

          if (existingItemIndex === -1) {
            const newItems: any = [...container];
            const newItem = {
              ...activeItem,
              id: 'promotion_' + activeItem.id,
            };
            newItems[overContainerIndex][itemFields].splice(
              overItemIndex,
              1,
              newItem,
            );
            updateFn(newItems);
          }
        }
      }
    }

    if (
      activeType === 'container' &&
      overType &&
      overType === 'container' &&
      active &&
      over &&
      active.id !== over.id
    ) {
      const activeContainerIndex = container.findIndex(
        (type) => type.id === active.id,
      );
      const overContainerIndex = container.findIndex(
        (type) => type.id === over.id,
      );

      if (
        (!active.id.includes('promotion') && !over.id.includes('promotion')) ||
        (active.id.includes('promotion') && over.id.includes('promotion'))
      ) {
        // Swap the active and over container
        let newItems: any = [...container];
        newItems = arrayMove(
          newItems,
          activeContainerIndex,
          overContainerIndex,
        );
        updateFn(newItems);
      }
    }
    setActiveItemId(null);
  };

  const onOpenSwitchType = (item: IInventoryItem) => {
    setSwitchTypeProps({ open: true, item });
  };

  const handleAddRows = async (extraRows: number) => {
    if (extraRows === 0) {
      showNotification('error', 'Please enter a number greater than 0');
      return;
    }
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/appearance/rows'),
        {
          typeId: addRowProps.type?.id,
          quantity: Number(extraRows),
          rowAction: ROW_ACTION.ADD,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      const newElToAdd = extraRows * itemsEachRow;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const idPrefix = addRowProps.type?.id.includes('promotion')
        ? 'promotion_'
        : '';
      const newEmptyItems = Array.from(
        { length: newElToAdd },
        (_, index: number) => ({
          id:
            idPrefix +
            'add_new_item - ' +
            Math.round(Math.random() * 1000000) +
            index +
            addRowProps.type?.id,
          name: 'Empty',
          dataType: 'Empty',
        }),
      );

      const newTypes = [...itemTypes];
      const index = newTypes.findIndex(
        (type) => type.id === addRowProps.type?.id,
      );
      newTypes[index].rows += newElToAdd;
      newTypes[index].inventoryItems = [
        ...newTypes[index].inventoryItems,
        ...newEmptyItems,
      ];

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    }
  };

  const handleSaveArrangement = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/appearance'),
        {
          itemTypes,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setDndMode(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const onMoveItemToEmpty = (item: IInventoryItem | any) => {
    if (!item || !moveItemProps.emptyItem) {
      return;
    }

    const emptyItemContainer: any = findContainerOfItems(
      moveItemProps.emptyItem.id,
      'item',
      SORT_CATEGORY.TYPE,
    );
    const itemContainer: any = findContainerOfItems(
      item.id,
      'item',
      SORT_CATEGORY.TYPE,
    );

    console.log({ emptyItemContainer, itemContainer });

    if (!emptyItemContainer || !itemContainer) {
      return;
    }

    const emptyContainerIndex = itemTypes.findIndex(
      (type) => type.id === emptyItemContainer.id,
    );
    const itemContainerIndex = itemTypes.findIndex(
      (i) => i.id === itemContainer.id,
    );

    const emptyItemIndex = emptyItemContainer.inventoryItems.findIndex(
      (i: any) => i.id === moveItemProps.emptyItem.id,
    );
    const itemIndex = itemContainer.inventoryItems.findIndex(
      (i: any) => i.id === item.id,
    );

    // Handle Promotion
    if (emptyItemContainer.id.includes('promotion')) {
      const newTypes = [...itemTypes];
      const newItem = {
        ...item,
        id: 'promotion_' + item.id,
      };

      // Check if the item already exists in that every promotion containers
      const promotionsContainer = itemTypes.filter((type) =>
        type.id.includes('promotion'),
      );

      const existingItemIndex = promotionsContainer.findIndex(
        (type) =>
          type.inventoryItems.findIndex((i: any) => i.name === newItem.name) !==
          -1,
      );

      // const existingItemIndex = newTypes[
      //   emptyContainerIndex
      // ].inventoryItems.findIndex((i: any) => i.name === newItem.name);

      if (existingItemIndex === -1) {
        newTypes[emptyContainerIndex].inventoryItems.splice(
          emptyItemIndex,
          1,
          newItem,
        );

        setItemTypes(newTypes);
      }
    } else {
      // Same container
      if (emptyContainerIndex === itemContainerIndex) {
        // Swap empty with item
        const newTypes = [...itemTypes];
        console.log(
          { emptyContainerIndex, itemIndex, emptyItemIndex },
          'emptyContainerIndex',
        );
        newTypes[emptyContainerIndex].inventoryItems = swapElements(
          newTypes[emptyContainerIndex].inventoryItems,
          emptyItemIndex,
          itemIndex,
        );
        setItemTypes(newTypes);
      } else {
        // Different container
        const newItems = [...itemTypes];
        // Replace item with empty in the item container
        newItems[itemContainerIndex].inventoryItems.splice(
          itemIndex,
          1,
          moveItemProps.emptyItem,
        );

        // Replace the empty with item
        newItems[emptyContainerIndex].inventoryItems.splice(
          emptyItemIndex,
          1,
          item,
        );
        setItemTypes(newItems);
      }
    }
  };

  const onRemoveOffPromotion = (itemId: number) => {
    if (!itemId) {
      return;
    }

    const itemContainer: any = findContainerOfItems(
      itemId,
      'item',
      SORT_CATEGORY.TYPE,
    );

    if (!itemContainer) {
      return;
    }

    const newItemTypes = [...itemTypes];

    const itemContainerIndex = itemTypes.findIndex(
      (i) => i.id === itemContainer.id,
    );

    const itemIndex = itemContainer.inventoryItems.findIndex(
      (i: any) => i.id === itemId,
    );

    const emptyItem = {
      id:
        'promotion_' +
        'item - ' +
        Math.round(
          Math.random() * 1000000 +
            80000000 +
            ((itemContainer.id / itemIndex) * itemId) / itemContainerIndex,
        ) +
        itemId,
      name: 'Empty',
    };

    newItemTypes[itemContainerIndex].inventoryItems.splice(
      itemIndex,
      1,
      emptyItem,
    );

    setItemTypes(newItemTypes);
  };

  return (
    <>
      <InsertPromotion
        open={isOpenAddPromotion}
        onClose={() => setIsOpenAddPromotion(false)}
        showNotification={showNotification}
      />
      {moveItemProps.open && moveItemProps.emptyItem && (
        <MoveItemToEmpty
          open={moveItemProps.open}
          onClose={() => setMoveItemProps({ open: false, emptyItem: null })}
          inventoryItems={inventoryItems}
          onMoveItemToEmpty={onMoveItemToEmpty}
        />
      )}

      {/* Insert Rows */}
      <SingleFieldEdit
        open={addRowProps.open}
        onClose={() => setAddRowProps({ open: false, type: null })}
        defaultValue={1}
        title="Add Row"
        inputLabel="Rows"
        handleUpdate={handleAddRows}
        buttonLabel="Add Row"
        inputProps={{
          type: 'number',
        }}
      />
      <SwitchTypeAndAppearanceModal
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

        <Typography>Promotion Section</Typography>

        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          // onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          // collisionDetection={}
        >
          <SortableContext
            items={itemTypes?.map((type) => type.id) as UniqueIdentifier[]}
          >
            {itemTypes?.map((type, typeIndex: number) => {
              return (
                <>
                  {
                    // If the previous type is promotion and this type is not promotion
                    // Add a divider
                    ((typeIndex > 0 &&
                      itemTypes[typeIndex - 1].id.includes('promotion') &&
                      !type.id.includes('promotion')) ||
                      (typeIndex === 0 && !type.id.includes('promotion'))) && (
                      <>
                        {!dndMode && (
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setIsOpenAddPromotion(true)}
                          >
                            Edit Promotion Section
                          </Button>
                        )}
                        <Divider />
                      </>
                    )
                  }
                  <SortableItemType
                    key={typeIndex}
                    type={type}
                    dndMode={dndMode}
                  >
                    <SortableContext
                      items={
                        type?.inventoryItems?.map(
                          (item: any) => item.id,
                        ) as UniqueIdentifier[]
                      }
                    >
                      {type?.inventoryItems?.map((item: any) => {
                        if (item?.name === 'Empty') {
                          return (
                            <SortableEmptyItem
                              key={item.id}
                              item={item}
                              onClick={() => {
                                setMoveItemProps({
                                  open: true,
                                  emptyItem: item,
                                });
                              }}
                            />
                          );
                        }

                        // const handleRemove =
                        //   dndMode && type.id.includes('promotion')
                        //     ? () => onRemoveOffPromotion(item)
                        //     : undefined;

                        return (
                          <SortableItem
                            key={item.id}
                            item={item}
                            dndMode={dndMode}
                            onOpenSwitchType={() => onOpenSwitchType(item)}
                            isExample
                            // onRemove={handleRemove}
                          />
                        );
                      })}
                    </SortableContext>
                    <Box
                      display="flex"
                      justifyContent="center"
                      width={'100%'}
                      mt={2}
                    >
                      <Button
                        onClick={() =>
                          setAddRowProps({ open: true, type: type })
                        }
                      >
                        + Insert More Rows
                      </Button>
                    </Box>
                  </SortableItemType>
                </>
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
                isExample
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
                      isExample
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
