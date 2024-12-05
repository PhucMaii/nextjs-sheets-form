import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

// const generateCurrentTime = () => {
//   const currentDate = new Date();
//   const dateString = moment(currentDate).format('YYYY-MM-DD');
//   const timeString = moment(currentDate).format('HH:mm:ss');

//   return `${timeString} ${dateString}`;
// };

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

  while (currentDate <= endDate) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates.slice(0, dates.length);
};

const prisma = new PrismaClient();
const checkIsKorean = (text: string) => {
  // const koreanRange = /^[\uAC00-\uD7AF]+$/;
  const koreanRange = /[\uAC00-\uD7AF]/;
  return koreanRange.test(text);
};


async function main() {
  const allScheduledOrderedItemsHasNoInventory = await prisma.orderedItems.findMany({
    where: {
      scheduledOrderId: {
        not: null
      },
      inventoryItemId: 107
    }
  });

  const inventoryItems = await prisma.inventoryItem.findMany({
    include: {
      vendorItem: {
        include: {
          unit: true
        }
      }
    }
  });


  const newItems = allScheduledOrderedItemsHasNoInventory.map((item: any) => {
    let itemKey = item.name;
    let inventoryUnitIndex = 0;

    if (checkIsKorean(itemKey.split(' - ')[0])) {
      itemKey = itemKey.split(' - ')[1];
    } else {
      itemKey = itemKey.includes('KONGNAMUL')
        ? itemKey.split(' - ')[1]
        : itemKey;
    }

    if (itemKey === 'BEAN 24X1 LB') {
      itemKey = 'BEAN 1 LB';
      inventoryUnitIndex = 1;
    }

    if (itemKey === 'OYSTER MUSHROOM #1') {
      itemKey = 'NO. 1 OYSTER MUSHROOM 5 LB'
    }

    if (itemKey === 'OYSTER MUSHROOM #2') {
      itemKey = 'NO. 2 OYSTER MUSHROOM 5 LB'
    }

    if (itemKey === 'TARO 40 LB') {
      itemKey = 'TARO'
    }

    if (itemKey === 'BASIL BOX') {
      itemKey = 'BASIL';
      inventoryUnitIndex = 1;
    }

    if (itemKey === 'SOYA 24X1 LB') {
      itemKey = 'SOYA 1 LB';
      inventoryUnitIndex = 1;
    }

    if (itemKey === 'KOREAN SOYA 1X24') {
      itemKey = 'K. SOYA 1 LB';
      inventoryUnitIndex = 1;
    }

    if (itemKey === 'BEAN 5X1 LB') {
      itemKey = 'BEAN 1 LB';
      inventoryUnitIndex = 2;
    }

    const sameNameInventory = inventoryItems.find((i: any) => {
      return i.name == itemKey;
    });

    if (!sameNameInventory) {
      console.error('Inventory item not found: ' + itemKey);
      return item;
    }

    console.log('Inventory item found: ' + item.name);

    return {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      scheduledOrderId: item.scheduledOrderId,
      inventoryItemId: sameNameInventory.id,
      inventoryUnitId: sameNameInventory.vendorItem[0].unit[inventoryUnitIndex].id,
    }
  });

  await prisma.orderedItems.deleteMany({
    where: {
      scheduledOrderId: {
        not: null
      },
      inventoryItemId: 107
    }
  });


  await prisma.orderedItems.createMany({
    data: newItems
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
