import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { OrderedItems, UserType } from '@/app/utils/type';
import { sendEmail } from '../../utils/email';
import { pusherServer } from '@/app/pusher';
import { normalizeDate, sortByDeliveryDate } from '../../utils/date';
import { getUserInfo } from '../../utils/auth';
import { checkHasClientOrder } from '../../import-sheets/utils';
import { generateOrderTotalPrice } from '../orderedItems/PUT';
import { checkOrderValidToAffectInventory } from '../../utils/order';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb', // Set desired value here
    },
  },
};

interface BodyTypes {
  deliveryDate: string;
  scheduleOrderIds: number[];
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const contentLength = req.headers['content-length'];
    console.log('Content-Length Header:', contentLength);
    const requestBodySize = Buffer.byteLength(JSON.stringify(req.body));
    console.log('Request Body Size:', requestBodySize, 'bytes');
    const { deliveryDate, scheduleOrderIds, createdAt } = req.body as BodyTypes;

    const isSendToAdmin = false;
    const updatedOrderList: any = [];

    const scheduleOrderList: any = await prisma.scheduleOrders.findMany({
      where: {
        id: {
          in: scheduleOrderIds,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
        user: true,
      },
    });

    for (const scheduleOrder of scheduleOrderList) {
      const returnOrder = {
        id: scheduleOrder.id,
        items: scheduleOrder.items.map((item: any) => {
          return {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          };
        }),
        totalPrice: scheduleOrder.totalPrice,
        userId: scheduleOrder.user.id,
        createdAt: createdAt,
      };
      try {
        if (scheduleOrder.totalPrice === 0) {
          await pusherServer?.trigger(
            'admin-schedule-order',
            'pre-order',
            returnOrder,
          );
          // console.log({ zeroTotalPrice: scheduleOrder });
          continue;
        }
        // Check has user order for today, if yes then skip that client
        const existingOrder: any = await checkHasClientOrder(
          scheduleOrder.user.id,
          deliveryDate,
        );

        if (existingOrder) {
          await pusherServer?.trigger(
            'admin-schedule-order',
            'pre-order',
            existingOrder,
          );
          // console.log({ alreadyOrder: scheduleOrder });
          continue;
        }

        // Check is user has time off
        const unavailableRanges = await prisma.dayRange.findMany({
          where: {
            userId: scheduleOrder.userId,
          },
        });

        let trackIndex = 0;
        const deliveryDateTypeDate = normalizeDate(new Date(deliveryDate));
        for (const unavailableRange of unavailableRanges) {
          const normalizedStartDate = normalizeDate(unavailableRange.startDate);
          const normalizedEndDate = normalizeDate(unavailableRange.endDate);

          normalizedEndDate.setDate(normalizedEndDate.getDate() - 1);
          if (
            deliveryDateTypeDate >= normalizedStartDate &&
            deliveryDateTypeDate <= normalizedEndDate
          ) {
            break;
          }
          trackIndex++;
        }

        if (trackIndex <= unavailableRanges.length - 1) {
          await pusherServer?.trigger(
            'admin-schedule-order',
            'pre-order',
            returnOrder,
          );
          // console.log({ unavailableTime: scheduleOrder });
          continue;
        }

        // Get person create info
        const adminCreate: any = await getUserInfo(req, res);

        const newOrder: any = await createOrder(
          scheduleOrder.user,
          scheduleOrder.items,
          deliveryDate,
          createdAt,
          `Admin - ${adminCreate.clientName}`,
        );

        await sendEmail(
          scheduleOrder.user,
          scheduleOrder,
          newOrder.id,
          deliveryDate,
          isSendToAdmin,
        );
        updatedOrderList.push(newOrder);

        await pusherServer?.trigger(
          'admin-schedule-order',
          'pre-order',
          newOrder,
        );
        // console.log({ successful: scheduleOrder });
      } catch (error: any) {
        console.error('Fail to pre order: ', error);
        // await pusherServer?.trigger(
        //   'admin-schedule-order',
        //   'pre-order',
        //   scheduleOrder,
        // );
        continue;
        // console.log({ fail: scheduleOrder });
      }
    }

    return res.status(201).json({
      data: updatedOrderList,
      message: 'Pre Order Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error.message,
    });
  }
}

export const createOrder = async (
  user: User | UserType,
  items: OrderedItems[],
  deliveryDate: string,
  orderTime: string,
  createdBy: string,
  note: string = '',
) => {
  try {
    const prisma = new PrismaClient();

    const total = generateOrderTotalPrice(items);

    // initialize order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate,
        note,
        status: ORDER_STATUS.INCOMPLETED,
        userId: user.id,
        subTotal: total.subTotal,
        PST: total.PST,
        GST: total.GST,
        discount: total.discount,
        totalPrice: total.totalPrice,
        isAffectInventory: true,
        orderTime,
        createdBy,
      },
    });

    await createOrderedItems(newOrder, items);

    const updatedOrder = await prisma.orders.findUnique({
      where: {
        id: newOrder.id,
      },
      include: {
        items: true,
        user: true,
      },
    });

    return updatedOrder;
  } catch (error: any) {
    console.log('Internal Server Error - Fail to create order: ', error);
  }
};

const createOrderedItems = async (order: any, items: any) => {
  const prisma = new PrismaClient();

  // STEP 1: Loop through each item
  const inventoryItems = await prisma.inventoryItem.findMany({
    include: {
      vendorItem: true,
      fifo: {
        // include: {
        //   vendorItem: true,
        // },
      },
    },
  });

  // // Check is order valid to affect inventory
  const isValidToCheckInventory = checkOrderValidToAffectInventory(
    order.deliveryDate,
  );

  const newOrderedItems = [];
  const allDeletedFifoIds = [];
  for (const item of items) {
    const targetedItem = inventoryItems.find(
      (inventoryItem) => inventoryItem.id === item.inventoryItemId,
    );

    // console.log(item, 'item');

    if (!targetedItem) {
      console.error('Conflict Inventory Item Not Found');
      continue;
    }

    // console.log({ targetedItem, item }, 'targetedItem');
    // Check if vendor item has no batch
    if (targetedItem.fifo.length === 0) {
      const newFifo = await prisma.fifo.create({
        data: {
          inventoryItemId: targetedItem.id,
          vendorItemId: targetedItem.vendorItem[0].id,
          quantity: isValidToCheckInventory ? -item.quantity : 0,
          createdAt: order.orderTime,
          createdBy: order.createdBy,
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

      newOrderedItems.push({
        orderId: order.id,
        fifoId: newFifo.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        inventoryUnitId: item.inventoryUnitId,
        inventoryItemId: item.inventoryItemId,
      });
    } else {
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

        // STEP 6: Create ordered item with that fifo id attached
        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[fifoIndex].id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          isShowDiscount: item?.isShowDiscount,
          prevPrice: item?.prevPrice,
          inventoryUnitId: item.inventoryUnitId,
          inventoryItemId: item.inventoryItemId,
        });
      } else {
        newOrderedItems.push({
          orderId: order.id,
          fifoId: sortedFifo[0].id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          isShowDiscount: item?.isShowDiscount,
          prevPrice: item?.prevPrice,
          inventoryUnitId: item.inventoryUnitId,
          inventoryItemId: item.inventoryItemId,
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
};
