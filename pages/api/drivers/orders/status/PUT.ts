import { ORDER_STATUS } from '@/app/utils/enum';
import {
  restockInventoryItem,
  subtractInventoryItem,
} from '@/pages/api/admin/[companyId]/orderedItems/single';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import { recordAction } from '@/pages/api/utils/timeline';
import { OrderedItems, PaymentStatus, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orderId: number;
  updatedStatus: ORDER_STATUS;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { orderId, updatedStatus }: IBody = req.body;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order Id Not Found',
      });
    }

    // Get driver update info
    const driverUpdate: any = await getDriverInfo(req, res);
    const { date, time, dateAndTime } = getTodayDate();

    const updatedBy = `Driver - ${driverUpdate.name}`;

    let deliveredAt: string | null = dateAndTime;

    if (
      existingOrder.status !== ORDER_STATUS.DELIVERED &&
      existingOrder.status !== ORDER_STATUS.COMPLETED &&
      (updatedStatus === ORDER_STATUS.DELIVERED ||
        updatedStatus === ORDER_STATUS.COMPLETED)
    ) {
      deliveredAt = dateAndTime;
    } else {
      deliveredAt = existingOrder?.deliveredAt || null;
    }

    const statusUpdateData: any = {};
    const createdBy = `Driver - ${driverUpdate.name}`;
    let title = ''; // Comment for action record

    if (updatedStatus === ORDER_STATUS.COMPLETED) {
      statusUpdateData.status = ORDER_STATUS.DELIVERED;
      statusUpdateData.paymentStatus = PaymentStatus.Paid;
    } else if (updatedStatus === ORDER_STATUS.INCOMPLETED) {
      statusUpdateData.status = updatedStatus;
      statusUpdateData.paymentStatus = PaymentStatus.Unpaid;
    } else if (updatedStatus === ORDER_STATUS.VOID) {
      statusUpdateData.status = updatedStatus;
      statusUpdateData.paymentStatus = PaymentStatus.Unpaid;
    } else if (updatedStatus === ORDER_STATUS.DELIVERED) {
      statusUpdateData.status = updatedStatus;
      statusUpdateData.paymentStatus = PaymentStatus.Unpaid;
    }

    if (statusUpdateData.status !== existingOrder.status) {
      title += `Driver - ${driverUpdate.name} updated order status: ${existingOrder.status} -> ${statusUpdateData.status}\n`;
    }

    if (statusUpdateData.paymentStatus !== existingOrder.paymentStatus) {
      title += `and updated payment status: ${existingOrder.paymentStatus} -> ${statusUpdateData.paymentStatus}`;
    }

    await recordAction(existingOrder.id, createdBy, title);

    console.log(statusUpdateData, 'statusUpdateData');
    const updatedOrder = await prisma.orders.update({
      where: {
        id: existingOrder.id,
      },
      data: {
        ...statusUpdateData,
        updatedBy,
        updateTime: new Date(`${date} ${time}`),
        deliveredBy:
          updatedStatus !== ORDER_STATUS.VOID ? driverUpdate.name : null,
        deliveredAt,
        isVoid: updatedStatus === ORDER_STATUS.VOID && true,
      },
      include: {
        user: {
          include: {
            preference: true,
            category: true,
          },
        },
        items: {
          include: {
            fifo: true,
            inventoryUnit: true,
          },
        },
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
            updatedOrder.id,
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
            updatedOrder.id,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
        }
      }
    }

    const newItems = updatedOrder.items.map((item: OrderedItems) => {
      const totalPrice = item.quantity * item.price;
      return { ...item, totalPrice };
    });

    return res.status(200).json({
      data: { ...updatedOrder.user, ...updatedOrder, items: newItems },
      message: 'Order Status Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
