import { pstRate } from '../lib/constant';
import { gstRate } from '../lib/constant';
import { IInventoryItem, IItem, IItemType } from './type';

export const convertItemArrayToMap = (items: IItem[]) => {
  if (!items || items.length === 0) {
    return {};
  }

  const types: IItemType[] = [];
  const typesObj = items?.reduce((acc: any, item: any) => {
    const type = item?.inventoryItem?.type;

    if (!type) {
      acc['Others'] = [...(acc['Others'] || []), item];
      return acc;
    }

    if (!acc[type.name]) {
      types.push(type);
      acc[type?.name] = [item];
    } else {
      acc[type?.name] = [...acc[type.name], item];
    }
    return acc;
  }, {});

  const sortedKeysByPriority = types
    .sort((typePriorityA: any, typePriorityB: any) => {
      return typePriorityA?.priority - typePriorityB?.priority;
    })
    .map((type: any) => type.name);

  // let sortedKeysByPriority =
  //   items[0]?.category?.itemType_category
  //     ?.sort((typePriorityA: any, typePriorityB: any) => {
  //       return typePriorityA?.priority - typePriorityB?.priority;
  //     })
  //     ?.map((type: any) => type.itemType.name) || [];

  // if (sortedKeysByPriority.length < Object.keys(typesObj).length) {
  //   const leftOverKeys = Object.keys(typesObj).filter((key) => {
  //     return !sortedKeysByPriority.includes(key);
  //   });

  //   sortedKeysByPriority = [...sortedKeysByPriority, ...leftOverKeys];
  // }

  return {
    typesObj,
    sortedKeysByPriority,
  };
};

export const convertInventoryItemArrayToMap = (items: IInventoryItem[]) => {
  if (items.length === 0) {
    return {};
  }

  const types: IItemType[] = [];

  const typesObj = items.reduce((acc: any, item: any) => {
    const type = item?.type;

    if (!type) {
      acc['Others'] = [...(acc['Others'] || []), item];
      return acc;
    }

    const typeKey = type?.name;

    if (!acc[typeKey]) {
      types.push(type);
      acc[typeKey] = [item];
    } else {
      acc[typeKey] = [...acc[typeKey], item];
    }
    return acc;
  }, {});

  const sortedKeysByPriority = Object.keys(typesObj).sort((a: any, b: any) => {
    return (
      (typesObj[a][0]?.type?.priority || 0) -
      (typesObj[b][0]?.type?.priority || 0)
    );
  });

  return {
    typesObj,
    sortedKeysByPriority,
    types,
  };
};

export const calculateTaxWithDiscount = (items: any[], discountPercent: number = 0) => {
  const gstItems = items.filter(
    (item: any) => item?.inventoryItem?.hasGST,
  );
  const pstItems = items.filter(
    (item: any) => item?.inventoryItem?.hasPST,
  );

  const gstItemsTotalWithDiscount =
    gstItems.reduce((acc: any, item: any) => {
      return acc + item.unitPrice * item.quantity;
    }, 0) *
    (1 - discountPercent / 100);

  const pstItemsTotalWithDiscount =
    pstItems.reduce((acc: any, item: any) => {
      return acc + item.unitPrice * item.quantity;
    }, 0) *
    (1 - discountPercent / 100);

  const gstTotal =
    Math.round(gstItemsTotalWithDiscount * gstRate * 100) / 100;
  const pstTotal =
    Math.round(pstItemsTotalWithDiscount * pstRate * 100) / 100;

  return {
    gstTotal,
    pstTotal,
  };
};
