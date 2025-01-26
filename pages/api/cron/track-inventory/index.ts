import { Fifo, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import { ACTION, ORDER_STATUS } from '@/app/utils/enum';
import { subtractInventoryItem } from '../../admin/orderedItems/single';
import { YYYYMMDDFormat } from '@/app/utils/time';

interface ItemMap {
  [key: string]: {
    quantity: number;
    inventoryItem: any; // Replace with the actual type if different
    fifo: any; // Replace with the actual type if different
    inventoryUnit: any; // Replace with the actual type if different
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const authHeader = req.headers.authorization;
  console.log(authHeader, 'AUTH HEADER');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const prisma = new PrismaClient();

    const date: { date: string; time: string } = getTodayDate();

    // 1. Record the left inventory
    const todayDate = new Date(`${date.date} ${date.time}`);
    const yesterday = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() - 1,
    );
    const yesterdayString = YYYYMMDDFormat(yesterday);
    console.log(yesterdayString, 'yesterdayString');

    // Check if action is taken already
    const recordInventoryAction = prisma.action.findFirst({
      where: {
        name: ACTION.RECORD_INVENTORY,
        date: yesterdayString,
      },
    });
    console.log(recordInventoryAction, 'recordInventoryAction');

    if (!recordInventoryAction) {
      const inventoryItems = await prisma.inventoryItem.findMany({
        include: {
          fifo: true,
        },
      });

      let actionDescription: string = '';

      for (const item of inventoryItems) {
        const qty = item.fifo.reduce((acc: number, fifo: Fifo) => {
          return acc + fifo.quantity;
        }, 0);

        actionDescription += `${item.name}: ${qty} ||`;
      }

      const newAction = await prisma.action.create({
        data: {
          name: ACTION.RECORD_INVENTORY,
          date: yesterdayString,
          description: actionDescription,
          createdAt: `${date.time} ${date.date}`,
        },
      });

      console.log({newAction, actionDescription});
    }

    // 2. Track Inventory
    // Check in DB if the action is taken already
    const action = await prisma.action.findFirst({
      where: {
        name: ACTION.TRACK_INVENTORY,
        date: date.date,
      },
    });

    // If yes, return
    if (action && action.name === ACTION.TRACK_INVENTORY) {
      return res
        .status(200)
        .json({ message: 'Track Inventory Action Already Taken' });
    }

    // Get all items that has been ordered today that quantity is greater than 0
    const orderedItems = await prisma.orderedItems.findMany({
      where: {
        quantity: {
          gt: 0,
        },
        orderId: {
          not: null, // Make sure the orderId is not null
        },
        inventoryItemId: {
          not: null, // Make sure do not touhch any custom amount
        },
        Orders: {
          status: {
            not: ORDER_STATUS.VOID, // Make sure the order is able to affect inventory
          },
          deliveryDate: date.date, // Only the selected date
          isAffectInventory: true, // Make sure the order is able to affect inventory
        },
      },
      include: {
        inventoryItem: true,
        inventoryUnit: true,
        fifo: true,
      },
    });

    if (orderedItems.length === 0) {
      return res.status(200).json({ message: 'No Items Ordered Today' });
    }

    // Create a set of same items and quantity
    const itemMap: ItemMap = orderedItems.reduce((acc: any, item: any) => {
      if (!item.inventoryItemId) return acc; // Make sure again not touching the custom amount
      if (!acc[item.inventoryItemId]) {
        acc[item.inventoryItemId] = {
          quantity: item.quantity * item.inventoryUnit.ratio,
          inventoryItem: item.inventoryItem,
          fifo: item.fifo,
          inventoryUnit: item.inventoryUnit,
        };
      } else {
        acc[item.inventoryItemId].quantity +=
          item.quantity * item.inventoryUnit.ratio;
      }
      return acc;
    }, {});

    let actionDescription: string = '';
    // Loop through that item set, update inventory item quantity
    for (const inventoryItem of Object.values(itemMap)) {
      await subtractInventoryItem(
        -1, // Force to subtract the inventory quantity
        inventoryItem.fifo,
        { ratio: 1 }, // Already calculate correct quantity above
        inventoryItem.quantity,
      );

      // Transform itemMap to a string
      actionDescription += `${inventoryItem.inventoryItem.name}: ${inventoryItem.quantity} || `;
    }

    // Flag the action as taken
    await prisma.action.create({
      data: {
        name: ACTION.TRACK_INVENTORY,
        date: date.date,
        description: actionDescription,
        createdAt: `${date.time} ${date.date}`,
      },
    });
    return res.status(200).json({ message: 'Track Inventory Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error: ' + error.message });
  }
}
