import { ORDER_STATUS } from '@/app/utils/enum';
import {
  categorizeUpdatedItems,
  generateOrderTotalPrice,
  ITEM_CATEGORIZED,
} from '@/pages/api/admin/orderedItems/PUT';
import {
  generateCostAndProfit,
  restockInventoryItem,
  updateSingleInventoryItem,
} from '@/pages/api/admin/orderedItems/single';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import {
  formatItemsWithTotalPrice,
} from '@/pages/api/utils/order';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orderId: number;
  updatedItems: any[];
  note?: string;
  deliveryDate?: string;
  // updateOption?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();
    const updatedData = req.body as any;
    const {
      orderId,
      updatedItems,
      note,
      deliveryDate,
      // updateOption,
    } = updatedData as IBody;

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

    for (const item of newItems) {
      // Check item categorize to create, update or delete

      // CREATE
      if (item.type === ITEM_CATEGORIZED.CREATE) {
        await createOrderedItems(existingOrder, [item]);
        continue;
      } else if (item.type === ITEM_CATEGORIZED.REMAIN) {
        // REMAIN
        continue;
      } else if (item.type === ITEM_CATEGORIZED.DELETE) {
        // DELETE
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
        // UPDATE
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
    const driverUpdate: any = await getDriverInfo(req, res);
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
        note,
        deliveryDate,
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        discount: orderTotalPrice.discount,
        updatedBy: `Driver - ${driverUpdate?.name}`,
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
};

export default withDriverAuthGuard(handler);
