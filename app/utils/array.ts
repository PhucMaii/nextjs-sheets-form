import { UserRoute } from '@prisma/client';
import { Order } from '../admin/orders/page';
import { fetchWcodOrders } from './db';
import { ORDER_STATUS, PAYMENT_TYPE } from './enum';
import { getWCODDay } from './time';
import Fuse from 'fuse.js';

// Utility function to group items by a key
export const groupBy = (array: any[], key: (item: any) => any) => {
  console.log('ARRAY:', array);
  console.log('KEY:', key);
  return array.reduce((result, item) => {
    const groupKey = key(item);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export const insertInSortedIdArray = (array: any[], newElement: any) => {
  const result = [...array];

  if (result.length === 0) {
    return [newElement];
  }

  for (let i = 0; i < result.length; i++) {
    if (!result[i + 1]) {
      break;
    }

    if (result[i].id < newElement.id && result[i + 1].id > newElement.id) {
      result.splice(i + 1, 0, newElement);
      return result;
    }
  }

  result.push(newElement);
  return result;
};

export const sortedItemKeys = (
  listToSort: string[],
  basedSortArray: string[],
) => {
  return listToSort.sort((a, b) => {
    // Get the index of the current elements in the basedSortArray
    const indexA = basedSortArray.indexOf(a);
    const indexB = basedSortArray.indexOf(b);

    // If both elements are in the basedSortArray, compare their indices
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one element is in the basedSortArray, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // If neither element is in the basedSortArray, sort them alphabetically
    return a.localeCompare(b);
  });
};

export const getCODData = async (routeOrders: Order[], date: string) => {
  if (!routeOrders || routeOrders.length === 0) {
    return {};
  }

  const wcodDay: any = getWCODDay(date);
  const wcodResponse = await fetchWcodOrders(routeOrders, date, wcodDay);

  const orders = [...routeOrders];

  if (wcodResponse) {
    orders.push(...wcodResponse.wcodOrders);
  }

  const deliveredOrders = orders.filter((order: Order) => {
    return (
      order.status === ORDER_STATUS.DELIVERED ||
      order.status === ORDER_STATUS.COMPLETED
    );
  });

  const codOrders = orders.filter((order: Order) => {
    return (
      (order?.user?.preference?.paymentType === PAYMENT_TYPE.COD ||
        order?.user?.preference?.paymentType === wcodDay) &&
      order.status !== ORDER_STATUS.VOID
    );
  });

  const codBill = codOrders.reduce((acc: number, order: Order) => {
    return acc + order.totalPrice;
  }, 0);

  const collectedCODOrders = orders.filter((order: Order) => {
    return (
      (order?.user?.preference?.paymentType === PAYMENT_TYPE.COD ||
        order?.user?.preference?.paymentType === wcodDay) &&
      order.status === ORDER_STATUS.COMPLETED
    );
  });

  const collectedCODBill = collectedCODOrders.reduce(
    (acc: number, order: Order) => {
      return acc + order.totalPrice;
    },
    0,
  );

  const uncollectedCODOrders = orders.filter((order: Order) => {
    return (
      (order?.user?.preference?.paymentType === PAYMENT_TYPE.COD ||
        order?.user?.preference?.paymentType === wcodDay) &&
      (order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.INCOMPLETED)
    );
  });

  const uncollectedCODBill = uncollectedCODOrders.reduce(
    (acc: number, order: Order) => {
      return acc + order.totalPrice;
    },
    0,
  );

  return {
    orders,
    delivered: deliveredOrders,
    codOrders,
    codBill,
    collectedCODBill,
    uncollectedCODBill,
    collectedCODOrders,
    uncollectedCODOrders,
  };
};

export const filterByRoute = (orders: Order[], currentRoute: any) => {
  // Get clients from that route -> get orders
  const filteredOrders = currentRoute?.clients
    .map((client: UserRoute) => {
      const clientOrder = orders.find(
        (order: Order) => order.userId === client.userId,
      );
      return clientOrder;
    })
    .filter((order: Order) => order !== undefined);

  return filteredOrders;
};

export const findCombinations = (arr: number[], target: number) => {
  const result: number[][] = [];

  function backtrack(
    start: number,
    currentCombo: number[],
    currentSum: number,
  ) {
    if (currentSum === target) {
      result.push([...currentCombo]);
    }

    if (currentSum > target || start >= arr.length) {
      return;
    }

    for (let i = start; i < arr.length; i++) {
      currentCombo.push(arr[i]); // include the current element
      backtrack(i + 1, currentCombo, currentSum + arr[i]); // move to the next index to avoid using the same number
      currentCombo.pop(); // backtrack
    }
  }

  backtrack(0, [], 0);
  return result;
};

export const compareTwoArrays = (arr1: any[], arr2: any[]) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

export const getUniqueUnitRatios = (units: any[]) => {
  return Array.from(
    new Map(units.map((unit: any) => [unit.ratio, unit])).values(),
  );
};

export const getDifferentItems = (
  baseItems: any,
  toCompareItems: any,
  key: string[],
) => {
  return baseItems.filter((baseItem: any) => {
    return !toCompareItems.some((toCompareItem: any) => {
      return key.every(
        (keyItem: any) => baseItem[keyItem] === toCompareItem[keyItem],
      );
    });
  });
};

export const onSearchItems = (
  baseItems: any[],
  searchKeywords: string,
  searchFields: string[],
) => {
  const fuse = new Fuse(baseItems, {
    keys: searchFields,
  });

  const result = fuse.search(searchKeywords);
  console.log(result, 'result');

  const data = result.map((item: any) => item.item);
  return data;
};
