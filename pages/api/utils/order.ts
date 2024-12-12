export const formatItemsWithTotalPrice = (items: any[]) => {
    return items.map((item: any) => {
        let totalPrevPrice = 0;
        if (item?.isShowDiscount && item?.prevPrice) {
            totalPrevPrice = item.prevPrice * item.quantity;            
        }
        return {
            ...item,
            totalPrice: item.price * item.quantity,
            totalPrevPrice
        };
    });
};