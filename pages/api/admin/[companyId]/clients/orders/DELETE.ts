// import { pusherServer } from '@/app/pusher';
import { NextApiRequest, NextApiResponse } from 'next';
import { restockInventoryItem } from '../../orderedItems/single';
import { ORDER_STATUS } from '@/app/utils/enum';
import prisma from '@/client';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';
import { InventoryLogType, InventoryLogFrom } from '@prisma/client';
import { checkOrderValidToAffectInventory } from '@/pages/api/utils/order';

interface BodyTypes {
  orderId?: string;
  orderList?: any[];
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { companyId } = req.query;

    const { orderId, orderList } = req.body as BodyTypes;

    if (orderList) {
      for (const order of orderList) {
        const isValidToAffectInventory = await checkOrderValidToAffectInventory(
          Number(companyId),
          order.deliveryDate,
        );

        if (!isValidToAffectInventory) {
          continue;
        }

        for (const item of order.items) {
          if (item?.fifo && item?.inventoryUnit) {
            if (item.quantity > 0 && order.status !== ORDER_STATUS.VOID) {
              await restockInventoryItem(
                Number(order.id),
                item.fifo,
                item.inventoryUnit,
                item.quantity,
              );

              // Record inventory log
              await recordOrderInventoryLog(
                Number(order.id),
                item.fifo.inventoryItemId,
                item.quantity,
                InventoryLogType.RESTOCK,
                InventoryLogFrom.DELETE_ORDER,
                `Restock ${item.quantity} ${item?.inventoryItem?.name} to inventory due to order ${order.id} deleted`,
              );
            }
          }
        }
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
              inventoryItem: true,
            },
          },
        },
      });

      if (!existingOrder) {
        return res.status(404).json({
          error: 'Order Not Found',
        });
      }

      const isValidToAffectInventory = await checkOrderValidToAffectInventory(
        Number(companyId),
        existingOrder.deliveryDate,
      );

      // Restock Inventory Items when order is valid to affect inventory
      if (isValidToAffectInventory) {
        for (const item of existingOrder.items) {
          console.log(item);
          if (
            item?.fifo &&
            item?.inventoryUnit &&
            existingOrder.status !== ORDER_STATUS.VOID &&
            item.quantity > 0
          ) {
            await restockInventoryItem(
              Number(orderId),
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );
            
            // Record inventory log
            await recordOrderInventoryLog(
              Number(orderId),
              item.fifo.inventoryItemId,
              item.quantity,
              InventoryLogType.RESTOCK,
              InventoryLogFrom.DELETE_ORDER,
              `Restock ${item.quantity} ${item?.inventoryItem?.name} to inventory due to order ${existingOrder.id} deleted`,
            );
          }
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
