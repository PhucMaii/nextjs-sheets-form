import { ICreditItem } from '@/app/utils/type';
import { CreditType } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ITEM_CATEGORIZED } from '../orderedItems/PUT';
import { formatCreditItems, formatCreditItemsToOrderedItems } from './POST';
import { createOrderedItems } from '@/pages/api/utils/orderedItems';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { checkOrderValidToAffectInventory } from '@/pages/api/utils/order';
import {
  restockInventoryItem,
  updateSingleInventoryItem,
} from '../orderedItems/single';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';
import { InventoryLogFrom, InventoryLogType } from '@prisma/client';
import { generateOrderTotalPrice } from '@/app/utils/orders';

interface IQuery {
  companyId?: string;
}

interface IBody {
  id: number;
  creditType: CreditType;
  reportedDate: string;
  reason: string;
  creditItems: ICreditItem[];
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { id, creditType, reportedDate, reason, creditItems } =
      req.body as IBody;

    if (!id || !creditType || !reportedDate || !creditItems) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingCreditReport = await prisma.creditReport.findUnique({
      where: {
        id: id,
      },
      include: {
        creditItems: {
          include: {
            inventoryItem: true,
            orderedItem: {
              include: {
                fifo: true,
                inventoryUnit: true,
                inventoryItem: true,
              },
            },
          },
        },
        user: true,
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!existingCreditReport) {
      return res.status(404).json({ error: 'Credit report not found' });
    }

    console.log({creditType, existingCreditReportType: existingCreditReport.type})

    // Update credit report
    if (
      existingCreditReport.type !== creditType ||
      existingCreditReport.reportedDate !== reportedDate ||
      existingCreditReport.reason !== reason
    ) {
      await prisma.creditReport.update({
        where: { id: id },
        data: {
          type: creditType,
          reportedDate: reportedDate,
          reason: reason,
        },
      });
    }

    // Categorize credit items
    const categorizedItems = creditItems.map((creditItem) => {
      const existingItem = existingCreditReport.creditItems.find(
        (item) => item.id === creditItem.id,
      );

      if (!existingItem) {
        return {
          ...creditItem,
          updateFlag: ITEM_CATEGORIZED.CREATE,
        };
      }

      if (
        existingItem.orderedItem.price !== creditItem.price ||
        existingItem.orderedItem.quantity !== creditItem.quantity
      ) {
        return {
          ...creditItem,
          existingItem: existingItem,
          updateFlag: ITEM_CATEGORIZED.UPDATE,
        };
      }

      return {
        ...creditItem,
        updateFlag: ITEM_CATEGORIZED.REMAIN,
      };
    });

    // Create new credit items
    const newCreditItems = categorizedItems.filter(
      (item) => item.updateFlag === ITEM_CATEGORIZED.CREATE,
    );

    console.log(newCreditItems, 'newCreditItems');

    // CREATE NEW CREDIT ITEMS
    if (newCreditItems.length > 0) {
      const categoryItems = await prisma.item.findMany({
        where: {
          id: {
            in: newCreditItems.map((item) => item.categoryItem.id),
          },
        },
        include: {
          inventoryItem: true,
          inventoryUnit: true,
        },
      });

      const formattedOrderedItems = formatCreditItemsToOrderedItems(
        Number(companyId),
        newCreditItems,
        categoryItems,
      );

      console.log(formattedOrderedItems, 'formattedOrderedItems');

      const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

      await createOrderedItems(
        Number(companyId),
        existingCreditReport.order,
        formattedOrderedItems,
        createdBy,
      );

      const orderedItems = await prisma.orderedItems.findMany({
        where: {
          orderId: existingCreditReport.orderId,
        },
        include: {
          inventoryItem: true,
        },
      });

      if (!orderedItems) {
        return res.status(400).json({ error: 'Ordered items not found' });
      }

      for (const orderedItem of orderedItems) {
        // Record inventory log
        await recordOrderInventoryLog(
          existingCreditReport.orderId,
          orderedItem.inventoryItemId || 0,
          orderedItem.quantity,
          InventoryLogType.SUBTRACT,
          InventoryLogFrom.EDIT_ORDER,
          `Subtract ${orderedItem.quantity} ${orderedItem.inventoryItem?.name || ''} from inventory due to items created in credit report ${id}`,
        );
      }

      const formattedNewCreditItems = formatCreditItems(
        Number(companyId),
        newCreditItems,
        orderedItems,
        id,
      );

      await prisma.creditItem.createMany({
        data: formattedNewCreditItems,
      });
    }

    // UPDATE EXISTING CREDIT ITEMS
    const updatedCreditItems: any = categorizedItems.filter(
      (item) => item.updateFlag === ITEM_CATEGORIZED.UPDATE,
    );
    if (updatedCreditItems.length > 0) {
      // Only change in price and/or quantity
      // If only price is changed, update the price in ordered items
      // If quantity is changed, update the quantity in ordered items and also care about the fifo
      for (const item of updatedCreditItems) {
        if (item.existingItem.orderedItem.price !== item.price) {
          await prisma.orderedItems.update({
            where: { id: item.orderedItemId },
            data: {
              price: item.price,
            },
          });
        }

        if (item.existingItem.quantity !== item.quantity) {
          await prisma.creditItem.update({
            where: { id: item.id },
            data: {
              quantity: item.quantity,
            },
          });

          await prisma.orderedItems.update({
            where: { id: item.orderedItemId },
            data: {
              quantity: item.quantity,
            },
          });

          const isValidToAffectInventory =
            await checkOrderValidToAffectInventory(
              Number(companyId),
              existingCreditReport.order.deliveryDate,
            );

          if (isValidToAffectInventory) {
            const difference = item.quantity - item.existingItem.quantity;
            const isRestock = difference < 0;

            await updateSingleInventoryItem(
              existingCreditReport.orderId,
              item.existingItem.orderedItem.fifo,
              item.existingItem.orderedItem.inventoryUnit,
              item.quantity,
              item.existingItem.quantity,
            );

            // Record inventory log
            await recordOrderInventoryLog(
              existingCreditReport.orderId,
              item.existingItem.inventoryItemId,
              Math.abs(difference),
              isRestock ? InventoryLogType.RESTOCK : InventoryLogType.SUBTRACT,
              InventoryLogFrom.EDIT_ORDER,
              `${isRestock ? 'Restock' : 'Subtract'} ${Math.abs(difference)} ${item.existingItem.inventoryItem.name} to inventory due to credit report ${existingCreditReport.id} updated ${item.existingItem.name}`,
            );
          }
        }
      }
    }

    // DELETE EXISTING CREDIT ITEMS - NOT IN THE NEW CREDIT ITEMS
    const deletedCreditItems = existingCreditReport.creditItems.filter(
      (item) =>
        !categorizedItems.some(
          (categorizedItem) => categorizedItem.id === item.id,
        ),
    );

    if (deletedCreditItems.length > 0) {
      // Delete the ordered items will automatically delete the credit items due to onDelete Cascade
      await prisma.orderedItems.deleteMany({
        where: {
          id: { in: deletedCreditItems.map((item) => item.orderedItemId) },
        },
      });

      // Restock the inventory
      for (const item of deletedCreditItems) {
        if (item?.orderedItem?.fifo && item?.orderedItem?.inventoryUnit) {
          await restockInventoryItem(
            existingCreditReport.orderId,
            item?.orderedItem?.fifo || 0,
            item.orderedItem.inventoryUnit,
            item.quantity,
          );
        }

        await recordOrderInventoryLog(
          existingCreditReport.orderId,
          item?.inventoryItemId || 0,
          item.quantity,
          InventoryLogType.RESTOCK,
          InventoryLogFrom.EDIT_ORDER,
          `Restock ${item.quantity} ${item.inventoryItem.name} to inventory due to items deleted in credit report ${existingCreditReport.id}`,
        );
      }
    }

    // Update order total price
    const orderedItems: any = await prisma.orderedItems.findMany({
      where: {
        orderId: existingCreditReport.orderId,
      },
      include: {
        inventoryItem: true,
      },
    });

    if (!orderedItems) {
      return res.status(400).json({ error: 'Ordered items not found' });
    }

    const orderTotalPrice = generateOrderTotalPrice(orderedItems);
    await prisma.orders.update({
      where: { id: existingCreditReport.orderId },
      data: {
        totalPrice: orderTotalPrice.totalPrice,
        subTotal: orderTotalPrice.subTotal,
        PST: orderTotalPrice.PST,
        GST: orderTotalPrice.GST,
        discount: orderTotalPrice.discount,
      },
    });

    return res
      .status(200)
      .json({ message: 'Credit report updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res
      .status(500)
      .json({ error: 'Internal Server Error: ' + error.message });
  }
}
