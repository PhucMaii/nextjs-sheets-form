import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

const prisma = new PrismaClient();

async function main() {

  const allCategories = await prisma.category.findMany({
    include: {
      items: true,
    }
  });

  const allOrderedItemsHasScheduledOrder = await prisma.orderedItems.findMany({
    where: {
      scheduledOrderId: {
        not: null
      },
      id: {
        gt: 801759
      }
    },
    include: {
      ScheduleOrders: {
        include: {
          user: true
        }
      }
    }
  });

  console.log(allOrderedItemsHasScheduledOrder.length, 'Length of all orderd items has scheduled order');

    // for (const user of allUsers) {
    //   console.log
    //   const targetUserOrderdItems = allOrderedItemsHasScheduledOrder.filter(
    //     (orderedItem) => orderedItem.ScheduleOrders?.user.id === user.id
    //   )
    //   if (!targetUserOrderdItems) {
    //     continue;
    //   }

      for (const orderedItem of allOrderedItemsHasScheduledOrder) {
        console.log(orderedItem, 'ordered item');
        if (orderedItem.ScheduleOrders) {
          const targetCategory = allCategories.find(
            (category: any) => category.id === orderedItem.ScheduleOrders?.user.categoryId
          );

          if (!targetCategory) {
            continue;
          }

          console.log(targetCategory?.name, 'target category');

          const item = targetCategory.items.find(
            (item: any) => item.name === orderedItem.name
          );

          if (!item) {
            continue;
          }

          console.log(item, 'item');
          await prisma.orderedItems.update({
            where: {
              id: orderedItem.id,
            },
            data: {
              price: item.price,
            },
          });
        }
    // }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
