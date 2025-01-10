import { PrismaClient } from '@prisma/client';

describe('Check Ordered Items', () => {
  test('Check Ordered Items', async () => {
    const prisma = new PrismaClient();

    const orderedItemsUnitCheck = await prisma.orderedItems.findMany({
      where: {
        scheduledOrderId: {
          not: null,
        },
        inventoryUnitId: null,
      },
    });

    const orderedItemsInventoryCheck = await prisma.orderedItems.findMany({
      where: {
        scheduledOrderId: {
          not: null,
        },
        inventoryItemId: null,
      },
    });

    expect(orderedItemsUnitCheck.length).toBe(0);
    expect(orderedItemsInventoryCheck.length).toBe(0);
  });

  test('Check Selling Items', async () => {
    const prisma = new PrismaClient();

    const sellingItemsUnitCheck = await prisma.item.findMany({
      where: {
        inventoryItemId: {
          not: null,
        },
        inventoryUnitId: null,
      },
    });

    const sellingItemsInventoryCheck = await prisma.item.findMany({
      where: {
        inventoryItemId: {
          not: null,
        },
        inventoryUnitId: null,
      },
    });

    expect(sellingItemsUnitCheck.length).toBe(0);
    expect(sellingItemsInventoryCheck.length).toBe(0);
  });
});
