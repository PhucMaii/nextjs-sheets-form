import { PrismaClient } from '@prisma/client';
import { getTodayDate, normalizeDate } from './date';
import { ACTION } from '@/app/utils/enum';

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
