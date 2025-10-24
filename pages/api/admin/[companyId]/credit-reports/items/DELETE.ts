import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { restockInventoryItem } from '../../orderedItems/single';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';
import { checkOrderValidToAffectInventory } from '@/pages/api/utils/order';
import { InventoryLogFrom, InventoryLogType } from '@prisma/client';
import { recordAction } from '@/pages/api/utils/timeline';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { generateOrderTotalPrice } from '../../orderedItems/PUT';

interface IQuery {
  companyId?: string;
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { companyId, id }: IQuery = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const existingItem = await prisma.creditItem.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        inventoryItem: true,
        creditReport: {
          include: {
            order: true,
          },
        },
        orderedItem: {
          include: {
            fifo: true,
            inventoryUnit: true,
          },
        },
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Credit Item Not Found' });
    }

    const isValidToAffectInventory = await checkOrderValidToAffectInventory(
      Number(companyId),
      existingItem.creditReport.order.deliveryDate,
    );

    if (
      existingItem.orderedItem?.fifo &&
      existingItem.orderedItem?.inventoryUnit &&
      isValidToAffectInventory
    ) {
      // Delete the item from the inventory
      await restockInventoryItem(
        Number(existingItem.orderedItem.orderId),
        existingItem.orderedItem.fifo,
        existingItem.orderedItem.inventoryUnit,
        existingItem.quantity,
      );

      // Record inventory log
      await recordOrderInventoryLog(
        Number(existingItem.orderedItem.orderId),
        existingItem.orderedItem.fifo.inventoryItemId,
        existingItem.quantity,
        InventoryLogType.RESTOCK,
        InventoryLogFrom.EDIT_ORDER,
        `Restock ${existingItem.quantity} ${existingItem.inventoryItem.name} to inventory due to credit report item deletion`,
      );
    }

    // This will delete the credit item due to onDelete Cascade
    await prisma.orderedItems.delete({
      where: {
        id: existingItem.orderedItem.id,
      },
    });

    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    await recordAction(
      Number(existingItem.orderedItem.orderId),
      createdBy,
      'Credit Item Deleted',
      `Credit Item ${existingItem.inventoryItem.name} deleted from credit report ${existingItem.creditReport.id}`,
    );

    const orderedItems = await prisma.orderedItems.findMany({
      where: {
        orderId: existingItem.orderedItem.orderId,
      },
    });

    const totalPrice = generateOrderTotalPrice(orderedItems);

    await prisma.orders.update({
      where: {
        id: Number(existingItem.orderedItem.orderId),
      },
      data: {
        totalPrice: totalPrice.totalPrice,
        subTotal: totalPrice.subTotal,
        PST: totalPrice.PST,
        GST: totalPrice.GST,
        discount: totalPrice.discount,
      },
    });

    return res
      .status(200)
      .json({ message: 'Credit Item Deleted Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
