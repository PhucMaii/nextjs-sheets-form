import { gstRate, pstRate } from '../lib/constant';

export const generateQuoteTotal = (quoteItems: any[]) => {
  const total = quoteItems.reduce((acc, item) => {
    if (!acc.subtotal) {
      acc.subtotal = 0;
    }

    if (!acc.pst) {
      acc.pst = 0;
    }

    if (!acc.gst) {
      acc.gst = 0;
    }

    if (!acc.total) {
      acc.total = 0;
    }

    acc.subtotal += item.price * item.quantity;

    if (item?.hasPST || item?.inventoryItem?.hasPST) {
      acc.pst += item.price * item.quantity * pstRate;
    }

    if (item?.hasGST || item?.inventoryItem?.hasGST) {
      acc.gst += item.price * item.quantity * gstRate;
    }

    acc.total = acc.subtotal + acc.pst + acc.gst;

    return acc;
  }, {});

  return total;
};
