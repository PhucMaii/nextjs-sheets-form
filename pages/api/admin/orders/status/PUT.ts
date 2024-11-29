import { ORDER_STATUS } from '@/app/utils/enum';
import { getUserInfo } from '@/pages/api/utils/auth';
import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  restockInventoryItem,
  subtractInventoryItem,
} from '../../orderedItems/single';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();
  try {
    const { id, status, updatedOrders } = req.body as any;

    const adminCreate: any = await getUserInfo(req, res);

    const updateTime = new Date();
    if (id) {
      const existingOrder = await prisma.orders.findUnique({
        where: {
          id,
        },
      });

      if (!existingOrder) {
        return res.status(404).json({
          error: 'Order Not Found',
        });
      }

      const updatedOrder = await prisma.orders.update({
        where: {
          id,
        },
        data: {
          status,
          updatedBy: `Admin - ${adminCreate.clientName}`,
          updateTime,
          isVoid: false,
        },
        include: {
          items: {
            include: {
              fifo: true,
              inventoryUnit: true,
            }
          },
        },
      });

      const newItems = updatedOrder.items.map((item: OrderedItems) => {
        const totalPrice = item.quantity * item.price;
        return { ...item, totalPrice };
      });

      const user = await prisma.user.findUnique({
        where: {
          id: updatedOrder.userId,
        },
        include: {
          category: true,
          subCategory: true,
        },
      });

      // Inventory Item Update
      // From other status to VOID -> Inventory Item get restock
      if (
        existingOrder.status !== ORDER_STATUS.VOID &&
        updatedOrder.status === ORDER_STATUS.VOID
      ) {
        for (const item of updatedOrder.items) {
          if (item?.fifo && item?.inventoryUnit) {
            await restockInventoryItem(item.fifo, item.inventoryUnit, item.quantity);
          }
        }
      }

      // From VOID to other status -> Inventory Item Stock Is Subtracted
      if (
        existingOrder.status === ORDER_STATUS.VOID &&
        updatedOrder.status !== ORDER_STATUS.VOID
      ) {
        for (const item of updatedOrder.items) {
          if (item?.fifo && item?.inventoryUnit) {
            await subtractInventoryItem(item.fifo, item.inventoryUnit, item.quantity);
          }
        }
      }

      return res.status(200).json({
        data: { ...user, ...updatedOrder, items: newItems },
        message: 'Order Status Updated Successfully',
      });
    }

    // for (const order of updatedOrders) {
    //   await prisma.orders.updateMany({
    //     where: {
    //       id: order.id,
    //     },
    //     data: {
    //       status,
    //     },
    //   });
    // }
    const idsToUpdate = updatedOrders.map((order: any) => order.id);

    await prisma.orders.updateMany({
      where: {
        id: {
          in: idsToUpdate,
        },
      },
      data: {
        status,
        isVoid: false,
      },
    });

    // From other status to VOID -> Inventory Item get restock
    if (status === ORDER_STATUS.VOID) {
      for (const order of updatedOrders) {
        if (!order?.items) {
          continue;
        }

        // var order is the previous state of order
        if (order.status === ORDER_STATUS.VOID) {
          continue;
        }

        for (const item of order.items) {
          if (!item?.fifo || !item?.inventoryUnit) {
            continue;
          }

          // await updateSingleInventoryItem(item.inventoryItemId, 0, item.quantity);
          await restockInventoryItem(item.fifo, item.inventoryUnit, item.quantity);
        }
      }
    }
    // From VOID status to other status -> Inventory Item Get Subtracted
    else {
      for (const order of updatedOrders) {
        if (!order?.items) {
          continue;
        }

        // var order is the previous state of order
        if (order.status !== ORDER_STATUS.VOID) {
          continue;
        }

        for (const item of order.items) {
          if (!item?.fifo || !item?.inventoryUnit) {
            continue;
          }

          // await updateSingleInventoryItem(item.inventoryItemId, item.quantity, 0);
          await subtractInventoryItem(item.fifo, item.inventoryUnit, item.quantity);
        }
      }
    }

    return res.status(200).json({
      message: 'Order Status Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
