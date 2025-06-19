import { Orders, PaymentStatus, PrismaClient } from '@prisma/client';
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
  companyId: number,
  deliveryDate: string,
) => {
  try {
    const prisma = new PrismaClient();
    const { date, time: currentTime } = getTodayDate();

    const normalizedToday = normalizeDate(new Date(date));
    const normalizedOrderDate = normalizeDate(new Date(deliveryDate));

    // If in the future -> not valid
    if (normalizedOrderDate.getTime() > normalizedToday.getTime()) {
      return false;
    }

    // If same date 
      // If morning -> check if track inventory action is taken
      // If afternoon -> auto true
    if (normalizedOrderDate.getTime() === normalizedToday.getTime()) {
      if (currentTime.includes('AM')) {
        // const hour = currentTime.split(':')[0];
        // const trackInventoryHour = 6;

        // if (Number(hour) < trackInventoryHour|| Number(hour) === 12) {
        //   return false;
        // }

        // CHECK IF TRACK INVENTORY ACTION IS TAKEN
        // if (companyId === 1) {
        const selectedDayAction = await prisma.action.findFirst({
          where: {
            name: ACTION.TRACK_INVENTORY,
            date: deliveryDate,
            companyId: companyId,
          },
        });

        return !!selectedDayAction;
        // }
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
        paymentStatus: PaymentStatus.Unpaid,
        status: {
          not: ORDER_STATUS.VOID
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
