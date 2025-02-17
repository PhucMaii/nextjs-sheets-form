import { getTodayDate } from './date';
import { Orders, PrismaClient } from '@prisma/client';
import { ORDER_STATUS, USER_CATEGORIZED } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';

export const categorizeUser = async (userId: number) => {
  try {
    const today = getTodayDate();
    const now = new Date(today.date);
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get last day of last month
    const lastDayOfLastMonth = new Date(firstDayOfThisMonth);
    lastDayOfLastMonth.setDate(lastDayOfLastMonth.getDate() - 1);

    // Get 1st day of last 3 months - excluded current month
    const firstDayOfLast3Months = new Date(
      now.getFullYear(),
      now.getMonth() - 3,
      1,
    );
    const listOfDateString = generateListOfDateString(
      firstDayOfLast3Months,
      lastDayOfLastMonth,
    );
    // console.log(listOfDateString, 'list of date string');

    const prisma = new PrismaClient();
    const userOrdersLast3Months = await prisma.orders.findMany({
      where: {
        userId,
        deliveryDate: {
          in: listOfDateString,
        },
        status: {
          in: [
            ORDER_STATUS.COMPLETED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.INCOMPLETED,
          ],
        },
      },
    });

    if (userOrdersLast3Months.length === 0) {
      return USER_CATEGORIZED.NONE;
    }

    const ordersRevenue = userOrdersLast3Months.reduce(
      (acc: number, order: Orders) => {
        return acc + order.totalPrice;
      },
      0,
    );

    const average = Math.ceil(ordersRevenue / 3);
    console.log(average, 'average');

    if (average < 500) {
      return USER_CATEGORIZED.NONE;
    } else if (average >= 500 && average < 1000) {
      return USER_CATEGORIZED.BRONZE;
    } else if (average >= 1000 && average < 2000) {
      return USER_CATEGORIZED.SILVER;
    } else {
      return USER_CATEGORIZED.GOLD;
    }
  } catch (error: any) {
    console.log('Error categorizing user: ', error);
    throw new Error('Error categorizing user: ', error);
    return USER_CATEGORIZED.NONE;
  }
};
