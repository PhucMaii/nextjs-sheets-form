/* eslint-disable @typescript-eslint/no-unused-vars */
import { Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import {
  generateCostAndProfit,
  restockInventoryItem,
  updateSingleInventoryItem,
} from './single';
import { gstRate, pstRate } from '@/app/lib/constant';
import { ORDER_STATUS } from '@/app/utils/enum';
import { getTodayDate, sortByDeliveryDate } from '../../utils/date';
import { checkOrderValidToAffectInventory, formatItemsWithTotalPrice } from '../../utils/order';
import { checkAndUpdateUnits } from '../inventory/expenses/POST';
import { getAllUnitsByInventoryItemId } from '../../utils/units';

enum ITEM_CATEGORIZED {
  UPDATE = 'update',
  CREATE = 'create',
  DELETE = 'delete',
}

interface UpdatedItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  orderId: number;
  totalPrice: number;
  inventoryItemId?: number;
  inventoryUnitId?: number;
}

export enum UpdateOption {
  NONE = 'none',
  CREATE = 'create',
  UPDATE = 'update',
}

interface BodyType {
  orderId: number;
  updatedItems: UpdatedItem[];
  // updateOption?: UpdateOption;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      // updateOption,
    } = updatedData as BodyType;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            fifo: true,
            inventoryUnit: true,
            inventoryItem: true,
          },
        },
        user: true,
      },
    });

    if (!existingOrder) {
      return res.status(400).json({ error: 'Order not found' });
    }

    // Track order items
    const orderedItemList = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
      include: {
        fifo: true,
        inventoryUnit: true,
        inventoryItem: true,
        Orders: true,
      },
    });

    // Categorize updated items into create, update, delete
    const newItems = categorizeUpdatedItems(orderedItemList, updatedItems);

    console.log(newItems, 'acutalUpdatedItems');

    for (const item of newItems) {
      // Check item categorize to create, update or delete

      // 1. CREATE
      if (item.type === ITEM_CATEGORIZED.CREATE) {
        await createOrderedItems(existingOrder, [item]);
        continue;
      } else if (item.type === ITEM_CATEGORIZED.DELETE) {
        if (item?.fifo && item?.inventoryUnit) {
          await prisma.orderedItems.delete({
            where: {
              id: item.id,
            },
          });

          await restockInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
        }

        continue;
      } else {
        const { cost } = await generateCostAndProfit(item.id);

        await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: item.price,
            quantity: item.quantity,
            cost,
            profit: item.price - cost,
          },
        });

        // Inventory Update
        if (
          item?.fifo &&
          item.inventoryUnit &&
          item?.Orders?.status !== ORDER_STATUS.VOID
        ) {
          await updateSingleInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
            item.quantity,
          );
        }
      }
    }

    // Get admin update info
    const adminUpdate: any = await getUserInfo(req, res);
    // await updateOrderTotalPrice(
    //   orderId,
    //   newTotalPrice,
    //   `Admin - ${adminUpdate.clientName}`,
    // );

    const orderedItems = await prisma.orderedItems.findMany({
      where: {
        orderId,
      },
      include: {
        fifo: true,
        inventoryItem: true,
        inventoryUnit: true,
      },
    });
    const orderTotalPrice = generateOrderTotalPrice(orderedItems);
    const updatedAt = getTodayDate();
    const updateTime = new Date(`${updatedAt.date} ${updatedAt.time}`);

    const orderUpdated = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        discount: orderTotalPrice.discount,
        updatedBy: `Admin - ${adminUpdate.clientName}`,
        updateTime,
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
            fifo: true,
          },
        },
        user: {
          include: {
            category: true,
            routes: true,
            preference: true,
          },
        },
      },
    });

    const formattedItems = formatItemsWithTotalPrice(orderUpdated?.items);

    // First case: No update neither create new category
    // if (updateOption === UpdateOption.NONE || !updateOption) {
    return res.status(200).json({
      data: {
        ...orderUpdated?.user,
        ...orderUpdated,
        items: formattedItems,
      },
      message: 'Update Data Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const categorizeUpdatedItems = (baseItems: any, updatedItems: any) => {
  let trackBaseItems = [...baseItems];

  const newItems = updatedItems.map((updatedItem: any) => {
    const baseItem = baseItems.find((item: any) => {
      return item.id === updatedItem.id;
    });

    if (baseItem) {
      trackBaseItems = trackBaseItems.filter((item: any) => {
        return item.id !== updatedItem.id;
      });
      return {
        ...baseItem,
        quantity: updatedItem.quantity,
        type: ITEM_CATEGORIZED.UPDATE,
      };
    } else {
      return {
        ...updatedItem,
        type: ITEM_CATEGORIZED.CREATE,
      };
    }
  });

  const deletedItems = trackBaseItems.map((item: any) => {
    return {
      ...item,
      type: ITEM_CATEGORIZED.DELETE,
    };
  });

  return [...newItems, ...deletedItems];
};

export const generateOrderTotalPrice = (listOfItems: any[]) => {
  try {
    const total = listOfItems.reduce((acc: any, item: any) => {
      if (!acc?.subTotal) {
        acc.subTotal = 0;
      }

      if (!acc?.totalWithoutDiscount) {
        acc.totalWithoutDiscount = 0;
      }

      if (!acc?.PST) {
        acc.PST = 0;
      }

      if (!acc?.GST) {
        acc.GST = 0;
      }

      if (!acc?.discount) {
        acc.discount = 0;
      }

      acc.totalWithoutDiscount =
        (item?.isShowDiscount && item?.prevPrice
          ? item.prevPrice
          : item.price) * item.quantity;

      acc.subTotal += item.price * item.quantity;

      if (item?.inventoryItem?.hasPST) {
        acc.PST += item.price * item.quantity * pstRate;
      }

      if (item?.inventoryItem?.hasGST) {
        acc.GST += item.price * item.quantity * gstRate;
      }

      if (item?.isShowDiscount && item?.prevPrice) {
        acc.discount += (item.prevPrice - item.price) * item.quantity;
      }

      return acc;
    }, {});

    return {
      ...total,
      totalPrice: total.subTotal + total.PST + total.GST,
    };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

// const formatUpdatedItems = (
//   categoryId: number = 0,
//   updatedItems: any,
//   // subcategoryId: number = 0,
// ) => {
//   const formattedUpdatedItems = updatedItems.map((item: UpdatedItem) => {
//     return {
//       name: item.name,
//       price: item.price,
//       categoryId: categoryId,
//       availability: true,
//       inventoryItemId: item?.inventoryItemId || null,
//       inventoryUnitId: item?.inventoryUnitId || null,
//     };
//   });

//   return formattedUpdatedItems;
// };

// const generateScheduleOrderItems = (
//   updatedItems: UpdatedItem[],
//   scheduleOrder: any,
//   // subCategoryId: number | null,
//   // baseSubCategoryId: number | null, // categoryId of the client update this category
//   userId: number,
// ) => {
//   const newItems = updatedItems.map((newItem: UpdatedItem) => {
//     const { name, price, quantity } = newItem;

//     const existingItem = scheduleOrder.items.find(
//       (item: OrderedItems) => item.name === newItem.name,
//     );

//     // if (existingItem) {
//     if (existingItem) {
//       return {
//         name,
//         price,
//         quantity: existingItem.quantity,
//         scheduledOrderId: scheduleOrder.id,
//         inventoryItemId: existingItem.inventoryItemId,
//         inventoryUnitId: existingItem.inventoryUnitId,
//       };
//     }

//     // // if item is beansprouts and different subCategoryId => use the existing price
//     // if (subCategoryId !== baseSubCategoryId) {
//     //   return {
//     //     name,
//     //     price: existingItem.price,
//     //     quantity: existingItem.quantity,
//     //     scheduledOrderId: scheduleOrder.id,
//     //   };
//     // }
//     // }

//     return {
//       name,
//       price,
//       quantity: userId === scheduleOrder.userId ? quantity : 0,
//       scheduledOrderId: scheduleOrder.id,
//       inventoryItemId: newItem.inventoryItemId,
//       inventoryUnitId: newItem.inventoryUnitId,
//     };
//   });

//   return newItems;
// };

// const updateScheduleOrderItems = async (
//   updatedItems: UpdatedItem[],
//   scheduleOrder: any,
//   userId: number,
// ) => {
//   const prisma = new PrismaClient();
//   // Get new items and apply quantity from schedule order
//   const newItems: any = generateScheduleOrderItems(
//     updatedItems,
//     scheduleOrder,
//     // subCategoryId,
//     // baseSubCategoryId,
//     userId,
//   );

//   // remove all items of schedule order
//   await prisma.orderedItems.deleteMany({
//     where: {
//       scheduledOrderId: scheduleOrder.id,
//     },
//   });

//   // add new items with target schedule order
//   await prisma.orderedItems.createMany({
//     data: newItems,
//   });

//   const newTotalPrice: number = newItems.reduce(
//     (acc: number, newItem: OrderedItems) => {
//       const itemTotalPrice = newItem.price * newItem.quantity;
//       return acc + itemTotalPrice;
//     },
//     0,
//   );

//   await prisma.scheduleOrders.update({
//     where: {
//       id: scheduleOrder.id,
//     },
//     data: {
//       totalPrice: newTotalPrice,
//     },
//   });
// };


const createOrderedItems = async (
  order: Orders,
  items: any,
  createdBy: string = '',
) => {
  const prisma = new PrismaClient();

  // STEP 1: Loop through each item
  const inventoryItems = await prisma.inventoryItem.findMany({
    include: {
      vendorItem: {
        include: {
          unit: true,
        },
      },
      fifo: {
        include: {
          vendorItem: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  });

  // // Check is order valid to affect inventory
  const isValidToCheckInventory = await checkOrderValidToAffectInventory(
    order.deliveryDate,
  );

  const newOrderedItems = [];
  const allDeletedFifoIds = [];
  for (const item of items) {
    const targetedItem = inventoryItems.find(
      (inventoryItem) => inventoryItem.id === item.inventoryItemId,
    );

    // console.log(item, 'item');

    if (!targetedItem && item.isCustomAmount) {
      newOrderedItems.push({
        orderId: order.id,
        name: item.name,
        price: item.price,
        cost: item.cost,
        profit: item.price - item.cost,
        quantity: item.quantity,
        isCustomAmount: item.isCustomAmount,
      });
      continue;
    }

    if (!targetedItem) {
      console.error('Conflict Inventory Item Not Found');
      continue;
    }

    // If item is custom amount and is assigned to a new unit
    let unitId = item.inventoryUnitId;

    if (item.inventoryUnitId < 1) {
      const dbUnits = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: item.inventoryUnit.vendorItemId,
        },
      });
      const updatedAt = getTodayDate();
      await checkAndUpdateUnits(
        dbUnits,
        item.units,
        item.inventoryUnit.vendorItemId,
        `${updatedAt.date} ${updatedAt.time}`,
        createdBy,
      );

      const targetUnit = await prisma.inventoryUnit.findFirst({
        where: {
          vendorItemId: item.inventoryUnit.vendorItemId,
          ratio: item.inventoryUnit.ratio,
        },
      });

      unitId = targetUnit?.id;
    }

    const allUnits = await getAllUnitsByInventoryItemId(item.inventoryItemId);
    const itemUnit = allUnits?.find((unit: any) => unit.id === unitId);

    // console.log({ targetedItem, item }, 'targetedItem');
    // CASE 1:Check if vendor item has no batch
    if (targetedItem.fifo.length === 0) {
      const newFifo = await prisma.fifo.create({
        data: {
          inventoryItemId: targetedItem.id,
          vendorItemId: targetedItem.vendorItem[0].id,
          quantity: isValidToCheckInventory ? -item.quantity : 0,
          createdAt: order.orderTime,
          createdBy: order?.createdBy || '',
        },
        include: {
          vendorItem: true,
        },
      });

      // Update vendor item quantity
      if (isValidToCheckInventory) {
        await prisma.vendorItem.update({
          where: {
            id: targetedItem.vendorItem[0].id,
          },
          data: {
            quantity: -item.quantity,
          },
        });
      }

      // const unitRatioOf1 = targetedItem.vendorItem[0].unit.find((unit) => {
      //   return unit.ratio === 1;
      // });

      newOrderedItems.push({
        orderId: order.id,
        fifoId: newFifo.id,
        cost: itemUnit?.unitPrice || 0,
        profit: item.price - (itemUnit?.unitPrice || 0),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        inventoryUnitId: unitId,
        inventoryItemId: item.inventoryItemId,
        isCustomAmount: item?.isCustomAmount || false,
      });
    } else {
      // CASE 2: Check if vendor item has batch
      // STEP 2: Get and Sorted from latest date all FIFO from inventory item
      const itemFifo = targetedItem.fifo.map((fifo) => {
        const createdAt = fifo.createdAt.split(' ')[1];
        return { ...fifo, createdAt };
      });

      // Descending fifo - first item would be the latest
      const sortedFifo = sortByDeliveryDate(itemFifo, 'createdAt');
      if (isValidToCheckInventory) {
        // STEP 3: Use while loop to identify which fifo should be used
        //   itemQuantity = item.quantity * item.unit.ratio
        //   while (itemQuantity >= fifo.quantity)
        //     move to next FIFO
        let fifoIndex = 0;
        const deletedFifoIds = [];

        let itemQuantity = item.quantity * item.inventoryUnit.ratio;
        // let fifoQuantityLeft = itemQuantity;
        while (fifoIndex < sortedFifo.length - 1) {
          if (itemQuantity >= sortedFifo[fifoIndex].quantity) {
            deletedFifoIds.push(sortedFifo[fifoIndex].id);
            itemQuantity -= sortedFifo[fifoIndex].quantity;
            fifoIndex++;
          } else {
            break;
          }
        }

        // STEP 4: fifo.quantity - itemQuantity
        // If users order more than stock has - fifoIndex should reach the second last item
        await prisma.fifo.update({
          where: {
            id: sortedFifo[fifoIndex].id,
          },
          data: {
            quantity: sortedFifo[fifoIndex].quantity - itemQuantity,
          },
        });

        // STEP 5: vendorItem.quantity - (item.quantity * item.inventoryUnit.ratio)
        // Update Vendor Item Quantity
        const targetVendorItem = await prisma.vendorItem.findFirst({
          where: {
            id: sortedFifo[fifoIndex].vendorItemId,
          },
        });

        if (!targetVendorItem) {
          console.error('COnflict vendor item');
          continue;
        }

        await prisma.vendorItem.update({
          where: {
            id: sortedFifo[fifoIndex].vendorItemId,
          },
          data: {
            quantity:
              targetVendorItem.quantity -
              item.quantity * item.inventoryUnit.ratio,
          },
        });

        await prisma.orderedItems.updateMany({
          where: {
            fifoId: {
              in: deletedFifoIds,
            },
          },
          data: {
            fifoId: sortedFifo[fifoIndex].id,
          },
        });

        allDeletedFifoIds.push(...deletedFifoIds);

        const cost = sortedFifo[fifoIndex]?.price
          ? sortedFifo[fifoIndex].price
          : itemUnit?.unitPrice || 0;

        // STEP 6: Create ordered item with that fifo id attached
        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[fifoIndex].id,
          name: item.name,
          cost: cost,
          profit: item.price - cost,
          price: item.price,
          quantity: item.quantity,
          isShowDiscount: item?.isShowDiscount,
          prevPrice: item?.prevPrice,
          inventoryUnitId: unitId,
          inventoryItemId: item.inventoryItemId,
          isCustomAmount: item?.isCustomAmount || false,
        });
      } else {
        const cost = sortedFifo[0]?.price
          ? sortedFifo[0].price
          : itemUnit?.unitPrice || 0;

        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[0].id,
          name: item.name,
          cost: cost,
          profit: item.price - cost,
          price: item.price,
          quantity: item.quantity,
          isShowDiscount: item?.isShowDiscount,
          prevPrice: item?.prevPrice,
          inventoryUnitId: unitId,
          inventoryItemId: item.inventoryItemId,
          isCustomAmount: item?.isCustomAmount || false,
        });
      }
    }

    if (allDeletedFifoIds.length > 0) {
      await prisma.fifo.deleteMany({
        where: {
          id: {
            in: allDeletedFifoIds,
          },
        },
      });
    }
  }

  await prisma.orderedItems.createMany({
    data: newOrderedItems,
  });

  return newOrderedItems;
};
