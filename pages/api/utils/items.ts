export const calculateQtyLeft = (item: any) => {
  if (
    !item?.inventoryItem?.vendorItem ||
    !item?.inventoryItem?.vendorItem?.length
  ) {
    return 0;
  }
  const fifos = item.inventoryItem.vendorItem.flatMap(
    (vendorItem: any) => vendorItem.fifo,
  );

  const qtyLeft = fifos.reduce(
    (acc: number, curr: any) => acc + curr.quantity,
    0,
  );
  return qtyLeft;
};
