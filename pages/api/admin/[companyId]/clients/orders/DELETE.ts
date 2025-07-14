// import { pusherServer } from '@/app/pusher';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { restockInventoryItem } from '../../orderedItems/single';
import { ORDER_STATUS } from '@/app/utils/enum';

interface BodyTypes {
  orderId?: string;
  orderList?: any[];
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { orderId, orderList } = req.body as BodyTypes;

    if (orderList) {
      for (const order of orderList) {
        for (const item of order.items) {
          if (item?.fifo && item?.inventoryUnit) {
            if (item.quantity > 0 && order.status !== ORDER_STATUS.VOID) {
              await restockInventoryItem(
                Number(order.id),
                item.fifo,
                item.inventoryUnit,
                item.quantity,
              );
            }
          }
        }

        // await pusherServer?.trigger(
        //   'admin-delete-order',
        //   'delete-order',
        //   deletedOrder,
        // );
      }
      const deletedOrderIds = orderList.map((order: any) => order.id);

      await prisma.orders.deleteMany({
        where: {
          id: {
            in: deletedOrderIds,
          },
        },
      });
    } else if (orderId) {
      const existingOrder = await prisma.orders.findUnique({
        where: {
          id: Number(orderId),
        },
        include: {
          items: {
            include: {
              fifo: true,
              inventoryUnit: true,
            },
          },
        },
      });

      if (!existingOrder) {
        return res.status(404).json({
          error: 'Order Not Found',
        });
      }

      for (const item of existingOrder.items) {
        console.log(item);
        if (
          item?.fifo &&
          item?.inventoryUnit &&
          existingOrder.status !== ORDER_STATUS.VOID &&
          item.quantity > 0
        ) {
          console.log('restocking');
          await restockInventoryItem(
            Number(orderId),
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
        }
      }

      await prisma.orders.delete({
        where: {
          id: Number(orderId),
        },
        include: {
          items: {
            include: {
              fifo: true,
              inventoryUnit: true,
            },
          },
        },
      });
    } else {
      return res.status(500).json({
        error: 'Please provide either order list or order id to be deleted',
      });
    }

    return res.status(200).json({
      message: 'Order Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
