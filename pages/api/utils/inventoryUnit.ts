import prisma from '@/client';
export const deleteInventoryUnit = async (
  deletedIds: number[],
  vendorItemId: number,
) => {
  const vendorItem = await prisma.vendorItem.findUnique({
    where: {
      id: vendorItemId,
    },
  });
  const inventoryUnits = await prisma.inventoryUnit.findMany({
    where: {
      id: {
        notIn: deletedIds,
      },
      vendorItem: {
        inventoryItemId: vendorItem?.inventoryItemId,
      },
    },
  });

  await prisma.orderedItems.updateMany({
    where: {
      inventoryUnitId: {
        in: deletedIds,
      },
    },
    data: {
      inventoryUnitId: inventoryUnits[0]?.id,
    },
  });

  await prisma.item.updateMany({
    where: {
      inventoryUnitId: {
        in: deletedIds,
      },
    },
    data: {
      inventoryUnitId: inventoryUnits[0]?.id,
    },
  });

  await prisma.inventoryUnit.deleteMany({
    where: {
      id: {
        in: deletedIds,
      },
    },
  });
};
