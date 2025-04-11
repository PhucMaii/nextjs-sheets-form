import { Orders, PrismaClient } from '@prisma/client';
import { getTodayDate, normalizeDate } from './date';
import { ACTION, ORDER_STATUS } from '@/app/utils/enum';
import { generateListOfDateString, generateMonthRange } from '@/app/utils/time';

export const formatItemsWithTotalPrice = (items: any[]) => {
  return items.map((item: any) => {
    let totalPrevPrice = 0;
    if (item?.isShowDiscount && item?.prevPrice) {
      totalPrevPrice = item.prevPrice * item.quantity;
    }
    return {
      ...item,
      totalPrice: item.price * item.quantity,
      totalPrevPrice,
    };
  });
};

export const checkOrderValidToAffectInventory = async (
  deliveryDate: string,
) => {
  try {
    const prisma = new PrismaClient();
    const { date, time: currentTime } = getTodayDate();

    const normalizedToday = normalizeDate(new Date(date));
    const normalizedOrderDate = normalizeDate(new Date(deliveryDate));

    if (normalizedOrderDate.getTime() > normalizedToday.getTime()) {
      return false;
    }

    // If same date
    if (normalizedOrderDate.getTime() === normalizedToday.getTime()) {
      if (currentTime.includes('AM')) {
        // const hour = currentTime.split(':')[0];

        // if (Number(hour) < trackInventoryHour || Number(hour) === 12) {
        //   return false;
        // }

        // CHECK IF TRACK INVENTORY ACTION IS TAKEN
        const selectedDayAction = await prisma.action.findFirst({
          where: {
            name: ACTION.TRACK_INVENTORY,
            date: deliveryDate,
          },
        });

        return !!selectedDayAction;
      }
    }

    return true;
  } catch (error: any) {
    console.log('Fail to check order valid to affect inventory: ', error);
    return false;
  }
};

export const getOverdueOrders = async (userId: number) => {
  try {
    const monthRange = generateMonthRange();
    const currentMonthListOfDateString = generateListOfDateString(
      monthRange[0],
      monthRange[1],
    );

    const prisma = new PrismaClient();

    const incompletedOrders: any = await prisma.orders.findMany({
      where: {
        userId,
        status: {
          in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
        },
        deliveryDate: {
          notIn: currentMonthListOfDateString,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
        user: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const dueAmount = incompletedOrders.reduce((acc: number, order: Orders) => {
      return acc + order.totalPrice;
    }, 0);

    return {
      orders: incompletedOrders,
      overDue: dueAmount,
    };
  } catch (error: any) {
    throw new Error('Fail to get overdue orders');
  }
};

export const minOrderGuard = (items: any[]) => {
  const totalPrice = items.reduce((acc: number, item: any) => {
    return acc + item.price * item.quantity;
  }, 0);

  // Check if order total price is greater than 0
  if (totalPrice < 20) {
    return {
      ok: false,
      message: 'Order total price must be greater than 20',
    };
  }

  const BEAN5Id = 10019;
  const SOYA5Id = 10071;
  const BASILId = 10051;
  // Check if order has item of Basil and Bean 5 LB, total price must be greater than 25
  const hasBasilAndBean = items.some((item: any) => {
    return (
      (item.inventoryItemId === BEAN5Id ||
        item.inventoryItemId === BASILId ||
        item.inventoryItemId === SOYA5Id) &&
      item.quantity > 0
    );
  });

  if (hasBasilAndBean) {
    if (totalPrice < 22) {
      return {
        ok: false,
        message: 'Please order at least 2 bags of 5 lb',
      };
    }
  }

  return { ok: true };
};
