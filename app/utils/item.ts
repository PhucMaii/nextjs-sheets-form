import { IItem } from './type';

export const convertItemArrayToMap = (items: IItem[]) => {
  if (items.length === 0) {
    return {};
  }

  const typesObj = items.reduce((acc: any, item: any) => {
    const type = item?.inventoryItem?.type;

    if (!type) {
      acc['Others'] = [...(acc['Others'] || []), item];
      return acc;
    }

    if (!acc[type.name]) {
      acc[type?.name] = [item];
    } else {
      acc[type?.name] = [...acc[type.name], item];
    }
    return acc;
  }, {});

  let sortedKeysByPriority =
    items[0]?.category?.itemType_category
      ?.sort((typePriorityA: any, typePriorityB: any) => {
        return typePriorityA?.priority - typePriorityB?.priority;
      })
      ?.map((type: any) => type.itemType.name) || [];

  if (sortedKeysByPriority.length < Object.keys(typesObj).length) {
    const leftOverKeys = Object.keys(typesObj).filter((key) => {
      return !sortedKeysByPriority.includes(key);
    });

    sortedKeysByPriority = [...sortedKeysByPriority, ...leftOverKeys];
  }

  return {
    typesObj,
    sortedKeysByPriority:
      sortedKeysByPriority.length === 0
        ? Object.keys(typesObj)
        : sortedKeysByPriority,
  };
};
