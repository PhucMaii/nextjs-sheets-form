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

  return { date: `${month}/${day}/20${year}`, time: pstDate.split(',')[1] };
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

export const sortedItemKeys = (
  listToSort: string[],
  basedSortArray: string[],
) => {
  return listToSort.sort((a, b) => {
    // Get the index of the current elements in the basedSortArray
    const indexA = basedSortArray.indexOf(a);
    const indexB = basedSortArray.indexOf(b);

    // If both elements are in the basedSortArray, compare their indices
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one element is in the basedSortArray, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither element is in the basedSortArray, sort them alphabetically
    return a.localeCompare(b);
  });
};

export const inventoryOrder = [
  'BEAN 10 LB',
  'BEAN 5 LB',
  'BASIL',
  'BEAN 1 LB',
  'SOYA 10 LB',
  'SOYA 5 LB',
  'SOYA 1 LB',
  'LIME NO. 1',
  'LIME NO. 2',
  'TRADITIONAL TOFU',
  'OG CHINESE PUFF',
  'FRIED TOFU',
  'FIRM TOFU',
  'MEDIUM FIRM TOFU',
  'JUMBO EGG',
  'LARGE EGG',
  'XL EGG',
  'LIQUID EGG 33 LB',
  'EGGPLANTS 30 LB',
  'DAILON 40 LB',
  'BROCCOLI 20 LB',
  'WHITE ONION 50 LB',
  'USA GREEN CABBAGE',
  'LEUCOCASIA / BAC HA 20 LB',
  'LEUCOCASIA / BAC HA 30 LB',
  'TARO',
  'KING OYSTER',
  'SHIITAKE',
  'FRESH RICE NOODLE 1 LB',
  'BANH PHO SINCERE 30 LB',
  'WONTON NOODLE 1 LB',
  'CHOW MEIN 10 LB',
  'ORGANIC GINGER 30 LB',
  'NO. 2 BELL PEPPER 25 LB',
  'PEELED GARLIC 5 LB',
  'JUMBO CARROT',
  'NO. 1 GINGER 30 LB',
  'No. 1 MUSHROOM WHITE 10 LB',
  'No. 2 MUSHROOM WHITE 10 LB',
  'NO. 1 OYSTER MUSHROOM 5 LB',
  'NO. 2 OYSTER MUSHROOM 5 LB',
];

async function main() {
  const inventoryItems = await prisma.inventoryItem.findMany({
    
  });

  for (const item of inventoryItems) {
    console.log(item, 'item');
    await prisma.inventoryItem.update({
      where: {
        id: item.id,
      },
      data: {
        id: item.id + 10000,
      }
    })
  }
}

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
