import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { InventoryLogFrom, InventoryLogType, OrderedItems, PaymentStatus } from '@prisma/client';
import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  restockInventoryItem,
  subtractInventoryItem,
} from '../../orderedItems/single';
import { recordAction } from '@/pages/api/utils/timeline';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { checkOrderValidToAffectInventory } from '@/pages/api/utils/order';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';

interface IBody {
  id: number;
  status?: string;
  paymentStatus?: PaymentStatus;
  updatedOrderIds?: number[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;
    const { id, status, paymentStatus, updatedOrderIds } = req.body as IBody;

    const updateTime = new Date();

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      updateData.isVoid = false;
      if (status === ORDER_STATUS.VOID) {
        updateData.paymentStatus = PaymentStatus.Unpaid;
      }
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === PaymentStatus.Paid) {
        updateData.status = ORDER_STATUS.DELIVERED;
      }

      if (paymentStatus === PaymentStatus.Unpaid) {
        updateData.status = ORDER_STATUS.INCOMPLETED;
      }
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
          updatedBy: createdBy,
          updateTime,
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

      // Record actions
      let title = '';
      if (updateData.status && updateData.status !== existingOrder.status) {
        title = `status: ${existingOrder.status} -> ${updateData.status}`;
      } else if (updateData.paymentStatus && updateData.paymentStatus !== existingOrder.paymentStatus) {
        title = `payment status: ${existingOrder.paymentStatus} -> ${updateData.paymentStatus}`;
      }

      await recordAction(
        id,
        createdBy,
        `${createdBy} updated order ${title}`,
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
      
      const isValidToAffectInventory = await checkOrderValidToAffectInventory(
        Number(companyId),
        existingOrder.deliveryDate,
      );

      // Inventory Item Update
      // From other status to VOID -> Inventory Item get restock
      if (
        existingOrder.status !== ORDER_STATUS.VOID &&
        updatedOrder.status === ORDER_STATUS.VOID &&  
        isValidToAffectInventory
      ) {
        for (const item of updatedOrder.items) {
          if (item?.fifo && item?.inventoryUnit) {
            await restockInventoryItem(
              existingOrder.id,
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );

            // Record inventory log
            await recordOrderInventoryLog(
              existingOrder.id,
              item.fifo.inventoryItemId,
              item.quantity,
              InventoryLogType.RESTOCK,
              InventoryLogFrom.EDIT_ORDER,
              `Restock ${item.quantity} ${item?.inventoryItem?.name} to inventory due to order ${existingOrder.id} updated status from ${existingOrder.status} to ${updatedOrder.status}`,
            );
          }
        }
      }

      // From VOID to other status -> Inventory Item Stock Is Subtracted
      if (
        existingOrder.status === ORDER_STATUS.VOID &&
        updatedOrder.status !== ORDER_STATUS.VOID &&
        isValidToAffectInventory
      ) {
        for (const item of updatedOrder.items) {
          if (item?.fifo && item?.inventoryUnit) {
            await subtractInventoryItem(
              existingOrder.id,
              item.fifo,
              item.inventoryUnit,
              item.quantity,
            );

            // Record inventory log
            await recordOrderInventoryLog(
              existingOrder.id,
              item.fifo.inventoryItemId,
              item.quantity,
              InventoryLogType.SUBTRACT,
              InventoryLogFrom.EDIT_ORDER,
              `Subtract ${item.quantity} ${item?.inventoryItem?.name} from inventory due to order ${existingOrder.id} updated status from ${existingOrder.status} to ${updatedOrder.status}`,
            );
          }
        }
      }

      return res.status(200).json({
        data: { ...user, ...updatedOrder, items: newItems },
        message: 'Order Status Updated Successfully',
      });
    }

    // Update multiple orders
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
        updatedBy: createdBy,
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
          createdBy,
          `${createdBy} updated order ${title}`,
        );

        // Check if order is valid to affect inventory
        const isValidToAffectInventory = await checkOrderValidToAffectInventory(
          Number(companyId),
          order.deliveryDate,
        );

        if (!isValidToAffectInventory) {
          continue;
        }

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

          // Record inventory log
          await recordOrderInventoryLog(
            order.id,
            item.fifo.inventoryItemId,
            item.quantity,
            InventoryLogType.RESTOCK,
            InventoryLogFrom.EDIT_ORDER,
            `Restock ${item.quantity} ${item?.inventoryItem?.name} to inventory due to order ${order.id} updated status from ${order.status} to ${updateData.status}`,
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
          createdBy,
          `${createdBy} updated order ${title}`,
        );

        // Check if order is valid to affect inventory
        const isValidToAffectInventory = await checkOrderValidToAffectInventory(
          Number(companyId),
          order.deliveryDate,
        );

        if (!isValidToAffectInventory) {
          continue;
        }

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

          // Record inventory log
          await recordOrderInventoryLog(
            order.id,
            item.fifo.inventoryItemId,
            item.quantity,
            InventoryLogType.SUBTRACT,
            InventoryLogFrom.EDIT_ORDER,
            `Subtract ${item.quantity} ${item?.inventoryItem?.name} from inventory due to order ${order.id} updated status from ${order.status} to ${updateData.status}`,
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
