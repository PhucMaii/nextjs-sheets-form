import { PrismaClient } from '@prisma/client';
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
  const startDate = new Date('2025-08-01');
  const endDate = new Date('2025-10-10');
  const dates = generateListOfDateString(startDate, endDate);
  const orderedItems: any = await prisma.orderedItems.findMany({
    where: {
      companyId: 1,
      Orders: {
        deliveryDate: {
          in: dates,
        },
      },
    },
    include: {
      Orders: true,
    },
  });


  const checkMap: any = orderedItems.reduce((acc: any, orderedItem: any) => {
    const itemKey = `${orderedItem.inventoryItemId}-${orderedItem.orderId}-${orderedItem.Orders.deliveryDate}-${orderedItem.quantity}-${orderedItem.price}`;
    if (!acc[itemKey]) {
      acc[itemKey] = [];
    }
    acc[itemKey].push(orderedItem.id);
    return acc;
  }, {});

  // Only filter the pair has more than 1 ordered item
  const filteredCheckMap = Object.keys(checkMap).filter((key) => checkMap[key].length > 1);
  console.log(filteredCheckMap);
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
