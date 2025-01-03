import { getTodayDate, normalizeDate } from "./date";

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

export const checkOrderValidToAffectInventory = (deliveryDate: string) => {
  const trackInventoryHour = 5;
  const {date, time: currentTime} = getTodayDate();

  const normalizedToday = normalizeDate(new Date(date));
  const normalizedOrderDate = normalizeDate(new Date(deliveryDate));

  if (normalizedOrderDate.getTime() > normalizedToday.getTime()) {
    return false;
  }

  // If same date
  if (normalizedOrderDate.getTime() === normalizedToday.getTime()) {
    if (currentTime.includes('AM')) {
      const hour = currentTime.split(':')[0];
      const minute = currentTime.split(':')[1];

      console.log({ hour, minute });
      if (Number(hour) < trackInventoryHour) {
        return false;
      }

      if (Number(hour) === trackInventoryHour) {
        if (Number(minute) < 30) {
          return false;
        }
      } 
    }
  }

  return true;
}