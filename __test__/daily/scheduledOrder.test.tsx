import { ScheduledOrder } from '@/app/utils/type';
import { PrismaClient, Route, UserRoute } from '@prisma/client';

describe('Pre order check', () => {
  test('Check scheduled order items are same as category items', async () => {
    const scheduleOrderItems = await getScheduleOrderItems();
    const categoryItems = await getCategoryItems();

    const checkMap: any = {
      categoryItemNotFound: [],
      incorrectIsShowDiscount: [],
      incorrectPrevPrice: [],
    };
    for (const scheduleOrderItem of scheduleOrderItems) {
      const categoryItem = categoryItems.find((categoryItem: any) => {
        return (
          categoryItem.inventoryItemId === scheduleOrderItem.inventoryItemId &&
          categoryItem.categoryId ===
            scheduleOrderItem?.ScheduleOrders?.user.categoryId
        );
      });
      if (!categoryItem) {
        console.error(
          {
            scheduleOrderId: scheduleOrderItem.id,
            name: scheduleOrderItem.name,
            itemCategoryId: scheduleOrderItem?.ScheduleOrders?.user.categoryId,
            inventoryItemId: scheduleOrderItem.inventoryItemId,
            clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
          },
          'CATEGORY ITEM NOT FOUND',
        );

        checkMap.categoryItemNotFound.push({
          scheduleOrderId: scheduleOrderItem.id,
          name: scheduleOrderItem.name,
          itemCategoryId: scheduleOrderItem?.ScheduleOrders?.user.categoryId,
          inventoryItemId: scheduleOrderItem.inventoryItemId,
          clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
        });
        continue;
      }
      if (scheduleOrderItem.isShowDiscount !== categoryItem.isShowDiscount) {
        if (
          scheduleOrderItem.isShowDiscount === false &&
          categoryItem.isShowDiscount === null
        ) {
          continue;
        }

        if (
          categoryItem.isShowDiscount === false &&
          scheduleOrderItem.isShowDiscount === null
        ) {
          continue;
        }
        console.error(
          {
            clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
            name: scheduleOrderItem.name,
            scheduleOrderId: scheduleOrderItem.id,
            day: scheduleOrderItem?.ScheduleOrders?.day,
            isShowDiscount: scheduleOrderItem.isShowDiscount,
            categoryIsShowDiscount: categoryItem.isShowDiscount,
          },
          'isShowDiscount',
        );

        checkMap.incorrectIsShowDiscount.push({
          clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
          name: scheduleOrderItem.name,
          scheduleOrderId: scheduleOrderItem.id,
          day: scheduleOrderItem?.ScheduleOrders?.day,
          isShowDiscount: scheduleOrderItem.isShowDiscount,
          categoryIsShowDiscount: categoryItem.isShowDiscount,
        });
        continue;
      }
      if (scheduleOrderItem.prevPrice !== categoryItem.prevPrice) {
        console.log(
          {
            clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
            name: scheduleOrderItem.name,
            scheduleOrderId: scheduleOrderItem.id,
            day: scheduleOrderItem?.ScheduleOrders?.day,
            prevPrice: scheduleOrderItem.prevPrice,
            categoryPrevPrice: categoryItem.prevPrice,
          },
          'prevPrice',
        );

        checkMap.incorrectPrevPrice.push({
          clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
          name: scheduleOrderItem.name,
          scheduleOrderId: scheduleOrderItem.id,
          day: scheduleOrderItem?.ScheduleOrders?.day,
          prevPrice: scheduleOrderItem.prevPrice,
          categoryPrevPrice: categoryItem.prevPrice,
        });
        continue;
      }
    }

    expect(checkMap.categoryItemNotFound.length).toBe(0);
    expect(checkMap.incorrectIsShowDiscount.length).toBe(0);
    expect(checkMap.incorrectPrevPrice.length).toBe(0);
  }, 30000);

  test('Check scheduled order total price is correct', async () => {
    const prisma = new PrismaClient();

    const scheduleOrders = await prisma.scheduleOrders.findMany({
      include: {
        user: true,
        items: true,
      },
    });

    const incorrectOrders = [];
    for (const scheduleOrder of scheduleOrders) {
      const totalPrice = scheduleOrder.items.reduce(
        (acc: number, item: any) => {
          return acc + item.price * item.quantity;
        },
        0,
      );

      if (totalPrice?.toFixed(2) !== scheduleOrder.totalPrice?.toFixed(2)) {
        incorrectOrders.push({
          clientName: scheduleOrder.user.clientName,
          clientId: scheduleOrder.user.id,
          scheduleOrderId: scheduleOrder.id,
          day: scheduleOrder.day,
          totalPrice: scheduleOrder.totalPrice,
          actualTotalPrice: totalPrice,
        });
      }
    }
    console.log(incorrectOrders);
    expect(incorrectOrders.length).toBe(0);
  }, 10000);

  // Check if multiple of same items in one scheduled order
  test('Check if multiple of same items in one scheduled order', async () => {
    const prisma = new PrismaClient();

    const scheduledOrders = await prisma.scheduleOrders.findMany({
      include: {
        items: true,
        user: true,
      },
    });

    const incorrectOrders: any = [];
    for (const order of scheduledOrders) {
      const items = [...order.items];

      for (const item of items) {
        const sameItem = order.items.filter((orderedItem: any) => {
          return (
            item.inventoryItemId === orderedItem.inventoryItemId &&
            item.name === orderedItem.name
          );
        });

        if (sameItem.length > 2) {
          incorrectOrders.push({
            clientName: order.user.clientName,
            orderId: order.id,
            day: order.day,
            name: item.name,
            inventoryItemId: item.inventoryItemId,
          });
        }
      }
    }

    console.log(incorrectOrders);
    expect(incorrectOrders.length).toBe(0);
  }, 10000);
});

describe('Scheduled Orders With Position Index', () => {
  test('Check if scheduled orders has correct position index', async () => {
    const prisma = new PrismaClient();

    const routes = await prisma.route.findMany({
      include: {
        clients: {
          include: {
            user: {
              include: {
                scheduleOrders: {
                  include: {
                    positionIndex: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const incorrectRoute: Route[] = [];

    for (const route of routes) {
      // Get all scheduled orders of current route
      const scheduledOrders = route.clients
        .map((client: UserRoute | any) => {
          if (client.user.scheduleOrders.length === 0) {
            return null;
          }
          const routePreOrder = client.user.scheduleOrders.find(
            (scheduledOrder: ScheduledOrder) => {
              return scheduledOrder.day === route.day;
            },
          );

          return routePreOrder;
        })
        .sort(
          (orderA: ScheduledOrder, orderB: ScheduledOrder) =>
            orderA.positionIndex.index - orderB.positionIndex.index,
        );

      // Check if position index consistently increment by 1
      for (let i = 1; i < scheduledOrders.length; i++) {
        if (
          scheduledOrders[i].positionIndex.index !==
          scheduledOrders[i - 1].positionIndex.index + 1
        ) {
          incorrectRoute.push(route);
        }
      }
    }

    if (incorrectRoute.length > 0) {
      console.log(incorrectRoute, 'incorrect route');
    }
    expect(incorrectRoute.length).toBe(0);
  }, 10000);
});

const getScheduleOrderItems = async () => {
  const prisma = new PrismaClient();
  return await prisma.orderedItems.findMany({
    where: {
      scheduledOrderId: {
        not: null,
      },
    },
    include: {
      ScheduleOrders: {
        include: {
          user: true,
        },
      },
    },
  });
};

const getCategoryItems = async () => {
  const prisma = new PrismaClient();
  return await prisma.item.findMany({});
};
