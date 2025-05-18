import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
// const checkIsKorean = (text: string) => {
//   // const koreanRange = /^[\uAC00-\uD7AF]+$/;
//   const koreanRange = /[\uAC00-\uD7AF]/;
//   return koreanRange.test(text);
// };

export const generateCostAndProfit = async (orderedItemId: number) => {
  try {
    const prisma = new PrismaClient();

    const existingItem = await prisma.orderedItems.findUnique({
      where: {
        id: orderedItemId,
      },
      include: {
        fifo: {
          include: {
            vendorItem: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!existingItem) {
      throw new Error(
        'Ordered item id not provided in generate cost and profit',
      );
    }

    let cost = existingItem?.cost;

    if (!cost) {
      cost = existingItem?.fifo?.price
        ? existingItem.fifo.price
        : existingItem.fifo?.vendorItem?.unit?.find(
            (unit: any) => unit.ratio === 1,
          )?.unitPrice || 0;
    }

    return { cost, profit: existingItem.price - cost };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Fail to generate cost and profit: ', error);
  }
};

export const normalizeDate = (date: Date | string) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const getTodayDate = (
  dateStyle: 'short' | 'long' | 'full' | 'medium' | undefined = 'short',
  timeStyle: 'short' | 'long' = 'long',
) => {
  const pstDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle,
    timeStyle,
    // timeStyle,
  }).format(new Date());

  const date = pstDate.split(',')[0];
  const dateSplitted = date.split('/');

  const month = dateSplitted[0].padStart(2, '0');
  const day = dateSplitted[1].padStart(2, '0');
  const year = dateSplitted[2];

  return {
    date: `${month}/${day}/20${year}`,
    time: pstDate.split(',')[1],
    dateAndTime: `${month}/${day}/20${year} ${pstDate.split(',')[1]}`,
  };
};

export const YYYYMMDDFormat = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${month.toString().padStart(2, '0')}/${day
    .toString()
    .padStart(2, '0')}/${year.toString().padStart(2, '0')}`;

  return formattedDate;
};

export const generateListOfDateString = (startDate: Date, endDate: Date) => {
  const startDateString = YYYYMMDDFormat(startDate);
  const dates = [startDateString];
  const currentDate = startDate;
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate.getTime() <= endDate.getTime()) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

async function main() {
  // Update all models with companyId to have companyId = 1
  const BATCH_SIZE = 99999; // Process 1000 records at a time

  // Process orderedItems in batches
  let processed = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await prisma.orderedItems.findMany({
      take: BATCH_SIZE,
      skip: processed,
      where: {
        companyId: null,
      },
    });

    if (batch.length === 0) {
      hasMore = false;
      continue;
    }

    const ids = batch.map((item) => item.id);
    await prisma.orderedItems.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: { companyId: 1 },
    });

    processed += batch.length;
    console.log(`Processed ${processed} records for orderedItems`);
  }

  // Update other models directly
  await prisma.employee.updateMany({
    data: { companyId: 1 },
  });

  await prisma.user.updateMany({
    data: { companyId: 1 },
  });

  await prisma.category.updateMany({
    data: { companyId: 1 },
  });

  

  await prisma.item.updateMany({
    data: { companyId: 1 },
  });

  await prisma.orders.updateMany({
    data: { companyId: 1 },
  });

  await prisma.scheduleOrders.updateMany({
    data: { companyId: 1 },
  });

  await prisma.route.updateMany({
    data: { companyId: 1 },
  });

  await prisma.announcement.updateMany({
    data: { companyId: 1 },
  });

  await prisma.codBoard.updateMany({
    data: { companyId: 1 },
  });

  await prisma.paymentMethod.updateMany({
    data: { companyId: 1 },
  });

  await prisma.fixedTransaction.updateMany({
    data: { companyId: 1 },
  });

  await prisma.expense.updateMany({
    data: { companyId: 1 },
  });

  await prisma.vendor.updateMany({
    data: { companyId: 1 },
  });

  await prisma.inventoryItem.updateMany({
    data: { companyId: 1 },
  });

  await prisma.itemType.updateMany({
    data: { companyId: 1 },
  });

  await prisma.vendorItem.updateMany({
    data: { companyId: 1 },
  });

  await prisma.fifo.updateMany({
    data: { companyId: 1 },
  });

  await prisma.inventoryUnit.updateMany({
    data: { companyId: 1 },
  });

  await prisma.action.updateMany({
    data: { companyId: 1 },
  });

  await prisma.cheque.updateMany({
    data: { companyId: 1 },
  });

  await prisma.clientStatement.updateMany({
    data: { companyId: 1 },
  });

  await prisma.promotion.updateMany({
    data: { companyId: 1 },
  });

  await prisma.shiftSession.updateMany({
    data: { companyId: 1 },
  });

  await prisma.pO.updateMany({
    data: { companyId: 1 },
  });

  await prisma.lossReport.updateMany({
    data: { companyId: 1 },
  });

  await prisma.dayRange.updateMany({
    data: { companyId: 1 },
  });
}

// async function main() {
//   const routes = await prisma.route.findMany({
//     where: {
//       companyId: 1,
//     },
//   });

//   for (const route of routes) {
//     await prisma.route.update({
//       where: {
//         id: route.id,
//       },
//       data: { employeeId: route.driverId },
//     });
//   }

// }


main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });

//{
//   orderId: 34722,
//   customAmount: {
//     name: 'MEDIUM FIRM TOFU',
//     price: 30,
//     quantity: 2,
//     units: [ [Object] ],
//     inventoryUnit: {
//       id: 120,
//       vendorItemId: 96,
//       unit: 'cases',
//       unitPrice: 25,
//       ratio: 1,
//       createdAt: '18:06:10 2025-01-05',
//       createdBy: 'Admin - Bao Bao'
//     },
//     isCustomAmount: true,
//     inventoryItem: {
//       id: 53,
//       name: 'MEDIUM FIRM TOFU',
//       hasPST: null,
//       hasGST: null,
//       createdAt: '09:58:44 2024-11-09',
//       createdBy: 'Admin - Bao Bao',
//       fifo: [Array],
//       vendorItem: [Array],
//       totalValue: 142.2,
//       quantity: 6,
//       stockStatus: 'Low Stock'
//     },
//     inventoryItemId: 53,
//     inventoryUnitId: 120
//   }
// }
