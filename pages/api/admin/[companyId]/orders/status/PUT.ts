import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { OrderedItems, PaymentStatus, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  restockInventoryItem,
  subtractInventoryItem,
} from '../../orderedItems/single';
import { recordAction } from '@/pages/api/utils/timeline';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';

interface IBody {
  id: number;
  status?: string;
  paymentStatus?: PaymentStatus;
  updatedOrderIds?: number[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();
  try {
    const { id, status, paymentStatus, updatedOrderIds } = req.body as IBody;
    console.log({ status, paymentStatus });

    const session: any = await getServerSession(req, res, authOptions);
    const adminCreate: any = session?.user;

    const updateTime = new Date();

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      updateData.isVoid = false;
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

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
          ...updateData,
          updatedBy: `Admin - ${adminCreate.name}`,
          updateTime,
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

      // Record actions
      let title = '';
      if (updateData.status !== existingOrder.status) {
        title = `status: ${existingOrder.status} -> ${updateData.status}`;
      } else if (updateData.paymentStatus !== existingOrder.paymentStatus) {
        title = `payment status: ${existingOrder.paymentStatus} -> ${updateData.paymentStatus}`;
      }

      await recordAction(
        id,
        `${createdBy} updated order ${title}`,
        createdBy,
      );

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
            await restockInventoryItem(
              existingOrder.id,
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );
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
            await subtractInventoryItem(
              existingOrder.id,
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );
          }
        }
      }

      return res.status(200).json({
        data: { ...user, ...updatedOrder, items: newItems },
        message: 'Order Status Updated Successfully',
      });
    }

    const updatedOrders = await prisma.orders.findMany({
      where: {
        id: {
          in: updatedOrderIds,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            fifo: true,
            inventoryUnit: true,
          },
        },
      },
    });

    const idsToUpdate = updatedOrders.map((order: any) => order.id);

    await prisma.orders.updateMany({
      where: {
        id: {
          in: idsToUpdate,
        },
      },
      data: {
        ...updateData,
        updatedBy: `Admin - ${adminCreate.name}`,
        updateTime,
      },
    });

    // From other status to VOID -> Inventory Item get restock
    if (status === ORDER_STATUS.VOID) {
      for (const order of updatedOrders) {
        if (!order?.items) {
          continue;
        }

        // Skip order with VOID status because updated status is VOID
        if (order.status === ORDER_STATUS.VOID) {
          continue;
        }

        // Record actions
        let title = '';
        if (updateData.status !== order.status) {
          title = `status: ${order.status} -> ${updateData.status}`;
        } else if (updateData.paymentStatus !== order.paymentStatus) {
          title = `payment status: ${order.paymentStatus} -> ${updateData.paymentStatus}`;
        }

        await recordAction(
          order.id,
          `${createdBy} updated order ${title}`,
          createdBy,
        );

        for (const item of order.items) {
          if (item.quantity === 0) {
            continue;
          }
          if (!item?.fifo || !item?.inventoryUnit) {
            continue;
          }

          await restockInventoryItem(
            order.id,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
        }
      }
    }
    // From VOID status to other status -> Inventory Item Get Subtracted
    else {
      for (const order of updatedOrders) {
        if (!order?.items) {
          continue;
        }

        // Skip order if order status is not VOID because only update inventory quantity if order status is changed from VOID to other status
        // Ex: From VOID to DELIVERED (Update Inventory Quantity), From INCOMPLETE to DELIVERED (Not Update Inventory Quantity)
        if (order.status !== ORDER_STATUS.VOID) {
          continue;
        }

        // Record actions

        let title = '';
        if (updateData.status !== order.status) {
          title = `status: ${order.status} -> ${updateData.status}`;
        } else if (updateData.paymentStatus !== order.paymentStatus) {
          title = `payment status: ${order.paymentStatus} -> ${updateData.paymentStatus}`;
        }

        await recordAction(
          order.id,
          `${createdBy} updated order ${title}`,
          createdBy,
        );

        for (const item of order.items) {
          if (item.quantity === 0) {
            continue;
          }

          if (!item?.fifo || !item?.inventoryUnit) {
            continue;
          }

          // await updateSingleInventoryItem(item.inventoryItemId, item.quantity, 0);
          await subtractInventoryItem(
            order.id,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
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
