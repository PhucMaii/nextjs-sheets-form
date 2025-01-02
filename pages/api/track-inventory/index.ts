import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getTodayDate } from "../utils/date";
import { ACTION } from "@/app/utils/enum";
import { subtractInventoryItem } from "../admin/orderedItems/single";

// let isJobScheduled = false;

interface ItemMap {
    [key: string]: {
      quantity: number;
      inventoryItem: any; // Replace with the actual type if different
      fifo: any;          // Replace with the actual type if different
      inventoryUnit: any; // Replace with the actual type if different
    };
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // if (!isJobScheduled) {
        //     const schedule = '*/5 * * * *'; // Every minute
        //     const job = () => {
        //         console.log(`Cron Job executed at: ${new Date().toISOString()}`);
        //     };

        //     cron.schedule(schedule, job);
        //     isJobScheduled = true;
        // }

        if (req.method !== 'POST') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }
        const prisma = new PrismaClient();

        const date: {date: string; time: string} = getTodayDate();

        console.log(date, 'DATE');
        // Check in DB if the action is taken already
        const action = await prisma.action.findFirst({
            where: {
                date: date.date
            }
        });

        // If yes, return
        if (action && action.name === ACTION.TRACK_INVENTORY) {
            return res.status(200).json({ message: 'Track Inventory Action Already Taken' });
        }

        // Flag the action as taken
        await prisma.action.create({
            data: {
                name: ACTION.TRACK_INVENTORY,
                date: date.date,
                createdAt: `${date.time} ${date.date}`
            }
        });

        // Get all items that has been ordered today that quantity is greater than 0
        const orderedItems = await prisma.orderedItems.findMany({
            where: {
                quantity: {
                    gt: 0
                },
                orderId: {
                    not: null
                },
                inventoryItemId: {
                    not: null
                },
                Orders: {
                    deliveryDate: date.date
                }
            },
            include: {
                inventoryItem: true,
                inventoryUnit: true,
                fifo: true
            }
        });

        console.log(orderedItems, 'ORDERED ITEMS');

        if (orderedItems.length === 0) {
            return res.status(200).json({ message: 'No Items Ordered Today' });
        }

        // Create a set of same items and quantity
        const itemMap: ItemMap = orderedItems.reduce((acc: any, item: any) => {
            if (!item.inventoryItemId) return acc;
            if (!acc[item.inventoryItemId]) {
                acc[item.inventoryItemId] = {
                    quantity: item.quantity,
                    inventoryItem: item.inventoryItem,
                    fifo: item.fifo,
                    inventoryUnit: item.inventoryUnit
                };
            } else {
                acc[item.inventoryItemId].quantity += item.quantity;
            }

            return acc;
        }, {});

        // Loop through that item set, update inventory item quantity
        for (const inventoryItem of Object.values(itemMap)) {
            await subtractInventoryItem(
                -1, // Force to subtract the inventory quantity
                inventoryItem.fifo,
                inventoryItem.inventoryUnit,
                inventoryItem.quantity
            )
        }

        return res.status(200).json({ message: 'Success CRON JOBS' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
}
