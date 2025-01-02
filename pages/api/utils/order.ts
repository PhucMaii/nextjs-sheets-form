import { Order } from "@/app/admin/orders/page";
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

export const checkOrderValidToAffectInventory = (order: Order) => {
  const today = getTodayDate();

  const normalizedToday = normalizeDate(new Date(today.date));
  const normalizedOrderDate = normalizeDate(new Date(order.deliveryDate));

  if (normalizedOrderDate > normalizedToday) {
    return false;
  }

  // if (normalizedOrderDate === normalizedToday) {
    
  // }
}