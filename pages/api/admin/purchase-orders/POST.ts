import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import { getUserInfo } from '../../utils/auth';

const prisma = new PrismaClient();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { purchaseOrder, selectedVendor }: any = req.body;

    if (purchaseOrder.items.length === 0) {
      return res.status(400).json({ error: 'No items in the purchase order' });
    }


    // Calculate subtotal, tax, totalCost
    const subtotal = purchaseOrder.items.reduce((acc: number, item: any) => {
      return acc + item.costPerItem * item.orderedQty;
    }, 0);

    const tax = purchaseOrder.items.reduce((acc: number, item: any) => {
      return acc + item.tax * item.orderedQty;
    }, 0);

    const totalCost = subtotal + tax - (purchaseOrder?.discount || 0);

    const today = getTodayDate();
    const admin: any = await getUserInfo(req, res);

    // Set up the purchase order
    const newPurchaseOrder = await prisma.pO.create({
      data: {
        estArrival: purchaseOrder.estArrival,
        status: purchaseOrder.status,
        // vendorId: se lectedVendor.id,
        totalCost,
        note: purchaseOrder.note,
        discount: purchaseOrder.discount,
        createdAt: today.dateAndTime,
        createdBy: `Admin - ${admin.clientName}`,
        subtotal,
        tax,
        vendor: {
          connect: {
            id: selectedVendor.id,
          },
        },
      },
    });

    // update poNumber as PO - id
    await prisma.pO.update({
      where: {
        id: newPurchaseOrder.id,
      },
      data: {
        poNumber: `PO${newPurchaseOrder.id}`,
      },
    });
    // Set up the purchase order items
    const poItems = purchaseOrder.items.map((item: any) => {
      // Handle empty unit
      if (!item.unit) {
        return res
          .status(400)
          .json({ error: `Unit in ${item.inventoryItem.name} is required ` });
      }
      
      return {
        poId: newPurchaseOrder.id,
        inventoryItemId: item.inventoryItemId,
        orderedQty: item.orderedQty,
        costPerItem: item.costPerItem,
        inventoryUnitId: item.inventoryUnit.id,
      };
    });

    await prisma.pOItem.createMany({
      data: poItems,
    });

    // Handle if status is Ordered -> Sent email to vendor

    return res.status(200).json({ message: 'Purchase order created successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
