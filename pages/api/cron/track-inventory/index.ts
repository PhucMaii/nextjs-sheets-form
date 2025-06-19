import { Fifo, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '@/pages/api/utils/date';
import { ACTION, ORDER_STATUS } from '@/app/utils/enum';
import { subtractInventoryItem } from '@/pages/api/admin/[companyId]/orderedItems/single';
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

    const companies = await prisma.company.findMany();

    for (const company of companies) {
      // Check if action is taken already
      const recordInventoryAction = await prisma.action.findFirst({
        where: {
          name: ACTION.RECORD_INVENTORY,
          date: yesterdayString,
          companyId: company.id,
        },
      });

      if (!recordInventoryAction) {
        const inventoryItems = await prisma.inventoryItem.findMany({
          where: {
            companyId: company.id,
          },
          include: {
            fifo: true,
          },
        });

        let actionDescription: string = '';

        // Loop thru each item and added in fifo to retrieve correct left quantity
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
            companyId: company.id,
          },
        });

        console.log({ newAction, actionDescription, companyId: company.id });
      }

      // 2. Track Inventory
      // Check in DB if the action is taken already
      const action = await prisma.action.findFirst({
        where: {
          name: ACTION.TRACK_INVENTORY,
          date: date.date,
          companyId: company.id,
        },
      });

      // If yes, return
      if (action && action.name === ACTION.TRACK_INVENTORY) {
        console.log(
          'Track Inventory Action Already Taken In Company: ',
          company.id,
        );
        continue;
      }

      // Get all items that has been ordered today that quantity is greater than 0
      const orderedItems = await prisma.orderedItems.findMany({
        where: {
          quantity: {
            gt: 0,
          },
          companyId: company.id,
          orderId: {
            not: null, // Make sure the orderId is not null
          },
          inventoryItemId: {
            not: null, // Make sure do not touch any custom amount
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
        console.log('No Items Ordered Today In Company: ', company.id);
        await prisma.action.create({
          data: {
            name: ACTION.TRACK_INVENTORY,
            date: date.date,
            description: 'No Items Ordered Today',
            createdAt: `${date.time} ${date.date}`,
            companyId: company.id,
          },
        });
        continue;
      }

      // Create a set of same items and quantity
      const itemMap: ItemMap = orderedItems.reduce((acc: any, item: any) => {
        if (!item.inventoryItemId || !item.inventoryUnitId) return acc; // Make sure again not touching the custom amount

        // If item has option, then set option
        const itemUnit = item.inventoryUnit;

        // Set the quantity to ratio of 1
        const quantityWithRatio1 = item.quantity * itemUnit.ratio;

        if (!acc[item.inventoryItemId]) {
          console.log(item, 'item');
          acc[item.inventoryItemId] = {
            quantity: quantityWithRatio1,
            inventoryItem: item.inventoryItem,
            fifo: item.fifo,
            inventoryUnit: itemUnit,
            orderId: item.orderId,
          };
        } else {
          acc[item.inventoryItemId].quantity += quantityWithRatio1;
        }
        return acc;
      }, {});

      // Flag the action as taken
      const newAction = await prisma.action.create({
        data: {
          name: ACTION.TRACK_INVENTORY,
          date: date.date,
          description: 'Track Inventory In Progress',
          createdAt: `${date.time} ${date.date}`,
          companyId: company.id,
        },
      });
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
      await prisma.action.update({
        where: {
          id: newAction.id,
        },
        data: {
          description: actionDescription,
        },
      });
    }

    return res.status(200).json({ message: 'Track Inventory Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error: ' + error.message });
  }
}
