import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInventoryItemQty = async (inventoryItemId: number) => {
  try {
    const fifo = await prisma.fifo.findMany({
      where: {
        inventoryItemId,
      },
    });

    const qty = fifo.reduce((total: number, item: any) => {
      return total + item.quantity;
    }, 0);

    return qty;
  } catch (error: any) {
    throw new Error('Fail to get qty by inventory item id');
  }
};

export const manipulateInventoryItemQty = async (
  inventoryItemId: number,
  quantity: number,
  ratio: number = 1,
  operation: 'subtract' | 'restock',
) => {
  // PURPOSE: Subtract the quantity lost from the inventory item
  // Get furthest in time fifos of the invenotryItem
  const fifos = await prisma.fifo.findMany({
    where: {
      inventoryItemId,
    },
  });

  // Sort the fifos by date
  const furthestFifo = fifos.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )[0];

  // Subtract the quantity lost from the fifos
  const normalizedQuantityLost = quantity * ratio;
  const updatedQuantity =
    operation === 'subtract'
      ? furthestFifo.quantity - normalizedQuantityLost
      : furthestFifo.quantity + normalizedQuantityLost;

  // Update the fifo quantity
  await prisma.fifo.update({
    where: {
      id: furthestFifo.id,
    },
    data: {
      quantity: updatedQuantity,
    },
  });

  return updatedQuantity;
};

export const manuallyRestockInventoryItemQty = async (
  inventoryItemId: number,
  quantity: number,
  ratio: number = 1,
) => {
  return manipulateInventoryItemQty(inventoryItemId, quantity, ratio, 'restock');
};

export const manuallySubtractInventoryItemQty = async (
  inventoryItemId: number,
  quantity: number,
  ratio: number = 1,
) => {
  return manipulateInventoryItemQty(inventoryItemId, quantity, ratio, 'subtract');
};
