import { mainPaymentMethodId } from '@/app/lib/constant';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import {
  checkAndUpdateUnits,
  createFifo,
  createOrderedItems,
  updateVendorItemQuantity,
} from '@/pages/api/admin/inventory/expenses/POST';
import { getTodayDate } from '@/pages/api/utils/date';
import { getInventoryItemQty } from '@/pages/api/utils/inventoryItem';
import { PrismaClient } from '@prisma/client';

describe('Create Transaction', () => {
  const { date, time } = getTodayDate();
  // const orderDate = '01/01/3000';

  const amount = 1500;
  const paymentMethodId = mainPaymentMethodId;

  const createdAt = `${date} ${time}`;
  const description = 'Test Transaction';

  const subTotal = 1500;
  const GST = 0;
  const PST = 0;
  const items: any = [
    {
      id: 3,
      vendorId: 4,
      quantity: 100,
      unitPrice: 0,
      unit: {
        id: 3,
        vendorItemId: 3,
        unit: 'bags',
        unitPrice: 3.75,
        ratio: 1,
        createdAt: '09:18:46 2024-12-03',
        createdBy: 'Admin - Admin Test',
      },
      units: [
        {
          createdAt: '09:18:46 2024-12-03',
          createdBy: 'Admin - Admin Test',
          id: 3,
          ratio: 1,
          unit: 'bags',
          unitPrice: 3.75,
          vendorItemId: 3,
        },
      ],
      name: 'BEAN 5 LB',
      inventoryItemId: 19,
      inventoryItem: {
        id: 19,
        name: 'BEAN 5 LB',
        hasPST: false,
        hasGST: false,
        createdAt: '08:10:18 2024-11-07',
        createdBy: 'Admin - Bao Bao',
      },
    },
    {
      id: 2,
      quantity: 150,
      name: 'BEAN 10 LB',
      vendorId: 4,
      unit: {
        id: 2,
        vendorItemId: 2,
        unit: 'bags',
        unitPrice: 7.5,
        ratio: 1,
        createdAt: '09:18:46 2024-12-03',
        createdBy: 'Admin - Admin Test',
      },
      units: [
        {
          createdAt: '09:18:46 2024-12-03',
          createdBy: 'Admin - Admin Test',
          id: 2,
          ratio: 1,
          unit: 'bags',
          unitPrice: 7.5,
          vendorItemId: 2,
        },
      ],
      inventoryItemId: 18,
      inventoryItem: {
        id: 18,
        name: 'BEAN 10 LB',
        hasPST: false,
        hasGST: false,
        createdAt: '08:10:18 2024-11-07',
        createdBy: 'Admin - Bao Bao',
      },
      totalPrice: null,
    },
  ];
  const prisma = new PrismaClient();

  const createdBy = 'Admin - Admin Test';
  test('Create normal transaction with link inventory', async () => {
    // Create expense
    const newExpense = await prisma.expense.create({
      data: {
        invoice: 'Test Invoice',
        date: date,
        amount: amount,
        subTotal: subTotal,
        PST: PST,
        GST: GST,
        description: description,
        paymentMethodId: paymentMethodId,
        spentBy: createdBy,
        createdAt: createdAt,
        codBoardId: null,
        status: TRANSACTION_STATUS.PAID,
        createdBy,
      },
    });

    // Connect vendors and expenses
    await prisma.vendorExpense.createMany({
      data: {
        expenseId: newExpense.id,
        vendorId: 4,
      },
    });

    // const inventoryItems = await prisma.inventoryItem.findMany({});

    // Save item qty before
    const itemQty: any = {};

    for (const item of items) {
      const itemQtyBeforeUpdate = await getInventoryItemQty(
        item.inventoryItemId,
      );
      itemQty[item.id] = itemQtyBeforeUpdate;
    }

    // Create batch for newly imported items
    await createFifo(items, createdAt, createdBy);

    // Check if quantity has been updated correctly
    for (const item of items) {
      const itemQtyAfterUpdate = await getInventoryItemQty(
        item.inventoryItemId,
      );
      expect(itemQtyAfterUpdate).toBe(itemQty[item.id] + item.quantity);
    }

    const vendorItems = await prisma.vendorItem.findMany({
      where: {
        id: {
          in: items.map((item: any) => item.id),
        },
      },
      include: {
        unit: true,
      },
    });

    for (const item of items) {
      // STEP 2: Update quantity in vendor items
      const existedItem: any = vendorItems.find(
        (vendorItem) => vendorItem.id === item.id,
      );

      await updateVendorItemQuantity(existedItem, item);

      // STEP 3: Check unit price in Inventory Unit (Update if needed)
      await checkAndUpdateUnits(
        existedItem.unit,
        item.units,
        item.id,
        createdAt,
        createdBy,
      );
    }
    // STEP 4: Create OrderedItems
    // Use item already exist to easy to retrieve unitPrice
    const response = await createOrderedItems(
      items,
      newExpense,
      createdAt,
      createdBy,
    );

    expect(response.ok).toBeTruthy();

    // Delete transaction
    await prisma.expense.delete({
      where: {
        id: newExpense.id,
      },
    });
  });

  test('Create transaction link inventory with brand new item', async () => {
    // Create expense
    // const newExpense = await prisma.expense.create({
    //   data: {
    //     invoice: 'Test Invoice',
    //     date: date,
    //     amount: amount,
    //     subTotal: subTotal,
    //     PST: PST,
    //     GST: GST,
    //     description: description,
    //     paymentMethodId: paymentMethodId,
    //     spentBy: createdBy,
    //     createdAt: createdAt,
    //     codBoardId: null,
    //     status: TRANSACTION_STATUS.PAID,
    //     createdBy,
    //   },
    // });

    // const items: any = [
    //   {
    //     id: 0,
    //     vendorId: 4,
    //     quantity: 10,
    //     unitPrice: 0,
    //     unit: { unit: 'bags', ratio: 1, unitPrice: 10 },
    //     units: [],
    //     name: 'New Test Item',
    //   },
    //   {
    //     id: 0,
    //     quantity: 10,
    //     name: 'Second test new item',
    //     vendorId: 4,
    //     unit: { unit: 'bags', ratio: 1, unitPrice: 5 },
    //     units: [],
    //     unitPrice: 0,
    //   },
    // ];
  });
});
