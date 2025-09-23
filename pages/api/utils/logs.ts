import { InventoryLogFrom, InventoryLogType } from '@prisma/client';
import prisma from '@/client';
import { getTodayDate } from './date';

export const recordInventoryItemLog = async (
  lossReportId: number,
  inventoryItemId: number,
  quantity: number,
  type: InventoryLogType,
  createdFrom: InventoryLogFrom,
  log: string,
) => {
  try {
    const existingLossReport = await prisma.lossReport.findUnique({
      where: {
        id: lossReportId,
      },
    });

    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: inventoryItemId,
      },
      include: {
        fifo: true,
      },
    });

    if (!existingInventoryItem) {
      throw new Error('Inventory item not found');
    }

    if (!existingLossReport) {
      throw new Error('Loss report not found');
    }

    const afterQty = existingInventoryItem.fifo.reduce(
      (acc: number, curr: any) => acc + curr.quantity,
      0,
    );

    const prevQty =
      type === InventoryLogType.SUBTRACT || type === InventoryLogType.LOST
        ? afterQty + quantity
        : afterQty - quantity;

    const today = getTodayDate();
    await prisma.inventoryLog.create({
      data: {
        companyId: existingLossReport?.companyId || 1,
        inventoryItemId,
        type,
        quantity,
        prevQty,
        afterQty,
        log,
        createdAt: today.dateAndTime,
        date: today.date,
        createdFrom,
      },
    });
  } catch (error) {
    console.error('Error recording inventory item log: ', error);
  }
};

export const recordOrderInventoryLog = async (
  orderId: number,
  inventoryItemId: number,
  quantity: number,
  type: InventoryLogType,
  createdFrom: InventoryLogFrom,
  log: string,
) => {
  // Action already taken before this record
  try {
    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: inventoryItemId,
      },
      include: {
        fifo: true,
      },
    });

    if (!existingInventoryItem) {
      throw new Error('Inventory item not found');
    }

    const afterQty = existingInventoryItem.fifo.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );

    // If action is subtract or lost, then prevQty is afterQty + quantity
    // If action is restock, then prevQty is afterQty - quantity
    const prevQty =
      type === InventoryLogType.SUBTRACT || type === InventoryLogType.LOST
        ? afterQty + quantity
        : afterQty - quantity;

    const today = getTodayDate();
    await prisma.inventoryLog.create({
      data: {
        companyId: existingOrder?.companyId || 1,
        orderId,
        inventoryItemId,
        type,
        quantity,
        prevQty,
        afterQty,
        log,
        createdAt: today.dateAndTime,
        date: today.date,
        createdFrom,
      },
    });
  } catch (error) {
    console.error('Error recording order inventory log: ', error);
  }
};

export const recordTransactionInventoryLog = async (
  transactionId: number,
  inventoryItemId: number,
  quantity: number,
  type: InventoryLogType,
  createdFrom: InventoryLogFrom,
  log: string,
) => {
  // Action already taken before this record
  try {
    const existingTransaction = await prisma.expense.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: inventoryItemId,
      },
      include: {
        fifo: true,
      },
    });

    if (!existingInventoryItem) {
      throw new Error('Inventory item not found');
    }

    const afterQty = existingInventoryItem.fifo.reduce(
      (acc, curr) => acc + curr.quantity,
      0,
    );

    const prevQty =
      type === InventoryLogType.SUBTRACT
        ? afterQty + quantity
        : afterQty - quantity;

    const today = getTodayDate();
    await prisma.inventoryLog.create({
      data: {
        companyId: existingTransaction?.companyId || 1,
        transactionId,
        inventoryItemId,
        type,
        quantity,
        prevQty,
        afterQty,
        log,
        createdAt: today.dateAndTime,
        date: today.date,
        createdFrom,
      },
    });
  } catch (error: any) {
    console.error('Error recording transaction inventory log: ', error);
  }
};
